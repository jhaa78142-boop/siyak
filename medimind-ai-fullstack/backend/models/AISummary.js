import mongoose from "mongoose";

// Doctor-facing AI-generated patient summary (pre-consultation brief).
const aiSummarySchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
    summaryText: { type: String, required: true },
    highlights: [String],
    sourceReports: [{ type: mongoose.Schema.Types.ObjectId, ref: "Report", required: true }],
    sourceReferences: [{ report: { type: mongoose.Schema.Types.ObjectId, ref: "Report" }, label: String }],
    missingInformation: { type: [String], default: [] },
    label: { type: String, default: "AI draft — doctor review required" },
    reviewStatus: { type: String, enum: ["draft", "approved", "edited", "rejected"], default: "draft" },
    doctorApprovedText: String,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    reviewHistory: [{
      action: { type: String, required: true },
      previousValue: String,
      newValue: String,
      reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      occurredAt: { type: Date, default: Date.now },
    }],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("AISummary", aiSummarySchema);
