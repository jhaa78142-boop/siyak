import mongoose from "mongoose";

const passwordResetOTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  otpHash: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 5 * 60 * 1000), // 5 minutes validity
    expires: 300, // MongoDB TTL index (expires after 5 minutes / 300 seconds)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("PasswordResetOTP", passwordResetOTPSchema);
