import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  getNotificationPreferences,
  listNotifications,
  markNotificationRead,
  registerPushToken,
  removePushToken,
  updateNotificationPreferences,
} from "../controllers/notificationController.js";

const router = Router();
router.use(requireAuth);

router.get("/", listNotifications);
router.patch("/:id/read", markNotificationRead);
router.get("/preferences", getNotificationPreferences);
router.patch("/preferences", updateNotificationPreferences);
router.post("/push-token", registerPushToken);
router.delete("/push-token", removePushToken);

export default router;
