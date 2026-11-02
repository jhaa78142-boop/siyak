import User from "../models/User.js";
import Appointment from "../models/Appointment.js";
import SymptomCheck from "../models/SymptomCheck.js";
import ChatConversation from "../models/ChatConversation.js";
import AuditLog from "../models/AuditLog.js";
import EarlyWarning from "../models/EarlyWarning.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { logAction } from "../services/auditService.js";
import { sendEmail, templates } from "../services/emailService.js";
import { downloadVerificationDocument } from "./doctorController.js";

// --- Dashboard stats ---
export const dashboardStats = asyncHandler(async (req, res) => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [totalUsers, patients, doctors, pendingVerifications, appointmentsToday, aiQueriesToday] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: { $in: ["PATIENT", "patient"] } }),
    User.countDocuments({ role: { $in: ["DOCTOR", "doctor"] } }),
    User.countDocuments({
      role: { $in: ["DOCTOR", "doctor"] },
      $or: [
        { status: "PENDING" },
        { "doctorProfile.verification.status": "pending" },
      ],
    }),
    Appointment.countDocuments({ scheduledAt: { $gte: startOfDay } }),
    SymptomCheck.countDocuments({ createdAt: { $gte: startOfDay } }),
  ]);

  return ok(res, { totalUsers, patients, doctors, pendingVerifications, appointmentsToday, aiQueriesToday });
});

// --- User growth chart (last 6 months) ---
export const userGrowth = asyncHandler(async (req, res) => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const [patients, doctors] = await Promise.all([
      User.countDocuments({ role: "patient", createdAt: { $lt: next } }),
      User.countDocuments({ role: "doctor", createdAt: { $lt: next } }),
    ]);
    months.push({ month: d.toLocaleString("default", { month: "short" }), patients, doctors });
  }
  return ok(res, months);
});

// --- User management ---
export const listUsers = asyncHandler(async (req, res) => {
  const { role, q, status } = req.query;
  const filter = {};
  if (role) filter.role = { $in: [role.toLowerCase(), role.toUpperCase()] };
  if (status) filter.status = { $in: [status.toLowerCase(), status.toUpperCase()] };
  if (q) filter.$or = [{ fullName: new RegExp(q, "i") }, { email: new RegExp(q, "i") }];

  const users = await User.find(filter)
    .select("fullName name email username role status avatarUrl createdAt")
    .sort({ createdAt: -1 })
    .limit(200);
  const formatted = users.map((u) => ({
    ...u.toObject(),
    name: u.fullName || u.name || "User",
  }));
  return ok(res, formatted);
});

export const setUserStatus = asyncHandler(async (req, res) => {
  const status = String(req.body.status || "").toUpperCase();
  if (!["ACTIVE", "SUSPENDED"].includes(status)) throw new ApiError(400, "Status must be active or suspended");
  if (String(req.params.id) === String(req.user._id)) throw new ApiError(400, "You cannot change your own account status");
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, "User not found");
  if (["DOCTOR", "doctor"].includes(user.role)) {
    if (status === "SUSPENDED") {
      user.status = "SUSPENDED";
      if (user.doctorProfile.verification.status !== "suspended") {
        user.doctorProfile.verification.suspendedFromStatus = user.doctorProfile.verification.status;
      }
      user.doctorProfile.verification.status = "suspended";
      user.doctorProfile.verification.reviewedAt = new Date();
      user.doctorProfile.verification.reviewedBy = req.user._id;
    } else {
      if (!["approved", "verified"].includes(String(user.doctorProfile?.verification?.suspendedFromStatus || "").toLowerCase())) {
        throw new ApiError(400, "A doctor must be approved before account reactivation");
      }
      user.status = "APPROVED";
      user.doctorProfile.verification.status = user.doctorProfile.verification.suspendedFromStatus;
      user.doctorProfile.verification.suspendedFromStatus = undefined;
    }
  } else {
    user.status = status;
  }
  await user.save();

  await logAction(req.user, `${status === "SUSPENDED" ? "Suspended" : "Reactivated"} account`, {
    resourceId: user._id,
    requestId: req.requestId,
  });
  return ok(res, { _id: user._id, status: user.status });
});

// --- Doctor verification ---
export const listPendingDoctors = asyncHandler(async (req, res) => {
  const doctors = await User.find({
    role: { $in: ["DOCTOR", "doctor"] },
    $or: [
      { status: "PENDING" },
      { "doctorProfile.verification.status": "pending" },
    ],
  }).select("fullName name doctorProfile email createdAt status");

  const formatted = doctors.map((d) => {
    const result = d.toObject();
    result.name = d.fullName || d.name || "Doctor";
    if (result.doctorProfile?.verificationDocuments) {
      result.doctorProfile.verificationDocuments = result.doctorProfile.verificationDocuments.map((document) => ({
        _id: document._id,
        fileName: document.fileName,
        mimeType: document.mimeType,
        uploadedAt: document.uploadedAt,
      }));
    }
    return result;
  });

  return ok(res, formatted);
});

export const createAdmin = asyncHandler(async (req, res) => {
  const { firebaseUid, email, username, fullName } = req.body;

  // Check duplicates
  const existingEmail = await User.findOne({ email });
  if (existingEmail) throw new ApiError(400, "Email is already registered.");
  
  const existingUsername = await User.findOne({ username });
  if (existingUsername) throw new ApiError(400, "Username is already taken.");

  const newUser = await User.create({
    firebaseUid,
    email,
    username,
    fullName,
    role: "ADMIN",
    status: "ACTIVE",
    adminProfile: {}
  });

  await logAction(req.user, "Created a new admin account", { adminId: newUser._id, email: newUser.email });
  return ok(res, newUser, "Admin account created");
});

export const approveDoctor = asyncHandler(async (req, res) => {
  const doctor = await User.findById(req.params.id);
  if (!doctor || !["DOCTOR", "doctor"].includes(doctor.role)) {
    throw new ApiError(404, "Doctor not found");
  }
  if (String(doctor._id) === String(req.user._id)) throw new ApiError(403, "Administrators cannot approve their own doctor account");
  if (!doctor.doctorProfile?.specialization || !doctor.doctorProfile?.licenseNumber
      || !doctor.doctorProfile?.registrationAuthority
      || !doctor.doctorProfile?.verificationDocuments?.length) {
    throw new ApiError(400, "Complete credentials and at least one verification document are required");
  }

  doctor.status = "APPROVED";
  if (!doctor.doctorProfile) doctor.doctorProfile = {};
  if (!doctor.doctorProfile.verification) doctor.doctorProfile.verification = {};
  
  doctor.doctorProfile.verification.status = "approved";
  doctor.doctorProfile.verification.suspendedFromStatus = undefined;
  doctor.doctorProfile.verification.reviewedAt = new Date();
  doctor.doctorProfile.verification.reviewedBy = req.user?._id;
  await doctor.save();

  await logAction(req.user, "Approved doctor verification", { resourceId: doctor._id, requestId: req.requestId });
  const tpl = templates.doctorVerificationDecision(doctor.fullName, true);
  await sendEmail({
    userId: doctor._id,
    subject: tpl.subject,
    html: tpl.html,
    type: "doctor-verification",
    idempotencyKey: `doctor-verification-approved:${doctor._id}:${doctor.doctorProfile.verification.reviewedAt.getTime()}`,
  });
  return ok(res, {
    _id: doctor._id,
    status: doctor.status,
    verificationStatus: doctor.doctorProfile.verification.status,
  }, "Doctor approved successfully");
});

export const rejectDoctor = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  if (!String(reason || "").trim()) throw new ApiError(400, "A rejection reason is required");
  const doctor = await User.findById(req.params.id);
  if (!doctor || !["DOCTOR", "doctor"].includes(doctor.role)) {
    throw new ApiError(404, "Doctor not found");
  }
  if (String(doctor._id) === String(req.user._id)) throw new ApiError(403, "Administrators cannot reject their own doctor account");

  doctor.status = "REJECTED";
  if (!doctor.doctorProfile) doctor.doctorProfile = {};
  if (!doctor.doctorProfile.verification) doctor.doctorProfile.verification = {};

  doctor.doctorProfile.verification.status = "rejected";
  doctor.doctorProfile.verification.suspendedFromStatus = undefined;
  doctor.doctorProfile.verification.reviewedAt = new Date();
  doctor.doctorProfile.verification.reviewedBy = req.user?._id;
  doctor.doctorProfile.verification.rejectionReason = String(reason).trim().slice(0, 1000);
  await doctor.save();

  await logAction(req.user, "Rejected doctor verification", { resourceId: doctor._id, requestId: req.requestId });
  const tpl = templates.doctorVerificationDecision(doctor.fullName, false, doctor.doctorProfile.verification.rejectionReason);
  await sendEmail({
    userId: doctor._id,
    subject: tpl.subject,
    html: tpl.html,
    type: "doctor-verification",
    idempotencyKey: `doctor-verification-rejected:${doctor._id}:${doctor.doctorProfile.verification.reviewedAt.getTime()}`,
  });
  return ok(res, {
    _id: doctor._id,
    status: doctor.status,
    verificationStatus: doctor.doctorProfile.verification.status,
  }, "Doctor rejected successfully");
});

export const suspendDoctor = asyncHandler(async (req, res) => {
  const doctor = await User.findOne({ _id: req.params.id, role: { $in: ["DOCTOR", "doctor"] } });
  if (!doctor) throw new ApiError(404, "Doctor not found");
  if (String(doctor._id) === String(req.user._id)) throw new ApiError(403, "Administrators cannot suspend their own doctor account");
  if (doctor.doctorProfile.verification.status !== "suspended") {
    doctor.doctorProfile.verification.suspendedFromStatus = doctor.doctorProfile.verification.status;
  }
  doctor.status = "SUSPENDED";
  doctor.doctorProfile.verification.status = "suspended";
  doctor.doctorProfile.verification.reviewedAt = new Date();
  doctor.doctorProfile.verification.reviewedBy = req.user._id;
  await doctor.save();
  await logAction(req.user, "Suspended doctor verification", {
    resourceId: doctor._id,
    requestId: req.requestId,
  });
  return ok(res, {
    _id: doctor._id,
    status: doctor.status,
    verificationStatus: doctor.doctorProfile.verification.status,
  }, "Doctor suspended");
});

// --- Audit log ---
export const listAuditLog = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(200);
  return ok(res, logs);
});

// --- Early warnings ---
export const listEarlyWarnings = asyncHandler(async (req, res) => {
  const warnings = await EarlyWarning.find().sort({ createdAt: -1 }).limit(50);
  return ok(res, warnings);
});

export const createEarlyWarning = asyncHandler(async (req, res) => {
  const warning = await EarlyWarning.create(req.body);
  await logAction(req.user, "Created early warning alert", { title: warning.title });
  return ok(res, warning);
});

export const acknowledgeEarlyWarning = asyncHandler(async (req, res) => {
  const warning = await EarlyWarning.findByIdAndUpdate(req.params.id, { acknowledged: true }, { new: true });
  return ok(res, warning);
});

// --- AI quality breakdown (aggregated from symptom checks / chats as a proxy) ---
export const aiQualityBreakdown = asyncHandler(async (req, res) => {
  const [symptomVolume, chatVolume] = await Promise.all([
    SymptomCheck.countDocuments(),
    ChatConversation.aggregate([{ $project: { count: { $size: "$messages" } } }, { $group: { _id: null, total: { $sum: "$count" } } }]),
  ]);

  return ok(res, [
    { name: "Symptom Checker", volume: symptomVolume },
    { name: "AI Chat", volume: chatVolume[0]?.total || 0 },
  ]);
});
