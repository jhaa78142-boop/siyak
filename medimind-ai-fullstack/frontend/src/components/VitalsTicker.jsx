const readouts = [
  "HR 71 BPM · NORMAL", "SPO₂ 98% · HEALTHY", "AI CONFIDENCE 96.2%", "RESP 16/MIN",
  "REPORT ANALYSIS · 2.4s", "TRIAGE ROUTED · CARDIOLOGY", "RAG RETRIEVAL · 340ms",
  "SLEEP 7.6 HRS · GOOD", "OCR EXTRACTION · 99.1% ACC", "SYMPTOM MATCH · 12 CANDIDATES",
];

/**
 * A scrolling strip of live-looking clinical readouts, set in mono. This is
 * the signature motif for the marketing surface — replaces the generic
 * blurred gradient-blob hero with something that reads as "this system is
 * alive and reading real signals," tying back to AIPulse used elsewhere.
 */
export default function VitalsTicker({ tone = "dark" }) {
  const items = [...readouts, ...readouts];
  const isDark = tone === "dark";
  return (
    <div
      className={`relative overflow-hidden border-b ${isDark ? "bg-black/40 border-white/[0.06]" : "bg-white/60 border-slate-200/70"}`}
      aria-hidden="true"
    >
      <div className="animate-marquee flex items-center gap-8 py-2.5 w-max whitespace-nowrap">
        {items.map((t, i) => (
          <span key={i} className="flex items-center gap-8">
            <span className={`font-mono text-[10.5px] tracking-[0.12em] ${isDark ? "text-cyan-300/70" : "text-cyan-700/70"}`}>
              {t}
            </span>
            <span className={`h-1 w-1 rounded-full ${isDark ? "bg-white/20" : "bg-slate-300"}`} />
          </span>
        ))}
      </div>
    </div>
  );
}
