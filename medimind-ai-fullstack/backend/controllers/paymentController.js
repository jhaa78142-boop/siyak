import { randomUUID } from "node:crypto";
import PaymentOrder from "../models/PaymentOrder.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { created, ok } from "../utils/apiResponse.js";
import {
  formatRupees,
  PROFESSIONAL_PRICE_PAISE,
  verifyYoupiWebhookSignature,
} from "../services/youpiPaymentService.js";

function getGatewayUrl() {
  const value = process.env.YOUPI_API_URL;
  if (!value) throw new ApiError(503, "YouPI checkout is not configured on the server.");

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new ApiError(503, "YOUPI_API_URL must be a valid HTTP or HTTPS URL.");
  }
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new ApiError(503, "YOUPI_API_URL must use HTTP or HTTPS.");
  }
  if (
    process.env.NODE_ENV === "production" &&
    (url.protocol !== "https:" || ["localhost", "127.0.0.1"].includes(url.hostname))
  ) {
    throw new ApiError(503, "A public HTTPS YouPI API URL is required in production.");
  }
  return url;
}

function getReturnUrl(orderId) {
  let origin;
  try {
    origin = new URL(process.env.CLIENT_URL || "http://localhost:5173");
  } catch {
    throw new ApiError(503, "CLIENT_URL must be a valid URL for payment returns.");
  }
  if (process.env.NODE_ENV === "production" && origin.protocol !== "https:") {
    throw new ApiError(503, "CLIENT_URL must use HTTPS in production.");
  }
  origin.pathname = "/";
  origin.search = new URLSearchParams({ payment_order: orderId }).toString();
  origin.hash = "pricing";
  return origin.toString();
}

export const createProfessionalPaymentOrder = asyncHandler(async (_req, res) => {
  const gatewayUrl = getGatewayUrl();
  const merchantId = process.env.YOUPI_MERCHANT_ID;
  if (!merchantId) throw new ApiError(503, "YOUPI_MERCHANT_ID is not configured on the server.");

  const orderId = randomUUID();
  const returnUrl = getReturnUrl(orderId);
  await PaymentOrder.create({
    orderId,
    product: "professional",
    amountPaise: PROFESSIONAL_PRICE_PAISE,
    currency: "INR",
  });

  let response;
  try {
    response = await fetch(new URL("/api/v1/payments", gatewayUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Merchant-Id": merchantId,
      },
      body: JSON.stringify({
        orderId,
        amount: formatRupees(PROFESSIONAL_PRICE_PAISE),
        currency: "INR",
        returnUrl,
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (error) {
    await PaymentOrder.updateOne({ orderId }, { $set: { status: "INITIATION_FAILED" } });
    console.error(`[payments] YouPI create-payment request failed for ${orderId}:`, error);
    throw new ApiError(502, "Could not reach the payment gateway. Please try again later.");
  }

  let gatewayResponse = null;
  try {
    gatewayResponse = await response.json();
  } catch {
    // A non-JSON gateway error is handled below without exposing its response body.
  }

  let checkoutUrl;
  try {
    checkoutUrl = new URL(gatewayResponse?.checkoutUrl);
  } catch {
    checkoutUrl = null;
  }
  if (
    !response.ok ||
    !checkoutUrl ||
    !["https:", "http:"].includes(checkoutUrl.protocol) ||
    (process.env.NODE_ENV === "production" && checkoutUrl.protocol !== "https:")
  ) {
    await PaymentOrder.updateOne({ orderId }, { $set: { status: "INITIATION_FAILED" } });
    console.error(`[payments] YouPI rejected order ${orderId} (HTTP ${response.status}).`);
    throw new ApiError(502, "The payment gateway could not create checkout. Please try again later.");
  }

  await PaymentOrder.updateOne(
    { orderId },
    {
      $set: {
        gatewayPaymentId: typeof gatewayResponse.paymentId === "string"
          ? gatewayResponse.paymentId.slice(0, 200)
          : "",
      },
    }
  );
  return created(
    res,
    {
      orderId,
      checkoutUrl: checkoutUrl.toString(),
      amountPaise: PROFESSIONAL_PRICE_PAISE,
      currency: "INR",
    },
    "Checkout created."
  );
});

export const getPaymentOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(orderId)) {
    throw new ApiError(400, "Invalid payment order ID.");
  }
  const order = await PaymentOrder.findOne({ orderId })
    .select("orderId product amountPaise currency status reconciledAt createdAt updatedAt")
    .lean();
  if (!order) throw new ApiError(404, "Payment order not found.");
  return ok(res, order);
});

export const receiveYoupiWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.YOUPI_WEBHOOK_SECRET;
  if (!secret) return res.status(503).json({ success: false, message: "Webhook verification is not configured." });
  if (!Buffer.isBuffer(req.body)) {
    return res.status(400).json({ success: false, message: "Expected a raw JSON webhook body." });
  }

  const signature = req.get("x-gateway-signature");
  if (!verifyYoupiWebhookSignature(req.body, signature, secret)) {
    return res.status(401).json({ success: false, message: "Invalid gateway signature." });
  }

  let event;
  try {
    event = JSON.parse(req.body.toString("utf8"));
  } catch {
    return res.status(400).json({ success: false, message: "Invalid webhook JSON." });
  }
  if (!event || typeof event !== "object" || Array.isArray(event)) {
    return res.status(400).json({ success: false, message: "Webhook payload must be a JSON object." });
  }

  const orderId = typeof event.orderId === "string" ? event.orderId : "";
  const deliveryId = req.get("x-gateway-delivery-id") || event.deliveryId;
  const headerEvent = req.get("x-gateway-event");
  if (
    !orderId ||
    typeof deliveryId !== "string" ||
    deliveryId.length < 1 ||
    deliveryId.length > 200 ||
    !event.event ||
    (headerEvent && headerEvent !== event.event) ||
    (event.deliveryId && event.deliveryId !== deliveryId)
  ) {
    return res.status(400).json({ success: false, message: "Webhook event is missing valid identifiers." });
  }

  const order = await PaymentOrder.findOne({ orderId }).select("amountPaise currency status webhookDeliveryIds");
  if (!order) return res.status(404).json({ success: false, message: "Payment order not found." });

  const amountPaise = Number(event.amountPaise);
  if (
    !Number.isSafeInteger(amountPaise) ||
    amountPaise !== order.amountPaise ||
    event.amount !== formatRupees(order.amountPaise) ||
    event.currency !== order.currency
  ) {
    return res.status(400).json({ success: false, message: "Webhook amount or currency does not match the order." });
  }

  const statusByEvent = {
    OBSERVED_SUCCESS: "OBSERVED_SUCCESS",
    MANUAL_REVIEW: "MANUAL_REVIEW",
    RECONCILED: "RECONCILED",
    FAILED: "FAILED",
    EXPIRED: "EXPIRED",
    CANCELLED: "CANCELLED",
  };
  const status = statusByEvent[event.event];
  if (!status) return res.status(200).json({ received: true });

  if (
    status === "RECONCILED" &&
    (event.method !== "UPI" ||
      event.settlementState !== "RECONCILED" ||
      typeof event.utr !== "string" ||
      !/^\d{12}$/.test(event.utr))
  ) {
    return res.status(400).json({ success: false, message: "UPI bank-statement reconciliation details are invalid." });
  }
  if (order.status === "RECONCILED" || order.webhookDeliveryIds.includes(deliveryId)) {
    return res.status(200).json({ received: true });
  }

  const update = {
    $addToSet: { webhookDeliveryIds: deliveryId },
    $set: {
      status,
      gatewayPaymentId: typeof event.paymentId === "string" ? event.paymentId.slice(0, 200) : "",
      ...(status === "RECONCILED" ? { utr: event.utr, reconciledAt: new Date() } : {}),
    },
  };
  await PaymentOrder.updateOne(
    { orderId, status: { $ne: "RECONCILED" }, webhookDeliveryIds: { $ne: deliveryId } },
    update
  );
  return res.status(200).json({ received: true });
});
