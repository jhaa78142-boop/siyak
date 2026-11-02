import mongoose from "mongoose";

const knowledgeBaseChunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KnowledgeBaseDoc",
      required: true,
    },
    chunkIndex: { type: Number, required: true },
    pageNumber: { type: Number, default: 1 },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

knowledgeBaseChunkSchema.index({ documentId: 1, chunkIndex: 1 }, { unique: true });
knowledgeBaseChunkSchema.index({ content: "text" });

export default mongoose.model("KnowledgeBaseChunk", knowledgeBaseChunkSchema);
