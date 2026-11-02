import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpDown, ArrowUp, ArrowDown, Check } from "lucide-react";
import { EmptyState } from "./Feedback";
import { Skeleton } from "./Feedback";
import { easePremium, staggerContainer, fadeUp } from "./motion";

export function PremiumTable({
  columns = [],
  rows = [],
  rowKey = "id",
  loading = false,
  emptyTitle = "Nothing here yet",
  emptyDetail,
  emptyIcon,
  selectable = false,
  selected = [],
  onSelectChange,
  onRowClick,
  className = "",
}) {
  const [sort, setSort] = useState({ key: null, dir: "asc" });

  const sorted = useMemo(() => {
    if (!sort.key) return rows;
    const col = columns.find((c) => c.key === sort.key);
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = col?.sortAccessor ? col.sortAccessor(a) : a[sort.key];
      const bv = col?.sortAccessor ? col.sortAccessor(b) : b[sort.key];
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return sort.dir === "asc" ? av - bv : bv - av;
      return sort.dir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return copy;
  }, [rows, sort, columns]);

  const allSelected = selectable && rows.length > 0 && selected.length === rows.length;

  const toggleAll = () => {
    if (!onSelectChange) return;
    onSelectChange(allSelected ? [] : rows.map((r) => r[rowKey]));
  };

  const toggleOne = (id) => {
    if (!onSelectChange) return;
    onSelectChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  if (loading) {
    return (
      <div className={`rounded-[1.15rem] border border-[var(--mm-border)] bg-[var(--mm-surface)] overflow-hidden ${className}`}>
        <div className="p-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className={`rounded-[1.15rem] border border-[var(--mm-border)] bg-[var(--mm-surface)] ${className}`}>
        <EmptyState icon={emptyIcon} title={emptyTitle} detail={emptyDetail} />
      </div>
    );
  }

  return (
    <div className={`rounded-[1.15rem] border border-[var(--mm-border)] bg-[var(--mm-surface)] overflow-hidden ${className}`}>
      <AnimatePresence>
        {selectable && selected.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-[var(--mm-border)] bg-[var(--mm-accent-soft)]"
          >
            <div className="px-4 py-2.5 text-xs font-semibold text-[var(--mm-accent-deep)]">
              {selected.length} selected
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-[1] bg-[color-mix(in_srgb,var(--mm-surface)_92%,transparent)] backdrop-blur-md">
            <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-[var(--mm-muted)] border-b border-[var(--mm-border)]">
              {selectable && (
                <th className="px-4 py-3.5 w-10">
                  <button
                    type="button"
                    onClick={toggleAll}
                    className={`h-4 w-4 rounded border flex items-center justify-center ${allSelected ? "bg-[var(--mm-accent)] border-[var(--mm-accent)] text-white" : "border-slate-300"}`}
                    aria-label="Select all"
                  >
                    {allSelected && <Check size={10} />}
                  </button>
                </th>
              )}
              {columns.map((col) => {
                const active = sort.key === col.key;
                return (
                  <th key={col.key} className="px-4 py-3.5 whitespace-nowrap">
                    {col.sortable ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 hover:text-[var(--mm-ink)]"
                        onClick={() =>
                          setSort((s) =>
                            s.key === col.key
                              ? { key: col.key, dir: s.dir === "asc" ? "desc" : "asc" }
                              : { key: col.key, dir: "asc" }
                          )
                        }
                      >
                        {col.header}
                        {active ? sort.dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} /> : <ArrowUpDown size={12} className="opacity-40" />}
                      </button>
                    ) : (
                      col.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <motion.tbody variants={staggerContainer} initial="hidden" animate="show">
            {sorted.map((row) => {
              const id = row[rowKey];
              const isSelected = selected.includes(id);
              return (
                <motion.tr
                  key={id}
                  variants={fadeUp}
                  onClick={() => onRowClick?.(row)}
                  className={[
                    "border-b border-[var(--mm-border)]/70 transition-colors group",
                    onRowClick ? "cursor-pointer" : "",
                    isSelected ? "bg-[var(--mm-accent-soft)]" : "hover:bg-[rgba(15,23,42,0.03)] dark:hover:bg-white/[0.03]",
                  ].join(" ")}
                >
                  {selectable && (
                    <td className="px-4 py-3.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => toggleOne(id)}
                        className={`h-4 w-4 rounded border flex items-center justify-center ${isSelected ? "bg-[var(--mm-accent)] border-[var(--mm-accent)] text-white" : "border-slate-300"}`}
                        aria-label="Select row"
                      >
                        {isSelected && <Check size={10} />}
                      </button>
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3.5 text-[var(--mm-ink)] align-middle">
                      <div className="relative">
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none bg-[radial-gradient(120px_circle_at_left,var(--mm-accent-soft),transparent)] transition-opacity" />
                        <div className="relative">{col.cell ? col.cell(row) : row[col.key]}</div>
                      </div>
                    </td>
                  ))}
                </motion.tr>
              );
            })}
          </motion.tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden divide-y divide-[var(--mm-border)]">
        {sorted.map((row) => (
          <button
            key={row[rowKey]}
            type="button"
            onClick={() => onRowClick?.(row)}
            className="w-full text-left p-4 space-y-2 hover:bg-[rgba(15,23,42,0.03)]"
          >
            {columns.slice(0, 4).map((col) => (
              <div key={col.key} className="flex justify-between gap-3 text-sm">
                <span className="text-[var(--mm-muted)] text-xs font-semibold uppercase tracking-wide">{col.header}</span>
                <span className="text-[var(--mm-ink)] text-right">{col.cell ? col.cell(row) : row[col.key]}</span>
              </div>
            ))}
          </button>
        ))}
      </div>
    </div>
  );
}
