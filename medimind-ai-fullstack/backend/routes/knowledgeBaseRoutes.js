import { Router } from "express";
import multer from "multer";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  approveDoc,
  getDoc,
  listDocs,
  rejectDoc,
  retryDoc,
  uploadDoc,
} from "../controllers/knowledgeBaseController.js";
import { ApiError } from "../utils/ApiError.js";

const router = Router();
router.use(requireAuth, requireRole("ADMIN"));

const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: (Number(process.env.UPLOAD_MAX_MB) || 15) * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!/\.pdf$/i.test(file.originalname)) {
      return callback(new ApiError(400, "Only PDF files are accepted."));
    }
    callback(null, true);
  },
});

function handlePdfUpload(req, res, next) {
  pdfUpload.single("file")(req, res, (error) => {
    if (!error) return next();
    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return next(new ApiError(413, `PDF exceeds the ${Number(process.env.UPLOAD_MAX_MB) || 15} MB size limit.`));
    }
    if (error instanceof multer.MulterError) {
      return next(new ApiError(400, "The PDF upload request is invalid."));
    }
    next(error);
  });
}

router.get("/", listDocs);
router.post("/upload", handlePdfUpload, uploadDoc);
router.get("/:id", getDoc);
router.patch("/:id/approve", approveDoc);
router.patch("/:id/reject", rejectDoc);
router.post("/:id/retry", retryDoc);

export default router;
