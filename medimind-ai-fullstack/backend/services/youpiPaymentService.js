import { createHmac, timingSafeEqual } from "node:crypto";

export const PROFESSIONAL_PRICE_PAISE = 79900;

export function verifyYoupiWebhookSignature(rawBody, signature, secret) {
  if (!Buffer.isBuffer(rawBody) || !secret || typeof signature !== "string") return false;
  const providedHex = signature.replace(/^sha256=/i, "");
  if (!/^[a-f0-9]{64}$/i.test(providedHex)) return false;

  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const provided = Buffer.from(providedHex, "hex");
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export function formatRupees(amountPaise) {
  if (!Number.isSafeInteger(amountPaise) || amountPaise < 0) {
    throw new RangeError("amountPaise must be a non-negative safe integer.");
  }
  return `${Math.floor(amountPaise / 100)}.${String(amountPaise % 100).padStart(2, "0")}`;
}

export default { PROFESSIONAL_PRICE_PAISE, verifyYoupiWebhookSignature, formatRupees };
