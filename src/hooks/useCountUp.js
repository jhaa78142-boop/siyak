import { useEffect, useRef, useState } from "react";

/**
 * Animates a number from 0 to `end` over `duration` ms once `start` is true.
 * Replaces the react-countup dependency with a small dependency-free hook.
 */
export function useCountUp(end, { duration = 2000, start = false } = {}) {
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!start || startedRef.current) return;
    startedRef.current = true;

    const startTime = performance.now();
    const from = 0;

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (end - from) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    }

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, end, duration]);

  return value;
}
