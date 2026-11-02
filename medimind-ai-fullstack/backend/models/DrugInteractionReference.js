import mongoose from "mongoose";

// Static reference table the interaction checker matches against.
// Seed with `npm run seed`. Extend this over time (or swap for an OpenFDA /
// RxNorm sync job) instead of hardcoding pairs in application code.
const drugInteractionReferenceSchema = new mongoose.Schema(
  {
    drugA: { type: String, required: true, lowercase: true, trim: true, index: true },
    drugB: { type: String, required: true, lowercase: true, trim: true, index: true },
    severity: { type: String, enum: ["Low", "Medium", "High"], required: true },
    note: { type: String, required: true },
    source: { type: String, default: "Internal reference set" },
  },
  { timestamps: true }
);

drugInteractionReferenceSchema.index({ drugA: 1, drugB: 1 }, { unique: true });

export default mongoose.model("DrugInteractionReference", drugInteractionReferenceSchema);
