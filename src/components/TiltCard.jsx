import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

/**
 * Wraps any card content with a cursor-following 3D tilt effect.
 * Disabled automatically on:
 *   - Touch devices (no mousemove events)
 *   - prefers-reduced-motion (accessibility preference)
 */
export default function TiltCard({ children, className = "", maxTilt = 8 }) {
  const ref = useRef(null);

  // Disable on touch or reduced-motion
  const prefersReduced = typeof window !== "undefined" && window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = typeof window !== "undefined" && "ontouchstart" in window;

  if (prefersReduced || isTouch) {
    return (
      <div className={`relative ${className}`}>
        {children}
      </div>
    );
  }

  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Snappier spring — stiffness 200/damping 22 is more precise, less floaty
  const springX = useSpring(x, { stiffness: 200, damping: 22 });
  const springY = useSpring(y, { stiffness: 200, damping: 22 });

  const rotateX = useTransform(springY, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(springX, [0, 1], [-maxTilt, maxTilt]);
  const glowX = useTransform(springX, [0, 1], ["0%", "100%"]);
  const glowY = useTransform(springY, [0, 1], ["0%", "100%"]);

  function handleMouseMove(e) {
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  }

  function handleMouseLeave() {
    x.set(0.5);
    y.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={`relative will-change-transform ${className}`}
    >
      {/* cursor-following sheen */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle at ${glowX} ${glowY}, rgba(20,184,173,0.14), transparent 60%)`,
        }}
      />
      {children}
    </motion.div>
  );
}
