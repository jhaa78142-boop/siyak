import mongoose from "mongoose";

const notificationChannels = () => ({
  email: { type: Boolean, default: true },
  push: { type: Boolean, default: false },
  sms: { type: Boolean, default: false },
});

const notificationPreferenceSchema = new mongoose.Schema(
  {
    "welcome-registration": notificationChannels(),
    "email-verification": notificationChannels(),
    "password-reset": notificationChannels(),
    "appointment-confirmed": notificationChannels(),
    "appointment-updated": notificationChannels(),
    "appointment-reminder": notificationChannels(),
    "medicine-reminder": { email: { type: Boolean, default: true }, push: { type: Boolean, default: true }, sms: { type: Boolean, default: false } },
    "report-ready": notificationChannels(),
    "emergency-alert": notificationChannels(),
    "monthly-health-report": { email: { type: Boolean, default: false }, push: { type: Boolean, default: false }, sms: { type: Boolean, default: false } },
    "prescription-ready": notificationChannels(),
    "doctor-verification": notificationChannels(),
    "report-shared": notificationChannels(),
    "report-reviewed": notificationChannels(),
    system: notificationChannels(),
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, index: true },
    firebaseUids: { type: [String], default: [], index: true },
    username: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    role: { type: String, enum: ["PATIENT", "DOCTOR", "ADMIN"], required: true, index: true },
    status: { 
      type: String, 
      enum: ["ACTIVE", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"], 
      required: true 
    },
    emailVerified: { type: Boolean, default: false },
    phone: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    notificationPreferences: { type: notificationPreferenceSchema, default: () => ({}) },
    notificationConsents: {
      monthlyHealthReport: { granted: { type: Boolean, default: false }, grantedAt: Date },
    },
    notificationTimezone: { type: String, default: "Asia/Kolkata" },
    firebaseMessagingTokens: { type: [String], default: [] },
    
    // --- Patient-specific fields (from Registration Form spec) ---
    patientProfile: {
      dateOfBirth: Date,
      gender: { type: String, enum: ["Male", "Female", "Other", ""], default: "" },
      bloodGroup: String,
      height_cm: Number,
      weight_kg: Number,
      allergies: [String],
      chronicConditions: [String],
      currentMedications: [String],
      healthScore: { type: Number, default: 70 },
      emergencyContact: {
        name: String,
        number: String,
        relationship: String
      }
    },

    // --- Doctor-specific fields ---
    doctorProfile: {
      specialization: String,
      hospital: String,
      licenseNumber: String,
      qualifications: { type: [String], default: [] },
      registrationAuthority: String,
      languages: { type: [String], default: [] },
      experienceYears: Number,
      consultationFee: Number,
      rating: { type: Number, default: 0 },
      ratingCount: { type: Number, default: 0 },
      bio: String,
      verificationDocuments: [{
        storagePath: { type: String, required: true },
        fileName: { type: String, required: true },
        mimeType: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
      }],
      availability: {
        timezone: { type: String, default: "Asia/Kolkata" },
        slotDurationMinutes: { type: Number, default: 30 },
        workingDays: [{
          dayOfWeek: { type: Number, min: 0, max: 6 },
          startTime: String,
          endTime: String,
          breaks: [{ startTime: String, endTime: String }],
        }],
        leaveDates: [Date],
      },
      verification: {
        status: { type: String, enum: ["draft", "pending", "approved", "verified", "rejected", "suspended"], default: "pending" },
        submittedAt: Date,
        reviewedAt: Date,
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        rejectionReason: String,
        suspendedFromStatus: { type: String, enum: ["draft", "pending", "approved", "verified", "rejected"] },
      },
    },

    // --- Admin-specific fields ---
    adminProfile: {
      title: { type: String, default: "Platform Administrator" },
      permissions: [String],
    },

    homeLocation: {
      lat: Number,
      lng: Number,
      address: String,
    },

    lastLoginAt: Date,
  },
  { timestamps: true }
);

userSchema.index({ role: 1, "doctorProfile.specialization": 1 });

export default mongoose.model("User", userSchema);
