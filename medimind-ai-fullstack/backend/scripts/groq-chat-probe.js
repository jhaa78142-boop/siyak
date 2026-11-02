import "dotenv/config";
import Groq from "groq-sdk";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) { console.error("GROQ_API_KEY not set"); process.exit(1); }
const groq = new Groq({ apiKey: GROQ_API_KEY });

const CANDIDATES = [
  "openai/gpt-oss-120b",
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-20b",
  "canopylabs/orpheus-v1-english",
  "allam-2-7b",
];

async function tryModel(id) {
  const t0 = Date.now();
  try {
    const out = await groq.chat.completions.create({
      model: id,
      messages: [
        { role: "system", content: "You are MediMind AI, a cautious medical assistant. Never diagnose; always recommend clinician follow-up. Answer in 1-2 short sentences." },
        { role: "user", content: "A patient has a runny nose, sore throat, no fever, HbA1c=6.8%. What follow-up should they consider?" },
      ],
      temperature: 0.1, max_tokens: 160, top_p: 0.95, stream: false,
    });
    const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
    const reply = (out?.choices?.[0]?.message?.content || "").replace(/\n/g, " ").trim();
    const tokens = `tok=${out.usage?.total_tokens || "?"}`;
    return { ok: true, id, elapsed, reply: reply.slice(0, 180), tokens };
  } catch (err) {
    return { ok: false, id, err: err.message.slice(0, 180) };
  }
}

async function main() {
  console.log("Testing each candidate chat-capable model on your Groq account...\n");
  const results = await Promise.all(CANDIDATES.map(tryModel));
  for (const r of results) {
    if (r.ok) {
      console.log(`✅ ${r.id.padEnd(32)} [${r.elapsed}s ${r.tokens}] -> "${r.reply}${r.reply.length >= 180 ? "..." : ""}"`);
    } else {
      console.log(`❌ ${r.id.padEnd(32)} ERROR: ${r.err}`);
    }
  }
  const best = results.find((r) => r.ok);
  console.log("\n────────────────────────────────────────────");
  if (best) {
    console.log(`✅ RECOMMENDED DEFAULT GROQ_MODEL=${best.id}`);
  } else {
    console.log("⚠️  None of the chat models worked on this account. Try: (a) new API key in a different Groq org that has Llama access, (b) accept qwen/qwen3.8-27b or openai/gpt-oss-20b if they become available.");
  }
}
main().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
