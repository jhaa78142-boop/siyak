export function ok(res, data = null, message = "OK", statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function created(res, data = null, message = "Created") {
  return ok(res, data, message, 201);
}

export function badRequest(res, message = "Bad Request", data = null) {
  return res.status(400).json({ success: false, message, data });
}

export function notFound(res, message = "Not Found", data = null) {
  return res.status(404).json({ success: false, message, data });
}

export function unauthorized(res, message = "Unauthorized", data = null) {
  return res.status(401).json({ success: false, message, data });
}
