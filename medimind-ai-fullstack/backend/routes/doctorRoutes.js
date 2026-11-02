import { Router } from "express";
import multer from "multer";
import { requireAuth, requireActiveAccount, requireApprovedDoctor, requireRole } from "../middleware/auth.js";
import {
  doctorDashboard,
  listMyPatients,
  getPatientDetail,
  sharedPatientReports,
  todaysSchedule,
  updateAvailability,
  uploadVerificationDocument,
  downloadVerificationDocument,
} from "../controllers/doctorController.js";
import { downloadSharedReport, updateReportReview } from "../controllers/doctorReportController.js";
import { medicalUploadLimiter } from "../middleware/sensitiveRateLimit.js";

const router = Router();
const verificationUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: (Number(process.env.UPLOAD_MAX_MB) || 15) * 1024 * 1024 },
});
router.use(requireAuth, requireRole("DOCTOR"), requireActiveAccount);

router.get("/verification-documents/:documentId", downloadVerificationDocument);
router.post("/verification-documents", medicalUploadLimiter, verificationUpload.single("file"), uploadVerificationDocument);
router.put("/availability", updateAvailability);
router.get("/dashboard", requireApprovedDoctor, doctorDashboard);
router.get("/patients", requireApprovedDoctor, listMyPatients);
router.get("/patients/:id", requireApprovedDoctor, getPatientDetail);
router.get("/patients/:id/shared-reports", requireApprovedDoctor, sharedPatientReports);
router.get("/schedule/today", requireApprovedDoctor, todaysSchedule);
router.get("/reports/:reportId/file", requireApprovedDoctor, downloadSharedReport);
router.patch("/reports/:reportId/review", requireApprovedDoctor, updateReportReview);

export default router;
