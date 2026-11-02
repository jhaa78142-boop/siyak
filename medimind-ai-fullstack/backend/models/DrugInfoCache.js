import mongoose from "mongoose";

const drugInfoCacheSchema = new mongoose.Schema(
  {
    drugName: { type: String, required: true, lowercase: true, trim: true, index: true },
    data: mongoose.Schema.Types.Mixed,
    fetchedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("DrugInfoCache", drugInfoCacheSchema);
