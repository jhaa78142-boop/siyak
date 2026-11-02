import nodemailer from "nodemailer";
import { brevoClient, brevoSender, isBrevoReady } from "../config/brevo.js";

const smtpUser = process.env.SMTP_EMAIL || process.env.GMAIL_USER;
const smtpPassword = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
const smtpPort = Number(process.env.SMTP_PORT || (smtpHost === "smtp.gmail.com" ? 465 : 587));
const smtpSecure = process.env.SMTP_SECURE
  ? process.env.SMTP_SECURE.toLowerCase() === "true"
  : smtpPort === 465;

const smtpTransporter = smtpUser && smtpPassword
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPassword },
    })
  : null;

async function sendSmtpEmail({ to, toName, subject, html }) {
  if (!smtpTransporter) {
    throw new Error("SMTP email is not configured; set SMTP_EMAIL and SMTP_PASSWORD");
  }

  await smtpTransporter.sendMail({
    from: { name: process.env.BREVO_SENDER_NAME || "MediMind AI", address: smtpUser },
    to: toName ? { name: toName, address: to } : to,
    subject,
    html,
  });
}

export async function sendTransactionalEmail({ to, toName, subject, html }) {
  let brevoError;
  if (isBrevoReady()) {
    try {
      await brevoClient.transactionalEmails.sendTransacEmail({
        sender: brevoSender,
        to: [{ email: to, ...(toName ? { name: toName } : {}) }],
        subject,
        htmlContent: html,
      });
      return "brevo";
    } catch (error) {
      brevoError = error;
      if (!smtpTransporter) throw error;
      console.warn(`[emailDelivery] Brevo delivery failed; retrying with SMTP: ${error.message}`);
    }
  }

  try {
    await sendSmtpEmail({ to, toName, subject, html });
    return "smtp";
  } catch (smtpError) {
    if (brevoError) {
      throw new Error(
        `Email delivery failed with both Brevo (${brevoError.message}) and SMTP (${smtpError.message})`,
        { cause: smtpError }
      );
    }
    throw smtpError;
  }
}
