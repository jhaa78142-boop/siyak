import fs from "node:fs/promises";
import path from "node:path";
import ChatConversation from "../models/ChatConversation.js";
import SymptomCheck from "../models/SymptomCheck.js";
import DrugInteractionCheck from "../models/DrugInteractionCheck.js";
import Report from "../models/Report.js";
import AISummary from "../models/AISummary.js";
import Appointment from "../models/Appointment.js";
import Consent from "../models/Consent.js";
import TimelineEvent from "../models/TimelineEvent.js";
import User from "../models/User.js";
import {
  runSymptomCheck,
  checkDrugInteractions,
  analyzeReportText,
  generateDoctorSummaryDraft,
} from "../services/aiService.js";
import { generateAnswer, generateAnswerStream, ingestPatientDoc } from "../services/ragService.js";
import { extractText } from "../services/ocrService.js";
import { classifyImage } from "../services/cvService.js";
import { synthesizeSpeech } from "../services/elevenLabsService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { enqueueNotification } from "../services/notificationService.js";
import { logAction } from "../services/auditService.js";

// --- Symptom Checker ---
export const symptomCheck = asyncHandler(async (req, res) => {
  const { symptoms = [], freeText = "", duration = "", severity = null } = req.body;
  if (!Array.isArray(symptoms) || (symptoms.length === 0 && !String(freeText || "").trim())) {
    throw new ApiError(400, "Add at least one symptom or a short description");
  }

  const result = await runSymptomCheck({ symptoms, freeText, duration, severity });

  const record = await SymptomCheck.create({
    patient: req.user._id,
    symptoms,
    freeText,
    duration,
    severity: severity == null || severity === "" ? undefined : Number(severity),
    urgency: result.urgency,
    possibleCauses: result.possibleCauses,
    conditions: result.conditions,
    advice: result.advice,
    redFlags: result.redFlags,
    source: result.source,
    disclaimer: result.disclaimer,
  });

  await TimelineEvent.create({
    patient: req.user._id,
    type: "Symptom",
    title: `Logged: ${symptoms.slice(0, 2).join(", ") || "symptom check"}`,
    detail: `AI triage rated urgency: ${result.urgency}`,
    tone: result.urgency === "Low" ? "neutral" : "warn",
    refId: record._id,
  });

  return created(res, record);
});

// --- Drug Interaction Checker ---
export const drugInteractionCheck = asyncHandler(async (req, res) => {
  const { drugs = [], patientId } = req.body;
  if (drugs.length < 2) throw new ApiError(400, "Provide at least two drug names");

  const result = await checkDrugInteractions(drugs);

  const record = await DrugInteractionCheck.create({
    patient: patientId || (req.user.role === "patient" ? req.user._id : undefined),
    checkedBy: req.user._id,
    drugs,
    severity: result.overallSeverity === "None" ? "None" : result.overallSeverity,
    note: result.results.map((r) => r.note).join(" | "),
  });

  return created(res, { ...result, recordId: record._id });
});

export const listDrugInteractionLog = asyncHandler(async (req, res) => {
  const filter = req.user.role === "doctor" ? { checkedBy: req.user._id } : { patient: req.user._id };
  const logs = await DrugInteractionCheck.find(filter).populate("patient", "name").sort({ createdAt: -1 }).limit(50);
  return ok(res, logs);
});

// --- AI Chat ---
async function getOrCreateConversation(user) {
  let convo = await ChatConversation.findOne({ patient: user._id });
  if (!convo) {
    const firstName = user.name?.trim()?.split(/\s+/)[0] || "there";
    convo = await ChatConversation.create({
      patient: user._id,
      messages: [{ role: "ai", text: `Hi ${firstName}, I'm your MediMind AI assistant. How are you feeling today?` }],
    });
  }
  return convo;
}

function prepareUserTurn(convo, message, { regenerate = false } = {}) {
  const text = String(message || "").trim();
  if (regenerate) {
    while (convo.messages.length && convo.messages.at(-1).role === "ai") {
      convo.messages.pop();
    }
    const last = convo.messages.at(-1);
    if (!(last?.role === "user" && last.text === text)) {
      convo.messages.push({ role: "user", text });
    }
  } else {
    convo.messages.push({ role: "user", text });
  }
  return text;
}

function writeSse(res, event, data) {
  res.write(`event: ${event}\n`);
  res.write(`data: ${JSON.stringify(data)}\n\n`);
}

export const chatSend = asyncHandler(async (req, res) => {
  const { message, regenerate = false } = req.body;
  if (!message?.trim()) throw new ApiError(400, "message is required");

  const convo = await getOrCreateConversation(req.user);
  const text = prepareUserTurn(convo, message, { regenerate: !!regenerate });

  const ragResult = await generateAnswer(text, req.user._id, convo.messages);

  convo.messages.push({ role: "ai", text: ragResult.reply, explanation: ragResult.explanation || null });
  convo.lastMessageAt = new Date();
  await convo.save();

  return ok(res, {
    _id: convo._id,
    patient: convo.patient,
    messages: convo.messages,
    lastMessageAt: convo.lastMessageAt,
    createdAt: convo.createdAt,
    updatedAt: convo.updatedAt,
    __v: convo.__v,
    latestSources: ragResult.sources || [],
    latestDisclaimer: ragResult.disclaimer,
    latestExplanation: ragResult.explanation || null,
  });
});

/** Real token streaming via Server-Sent Events (Groq stream). */
export const chatSendStream = asyncHandler(async (req, res) => {
  const { message, regenerate = false } = req.body;
  if (!message?.trim()) throw new ApiError(400, "message is required");

  const convo = await getOrCreateConversation(req.user);
  const text = prepareUserTurn(convo, message, { regenerate: !!regenerate });

  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  if (typeof res.flushHeaders === "function") res.flushHeaders();

  const ac = new AbortController();
  const onResponseClose = () => {
    if (!res.writableEnded) ac.abort();
  };
  const onRequestAborted = () => ac.abort();
  res.on("close", onResponseClose);
  req.on("aborted", onRequestAborted);

  let finalReply = "";
  let sources = [];
  let disclaimer = "";
  let explanation = null;

  try {
    writeSse(res, "status", { phase: "retrieving" });

    for await (const evt of generateAnswerStream(text, req.user._id, convo.messages, { signal: ac.signal })) {
      if (ac.signal.aborted || req.aborted) break;

      if (evt.type === "meta") {
        sources = evt.sources || [];
        disclaimer = evt.disclaimer || "";
        explanation = evt.explanation || explanation;
        writeSse(res, "meta", {
          sources,
          disclaimer,
          emergency: !!evt.emergency,
          outOfScope: !!evt.outOfScope,
          explanation,
          phase: "generating",
        });
      } else if (evt.type === "token") {
        writeSse(res, "token", { t: evt.text });
      } else if (evt.type === "done") {
        finalReply = evt.reply || "";
        explanation = evt.explanation || explanation;
      }
    }

    if (!ac.signal.aborted && finalReply) {
      convo.messages.push({ role: "ai", text: finalReply, explanation: explanation || null });
      convo.lastMessageAt = new Date();
      await convo.save();
      writeSse(res, "done", {
        reply: finalReply,
        sources,
        disclaimer,
        explanation,
        conversationId: convo._id,
      });
    } else if (!finalReply && !ac.signal.aborted) {
      writeSse(res, "error", { message: "Empty response from model" });
    }
  } catch (err) {
    console.error("[chatSendStream]", err);
    if (!res.writableEnded) {
      writeSse(res, "error", { message: err?.message || "Stream failed" });
    }
  } finally {
    res.off("close", onResponseClose);
    req.off("aborted", onRequestAborted);
    if (!res.writableEnded) res.end();
  }
});

export const chatHistory = asyncHandler(async (req, res) => {
  const convo = await ChatConversation.findOne({ patient: req.user._id });
  return ok(res, convo || { patient: req.user._id, messages: [] });
});

export const chatReset = asyncHandler(async (req, res) => {
  const firstName = req.user.name?.trim()?.split(/\s+/)[0] || "there";
  const welcome = `Hi ${firstName}, I'm your MediMind AI assistant. How are you feeling today?`;
  let convo = await ChatConversation.findOne({ patient: req.user._id });
  if (!convo) {
    convo = await ChatConversation.create({
      patient: req.user._id,
      messages: [{ role: "ai", text: welcome }],
    });
  } else {
    convo.messages = [{ role: "ai", text: welcome }];
    convo.lastMessageAt = new Date();
    await convo.save();
  }
  return ok(res, convo);
});

export const textToSpeech = asyncHandler(async (req, res) => {
  const audio = await synthesizeSpeech(req.body.text);
  res.set({ "Content-Type": "audio/mpeg", "Content-Length": audio.length, "Cache-Control": "no-store" });
  return res.send(audio);
});

// --- Report Analyzer ---
export const uploadReport = asyncHandler(async (req, res) => {
  if (String(req.user.role).toUpperCase() !== "PATIENT") throw new ApiError(403, "Only patients may upload reports to their record");
  if (!req.file) throw new ApiError(400, "No file uploaded");

  const rejectFile = async (statusCode, message) => {
    await fs.rm(req.file.path, { force: true });
    throw new ApiError(statusCode, message);
  };
  const reportType = req.body.reportType || "Lab";
  if (!["Lab", "Prescription", "Imaging", "Other"].includes(reportType)) {
    await rejectFile(400, "Choose a supported document type.");
  }
  const reportSubType = String(req.body.reportSubType || "xray").toLowerCase();
  if (reportType === "Imaging" && !["xray", "mri"].includes(reportSubType)) {
    await rejectFile(400, "Choose whether this scan is an X-ray or MRI.");
  }

  const extension = req.file.originalname.split(".").pop()?.toLowerCase();
  const expectedMime = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
  }[extension];
  if (!expectedMime || req.file.mimetype !== expectedMime) {
    await rejectFile(415, "The file MIME type does not match its extension.");
  }
  const isImage = ["png", "jpg", "jpeg", "webp"].includes(extension);
  const isPdf = extension === "pdf";
  if (!isImage && !isPdf) {
    await rejectFile(415, "Upload a PDF, PNG, JPG, or WEBP document.");
  }
  if (reportType === "Imaging" && !isImage) {
    await rejectFile(415, "Image screening accepts PNG, JPG, or WEBP scans. Upload a written scan report as a PDF.");
  }
  const fileBuffer = await fs.readFile(req.file.path);
  const validSignature = isPdf
    ? fileBuffer.subarray(0, 1024).includes(Buffer.from("%PDF-"))
    : extension === "png"
      ? fileBuffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      : extension === "jpg" || extension === "jpeg"
        ? fileBuffer[0] === 0xff && fileBuffer[1] === 0xd8 && fileBuffer[2] === 0xff
        : fileBuffer.subarray(0, 4).toString() === "RIFF"
          && fileBuffer.subarray(8, 12).toString() === "WEBP";
  if (!validSignature) {
    await rejectFile(415, "The file content does not match its extension or is unreadable.");
  }

  const report = await Report.create({
    patient: req.user._id,
    uploadedBy: req.user._id,
    fileName: req.file.originalname,
    filePath: req.file.path,
    mimeType: req.file.mimetype,
    fileSizeBytes: req.file.size,
    reportType,
    analysis: { status: "processing" },
  });

  if (reportType === "Imaging") {
    const imagingResult = await classifyImage(req.file.path, reportSubType);
    report.imaging = {
      subType: reportSubType,
      ...imagingResult,
      disclaimer: "Automated screening result from a research-grade model - not a diagnosis. A radiologist/physician must confirm.",
    };
    report.analysis = { status: "done", processedAt: new Date() };
    await report.save();

    await TimelineEvent.create({
      patient: req.user._id,
      type: "Report",
      title: `${report.reportType} uploaded`,
      detail: imagingResult.message || imagingResult.label || "Imaging screening completed",
      tone: imagingResult.status === "done" ? "warn" : "neutral",
      refId: report._id,
    });

    const result = report.toObject();
    delete result.filePath;
    return created(res, result);
  }

  let ocrResult;
  try {
    ocrResult = await extractText(req.file.path, req.file.mimetype);
  } catch (error) {
    console.error(`[uploadReport] Text extraction failed for ${report._id}:`, error);
    ocrResult = { text: "", error: error.message || "Document text extraction failed." };
  }

  // Log OCR details for debugging
  if (ocrResult.confidence != null) {
    console.info(`[uploadReport] OCR: source=${ocrResult.source}, confidence=${ocrResult.confidence}%, textLen=${(ocrResult.text || "").length}`);
  }
  if (ocrResult.error) {
    console.warn(`[uploadReport] OCR error: ${ocrResult.error}`);
  }

  const text = ocrResult.text || "";
  const readableText = text.trim().length >= 20;
  const analysis = readableText
    ? await analyzeReportText(text, reportType)
    : null;

  // If model detected prescription vs lab, keep DB type aligned when client sent Lab/Other
  if (analysis?.documentKind === "Prescription" || analysis?.documentKind === "Lab") {
    report.reportType = analysis.documentKind;
  }

  report.analysis = {
    status: readableText ? "done" : "failed",
    summary: readableText ? analysis.summary : "No readable text was extracted from this document.",
    plainLanguage: readableText ? analysis.plainLanguage : "",
    documentKind: readableText ? analysis.documentKind : reportType,
    findings: readableText ? analysis.findings || [] : [],
    medications: readableText ? analysis.medications || [] : [],
    meta: readableText ? analysis.meta || {} : {},
    flags: readableText ? analysis.flags || [] : [],
    rawExtractedText: text,
    ocrConfidence: ocrResult.confidence ?? null,
    ocrSource: ocrResult.source || null,
    source: readableText ? analysis.source : null,
    disclaimer: analysis?.disclaimer || "Text extraction failed. Try a clearer image or searchable PDF.",
    error: readableText ? "" : ocrResult.error || "The extracted text was too short to analyze reliably.",
    processedAt: new Date(),
  };
  await report.save();
  if (report.analysis.status === "done") {
    enqueueNotification({
      userId: req.user._id,
      triggerType: "report-ready",
      title: "Your report analysis is ready",
      body: `The analysis for your ${report.reportType.toLowerCase()} report is ready to review.`,
      idempotencyKey: `report-ready:${report._id}`,
    }).catch((error) => {
      console.error(`[aiController:uploadReport] could not queue report notification for ${report._id}:`, error.message);
    });
  }

  if (readableText) {
    ingestPatientDoc(req.user._id, report._id, text).catch((err) =>
      console.error(`[aiController:uploadReport] RAG ingest failed for report ${report._id}:`, err.message)
    );
  }

  await TimelineEvent.create({
    patient: req.user._id,
    type: "Report",
    title: `${report.reportType} report uploaded`,
    detail: report.analysis.summary,
    tone: report.analysis.flags?.length ? "warn" : "good",
    refId: report._id,
  });

  const result = report.toObject();
  delete result.filePath;
  return created(res, result);
});

export const downloadPatientReport = asyncHandler(async (req, res) => {
  if (String(req.user.role).toUpperCase() !== "PATIENT") throw new ApiError(403, "Patient access is required");
  const report = await Report.findOne({ _id: req.params.id, patient: req.user._id }).select("fileName filePath");
  if (!report) throw new ApiError(404, "Report not found");
  const absolutePath = path.resolve(report.filePath);
  const uploadRoot = path.resolve("uploads");
  if (!absolutePath.startsWith(`${uploadRoot}${path.sep}`)) throw new ApiError(404, "Report file is unavailable");
  await fs.access(absolutePath);
  await logAction(req.user, "Downloaded own report", {
    resourceId: report._id,
    outcome: "allowed",
    requestId: req.requestId,
  });
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.download(absolutePath, path.basename(report.fileName));
});

export const listReports = asyncHandler(async (req, res) => {
  if (String(req.user.role).toUpperCase() !== "PATIENT") {
    throw new ApiError(403, "Use patient consent to access shared reports");
  }
  const reports = await Report.find({ patient: req.user._id })
    .select("-filePath")
    .sort({ createdAt: -1 })
    .limit(100);
  return ok(res, reports);
});

// --- AI Patient Summary (doctor-facing) ---
export const generateSummary = asyncHandler(async (req, res) => {
  const { patientId, appointmentId } = req.body;
  if (!patientId) throw new ApiError(400, "A patient must be selected");
  const now = new Date();
  const consents = await Consent.find({
    patient: patientId,
    doctor: req.user._id,
    status: "active",
    expiresAt: { $gt: now },
  }).select("reports purpose");
  const permittedIds = [...new Set(consents.flatMap((consent) => consent.reports.map(String)))];
  if (!permittedIds.length) {
    await logAction(req.user, "Denied AI summary without active report consent", {
      resourceId: patientId,
      outcome: "denied",
      requestId: req.requestId,
    });
    throw new ApiError(403, "The patient has not shared reports for an AI summary");
  }
  if (appointmentId) {
    const appointment = await Appointment.exists({
      _id: appointmentId,
      doctor: req.user._id,
      patient: patientId,
    });
    if (!appointment) throw new ApiError(403, "The appointment does not belong to this doctor and patient");
  }
  const reports = await Report.find({ _id: { $in: permittedIds }, patient: patientId })
    .select("fileName reportType analysis createdAt");
  const sources = reports.map((report) => ({
    id: report._id,
    reference: `${report.fileName} (${report.reportType}, ${report.createdAt.toISOString().slice(0, 10)})`,
    type: report.reportType,
    reportDate: report.analysis?.meta?.reportDate || "",
    text: report.analysis?.rawExtractedText
      || JSON.stringify({ summary: report.analysis?.summary, findings: report.analysis?.findings || [] }),
  })).filter((source) => source.text && source.text !== "{}");
  let result;
  try {
    result = await generateDoctorSummaryDraft(sources);
  } catch (error) {
    await logAction(req.user, "AI summary generation failed", {
      resourceId: patientId,
      outcome: "failed",
      requestId: req.requestId,
    });
    throw new ApiError(error.statusCode || 503, error.statusCode === 422
      ? error.message
      : "AI clinical summary is unavailable. No summary was generated.");
  }
  const summary = await AISummary.create({
    patient: patientId,
    doctor: req.user._id,
    appointment: appointmentId || undefined,
    sourceReports: sources.map((source) => source.id),
    sourceReferences: sources.map((source) => ({ report: source.id, label: source.reference })),
    missingInformation: [
      ...result.missingInformation,
      "Only reports explicitly shared with this doctor were included.",
    ],
    ...result,
  });
  await logAction(req.user, "Generated AI clinical summary draft", {
    resourceId: summary._id,
    requestId: req.requestId,
  });
  return created(res, summary);
});

export const listSummaries = asyncHandler(async (req, res) => {
  if (String(req.user.role).toUpperCase() !== "DOCTOR") throw new ApiError(403, "Doctor access is required");
  const permittedIds = new Set((await Consent.distinct("reports", {
    doctor: req.user._id,
    status: "active",
    expiresAt: { $gt: new Date() },
  })).map(String));
  const candidates = await AISummary.find({ doctor: req.user._id, sourceReports: { $exists: true, $ne: [] } })
    .populate("patient", "fullName")
    .sort({ createdAt: -1 })
    .limit(100);
  return ok(res, candidates.filter((summary) => summary.sourceReports.every((id) => permittedIds.has(String(id)))).slice(0, 50));
});

export const reviewSummary = asyncHandler(async (req, res) => {
  const { action, text } = req.body;
  if (!["approve", "edit", "reject"].includes(action)) throw new ApiError(400, "Choose approve, edit, or reject");
  if (action === "edit" && (!String(text || "").trim() || String(text).length > 10000)) {
    throw new ApiError(400, "A reviewed summary of at most 10,000 characters is required");
  }
  const summary = await AISummary.findOne({ _id: req.params.id, doctor: req.user._id });
  if (!summary) throw new ApiError(404, "AI summary not found");
  const activeIds = new Set((await Consent.distinct("reports", {
    doctor: req.user._id,
    patient: summary.patient,
    status: "active",
    expiresAt: { $gt: new Date() },
  })).map(String));
  if (!summary.sourceReports.every((id) => activeIds.has(String(id)))) {
    await logAction(req.user, "Denied AI summary review after consent expiry or revocation", {
      resourceId: summary._id,
      outcome: "denied",
      requestId: req.requestId,
    });
    throw new ApiError(403, "Consent for one or more source reports has expired or been revoked");
  }
  const previousValue = summary.doctorApprovedText || "";
  const approvedText = action === "approve" ? summary.summaryText : action === "edit" ? String(text).trim() : "";
  summary.reviewStatus = action === "approve" ? "approved" : action === "edit" ? "edited" : "rejected";
  summary.doctorApprovedText = approvedText || undefined;
  summary.reviewedBy = req.user._id;
  summary.reviewedAt = new Date();
  summary.reviewHistory.push({
    action,
    previousValue,
    newValue: approvedText,
    reviewer: req.user._id,
  });
  await summary.save();
  await logAction(req.user, "Reviewed AI clinical summary", {
    resourceId: summary._id,
    requestId: req.requestId,
  });
  return ok(res, summary, "AI summary review saved");
});
