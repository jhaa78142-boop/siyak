export function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function formatBytes(n = 0) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatTime(date) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(date || new Date());
  } catch {
    return "";
  }
}

export function inferUrgency(text = "") {
  const t = String(text).toLowerCase();
  const urgentKw = [
    "emergency",
    "call 911",
    "go to er",
    "go to the er",
    "immediate",
    "chest pain",
    "difficulty breathing",
    "stroke",
    "unconscious",
    "ambulance",
    "seek emergency",
    "life-threatening",
    "call your local emergency",
  ];
  const soonKw = [
    "consult a doctor",
    "see a doctor",
    "book a consultation",
    "schedule",
    "soon",
    "within 48",
    "within 24",
    "within a few days",
    "worsens",
    "persists",
    "concerning",
    "follow up",
    "follow-up",
    "book an appointment",
    "see your doctor",
  ];
  if (urgentKw.some((k) => t.includes(k))) return "urgent";
  if (soonKw.some((k) => t.includes(k))) return "soon";
  return "routine";
}

/** Strip partial think tags that can leak mid-stream from some models. */
export function sanitizePartial(text = "") {
  return String(text)
    .replace(/<think>[\s\S]*?(?:<\/think>|$)/gi, "")
    .replace(/<thinking>[\s\S]*?(?:<\/thinking>|$)/gi, "");
}
