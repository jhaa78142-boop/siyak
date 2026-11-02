import admin, { isFirebaseReady } from "../config/firebaseAdmin.js";
import Appointment from "../models/Appointment.js";
import MedicineReminder from "../models/MedicineReminder.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { sendTransactionalEmail } from "./emailDelivery.js";
import { enqueueNotification } from "./notificationService.js";

const MAX_RETRIES = 3;
const BATCH_SIZE = 25;

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

function localDateTime(date, timezone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "long",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    time: `${values.hour}:${values.minute}`,
    weekday: values.weekday,
    hour: Number(values.hour),
    day: Number(values.day),
  };
}

function preferenceEnabled(user, notification) {
  if (notification.mandatory) return true;
  const preferences = user.notificationPreferences?.get
    ? user.notificationPreferences.get(notification.triggerType)
    : user.notificationPreferences?.[notification.triggerType];
  return preferences?.[notification.channel] === true;
}

async function deliver(notification) {
  if (notification.triggerType === "appointment-reminder") {
    const appointmentStillMatches = notification.appointment && notification.appointmentScheduledAt
      ? await Appointment.exists({
          _id: notification.appointment,
          status: "Confirmed",
          scheduledAt: notification.appointmentScheduledAt,
        })
      : false;
    if (!appointmentStillMatches) {
      notification.deliveryStatus = "skipped";
      notification.errorMessage = "The appointment is no longer scheduled at this time";
      await notification.save();
      return;
    }
  }
  const user = await User.findById(notification.user)
    .select("email fullName firebaseMessagingTokens notificationPreferences notificationConsents");
  if (!user) throw new Error("Recipient account no longer exists");

  if (!preferenceEnabled(user, notification)) {
    notification.deliveryStatus = "skipped";
    notification.errorMessage = "Disabled by the user's current notification preferences";
    await notification.save();
    return;
  }

  if (notification.consentRequirement && notification.triggerType === "monthly-health-report"
    && user.notificationConsents?.monthlyHealthReport?.granted !== true) {
    notification.deliveryStatus = "skipped";
    notification.consentGranted = false;
    notification.errorMessage = `Required consent not granted: ${notification.consentRequirement}`;
    await notification.save();
    return;
  }

  if (notification.channel === "email") {
    await sendTransactionalEmail({
      to: user.email,
      toName: user.fullName || user.email,
      subject: notification.title,
      html: notification.emailHtml || `<p>${escapeHtml(notification.body)}</p>`,
    });
  } else if (notification.channel === "push") {
    if (!isFirebaseReady()) throw new Error("Push delivery is unavailable: Firebase Admin is not configured");
    const tokens = user.firebaseMessagingTokens || [];
    if (!tokens.length) {
      notification.deliveryStatus = "skipped";
      notification.errorMessage = "No Firebase push token is registered for this user";
      await notification.save();
      return;
    }
    const result = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title: notification.title, body: notification.body },
      data: { notificationId: String(notification._id), triggerType: notification.triggerType },
    });

    const invalidTokens = result.responses.flatMap((response, index) => {
      const code = response.error?.code || "";
      return code.includes("registration-token-not-registered") || code.includes("invalid-registration-token")
        ? [tokens[index]]
        : [];
    });
    if (invalidTokens.length) {
      await User.updateOne({ _id: user._id }, { $pull: { firebaseMessagingTokens: { $in: invalidTokens } } });
    }
    if (result.failureCount) {
      throw new Error(`${result.failureCount} of ${tokens.length} Firebase push deliveries failed`);
    }
  } else if (notification.channel === "sms") {
    notification.deliveryStatus = "skipped";
    notification.errorMessage = "SMS delivery is not configured; no SMS provider is connected";
    await notification.save();
    return;
  } else {
    throw new Error(`Unsupported delivery channel: ${notification.channel}`);
  }

  notification.deliveryStatus = "sent";
  notification.sentAt = new Date();
  notification.errorMessage = "";
  if (notification.channel === "email") notification.emailStatus = "sent";
  await notification.save();
}

export async function processNotificationQueue() {
  for (let count = 0; count < BATCH_SIZE; count += 1) {
    const now = new Date();
    const notification = await Notification.findOneAndUpdate(
      {
        $or: [
          { deliveryStatus: "queued", scheduledAt: { $lte: now } },
          { deliveryStatus: "failed", retryCount: { $lt: MAX_RETRIES }, nextAttemptAt: { $lte: now } },
          { deliveryStatus: "processing", updatedAt: { $lte: new Date(now.getTime() - 5 * 60 * 1000) } },
        ],
      },
      { $set: { deliveryStatus: "processing" } },
      { new: true, sort: { scheduledAt: 1 } }
    ).select("+emailHtml");

    if (!notification) break;

    try {
      await deliver(notification);
    } catch (error) {
      notification.retryCount += 1;
      notification.deliveryStatus = "failed";
      notification.nextAttemptAt = new Date(Date.now() + 60_000 * (2 ** (notification.retryCount - 1)));
      notification.errorMessage = error?.message || "Notification delivery failed";
      if (notification.channel === "email") notification.emailStatus = "failed";
      await notification.save();
      console.error(`[notificationWorker] ${notification._id} delivery failed: ${notification.errorMessage}`);
    }
  }
}

export async function scheduleNotifications() {
  const now = new Date();

  const appointments = await Appointment.find({
    status: "Confirmed",
    scheduledAt: {
      $gt: now,
      $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    },
  }).populate("patient", "fullName notificationTimezone").populate("doctor", "fullName");

  await Promise.all(appointments.map((appointment) => {
    if (!appointment.patient) return undefined;
    const doctorName = appointment.doctor?.fullName || "your doctor";
    const when = new Date(appointment.scheduledAt).toLocaleString("en-US", {
      timeZone: appointment.patient.notificationTimezone || "UTC",
    });
    return enqueueNotification({
      userId: appointment.patient._id,
      triggerType: "appointment-reminder",
      title: "Upcoming appointment reminder",
      body: `Reminder: your appointment with ${doctorName} is scheduled for ${when}.`,
      idempotencyKey: `appointment-reminder:${appointment._id}:${appointment.scheduledAt.getTime()}`,
      appointmentId: appointment._id,
      appointmentScheduledAt: appointment.scheduledAt,
      scheduledAt: new Date(appointment.scheduledAt.getTime() - 24 * 60 * 60 * 1000),
    });
  }));

  const reminders = await MedicineReminder.find({ active: true }).populate("patient", "notificationTimezone");
  await Promise.all(reminders.flatMap((reminder) => {
    if (!reminder.patient || reminder.frequency === "as-needed") return [];
    const local = localDateTime(now, reminder.patient.notificationTimezone);
    if (reminder.frequency === "weekly" && reminder.weeklyDay?.toLowerCase() !== local.weekday.toLowerCase()) return [];
    return (reminder.timesOfDay || [])
      .filter((time) => time === local.time)
      .map((time) => enqueueNotification({
        userId: reminder.patient._id,
        triggerType: "medicine-reminder",
        title: `Medicine reminder: ${reminder.name}`,
        body: `It's time to take ${reminder.name}${reminder.dosage ? ` (${reminder.dosage})` : ""}.`,
        idempotencyKey: `medicine-reminder:${reminder._id}:${local.date}:${time}`,
        scheduledAt: now,
      }));
  }));

  const monthlyUsers = await User.find({
    "notificationConsents.monthlyHealthReport.granted": true,
    $or: [
      { "notificationPreferences.monthly-health-report.email": true },
      { "notificationPreferences.monthly-health-report.push": true },
    ],
  }).select("_id notificationTimezone");

  await Promise.all(monthlyUsers.flatMap((user) => {
    const local = localDateTime(now, user.notificationTimezone);
    if (local.day !== 1 || local.hour < 9) return [];
    const month = local.date.slice(0, 7);
    return [enqueueNotification({
      userId: user._id,
      triggerType: "monthly-health-report",
      title: "Your monthly health report is ready",
      body: "Your monthly health report is ready to review in your MediMind account.",
      consentRequirement: "monthly health report notification consent",
      idempotencyKey: `monthly-health-report:${user._id}:${month}`,
      scheduledAt: now,
    })];
  }));
}

export function startNotificationWorker() {
  let queueRunning = false;
  let schedulerRunning = false;

  const processQueue = async () => {
    if (queueRunning) return;
    queueRunning = true;
    try {
      await processNotificationQueue();
    } catch (error) {
      console.error("[notificationWorker] queue poll failed:", error.message);
    } finally {
      queueRunning = false;
    }
  };

  const schedule = async () => {
    if (schedulerRunning) return;
    schedulerRunning = true;
    try {
      await scheduleNotifications();
    } catch (error) {
      console.error("[notificationWorker] scheduling failed:", error.message);
    } finally {
      schedulerRunning = false;
    }
  };

  void processQueue();
  void schedule();
  setInterval(processQueue, 15_000);
  setInterval(schedule, 60_000);
}
