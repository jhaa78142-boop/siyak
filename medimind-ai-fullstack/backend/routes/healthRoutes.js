import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  addVitals, listVitals,
  recordHealthScore, listHealthScoreTrend,
  addTimelineEvent, listTimeline,
} from "../controllers/healthController.js";

const router = Router();
router.use(requireAuth);

router.post("/vitals", addVitals);
router.get("/vitals", listVitals);
router.post("/score", recordHealthScore);
router.get("/score", listHealthScoreTrend);
router.post("/timeline", addTimelineEvent);
router.get("/timeline", listTimeline);

export default router;
