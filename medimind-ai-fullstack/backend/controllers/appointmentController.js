import Appointment from "../models/Appointment.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import TimelineEvent from "../models/TimelineEvent.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail, templates } from "../services/emailService.js";
import { enqueueNotification } from "../services/notificationService.js";
import { logAction } from "../services/auditService.js";
import { assertApprovedDoctor } from "../middleware/auth.js";
import { bookingKeys, intervalsOverlap } from "../utils/appointmentSlots.js";

const isDoctor = (user) => String(user?.role || "").toUpperCase() === "DOCTOR";
const isPatient = (user) => String(user?.role || "").toUpperCase() === "PATIENT";
const heldStatuses = ["Pending", "Confirmed", "InProgress", "RescheduleProposed"];

function getLocalParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

function dateKey(date, timeZone) {
  const parts = getLocalParts(date, timeZone);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function isOnLeave(doctor, date) {
  const timeZone = doctor.doctorProfile.availability.timezone;
  const key = dateKey(date, timeZone);
  return (doctor.doctorProfile.availability.leaveDates || []).some((leave) => leave.toISOString().slice(0, 10) === key);
}

function isAvailable(doctor, date) {
  const availability = doctor.doctorProfile?.availability;
  if (!availability?.workingDays?.length || isOnLeave(doctor, date)
      || date.getSeconds() !== 0 || date.getMilliseconds() !== 0) return false;
  const parts = getLocalParts(date, availability.timezone || "Asia/Kolkata");
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  const workingDay = availability.workingDays.find((day) => day.dayOfWeek === weekday);
  if (!workingDay) return false;
  const localTime = `${parts.hour}:${parts.minute}`;
  if (localTime < workingDay.startTime || localTime >= workingDay.endTime) return false;
  const slotStart = workingDay.startTime.split(":").reduce((total, part) => total * 60 + Number(part), 0);
  const currentMinute = localTime.split(":").reduce((total, part) => total * 60 + Number(part), 0);
  if ((currentMinute - slotStart) % availability.slotDurationMinutes !== 0) return false;
  if (currentMinute + availability.slotDurationMinutes > workingDay.endTime.split(":").reduce((total, part) => total * 60 + Number(part), 0)) return false;
  return !(workingDay.breaks || []).some((pause) => {
    const pauseStart = pause.startTime.split(":").reduce((total, part) => total * 60 + Number(part), 0);
    const pauseEnd = pause.endTime.split(":").reduce((total, part) => total * 60 + Number(part), 0);
    return currentMinute < pauseEnd && currentMinute + availability.slotDurationMinutes > pauseStart;
  });
}

async function assertSlotFree(doctorId, scheduledAt, durationMinutes, excludeId) {
  const start = new Date(scheduledAt);
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const searchStart = new Date(start.getTime() - 24 * 60 * 60_000);
  const filter = {
    doctor: doctorId,
    status: { $in: heldStatuses },
    $or: [
      { scheduledAt: { $gte: searchStart, $lt: end } },
      { proposedAt: { $gte: searchStart, $lt: end } },
    ],
  };
  if (excludeId) filter._id = { $ne: excludeId };
  const existing = await Appointment.find(filter).select("scheduledAt proposedAt durationMinutes");
  const overlapping = existing.some((appointment) =>
    [appointment.scheduledAt, appointment.proposedAt].filter(Boolean).some((otherStart) =>
      intervalsOverlap(start, durationMinutes, otherStart, appointment.durationMinutes || 30)
    )
  );
  if (overlapping) throw new ApiError(409, "That appointment time overlaps an existing booking");
}

function isDuplicateSlot(error) {
  return error?.code === 11000 && ["heldSlotKeys", "bookingKey", "proposedBookingKey"].includes(error?.keyPattern && Object.keys(error.keyPattern)[0]);
}

export const listDoctors = asyncHandler(async (req, res) => {
  const { specialization, q } = req.query;
  const filter = {
    role: { $in: ["DOCTOR", "doctor"] },
    status: { $in: ["APPROVED", "ACTIVE", "approved", "active"] },
    "doctorProfile.verification.status": { $in: ["approved", "verified"] },
    "doctorProfile.availability.workingDays.0": { $exists: true },
  };
  const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (specialization) filter["doctorProfile.specialization"] = new RegExp(escapeRegex(specialization).slice(0, 100), "i");
  if (q) filter.$or = [
    { fullName: new RegExp(escapeRegex(q).slice(0, 100), "i") },
    { "doctorProfile.hospital": new RegExp(escapeRegex(q).slice(0, 100), "i") },
  ];
  const doctors = await User.find(filter)
    .select("fullName doctorProfile.specialization doctorProfile.hospital doctorProfile.experienceYears doctorProfile.consultationFee doctorProfile.languages doctorProfile.availability avatarUrl")
    .sort({ "doctorProfile.rating": -1 })
    .limit(100);
  return ok(res, doctors);
});

export const bookAppointment = asyncHandler(async (req, res) => {
  if (!isPatient(req.user)) throw new ApiError(403, "Only patients may request appointments");
  const { doctorId, scheduledAt, mode = "Video", reason = "" } = req.body;
  if (!doctorId || !scheduledAt || !Number.isFinite(Date.parse(scheduledAt))) {
    throw new ApiError(400, "A doctor and valid appointment time are required");
  }
  if (!["Video", "In-person", "Phone"].includes(mode) || String(reason).length > 1000) {
    throw new ApiError(400, "Appointment details are invalid");
  }
  const doctor = await User.findOne({
    _id: doctorId,
    role: { $in: ["DOCTOR", "doctor"] },
    status: { $in: ["APPROVED", "ACTIVE", "approved", "active"] },
    "doctorProfile.verification.status": { $in: ["approved", "verified"] },
  });
  if (!doctor) throw new ApiError(404, "Approved doctor not found");
  const when = new Date(scheduledAt);
  if (when <= new Date() || !isAvailable(doctor, when)) throw new ApiError(400, "Choose an available future appointment slot");
  const durationMinutes = doctor.doctorProfile.availability.slotDurationMinutes;
  await assertSlotFree(doctor._id, when, durationMinutes);

  let appointment;
  try {
    appointment = await Appointment.create({
      patient: req.user._id,
      doctor: doctor._id,
      scheduledAt: when,
      durationMinutes,
      heldSlotKeys: bookingKeys(doctor._id, when, durationMinutes),
      mode,
      reason: String(reason).trim(),
      status: "Pending",
      history: [{ action: "request", toStatus: "Pending", actor: req.user._id }],
    });
  } catch (error) {
    if (isDuplicateSlot(error)) throw new ApiError(409, "That appointment slot was just booked");
    throw error;
  }

  await TimelineEvent.create({
    patient: req.user._id,
    type: "Appointment",
    title: `Appointment requested with ${doctor.fullName}`,
    detail: "",
    tone: "neutral",
    refId: appointment._id,
  });
  await logAction(req.user, "Requested appointment", {
    resourceId: appointment._id,
    requestId: req.requestId,
  });
  return created(res, appointment, "Appointment requested");
});

export const listMyAppointments = asyncHandler(async (req, res) => {
  if (isDoctor(req.user)) assertApprovedDoctor(req.user);
  const filter = isDoctor(req.user) ? { doctor: req.user._id } : { patient: req.user._id };
  if (req.query.status) filter.status = String(req.query.status).slice(0, 40);
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate("patient", "fullName avatarUrl")
      .populate("doctor", "fullName doctorProfile.specialization doctorProfile.hospital doctorProfile.availability.timezone")
      .sort({ scheduledAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Appointment.countDocuments(filter),
  ]);
  return ok(res, { items: appointments, page, limit, total });
});

export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { action, status, cancelReason, proposedAt } = req.body;
  const appointment = await Appointment.findById(req.params.id)
    .populate("patient", "fullName email notificationTimezone")
    .populate("doctor", "fullName doctorProfile.availability doctorProfile.verification.status status");
  if (!appointment) throw new ApiError(404, "Appointment not found");

  const doctorAction = isDoctor(req.user);
  if (doctorAction) assertApprovedDoctor(req.user);
  const isOwner = doctorAction
    ? String(appointment.doctor._id) === String(req.user._id)
    : String(appointment.patient._id) === String(req.user._id);
  if (!isOwner) throw new ApiError(403, "Not your appointment");

  const requestedAction = action || status;
  const previousStatus = appointment.status;
  const fromTime = appointment.scheduledAt;
  let nextStatus = previousStatus;

  if (doctorAction && ["accept", "Confirmed"].includes(requestedAction) && previousStatus === "Pending") {
    nextStatus = "Confirmed";
  } else if (doctorAction && ["reject", "Rejected"].includes(requestedAction) && previousStatus === "Pending") {
    nextStatus = "Rejected";
  } else if (doctorAction && requestedAction === "propose-reschedule"
      && ["Pending", "Confirmed"].includes(previousStatus)) {
    if (!proposedAt || !Number.isFinite(Date.parse(proposedAt))) throw new ApiError(400, "A valid proposed time is required");
    const newTime = new Date(proposedAt);
    if (newTime <= new Date() || !isAvailable(appointment.doctor, newTime)) {
      throw new ApiError(400, "Choose an available future time");
    }
    await assertSlotFree(appointment.doctor._id, newTime, appointment.durationMinutes || 30, appointment._id);
    const proposedKeys = bookingKeys(appointment.doctor._id, newTime, appointment.durationMinutes || 30);
    appointment.proposedAt = newTime;
    appointment.heldSlotKeys = [...new Set([
      ...(appointment.heldSlotKeys || []),
      ...proposedKeys,
    ])];
    nextStatus = "RescheduleProposed";
  } else if (!doctorAction && requestedAction === "confirm-reschedule" && previousStatus === "RescheduleProposed") {
    const proposedSlotKeys = bookingKeys(
      appointment.doctor._id,
      appointment.proposedAt,
      appointment.durationMinutes || 30
    );
    appointment.scheduledAt = appointment.proposedAt;
    appointment.heldSlotKeys = proposedSlotKeys;
    appointment.proposedAt = undefined;
    nextStatus = "Confirmed";
  } else if (!doctorAction && requestedAction === "reject-reschedule" && previousStatus === "RescheduleProposed") {
    const proposedSlotKeys = bookingKeys(
      appointment.doctor._id,
      appointment.proposedAt,
      appointment.durationMinutes || 30
    );
    const originalSlotKeys = new Set(bookingKeys(
      appointment.doctor._id,
      appointment.scheduledAt,
      appointment.durationMinutes || 30
    ));
    const previousConfirmedStatus = appointment.history?.[appointment.history.length - 1]?.toStatus || "Confirmed";
    appointment.proposedAt = undefined;
    appointment.heldSlotKeys = (appointment.heldSlotKeys || []).filter((key) =>
      !proposedSlotKeys.includes(key) || originalSlotKeys.has(key)
    );
    nextStatus = previousConfirmedStatus;
  } else if (!doctorAction && ["cancel", "Cancelled"].includes(requestedAction)
      && ["Pending", "Confirmed", "RescheduleProposed"].includes(previousStatus)) {
    nextStatus = "Cancelled";
  } else if (doctorAction && requestedAction === "cancel"
      && ["Pending", "Confirmed", "RescheduleProposed"].includes(previousStatus)) {
    nextStatus = "Cancelled";
  } else if (doctorAction && requestedAction === "start" && previousStatus === "Confirmed") {
    if (appointment.scheduledAt > new Date()) throw new ApiError(400, "An appointment cannot start before its scheduled time");
    nextStatus = "InProgress";
  } else if (doctorAction && requestedAction === "complete" && previousStatus === "InProgress") {
    nextStatus = "Completed";
  } else if (doctorAction && requestedAction === "no-show" && previousStatus === "Confirmed") {
    const slotDuration = appointment.doctor.doctorProfile?.availability?.slotDurationMinutes || 30;
    if (Date.now() < appointment.scheduledAt.getTime() + slotDuration * 60_000) {
      throw new ApiError(400, "An appointment can be marked no-show only after its scheduled slot");
    }
    nextStatus = "No-show";
  } else {
    throw new ApiError(409, `Invalid appointment transition: ${previousStatus} -> ${requestedAction}`);
  }

  if (["Cancelled", "Rejected", "Completed", "No-show"].includes(nextStatus)) {
    appointment.heldSlotKeys = [];
    appointment.proposedAt = undefined;
  }
  appointment.status = nextStatus;
  if (nextStatus === "Cancelled") {
    if (!String(cancelReason || "").trim()) throw new ApiError(400, "A cancellation reason is required");
    appointment.cancelReason = String(cancelReason).trim().slice(0, 500);
  }
  appointment.history.push({
    action: String(requestedAction),
    fromStatus: previousStatus,
    toStatus: nextStatus,
    actor: req.user._id,
    reason: nextStatus === "Cancelled" ? appointment.cancelReason : undefined,
    fromTime,
    toTime: appointment.proposedAt || appointment.scheduledAt,
  });

  try {
    await appointment.save();
  } catch (error) {
    if (isDuplicateSlot(error)) throw new ApiError(409, "The proposed appointment slot is no longer available");
    throw error;
  }
  await logAction(req.user, "Changed appointment", {
    resourceId: appointment._id,
    requestId: req.requestId,
  });

  if (["Cancelled", "Rejected", "Completed", "No-show"].includes(nextStatus)) {
    await Notification.updateMany({
      appointment: appointment._id,
      triggerType: "appointment-reminder",
      deliveryStatus: "queued",
    }, {
      $set: { deliveryStatus: "skipped", errorMessage: "Appointment is no longer active" },
    });
  } else if (nextStatus === "Confirmed" && previousStatus === "RescheduleProposed") {
    await Notification.updateMany({
      appointment: appointment._id,
      triggerType: "appointment-reminder",
      deliveryStatus: "queued",
      appointmentScheduledAt: { $ne: appointment.scheduledAt },
    }, {
      $set: { deliveryStatus: "skipped", errorMessage: "Appointment was rescheduled" },
    });
  }

  if (nextStatus === "Confirmed" && doctorAction) {
    const appointmentTime = new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: appointment.patient.notificationTimezone || "Asia/Kolkata",
    }).format(appointment.scheduledAt);
    const tpl = templates.appointmentConfirmed(
      appointment.patient.fullName,
      appointment.doctor.fullName,
      appointmentTime
    );
    await sendEmail({
      userId: appointment.patient._id,
      to: appointment.patient.email,
      toName: appointment.patient.fullName,
      subject: tpl.subject,
      html: tpl.html,
      type: "appointment-confirmed",
      idempotencyKey: `appointment-confirmed:${appointment._id}:${appointment.scheduledAt.getTime()}`,
    });
  } else {
    const recipientId = doctorAction ? appointment.patient._id : appointment.doctor._id;
    await enqueueNotification({
      userId: recipientId,
      triggerType: "appointment-updated",
      title: "Appointment updated",
      body: "An appointment was updated. Sign in to review the details.",
      idempotencyKey: `appointment-updated:${appointment._id}:${appointment.history.length}`,
    });
  }
  return ok(res, appointment, "Appointment updated");
});
