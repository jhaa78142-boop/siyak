import "dotenv/config";
import Groq from "groq-sdk";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) { console.error("GROQ_API_KEY not set"); process.exit(1); }

const groq = new Groq({ apiKey: GROQ_API_KEY });

const KNOWN_NON_CHAT_PREFIXES = [
  "meta-llama/llama-prompt-guard",
  "openai/gpt-oss-safeguard",
  "whisper-",
];
function isChatModel(id) {
  return !KNOWN_NON_CHAT_PREFIXES.some((p) => id.startsWith(p));
}

async function main() {
  console.log("Fetching available Groq models...\n");
  let models = [];
  try {
    const list = await groq.models.list();
    models = list.data || [];
    console.log(`Found ${models.length} available models:`);
    for (const m of models) {
      const owned = m.owned_by || "groq";
      const ctx = m.context_window || "?";
      const chatTag = isChatModel(m.id) ? "  [chat]" : "  [non-chat, skipped]";
      console.log(`  • ${m.id.padEnd(42)}  owner=${owned.padEnd(14)}  context=${ctx}${chatTag}`);
    }
  } catch (err) {
    console.error("  [warn] models.list() failed:", err.message);
    models = [];
  }
  console.log("\n---");

  const preferred = [
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
    "allam-2-7b",
    "llama-3.3-70b-versatile",
    "llama-3.1-70b-versatile",
    "llama-3.1-8b-instant",
    "llama3-70b-8192",
    "llama3-8b-8192",
    "gemma-7b-it",
    "mixtral-8x7b-32768",
  ];
  const availableIds = new Set((models || []).filter((m) => isChatModel(m.id)).map((m) => m.id));
  const chosenFromPreferred = preferred.find((id) => availableIds.has(id));
  const firstChatModel = (models || []).find((m) => isChatModel(m.id));
  const chosen = chosenFromPreferred || firstChatModel?.id || "qwen/qwen3.8-27b";
  console.log(`Chosen model: ${chosen}`);

  console.log(`\nRunning minimal chat completion on ${chosen}...`);
  const t0 = Date.now();
  const out = await groq.chat.completions.create({
    model: chosen,
    messages: [
      { role: "system", content: "You are a concise medical AI assistant. Answer in 1 sentence." },
      { role: "user", content: "A patient has runny nose and sore throat with no fever and HbA1c of 6.8 — what follow-up do you recommend?" },
    ],
    temperature: 0.1, max_tokens: 140, top_p: 0.95, stream: false,
  });
  const elapsed = ((Date.now() - t0) / 1000).toFixed(2);
  const reply = out?.choices?.[0]?.message?.content || "";
  console.log(`[${elapsed}s] Reply: "${reply.replace(/\n/g, " ")}"`);
  console.log(`Tokens: prompt=${out.usage?.prompt_tokens || "?"} completion=${out.usage?.completion_tokens || "?"} total=${out.usage?.total_tokens || "?"}`);
  console.log("\n✅ Groq API connectivity VERIFIED.");
  console.log(`\n>>> RECOMMENDED DEFAULT for env:  GROQ_MODEL=${chosen}`);
}
main().catch((e) => { console.error("FATAL:", e.message); process.exit(1); });
