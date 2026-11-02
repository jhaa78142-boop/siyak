import mongoose from "mongoose";

const symptomCheckSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    symptoms: [String],
    freeText: String,
    duration: String,
    severity: Number,
    urgency: { type: String, enum: ["Low", "Medium", "High", "Emergency"], required: true },
    possibleCauses: [String],
    conditions: [
      {
        name: String,
        confidence: Number,
      },
    ],
    advice: String,
    redFlags: [String],
    source: { type: String, enum: ["groq", "rules"], default: "rules" },
    disclaimer: String,
  },
  { timestamps: true }
);

export default mongoose.model("SymptomCheck", symptomCheckSchema);
