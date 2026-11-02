import { Router } from "express";
import { requireAuth, requireActiveAccount, requireApprovedDoctor, requireRole } from "../middleware/auth.js";
import multer from "multer";
import { upload } from "../middleware/upload.js";
import { ApiError } from "../utils/ApiError.js";
import { clinicalAiLimiter, medicalUploadLimiter } from "../middleware/sensitiveRateLimit.js";
import {
  symptomCheck,
  drugInteractionCheck, listDrugInteractionLog,
  chatSend, chatSendStream, chatHistory, chatReset, textToSpeech,
  uploadReport, listReports,
  downloadPatientReport,
  generateSummary, listSummaries, reviewSummary,
} from "../controllers/aiController.js";

const router = Router();
router.use(requireAuth, requireActiveAccount);

function handleReportUpload(req, res, next) {
  upload.single("file")(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return next(new ApiError(413, `Document exceeds the ${Number(process.env.UPLOAD_MAX_MB) || 15} MB size limit.`));
    }
    if (error instanceof multer.MulterError) {
      return next(new ApiError(400, "The document upload request is invalid."));
    }
    if (error.message?.startsWith("Unsupported file type:")) {
      return next(new ApiError(415, "Upload a PDF, PNG, JPG, or WEBP document."));
    }
    return next(error);
  });
}

router.post("/symptom-check", clinicalAiLimiter, symptomCheck);

router.post("/drug-interactions", clinicalAiLimiter, drugInteractionCheck);
router.get("/drug-interactions/log", listDrugInteractionLog);

router.post("/chat/stream", clinicalAiLimiter, chatSendStream);
router.post("/chat", clinicalAiLimiter, chatSend);
router.get("/chat", chatHistory);
router.delete("/chat", chatReset);
router.post("/speech", clinicalAiLimiter, textToSpeech);

router.post("/reports", medicalUploadLimiter, requireRole("PATIENT"), handleReportUpload, uploadReport);
router.get("/reports", listReports);
router.get("/reports/:id/file", requireRole("PATIENT"), downloadPatientReport);

router.post("/summary", clinicalAiLimiter, requireApprovedDoctor, generateSummary);
router.get("/summary", requireApprovedDoctor, listSummaries);
router.patch("/summary/:id/review", requireApprovedDoctor, reviewSummary);

export default router;
