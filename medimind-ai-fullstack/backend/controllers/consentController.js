import Consent from "../models/Consent.js";
import Report from "../models/Report.js";
import User from "../models/User.js";
import { logAction } from "../services/auditService.js";
import { enqueueNotification } from "../services/notificationService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

// @desc    Create new consent for report sharing
// @route   POST /api/consents
// @access  Private (Patient)
export const createConsent = asyncHandler(async (req, res) => {
  if (String(req.user.role).toUpperCase() !== "PATIENT") throw new ApiError(403, "Only patients may grant report consent");
  const { doctorId, reportIds, purpose, durationDays } = req.body;
  const patientId = req.user._id;

  const uniqueReportIds = Array.isArray(reportIds) ? [...new Set(reportIds.map(String))] : [];
  const days = Number(durationDays);
  if (!doctorId || !uniqueReportIds.length || uniqueReportIds.length > 100
      || !String(purpose || "").trim() || String(purpose).length > 500
      || !Number.isInteger(days) || days < 1 || days > 90) {
    throw new ApiError(400, "Doctor, reports, purpose, and duration are required");
  }

  const doctor = await User.findOne({
    _id: doctorId,
    role: { $in: ["DOCTOR", "doctor"] },
    status: { $in: ["APPROVED", "ACTIVE", "approved", "active"] },
    "doctorProfile.verification.status": { $in: ["approved", "verified"] },
  });
  if (!doctor) {
    throw new ApiError(404, "Approved doctor not found");
  }

  // Verify all reports belong to the patient
  const reportsCount = await Report.countDocuments({
    _id: { $in: uniqueReportIds },
    patient: patientId,
  });

  if (reportsCount !== uniqueReportIds.length) {
    throw new ApiError(403, "One or more reports are invalid or do not belong to you");
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + parseInt(durationDays));

  const consent = await Consent.create({
    patient: patientId,
    doctor: doctorId,
    reports: uniqueReportIds,
    purpose: String(purpose).trim(),
    durationDays: days,
    expiresAt,
    status: "active",
  });
  await logAction(req.user, "Granted report-sharing consent", {
    resourceId: consent._id,
    outcome: "allowed",
    requestId: req.requestId,
  });
  await enqueueNotification({
    userId: doctor._id,
    triggerType: "report-shared",
    title: "Patient shared medical reports",
    body: "One or more reports were shared with you for review.",
    idempotencyKey: `report-shared:${consent._id}`,
  });

  res.status(201).json({
    success: true,
    message: "Consent granted successfully",
    data: consent,
  });
});

// @desc    List consents granted by the patient
// @route   GET /api/consents/patient
// @access  Private (Patient)
export const listPatientConsents = asyncHandler(async (req, res) => {
  const consents = await Consent.find({ patient: req.user._id })
    .populate("doctor", "fullName specialization email")
    .populate("reports", "fileName reportType createdAt")
    .sort("-createdAt");

  res.json({
    success: true,
    data: consents,
  });
});

// @desc    Revoke consent
// @route   PATCH /api/consents/:id/revoke
// @access  Private (Patient)
export const revokeConsent = asyncHandler(async (req, res) => {
  const consent = await Consent.findOne({
    _id: req.params.id,
    patient: req.user._id,
  });

  if (!consent) {
    throw new ApiError(404, "Consent record not found");
  }

  consent.status = "revoked";
  await consent.save();
  await logAction(req.user, "Revoked report-sharing consent", {
    resourceId: consent._id,
    outcome: "completed",
    requestId: req.requestId,
  });

  res.json({
    success: true,
    message: "Access revoked successfully",
  });
});

// @desc    List reports shared with a doctor
// @route   GET /api/consents/doctor
// @access  Private (Doctor)
export const listSharedWithMe = asyncHandler(async (req, res) => {
  if (String(req.user.role).toUpperCase() !== "DOCTOR"
      || !["APPROVED", "ACTIVE"].includes(String(req.user.status || "").toUpperCase())
      || !["approved", "verified"].includes(String(req.user.doctorProfile?.verification?.status || "").toLowerCase())) {
    throw new ApiError(403, "Approved doctor access is required");
  }
  const now = new Date();
  const consents = await Consent.find({
    doctor: req.user._id,
    status: "active",
    expiresAt: { $gt: now },
  })
    .populate("patient", "fullName avatarUrl")
    .populate("reports", "fileName mimeType fileSizeBytes reportType analysis imaging doctorReview createdAt -filePath")
    .sort("-createdAt");

  res.json({
    success: true,
    data: consents,
  });
});
