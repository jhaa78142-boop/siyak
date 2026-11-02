import mongoose from "mongoose";

const timelineEventSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: {
      type: String,
      enum: ["Report", "Appointment", "Prescription", "Symptom", "Vaccination", "Reminder", "Other"],
      required: true,
    },
    title: { type: String, required: true },
    detail: String,
    tone: { type: String, enum: ["good", "warn", "neutral", "bad"], default: "neutral" },
    refId: mongoose.Schema.Types.ObjectId, // optional pointer to the source doc (report/appointment/etc.)
    occurredAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("TimelineEvent", timelineEventSchema);
