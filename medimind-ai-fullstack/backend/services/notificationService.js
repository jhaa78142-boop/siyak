import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const notificationTypes = [
  "welcome-registration",
  "email-verification",
  "password-reset",
  "appointment-confirmed",
  "appointment-updated",
  "appointment-reminder",
  "medicine-reminder",
  "report-ready",
  "emergency-alert",
  "monthly-health-report",
  "prescription-ready",
  "doctor-verification",
  "report-shared",
  "report-reviewed",
  "system",
];

const channels = ["email", "push", "sms"];

export async function enqueueNotification({
  userId,
  triggerType,
  title,
  body = "",
  emailHtml,
  scheduledAt = new Date(),
  idempotencyKey,
  mandatoryEmail = false,
  consentRequirement = "",
  appointmentId,
  appointmentScheduledAt,
}) {
  if (!notificationTypes.includes(triggerType)) {
    throw new Error(`Unsupported notification trigger: ${triggerType}`);
  }

  const user = await User.findById(userId).select("notificationPreferences notificationConsents");
  if (!user) throw new Error(`Cannot queue notification: user ${userId} was not found`);

  const preference = user.notificationPreferences?.get
    ? user.notificationPreferences.get(triggerType)
    : user.notificationPreferences?.[triggerType];
  const monthlyConsent = triggerType !== "monthly-health-report"
    || user.notificationConsents?.monthlyHealthReport?.granted === true;

  const jobs = [];
  for (const channel of channels) {
    if (mandatoryEmail && channel !== "email") continue;
    const enabled = mandatoryEmail || preference?.[channel] === true;
    const consentGranted = !consentRequirement || monthlyConsent;
    const deliveryStatus = !enabled || !consentGranted ? "skipped" : "queued";
    const errorMessage = !enabled
      ? "Disabled by the user's notification preferences"
      : !consentGranted
        ? `Required consent not granted: ${consentRequirement}`
        : "";
    const key = idempotencyKey ? `${idempotencyKey}:${channel}` : undefined;
    const notification = {
      user: userId,
      ...(appointmentId ? { appointment: appointmentId, appointmentScheduledAt } : {}),
      triggerType,
      type: triggerType,
      channel,
      title,
      body,
      emailHtml: channel === "email" ? emailHtml : undefined,
      scheduledAt,
      nextAttemptAt: scheduledAt,
      deliveryStatus,
      errorMessage,
      userPreference: preference?.[channel] === true,
      mandatory: mandatoryEmail && channel === "email",
      consentRequirement,
      consentGranted,
      ...(key ? { idempotencyKey: key } : {}),
    };

    if (key) {
      await Notification.updateOne(
        { idempotencyKey: key },
        { $setOnInsert: notification },
        { upsert: true }
      );
    } else {
      await Notification.create(notification);
    }
    jobs.push({ channel, deliveryStatus });
  }
  return jobs;
}

export async function recordDeliveredEmail({ userId, triggerType, title, body }) {
  return Notification.create({
    user: userId,
    triggerType,
    type: triggerType,
    channel: "email",
    title,
    body,
    scheduledAt: new Date(),
    sentAt: new Date(),
    deliveryStatus: "sent",
    userPreference: true,
    mandatory: true,
    emailStatus: "sent",
  });
}
