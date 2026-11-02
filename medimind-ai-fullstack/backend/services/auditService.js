import AuditLog from "../models/AuditLog.js";

export async function logAction(actorUser, action, meta = {}) {
  await AuditLog.create({
    actor: actorUser?.email || "system",
    actorId: actorUser?._id,
    action,
    resourceId: meta.resourceId ? String(meta.resourceId) : undefined,
    outcome: ["allowed", "denied", "completed", "failed"].includes(meta.outcome) ? meta.outcome : "completed",
    requestId: meta.requestId || undefined,
    meta: Object.fromEntries(
      Object.entries(meta).filter(([key]) => !["resourceId", "outcome", "requestId"].includes(key))
    ),
  });
}
