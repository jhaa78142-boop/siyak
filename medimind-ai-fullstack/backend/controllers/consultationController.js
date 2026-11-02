import Appointment from "../models/Appointment.js";
import Consultation from "../models/Consultation.js";
import { logAction } from "../services/auditService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { assertApprovedDoctor } from "../utils/doctorAccess.js";

const noteKeys = ["chiefComplaint", "symptoms", "history", "observations", "assessment", "plan", "advice", "followUp"];

function validatedNotes(body) {
  const notes = {};
  for (const key of noteKeys) {
    const value = body[key] == null ? "" : String(body[key]).trim();
    if (value.length > 10000) throw new ApiError(400, `${key} cannot exceed 10,000 characters`);
    notes[key] = value;
  }
  return notes;
}

async function validateAppointment(appointmentId, patientId, doctorId) {
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    patient: patientId,
    doctor: doctorId,
    status: { $in: ["Confirmed", "InProgress", "Completed"] },
  });
  if (!appointment) throw new ApiError(403, "The appointment is not available for a consultation note");
  return appointment;
}

function noteSnapshot(note) {
  return Object.fromEntries(noteKeys.map((key) => [key, note[key]]));
}

export const createConsultation = asyncHandler(async (req, res) => {
  const { patientId, appointmentId } = req.body;
  if (!patientId || !appointmentId) throw new ApiError(400, "A patient and appointment are required");
  const appointment = await validateAppointment(appointmentId, patientId, req.user._id);
  const consultation = await Consultation.create({
    patient: patientId,
    doctor: req.user._id,
    appointment: appointment._id,
    ...validatedNotes(req.body),
    status: "draft",
  });
  await logAction(req.user, "Created consultation draft", {
    resourceId: consultation._id,
    requestId: req.requestId,
  });
  return created(res, consultation, "Consultation draft saved");
});

export const updateConsultationDraft = asyncHandler(async (req, res) => {
  const consultation = await Consultation.findOne({ _id: req.params.id, doctor: req.user._id });
  if (!consultation) throw new ApiError(404, "Consultation not found");
  if (consultation.status !== "draft") throw new ApiError(409, "Finalized notes cannot be edited; create an amendment");
  Object.assign(consultation, validatedNotes(req.body));
  await consultation.save();
  await logAction(req.user, "Updated consultation draft", {
    resourceId: consultation._id,
    requestId: req.requestId,
  });
  return ok(res, consultation, "Consultation draft updated");
});

export const finalizeConsultation = asyncHandler(async (req, res) => {
  if (req.body.confirm !== true) throw new ApiError(400, "Explicit doctor confirmation is required to finalize");
  const consultation = await Consultation.findOne({ _id: req.params.id, doctor: req.user._id });
  if (!consultation) throw new ApiError(404, "Consultation not found");
  if (consultation.status !== "draft") throw new ApiError(409, "Only a draft consultation may be finalized");
  await validateAppointment(consultation.appointment, consultation.patient, req.user._id);
  consultation.status = "finalized";
  consultation.finalizedAt = new Date();
  consultation.finalizedBy = req.user._id;
  await consultation.save();
  await logAction(req.user, "Finalized consultation note", {
    resourceId: consultation._id,
    requestId: req.requestId,
  });
  return ok(res, consultation, "Consultation finalized");
});

export const amendConsultation = asyncHandler(async (req, res) => {
  if (req.body.confirm !== true) throw new ApiError(400, "Explicit doctor confirmation is required to amend");
  const reason = String(req.body.reason || "").trim();
  if (!reason || reason.length > 1000) throw new ApiError(400, "An amendment reason is required");
  const consultation = await Consultation.findOne({ _id: req.params.id, doctor: req.user._id });
  if (!consultation || !["finalized", "amended"].includes(consultation.status)) {
    throw new ApiError(404, "Finalized consultation not found");
  }
  consultation.amendments.push({
    ...noteSnapshot(consultation),
    version: consultation.amendments.length + 1,
    reason,
    amendedBy: req.user._id,
  });
  Object.assign(consultation, validatedNotes(req.body));
  consultation.status = "amended";
  consultation.finalizedAt = new Date();
  consultation.finalizedBy = req.user._id;
  await consultation.save();
  await logAction(req.user, "Amended finalized consultation note", {
    resourceId: consultation._id,
    requestId: req.requestId,
  });
  return ok(res, consultation, "Consultation amended with previous version retained");
});

export const listConsultations = asyncHandler(async (req, res) => {
  const isDoctor = String(req.user.role).toUpperCase() === "DOCTOR";
  if (isDoctor) assertApprovedDoctor(req.user);
  else if (String(req.user.role).toUpperCase() !== "PATIENT") throw new ApiError(403, "Patient or approved doctor access is required");
  const filter = isDoctor ? { doctor: req.user._id } : { patient: req.user._id, status: { $in: ["finalized", "amended"] } };
  if (req.query.patientId && isDoctor) filter.patient = req.query.patientId;
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  const [items, total] = await Promise.all([
    Consultation.find(filter)
      .populate("patient", "fullName")
      .populate("doctor", "fullName doctorProfile.specialization")
      .populate("appointment", "scheduledAt status")
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Consultation.countDocuments(filter),
  ]);
  return ok(res, { items, page, limit, total });
});
