// Shared Recharts theming so every chart across patient/doctor/admin consoles
// looks like it belongs to one system instead of being styled ad hoc.

export const chartAnimation = {
  isAnimationActive: true,
  animationDuration: 900,
  animationEasing: "ease-out", // Recharts doesn't accept cubic-bezier strings; ease-out best matches --ease-premium
};

export const chartAxisTick = { fontSize: 12, fill: "#94A3B8" };
export const chartGridColor = "#EEF2F5";

export const chartTooltipStyle = {
  borderRadius: 14,
  border: "1px solid #E7ECF1",
  fontSize: 12,
  padding: "10px 12px",
  background: "rgba(255,255,255,0.85)",
  backdropFilter: "blur(14px)",
  boxShadow: "0 8px 24px -8px rgba(15,23,42,0.18)",
};

export const chartTooltipLabelStyle = { fontWeight: 600, color: "#0A0F1E", marginBottom: 4 };

/** Custom glass-styled Tooltip content component for Recharts <Tooltip content={...} /> */
export function GlassTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="glass rounded-2xl border border-slate-200/80 px-3.5 py-2.5 shadow-lg shadow-slate-900/10 dark:border-slate-700/80"
      style={{ fontSize: 12 }}
    >
      {label && <p className="font-semibold text-ink mb-1.5">{label}</p>}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full shrink-0" style={{ background: p.color || p.fill }} />
            <span className="text-slate-500">{p.name}</span>
            <span className="font-semibold text-ink ml-auto">{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export const roleChartColors = {
  patient: { line: "#0891B2", fillFrom: "#0EA5A5" },
  doctor: { line: "#4F46E5", fillFrom: "#4F46E5" },
  admin: { line: "#7C3AED", fillFrom: "#7C3AED" },
};
