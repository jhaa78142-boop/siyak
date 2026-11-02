import mongoose from "mongoose";

// Uploaded lab report / scan for the Report Analyzer + AI Summary features.
const reportSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: String,
    fileSizeBytes: Number,
    reportType: { type: String, enum: ["Lab", "Imaging", "Prescription", "Other"], default: "Lab" },
    analysis: {
      status: { type: String, enum: ["pending", "processing", "done", "failed"], default: "pending" },
      summary: String,
      plainLanguage: String,
      documentKind: String,
      findings: [
        {
          name: String,
          value: String,
          unit: String,
          referenceRange: String,
          status: { type: String, enum: ["normal", "high", "low", "abnormal", "unknown"], default: "unknown" },
        },
      ],
      medications: [
        {
          name: String,
          dose: String,
          frequency: String,
          duration: String,
          instructions: String,
        },
      ],
      meta: {
        patientName: String,
        reportDate: String,
        facility: String,
        doctorName: String,
      },
      flags: [
        {
          label: String,
          severity: { type: String, enum: ["info", "warn", "critical"], default: "info" },
          detail: String,
        },
      ],
      rawExtractedText: String,
      source: String,
      disclaimer: String,
      error: String,
      processedAt: Date,
    },
    imaging: {
      subType: { type: String, enum: ["xray", "mri"] },
      label: String,
      confidence: Number,
      modelId: String,
      disclaimer: String,
      status: { type: String, enum: ["pending", "processing", "done", "failed", "unavailable"] },
      message: String,
    },
    doctorReview: {
      status: {
        type: String,
        enum: ["awaiting_review", "in_review", "needs_clarification", "reviewed"],
        default: "awaiting_review",
      },
      aiDraftDecision: { type: String, enum: ["pending", "accepted", "edited", "rejected"], default: "pending" },
      reviewedSummary: String,
      reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reviewedAt: Date,
      history: [{
        action: { type: String, required: true },
        previousValue: String,
        newValue: String,
        reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        occurredAt: { type: Date, default: Date.now },
      }],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
