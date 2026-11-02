#!/usr/bin/env node
// ---------------------------------------------------------------------------
// rag-smoke-test.js — RAG access-boundary smoke test
// ---------------------------------------------------------------------------
// Standalone Node script. Does NOT require the Express server to be running.
// DOES require a running Chroma server at process.env.CHROMA_URL.
//
// Run:
//   cd backend && CHROMA_URL=http://localhost:8000 node scripts/rag-smoke-test.js
//
// Exits:
//   0 = every assertion passed (including the cross-patient-leak check)
//   1 = any assertion failed (logs the exact failure before exiting)
//
// Hard requirement this script validates:
//   Patient B MUST NOT, under any circumstances, retrieve chunks that were
//   ingested with patientId = Patient A.  A failure here is a HIPAA-adjacent
//   data leak — treat it as a P0 bug, even if every other test passes.
// ---------------------------------------------------------------------------
import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";

import {
  getReferenceCollection,
  getPatientCollection,
  isChromaAvailable,
  getChromaClient,
} from "../config/chroma.js";
import { embedText, embedBatch, preloadEmbeddingModel } from "../services/embeddingService.js";
import { splitText } from "../services/chunkingService.js";
import { retrieve, ingestReferenceDoc, ingestPatientDoc } from "../services/ragService.js";
import { v4 as uuidv4 } from "uuid";

const PASS = () => {};
function FAIL(msg) {
  console.error(`\n[FAIL] ${msg}`);
  process.exit(1);
}
function ASSERT(cond, msg) {
  if (!cond) FAIL(msg);
  console.log(`  [PASS] ${msg}`);
}

async function cleanup() {
  if (!isChromaAvailable()) return;
  try {
    const client = getChromaClient();
    const names = await client.listCollections();
    for (const n of names) {
      const name = typeof n === "string" ? n : n?.name;
      if (name === "medimind_reference" || name === "medimind_patient_docs") {
        await client.deleteCollection({ name });
      }
    }
  } catch (_) {}
}

const fakeRefDocMongo = {
  _id: new mongoose.Types.ObjectId(),
  title: "Common Cold — Clinical Reference",
  sourceUrl: "https://example.com/common-cold",
};

const REFERENCE_TEXT =
  "The common cold is a viral infection of the upper respiratory tract. " +
  "Typical symptoms include runny nose, sore throat, cough, and mild fatigue. " +
  "Fever is uncommon in adults but may occur in children. " +
  "Most cases resolve within 7 to 10 days. Management is symptomatic: rest, hydration, and over-the-counter analgesics. " +
  "Antibiotics are NOT indicated for the common cold. Seek care if high fever, dyspnea, or symptoms persist beyond 10 days.";

const PATIENT_A_ID = "patient_" + uuidv4().replace(/-/g, "").slice(0, 12);
const PATIENT_B_ID = "patient_" + uuidv4().replace(/-/g, "").slice(0, 12);
const REPORT_A_ID = "report_" + uuidv4().replace(/-/g, "").slice(0, 12);

const PATIENT_A_REPORT_TEXT =
  "LAB REPORT — CONFIDENTIAL — PATIENT " + PATIENT_A_ID + "\n" +
  "Test Date: 2026-09-22\n" +
  "HbA1c: 6.8% (elevated — diabetes range, reference <5.7%)\n" +
  "Fasting glucose: 138 mg/dL (high)\n" +
  "LDL cholesterol: 142 mg/dL (borderline high)\n" +
  "TSH: 3.2 mIU/L (within normal range)\n" +
  "Hemoglobin: 11.2 g/dL (slightly low, possible mild anemia)\n" +
  "Clinical impression: follow-up with endocrinology recommended for glycemic control.";

const QUERY =
  "What lab results or values were flagged for HbA1c, fasting glucose, and LDL? Should I see a specialist?";

let embeddedChunksRef = 0;
let embeddedChunksPatientA = 0;

async function main() {
  console.log("== MediMind RAG Smoke Test ==\n");
  await connectDB();

  // --- Step 0: environment checks ----------------------------------------
  console.log("[Step 0] Environment checks");
  if (!isChromaAvailable()) {
    FAIL(
      "Chroma is not reachable. Start a Chroma server and set CHROMA_URL in .env:\n" +
        "  docker run -p 8000:8000 chromadb/chroma"
    );
  }
  ASSERT(isChromaAvailable(), "Chroma client available at " + process.env.CHROMA_URL);

  console.log("\n[Step 0.1] Preloading embedding model (transformers.js — runs in-process)");
  await preloadEmbeddingModel();
  const probe = await embedText("hello world");
  ASSERT(Array.isArray(probe) && probe.length > 50, `Embedding pipeline works (dim=${probe.length})`);

  // --- Step 0.2: wipe test collections -----------------------------------
  console.log("\n[Step 0.2] Wiping test collections (clean start)");
  await cleanup();

  // --- Step 1: chunking + embed sanity -----------------------------------
  console.log("\n[Step 1] Chunking & embedding sanity");
  const refChunks = await splitText(REFERENCE_TEXT);
  ASSERT(refChunks.length >= 1 && refChunks.length <= 10, `Reference doc split into ${refChunks.length} chunk(s)`);

  const patientChunks = await splitText(PATIENT_A_REPORT_TEXT);
  ASSERT(patientChunks.length >= 1 && patientChunks.length <= 10, `Patient A report split into ${patientChunks.length} chunk(s)`);

  const batchInputs = [...refChunks, ...refChunks].map((c, i) => c + " — chunk " + i).slice(0, 2);
  const batch = await embedBatch(batchInputs);
  ASSERT(batch.length === 2, `Batch embedding returns correct count (got ${batch.length})`);
  ASSERT(batch.every((e) => Array.isArray(e) && e.length === probe.length), "Batch vectors match single-embed dim");

  // --- Step 2: ingest reference doc via ragService API -------------------
  console.log("\n[Step 2] ingestReferenceDoc via RAG service");
  const refResult = await ingestReferenceDoc(fakeRefDocMongo, REFERENCE_TEXT);
  ASSERT(refResult.ok, `ingestReferenceDoc returned ok=true (reason=${refResult.reason || "n/a"})`);
  ASSERT(refResult.chunks === refChunks.length, `Indexed ${refResult.chunks} chunks (expected ${refChunks.length})`);
  embeddedChunksRef = refResult.chunks;

  // Manually verify the metadata: patientId MUST be null for every ref chunk
  const refColl = await getReferenceCollection();
  const refPeek = await refColl.get({ limit: 100 });
  const refAllPatientIds = (refPeek.metadatas || []).map((m) => m?.patientId);
  ASSERT(
    refAllPatientIds.every((pid) => pid === null || pid === undefined),
    `All ${refPeek.ids.length} reference chunks have patientId === null (found: ${JSON.stringify(refAllPatientIds)})`
  );

  // --- Step 3: ingest patient A doc via ragService API -------------------
  console.log("\n[Step 3] ingestPatientDoc via RAG service — Patient A only");
  const pResult = await ingestPatientDoc(PATIENT_A_ID, REPORT_A_ID, PATIENT_A_REPORT_TEXT);
  ASSERT(pResult.ok, `ingestPatientDoc returned ok=true (reason=${pResult.reason || "n/a"})`);
  ASSERT(pResult.chunks === patientChunks.length, `Indexed ${pResult.chunks} patient chunks (expected ${patientChunks.length})`);
  embeddedChunksPatientA = pResult.chunks;

  // Manually verify patientId metadata on every single patient chunk
  const pColl = await getPatientCollection();
  const pPeek = await pColl.get({ limit: 100 });
  const pPatientIds = (pPeek.metadatas || []).map((m) => m?.patientId);
  ASSERT(
    pPatientIds.every((pid) => pid === PATIENT_A_ID),
    `All ${pPeek.ids.length} patient chunks carry patientId === Patient A (none leaked, none null)`
  );
  ASSERT(
    pPeek.documents.every((txt) => !txt.includes(PATIENT_B_ID)),
    "Patient B's ID does not appear in any patient chunk raw text"
  );

  // --- Step 4: retrieve AS PATIENT A -------------------------------------
  console.log("\n[Step 4] retrieve() AS Patient A — should see BOTH sources");
  const resultsA = await retrieve(QUERY, PATIENT_A_ID, 20);
  console.log(`  Patient A retrieved ${resultsA.length} total chunk(s)`);
  resultsA.forEach((r, i) =>
    console.log(
      `    [${i}] src=${r.source} dist=${r.distance?.toFixed(4)} patientId=${r.metadata?.patientId ?? "null"} title=${r.metadata?.title}`
    )
  );

  const refHitsA = resultsA.filter((r) => r.source === "reference");
  const patHitsA = resultsA.filter((r) => r.source === "patient");

  ASSERT(refHitsA.length >= 1, "Patient A retrieved AT LEAST 1 reference chunk (public data)");
  ASSERT(patHitsA.length >= 1, "Patient A retrieved AT LEAST 1 of their OWN patient chunks");
  ASSERT(
    patHitsA.every((r) => r.metadata?.patientId === PATIENT_A_ID),
    "Every patient chunk Patient A sees has patientId === PATIENT_A_ID"
  );

  // Sanity: Patient A's own sensitive HbA1c value IS findable in their own results
  const aDocsCombined = patHitsA.map((r) => r.document || "").join(" ");
  ASSERT(
    aDocsCombined.includes("6.8") && aDocsCombined.includes("HbA1c"),
    "Patient A can retrieve their OWN HbA1c=6.8 sensitive value from their own report"
  );

  // --- Step 5: retrieve AS PATIENT B — THE CRITICAL ACCESS-BOUNDARY CHECK -
  console.log("\n[Step 5] retrieve() AS Patient B — MUST NOT see Patient A's data (HIPAA-ADJACENT CHECK)");
  const resultsB = await retrieve(QUERY, PATIENT_B_ID, 20);
  console.log(`  Patient B retrieved ${resultsB.length} total chunk(s)`);
  resultsB.forEach((r, i) =>
    console.log(
      `    [${i}] src=${r.source} dist=${r.distance?.toFixed(4)} patientId=${r.metadata?.patientId ?? "null"} title=${r.metadata?.title}`
    )
  );

  const refHitsB = resultsB.filter((r) => r.source === "reference");
  const patHitsB = resultsB.filter((r) => r.source === "patient");

  ASSERT(refHitsB.length >= 1, "Patient B still retrieves PUBLIC reference chunks (at least 1)");

  // ───────────────────────────────────────────────────────────────────────
  // THE single most important assertion in the entire repo.
  // If this ever fails, rollback immediately — you have a patient data leak.
  // ───────────────────────────────────────────────────────────────────────
  ASSERT(patHitsB.length === 0,
    "PATIENT-ISOLATION: Patient B retrieved 0 patient chunks total " +
    "(expected 0 — any patient chunk returned here is a cross-patient leak)."
  );

  // Belt-and-suspenders: text-level scan. No sensitive value from Patient A
  // should appear ANYWHERE in Patient B's retrieval results, even if the
  // metadata filter somehow failed.
  const bDocsCombined = resultsB.map((r) => r.document || "").join("\n");
  ASSERT(!bDocsCombined.includes("6.8"),
    "TEXT-LEVEL LEAK CHECK: Patient B's results NEVER contain Patient A's HbA1c=6.8 value."
  );
  ASSERT(!bDocsCombined.includes(PATIENT_A_ID),
    "TEXT-LEVEL LEAK CHECK: Patient B's results NEVER contain Patient A's ID string."
  );
  ASSERT(!bDocsCombined.includes(REPORT_A_ID),
    "TEXT-LEVEL LEAK CHECK: Patient B's results NEVER contain Patient A's report ID string."
  );
  ASSERT(!bDocsCombined.includes("138 mg/dL"),
    "TEXT-LEVEL LEAK CHECK: Patient B's results NEVER contain Patient A's fasting glucose value."
  );
  ASSERT(!bDocsCombined.includes("142 mg/dL"),
    "TEXT-LEVEL LEAK CHECK: Patient B's results NEVER contain Patient A's LDL value."
  );
  ASSERT(!bDocsCombined.includes("11.2 g/dL"),
    "TEXT-LEVEL LEAK CHECK: Patient B's results NEVER contain Patient A's hemoglobin value."
  );

  // --- Step 6: retrieve AS UNAUTHENTICATED (patientId null) --------------
  console.log("\n[Step 6] retrieve() with NO patientId — should only see public refs");
  const resultsNoAuth = await retrieve(QUERY, null, 20);
  const refHitsNo = resultsNoAuth.filter((r) => r.source === "reference");
  const patHitsNo = resultsNoAuth.filter((r) => r.source === "patient");
  ASSERT(refHitsNo.length >= 1, "Unauthenticated can still retrieve public reference chunks");
  ASSERT(patHitsNo.length === 0, "Unauthenticated (null patientId) gets 0 patient chunks — not even by metadata");

  const noAuthDocs = resultsNoAuth.map((r) => r.document || "").join("\n");
  ASSERT(!noAuthDocs.includes("6.8") && !noAuthDocs.includes(PATIENT_A_ID),
    "Unauthenticated text-level leak check passes (no Patient A sensitive values)");

  // --- Step 7: edge-case — empty query -----------------------------------
  console.log("\n[Step 7] Edge cases: empty / whitespace query");
  const emptyRes = await retrieve("   \n\t", PATIENT_A_ID, 5);
  ASSERT(emptyRes.length === 0, "Whitespace-only query returns 0 results (no embed call made)");

  // --- Summary -----------------------------------------------------------
  console.log("\n==========================================");
  console.log("✅ ALL ASSERTIONS PASSED");
  console.log("==========================================");
  console.log(`Reference chunks indexed:   ${embeddedChunksRef}`);
  console.log(`Patient A chunks indexed:   ${embeddedChunksPatientA}`);
  console.log(`Patient A retrieved total:  ${resultsA.length} (refs + their own)`);
  console.log(`Patient B retrieved total:  ${resultsB.length} (refs ONLY — Patient A data fully isolated ✅)`);
  console.log(`Patient A's HbA1c (6.8):    SEEN by Patient A, NEVER by Patient B ✅`);
  console.log("\nPASS: Patient access boundary is intact.");

  await cleanup();
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("\n[CRASH] Unhandled in smoke test:", err);
  cleanup()
    .catch(() => {})
    .finally(async () => {
      await mongoose.disconnect().catch(() => {});
      process.exit(1);
    });
});
