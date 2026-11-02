import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getDiseaseInfo } from "../controllers/diseaseInfoController.js";

const router = Router();
router.use(requireAuth);
router.get("/:term", getDiseaseInfo);

export default router;
