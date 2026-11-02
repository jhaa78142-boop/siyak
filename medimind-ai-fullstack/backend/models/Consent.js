import mongoose from "mongoose";

const consentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reports: [{ type: mongoose.Schema.Types.ObjectId, ref: "Report" }],
    purpose: { type: String, required: true },
    durationDays: { type: Number, required: true },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["active", "revoked", "expired"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

// Middleware to check expiration before saving or querying
consentSchema.pre("save", function (next) {
  if (this.expiresAt < new Date()) {
    this.status = "expired";
  }
  next();
});

export default mongoose.model("Consent", consentSchema);
