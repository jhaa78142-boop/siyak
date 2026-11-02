import mongoose from "mongoose";

const paymentOrderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    product: { type: String, required: true, enum: ["professional"] },
    amountPaise: { type: Number, required: true },
    currency: { type: String, required: true, enum: ["INR"] },
    status: {
      type: String,
      required: true,
      enum: [
        "PENDING",
        "OBSERVED_SUCCESS",
        "MANUAL_REVIEW",
        "RECONCILED",
        "FAILED",
        "EXPIRED",
        "CANCELLED",
        "INITIATION_FAILED",
      ],
      default: "PENDING",
      index: true,
    },
    gatewayPaymentId: { type: String, default: "" },
    utr: { type: String, default: "" },
    webhookDeliveryIds: { type: [String], default: [] },
    reconciledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

paymentOrderSchema.index({ product: 1, status: 1, createdAt: -1 });

export default mongoose.model("PaymentOrder", paymentOrderSchema);
