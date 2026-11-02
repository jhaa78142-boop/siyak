import { motion } from "framer-motion";
import { PremiumButton } from "./Controls";
import { easePremium } from "./motion";

export function Skeleton({ className = "", style }) {
  return <div className={`skeleton-shimmer rounded-lg ${className}`} style={style} aria-hidden />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-5 animate-in">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="grid xl:grid-cols-3 gap-4">
        <Skeleton className="xl:col-span-2 h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  detail,
  actionLabel,
  onAction,
  actionTo,
  className = "",
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easePremium }}
      className={`flex flex-col items-center justify-center text-center py-10 px-6 ${className}`}
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 blur-2xl opacity-40 bg-[var(--mm-accent-soft)] rounded-full scale-150" />
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative h-16 w-16 rounded-2xl border border-[var(--mm-border)] bg-[var(--mm-surface)] flex items-center justify-center text-[var(--mm-accent)] shadow-sm"
        >
          {Icon ? (
            <Icon size={28} strokeWidth={1.6} />
          ) : (
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
              <circle cx="18" cy="18" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
              <path d="M12 18h12M18 12v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </motion.div>
      </div>
      <p className="font-display font-semibold text-lg text-[var(--mm-ink)] tracking-tight">{title}</p>
      {detail && <p className="text-sm text-[var(--mm-muted)] mt-1.5 max-w-sm leading-relaxed">{detail}</p>}
      {(actionLabel && (onAction || actionTo)) && (
        <div className="mt-5">
          <PremiumButton size="sm" onClick={onAction} to={actionTo}>
            {actionLabel}
          </PremiumButton>
        </div>
      )}
    </motion.div>
  );
}

export function ErrorState({ title = "Something went wrong", detail, onRetry }) {
  return (
    <EmptyState
      title={title}
      detail={detail || "Please try again. If it keeps happening, refresh the page."}
      actionLabel={onRetry ? "Try again" : undefined}
      onAction={onRetry}
    />
  );
}
