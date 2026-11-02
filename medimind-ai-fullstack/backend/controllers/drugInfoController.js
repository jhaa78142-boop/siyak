import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { getDrugLabel } from "../services/drugInfoService.js";
import { DISCLAIMER } from "../services/aiService.js";

export const getDrugInfo = asyncHandler(async (req, res) => {
  const name = req.params.name || "";
  if (!name.trim()) throw new ApiError(400, "Drug name is required");
  const result = await getDrugLabel(name);
  return ok(res, { disclaimer: DISCLAIMER, ...result });
});
