import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getDrugInfo } from "../controllers/drugInfoController.js";

const router = Router();
router.use(requireAuth);
router.get("/:name", getDrugInfo);

export default router;
