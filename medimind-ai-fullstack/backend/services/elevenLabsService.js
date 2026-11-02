const REQUEST_TIMEOUT_MS = 20_000;
const DEFAULT_MODEL = "eleven_multilingual_v2";
// MediMind primary voice (ElevenLabs) — keep in sync with ELEVENLABS_VOICE_ID in .env
const DEFAULT_VOICE_ID = "HH8sIQq8WOcER3Nu118i";
const DEFAULT_FALLBACK_VOICE_ID = "YLUE4l0O4DaLXqyndVno";

const VOICE_SETTINGS = {
  stability: 0.55,
  similarity_boost: 0.85,
  style: 0.2,
  use_speaker_boost: true,
};

async function requestSpeech({ apiKey, voiceId, modelId, text, signal }) {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: VOICE_SETTINGS,
    }),
    signal,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    const error = new Error(
      `ElevenLabs request failed (${response.status})${detail ? `: ${detail.slice(0, 180)}` : ""}`
    );
    error.status = response.status;
    error.detail = detail;
    error.voiceId = voiceId;
    throw error;
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function synthesizeSpeech(text) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = (process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID).trim();
  const fallbackVoiceId = (
    process.env.ELEVENLABS_VOICE_FALLBACK_ID || DEFAULT_FALLBACK_VOICE_ID
  ).trim();
  const modelId = process.env.ELEVENLABS_MODEL_ID || DEFAULT_MODEL;

  if (!apiKey) {
    const error = new Error("ELEVENLABS_API_KEY is not configured");
    error.code = "ELEVENLABS_NOT_CONFIGURED";
    throw error;
  }
  if (!voiceId) throw new Error("ELEVENLABS_VOICE_ID is missing");
  if (!text || !text.trim()) throw new Error("Speech text is required");

  const speechText = text.trim().slice(0, 5000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    try {
      return await requestSpeech({
        apiKey,
        voiceId,
        modelId,
        text: speechText,
        signal: controller.signal,
      });
    } catch (err) {
      const canFallback =
        fallbackVoiceId &&
        fallbackVoiceId !== voiceId &&
        (err?.status === 402 || /paid_plan_required|payment_required|library voices/i.test(err?.message || ""));

      if (!canFallback) throw err;

      console.warn(
        `[elevenlabs] Voice ${voiceId} unavailable on this plan (${err.status || "error"}). ` +
          `Falling back to ${fallbackVoiceId}. Upgrade ElevenLabs to use the primary voice.`
      );

      return await requestSpeech({
        apiKey,
        voiceId: fallbackVoiceId,
        modelId,
        text: speechText,
        signal: controller.signal,
      });
    }
  } finally {
    clearTimeout(timeout);
  }
}

export default { synthesizeSpeech };