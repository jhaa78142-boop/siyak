import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { findNearbyFacilities, searchFacilitiesByArea } from "../services/facilityService.js";

export const getNearbyFacilities = asyncHandler(async (req, res) => {
  let { lat, lng, radius } = req.query;
  if ((lat == null || lng == null) && req.user?.homeLocation?.lat != null && req.user?.homeLocation?.lng != null) {
    lat = req.user.homeLocation.lat;
    lng = req.user.homeLocation.lng;
  }
  if (lat == null || lng == null) {
    throw new ApiError(400, "Provide lat/lng query params or set a home location in your profile.");
  }
  const result = await findNearbyFacilities(lat, lng, radius ? Number(radius) : undefined);
  if (!result.success) throw new ApiError(503, result.error || "Facility lookup service is temporarily unavailable. Please try again.");
  return res.status(200).json({
    success: true,
    message: "OK",
    data: result.facilities,
    usedRadius: result.usedRadius ?? undefined,
  });
});

export const searchByArea = asyncHandler(async (req, res) => {
  const { q, radius } = req.query;
  if (!q || !String(q).trim()) {
    throw new ApiError(400, "Provide a 'q' query parameter with a location name, area, or address.");
  }
  const result = await searchFacilitiesByArea(q, radius ? Number(radius) : undefined);
  if (!result.success) throw new ApiError(503, result.error || "Location search failed. Please try again.");
  return res.status(200).json({
    success: true,
    message: "OK",
    data: result.facilities,
    usedRadius: result.usedRadius ?? undefined,
    geocoded: result.geocoded ?? null,
  });
});
