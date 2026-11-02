import { useRef, useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useIsLowEnd } from "./hooks";

export function Tilt3D({ children, className = "", intensity = 10 }) {
  const ref = useRef(null);
  const lowEnd = useIsLowEnd();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), {
    stiffness: lowEnd ? 500 : 260,
    damping: lowEnd ? 60 : 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), {
    stiffness: lowEnd ? 500 : 260,
    damping: lowEnd ? 60 : 20,
  });

  const handleMove = (e) => {
    if (lowEnd) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  if (lowEnd) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Magnetic({ children, strength = 14, className = "" }) {
  const ref = useRef(null);
  const lowEnd = useIsLowEnd();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: lowEnd ? 900 : 300, damping: lowEnd ? 80 : 20 });
  const sy = useSpring(y, { stiffness: lowEnd ? 900 : 300, damping: lowEnd ? 80 : 20 });

  const handleMove = (e) => {
    if (lowEnd) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const mx = ((e.clientX - (r.left + r.width / 2)) * strength) / (r.width / 2);
    const my = ((e.clientY - (r.top + r.height / 2)) * strength) / (r.height / 2);
    x.set(Math.max(-strength, Math.min(strength, mx)));
    y.set(Math.max(-strength, Math.min(strength, my)));
  };

  if (lowEnd) {
    return (
      <div ref={ref} className={`inline-block ${className}`}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      className={`inline-block ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function CardSpotlight({ children, className = "", color = "rgba(14,165,165,0.14)" }) {
  const ref = useRef(null);
  const glowRef = useRef(null);
  const lowEnd = useIsLowEnd();

  // Move the glow with a compositor-only transform (no React re-render, no
  // repaint). This mirrors the original `420px circle at x% y%` gradient:
  // an 840px box whose 420px-radius circle fades out at the 65% stop.
  const onMove = (e) => {
    if (lowEnd) return;
    const el = ref.current;
    const glow = glowRef.current;
    if (!el || !glow) return;
    const r = el.getBoundingClientRect();
    glow.style.transform = `translate3d(${e.clientX - r.left}px, ${e.clientY - r.top}px, 0) translate(-50%, -50%)`;
  };

  return (
    <div ref={ref} onMouseMove={onMove} className={`relative group overflow-hidden ${className}`}>
      {!lowEnd && (
        <div
          ref={glowRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-[1] h-[52.5rem] w-[52.5rem] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(420px circle, ${color}, transparent 65%)`,
            transform: "translate3d(-1000px, -1000px, 0)",
            willChange: "transform",
          }}
        />
      )}
      <div className="relative z-[2]">{children}</div>
    </div>
  );
}

export function FloatingParticles({ count = 12, className = "" }) {
  const lowEnd = useIsLowEnd();
  const actual = lowEnd ? 0 : count;
  const particles = useMemo(
    () =>
      Array.from({ length: actual }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1.5,
        duration: Math.random() * 18 + 22,
        delay: Math.random() * 8,
      })),
    [actual]
  );
  if (!actual) return null;
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[color-mix(in_srgb,var(--mm-accent)_35%,transparent)]"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -16, 0], opacity: [0.25, 0.55, 0.25] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

export function LiquidMesh({ intensity = "subtle", className = "", animated = true }) {
  const lowEnd = useIsLowEnd();
  const opacity = intensity === "strong" ? 0.7 : intensity === "medium" ? 0.45 : 0.28;
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} style={{ opacity }} aria-hidden>
      <motion.div
        className="absolute -top-1/3 -left-1/4 w-[70%] h-[70%] rounded-full"
        style={{
          background: "radial-gradient(circle, color-mix(in srgb, var(--mm-accent) 40%, transparent) 0%, transparent 70%)",
          filter: "blur(72px)",
        }}
        animate={lowEnd || !animated ? {} : { scale: [1, 1.06, 1], x: [0, 18, 0], y: [0, -12, 0] }}
        transition={{ duration: 36, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-1/3 -right-1/4 w-[65%] h-[65%] rounded-full"
        style={{
          background: "radial-gradient(circle, color-mix(in srgb, var(--mm-accent-deep) 28%, transparent) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={lowEnd || !animated ? {} : { scale: [1, 1.08, 1], x: [0, -16, 0], y: [0, 14, 0] }}
        transition={{ duration: 42, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export function AuroraBackground({ className = "", animated = true }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <LiquidMesh intensity="subtle" animated={animated} />
      <div
        className="absolute inset-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.035) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 10%, black, transparent)",
        }}
      />
      <NoiseOverlay opacity={0.03} />
    </div>
  );
}

export function NoiseOverlay({ opacity = 0.04, className = "" }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{
        opacity,
        mixBlendMode: "overlay",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
      }}
      aria-hidden
    />
  );
}
