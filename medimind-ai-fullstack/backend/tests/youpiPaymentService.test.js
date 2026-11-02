import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  formatRupees,
  PROFESSIONAL_PRICE_PAISE,
  verifyYoupiWebhookSignature,
} from "../services/youpiPaymentService.js";

test("keeps the Professional demo checkout amount fixed in paise", () => {
  assert.equal(PROFESSIONAL_PRICE_PAISE, 79900);
  assert.equal(formatRupees(PROFESSIONAL_PRICE_PAISE), "799.00");
});

test("formats paise without floating point arithmetic", () => {
  assert.equal(formatRupees(5), "0.05");
  assert.equal(formatRupees(10000), "100.00");
  assert.throws(() => formatRupees(1.5), /non-negative safe integer/);
  assert.throws(() => formatRupees(-1), /non-negative safe integer/);
});

test("verifies YouPI signatures against the exact raw webhook bytes", () => {
  const secret = "local-test-secret";
  const body = Buffer.from('{"event":"RECONCILED","amountPaise":79900}');
  const signature = createHmac("sha256", secret).update(body).digest("hex");

  assert.equal(verifyYoupiWebhookSignature(body, `sha256=${signature}`, secret), true);
  assert.equal(verifyYoupiWebhookSignature(body, signature, secret), true);
  assert.equal(verifyYoupiWebhookSignature(Buffer.from(`${body} `), signature, secret), false);
  assert.equal(verifyYoupiWebhookSignature(body, "sha256=invalid", secret), false);
  assert.equal(verifyYoupiWebhookSignature(body, signature, ""), false);
});
