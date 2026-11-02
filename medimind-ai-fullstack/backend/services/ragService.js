import { v4 as uuidv4 } from "uuid";
import Groq from "groq-sdk";

import { EMERGENCY_PATTERNS, DISCLAIMER } from "./aiService.js";
import {
  getReferenceCollection,
  getPatientCollection,
  isChromaAvailable,
  probeChroma,
  markChromaFailure,
} from "../config/chroma.js";
import { embedText, embedBatch } from "./embeddingService.js";
import { splitText } from "./chunkingService.js";
import KnowledgeBaseDoc from "../models/KnowledgeBaseDoc.js";
import KnowledgeBaseChunk from "../models/KnowledgeBaseChunk.js";
import Report from "../models/Report.js";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const GROQ_MODEL_FALLBACKS = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-20b",
  "llama-3.3-70b-versatile",
  "llama-3.1-70b-versatile",
  "allam-2-7b",
];

const groq = GROQ_API_KEY
  ? new Groq({ apiKey: GROQ_API_KEY })
  : null;

const EMERGENCY_REPLY =
  "That sounds serious — please call your local emergency number or go to the nearest ER right away. I'm not able to help with emergencies through chat.";

const OUT_OF_SCOPE_REPLY =
  "I can only help with MediMind health topics — symptoms, medicines, lab reports, and how to use the app. " +
  "I'm not able to answer questions outside that scope. Ask me about your health and I'll do my best.";

// --- Deterministic scope guard -------------------------------------------
// MediMind AI must only answer health/medical questions and app how-to. These
// rules short-circuit clearly unrelated requests before we spend an LLM call.
const SMALL_TALK_RE =
  /^(hi+|hey+|hello+|yo|namaste|good (morning|afternoon|evening)|thanks?|thank you|thx|ok(ay)?|cool|bye|goodbye|see you|who are you|what can you do|what is medimind|help)\b/i;

const HEALTH_TERMS_RE =
  /(symptom|pain|ache|fever|cough|cold|flu|head|migraine|nausea|vomit|diarrh|constipat|rash|itch|swell|injur|wound|burn|breath|chest|heart|palpit|\bbp\b|blood|pressure|sugar|diabet|thyroid|cholest|hemoglobin|an[aä]emia|iron|vitamin|calcium|protein|kidney|liver|stomach|abdomen|skin|hair|eye|ear|throat|tooth|dental|bone|joint|muscle|nerve|brain|stroke|seizure|allerg|asthma|infect|virus|bacter|immun|cancer|tumou?r|pregnan|period|mens|hormone|weight|obes|diet|nutrition|exercise|sleep|stress|anxiety|depress|mental|medicine|medication|drug|tablet|capsule|syrup|dose|dosage|prescription|\brx\b|pharmac|side ?effect|interaction|report|\blab\b|scan|x-?ray|\bmri\b|\bct\b|ultrasound|\becg\b|doctor|physician|hospital|clinic|appointment|consult|treatment|therapy|surgery|diagnos|medimind|health|vital|spo2|oxygen)/i;

const OUT_OF_SCOPE_RE = [
  /(write|generate|create|debug|fix|explain).{0,30}(code|program|script|function|\bsql\b|query|python|javascript|java\b|html|css|react|node|algorithm)/i,
  /\b(politics|election|president|prime minister|parliament|government|war|terroris)\b/i,
  /\b(stock|share market|sensex|nifty|crypto|bitcoin|ethereum|forex|trading|mutual fund|invest)/i,
  /\b(movie|film|song|lyrics|actor|actress|netflix|cricket|football|fifa|ipl|match score|binge)\b/i,
  /(capital of|history of|who (is|was) the (ceo|president|prime minister|founder)|tallest|largest country|population of|currency of)/i,
  /(homework|assignment|essay|poem|story about|joke|riddle|recipe for (pizza|cake|biryani|pasta))/i,
  /\b(hack|exploit|malware|phishing|password crack|bypass)\b/i,
];

function isOutOfScope(text = "") {
  const t = String(text).trim();
  if (!t) return false;
  if (HEALTH_TERMS_RE.test(t)) return false;
  if (SMALL_TALK_RE.test(t)) return false;
  return OUT_OF_SCOPE_RE.some((re) => re.test(t));
}

const DEFAULT_TOP_K = 5;
const STOP_WORDS = new Set([
  "the", "and", "for", "are", "but", "not", "you", "all", "can", "had", "her", "was", "one",
  "our", "out", "has", "have", "been", "with", "this", "that", "from", "they", "what", "when",
  "your", "about", "into", "than", "then", "them", "some", "would", "there", "their", "will",
  "just", "over", "such", "also", "how", "why", "does", "did", "please", "could", "should",
  "explain", "simple", "terms", "help", "need", "like",
]);

function matchesEmergency(text = "") {
  return EMERGENCY_PATTERNS.some((re) => re.test(text));
}

function stringifyId(val) {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (val.toString) return val.toString();
  return String(val);
}

function stripCrossPatientData(chunks, expectedPatientId) {
  const patientIdStr = expectedPatientId ? stringifyId(expectedPatientId) : null;
  return chunks.filter((c) => {
    const md = c?.metadata || {};
    const chunkPatient = md.patientId ? stringifyId(md.patientId) : null;
    if (chunkPatient === null || chunkPatient === undefined) return true;
    if (!patientIdStr) return false;
    return chunkPatient === patientIdStr;
  });
}

function tokenize(text = "") {
  return String(text)
    .toLowerCase()
    .split(/[^a-z0-9.%/+-]+/i)
    .filter((t) => t.length > 2 && !STOP_WORDS.has(t));
}

function scoreOverlap(queryTokens, text) {
  if (!queryTokens.length || !text) return 0;
  const hay = String(text).toLowerCase();
  let hits = 0;
  for (const token of queryTokens) {
    if (hay.includes(token)) hits += 1;
  }
  return hits / queryTokens.length;
}

function sanitizeReply(text = "") {
  return String(text)
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, "")
    .replace(/^\s*ASSISTANT:\s*/i, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatReportContext(report) {
  const a = report.analysis || {};
  const findings = Array.isArray(a.findings)
    ? a.findings
        .slice(0, 12)
        .map((f) => {
          const bits = [f.name, f.value, f.unit, f.status ? `(${f.status})` : null]
            .filter(Boolean)
            .join(" ");
          return bits ? `- ${bits}` : null;
        })
        .filter(Boolean)
        .join("\n")
    : "";
  const meds = Array.isArray(a.medications)
    ? a.medications
        .slice(0, 10)
        .map((m) => {
          const bits = [m.name, m.dose, m.frequency, m.duration].filter(Boolean).join(" — ");
          return bits ? `- ${bits}` : null;
        })
        .filter(Boolean)
        .join("\n")
    : "";
  const flags = Array.isArray(a.flags)
    ? a.flags
        .slice(0, 8)
        .map((f) => `- ${f.severity || "info"}: ${f.label || ""}${f.detail ? ` — ${f.detail}` : ""}`)
        .join("\n")
    : "";
  const raw = String(a.rawExtractedText || "").replace(/\s+/g, " ").trim().slice(0, 1800);

  return [
    `Document: ${report.fileName || "Patient report"} (${a.documentKind || report.reportType || "Report"})`,
    a.summary ? `Summary: ${a.summary}` : null,
    a.plainLanguage ? `Plain language: ${a.plainLanguage}` : null,
    findings ? `Findings:\n${findings}` : null,
    meds ? `Medications:\n${meds}` : null,
    flags ? `Flags:\n${flags}` : null,
    raw ? `Extracted text excerpt: ${raw}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * When Chroma is down / empty, ground answers in the patient's Mongo-stored
 * report analyses so chat stays accurate about uploaded labs & prescriptions.
 */
export async function retrieveMongoFallback(query, patientId, topK = DEFAULT_TOP_K) {
  const patientIdStr = patientId ? stringifyId(patientId) : null;
  if (!patientIdStr) return [];

  try {
    const reports = await Report.find({
      patient: patientIdStr,
      "analysis.status": "done",
    })
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    if (!reports.length) return [];

    const queryTokens = tokenize(query);
    const asksAboutOwnRecords = /\b(my|mine|uploaded|report|lab|prescription|rx|finding|result|document)\b/i.test(
      query || ""
    );

    const scored = reports
      .map((report) => {
        const document = formatReportContext(report);
        const base = scoreOverlap(queryTokens, document);
        // Prefer newest reports when the user is asking about their own record
        // and keyword overlap is weak (e.g. "explain my last lab report").
        const recencyBoost = asksAboutOwnRecords ? 0.15 : 0;
        const score = Math.max(base + recencyBoost, asksAboutOwnRecords ? 0.2 : base);
        return {
          id: `mongo-report-${stringifyId(report._id)}`,
          document,
          distance: Math.max(0, 1 - score),
          metadata: {
            title: report.fileName || "Patient Report",
            reportId: stringifyId(report._id),
            patientId: patientIdStr,
            docType: "patient",
            source: "mongo-fallback",
          },
          source: "patient",
          _score: score,
        };
      })
      .filter((c) => c._score >= 0.15 || asksAboutOwnRecords)
      .sort((a, b) => b._score - a._score)
      .slice(0, topK)
      .map(({ _score, ...rest }) => rest);

    return scored;
  } catch (err) {
    console.error("[rag:retrieveMongoFallback] error:", err?.message || err);
    return [];
  }
}

export async function ingestReferenceDoc(doc, rawText) {
  const docId = stringifyId(doc._id || doc.id);
  if (!docId) throw new Error("ingestReferenceDoc: doc._id is required");

  try {
    await KnowledgeBaseDoc.findByIdAndUpdate(docId, { status: "Syncing" });

    if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
      await KnowledgeBaseDoc.findByIdAndUpdate(docId, { status: "Failed", chunks: 0 });
      return { ok: false, reason: "empty rawText", chunks: 0 };
    }

    if (!(await probeChroma())) {
      await KnowledgeBaseDoc.findByIdAndUpdate(docId, { status: "Failed", chunks: 0 });
      return { ok: false, reason: "chroma-unavailable", chunks: 0 };
    }

    const chunks = await splitText(rawText);
    if (!chunks.length) {
      await KnowledgeBaseDoc.findByIdAndUpdate(docId, { status: "Failed", chunks: 0 });
      return { ok: false, reason: "no chunks produced", chunks: 0 };
    }

    const embeddings = await embedBatch(chunks);
    const ids = chunks.map(() => uuidv4());
    const metadatas = chunks.map((_, i) => ({
      docId,
      title: doc.title || "Untitled reference doc",
      sourceUrl: doc.sourceUrl || "",
      patientId: null,
      chunkIndex: i,
      totalChunks: chunks.length,
      docType: "reference",
    }));

    const coll = await getReferenceCollection();
    await coll.upsert({ ids, embeddings, documents: chunks, metadatas });

    await KnowledgeBaseDoc.findByIdAndUpdate(docId, {
      status: "Indexed",
      chunks: chunks.length,
    });

    return { ok: true, chunks: chunks.length };
  } catch (err) {
    console.error(`[rag:ingestReferenceDoc] doc=${docId} error:`, err);
    markChromaFailure(err);
    try {
      await KnowledgeBaseDoc.findByIdAndUpdate(docId, { status: "Failed", chunks: 0 });
    } catch (_) {}
    return { ok: false, reason: err.message || "unknown error", chunks: 0 };
  }
}

export async function ingestPatientDoc(patientId, reportId, rawText) {
  const patientIdStr = stringifyId(patientId);
  const reportIdStr = stringifyId(reportId);

  if (!patientIdStr) throw new Error("ingestPatientDoc: patientId is required");

  try {
    if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
      return { ok: false, reason: "empty rawText", chunks: 0 };
    }

    if (!(await probeChroma())) {
      return { ok: false, reason: "chroma-unavailable", chunks: 0 };
    }

    const chunks = await splitText(rawText);
    if (!chunks.length) {
      return { ok: false, reason: "no chunks produced", chunks: 0 };
    }

    const embeddings = await embedBatch(chunks);
    const ids = chunks.map(() => uuidv4());
    const metadatas = chunks.map((_, i) => ({
      reportId: reportIdStr || "",
      patientId: patientIdStr,
      chunkIndex: i,
      totalChunks: chunks.length,
      docType: "patient",
      title: `Patient Report ${reportIdStr ? " #" + reportIdStr.slice(-6) : ""}`,
    }));

    const coll = await getPatientCollection();
    await coll.upsert({ ids, embeddings, documents: chunks, metadatas });

    return { ok: true, chunks: chunks.length };
  } catch (err) {
    console.error(`[rag:ingestPatientDoc] patient=${patientIdStr} error:`, err);
    markChromaFailure(err);
    return { ok: false, reason: err.message || "unknown error", chunks: 0 };
  }
}

export async function retrieveReferenceMongoFallback(query, topK = DEFAULT_TOP_K) {
  const queryTokens = tokenize(query);
  if (!queryTokens.length) return [];

  const terms = queryTokens.slice(0, 12);
  const pipeline = [
    { $match: { $text: { $search: terms.join(" ") } } },
    { $addFields: { textScore: { $meta: "textScore" } } },
    {
      $lookup: {
        from: KnowledgeBaseDoc.collection.name,
        localField: "documentId",
        foreignField: "_id",
        as: "referenceDoc",
      },
    },
    { $unwind: "$referenceDoc" },
    {
      $match: {
        "referenceDoc.status": "INDEXED",
        "referenceDoc.reviewedBy": { $ne: null },
      },
    },
    { $sort: { textScore: -1 } },
    { $limit: Math.max(topK * 5, 25) },
    {
      $project: {
        content: 1,
        chunkIndex: 1,
        pageNumber: 1,
        textScore: 1,
        referenceDoc: 1,
      },
    },
  ];

  let chunks;
  const keywordMatch = {
    $or: terms.map((term) => ({
      content: { $regex: term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" },
    })),
  };
  const keywordPipeline = [
    { $match: keywordMatch },
    {
      $lookup: {
        from: KnowledgeBaseDoc.collection.name,
        localField: "documentId",
        foreignField: "_id",
        as: "referenceDoc",
      },
    },
    { $unwind: "$referenceDoc" },
    {
      $match: {
        "referenceDoc.status": "INDEXED",
        "referenceDoc.reviewedBy": { $ne: null },
      },
    },
    { $limit: 250 },
    {
      $project: {
        content: 1,
        chunkIndex: 1,
        pageNumber: 1,
        referenceDoc: 1,
      },
    },
  ];
  try {
    chunks = await KnowledgeBaseChunk.aggregate(pipeline);
  } catch (error) {
    console.warn("[rag:retrieveReferenceMongoFallback] text search unavailable; using keyword match:", error.message);
    try {
      chunks = await KnowledgeBaseChunk.aggregate(keywordPipeline);
    } catch (fallbackError) {
      console.error("[rag:retrieveReferenceMongoFallback] keyword search failed:", fallbackError.message);
      return [];
    }
  }

  if (!chunks.length) {
    try {
      chunks = await KnowledgeBaseChunk.aggregate(keywordPipeline);
    } catch (error) {
      console.error("[rag:retrieveReferenceMongoFallback] keyword search failed:", error.message);
      return [];
    }
  }

  return chunks
    .map((chunk) => {
      const score = scoreOverlap(queryTokens, chunk.content);
      return {
        id: `mongo-reference-${stringifyId(chunk.referenceDoc._id)}-${chunk.chunkIndex}`,
        document: chunk.content,
        distance: 1 - score,
        metadata: {
          docId: stringifyId(chunk.referenceDoc._id),
          title: chunk.referenceDoc.title || "Medical reference",
          sourceOrganization: chunk.referenceDoc.sourceOrganization || "",
          sourceUrl: chunk.referenceDoc.sourceUrl || "",
          category: chunk.referenceDoc.category || "",
          pageNumber: chunk.pageNumber || 1,
          chunkIndex: chunk.chunkIndex,
          docType: "reference",
          status: "INDEXED",
        },
        source: "reference",
        _score: score,
      };
    })
    .filter((chunk) => chunk._score >= 0.15)
    .sort((a, b) => b._score - a._score || a.distance - b.distance)
    .slice(0, topK)
    .map(({ _score, ...chunk }) => chunk);
}

export async function retrieve(query, patientId, topK = DEFAULT_TOP_K) {
  const results = [];

  if (!query || !query.trim()) return results;

  const patientIdStr = patientId ? stringifyId(patientId) : null;
  const chromaOk = await probeChroma();

  if (chromaOk) {
    let queryEmbedding;
    try {
      queryEmbedding = await embedText(query);
    } catch (err) {
      console.error("[rag:retrieve] embed query failed:", err);
      queryEmbedding = null;
    }

    if (queryEmbedding) {
      try {
        const refColl = await getReferenceCollection();
        const refRes = await refColl.query({
          queryEmbeddings: [queryEmbedding],
          nResults: Math.max(topK * 5, 20),
          where: { docType: "reference" },
        });
        if (refRes?.ids?.[0]?.length) {
          const ids = refRes.ids[0];
          const docs = refRes.documents?.[0] || [];
          const dists = refRes.distances?.[0] || [];
          const metas = refRes.metadatas?.[0] || [];
          const referenceIds = ids
            .map((id, index) => ({ id, index, docId: metas[index]?.docId }))
            .filter((entry) => entry.docId);
          const indexedIds = referenceIds.length
            ? new Set(
                (
                  await KnowledgeBaseDoc.find({
                    _id: { $in: [...new Set(referenceIds.map((entry) => entry.docId))] },
                    status: "INDEXED",
                    reviewedBy: { $ne: null },
                  })
                    .select("_id")
                    .lean()
                ).map((doc) => stringifyId(doc._id))
              )
            : new Set();
          for (const { id, index, docId } of referenceIds) {
            if (!indexedIds.has(stringifyId(docId)) || metas[index]?.status !== "INDEXED") continue;
            results.push({
              id,
              document: docs[index],
              distance: dists[index],
              metadata: metas[index] || {},
              source: "reference",
            });
          }
        }
      } catch (err) {
        console.error("[rag:retrieve] reference query error:", err?.message || err);
        markChromaFailure(err);
      }

      try {
        const patientColl = await getPatientCollection();
        const patientRes = await patientColl.query({
          queryEmbeddings: [queryEmbedding],
          nResults: topK,
          where: patientIdStr ? { patientId: patientIdStr } : undefined,
        });
        if (patientRes?.ids?.[0]?.length) {
          const ids = patientRes.ids[0];
          const docs = patientRes.documents?.[0] || [];
          const dists = patientRes.distances?.[0] || [];
          const metas = patientRes.metadatas?.[0] || [];
          for (let i = 0; i < ids.length; i++) {
            results.push({
              id: ids[i],
              document: docs[i],
              distance: dists[i],
              metadata: metas[i] || {},
              source: "patient",
            });
          }
        }
      } catch (err) {
        console.error("[rag:retrieve] patient query error:", err?.message || err);
        markChromaFailure(err);
      }
    }
  } else if (isChromaAvailable() === false) {
    // quiet path — Mongo fallback below
  }

  const hasPatientChunks = results.some((r) => r.source === "patient");
  if (!hasPatientChunks && patientIdStr) {
    const mongoChunks = await retrieveMongoFallback(query, patientIdStr, topK);
    results.push(...mongoChunks);
  }

  const existingReferenceText = new Set(
    results.filter((result) => result.source === "reference").map((result) => result.document)
  );
  const referenceFallback = await retrieveReferenceMongoFallback(query, topK);
  results.push(...referenceFallback.filter((result) => !existingReferenceText.has(result.document)));

  const safe = stripCrossPatientData(results, patientId);
  safe.sort((a, b) => (a.distance ?? 1) - (b.distance ?? 1));
  return safe.slice(0, topK);
}

function formatConversationHistory(history, recentCount = 8) {
  if (!Array.isArray(history)) return "";
  const slice = history.slice(-recentCount);
  return slice
    .filter((m) => m && m.role && (typeof m.text === "string" || typeof m.content === "string"))
    .map((m) => {
      const role = m.role === "ai" ? "assistant" : "user";
      const text = m.text || m.content || "";
      return `${role.toUpperCase()}: ${text}`;
    })
    .join("\n");
}

function buildPrompt({ userMessage, retrievedChunks, conversationHistory }) {
  const hasContext = retrievedChunks.length > 0;
  const labeledContext = hasContext
    ? retrievedChunks
        .map((c, i) => {
          const md = c.metadata || {};
          const src = md.title || (c.source === "reference" ? "Reference Document" : "Patient Document");
          const citation = [
            md.publisher || md.sourceOrganization,
            md.pageNumber ? `page ${md.pageNumber}` : null,
            md.sourceUrl,
          ].filter(Boolean).join(" | ");
          return `[CONTEXT ${i + 1}] (${src}${citation ? `; ${citation}` : ""}) ${c.document || ""}`;
        })
        .join("\n\n")
    : "No patient reports or reference documents were retrieved for this question.";

  const historyBlock = conversationHistory ? `\nRECENT CONVERSATION:\n${conversationHistory}\n` : "";

  return (
    "You are MediMind AI, a cautious medical information assistant focused on accuracy.\n" +
    "Rules:\n" +
    "1. Prefer facts from RETRIEVED CONTEXT. Quote numbers, lab names, and medication details only if they appear there.\n" +
    "2. If the user asks about THEIR report/labs/prescription and CONTEXT is empty, say you do not have an uploaded report yet — do not invent values.\n" +
    "3. If retrieved medical knowledge-base context does not contain enough evidence, answer with cautious general medical guidance from your medical knowledge when appropriate. Explicitly say the knowledge base did not provide enough information; never imply that general guidance came from a cited document. Include red flags and when to see a clinician.\n" +
    "4. For general health / triage questions without personal records, give careful, mainstream clinical guidance: likely benign vs concerning patterns, red flags, self-care, and when to see a clinician. Stay concise and factual.\n" +
    "5. NEVER state a definitive diagnosis. You MAY list possible causes with uncertainty language and an urgency cue (routine / soon / urgent).\n" +
    "6. Never invent dosing regimens. Only repeat doses that appear in CONTEXT; otherwise defer to a pharmacist or doctor.\n" +
    "7. For emergencies (chest pain, difficulty breathing, severe bleeding, stroke signs, suicidal thoughts), direct the user to emergency services immediately.\n" +
    "8. Do not invent patient history. Do not claim data you were not given.\n" +
    "9. Keep the reply clear, clinical, and actionable. Avoid humor, guarantees, or absolute statements.\n" +
    "10. Prefer Markdown structure: a one-line lead, then short sections (What this may mean / What to watch / Next steps) when helpful.\n" +
    "11. SCOPE: Only answer questions about health, medicine, symptoms, medications, lab reports, and how to use the MediMind app. " +
    "If a question is outside this scope (coding, politics, finance, entertainment, general knowledge, or unrelated personal advice), " +
    "politely refuse in one short line and steer the user back to health topics. Never answer out-of-scope questions.\n\n" +
    "RETRIEVED CONTEXT:\n" +
    labeledContext +
    historyBlock +
    `\nUSER QUESTION: ${userMessage}\n\nASSISTANT:`
  );
}

const SYSTEM_MESSAGE =
  "You are MediMind AI, a cautious medical-information assistant. " +
  "Be accurate: use provided context when present; for general questions give careful triage guidance. " +
  "Never diagnose, never invent labs or doses, always defer to a clinician for decisions. " +
  "Scope: only health/medical topics and how to use the MediMind app; politely refuse unrelated requests. " +
  "Format replies in clean Markdown: short headings, bullets for steps/red flags, bold for key values. " +
  "Stay concise, clinical, and actionable.";

function groqMessages(prompt) {
  return [
    { role: "system", content: SYSTEM_MESSAGE },
    { role: "user", content: prompt },
  ];
}

function isRecoverableGroqError(err) {
  const status = err?.status || err?.response?.status;
  const code = err?.error?.code;
  return (
    status === 404 ||
    code === "model_not_found" ||
    code === "rate_limit_exceeded" ||
    (status >= 500 && status < 600)
  );
}

function modelCandidates() {
  return [GROQ_MODEL, ...GROQ_MODEL_FALLBACKS.filter((m) => m !== GROQ_MODEL)];
}

async function callGroq(prompt) {
  if (!groq) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  let lastErr = null;
  for (const model of modelCandidates()) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: groqMessages(prompt),
        temperature: 0.15,
        max_tokens: 1536,
        top_p: 0.9,
        stream: false,
      });
      const text = completion?.choices?.[0]?.message?.content;
      const trimmed = sanitizeReply(typeof text === "string" ? text : "");
      if (trimmed) {
        if (model !== GROQ_MODEL) {
          console.warn(`[rag:callGroq] Primary model ${GROQ_MODEL} unavailable; fell back to ${model}`);
        }
        return trimmed;
      }
    } catch (err) {
      lastErr = err;
      if (!isRecoverableGroqError(err)) throw err;
    }
  }
  if (lastErr) throw lastErr;
  throw new Error("No Groq model candidates succeeded");
}

/** Streams tokens from Groq. Yields plain string deltas. */
async function* callGroqStream(prompt, { signal } = {}) {
  if (!groq) {
    throw new Error("GROQ_API_KEY is not configured");
  }
  let lastErr = null;
  for (const model of modelCandidates()) {
    try {
      const stream = await groq.chat.completions.create({
        model,
        messages: groqMessages(prompt),
        temperature: 0.15,
        max_tokens: 1536,
        top_p: 0.9,
        stream: true,
      });
      if (model !== GROQ_MODEL) {
        console.warn(`[rag:callGroqStream] Primary model ${GROQ_MODEL} unavailable; fell back to ${model}`);
      }
      for await (const chunk of stream) {
        if (signal?.aborted) {
          try {
            stream.controller?.abort?.();
          } catch {
            /* ignore */
          }
          return;
        }
        const delta = chunk?.choices?.[0]?.delta?.content;
        if (typeof delta === "string" && delta) yield delta;
      }
      return;
    } catch (err) {
      lastErr = err;
      if (!isRecoverableGroqError(err)) throw err;
    }
  }
  if (lastErr) throw lastErr;
  throw new Error("No Groq model candidates succeeded");
}

function mapSources(retrieved) {
  return retrieved
    .map((c) => {
      const md = c.metadata || {};
      return {
        title: md.title || (c.source === "reference" ? "Reference Document" : "Patient Report"),
        publisher: md.publisher || md.sourceOrganization || "",
        sourceUrl: md.sourceUrl || "",
        pageNumber: md.pageNumber || null,
        docId: md.docId || md.reportId || null,
      };
    })
    .filter(
      (source, index, all) =>
        all.findIndex(
          (item) =>
            item.docId === source.docId &&
            item.pageNumber === source.pageNumber &&
            item.title === source.title
        ) === index
    );
}

/* --- Explainability (why this answer was given) -------------------------- */

/** Latest analysed report for the patient — evidence used for explanations. */
async function loadPatientEvidence(patientId) {
  const patientIdStr = patientId ? stringifyId(patientId) : null;
  if (!patientIdStr) return null;

  try {
    const report = await Report.findOne({
      patient: patientIdStr,
      "analysis.status": "done",
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!report) return null;
    const a = report.analysis || {};
    return {
      reportId: stringifyId(report._id),
      fileName: report.fileName || "Uploaded report",
      docKind: a.documentKind || report.reportType || "Report",
      ocrConfidence: typeof a.ocrConfidence === "number" ? a.ocrConfidence : null,
      findings: Array.isArray(a.findings) ? a.findings : [],
      flags: Array.isArray(a.flags) ? a.flags : [],
      createdAt: report.createdAt,
    };
  } catch (err) {
    console.error("[rag:loadPatientEvidence] error:", err?.message || err);
    return null;
  }
}

/** Key values to show as "Extracted value", abnormal first. */
function pickExtractedValues(findings = []) {
  const rank = { high: 0, low: 0, abnormal: 1, unknown: 2, normal: 3 };
  return (Array.isArray(findings) ? findings : [])
    .filter((f) => f && f.name)
    .slice()
    .sort((a, b) => (rank[a.status] ?? 2) - (rank[b.status] ?? 2))
    .slice(0, 4)
    .map((f) => ({
      name: String(f.name),
      value: f.value != null ? String(f.value) : "",
      unit: f.unit != null ? String(f.unit) : "",
      status: String(f.status || "unknown"),
    }));
}

function deriveUrgency(flags = [], answerText = "") {
  const t = String(answerText || "").toLowerCase();
  if (/call your local emergency|go to the (nearest )?(er|emergency)|seek emergency|life-threatening/.test(t)) {
    return "urgent";
  }
  if (/(consult|see) a doctor|book a consultation|within (24|48)|follow-?up|worsens|persists|soon/.test(t)) {
    return "soon";
  }
  return (Array.isArray(flags) ? flags : []).some((f) => f?.severity === "critical") ? "soon" : "routine";
}

function computeConfidence({ hasPatientEvidence, matchedPatient, retrievedCount, ocrConfidence }) {
  let score = 0.42;
  const reasons = [];

  if (hasPatientEvidence) {
    score = 0.56;
    reasons.push("grounded in your uploaded record");
  }
  if (matchedPatient) {
    score += 0.12;
    reasons.push("matching passage retrieved from your document");
  }
  if (retrievedCount >= 3) {
    score += 0.06;
    reasons.push("multiple supporting sources matched");
  }
  if (typeof ocrConfidence === "number") {
    if (ocrConfidence >= 85) {
      score += 0.07;
      reasons.push("clear OCR quality on the source");
    } else if (ocrConfidence < 60) {
      score -= 0.12;
      reasons.push("low OCR quality on the source document");
    }
  }
  if (!hasPatientEvidence && retrievedCount === 0) {
    reasons.push("no personal record matched — general medical guidance only");
  }

  score = Math.max(0.2, Math.min(0.92, score));
  const level = score >= 0.75 ? "High" : score >= 0.5 ? "Medium" : "Low";
  return { level, score: Math.round(score * 100), reason: reasons.join("; ") || "general guidance" };
}

/**
 * Builds the patient-facing "why this answer was given" payload:
 * AI result, extracted values, source, confidence, suggested action, safety note.
 */
function buildExplanation({
  retrieved = [],
  sources = [],
  patientEvidence = null,
  emergency = false,
  outOfScope = false,
  answerText = "",
} = {}) {
  if (outOfScope) {
    return {
      scope: "out-of-scope",
      result: "Outside MediMind's scope",
      basis: "This question is not about health, medicine, or the MediMind app.",
      extractedValues: [],
      source: "MediMind scope policy",
      confidence: { level: "High", score: 95, reason: "deterministic scope rule" },
      suggestedAction: "Ask a health question — symptoms, medicines, lab reports, or how to use MediMind.",
      safetyNote: DISCLAIMER,
      urgency: "routine",
    };
  }

  if (emergency) {
    return {
      scope: "emergency",
      result: "Emergency red flag detected",
      basis: "Your message matched deterministic emergency warning patterns.",
      extractedValues: [],
      source: "MediMind safety rules",
      confidence: { level: "High", score: 92, reason: "deterministic emergency rule" },
      suggestedAction: "Call your local emergency number or go to the nearest ER now.",
      safetyNote: DISCLAIMER,
      urgency: "urgent",
    };
  }

  const patientChunks = retrieved.filter((c) => c.source === "patient");
  const refChunks = retrieved.filter((c) => c.source === "reference");
  const matchedPatient = patientChunks.length > 0;
  const topFlag = patientEvidence?.flags?.[0];

  const result = topFlag
    ? `Possible ${String(topFlag.label).toLowerCase()} pattern`
    : patientEvidence
      ? "Reviewed against your uploaded record — no flagged abnormality in this answer"
      : refChunks.length
        ? "Grounded in MediMind's medical knowledge base"
        : "General medical guidance";

  const source = patientEvidence
    ? `Uploaded ${patientEvidence.docKind === "Prescription" ? "prescription" : "laboratory report"} — ${patientEvidence.fileName}`
    : refChunks.length
      ? `MediMind knowledge base — ${sources[0]?.title || "reference"}`
      : "General medical guidance (no personal record matched)";

  const urgency = deriveUrgency(patientEvidence?.flags, answerText);
  const suggestedAction =
    urgency === "urgent"
      ? "Seek urgent medical care now."
      : patientEvidence?.flags?.length
        ? "Consult a doctor for review of the flagged values."
        : urgency === "soon"
          ? "Book a consultation soon."
          : "Self-care and monitor; consult a doctor if it persists or worsens.";

  return {
    scope: "in-scope",
    result,
    basis: matchedPatient
      ? "Answer used values extracted from your uploaded document."
      : refChunks.length
        ? "Answer used retrieved reference material from the knowledge base."
        : "No personal record matched this question; answer uses general medical guidance.",
    extractedValues: pickExtractedValues(patientEvidence?.findings),
    source,
    confidence: computeConfidence({
      hasPatientEvidence: !!patientEvidence,
      matchedPatient,
      retrievedCount: retrieved.length,
      ocrConfidence: patientEvidence?.ocrConfidence,
    }),
    suggestedAction,
    safetyNote: "This is not a confirmed diagnosis — confirm every result with a licensed clinician.",
    urgency,
  };
}

async function prepareAnswerContext(userMessage, patientId, conversationHistory = []) {
  const msgText = typeof userMessage === "string" ? userMessage : "";

  if (matchesEmergency(msgText)) {
    return {
      emergency: true,
      outOfScope: false,
      reply: EMERGENCY_REPLY,
      sources: [],
      disclaimer: DISCLAIMER,
      prompt: null,
      retrieved: [],
      explanation: buildExplanation({ emergency: true, answerText: EMERGENCY_REPLY }),
    };
  }

  if (isOutOfScope(msgText)) {
    return {
      emergency: false,
      outOfScope: true,
      reply: OUT_OF_SCOPE_REPLY,
      sources: [],
      disclaimer: DISCLAIMER,
      prompt: null,
      retrieved: [],
      explanation: buildExplanation({ outOfScope: true, answerText: OUT_OF_SCOPE_REPLY }),
    };
  }

  const [retrieved, patientEvidence] = await Promise.all([
    retrieve(msgText, patientId, DEFAULT_TOP_K),
    loadPatientEvidence(patientId),
  ]);
  const sources = mapSources(retrieved);
  const prompt = buildPrompt({
    userMessage: msgText,
    retrievedChunks: retrieved,
    conversationHistory: formatConversationHistory(conversationHistory),
  });

  return {
    emergency: false,
    outOfScope: false,
    reply: null,
    sources,
    disclaimer: DISCLAIMER,
    prompt,
    retrieved,
    patientEvidence,
    explanation: buildExplanation({ retrieved, sources, patientEvidence }),
  };
}

export async function generateAnswer(userMessage, patientId, conversationHistory = []) {
  const prepared = await prepareAnswerContext(userMessage, patientId, conversationHistory);
  if (prepared.emergency || prepared.outOfScope) {
    return {
      reply: prepared.reply,
      sources: prepared.sources,
      disclaimer: prepared.disclaimer,
      explanation: prepared.explanation,
    };
  }

  let reply;
  try {
    if (!groq) {
      reply =
        "MediMind AI is running, but GROQ_API_KEY is not configured yet. " +
        `Retrieved ${prepared.retrieved.length} context chunk(s) — add a Groq key to see the generated answer.`;
    } else {
      reply = await callGroq(prepared.prompt);
      if (!reply) {
        reply =
          "I could not generate a reliable answer just now. Please rephrase with a bit more detail, or try again in a moment.";
      }
    }
  } catch (err) {
    console.error("[rag:generateAnswer] LLM call failed:", err);
    reply =
      prepared.retrieved.length
        ? "I found relevant information in your records, but the answer generator is temporarily unavailable. " +
          "Please try again shortly, and always consult a clinician for clinical decisions."
        : "I could not generate an answer right now. Please try again in a moment.";
  }

  return {
    reply,
    sources: prepared.sources,
    disclaimer: prepared.disclaimer,
    explanation: buildExplanation({
      retrieved: prepared.retrieved,
      sources: prepared.sources,
      patientEvidence: prepared.patientEvidence,
      answerText: reply,
    }),
  };
}

/**
 * Async generator for SSE chat.
 * Yields: { type: 'meta', sources, disclaimer, emergency, outOfScope, explanation }
 *       | { type: 'token', text }
 *       | { type: 'done', reply, explanation }
 */
export async function* generateAnswerStream(userMessage, patientId, conversationHistory = [], { signal } = {}) {
  const prepared = await prepareAnswerContext(userMessage, patientId, conversationHistory);

  yield {
    type: "meta",
    sources: prepared.sources,
    disclaimer: prepared.disclaimer,
    emergency: prepared.emergency,
    outOfScope: prepared.outOfScope,
    explanation: prepared.explanation,
  };

  if (prepared.emergency || prepared.outOfScope) {
    yield { type: "token", text: prepared.reply };
    yield { type: "done", reply: prepared.reply, explanation: prepared.explanation };
    return;
  }

  if (!groq) {
    const reply =
      "MediMind AI is running, but GROQ_API_KEY is not configured yet. " +
      `Retrieved ${prepared.retrieved.length} context chunk(s) — add a Groq key to see the generated answer.`;
    yield { type: "token", text: reply };
    yield {
      type: "done",
      reply,
      explanation: buildExplanation({
        retrieved: prepared.retrieved,
        sources: prepared.sources,
        patientEvidence: prepared.patientEvidence,
        answerText: reply,
      }),
    };
    return;
  }

  let assembled = "";
  try {
    for await (const delta of callGroqStream(prepared.prompt, { signal })) {
      if (signal?.aborted) break;
      assembled += delta;
      yield { type: "token", text: delta };
    }
  } catch (err) {
    console.error("[rag:generateAnswerStream] LLM stream failed:", err);
    if (!assembled) {
      const reply =
        prepared.retrieved.length
          ? "I found relevant information in your records, but the answer generator is temporarily unavailable. " +
            "Please try again shortly, and always consult a clinician for clinical decisions."
          : "I could not generate an answer right now. Please try again in a moment.";
      yield { type: "token", text: reply };
      yield {
        type: "done",
        reply,
        explanation: buildExplanation({
          retrieved: prepared.retrieved,
          sources: prepared.sources,
          patientEvidence: prepared.patientEvidence,
          answerText: reply,
        }),
      };
      return;
    }
  }

  const reply =
    sanitizeReply(assembled) ||
    "I could not generate a reliable answer just now. Please rephrase with a bit more detail, or try again in a moment.";

  if (!assembled) {
    yield { type: "token", text: reply };
  }

  yield {
    type: "done",
    reply,
    explanation: buildExplanation({
      retrieved: prepared.retrieved,
      sources: prepared.sources,
      patientEvidence: prepared.patientEvidence,
      answerText: reply,
    }),
  };
}

export function isRagReady() {
  // Chat can answer accurately with Groq + Mongo report fallback even if Chroma is down.
  return !!GROQ_API_KEY;
}

export default {
  ingestReferenceDoc,
  ingestPatientDoc,
  retrieve,
  retrieveMongoFallback,
  generateAnswer,
  generateAnswerStream,
  isRagReady,
};
