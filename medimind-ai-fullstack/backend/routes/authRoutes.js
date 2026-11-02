import { Router } from "express";
import { requireAuth, requireRole, requireActiveAccount } from "../middleware/auth.js";
import { 
  registerPatient, 
  registerDoctor, 
  getMe, 
  sendOtp, 
  verifyOtp,
  resetPassword,
  syncUser,
  updateProfile,
  listApprovedDoctors,
  listPatients,
  lookupUsername,
  googleSync,
} from "../controllers/authController.js";

const router = Router();

// Public routes (no Firebase token required)
router.post("/forgot-password/send-otp", sendOtp);
router.post("/forgot-password/verify-otp", verifyOtp);
router.post("/forgot-password/reset", resetPassword);
router.post("/lookup-username", lookupUsername);  // ← Username/Email → profile lookup for login

// Routes requiring Firebase ID Token
router.use(requireAuth);
router.post("/sync", syncUser);                   // ← General Signup page
router.post("/google-sync", googleSync);          // ← Google login: link/verify existing account
router.post("/patient/register", registerPatient);
router.post("/doctor/register", registerDoctor);
router.get("/me", getMe);
router.patch("/profile", updateProfile);          // ← Edit profile & avatar for all roles
router.get("/doctors", listApprovedDoctors);      // ← Any auth user: browse approved doctors
router.get("/patients", requireRole("ADMIN"), requireActiveAccount, listPatients);

export default router;
