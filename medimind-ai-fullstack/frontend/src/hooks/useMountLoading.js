import { useEffect, useState } from "react";

/**
 * Simulates a brief loading state on mount so data-heavy pages don't just
 * pop into existence — matches Skeleton.jsx shapes while `loading` is true.
 * Because the location key changes on every route change (DashboardLayout
 * remounts pages via AnimatePresence), this naturally re-triggers per visit.
 */
export function useMountLoading(delay = 380) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const t = setTimeout(() => setLoading(false), reduceMotion ? 0 : delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return loading;
}
