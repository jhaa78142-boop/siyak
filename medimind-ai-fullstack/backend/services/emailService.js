import { enqueueNotification } from "./notificationService.js";

const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
})[character]);

export async function sendEmail({ userId, subject, html, type = "system", idempotencyKey }) {
  const jobs = await enqueueNotification({
    userId,
    triggerType: type,
    title: subject,
    body: html?.replace(/<[^>]+>/g, "").slice(0, 300) || "",
    emailHtml: html,
    idempotencyKey,
  });
  return { queued: jobs.some(({ channel, deliveryStatus }) => channel === "email" && deliveryStatus === "queued") };
}

export const templates = {
  welcome: (name) => ({
    subject: "Welcome to MediMind AI",
    html: `<p>Hi ${escapeHtml(name)},</p><p>Welcome to MediMind AI. Your account is ready — start by completing your health profile.</p>`,
  }),
  appointmentConfirmed: (name, doctorName, when) => ({
    subject: "Your appointment is confirmed",
    html: `<p>Hi ${escapeHtml(name)},</p><p>Your appointment with ${escapeHtml(doctorName)} on ${escapeHtml(when)} is confirmed.</p>`,
  }),
  appointmentReminder: (name, doctorName, when) => ({
    subject: "Upcoming appointment reminder",
    html: `<p>Hi ${escapeHtml(name)},</p><p>Reminder: you have an appointment with ${escapeHtml(doctorName)} on ${escapeHtml(when)}.</p>`,
  }),
  prescriptionReady: (name, doctorName) => ({
    subject: "New prescription available",
    html: `<p>Hi ${escapeHtml(name)},</p><p>${escapeHtml(doctorName)} has added a new prescription to your MediMind account.</p>`,
  }),
  doctorVerificationDecision: (name, approved, reason) => ({
    subject: approved ? "You're verified on MediMind AI" : "Update on your doctor verification",
    html: approved
      ? `<p>Hi ${escapeHtml(name)},</p><p>Your license has been verified. You can now accept patients.</p>`
      : `<p>Hi ${escapeHtml(name)},</p><p>We couldn't verify your submission: ${escapeHtml(reason || "please re-submit your details.")}</p>`,
  }),
};
