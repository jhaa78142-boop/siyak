import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: String, required: true }, // email or "system"
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    resourceId: { type: String },
    outcome: { type: String, enum: ["allowed", "denied", "completed", "failed"], default: "completed" },
    requestId: { type: String, index: true },
    meta: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
