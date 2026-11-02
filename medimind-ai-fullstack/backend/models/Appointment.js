import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    scheduledAt: { type: Date, required: true },
    proposedAt: { type: Date },
    durationMinutes: { type: Number, default: 30, min: 1, max: 1440 },
    heldSlotKeys: { type: [String], default: [] },
    history: [{
      action: { type: String, required: true },
      fromStatus: String,
      toStatus: String,
      actor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      occurredAt: { type: Date, default: Date.now },
      reason: String,
      fromTime: Date,
      toTime: Date,
    }],
    mode: { type: String, enum: ["Video", "In-person", "Phone"], default: "Video" },
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "InProgress", "RescheduleProposed", "Rejected", "Completed", "Cancelled", "No-show"],
      default: "Pending",
      index: true,
    },
    notes: { type: String, default: "" },
    cancelReason: String,
  },
  { timestamps: true }
);

appointmentSchema.index({ heldSlotKeys: 1 }, { unique: true, sparse: true });
appointmentSchema.index({ doctor: 1, scheduledAt: 1, status: 1 });
appointmentSchema.index({ patient: 1, scheduledAt: 1, status: 1 });

export default mongoose.model("Appointment", appointmentSchema);
