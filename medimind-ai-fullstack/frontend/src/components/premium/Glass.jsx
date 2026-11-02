import { forwardRef } from "react";
import { motion } from "framer-motion";
import { CardSpotlight } from "./Effects";
import { springSoft } from "./motion";

export function GlassCard({
  children,
  className = "",
  spotlight = true,
  hover = true,
  padding = true,
  as: Tag = "div",
  ...props
}) {
  const inner = (
    <Tag
      className={[
        "relative overflow-hidden rounded-[1.15rem] border border-[var(--mm-border)]",
        "bg-[var(--mm-surface)] backdrop-blur-xl",
        "shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_28px_-18px_rgba(15,23,42,0.18)]",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit]",
        "before:bg-[linear-gradient(180deg,rgba(255,255,255,0.55),transparent_42%)] before:opacity-60 dark:before:opacity-10",
        padding ? "p-5 md:p-[1.35rem]" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </Tag>
  );

  const wrapped = spotlight ? (
    <CardSpotlight className="h-full rounded-[1.15rem]">{inner}</CardSpotlight>
  ) : (
    inner
  );

  if (!hover) return wrapped;

  return (
    <motion.div
      className="h-full"
      whileHover={{ y: -3 }}
      transition={springSoft}
    >
      {wrapped}
    </motion.div>
  );
}

export function BentoGrid({ children, className = "", cols = "auto" }) {
  const colClass =
    cols === 2
      ? "grid-cols-1 md:grid-cols-2"
      : cols === 3
        ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
        : cols === 4
          ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
          : "grid-cols-1 md:grid-cols-2 xl:grid-cols-12";
  return <div className={`grid gap-4 ${colClass} ${className}`}>{children}</div>;
}

export function BentoTile({ children, className = "", span = 4, rowSpan = 1 }) {
  const spanMap = {
    3: "xl:col-span-3",
    4: "xl:col-span-4",
    5: "xl:col-span-5",
    6: "xl:col-span-6",
    7: "xl:col-span-7",
    8: "xl:col-span-8",
    12: "xl:col-span-12",
  };
  return (
    <div className={`${spanMap[span] || "xl:col-span-4"} ${rowSpan > 1 ? "xl:row-span-2" : ""} ${className}`}>
      {children}
    </div>
  );
}

export const Surface = forwardRef(function Surface({ children, className = "", ...props }, ref) {
  return (
    <div ref={ref} className={`mm-surface ${className}`} {...props}>
      {children}
    </div>
  );
});
