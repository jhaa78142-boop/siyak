import Feedback from "../models/Feedback.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const submitFeedback = asyncHandler(async (req, res) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    throw new ApiError(400, "Feedback must be submitted as an object.");
  }
  const { rating, note = "", context = "" } = req.body;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ApiError(400, "Rating must be a whole number between 1 and 5.");
  }
  if (typeof note !== "string" || note.length > 2000) {
    throw new ApiError(400, "Feedback must be 2000 characters or fewer.");
  }
  if (typeof context !== "string" || context.length > 100) {
    throw new ApiError(400, "Feedback context must be 100 characters or fewer.");
  }

  const feedback = await Feedback.create({ user: req.user._id, rating, note, context });
  return created(res, feedback);
});

export const listFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find().populate("user", "fullName role").sort({ createdAt: -1 }).limit(100);
  return ok(res, feedback);
});
