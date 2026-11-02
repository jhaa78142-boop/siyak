import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "ai"], required: true },
    text: { type: String, required: true },
    // Explainability payload (why this answer was given) for AI turns.
    explanation: { type: mongoose.Schema.Types.Mixed, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// AI Chat (patient) and AI Patient Summary source data (doctor-facing) both
// read/write here.
const chatConversationSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    messages: [messageSchema],
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("ChatConversation", chatConversationSchema);
