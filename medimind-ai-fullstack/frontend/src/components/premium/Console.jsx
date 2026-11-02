import { motion } from "framer-motion";
import { GlassCard } from "./Glass";
import { easePremium, fadeUp, staggerContainer, staggerFast } from "./motion";

/**
 * Console kit — composite page primitives built on top of the premium
 * library (GlassCard / motion / tokens). These keep every dashboard page
 * visually identical in rhythm: same stagger, same section chrome,
 * same row/list treatment — so patient / doctor / admin all share the
 * landing-page level of polish.
 */

/* ── Page flow ─────────────────────────────────────────── */

export function PageStack({ children, className = "", fast = false }) {
  return (
    <motion.div
      variants={fast ? staggerFast : staggerContainer}
      initial="hidden"
      animate="show"
      className={`space-y-4 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function Reveal({ children, index = 0, className = "" }) {
  return (
    <motion.div custom={index} variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}

/* ── Hero band (role-tinted, matches the mm-hero language) ─ */

export function HeroBand({ kicker, title, copy, cta, right, children, className = "" }) {
  return (
    <div className={`mm-hero !py-6 md:!py-8 ${className}`}>
      <div className="mm-hero-mesh" aria-hidden />
      <div className="mm-hero-grid" aria-hidden />
      <div className="relative z-[1] flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="min-w-0">
          {kicker && <p className="mm-hero-kicker">{kicker}</p>}
          {title && <h2 className="mm-hero-title">{title}</h2>}
          {copy && <p className="mm-hero-copy">{copy}</p>}
          {cta && <div className="mt-5 flex flex-wrap items-center gap-3">{cta}</div>}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
      {children}
    </div>
  );
}

/* ── Section card — GlassCard + unified head ───────────── */

export function SectionCard({
  icon: Icon,
  title,
  subtitle,
  action,
  children,
  className = "",
  bodyClassName = "",
  padding = true,
  spotlight = true,
  hover = false,
}) {
  const hasHead = Boolean(title || action || subtitle);
  return (
    <GlassCard className={className} padding={false} spotlight={spotlight} hover={hover}>
      {hasHead && (
        <div className="mm-surface-head px-4 pt-4 md:px-6 md:pt-6">
          <div className="min-w-0">
            {title && (
              <h3 className="mm-surface-title">
                {Icon && (
                  <span className="mm-metric-icon" style={{ width: "1.9rem", height: "1.9rem", borderRadius: "0.55rem" }}>
                    <Icon size={14} strokeWidth={2.2} />
                  </span>
                )}
                {title}
              </h3>
            )}
            {subtitle && <p className="mm-surface-sub">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={`${padding ? "px-4 py-4 md:px-6 md:py-6" : ""} ${hasHead ? "!pt-3" : ""} ${bodyClassName}`}>
        {children}
      </div>
    </GlassCard>
  );
}

/* ── Lists & rows ──────────────────────────────────────── */

export function ListRow({ leading, title, meta, trailing, onClick, className = "" }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`mm-row w-full text-left ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[var(--mm-ink)] truncate">{title}</p>
        {meta && <p className="text-xs text-[var(--mm-muted)] truncate mt-0.5">{meta}</p>}
      </div>
      {trailing && <div className="shrink-0 flex items-center gap-2">{trailing}</div>}
    </Tag>
  );
}

export function TimelineRow({ tone = "neutral", title, time, detail, icon: Icon, last = false, trailing }) {
  const dotClass = tone === "good" ? "good" : tone === "warn" ? "warn" : "neutral";
  return (
    <div className="relative flex gap-3.5 pb-5 last:pb-0">
      {!last && (
        <span
          className="absolute left-[0.5rem] top-5 bottom-0 w-px bg-[linear-gradient(180deg,var(--mm-border),transparent)]"
          aria-hidden
        />
      )}
      <span className="relative mt-1.5 shrink-0">
        <span className="absolute inset-0 rounded-full bg-[var(--mm-accent-soft)] blur-[6px] scale-[2.2]" aria-hidden />
        <span className={`mm-timeline-dot ${dotClass} relative block`} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-semibold text-[var(--mm-ink)] flex items-center gap-1.5 min-w-0">
            {Icon && <Icon size={14} className="text-[var(--mm-accent-deep)] shrink-0" />}
            <span className="truncate">{title}</span>
          </p>
          {trailing}
        </div>
        {time && <p className="text-[11px] font-medium text-[var(--mm-muted)] mt-0.5">{time}</p>}
        {detail && <p className="text-xs text-[var(--mm-muted)] mt-1 leading-relaxed">{detail}</p>}
      </div>
    </div>
  );
}

/* ── Bars & mini stats ─────────────────────────────────── */

export function ProgressBar({ value = 0, tone, className = "", delay = 0 }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div
      className={`mm-progress ${className}`}
      role="progressbar"
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.span
        initial={{ width: 0 }}
        animate={{ width: `${v}%` }}
        transition={{ duration: 1.05, ease: easePremium, delay }}
        style={tone ? { background: tone } : undefined}
      />
    </div>
  );
}

export function MiniStat({ label, value, unit, className = "" }) {
  return (
    <div className={`mm-mini-stat ${className}`}>
      <label>{label}</label>
      <strong className="tabular-nums">
        {value}
        {unit && <span>{unit}</span>}
      </strong>
    </div>
  );
}

export function StatGrid({ children, className = "" }) {
  return <div className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-4 ${className}`}>{children}</div>;
}

/* ── Toolbar (search + filters row) ────────────────────── */

export function Toolbar({ children, className = "" }) {
  return (
    <div className={`flex flex-wrap items-center gap-2.5 ${className}`}>
      {children}
    </div>
  );
}

export function IconTile({ icon: Icon, className = "", size = 16 }) {
  return (
    <span className={`mm-metric-icon shrink-0 ${className}`}>
      {Icon && <Icon size={size} strokeWidth={2.2} />}
    </span>
  );
}
