import { Router } from "express";
import { createProfessionalPaymentOrder, getPaymentOrderStatus } from "../controllers/paymentController.js";
import { paymentOrderLimiter } from "../middleware/sensitiveRateLimit.js";

const router = Router();

router.post("/youpi/orders", paymentOrderLimiter, createProfessionalPaymentOrder);
router.get("/youpi/orders/:orderId", getPaymentOrderStatus);

export default router;
