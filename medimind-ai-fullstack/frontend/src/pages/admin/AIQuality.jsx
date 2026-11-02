import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Gauge, Sparkles } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import { Badge } from "../../components/Bits";
import { useCountUp } from "../../hooks/useCountUp";
import { GlassTooltip, chartAnimation, chartAxisTick, chartGridColor } from "../../lib/chartTheme";
import { aiQualityBreakdown } from "../../lib/mockData";

function StatBlock({ value, label, tone }) {
  const animated = useCountUp(value);
  return (
    <div className="card-shell p-5">
      <p className={`text-2xl font-display font-semibold ${tone}`}>{animated}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}

export default function AIQuality() {
  return (
    <div>
      <SectionHeader eyebrow="Model observability" title="AI Quality Data" description="Accuracy and volume monitoring across every AI module in production." />

      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <StatBlock value="93.4%" label="Blended accuracy (7-day avg)" tone="text-emerald-600" />
        <StatBlock value="16,550" label="AI inferences processed today" tone="text-ink" />
        <StatBlock value="2" label="Modules below accuracy threshold" tone="text-amber-600" />
      </div>

      <div className="card-shell p-6 mb-5">
        <h3 className="font-display font-semibold text-ink mb-4 flex items-center gap-2"><Gauge size={16} className="text-violet-600"/> Accuracy by Module</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={aiQualityBreakdown} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartGridColor} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} width={130} />
            <Tooltip content={<GlassTooltip />} />
            <Bar dataKey="accuracy" fill="#7C3AED" radius={[0, 8, 8, 0]} {...chartAnimation} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card-shell overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs font-semibold text-slate-400 border-b border-slate-100">
              <th className="px-5 py-3.5">Module</th><th className="px-5 py-3.5">Accuracy</th><th className="px-5 py-3.5">Volume (24h)</th><th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody>
            {aiQualityBreakdown.map(m => (
              <tr key={m.name} className="border-b border-slate-50 hover:bg-slate-50/60">
                <td className="px-5 py-3.5 font-medium text-ink flex items-center gap-2"><Sparkles size={13} className="text-violet-400"/>{m.name}</td>
                <td className="px-5 py-3.5 text-slate-600">{m.accuracy}%</td>
                <td className="px-5 py-3.5 text-slate-500">{m.volume.toLocaleString()}</td>
                <td className="px-5 py-3.5"><Badge tone={m.accuracy >= 92 ? "good" : "warn"}>{m.accuracy >= 92 ? "Healthy" : "Monitor"}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
