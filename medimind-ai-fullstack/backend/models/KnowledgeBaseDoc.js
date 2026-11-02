import mongoose from "mongoose";

const knowledgeBaseDocSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    originalFilename: { type: String, required: true, maxlength: 255 },
    sourceOrganization: { type: String, required: true, trim: true, maxlength: 200 },
    sourceUrl: { type: String, default: "", maxlength: 2048 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    language: { type: String, required: true, trim: true, maxlength: 60 },
    version: { type: String, default: "", maxlength: 100 },
    publicationDate: { type: Date, default: null },
    description: { type: String, default: "", maxlength: 1000 },
    cloudinaryAssetId: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: true },
    cloudinaryResourceType: { type: String, default: "raw" },
    cloudinaryFormat: { type: String, default: "pdf" },
    fileSize: { type: Number, required: true },
    chunks: { type: Number, default: 0 },
    processingStage: {
      type: String,
      enum: ["", "downloading", "extracting", "ocr", "chunking", "embedding", "indexing"],
      default: "",
    },
    processingCompleted: { type: Number, default: 0 },
    processingTotal: { type: Number, default: 0 },
    processingPass: { type: Number, default: 0 },
    processingUpdatedAt: { type: Date, default: null },
    searchBackend: { type: String, enum: ["chroma", "mongodb", ""], default: "" },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "PROCESSING", "INDEXED", "REJECTED", "FAILED"],
      default: "PENDING",
      index: true,
    },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: "" },
    processingError: { type: String, default: "" },
    indexedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

knowledgeBaseDocSchema.index({ status: 1, category: 1, createdAt: -1 });

export default mongoose.model("KnowledgeBaseDoc", knowledgeBaseDocSchema);
