import { BrevoClient } from "@getbrevo/brevo";

export const brevoClient = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY || "placeholder-not-configured",
});

export const brevoSender = {
  email: process.env.BREVO_SENDER_EMAIL,
  name: process.env.BREVO_SENDER_NAME || "MediMind AI",
};

export function isBrevoReady() {
  return Boolean(process.env.BREVO_API_KEY && process.env.BREVO_SENDER_EMAIL);
}
