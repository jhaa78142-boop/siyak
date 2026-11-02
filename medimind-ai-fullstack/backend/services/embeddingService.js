import { pipeline, env } from "@xenova/transformers";

// Disable remote fetch check; the model is loaded ONCE from cache and reused.
env.allowLocalModels = true;
env.allowRemoteModels = true;

const DEFAULT_MODEL = process.env.EMBEDDING_MODEL || "Xenova/all-MiniLM-L6-v2";
const EMBEDDING_DIM = 384; // all-MiniLM-L6-v2 output dim

let pipelinePromise = null;
let pipelineModelName = null;

function ensurePipeline(modelName = DEFAULT_MODEL) {
  if (pipelinePromise && pipelineModelName === modelName) {
    return pipelinePromise;
  }
  pipelineModelName = modelName;
  pipelinePromise = (async () => {
    console.log(`[embedding] Loading feature-extraction pipeline: ${modelName} ...`);
    const start = Date.now();
    const extractor = await pipeline("feature-extraction", modelName, {
      quantized: true,
    });
    const elapsed = ((Date.now() - start) / 1000).toFixed(1);
    console.log(`[embedding] Model ready in ${elapsed}s (${modelName})`);
    return extractor;
  })();
  return pipelinePromise;
}

function meanPool(output, attentionMask) {
  const lastHiddenState = output[0];
  const tokenCount = lastHiddenState.length;
  const dim = lastHiddenState[0].length;

  let denominator = 0;
  const pooled = new Array(dim).fill(0);
  for (let i = 0; i < tokenCount; i++) {
    const mask = attentionMask ? attentionMask[i] : 1;
    if (!mask) continue;
    denominator += mask;
    const tokenVec = lastHiddenState[i];
    for (let j = 0; j < dim; j++) {
      pooled[j] += tokenVec[j] * mask;
    }
  }
  if (denominator === 0) denominator = 1;
  for (let j = 0; j < dim; j++) pooled[j] /= denominator;

  let norm = 0;
  for (let j = 0; j < dim; j++) norm += pooled[j] * pooled[j];
  norm = Math.sqrt(norm) || 1;
  for (let j = 0; j < dim; j++) pooled[j] /= norm;

  return pooled;
}

export async function embedText(text, modelName) {
  const extractor = await ensurePipeline(modelName);
  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });
  if (output?.data && typeof output.data.length === "number") {
    return Array.from(output.data);
  }
  if (Array.isArray(output)) {
    return meanPool(output);
  }
  if (output?.tolist) {
    const nested = output.tolist();
    if (Array.isArray(nested?.[0])) {
      return meanPool(nested);
    }
    return Array.isArray(nested) ? nested : [];
  }
  throw new Error("Embedding generation returned an invalid response.");
}

function getBatchEmbeddings(output, expectedCount) {
  if (output?.data && Array.isArray(output.dims) && output.dims.length === 2) {
    const [count, dimension] = output.dims;
    if (
      count === expectedCount &&
      dimension > 0 &&
      output.data.length === count * dimension &&
      Array.from(output.data).every(Number.isFinite)
    ) {
      return Array.from({ length: count }, (_, index) =>
        Array.from(output.data.slice(index * dimension, (index + 1) * dimension))
      );
    }
  }

  const rows = output?.tolist ? output.tolist() : output;
  if (
    Array.isArray(rows) &&
    rows.length === expectedCount &&
    rows.every((row) => Array.isArray(row) && row.length > 0 && row.every(Number.isFinite))
  ) {
    return rows.map((row) => [...row]);
  }

  throw new Error("Embedding generation returned an invalid batch.");
}

export async function embedBatch(texts = [], modelName, onProgress) {
  if (!texts.length) return [];
  const results = [];
  const extractor = await ensurePipeline(modelName);
  const BATCH_SIZE = 32;
  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const slice = texts.slice(i, i + BATCH_SIZE);
    const output = await extractor(slice, {
      pooling: "mean",
      normalize: true,
    });
    results.push(...getBatchEmbeddings(output, slice.length));
    onProgress?.({ completed: results.length, total: texts.length });
  }
  return results;
}

export async function preloadEmbeddingModel(modelName) {
  await ensurePipeline(modelName);
}

export const EMBEDDING_DIMENSION = EMBEDDING_DIM;

export default { embedText, embedBatch, preloadEmbeddingModel, EMBEDDING_DIMENSION };
