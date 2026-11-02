import { forwardRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { LoaderCircle } from "lucide-react";
import { Magnetic } from "./Effects";
import { easePremium, springPress, springSnappy } from "./motion";
import { roleTheme } from "../../lib/nav";

const sizeMap = {
  sm: "text-xs px-3.5 py-2 gap-1.5 rounded-xl",
  md: "text-sm px-5 py-2.5 gap-2 rounded-xl",
  lg: "text-sm px-6 py-3.5 gap-2 rounded-[0.9rem]",
  icon: "h-10 w-10 rounded-xl",
};

export const PremiumButton = forwardRef(function PremiumButton(
  {
    variant = "primary",
    size = "md",
    role,
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    magnetic = true,
    fullWidth = false,
    className = "",
    children,
    to,
    href,
    disabled,
    ...props
  },
  ref
) {
  const theme = role ? roleTheme[role] : null;
  const gradient = theme?.gradient || "from-teal-600 to-cyan-700";

  const variants = {
    primary: `text-white bg-gradient-to-r ${gradient} shadow-lg shadow-[color-mix(in_srgb,var(--mm-accent)_28%,transparent)] btn-premium`,
    secondary: "text-[var(--mm-ink)] bg-[rgba(15,23,42,0.05)] hover:bg-[rgba(15,23,42,0.08)] dark:bg-white/5 dark:hover:bg-white/10",
    outline:
      "text-[var(--mm-ink)] bg-[var(--mm-surface)] border border-[var(--mm-border)] hover:border-[color-mix(in_srgb,var(--mm-accent)_40%,transparent)]",
    ghost: "text-[var(--mm-muted)] hover:text-[var(--mm-ink)] hover:bg-[rgba(15,23,42,0.05)] dark:hover:bg-white/5",
    danger: "text-rose-600 border border-rose-200/80 bg-rose-50/60 hover:bg-rose-50 dark:bg-rose-500/10 dark:border-rose-500/30",
  };

  const classes = [
    "inline-flex items-center justify-center font-semibold relative overflow-hidden",
    "transition-[box-shadow,filter] duration-300 focus-visible:outline-none",
    "focus-visible:ring-2 focus-visible:ring-[var(--mm-accent)] focus-visible:ring-offset-2",
    sizeMap[size],
    variants[variant],
    fullWidth ? "w-full" : "",
    disabled || loading ? "opacity-50 pointer-events-none" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      {loading ? <LoaderCircle size={15} className="animate-spin" /> : Icon ? <Icon size={size === "lg" ? 16 : 15} /> : null}
      {children}
      {IconRight && !loading ? <IconRight size={size === "lg" ? 16 : 15} /> : null}
    </>
  );

  const motionProps = {
    whileTap: disabled || loading ? undefined : { scale: 0.97 },
    whileHover: disabled || loading ? undefined : { y: -1 },
    transition: springPress,
  };

  let node;
  if (to) {
    node = (
      <motion.div className={fullWidth ? "block w-full" : "inline-block"} {...motionProps}>
        <Link ref={ref} to={to} className={classes} {...props}>
          {content}
        </Link>
      </motion.div>
    );
  } else if (href) {
    node = (
      <motion.a ref={ref} href={href} className={classes} {...motionProps} {...props}>
        {content}
      </motion.a>
    );
  } else {
    node = (
      <motion.button ref={ref} type="button" className={classes} disabled={disabled || loading} {...motionProps} {...props}>
        {content}
      </motion.button>
    );
  }

  if (!magnetic || size === "icon") return node;
  return <Magnetic strength={12}>{node}</Magnetic>;
});

export function IconButton({ icon: Icon, label, className = "", active = false, ...props }) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      whileTap={{ scale: 0.94 }}
      transition={springPress}
      className={[
        "mm-icon-btn relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mm-accent)]",
        active ? "text-[var(--mm-accent-deep)] bg-[var(--mm-accent-soft)]" : "",
        className,
      ].join(" ")}
      {...props}
    >
      <Icon size={15} />
    </motion.button>
  );
}

export function SegmentedControl({ options = [], value, onChange, className = "" }) {
  return (
    <LayoutGroup id="seg">
      <div
        role="tablist"
        className={`inline-flex p-1 rounded-xl bg-[rgba(15,23,42,0.05)] dark:bg-white/5 border border-[var(--mm-border)] ${className}`}
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => onChange?.(opt.value)}
              className={`relative px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors z-0 ${
                active ? "text-[var(--mm-ink)]" : "text-[var(--mm-muted)] hover:text-[var(--mm-ink)]"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="segmented-pill"
                  className="absolute inset-0 rounded-lg bg-[var(--mm-surface)] shadow-sm border border-[var(--mm-border)]"
                  transition={springSnappy}
                  style={{ zIndex: -1 }}
                />
              )}
              <span className="relative z-[1] flex items-center gap-1.5">
                {opt.icon && <opt.icon size={13} />}
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );
}

export function Tabs({ tabs = [], value, onChange, className = "" }) {
  return (
    <div className={`border-b border-[var(--mm-border)] ${className}`}>
      <div role="tablist" className="flex gap-1 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const active = tab.value === value;
          return (
            <button
              key={tab.value}
              role="tab"
              type="button"
              aria-selected={active}
              onClick={() => onChange?.(tab.value)}
              className={`relative px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors ${
                active ? "text-[var(--mm-accent-deep)]" : "text-[var(--mm-muted)] hover:text-[var(--mm-ink)]"
              }`}
            >
              {tab.label}
              {active && (
                <motion.span
                  layoutId="tab-underline"
                  className="absolute left-2 right-2 -bottom-px h-0.5 rounded-full bg-[var(--mm-accent)]"
                  transition={springSnappy}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mm-accent)] ${
        checked ? "bg-[var(--mm-accent)]" : "bg-slate-200 dark:bg-slate-700"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <motion.span
        className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow"
        animate={{ x: checked ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
      />
    </button>
  );
}

export function Chip({ children, tone = "neutral", pulse = false, className = "" }) {
  const map = {
    neutral: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
    good: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    warn: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    bad: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
    info: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
    accent: "bg-[var(--mm-accent-soft)] text-[var(--mm-accent-deep)]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full tracking-wide ${map[tone] || map.neutral} ${className}`}
    >
      {pulse && (
        <i className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" aria-hidden />
      )}
      {children}
    </span>
  );
}

export function Badge({ children, tone = "neutral", className = "" }) {
  return <Chip tone={tone} className={className}>{children}</Chip>;
}
