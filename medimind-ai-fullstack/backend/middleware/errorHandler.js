import { ApiError } from "../utils/ApiError.js";

export function notFoundHandler(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const statusCode = err instanceof ApiError ? err.statusCode : err.statusCode || 500;
  const message = statusCode >= 500 && !(err instanceof ApiError)
    ? "Internal server error"
    : err.message || "Internal server error";

  if (statusCode >= 500) {
    console.error("[Error] request=%s status=%s code=%s", req.requestId || "unknown", statusCode, err.code || err.name || "Error");
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: statusCode < 500 ? err.details || undefined : undefined,
  });
}
