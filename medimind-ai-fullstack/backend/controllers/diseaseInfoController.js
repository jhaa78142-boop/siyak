import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { getDiseaseSummary } from "../services/diseaseInfoService.js";
import { DISCLAIMER } from "../services/aiService.js";

export const getDiseaseInfo = asyncHandler(async (req, res) => {
  const term = req.params.term || "";
  if (!term.trim()) throw new ApiError(400, "Search term is required");
  const result = await getDiseaseSummary(term);
  return ok(res, {
    disclaimer: DISCLAIMER,
    wikipediaUrl: result.wikipediaUrl ?? null,
    ...result,
  });
});
