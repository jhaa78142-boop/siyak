import { ApiError } from "./ApiError.js";

export function assertApprovedDoctor(user) {
  if (!user) throw new ApiError(401, "Not authenticated");
  if (String(user.role).toUpperCase() !== "DOCTOR") {
    throw new ApiError(403, "This action requires the doctor role");
  }

  const accountStatus = String(user.status || "").toUpperCase();
  const verificationStatus = String(user.doctorProfile?.verification?.status || "").toLowerCase();
  if (accountStatus === "SUSPENDED" || verificationStatus === "suspended") {
    throw new ApiError(403, "Doctor access is suspended");
  }
  if (!["APPROVED", "ACTIVE"].includes(accountStatus)
      || !["approved", "verified"].includes(verificationStatus)) {
    throw new ApiError(403, "Doctor verification approval is required");
  }
}
