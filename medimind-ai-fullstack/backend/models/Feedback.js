import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    note: { type: String, default: "" },
    context: { type: String, default: "" }, // e.g. "report-analyzer", "ai-chat"
  },
  { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
