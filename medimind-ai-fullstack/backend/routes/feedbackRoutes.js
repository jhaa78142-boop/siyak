import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { submitFeedback, listFeedback } from "../controllers/feedbackController.js";

const router = Router();
router.use(requireAuth);

router.post("/", submitFeedback);
router.get("/", requireRole("admin"), listFeedback);

export default router;
