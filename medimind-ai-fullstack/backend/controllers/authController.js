import User from "../models/User.js";
import PasswordResetOTP from "../models/PasswordResetOTP.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created, badRequest, notFound, unauthorized } from "../utils/apiResponse.js";
import { sendOTPEmail } from "../utils/sendOTP.js";
import admin from "../config/firebaseAdmin.js";
import crypto from "crypto";
import { ApiError } from "../utils/ApiError.js";
import { enqueueNotification, recordDeliveredEmail } from "../services/notificationService.js";
import { logAction } from "../services/auditService.js";

function queueWelcomeNotification(user) {
  enqueueNotification({
    userId: user._id,
    triggerType: "welcome-registration",
    title: "Welcome to MediMind AI",
    body: `Welcome, ${user.fullName}. Your account is ready.`,
    idempotencyKey: `welcome-registration:${user._id}`,
  }).catch((error) => {
    console.error(`[authController] could not queue welcome notification for ${user._id}:`, error.message);
  });
}

function userProfileResponse(user) {
  const profile = user.toObject();
  if (profile.doctorProfile?.verificationDocuments) {
    profile.doctorProfile.verificationDocuments = profile.doctorProfile.verificationDocuments.map((document) => {
      const publicDocument = { ...document };
      delete publicDocument.storagePath;
      return publicDocument;
    });
  }
  if (profile.doctorProfile?.verification) delete profile.doctorProfile.verification.suspendedFromStatus;
  return profile;
}

// Helper to hash OTP
const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

// =========================================================
// LOOKUP USERNAME (public – no auth required)
// Returns the email associated with a username or email so the
// frontend can do Firebase signInWithEmailAndPassword.
// =========================================================
export const lookupUsername = asyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username) throw new ApiError(400, "Username is required");

  const clean = username.trim();
  const user = await User.findOne({
    $or: [
      { username: { $regex: new RegExp(`^${clean}$`, "i") } },
      { email: clean.toLowerCase() },
    ],
  }).select("email username fullName role status");

  if (!user) throw new ApiError(404, "Username not found.");

  return ok(res, { 
    email: user.email, 
    username: user.username, 
    fullName: user.fullName, 
    role: user.role, 
    status: user.status 
  });
});

// =========================================================
// GOOGLE SYNC (authenticated – called after Google sign-in)
// Finds the MongoDB user whose email matches the Google email.
// Multi-provider linking: adds Google UID to user.firebaseUids
// without replacing the primary email/password UID.
// If not found in MongoDB, rejects per login.txt spec.
// =========================================================
export const googleSync = asyncHandler(async (req, res) => {
  const firebaseUid = req.firebaseUser?.uid;
  const googleEmail = (req.firebaseUser?.email || "").toLowerCase();
  if (!firebaseUid || !googleEmail) throw new ApiError(401, "Not authenticated properly");

  // Check if a user already exists with this Firebase UID, in firebaseUids, or with matching email
  let user = await User.findOne({
    $or: [
      { firebaseUid },
      { firebaseUids: firebaseUid },
      { email: googleEmail },
    ],
  });

  if (!user) {
    throw new ApiError(404, "This Google email is not registered. Please create an account first.");
  }

  // Ensure this provider UID is in firebaseUids
  if (!user.firebaseUids) user.firebaseUids = [];
  if (!user.firebaseUids.includes(firebaseUid)) {
    user.firebaseUids.push(firebaseUid);
  }
  user.lastLoginAt = new Date();
  await user.save();

  return ok(res, user, "Google login successful");
});

// =========================================================
// 0. SYNC USER (General Signup page → POST /auth/sync)
//    Called right after Firebase account creation. Creates
//    the matching MongoDB profile for PATIENT or DOCTOR.
// =========================================================
export const syncUser = asyncHandler(async (req, res) => {
  const firebaseUid = req.firebaseUser?.uid;
  const email = (req.firebaseUser?.email || "").toLowerCase();
  if (!firebaseUid || !email) throw new ApiError(401, "Not authenticated properly");

  // Already synced? Just return the existing profile.
  const existing = await User.findOne({ $or: [{ firebaseUid }, { firebaseUids: firebaseUid }] });
  if (existing) return ok(res, existing, "User profile already exists");

  const { role, name, phone, doctorProfile } = req.body;
  const allowedRoles = ["patient", "doctor", "PATIENT", "DOCTOR"];
  if (!allowedRoles.includes(role)) throw new ApiError(400, "Invalid role. Must be patient or doctor.");

  const normalizedRole = role.toUpperCase();

  // Build username from email prefix
  const baseUsername = email.split("@")[0].replace(/[^a-z0-9_]/gi, "").toLowerCase();
  let username = baseUsername;
  let attempt = 0;
  while (await User.findOne({ username })) {
    attempt++;
    username = `${baseUsername}${attempt}`;
  }

  const newUser = await User.create({
    firebaseUid,
    email,
    username,
    fullName: String(name || email.split("@")[0]).trim().slice(0, 120),
    phone: phone || "",
    role: normalizedRole,
    status: normalizedRole === "DOCTOR" ? "PENDING" : "ACTIVE",
    ...(normalizedRole === "DOCTOR" && doctorProfile
      ? {
          doctorProfile: {
            specialization: doctorProfile.specialization || "",
            licenseNumber: doctorProfile.licenseNumber || "",
            verification: { submittedAt: new Date() },
          },
        }
      : {}),
  });

  queueWelcomeNotification(newUser);
  return created(res, newUser, normalizedRole === "DOCTOR"
    ? "Doctor registration submitted for approval"
    : "Patient account created successfully");
});

// =========================================================
// 1. PATIENT REGISTRATION
// =========================================================
export const registerPatient = asyncHandler(async (req, res) => {
  const { 
    username, fullName, phone, 
    dateOfBirth, gender, bloodGroup, height_cm, weight_kg,
    allergies, chronicConditions, currentMedications, emergencyContact 
  } = req.body;
  const firebaseUid = req.firebaseUser?.uid;
  const email = (req.firebaseUser?.email || "").toLowerCase();
  if (!firebaseUid || !email) throw new ApiError(401, "Not authenticated properly");

  // Check duplicates
  const existingEmail = await User.findOne({ email });
  if (existingEmail) throw new ApiError(400, "Email is already registered.");
  
  const existingUsername = await User.findOne({ username });
  if (existingUsername) throw new ApiError(400, "Username is already taken.");
  
  const existingFirebase = await User.findOne({ firebaseUid });
  if (existingFirebase) throw new ApiError(400, "Firebase account is already linked.");

  const newUser = await User.create({
    firebaseUid,
    email,
    username,
    fullName,
    phone: phone || "",
    role: "PATIENT",
    status: "ACTIVE", // Active by default
    patientProfile: {
      dateOfBirth,
      gender,
      bloodGroup,
      height_cm,
      weight_kg,
      allergies,
      chronicConditions,
      currentMedications,
      emergencyContact,
    }
  });

  queueWelcomeNotification(newUser);
  return created(res, newUser, "Patient registration successful");
});

// =========================================================
// 2. DOCTOR REGISTRATION
// =========================================================
export const registerDoctor = asyncHandler(async (req, res) => {
  const { 
    username, fullName, phone, 
    specialization, hospital, licenseNumber, qualifications,
    registrationAuthority, languages, experienceYears, consultationFee, bio
  } = req.body;
  const firebaseUid = req.firebaseUser?.uid;
  const email = (req.firebaseUser?.email || "").toLowerCase();
  if (!firebaseUid || !email) throw new ApiError(401, "Not authenticated properly");
  if (!String(fullName || "").trim() || !String(username || "").trim()
      || !String(specialization || "").trim() || !String(licenseNumber || "").trim()
      || !String(registrationAuthority || "").trim()) {
    throw new ApiError(400, "Name, username, specialization, registration number, and issuing authority are required.");
  }

  // Check duplicates
  const existingEmail = await User.findOne({ email });
  if (existingEmail) throw new ApiError(400, "Email is already registered.");
  
  const existingUsername = await User.findOne({ username });
  if (existingUsername) throw new ApiError(400, "Username is already taken.");
  
  const existingFirebase = await User.findOne({ firebaseUid });
  if (existingFirebase) throw new ApiError(400, "Firebase account is already linked.");

  const newUser = await User.create({
    firebaseUid,
    email,
    username,
    fullName,
    phone: phone || "",
    role: "DOCTOR",
    status: "PENDING", // Doctors are pending until admin approval
    doctorProfile: {
      specialization,
      hospital,
      licenseNumber,
      qualifications: Array.isArray(qualifications) ? qualifications.map(String).slice(0, 20) : [],
      registrationAuthority: String(registrationAuthority).trim().slice(0, 160),
      languages: Array.isArray(languages) ? languages.map(String).slice(0, 20) : [],
      experienceYears: experienceYears == null ? 0 : Number(experienceYears),
      consultationFee: consultationFee == null ? undefined : Number(consultationFee),
      bio: String(bio || "").slice(0, 2000),
      verification: {
        status: "pending",
        submittedAt: new Date(),
      }
    }
  });

  queueWelcomeNotification(newUser);
  return created(res, newUser, "Doctor registration submitted for approval");
});

// =========================================================
// 3. GET CURRENT USER PROFILE
// =========================================================
export const getMe = asyncHandler(async (req, res) => {
  const firebaseUid = req.user?.firebaseUid || req.firebaseUser?.uid;
  if (!firebaseUid) throw new ApiError(401, "Not authenticated properly");

  let user = req.user;
  if (!user) {
    const email = (req.firebaseUser?.email || "").toLowerCase();
    user = await User.findOne({
      $or: [
        { firebaseUid },
        { firebaseUids: firebaseUid },
        ...(email ? [{ email }] : []),
      ],
    });
  }

  if (!user) throw new ApiError(404, "User profile not found in database.");

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  return ok(res, userProfileResponse(user));
});

// =========================================================
// 4. FORGOT PASSWORD - SEND OTP
// =========================================================
export const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required");

  const cleanEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: cleanEmail });
  if (!user) throw new ApiError(404, "No account found with this email.");
  // OTP recovery is available for both PATIENT and DOCTOR (not ADMIN per spec)
  if (user.role === "ADMIN") throw new ApiError(403, "Admin password reset is managed separately. Contact the system administrator.");

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Save OTP in MongoDB
  await PasswordResetOTP.deleteMany({ email: cleanEmail }); // Delete any old OTPs for this email
  await PasswordResetOTP.create({
    email: cleanEmail,
    otpHash: hashOtp(otp),
    expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes validity per login.txt
    attempts: 0,
  });

  try {
    await sendOTPEmail(cleanEmail, otp);
  } catch (error) {
    await PasswordResetOTP.deleteOne({ email: cleanEmail });
    throw new ApiError(503, "Unable to deliver the password reset code. Please try again later.");
  }
  await recordDeliveredEmail({
    userId: user._id,
    triggerType: "password-reset",
    title: "Password reset verification code",
    body: "A password reset code was sent to your account email.",
  });

  return ok(res, null, "OTP sent successfully to your email.");
});

// =========================================================
// 5. FORGOT PASSWORD - VERIFY OTP
// =========================================================
export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp) throw new ApiError(400, "Email and OTP are required.");

  const cleanEmail = email.trim().toLowerCase();
  const otpRecord = await PasswordResetOTP.findOne({ email: cleanEmail });
  if (!otpRecord) throw new ApiError(400, "Invalid or expired OTP.");

  if (otpRecord.attempts >= 3) {
    await PasswordResetOTP.deleteOne({ email: cleanEmail });
    throw new ApiError(429, "Too many failed attempts. Please request a new OTP.");
  }

  if (otpRecord.otpHash !== hashOtp(otp.trim())) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new ApiError(400, "Invalid or expired OTP.");
  }

  // If newPassword was also provided in verifyOtp, perform reset directly
  if (newPassword) {
    if (newPassword.length < 6) throw new ApiError(400, "Password must be at least 6 characters.");
    const user = await User.findOne({ email: cleanEmail });
    if (!user) throw new ApiError(404, "User account not found.");

    let fbUser;
    try {
      fbUser = await admin.auth().getUser(user.firebaseUid);
    } catch {
      try {
        fbUser = await admin.auth().getUserByEmail(cleanEmail);
      } catch (err) {
        throw new ApiError(404, "Firebase user account not found: " + err.message);
      }
    }

    await admin.auth().updateUser(fbUser.uid, { password: newPassword });
    await PasswordResetOTP.deleteOne({ email: cleanEmail });

    return ok(res, null, "Password reset successfully. You can now login.");
  }

  return ok(res, { verified: true }, "OTP verified successfully.");
});

// =========================================================
// 5B. FORGOT PASSWORD - RESET PASSWORD
// =========================================================
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) throw new ApiError(400, "Email, OTP, and new password are required.");
  if (newPassword.length < 6) throw new ApiError(400, "Password must be at least 6 characters.");

  const cleanEmail = email.trim().toLowerCase();
  const otpRecord = await PasswordResetOTP.findOne({ email: cleanEmail });
  if (!otpRecord) throw new ApiError(400, "Invalid or expired OTP.");

  if (otpRecord.attempts >= 3) {
    await PasswordResetOTP.deleteOne({ email: cleanEmail });
    throw new ApiError(429, "Too many failed attempts. Please request a new OTP.");
  }

  if (otpRecord.otpHash !== hashOtp(otp.trim())) {
    otpRecord.attempts += 1;
    await otpRecord.save();
    throw new ApiError(400, "Invalid or expired OTP.");
  }

  const user = await User.findOne({ email: cleanEmail });
  if (!user) throw new ApiError(404, "User account not found.");

  let fbUser;
  try {
    fbUser = await admin.auth().getUser(user.firebaseUid);
  } catch {
    try {
      fbUser = await admin.auth().getUserByEmail(cleanEmail);
    } catch (err) {
      throw new ApiError(404, "Firebase user account not found: " + err.message);
    }
  }

  await admin.auth().updateUser(fbUser.uid, { password: newPassword });
  await PasswordResetOTP.deleteOne({ email: cleanEmail });

  return ok(res, null, "Password reset successfully. You can now login.");
});

// =========================================================
// 6. UPDATE PROFILE (All roles: Patient, Doctor, Admin)
// =========================================================
export const updateProfile = asyncHandler(async (req, res) => {
  const user = req.user?._id ? await User.findById(req.user._id) : null;
  if (!user) throw new ApiError(404, "User profile not found");

  const { fullName, phone, avatarUrl, doctorProfile, patientProfile, adminProfile } = req.body;
  const previousFullName = user.fullName;

  if (fullName !== undefined && (typeof fullName !== "string" || !fullName.trim() || fullName.length > 120)) {
    throw new ApiError(400, "Full name must be a non-empty string of at most 120 characters");
  }
  if (phone !== undefined && (typeof phone !== "string" || phone.length > 40)) {
    throw new ApiError(400, "Phone number must be a string of at most 40 characters");
  }
  if (avatarUrl !== undefined && (typeof avatarUrl !== "string" || avatarUrl.length > 3_000_000)) {
    throw new ApiError(400, "Profile image must be a string under 3 MB");
  }
  if (fullName !== undefined) user.fullName = fullName.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

  // Role-specific updates
  if (user.role === "DOCTOR") {
    if (!user.doctorProfile) user.doctorProfile = {};
    if (doctorProfile !== undefined && (!doctorProfile || typeof doctorProfile !== "object" || Array.isArray(doctorProfile))) {
      throw new ApiError(400, "Doctor profile fields must be an object");
    }
    const doctorFields = doctorProfile || {};
    const stringLimits = {
      specialization: 120,
      hospital: 200,
      licenseNumber: 120,
      registrationAuthority: 160,
      bio: 2000,
    };
    for (const [field, maxLength] of Object.entries(stringLimits)) {
      if (doctorFields[field] !== undefined
          && (typeof doctorFields[field] !== "string" || doctorFields[field].length > maxLength)) {
        throw new ApiError(400, `${field} must be a string of at most ${maxLength} characters`);
      }
    }
    for (const field of ["qualifications", "languages"]) {
      if (doctorFields[field] !== undefined
          && (!Array.isArray(doctorFields[field]) || doctorFields[field].length > 20
            || doctorFields[field].some((value) => typeof value !== "string" || value.length > 100))) {
        throw new ApiError(400, `${field} must be a list of at most 20 strings, each at most 100 characters`);
      }
    }
    for (const [field, maximum] of [["experienceYears", 80], ["consultationFee", 1_000_000]]) {
      if (doctorFields[field] !== undefined) {
        const validNumberType = typeof doctorFields[field] === "number"
          || (typeof doctorFields[field] === "string" && doctorFields[field].trim() !== "");
        if (!validNumberType || !Number.isFinite(Number(doctorFields[field]))
            || Number(doctorFields[field]) < 0 || Number(doctorFields[field]) > maximum) {
          throw new ApiError(400, `${field} must be between 0 and ${maximum}`);
        }
      }
    }
    const criticalFields = ["specialization", "licenseNumber", "registrationAuthority", "qualifications"];
    const criticalChanged = (fullName !== undefined && String(fullName).trim() !== previousFullName)
      || criticalFields.some((field) =>
      doctorFields[field] !== undefined
      && JSON.stringify(doctorFields[field]) !== JSON.stringify(user.doctorProfile[field] ?? (field === "qualifications" ? [] : ""))
    );
    if (criticalChanged && ["SUSPENDED", "DISABLED"].includes(String(user.status).toUpperCase())) {
      throw new ApiError(403, "Suspended doctors must contact an administrator before changing verified credentials");
    }
    if (doctorFields.specialization !== undefined) user.doctorProfile.specialization = String(doctorFields.specialization).trim().slice(0, 120);
    if (doctorFields.hospital !== undefined) user.doctorProfile.hospital = String(doctorFields.hospital).trim().slice(0, 200);
    if (doctorFields.licenseNumber !== undefined) user.doctorProfile.licenseNumber = String(doctorFields.licenseNumber).trim().slice(0, 120);
    if (doctorFields.registrationAuthority !== undefined) user.doctorProfile.registrationAuthority = String(doctorFields.registrationAuthority).trim().slice(0, 160);
    if (doctorFields.qualifications !== undefined) user.doctorProfile.qualifications = Array.isArray(doctorFields.qualifications) ? doctorFields.qualifications.map(String).slice(0, 20) : [];
    if (doctorFields.languages !== undefined) user.doctorProfile.languages = Array.isArray(doctorFields.languages) ? doctorFields.languages.map(String).slice(0, 20) : [];
    if (doctorFields.experienceYears !== undefined) user.doctorProfile.experienceYears = Number(doctorFields.experienceYears);
    if (doctorFields.consultationFee !== undefined) user.doctorProfile.consultationFee = Number(doctorFields.consultationFee);
    if (doctorFields.bio !== undefined) user.doctorProfile.bio = String(doctorFields.bio).slice(0, 2000);
    if (criticalChanged && ["APPROVED", "ACTIVE"].includes(String(user.status).toUpperCase())) {
      user.status = "PENDING";
      user.doctorProfile.verification.status = "pending";
      user.doctorProfile.verification.submittedAt = new Date();
      user.doctorProfile.verification.rejectionReason = "";
      user.doctorProfile.verification.suspendedFromStatus = undefined;
      await logAction(user, "Doctor credentials resubmitted for verification", {
        resourceId: user._id,
        requestId: req.requestId,
      });
    } else if (criticalChanged && String(user.doctorProfile.verification?.status).toLowerCase() === "rejected") {
      user.status = "PENDING";
      user.doctorProfile.verification.status = "pending";
      user.doctorProfile.verification.submittedAt = new Date();
      user.doctorProfile.verification.rejectionReason = "";
    }
  }

  if (user.role === "PATIENT" && patientProfile) {
    if (!user.patientProfile) user.patientProfile = {};
    if (patientProfile.bloodGroup !== undefined) user.patientProfile.bloodGroup = patientProfile.bloodGroup;
    if (patientProfile.gender !== undefined) user.patientProfile.gender = patientProfile.gender;
    if (patientProfile.height_cm !== undefined) user.patientProfile.height_cm = Number(patientProfile.height_cm) || undefined;
    if (patientProfile.weight_kg !== undefined) user.patientProfile.weight_kg = Number(patientProfile.weight_kg) || undefined;
    if (patientProfile.allergies !== undefined) user.patientProfile.allergies = Array.isArray(patientProfile.allergies) ? patientProfile.allergies : patientProfile.allergies.split(",").map(a => a.trim());
    if (patientProfile.chronicConditions !== undefined) user.patientProfile.chronicConditions = Array.isArray(patientProfile.chronicConditions) ? patientProfile.chronicConditions : patientProfile.chronicConditions.split(",").map(c => c.trim());
  }

  if (user.role === "ADMIN" && adminProfile) {
    if (!user.adminProfile) user.adminProfile = {};
    if (adminProfile.title !== undefined) user.adminProfile.title = adminProfile.title;
  }

  await user.save();

  return ok(res, userProfileResponse(user), "Profile updated successfully");
});

// =========================================================
// 7. LIST APPROVED DOCTORS (accessible by all authenticated users)
// =========================================================
export const listApprovedDoctors = asyncHandler(async (req, res) => {
  const { q } = req.query;

  const filter = {
    role: { $in: ["DOCTOR", "doctor"] },
    status: { $in: ["APPROVED", "approved", "ACTIVE", "active"] },
    "doctorProfile.verification.status": { $in: ["approved", "verified"] },
  };

  if (q) {
    filter.$or = [
      { fullName: new RegExp(q, "i") },
      { "doctorProfile.specialization": new RegExp(q, "i") },
      { "doctorProfile.hospital": new RegExp(q, "i") },
    ];
  }

  const doctors = await User.find(filter)
    .select("fullName avatarUrl phone doctorProfile.specialization doctorProfile.hospital doctorProfile.experienceYears doctorProfile.consultationFee doctorProfile.rating doctorProfile.bio")
    .sort({ "doctorProfile.rating": -1 })
    .limit(100);

  return ok(res, doctors);
});

// =========================================================
// 8. LIST PATIENTS (accessible by DOCTOR and ADMIN)
// =========================================================
export const listPatients = asyncHandler(async (req, res) => {
  const { q } = req.query;

  const filter = {
    role: { $in: ["PATIENT", "patient"] },
  };

  if (q) {
    filter.$or = [
      { fullName: new RegExp(q, "i") },
      { email: new RegExp(q, "i") },
    ];
  }

  const patients = await User.find(filter)
    .select("fullName avatarUrl phone email patientProfile status createdAt")
    .sort({ createdAt: -1 })
    .limit(200);

  return ok(res, patients);
});
