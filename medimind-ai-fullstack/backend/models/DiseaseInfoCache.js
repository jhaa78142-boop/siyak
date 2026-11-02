import mongoose from "mongoose";

const diseaseInfoCacheSchema = new mongoose.Schema(
  {
    term: { type: String, required: true, lowercase: true, trim: true, index: true },
    data: mongoose.Schema.Types.Mixed,
    fetchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("DiseaseInfoCache", diseaseInfoCacheSchema);
