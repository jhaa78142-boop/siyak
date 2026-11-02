import "dotenv/config";
import mongoose from "mongoose";
import { generateAnswer, retrieve } from "../services/ragService.js";

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("MONGODB_URI missing");
  await mongoose.connect(uri);

  const User = (await import("../models/User.js")).default;
  const patient = await User.findOne({ role: "patient" }).sort({ createdAt: -1 }).lean();
  const patientId = patient?._id;
  console.log("patient:", patient?.email || patient?.name || patientId || "(none)");

  const questions = [
    "I have a mild fever and body ache for 2 days. How urgent is this?",
    "Is it generally safe to take paracetamol with blood pressure medicine?",
    "Explain my last lab report in simple terms and what I should ask my doctor.",
  ];

  for (const q of questions) {
    console.log("\n=== Q:", q);
    const chunks = await retrieve(q, patientId, 5);
    console.log("chunks:", chunks.length, chunks.map((c) => c.metadata?.title || c.source));
    const ans = await generateAnswer(q, patientId, []);
    console.log("reply:", (ans.reply || "").slice(0, 420));
    console.log("sources:", ans.sources?.length || 0);
  }

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});