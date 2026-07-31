import { useInView } from "../hooks/useInView";
import { useCountUp } from "../hooks/useCountUp";

export default function StatCounter({ value, suffix = "", label }) {
  const [ref, inView] = useInView({ threshold: 0.4 });
  const count = useCountUp(value, { duration: 2200, start: inView });

  return (
    <div ref={ref} className="text-center">
      <div className="font-display text-5xl md:text-6xl text-teal-light tabular-nums">
        {count.toLocaleString()}
        <span>{suffix}</span>
      </div>
      {/* Amber accent line — gives each stat a visual anchor */}
      <div className="mt-3 mb-2 mx-auto w-8 h-0.5 bg-amber opacity-70" aria-hidden="true" />
      <div className="text-xs sm:text-sm uppercase tracking-[0.18em] text-steel font-medium">
        {label}
      </div>
    </div>
  );
}
