import VitalsEntry from "../models/VitalsEntry.js";
import HealthScoreEntry from "../models/HealthScoreEntry.js";
import TimelineEvent from "../models/TimelineEvent.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ok, created } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";

function assertPatient(user) {
  if (String(user?.role || "").toUpperCase() !== "PATIENT") {
    throw new ApiError(403, "Only patients may access their personal health records");
  }
}

export const addVitals = asyncHandler(async (req, res) => {
  assertPatient(req.user);
  const { heartRate, spo2, sleepHours, steps, recordedAt } = req.body;
  const entry = await VitalsEntry.create({
    patient: req.user._id,
    heartRate,
    spo2,
    sleepHours,
    steps,
    recordedAt,
  });
  return created(res, entry);
});

export const listVitals = asyncHandler(async (req, res) => {
  assertPatient(req.user);
  const entries = await VitalsEntry.find({ patient: req.user._id }).sort({ recordedAt: 1 }).limit(90);
  return ok(res, entries);
});

export const recordHealthScore = asyncHandler(async (req, res) => {
  assertPatient(req.user);
  const { score, factors, recordedAt } = req.body;
  const entry = await HealthScoreEntry.create({ patient: req.user._id, score, factors, recordedAt });
  req.user.patientProfile.healthScore = entry.score;
  await req.user.save();
  return created(res, entry);
});

export const listHealthScoreTrend = asyncHandler(async (req, res) => {
  assertPatient(req.user);
  const entries = await HealthScoreEntry.find({ patient: req.user._id }).sort({ computedAt: 1 }).limit(24);
  return ok(res, entries);
});

export const addTimelineEvent = asyncHandler(async (req, res) => {
  assertPatient(req.user);
  const { type, title, detail, tone, refId, occurredAt } = req.body;
  const event = await TimelineEvent.create({
    patient: req.user._id,
    type,
    title,
    detail,
    tone,
    refId,
    occurredAt,
  });
  return created(res, event);
});

export const listTimeline = asyncHandler(async (req, res) => {
  assertPatient(req.user);
  const events = await TimelineEvent.find({ patient: req.user._id }).sort({ occurredAt: -1 }).limit(100);
  return ok(res, events);
});
