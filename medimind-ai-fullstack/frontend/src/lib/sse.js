import { getIdToken } from "./firebase";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * POST + consume Server-Sent Events.
 * Calls onEvent(eventName, parsedData) for each complete SSE frame.
 */
export async function postSse(path, body, { signal, onEvent } = {}) {
  const token = await getIdToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
    signal,
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const json = await res.json();
      message = json?.message || message;
    } catch {
      /* ignore */
    }
    const err = new Error(message);
    err.statusCode = res.status;
    throw err;
  }

  if (!res.body) {
    throw new Error("Streaming is not supported in this browser");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  const flushFrame = (frame) => {
    if (!frame.trim()) return;
    let event = "message";
    const dataLines = [];
    for (const line of frame.split("\n")) {
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
    }
    if (!dataLines.length) return;
    const raw = dataLines.join("\n");
    let data = raw;
    try {
      data = JSON.parse(raw);
    } catch {
      /* keep string */
    }
    onEvent?.(event, data);
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let sep;
    while ((sep = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      flushFrame(frame);
    }
  }

  if (buffer.trim()) flushFrame(buffer);
}
