import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from its previous value to `target` over `duration` ms
 * using an ease-out curve. Pass a number (or a numeric string like "82%",
 * "16,550", "$1,240") — the component only animates the numeric part and
 * re-applies any prefix/suffix/formatting around it.
 *
 * Respects prefers-reduced-motion by snapping straight to the target.
 */
export function useCountUp(target, { duration = 700 } = {}) {
  const parsed = parseNumeric(target);
  const [display, setDisplay] = useState(parsed.value);
  const prevRef = useRef(parsed.value);
  const frameRef = useRef(null);

  useEffect(() => {
    const reduceMotion = typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (Number.isNaN(parsed.value)) {
      setDisplay(parsed.value);
      return;
    }

    if (reduceMotion) {
      prevRef.current = parsed.value;
      setDisplay(parsed.value);
      return;
    }

    const from = prevRef.current;
    const to = parsed.value;
    if (from === to) return;

    const start = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOut(progress);
      setDisplay(from + (to - from) * eased);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = to;
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed.value, duration]);

  if (Number.isNaN(parsed.value)) return target;
  const rounded = parsed.decimals > 0 ? display.toFixed(parsed.decimals) : Math.round(display);
  const formatted = parsed.hasComma ? Number(rounded).toLocaleString() : String(rounded);
  return `${parsed.prefix}${formatted}${parsed.suffix}`;
}

function parseNumeric(input) {
  if (typeof input === "number") {
    return { value: input, prefix: "", suffix: "", decimals: 0, hasComma: false };
  }
  const str = String(input ?? "");
  const match = str.match(/^([^\d-]*)(-?[\d,]*\.?\d*)(.*)$/);
  if (!match) return { value: NaN, prefix: "", suffix: str, decimals: 0, hasComma: false };
  const [, prefix, numPart, suffix] = match;
  const clean = numPart.replace(/,/g, "");
  const value = parseFloat(clean);
  const decimals = clean.includes(".") ? clean.split(".")[1].length : 0;
  return { value, prefix, suffix, decimals, hasComma: numPart.includes(",") };
}
