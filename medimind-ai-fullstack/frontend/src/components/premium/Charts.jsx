import { motion } from "framer-motion";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { GlassTooltip, chartAnimation, chartAxisTick, chartGridColor } from "../../lib/chartTheme";
import { GlassCard } from "./Glass";

export function ChartCard({ title, subtitle, action, children, className = "" }) {
  return (
    <GlassCard spotlight hover={false} className={className}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display font-semibold text-[var(--mm-ink)] tracking-tight">{title}</h3>
          {subtitle && <p className="text-xs text-[var(--mm-muted)] mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </GlassCard>
  );
}

export function PremiumAreaChart({
  data = [],
  dataKey = "value",
  xKey = "label",
  color = "var(--mm-accent)",
  height = 220,
  gradientId = "premiumArea",
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={chartGridColor} strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey={xKey} tick={chartAxisTick} axisLine={false} tickLine={false} />
          <YAxis tick={chartAxisTick} axisLine={false} tickLine={false} />
          <Tooltip content={<GlassTooltip />} cursor={{ stroke: color, strokeOpacity: 0.25 }} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2.2}
            fill={`url(#${gradientId})`}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
            {...chartAnimation}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

export function PremiumLineChart({
  data = [],
  series = [{ key: "value", color: "var(--mm-accent)" }],
  xKey = "label",
  height = 220,
}) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={chartGridColor} strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey={xKey} tick={chartAxisTick} axisLine={false} tickLine={false} />
          <YAxis tick={chartAxisTick} axisLine={false} tickLine={false} />
          <Tooltip content={<GlassTooltip />} cursor={{ stroke: "#94A3B8", strokeDasharray: "4 4" }} />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2.2}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
              {...chartAnimation}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PremiumBarChart({ data = [], dataKey = "value", xKey = "label", color = "var(--mm-accent)", height = 220 }) {
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
          <CartesianGrid stroke={chartGridColor} strokeDasharray="3 6" vertical={false} />
          <XAxis dataKey={xKey} tick={chartAxisTick} axisLine={false} tickLine={false} />
          <YAxis tick={chartAxisTick} axisLine={false} tickLine={false} />
          <Tooltip content={<GlassTooltip />} cursor={{ fill: "rgba(15,23,42,0.04)" }} />
          <Bar dataKey={dataKey} radius={[8, 8, 4, 4]} {...chartAnimation}>
            {data.map((_, i) => (
              <Cell key={i} fill={color} fillOpacity={0.55 + (i % 3) * 0.15} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
