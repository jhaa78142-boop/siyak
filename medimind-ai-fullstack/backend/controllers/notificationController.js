import { asyncHandler } from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Notification from "../models/Notification.js";
import { notificationTypes } from "../services/notificationService.js";

const channels = ["email", "push", "sms"];

function getPreferences(user) {
  const result = {};
  for (const type of notificationTypes) {
    const stored = user.notificationPreferences?.get
      ? user.notificationPreferences.get(type)
      : user.notificationPreferences?.[type];
    result[type] = Object.fromEntries(channels.map((channel) => [
      channel,
      stored?.[channel] === true,
    ]));
  }
  return result;
}

export const getNotificationPreferences = asyncHandler(async (req, res) => {
  return ok(res, {
    preferences: getPreferences(req.user),
    timezone: req.user.notificationTimezone || "UTC",
    pushRegistered: (req.user.firebaseMessagingTokens || []).length > 0,
    monthlyHealthReportConsent: req.user.notificationConsents?.monthlyHealthReport?.granted === true,
  });
});

export const updateNotificationPreferences = asyncHandler(async (req, res) => {
  const { preferences = {}, timezone, monthlyHealthReportConsent } = req.body;
  if (!preferences || typeof preferences !== "object" || Array.isArray(preferences)) {
    throw new ApiError(400, "Notification preferences must be an object");
  }
  if (monthlyHealthReportConsent !== undefined && typeof monthlyHealthReportConsent !== "boolean") {
    throw new ApiError(400, "Monthly health report consent must be a boolean");
  }

  if (timezone !== undefined) {
    if (typeof timezone !== "string" || timezone.length > 100) {
      throw new ApiError(400, "A valid IANA timezone is required");
    }
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    } catch {
      throw new ApiError(400, "A valid IANA timezone is required");
    }
    req.user.notificationTimezone = timezone;
  }

  for (const [type, channelPreferences] of Object.entries(preferences)) {
    if (!notificationTypes.includes(type) || !channelPreferences || typeof channelPreferences !== "object") {
      throw new ApiError(400, `Invalid notification preference: ${type}`);
    }
    for (const [channel, enabled] of Object.entries(channelPreferences)) {
      if (!channels.includes(channel) || typeof enabled !== "boolean") {
        throw new ApiError(400, `Invalid ${channel} preference for ${type}`);
      }
      req.user.set(`notificationPreferences.${type}.${channel}`, enabled);
    }
  }

  if (monthlyHealthReportConsent !== undefined) {
    req.user.set("notificationConsents.monthlyHealthReport.granted", monthlyHealthReportConsent);
    req.user.set("notificationConsents.monthlyHealthReport.grantedAt", monthlyHealthReportConsent ? new Date() : null);
  }

  await req.user.save();
  return ok(res, {
    preferences: getPreferences(req.user),
    timezone: req.user.notificationTimezone,
    pushRegistered: (req.user.firebaseMessagingTokens || []).length > 0,
    monthlyHealthReportConsent: req.user.notificationConsents?.monthlyHealthReport?.granted === true,
  }, "Notification preferences saved");
});

export const registerPushToken = asyncHandler(async (req, res) => {
  const { token } = req.body;
  if (typeof token !== "string" || token.length < 20 || token.length > 4096) {
    throw new ApiError(400, "A valid Firebase messaging token is required");
  }
  if (!(req.user.firebaseMessagingTokens || []).includes(token)) {
    req.user.firebaseMessagingTokens.push(token);
    await req.user.save();
  }
  return ok(res, { registered: true }, "Push device registered");
});

export const removePushToken = asyncHandler(async (req, res) => {
  const { token } = req.body || {};
  if (token !== undefined && typeof token !== "string") {
    throw new ApiError(400, "A Firebase messaging token must be a string");
  }
  req.user.firebaseMessagingTokens = token === undefined
    ? []
    : (req.user.firebaseMessagingTokens || []).filter((savedToken) => savedToken !== token);
  await req.user.save();
  return ok(res, { registered: req.user.firebaseMessagingTokens.length > 0 }, "Push device removed");
});

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    user: req.user._id,
    channel: { $in: ["email", "in-app"] },
  })
    .select("-emailHtml -appointment -appointmentScheduledAt")
    .sort({ createdAt: -1 })
    .limit(100);
  return ok(res, notifications);
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  ).select("-emailHtml -appointment -appointmentScheduledAt");
  if (!notification) throw new ApiError(404, "Notification not found");
  return ok(res, notification);
});
