import { Router } from "express";
import { requireAuth, requireActiveAccount } from "../middleware/auth.js";
import {
  listDoctors,
  bookAppointment,
  listMyAppointments,
  updateAppointmentStatus,
} from "../controllers/appointmentController.js";

const router = Router();
router.use(requireAuth, requireActiveAccount);

router.get("/doctors", listDoctors);
router.post("/", bookAppointment);
router.get("/", listMyAppointments);
router.patch("/:id/status", updateAppointmentStatus);

export default router;
