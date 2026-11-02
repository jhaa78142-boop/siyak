import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", index: true },
    appointmentScheduledAt: Date,
    triggerType: {
      type: String,
      enum: [
        "welcome-registration",
        "email-verification",
        "password-reset",
        "appointment-confirmed",
        "appointment-updated",
        "appointment-reminder",
        "medicine-reminder",
        "report-ready",
        "emergency-alert",
        "monthly-health-report",
        "prescription-ready",
        "doctor-verification",
        "report-shared",
        "report-reviewed",
        "system",
      ],
      required: true,
      index: true,
    },
    channel: { type: String, enum: ["email", "push", "sms", "in-app"], required: true },
    type: { type: String },
    title: { type: String, required: true },
    body: { type: String, default: "" },
    emailHtml: { type: String, select: false },
    scheduledAt: { type: Date, required: true, default: Date.now, index: true },
    sentAt: { type: Date, default: null },
    deliveryStatus: {
      type: String,
      enum: ["queued", "processing", "sent", "failed", "skipped"],
      default: "queued",
      index: true,
    },
    retryCount: { type: Number, default: 0 },
    nextAttemptAt: { type: Date, default: Date.now, index: true },
    errorMessage: { type: String, default: "" },
    userPreference: { type: Boolean, default: true },
    mandatory: { type: Boolean, default: false },
    consentRequirement: { type: String, default: "" },
    consentGranted: { type: Boolean, default: true },
    idempotencyKey: { type: String, unique: true, sparse: true },
    read: { type: Boolean, default: false },
    emailStatus: { type: String, enum: ["not-sent", "sent", "failed"], default: "not-sent" },
  },
  { timestamps: true }
);

notificationSchema.index({ deliveryStatus: 1, scheduledAt: 1, nextAttemptAt: 1 });

export default mongoose.model("Notification", notificationSchema);
