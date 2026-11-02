import mongoose from "mongoose";

const noteFields = {
  chiefComplaint: { type: String, default: "" },
  symptoms: { type: String, default: "" },
  history: { type: String, default: "" },
  observations: { type: String, default: "" },
  assessment: { type: String, default: "" },
  plan: { type: String, default: "" },
  advice: { type: String, default: "" },
  followUp: { type: String, default: "" },
};

const consultationSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true, index: true },
    ...noteFields,
    status: { type: String, enum: ["draft", "finalized", "amended"], default: "draft", index: true },
    finalizedAt: Date,
    finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amendments: [{
      ...noteFields,
      version: { type: Number, required: true },
      reason: { type: String, required: true },
      amendedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      amendedAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

consultationSchema.index({ doctor: 1, patient: 1, createdAt: -1 });

export default mongoose.model("Consultation", consultationSchema);
