import mongoose from "mongoose";

// One row per day/reading for HR / SpO2 / sleep / BP etc. Powers vitalsHistory
// and healthScoreTrend charts on the patient dashboard.
const vitalsEntrySchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recordedAt: { type: Date, default: Date.now, index: true },
    heartRate: Number,
    spo2: Number,
    sleepHours: Number,
    systolicBp: Number,
    diastolicBp: Number,
    weight_kg: Number,
    bloodGlucose: Number,
    source: { type: String, enum: ["manual", "device", "ai-estimate"], default: "manual" },
  },
  { timestamps: true }
);

export default mongoose.model("VitalsEntry", vitalsEntrySchema);
