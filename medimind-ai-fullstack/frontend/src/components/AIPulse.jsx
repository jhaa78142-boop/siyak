import { motion, useReducedMotion } from "framer-motion";

/**
 * AI Pulse — MediMind AI's signature visual motif. A breathing ring around a
 * live ECG-style waveform, standing in for "the AI is alive and listening."
 * Nods to the .ecg-line treatment already used on Splash, built as one
 * reusable component instead of a one-off per page.
 *
 * states:
 *  - idle: slow breathing pulse, waveform gently animates
 *  - thinking: faster pulse + faster waveform sweep (use while composing a reply)
 *  - success: brief resolve animation then settles back to idle-still
 */
export default function AIPulse({ state = "idle", size = 40, tone = "cyan" }) {
  const tones = {
    cyan: { ring: "#22D3EE", line: "#67E8F9", core: "#0891B2" },
    teal: { ring: "#0EA5A5", line: "#5EEAD4", core: "#0891B2" },
    indigo: { ring: "#6366F1", line: "#A5B4FC", core: "#4F46E5" },
    violet: { ring: "#A855F7", line: "#D8B4FE", core: "#7C3AED" },
  }[tone] || { ring: "#22D3EE", line: "#67E8F9", core: "#0891B2" };

  const reduceMotion = useReducedMotion();
  const ringDuration = state === "thinking" ? 1.1 : state === "success" ? 0.6 : 2.6;
  const waveDuration = state === "thinking" ? 0.9 : 1.8;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-hidden="true">
      {/* outer breathing rings */}
      {!reduceMotion && (
        <>
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ border: `1.5px solid ${tones.ring}` }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.55, 0, 0.55] }}
            transition={{ duration: ringDuration, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{ border: `1px solid ${tones.ring}` }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: ringDuration, repeat: Infinity, ease: "easeInOut", delay: ringDuration * 0.25 }}
          />
        </>
      )}
      {reduceMotion && (
        <span className="absolute inset-0 rounded-full" style={{ border: `1.5px solid ${tones.ring}`, opacity: 0.5 }} />
      )}

      {/* solid core */}
      <div
        className="absolute inset-[15%] rounded-full flex items-center justify-center overflow-hidden"
        style={{ background: `radial-gradient(circle at 35% 30%, ${tones.line}, ${tones.core})` }}
      >
        <svg viewBox="0 0 60 24" className="w-[70%] h-[70%]" preserveAspectRatio="none">
          <motion.polyline
            points="0,12 12,12 16,3 21,21 26,12 60,12"
            fill="none"
            stroke="white"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="90"
            animate={reduceMotion ? {} : { strokeDashoffset: [90, 0, -90] }}
            transition={{ duration: waveDuration, repeat: Infinity, ease: "linear" }}
          />
        </svg>
      </div>
    </div>
  );
}
