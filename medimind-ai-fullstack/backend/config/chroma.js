import { ChromaClient } from "chromadb";

// ---------------------------------------------------------------------------
// Chroma client configuration
// ---------------------------------------------------------------------------
// We use TWO separate collections (rather than one with a docType filter)
// because:
//   1. The access boundary is hard — reference docs are world-readable to
//      any authenticated user, while patient docs must NEVER leak across
//      patient IDs. Physically separate collections give us an extra guard
//      against a broken WHERE clause accidentally exposing private data.
//   2. Reference and patient chunks are written from different code paths
//      (knowledgeBaseController vs aiController) and indexed at different
//      times; separate collections keep metrics and delete operations clean.
//
// If you need a single-collection variant later (e.g. for Chroma Cloud
// collection limits), every caller in ragService.js already goes through
// getReferenceCollection() / getPatientCollection() — swapping to a
// shared collection + $docType metadata filter is localized here.
// ---------------------------------------------------------------------------

const CHROMA_URL = process.env.CHROMA_URL;
const HEALTH_TTL_MS = Number(process.env.CHROMA_HEALTH_TTL_MS || 15000);
const HEALTH_TIMEOUT_MS = Number(process.env.CHROMA_HEALTH_TIMEOUT_MS || 2500);

if (!CHROMA_URL) {
  console.warn(
    "[chroma] CHROMA_URL is not set in .env. Chroma-backed RAG will be " +
      "disabled until you point this at a running Chroma server " +
      "(e.g. `docker run -p 8000:8000 chromadb/chroma`) or Chroma Cloud."
  );
}

let client = null;
if (CHROMA_URL) {
  try {
    client = new ChromaClient({ path: CHROMA_URL });
    console.log(`[chroma] Client initialized at ${CHROMA_URL}`);
  } catch (err) {
    console.error(`[chroma] Failed to initialize client: ${err.message}`);
    client = null;
  }
}

let lastHealth = { ok: null, checkedAt: 0, error: null };
const referenceCollPromise = new Map();
const patientCollPromise = new Map();

function getErrorDetails(error) {
  if (error?.cause?.code) {
    const location = error.cause.address
      ? ` at ${error.cause.address}${error.cause.port ? `:${error.cause.port}` : ""}`
      : "";
    return `${error.cause.code}${location}`;
  }
  return error?.message || String(error);
}

function clearCollectionCaches() {
  referenceCollPromise.clear();
  patientCollPromise.clear();
}

export function isChromaConfigured() {
  return client !== null && Boolean(CHROMA_URL);
}

/** Sync hint only — prefer `probeChroma()` before expensive work. */
export function isChromaAvailable() {
  if (!isChromaConfigured()) return false;
  if (lastHealth.ok === false && Date.now() - lastHealth.checkedAt < HEALTH_TTL_MS) {
    return false;
  }
  return true;
}

export function getChromaHealthError() {
  return lastHealth.error;
}

export async function probeChroma(force = false) {
  if (!isChromaConfigured()) {
    lastHealth = { ok: false, checkedAt: Date.now(), error: "not-configured" };
    return false;
  }

  const now = Date.now();
  if (!force && lastHealth.ok !== null && now - lastHealth.checkedAt < HEALTH_TTL_MS) {
    return lastHealth.ok;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
  try {
    const base = String(CHROMA_URL).replace(/\/$/, "");
    const urls = [`${base}/api/v2/heartbeat`, `${base}/api/v1/heartbeat`, base];
    let ok = false;
    let lastErr = null;
    for (const url of urls) {
      try {
        const res = await fetch(url, { method: "GET", signal: controller.signal });
        if (res.ok || res.status === 410) {
          ok = true;
          break;
        }
        lastErr = `HTTP ${res.status}`;
      } catch (err) {
        lastErr = getErrorDetails(err);
      }
    }
    lastHealth = { ok, checkedAt: Date.now(), error: ok ? null : lastErr };
    if (!ok) clearCollectionCaches();
    return ok;
  } catch (err) {
    lastHealth = { ok: false, checkedAt: Date.now(), error: getErrorDetails(err) };
    clearCollectionCaches();
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export function markChromaFailure(err) {
  lastHealth = {
    ok: false,
    checkedAt: Date.now(),
    error: err ? getErrorDetails(err) : "chroma-error",
  };
  clearCollectionCaches();
}

async function getOrCreateCollection(name, metadata) {
  if (!client) throw new Error("Chroma client is not available (CHROMA_URL missing)");
  const healthy = await probeChroma();
  if (!healthy) {
    throw new Error(`Chroma unavailable: ${lastHealth.error || "heartbeat failed"}`);
  }
  try {
    return await client.getOrCreateCollection({
      name,
      metadata: metadata || undefined,
    });
  } catch (err) {
    markChromaFailure(err);
    throw err;
  }
}

export async function getReferenceCollection() {
  const name = "medimind_reference";
  if (!referenceCollPromise.has(name)) {
    referenceCollPromise.set(
      name,
      getOrCreateCollection(name, {
        description: "Admin-approved and successfully indexed medical reference documents.",
        docType: "reference",
      }).catch((err) => {
        referenceCollPromise.delete(name);
        throw err;
      })
    );
  }
  return referenceCollPromise.get(name);
}

export async function getPatientCollection() {
  const name = "medimind_patient_docs";
  if (!patientCollPromise.has(name)) {
    patientCollPromise.set(
      name,
      getOrCreateCollection(name, {
        description: "Per-patient uploaded reports and prescriptions. Only the owning patient's queries may retrieve.",
        docType: "patient",
      }).catch((err) => {
        patientCollPromise.delete(name);
        throw err;
      })
    );
  }
  return patientCollPromise.get(name);
}

export function getChromaClient() {
  return client;
}

export default {
  isChromaAvailable,
  isChromaConfigured,
  getChromaHealthError,
  probeChroma,
  markChromaFailure,
  getReferenceCollection,
  getPatientCollection,
  getChromaClient,
};
