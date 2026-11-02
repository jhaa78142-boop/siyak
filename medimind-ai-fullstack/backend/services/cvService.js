import fs from "node:fs/promises";
import path from "node:path";

const REQUEST_TIMEOUT_MS = 20_000;
const RETRY_DELAY_MS = 1_500;

function modelFor(reportSubType = "xray") {
  const type = String(reportSubType).toLowerCase();
  return type.includes("mri") ? process.env.HF_MRI_MODEL : process.env.HF_XRAY_MODEL;
}

function unavailable(message, modelId = null) {
  return { status: "unavailable", label: null, confidence: null, modelId, message };
}

async function requestModel(endpoint, token, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/octet-stream",
      },
      body,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function parsePrediction(payload) {
  const predictions = Array.isArray(payload) ? payload : payload?.predictions;
  if (!Array.isArray(predictions) || !predictions.length) return null;
  const best = predictions
    .filter((item) => item && typeof item.label === "string")
    .sort((a, b) => Number(b.score || 0) - Number(a.score || 0))[0];
  if (!best) return null;
  return { label: best.label, confidence: Number(best.score || 0) };
}

export async function classifyImage(filePath, reportSubType = "xray") {
  const extension = path.extname(filePath).toLowerCase();
  const subtype = String(reportSubType).toLowerCase();
  if (!["xray", "mri"].includes(subtype)) {
    return unavailable("Choose whether this scan is an X-ray or MRI before screening.");
  }
  if (extension === ".dicom" || extension === ".dcm") {
    return unavailable("DICOM imaging is not supported yet. Upload a PNG or JPEG image for screening.");
  }

  const token = process.env.HF_API_TOKEN;
  const modelId = modelFor(subtype);
  if (!token) return unavailable("HF_API_TOKEN is not configured.", modelId);
  if (!modelId) return unavailable(`No verified Hugging Face model is configured for ${subtype}.`, modelId);

  try {
    const body = await fs.readFile(filePath);
    const endpoint = `https://router.huggingface.co/hf-inference/models/${modelId}`;
    let response = await requestModel(endpoint, token, body);

    if (response.status === 503) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      response = await requestModel(endpoint, token, body);
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return unavailable(`Hugging Face model unavailable (${response.status})${detail ? `: ${detail.slice(0, 180)}` : "."}`, modelId);
    }

    const prediction = parsePrediction(await response.json());
    if (!prediction) return unavailable("Hugging Face returned no usable classification.", modelId);
    return { status: "done", ...prediction, modelId };
  } catch (error) {
    const message = error.name === "AbortError" ? "Hugging Face request timed out." : error.message || "Image classification failed.";
    return unavailable(message, modelId);
  }
}

export default { classifyImage };
