import mongoose from "mongoose";

// Population-level anomaly alerts surfaced on the admin "Early Warning" page.
const earlyWarningSchema = new mongoose.Schema(
  {
    level: { type: String, enum: ["Low", "Medium", "High"], required: true },
    title: { type: String, required: true },
    detail: String,
    zone: String,
    acknowledged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("EarlyWarning", earlyWarningSchema);
