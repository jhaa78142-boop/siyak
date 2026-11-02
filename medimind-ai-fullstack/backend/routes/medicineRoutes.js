import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { createReminder, listReminders, markTaken, updateReminder, deleteReminder } from "../controllers/medicineController.js";

const router = Router();
router.use(requireAuth);

router.post("/", createReminder);
router.get("/", listReminders);
router.post("/:id/taken", markTaken);
router.patch("/:id", updateReminder);
router.delete("/:id", deleteReminder);

export default router;
