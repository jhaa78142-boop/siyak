import mongoose from "mongoose";

const medicineReminderSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    dosage: String,
    timesOfDay: [String], // e.g. ["08:00", "21:00"]
    frequency: { type: String, enum: ["daily", "weekly", "as-needed"], default: "daily" },
    weeklyDay: String, // for weekly frequency, e.g. "Sunday"
    stockRemaining: { type: Number, default: 0 },
    stockTotal: { type: Number, default: 0 },
    refillThreshold: { type: Number, default: 5 },
    active: { type: Boolean, default: true },
    log: [
      {
        date: { type: Date, default: Date.now },
        taken: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("MedicineReminder", medicineReminderSchema);
