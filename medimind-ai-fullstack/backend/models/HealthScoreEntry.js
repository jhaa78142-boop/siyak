import mongoose from "mongoose";

const healthScoreEntrySchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    breakdown: {
      activity: Number,
      sleep: Number,
      nutrition: Number,
      vitals: Number,
      adherence: Number,
    },
    computedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("HealthScoreEntry", healthScoreEntrySchema);
