import fs from "node:fs/promises";
import path from "node:path";
import Consent from "../models/Consent.js";
import Report from "../models/Report.js";
import { logAction } from "../services/auditService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { enqueueNotification } from "../services/notificationService.js";

async function getAuthorizedReport(doctorId, reportId) {
  const consent = await Consent.findOne({
    doctor: doctorId,
    reports: reportId,
    status: "active",
    expiresAt: { $gt: new Date() },
  }).select("_id patient purpose expiresAt");
  if (!consent) return null;
  const report = await Report.findOne({ _id: reportId, patient: consent.patient });
  return report ? { consent, report } : null;
}

export const downloadSharedReport = asyncHandler(async (req, res) => {
  const access = await getAuthorizedReport(req.user._id, req.params.reportId);
  if (!access) {
    await logAction(req.user, "Denied shared report download", {
      resourceId: req.params.reportId,
      outcome: "denied",
      requestId: req.requestId,
    });
    throw new ApiError(403, "This report is not currently shared with you");
  }
  const absolutePath = path.resolve(access.report.filePath);
  const uploadRoot = path.resolve("uploads");
  if (!absolutePath.startsWith(`${uploadRoot}${path.sep}`)) {
    throw new ApiError(404, "Report file is unavailable");
  }
  await fs.access(absolutePath);
  await logAction(req.user, "Downloaded consent-shared report", {
    resourceId: access.report._id,
    outcome: "allowed",
    requestId: req.requestId,
  });
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.download(absolutePath, path.basename(access.report.fileName));
});

export const updateReportReview = asyncHandler(async (req, res) => {
  const { action, summary } = req.body;
  const validActions = ["start", "needs_clarification", "accept_ai", "edit", "reject_ai"];
  if (!validActions.includes(action)) throw new ApiError(400, "Unsupported report review action");
  if (action === "edit" && (!String(summary || "").trim() || String(summary).length > 10000)) {
    throw new ApiError(400, "A reviewed summary of at most 10,000 characters is required");
  }
  const access = await getAuthorizedReport(req.user._id, req.params.reportId);
  if (!access) {
    await logAction(req.user, "Denied report review without active consent", {
      resourceId: req.params.reportId,
      outcome: "denied",
      requestId: req.requestId,
    });
    throw new ApiError(403, "This report is not currently shared with you");
  }

  const report = access.report;
  const previousValue = report.doctorReview?.reviewedSummary || "";
  let newStatus = report.doctorReview?.status || "awaiting_review";
  let decision = report.doctorReview?.aiDraftDecision || "pending";
  let reviewedSummary = previousValue;
  if (action === "start") newStatus = "in_review";
  if (action === "needs_clarification") newStatus = "needs_clarification";
  if (action === "accept_ai") {
    if (!String(report.analysis?.summary || "").trim()) throw new ApiError(422, "There is no AI draft to accept");
    decision = "accepted";
    reviewedSummary = report.analysis.summary;
    newStatus = "reviewed";
  }
  if (action === "edit") {
    decision = "edited";
    reviewedSummary = String(summary).trim();
    newStatus = "reviewed";
  }
  if (action === "reject_ai") {
    decision = "rejected";
    reviewedSummary = "";
    newStatus = "reviewed";
  }
  report.doctorReview.status = newStatus;
  report.doctorReview.aiDraftDecision = decision;
  report.doctorReview.reviewedSummary = reviewedSummary;
  report.doctorReview.reviewer = req.user._id;
  report.doctorReview.reviewedAt = new Date();
  report.doctorReview.history.push({
    action,
    previousValue,
    newValue: reviewedSummary,
    reviewer: req.user._id,
  });
  await report.save();
  await logAction(req.user, "Reviewed consent-shared report", {
    resourceId: report._id,
    requestId: req.requestId,
  });
  if (newStatus === "reviewed") {
    await enqueueNotification({
      userId: access.consent.patient,
      triggerType: "report-reviewed",
      title: "Shared report review completed",
      body: "Your doctor completed a review of a report you shared.",
      idempotencyKey: `report-reviewed:${report._id}:${report.doctorReview.reviewedAt.getTime()}`,
    });
  }
  return ok(res, {
    _id: report._id,
    doctorReview: report.doctorReview,
  }, "Report review saved");
});
