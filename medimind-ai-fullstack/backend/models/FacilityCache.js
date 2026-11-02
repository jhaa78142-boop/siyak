import mongoose from "mongoose";

const facilityCacheSchema = new mongoose.Schema(
  {
    cacheKey: { type: String, required: true, unique: true, index: true },
    data: mongoose.Schema.Types.Mixed,
    fetchedAt: { type: Date, default: Date.now, index: { expireAfterSeconds: 3600 } },
  },
  { timestamps: true }
);

export default mongoose.model("FacilityCache", facilityCacheSchema);
