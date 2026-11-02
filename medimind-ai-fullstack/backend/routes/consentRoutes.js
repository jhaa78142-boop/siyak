import { Router } from "express";
import { requireAuth, requireActiveAccount } from "../middleware/auth.js";
import {
  createConsent,
  listPatientConsents,
  revokeConsent,
  listSharedWithMe,
} from "../controllers/consentController.js";

const router = Router();
router.use(requireAuth, requireActiveAccount);

router.post("/", createConsent);
router.get("/patient", listPatientConsents);
router.patch("/:id/revoke", revokeConsent);
router.get("/doctor", listSharedWithMe);

export default router;
