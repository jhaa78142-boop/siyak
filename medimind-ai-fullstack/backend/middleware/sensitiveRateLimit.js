import rateLimit from "express-rate-limit";
import { ApiError } from "../utils/ApiError.js";

function limiter(max, message) {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => next(new ApiError(429, message)),
  });
}

export const clinicalAiLimiter = limiter(20, "Too many clinical AI requests. Try again later.");
export const medicalUploadLimiter = limiter(10, "Too many medical document uploads. Try again later.");
export const paymentOrderLimiter = limiter(10, "Too many checkout attempts. Try again later.");
