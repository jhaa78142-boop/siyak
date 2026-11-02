import mongoose from "mongoose";

const followUpSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    prescription: { type: mongoose.Schema.Types.ObjectId, ref: "Prescription" },
    dueDate: { type: Date, required: true },
    reason: String,
    status: { type: String, enum: ["Scheduled", "Completed", "Missed"], default: "Scheduled" },
  },
  { timestamps: true }
);

export default mongoose.model("FollowUp", followUpSchema);
