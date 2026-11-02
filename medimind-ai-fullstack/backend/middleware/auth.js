import admin, { isFirebaseReady } from "../config/firebaseAdmin.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/User.js";
import { assertApprovedDoctor } from "../utils/doctorAccess.js";

/**
 * Verifies the Firebase ID token sent as `Authorization: Bearer <token>`,
 * loads (or lazily creates) the matching Mongo user profile, and attaches
 * both to req.firebaseUser / req.user.
 */
export const requireAuth = asyncHandler(async (req, res, next) => {
  if (!isFirebaseReady()) {
    throw new ApiError(
      503,
      "Auth is not configured yet on the server: missing Firebase service account key. See backend/README.md."
    );
  }

  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, "Missing Authorization bearer token");
  }

  let decoded;
  try {
    decoded = await admin.auth().verifyIdToken(token);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired auth token");
  }

  req.firebaseUser = decoded;

  const emailLookup = (decoded.email || "").toLowerCase();
  let user = await User.findOne({
    $or: [{ firebaseUid: decoded.uid }, { firebaseUids: decoded.uid }],
  });

  if (!user && decoded.email_verified === true && emailLookup) {
    user = await User.findOne({ email: emailLookup });
  }

  if (user) {
    // If user's firebaseUids doesn't have this provider UID, link it seamlessly
    if (!user.firebaseUids) user.firebaseUids = [];
    if (user.firebaseUid !== decoded.uid && !user.firebaseUids.includes(decoded.uid)) {
      user.firebaseUids.push(decoded.uid);
      await user.save();
    }
  }
  
  req.user = user;
  next();
});

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, "Not authenticated"));
  }
  const allowedRoles = roles.map((role) => String(role).toUpperCase());
  if (!allowedRoles.includes(String(req.user.role).toUpperCase())) {
    return next(new ApiError(403, `This action requires role: ${roles.join(" or ")}`));
  }
  next();
};

export const requireActiveAccount = (req, res, next) => {
  if (!req.user) return next(new ApiError(401, "Not authenticated"));
  if (["SUSPENDED", "DISABLED"].includes(String(req.user.status || "").toUpperCase())) {
    return next(new ApiError(403, "This account is suspended"));
  }
  next();
};

export { assertApprovedDoctor };

export const requireApprovedDoctor = (req, res, next) => {
  try {
    assertApprovedDoctor(req.user);
  } catch (error) {
    return next(error);
  }
  next();
};
