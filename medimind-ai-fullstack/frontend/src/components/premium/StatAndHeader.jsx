import { motion } from "framer-motion";
import { useCountUp } from "../../hooks/useCountUp";
import { CardSpotlight } from "./Effects";
import { Chip } from "./Controls";
import { fadeUp } from "./motion";

function MiniSpark({ data = [], color = "var(--mm-accent)" }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 72;
  const h = 28;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} className="opacity-80" aria-hidden>
      <polyline fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

export function PremiumStatCard({
  icon: Icon,
  label,
  value,
  delta,
  deltaTone = "good",
  spark,
  index = 0,
  className = "",
}) {
  const animated = useCountUp(value);
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      initial="hidden"
      animate="show"
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className={className}
    >
      <CardSpotlight className="rounded-[1.1rem] h-full">
        <div className="mm-metric h-full">
          <div className="flex items-start justify-between gap-3">
            {Icon && (
              <div className="mm-metric-icon relative overflow-hidden">
                <div
                  className="absolute inset-0 opacity-60"
                  style={{
                    background: "linear-gradient(135deg, color-mix(in srgb, var(--mm-accent) 35%, transparent), transparent)",
                  }}
                />
                <Icon size={17} strokeWidth={2.2} className="relative" />
              </div>
            )}
            {delta && (
              <Chip tone={deltaTone === "good" ? "good" : deltaTone === "warn" ? "warn" : deltaTone === "bad" ? "bad" : "neutral"}>
                {delta}
              </Chip>
            )}
          </div>
          <p className="mm-metric-value tabular-nums">{animated}</p>
          <div className="flex items-end justify-between gap-2 mt-1">
            <p className="mm-metric-label">{label}</p>
            {spark && <MiniSpark data={spark} />}
          </div>
        </div>
      </CardSpotlight>
    </motion.div>
  );
}

export function PageHeader({ eyebrow, title, description, actions, className = "" }) {
  return (
    <motion.header
      className={`mm-welcome !mb-0 ${className}`}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="min-w-0">
        {eyebrow && <p className="mm-eyebrow">{eyebrow}</p>}
        <h1 className="mm-title">{typeof title === "string" ? title : title}</h1>
        {description && <p className="mm-desc">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </motion.header>
  );
}
