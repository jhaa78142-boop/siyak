const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";

let modelPromise;
let modelReady = false;

export const KOKORO_VOICES = [
  { id: "af_heart", label: "Heart · American English" },
  { id: "af_bella", label: "Bella · American English" },
  { id: "af_sarah", label: "Sarah · American English" },
  { id: "bf_emma", label: "Emma · British English" },
];

export function loadKokoro(onProgress) {
  if (!modelPromise) {
    modelPromise = import("kokoro-js")
      .then(({ KokoroTTS }) => KokoroTTS.from_pretrained(MODEL_ID, {
        dtype: "q8",
        device: "wasm",
        progress_callback: onProgress,
      }))
      .then((model) => {
        modelReady = true;
        return model;
      })
      .catch((error) => {
        modelPromise = undefined;
        modelReady = false;
        throw error;
      });
  }
  return modelPromise;
}

export function isKokoroReady() {
  return modelReady;
}

export async function generateKokoroAudio(model, text, voice) {
  const generated = await model.generate(text, { voice, speed: 1 });
  return generated.toBlob();
}
