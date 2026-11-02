import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { getNearbyFacilities, searchByArea } from "../controllers/facilityController.js";

const router = Router();
router.use(requireAuth);
router.get("/nearby", getNearbyFacilities);
router.get("/search", searchByArea);

export default router;
