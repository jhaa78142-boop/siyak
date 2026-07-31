import { motion } from "framer-motion";
import { DURATION, EASE } from "../lib/motion";

/**
 * Single source of truth for scroll-triggered reveal animations.
 *
 * All scroll-reveal behavior across the site routes through this component.
 * Do not hand-roll `whileInView` + `initial` combos elsewhere — use Reveal.
 *
 * Props:
 *   delay      — stagger offset in seconds (default: 0)
 *   direction  — origin of the motion: "up" | "down" | "left" | "right" | "none"
 *   once       — only animate once (default: true)
 *   as         — HTML element to render (default: "div")
 *   className  — forwarded to the motion element
 */
export default function Reveal({
  children,
  delay = 0,
  direction = "up",
  className = "",
  once = true,
  as = "div",
  ...rest
}) {
  const offsets = {
    up:    { y: 28, x: 0 },
    down:  { y: -28, x: 0 },
    left:  { x: 28, y: 0 },
    right: { x: -28, y: 0 },
    none:  { x: 0, y: 0 },
  };
  const { x, y } = offsets[direction] ?? offsets.up;

  const MotionEl = motion[as] ?? motion.div;

  return (
    <MotionEl
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, amount: 0.1 }}
      transition={{ duration: DURATION.base, delay, ease: EASE.enter }}
      style={{ willChange: "opacity, transform" }}
      {...rest}
    >
      {children}
    </MotionEl>
  );
}
