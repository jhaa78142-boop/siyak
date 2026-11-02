import { Router } from "express";
import { requireActiveAccount, requireApprovedDoctor, requireAuth, requireRole } from "../middleware/auth.js";
import {
  amendConsultation,
  createConsultation,
  finalizeConsultation,
  listConsultations,
  updateConsultationDraft,
} from "../controllers/consultationController.js";

const router = Router();
router.use(requireAuth, requireActiveAccount);
router.get("/", listConsultations);
router.post("/", requireRole("DOCTOR"), requireApprovedDoctor, createConsultation);
router.patch("/:id", requireRole("DOCTOR"), requireApprovedDoctor, updateConsultationDraft);
router.patch("/:id/finalize", requireRole("DOCTOR"), requireApprovedDoctor, finalizeConsultation);
router.patch("/:id/amend", requireRole("DOCTOR"), requireApprovedDoctor, amendConsultation);

export default router;
