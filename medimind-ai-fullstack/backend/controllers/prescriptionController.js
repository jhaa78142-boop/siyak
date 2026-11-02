import Prescription from "../models/Prescription.js";
import FollowUp from "../models/FollowUp.js";
import Appointment from "../models/Appointment.js";
import TimelineEvent from "../models/TimelineEvent.js";
import User from "../models/User.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { sendEmail, templates } from "../services/emailService.js";
import { logAction } from "../services/auditService.js";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { assertApprovedDoctor } from "../middleware/auth.js";

const isDoctor = (user) => String(user?.role || "").toUpperCase() === "DOCTOR";
const prescriptionStorage = path.resolve("uploads", "private-prescriptions");

function isValidUpload(file) {
  const extension = path.extname(file.originalname).toLowerCase();
  const types = new Map([
    [".pdf", "application/pdf"],
    [".png", "image/png"],
    [".jpg", "image/jpeg"],
    [".jpeg", "image/jpeg"],
  ]);
  if (types.get(extension) !== file.mimetype) return false;
  const data = file.buffer;
  if (extension === ".pdf") return data.subarray(0, 1024).includes(Buffer.from("%PDF-"));
  if (extension === ".png") return data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
}

export const uploadExistingPrescription = asyncHandler(async (req, res) => {
  if (!isDoctor(req.user)) throw new ApiError(403, "Only doctors may add an existing prescription");
  assertApprovedDoctor(req.user);
  if (!req.file || !isValidUpload(req.file)) {
    throw new ApiError(415, "Upload a valid PDF, PNG, or JPG prescription document");
  }
  const { patientId, appointmentId } = req.body;
  const patient = await User.findOne({ _id: patientId, role: { $in: ["PATIENT", "patient"] } }).select("_id");
  if (!patient) throw new ApiError(404, "Patient not found");
  const appointment = await validateClinicalAppointment({ appointmentId, patientId, doctorId: req.user._id });
  await fs.mkdir(prescriptionStorage, { recursive: true });
  const extension = path.extname(req.file.originalname).toLowerCase();
  const storedName = `${randomUUID()}${extension}`;
  const absolutePath = path.join(prescriptionStorage, storedName);
  await fs.writeFile(absolutePath, req.file.buffer, { flag: "wx", mode: 0o600 });
  let prescription;
  try {
    prescription = await Prescription.create({
      patient: patient._id,
      doctor: req.user._id,
      appointment: appointment._id,
      sourceType: "existing_upload",
      status: "uploaded",
      uploadedDocument: {
        storagePath: storedName,
        fileName: path.basename(req.file.originalname).slice(0, 200),
        mimeType: req.file.mimetype,
        fileSizeBytes: req.file.size,
        uploadedAt: new Date(),
      },
    });
  } catch (error) {
    await fs.rm(absolutePath, { force: true });
    throw error;
  }
  await logAction(req.user, "Uploaded existing prescription", {
    resourceId: prescription._id,
    requestId: req.requestId,
  });
  const result = prescription.toObject();
  delete result.uploadedDocument.storagePath;
  return created(res, result, "Prescription document uploaded privately");
});

export const downloadUploadedPrescription = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findOne({
    _id: req.params.id,
    status: "uploaded",
  }).select("+uploadedDocument.storagePath");
  if (!prescription) throw new ApiError(404, "Uploaded prescription not found");
  const doctorAccess = isDoctor(req.user) && String(prescription.doctor) === String(req.user._id);
  const patientAccess = !isDoctor(req.user) && String(prescription.patient) === String(req.user._id);
  if (!doctorAccess && !patientAccess) throw new ApiError(403, "You do not have access to this prescription");
  if (doctorAccess) assertApprovedDoctor(req.user);
  const storagePath = prescription.uploadedDocument?.storagePath;
  const absolutePath = path.resolve(prescriptionStorage, storagePath || "");
  if (!storagePath || !absolutePath.startsWith(`${prescriptionStorage}${path.sep}`)) {
    throw new ApiError(404, "Uploaded prescription not found");
  }
  await fs.access(absolutePath);
  await logAction(req.user, "Downloaded existing prescription", {
    resourceId: prescription._id,
    requestId: req.requestId,
  });
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.download(absolutePath, prescription.uploadedDocument.fileName);
});

function validateMedications(medications) {
  if (!Array.isArray(medications) || medications.length < 1 || medications.length > 30) {
    throw new ApiError(400, "Provide between 1 and 30 medicines");
  }
  return medications.map((medicine) => {
    const line = {
      name: String(medicine?.name || "").trim(),
      strength: String(medicine?.strength || "").trim(),
      dosage: String(medicine?.dosage || "").trim(),
      route: String(medicine?.route || "").trim(),
      frequency: String(medicine?.frequency || "").trim(),
      durationDays: Number(medicine?.durationDays),
      instructions: String(medicine?.instructions || "").trim(),
    };
    if (!line.name || line.name.length > 200 || !line.strength || line.strength.length > 100
        || !line.dosage || line.dosage.length > 100 || !line.route || line.route.length > 100
        || !line.frequency || line.frequency.length > 100
        || !Number.isInteger(line.durationDays) || line.durationDays < 1 || line.durationDays > 3650
        || line.instructions.length > 1000) {
      throw new ApiError(400, "Every medicine requires a name, strength, dose, route, frequency, and valid duration");
    }
    return line;
  });
}

async function validateClinicalAppointment({ appointmentId, patientId, doctorId }) {
  if (!appointmentId) throw new ApiError(400, "A confirmed appointment is required for clinical records");
  const appointment = await Appointment.findOne({
    _id: appointmentId,
    patient: patientId,
    doctor: doctorId,
    status: { $in: ["Confirmed", "InProgress", "Completed"] },
  });
  if (!appointment) throw new ApiError(403, "The appointment is not available for this clinical record");
  return appointment;
}

function prescriptionSnapshot(prescription) {
  return {
    medications: prescription.medications.map((medicine) => medicine.toObject ? medicine.toObject() : medicine),
    diagnosis: prescription.diagnosis,
    followUpDate: prescription.followUpDate,
    notes: prescription.notes,
  };
}

export const createPrescription = asyncHandler(async (req, res) => {
  if (!isDoctor(req.user)) throw new ApiError(403, "Only doctors can draft prescriptions");
  const { patientId, appointmentId, medications, diagnosis = "", followUpDate, notes = "" } = req.body;
  const lines = validateMedications(medications);
  if (String(diagnosis).length > 2000 || String(notes).length > 5000) throw new ApiError(400, "Prescription text is too long");
  const patient = await User.findOne({ _id: patientId, role: { $in: ["PATIENT", "patient"] } }).select("fullName email");
  if (!patient) throw new ApiError(404, "Patient not found");
  const appointment = await validateClinicalAppointment({ appointmentId, patientId, doctorId: req.user._id });
  const followUp = followUpDate ? new Date(followUpDate) : undefined;
  if (followUp && (!Number.isFinite(followUp.getTime()) || followUp <= new Date())) {
    throw new ApiError(400, "Follow-up recommendation must be a future date");
  }
  const prescription = await Prescription.create({
    patient: patient._id,
    doctor: req.user._id,
    appointment: appointment._id,
    medications: lines,
    diagnosis: String(diagnosis).trim(),
    followUpDate: followUp,
    notes: String(notes).trim(),
    status: "draft",
  });
  await logAction(req.user, "Created prescription draft", { resourceId: prescription._id, requestId: req.requestId });
  return created(res, prescription, "Prescription draft saved");
});

export const updatePrescriptionDraft = asyncHandler(async (req, res) => {
  const prescription = await Prescription.findOne({ _id: req.params.id, doctor: req.user._id });
  if (!prescription) throw new ApiError(404, "Prescription draft not found");
  if (prescription.status !== "draft") throw new ApiError(409, "Finalized prescriptions require an amendment");
  await validateClinicalAppointment({
    appointmentId: prescription.appointment,
    patientId: prescription.patient,
    doctorId: req.user._id,
  });
  const medications = validateMedications(req.body.medications);
  const diagnosis = String(req.body.diagnosis || "").trim();
  const notes = String(req.body.notes || "").trim();
  const followUpDate = req.body.followUpDate ? new Date(req.body.followUpDate) : undefined;
  if (diagnosis.length > 2000 || notes.length > 5000
      || (followUpDate && (!Number.isFinite(followUpDate.getTime()) || followUpDate <= new Date()))) {
    throw new ApiError(400, "Prescription draft values are invalid");
  }
  prescription.medications = medications;
  prescription.diagnosis = diagnosis;
  prescription.notes = notes;
  prescription.followUpDate = followUpDate;
  await prescription.save();
  await logAction(req.user, "Updated prescription draft", { resourceId: prescription._id, requestId: req.requestId });
  return ok(res, prescription, "Prescription draft updated");
});

export const finalizePrescription = asyncHandler(async (req, res) => {
  if (req.body.confirm !== true) throw new ApiError(400, "Explicit doctor confirmation is required to finalize");
  const prescription = await Prescription.findOne({ _id: req.params.id, doctor: req.user._id });
  if (!prescription) throw new ApiError(404, "Prescription draft not found");
  if (prescription.status !== "draft") throw new ApiError(409, "Only a draft prescription can be finalized");
  await validateClinicalAppointment({
    appointmentId: prescription.appointment,
    patientId: prescription.patient,
    doctorId: req.user._id,
  });
  prescription.status = "finalized";
  prescription.finalizedAt = new Date();
  prescription.finalizedBy = req.user._id;
  await prescription.save();
  await TimelineEvent.create({
    patient: prescription.patient,
    type: "Prescription",
    title: "Prescription finalized by doctor",
    detail: "",
    tone: "neutral",
    refId: prescription._id,
  });
  if (prescription.followUpDate) {
    await FollowUp.create({
      patient: prescription.patient,
      doctor: req.user._id,
      prescription: prescription._id,
      dueDate: prescription.followUpDate,
      reason: "Doctor-recommended follow-up",
      status: "Scheduled",
    });
  }
  const patient = await User.findById(prescription.patient).select("fullName email");
  if (patient) {
    const template = templates.prescriptionReady(patient.fullName, req.user.fullName);
    await sendEmail({
      userId: patient._id,
      subject: template.subject,
      html: template.html,
      type: "prescription-ready",
      idempotencyKey: `prescription-ready:${prescription._id}`,
    });
  }
  await logAction(req.user, "Finalized prescription", { resourceId: prescription._id, requestId: req.requestId });
  return ok(res, prescription, "Prescription finalized");
});

export const amendPrescription = asyncHandler(async (req, res) => {
  if (req.body.confirm !== true) throw new ApiError(400, "Explicit doctor confirmation is required to amend");
  const reason = String(req.body.reason || "").trim();
  if (!reason || reason.length > 1000) throw new ApiError(400, "A reason is required for prescription amendments");
  const prescription = await Prescription.findOne({ _id: req.params.id, doctor: req.user._id });
  if (!prescription || !["finalized", "amended"].includes(prescription.status)) {
    throw new ApiError(404, "Finalized prescription not found");
  }
  const appointment = await Appointment.exists({
    _id: prescription.appointment,
    doctor: req.user._id,
    patient: prescription.patient,
  });
  if (!appointment) throw new ApiError(403, "Appointment access is not available");
  const medications = validateMedications(req.body.medications);
  const diagnosis = String(req.body.diagnosis || "").trim();
  const notes = String(req.body.notes || "").trim();
  const followUpDate = req.body.followUpDate ? new Date(req.body.followUpDate) : undefined;
  if (diagnosis.length > 2000 || notes.length > 5000
      || (followUpDate && (!Number.isFinite(followUpDate.getTime()) || followUpDate <= new Date()))) {
    throw new ApiError(400, "Prescription amendment values are invalid");
  }
  prescription.amendmentHistory.push({
    version: prescription.amendmentHistory.length + 1,
    ...prescriptionSnapshot(prescription),
    amendedBy: req.user._id,
    reason,
  });
  prescription.medications = medications;
  prescription.diagnosis = diagnosis;
  prescription.notes = notes;
  prescription.followUpDate = followUpDate;
  prescription.status = "amended";
  prescription.finalizedAt = new Date();
  prescription.finalizedBy = req.user._id;
  await prescription.save();
  await logAction(req.user, "Amended finalized prescription", { resourceId: prescription._id, requestId: req.requestId });
  return ok(res, prescription, "Prescription amended with history retained");
});

export const listPrescriptions = asyncHandler(async (req, res) => {
  if (isDoctor(req.user)) assertApprovedDoctor(req.user);
  const filter = isDoctor(req.user) ? { doctor: req.user._id } : { patient: req.user._id };
  if (req.query.patientId && isDoctor(req.user)) filter.patient = req.query.patientId;
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
  const [items, total] = await Promise.all([
    Prescription.find(filter)
      .select("-uploadedDocument.storagePath")
      .populate("patient", "fullName")
      .populate("doctor", "fullName doctorProfile.specialization")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Prescription.countDocuments(filter),
  ]);
  return ok(res, { items, page, limit, total });
});

export const listFollowUps = asyncHandler(async (req, res) => {
  if (isDoctor(req.user)) assertApprovedDoctor(req.user);
  else if (String(req.user.role).toUpperCase() !== "PATIENT") throw new ApiError(403, "Patient or approved doctor access is required");
  const filter = isDoctor(req.user) ? { doctor: req.user._id } : { patient: req.user._id };
  if (req.query.patientId && isDoctor(req.user)) filter.patient = req.query.patientId;
  const followUps = await FollowUp.find(filter).populate("patient", "fullName").sort({ dueDate: 1 }).limit(100);
  return ok(res, followUps);
});

export const createFollowUp = asyncHandler(async (req, res) => {
  const { patientId, appointmentId, dueDate, reason } = req.body;
  if (!dueDate || !Number.isFinite(Date.parse(dueDate)) || new Date(dueDate) <= new Date()
      || !String(reason || "").trim() || String(reason).length > 1000) {
    throw new ApiError(400, "A future follow-up date and instructions are required");
  }
  await validateClinicalAppointment({ appointmentId, patientId, doctorId: req.user._id });
  const followUp = await FollowUp.create({
    patient: patientId,
    doctor: req.user._id,
    dueDate: new Date(dueDate),
    reason: String(reason).trim(),
    status: "Scheduled",
  });
  await logAction(req.user, "Created follow-up recommendation", { resourceId: followUp._id, requestId: req.requestId });
  return created(res, followUp, "Follow-up recommendation created; it is not a booked appointment");
});

export const updateFollowUp = asyncHandler(async (req, res) => {
  const followUp = await FollowUp.findOne({ _id: req.params.id, doctor: req.user._id });
  if (!followUp) throw new ApiError(404, "Follow-up not found");
  const nextStatus = req.body.status;
  if (!["Completed", "Missed"].includes(nextStatus) || followUp.status !== "Scheduled") {
    throw new ApiError(409, "Invalid follow-up status transition");
  }
  if (nextStatus === "Missed" && followUp.dueDate > new Date()) {
    throw new ApiError(400, "A future follow-up cannot be marked missed");
  }
  followUp.status = nextStatus;
  await followUp.save();
  await logAction(req.user, "Updated follow-up recommendation", { resourceId: followUp._id, requestId: req.requestId });
  return ok(res, followUp);
});
