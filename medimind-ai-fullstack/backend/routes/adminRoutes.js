import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  dashboardStats, userGrowth,
  listUsers, setUserStatus,
  listPendingDoctors,
  listAuditLog,
  listEarlyWarnings, createEarlyWarning, acknowledgeEarlyWarning,
  aiQualityBreakdown,
  createAdmin, approveDoctor, rejectDoctor, suspendDoctor
} from "../controllers/adminController.js";
import { downloadVerificationDocument } from "../controllers/doctorController.js";

const router = Router();
router.use(requireAuth, requireRole("ADMIN"));

router.get("/stats", dashboardStats);
router.get("/user-growth", userGrowth);
router.get("/ai-quality", aiQualityBreakdown);

router.get("/users", listUsers);
router.patch("/users/:id/status", setUserStatus);

router.post("/create", createAdmin); // Add missing /create

router.get("/doctors/pending", listPendingDoctors);
router.get("/doctors/:doctorId/verification-documents/:documentId", downloadVerificationDocument);
router.patch("/doctors/:id/approve", approveDoctor);
router.patch("/doctors/:id/reject", rejectDoctor);
router.patch("/doctors/:id/suspend", suspendDoctor);
router.patch("/doctors/:id/verification", (req, res, next) => {
  if (req.body.approve) {
    return approveDoctor(req, res, next);
  } else {
    return rejectDoctor(req, res, next);
  }
});

router.get("/audit-log", listAuditLog);

router.get("/early-warnings", listEarlyWarnings);
router.post("/early-warnings", createEarlyWarning);
router.patch("/early-warnings/:id/ack", acknowledgeEarlyWarning);

export default router;
