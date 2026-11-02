import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { listArticles, createArticle } from "../controllers/educationController.js";

const router = Router();
router.use(requireAuth);

router.get("/", listArticles);
router.post("/", requireRole("admin", "doctor"), createArticle);

export default router;
