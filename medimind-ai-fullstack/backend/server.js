import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { connectDB } from "./config/db.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import educationRoutes from "./routes/educationRoutes.js";
import feedbackRoutes from "./routes/feedbackRoutes.js";
import knowledgeBaseRoutes from "./routes/knowledgeBaseRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import drugInfoRoutes from "./routes/drugInfoRoutes.js";
import diseaseInfoRoutes from "./routes/diseaseInfoRoutes.js";
import facilityRoutes from "./routes/facilityRoutes.js";
import consentRoutes from "./routes/consentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { receiveYoupiWebhook } from "./controllers/paymentController.js";
import consultationRoutes from "./routes/consultationRoutes.js";
import { startNotificationWorker } from "./services/notificationWorker.js";
import { resumeInterruptedMedicalDocuments } from "./services/medicalKnowledgeBaseService.js";
import { randomUUID } from "node:crypto";

const app = express();

app.use((req, res, next) => {
  const providedId = req.get("x-request-id");
  req.requestId = providedId && /^[a-zA-Z0-9._-]{1,100}$/.test(providedId)
    ? providedId
    : randomUUID();
  res.setHeader("x-request-id", req.requestId);
  next();
});

const allowedOrigins = new Set([
  process.env.CLIENT_URL || "http://localhost:5173",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
]);

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Vite may pick 5173, 5174, … when the default port is busy
    const isPrivateDevOrigin =
      process.env.NODE_ENV !== "production" &&
      /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+):517\d$/.test(
        origin || ""
      );
    if (!origin || allowedOrigins.has(origin) || isPrivateDevOrigin) return callback(null, true);
    return callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true,
}));
app.post(
  "/api/payments/youpi/webhook",
  express.raw({ type: "application/json", limit: "64kb" }),
  receiveYoupiWebhook
);
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(":method :status :response-time ms"));

// Generic API rate limit — protects auth & AI endpoints from abuse.
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 600,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/api/health", (req, res) => res.json({ success: true, message: "MediMind AI backend is running" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", authRoutes); // ← alias for /api/users/me
app.use("/api/appointments", appointmentRoutes);
app.use("/api/health-records", healthRoutes);
app.use("/api/medicine-reminders", medicineRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/consultations", consultationRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/rag-documents", knowledgeBaseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/drug-info", drugInfoRoutes);
app.use("/api/disease-info", diseaseInfoRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/consents", consentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    startNotificationWorker();
    resumeInterruptedMedicalDocuments().catch((error) => {
      console.error("[server] Could not resume medical document processing:", error);
    });
    app.listen(PORT, () => console.log(`[server] MediMind AI backend listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("[server] Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
