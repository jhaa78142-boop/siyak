/**
 * Shimmer skeleton primitives — re-exported from premium system for back-compat.
 */
export { Skeleton, PageSkeleton as SkeletonPage } from "./premium/Feedback";
export { Skeleton as default } from "./premium/Feedback";

export function SkeletonStatCards({ count = 4 }) {
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-shell p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="skeleton-shimmer h-10 w-10 rounded-xl" />
            <div className="skeleton-shimmer h-5 w-14 rounded-full" />
          </div>
          <div>
            <div className="skeleton-shimmer h-6 w-20 mb-2" />
            <div className="skeleton-shimmer h-3.5 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard({ className = "", lines = 3 }) {
  return (
    <div className={`card-shell p-6 ${className}`}>
      <div className="skeleton-shimmer h-4 w-40 mb-5" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton-shimmer h-3.5 mb-2.5 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

export function SkeletonChart({ className = "", height = 220 }) {
  return (
    <div className={`card-shell p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="skeleton-shimmer h-4 w-36" />
        <div className="skeleton-shimmer h-5 w-20 rounded-full" />
      </div>
      <div className="skeleton-shimmer w-full rounded-xl" style={{ height }} />
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="card-shell overflow-hidden p-5">
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="skeleton-shimmer h-3 w-16" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-4 mb-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="skeleton-shimmer h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}
