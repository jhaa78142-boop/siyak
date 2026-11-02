import { Router } from "express";
import multer from "multer";
import { medicalUploadLimiter } from "../middleware/sensitiveRateLimit.js";
import { requireAuth, requireActiveAccount, requireRole, requireApprovedDoctor } from "../middleware/auth.js";
import {
  createPrescription, updatePrescriptionDraft, finalizePrescription, amendPrescription, listPrescriptions,
  uploadExistingPrescription, downloadUploadedPrescription,
  listFollowUps, createFollowUp, updateFollowUp,
} from "../controllers/prescriptionController.js";

const router = Router();
const prescriptionUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: (Number(process.env.UPLOAD_MAX_MB) || 15) * 1024 * 1024 },
});
router.use(requireAuth, requireActiveAccount);

router.post("/uploads", medicalUploadLimiter, requireRole("DOCTOR"), requireApprovedDoctor, prescriptionUpload.single("file"), uploadExistingPrescription);
router.get("/:id/document", downloadUploadedPrescription);
router.post("/", requireRole("DOCTOR"), requireApprovedDoctor, createPrescription);
router.patch("/:id", requireRole("DOCTOR"), requireApprovedDoctor, updatePrescriptionDraft);
router.patch("/:id/finalize", requireRole("DOCTOR"), requireApprovedDoctor, finalizePrescription);
router.patch("/:id/amend", requireRole("DOCTOR"), requireApprovedDoctor, amendPrescription);
router.get("/", listPrescriptions);
router.get("/follow-ups", listFollowUps);
router.post("/follow-ups", requireRole("DOCTOR"), requireApprovedDoctor, createFollowUp);
router.patch("/follow-ups/:id", requireRole("DOCTOR"), requireApprovedDoctor, updateFollowUp);

export default router;
