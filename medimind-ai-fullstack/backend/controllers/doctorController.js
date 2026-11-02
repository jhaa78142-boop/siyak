import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import FollowUp from "../models/FollowUp.js";
import Report from "../models/Report.js";
import Consent from "../models/Consent.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { logAction } from "../services/auditService.js";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const verificationStorage = path.resolve("uploads", "private-doctor-documents");

function localDateParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(date);
  return Object.fromEntries(parts.map(({ type, value }) => [type, value]));
}

function zonedMidnight(parts, timeZone) {
  const [year, month, day] = [Number(parts.year), Number(parts.month), Number(parts.day)];
  const target = Date.UTC(year, month - 1, day);
  let guess = target;
  for (let i = 0; i < 2; i += 1) {
    const local = localDateParts(new Date(guess), timeZone);
    const represented = Date.UTC(Number(local.year), Number(local.month) - 1, Number(local.day));
    guess += target - represented;
  }
  return new Date(guess);
}

function dayRange(timeZone) {
  const nowParts = localDateParts(new Date(), timeZone);
  const start = zonedMidnight(nowParts, timeZone);
  const nextDate = new Date(Date.UTC(Number(nowParts.year), Number(nowParts.month) - 1, Number(nowParts.day) + 1));
  const nextParts = {
    year: String(nextDate.getUTCFullYear()),
    month: String(nextDate.getUTCMonth() + 1).padStart(2, "0"),
    day: String(nextDate.getUTCDate()).padStart(2, "0"),
  };
  return { start, end: zonedMidnight(nextParts, timeZone) };
}

async function getRelatedPatientIds(doctorId) {
  return Appointment.distinct("patient", {
    doctor: doctorId,
    status: { $in: ["Confirmed", "InProgress", "Completed"] },
  });
}

export const doctorDashboard = asyncHandler(async (req, res) => {
  const timezone = req.user.doctorProfile?.availability?.timezone || "Asia/Kolkata";
  const { start, end } = dayRange(timezone);
  const now = new Date();
  const base = { doctor: req.user._id };
  const [todayAppointments, upcomingAppointments, pendingRequests, reportsAwaitingReview, followUpsDue] = await Promise.all([
    Appointment.find({ ...base, scheduledAt: { $gte: start, $lt: end }, status: { $in: ["Pending", "Confirmed", "InProgress"] } })
      .populate("patient", "fullName avatarUrl")
      .sort({ scheduledAt: 1 })
      .limit(50),
    Appointment.find({ ...base, scheduledAt: { $gte: end }, status: { $in: ["Pending", "Confirmed", "RescheduleProposed"] } })
      .populate("patient", "fullName avatarUrl")
      .sort({ scheduledAt: 1 })
      .limit(50),
    Appointment.countDocuments({ ...base, status: "Pending" }),
    (async () => {
      const reportIds = await Consent.distinct("reports", {
        doctor: req.user._id,
        status: "active",
        expiresAt: { $gt: now },
      });
      return Report.countDocuments({
        _id: { $in: reportIds },
        "doctorReview.status": { $in: ["awaiting_review", "in_review", "needs_clarification"] },
      });
    })(),
    FollowUp.countDocuments({ ...base, dueDate: { $lte: now }, status: "Scheduled" }),
  ]);
  return ok(res, {
    timezone,
    verificationStatus: req.user.doctorProfile?.verification?.status || "pending",
    todayAppointments,
    upcomingAppointments,
    pendingRequests,
    reportsAwaitingReview,
    followUpsDue,
  });
});

export const listMyPatients = asyncHandler(async (req, res) => {
  const patientIds = await getRelatedPatientIds(req.user._id);
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  const query = String(req.query.q || "").trim().slice(0, 100);
  const filter = { _id: { $in: patientIds }, role: { $in: ["PATIENT", "patient"] } };
  if (query) filter.fullName = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  const [patients, total] = await Promise.all([
    User.find(filter)
      .select("fullName avatarUrl")
      .sort({ fullName: 1 })
      .skip((page - 1) * limit)
      .limit(limit),
    User.countDocuments(filter),
  ]);
  return ok(res, { items: patients, page, limit, total });
});

export const getPatientDetail = asyncHandler(async (req, res) => {
  const hasRelationship = await Appointment.exists({
    doctor: req.user._id,
    patient: req.params.id,
    status: { $in: ["Confirmed", "InProgress", "Completed"] },
  });
  if (!hasRelationship) {
    await logAction(req.user, "Denied unrelated patient access", {
      resourceId: req.params.id,
      outcome: "denied",
      requestId: req.requestId,
    });
    throw new ApiError(403, "You do not have an appointment relationship with this patient");
  }

  const patient = await User.findOne({
    _id: req.params.id,
    role: { $in: ["PATIENT", "patient"] },
  }).select("fullName avatarUrl phone");
  if (!patient) throw new ApiError(404, "Patient not found");
  const appointments = await Appointment.find({ doctor: req.user._id, patient: patient._id })
    .select("scheduledAt mode status reason createdAt")
    .sort({ scheduledAt: -1 })
    .limit(50);
  const activeConsent = await Consent.findOne({
    doctor: req.user._id,
    patient: patient._id,
    status: "active",
    expiresAt: { $gt: new Date() },
  }).select("expiresAt");
  await logAction(req.user, "Viewed patient appointment metadata", {
    resourceId: patient._id,
    outcome: "allowed",
    requestId: req.requestId,
  });
  return ok(res, {
    patient: {
      _id: patient._id,
      fullName: patient.fullName || "Not provided",
      phone: patient.phone || "Not provided",
      avatarUrl: patient.avatarUrl || "",
    },
    appointments,
    medicalRecordAccess: activeConsent ? "Active" : "Consent required",
    consentExpiresAt: activeConsent?.expiresAt || null,
  });
});

export const sharedPatientReports = asyncHandler(async (req, res) => {
  const now = new Date();
  const consent = await Consent.findOne({
    patient: req.params.id,
    doctor: req.user._id,
    status: "active",
    expiresAt: { $gt: now },
  }).select("reports purpose expiresAt");
  if (!consent) {
    await logAction(req.user, "Denied patient report access without active consent", {
      resourceId: req.params.id,
      outcome: "denied",
      requestId: req.requestId,
    });
    throw new ApiError(403, "No active report-sharing consent was found");
  }
  const reports = await Report.find({ _id: { $in: consent.reports }, patient: req.params.id })
    .select("fileName mimeType fileSizeBytes reportType analysis doctorReview createdAt")
    .sort({ createdAt: -1 });
  await logAction(req.user, "Viewed consent-shared patient reports", {
    resourceId: req.params.id,
    outcome: "allowed",
    requestId: req.requestId,
  });
  return ok(res, { purpose: consent.purpose, expiresAt: consent.expiresAt, reports });
});

export const todaysSchedule = asyncHandler(async (req, res) => {
  const timezone = req.user.doctorProfile?.availability?.timezone || "Asia/Kolkata";
  const { start, end } = dayRange(timezone);
  const appointments = await Appointment.find({
    doctor: req.user._id,
    scheduledAt: { $gte: start, $lt: end },
    status: { $in: ["Pending", "Confirmed", "InProgress"] },
  })
    .populate("patient", "fullName avatarUrl")
    .sort({ scheduledAt: 1 });
  return ok(res, appointments);
});

export const updateAvailability = asyncHandler(async (req, res) => {
  const { timezone, slotDurationMinutes, workingDays, leaveDates } = req.body;
  if (!Array.isArray(workingDays) || workingDays.length > 7) throw new ApiError(400, "Provide valid weekly working days");
  if (![15, 20, 30, 45, 60].includes(Number(slotDurationMinutes))) {
    throw new ApiError(400, "Slot duration must be 15, 20, 30, 45, or 60 minutes");
  }
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone }).format(new Date());
  } catch {
    throw new ApiError(400, "Choose a valid IANA timezone");
  }
  const days = new Set();
  const timePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  for (const day of workingDays) {
    if (!day || typeof day !== "object"
        || !Number.isInteger(day.dayOfWeek) || day.dayOfWeek < 0 || day.dayOfWeek > 6 || days.has(day.dayOfWeek)
        || !timePattern.test(day.startTime) || !timePattern.test(day.endTime) || day.startTime >= day.endTime) {
      throw new ApiError(400, "Working days must contain unique weekdays and valid start/end times");
    }
    days.add(day.dayOfWeek);
    if (!Array.isArray(day.breaks || []) || (day.breaks || []).length > 8) throw new ApiError(400, "Breaks must be a list of at most 8 intervals");
    const breaks = day.breaks || [];
    for (const pause of breaks) {
      if (!pause || typeof pause !== "object") throw new ApiError(400, "Break intervals must be objects");
      if (!timePattern.test(pause.startTime) || !timePattern.test(pause.endTime)
          || pause.startTime >= pause.endTime || pause.startTime < day.startTime || pause.endTime > day.endTime) {
        throw new ApiError(400, "Break times must fall within that working day");
      }
    }
    for (let index = 0; index < breaks.length; index += 1) {
      for (let otherIndex = index + 1; otherIndex < breaks.length; otherIndex += 1) {
        if (breaks[index].startTime < breaks[otherIndex].endTime
            && breaks[otherIndex].startTime < breaks[index].endTime) {
          throw new ApiError(400, "Break intervals cannot overlap");
        }
      }
    }
  }
  if (!Array.isArray(leaveDates) || leaveDates.length > 366
      || leaveDates.some((date) => !Number.isFinite(Date.parse(date)))) {
    throw new ApiError(400, "Leave dates must be valid dates");
  }
  req.user.doctorProfile.availability = {
    timezone,
    slotDurationMinutes: Number(slotDurationMinutes),
    workingDays,
    leaveDates: leaveDates.map((date) => new Date(date)),
  };
  await req.user.save();
  return ok(res, req.user.doctorProfile.availability, "Availability updated");
});

export const uploadVerificationDocument = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, "Choose a verification document to upload");
  const extension = path.extname(req.file.originalname).toLowerCase();
  const allowedTypes = new Map([
    [".pdf", "application/pdf"],
    [".png", "image/png"],
    [".jpg", "image/jpeg"],
    [".jpeg", "image/jpeg"],
    [".webp", "image/webp"],
  ]);
  if (!allowedTypes.has(extension) || req.file.mimetype !== allowedTypes.get(extension)) {
    throw new ApiError(415, "Upload a matching PDF, PNG, JPG, or WEBP document");
  }
  const data = req.file.buffer;
  const validSignature = extension === ".pdf"
    ? data.subarray(0, 1024).includes(Buffer.from("%PDF-"))
    : extension === ".png"
      ? data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : extension === ".jpg" || extension === ".jpeg"
        ? data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff
        : data.subarray(0, 4).toString() === "RIFF" && data.subarray(8, 12).toString() === "WEBP";
  if (!validSignature) throw new ApiError(415, "The file content does not match its claimed type");

  await fs.mkdir(verificationStorage, { recursive: true });
  const storedName = `${randomUUID()}${extension}`;
  const absolutePath = path.join(verificationStorage, storedName);
  await fs.writeFile(absolutePath, data, { flag: "wx", mode: 0o600 });
  const document = {
    storagePath: storedName,
    fileName: path.basename(req.file.originalname).slice(0, 200),
    mimeType: req.file.mimetype,
    uploadedAt: new Date(),
  };
  req.user.doctorProfile.verificationDocuments.push(document);
  req.user.doctorProfile.verification.status = "pending";
  req.user.doctorProfile.verification.submittedAt = new Date();
  req.user.doctorProfile.verification.rejectionReason = "";
  req.user.status = "PENDING";
  try {
    await req.user.save();
  } catch (error) {
    await fs.rm(absolutePath, { force: true });
    throw error;
  }
  await logAction(req.user, "Submitted doctor verification document", {
    resourceId: req.user._id,
    requestId: req.requestId,
  });
  return ok(res, {
    _id: req.user.doctorProfile.verificationDocuments.at(-1)._id,
    fileName: document.fileName,
    mimeType: document.mimeType,
    uploadedAt: document.uploadedAt,
  }, "Verification document submitted");
});

export const downloadVerificationDocument = asyncHandler(async (req, res) => {
  const isAdmin = String(req.user.role).toUpperCase() === "ADMIN";
  const documentId = req.params.documentId || req.params.id;
  const filter = isAdmin
    ? {
        role: { $in: ["DOCTOR", "doctor"] },
        ...(req.params.doctorId ? { _id: req.params.doctorId } : {}),
        "doctorProfile.verificationDocuments._id": documentId,
      }
    : { _id: req.user._id, "doctorProfile.verificationDocuments._id": documentId };
  const doctor = await User.findOne(filter).select("doctorProfile.verificationDocuments");
  const document = doctor?.doctorProfile?.verificationDocuments?.id(documentId);
  if (!document) throw new ApiError(404, "Verification document not found");
  const absolutePath = path.resolve(verificationStorage, document.storagePath);
  if (!absolutePath.startsWith(`${verificationStorage}${path.sep}`)) throw new ApiError(404, "Verification document not found");
  await fs.access(absolutePath);
  await logAction(req.user, "Downloaded doctor verification document", {
    resourceId: document._id,
    outcome: "allowed",
    requestId: req.requestId,
  });
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.download(absolutePath, document.fileName);
});
