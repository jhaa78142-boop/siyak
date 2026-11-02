// Thin fetch wrapper for the MediMind AI backend. Attaches the current
// Firebase ID token automatically, so callers just do:
//   const { data } = await api.get("/appointments");
//   const { data } = await api.post("/ai/symptom-check", { symptoms: [...] });
import { getIdToken } from "./firebase";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(path, { method = "GET", body, isFormData = false, responseType = "json" } = {}) {
  const token = await getIdToken();

  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  if (responseType === "blob") {
    if (!res.ok) {
      try { json = await res.json(); } catch { /* no JSON error body */ }
    } else {
      return res.blob();
    }
  } else {
    try {
      json = await res.json();
    } catch {
      // no JSON body (e.g. 204)
    }
  }

  if (!res.ok) {
    const message = json?.message || `Request failed: ${res.status}`;
    const error = new Error(message);
    error.statusCode = res.status;
    error.details = json?.details;
    throw error;
  }

  return json; // { success, message, data }
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: "POST", body }),
  put: (path, body) => request(path, { method: "PUT", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path, body) => request(path, { method: "DELETE", body }),
  upload: (path, formData) => request(path, { method: "POST", body: formData, isFormData: true }),
  download: (path) => request(path, { responseType: "blob" }),
  audioPost: (path, body) => request(path, { method: "POST", body, responseType: "blob" }),
};
