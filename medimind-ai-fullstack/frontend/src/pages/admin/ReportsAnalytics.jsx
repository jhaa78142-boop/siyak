import { PieChart, Pie, Cell, ResponsiveContainer, Legend, LineChart, Line, XAxis, Tooltip, CartesianGrid } from "recharts";
import { Download, TrendingUp } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import Button from "../../components/Button";
import { SkeletonChart, SkeletonStatCards } from "../../components/Skeleton";
import { useMountLoading } from "../../hooks/useMountLoading";
import { useCountUp } from "../../hooks/useCountUp";
import { GlassTooltip, chartAnimation, chartAxisTick, chartGridColor } from "../../lib/chartTheme";
import { userGrowth } from "../../lib/mockData";

const engagement = [
  { name: "AI Chat", value: 38 }, { name: "Reports", value: 22 }, { name: "Appointments", value: 25 }, { name: "Reminders", value: 15 },
];
const colors = ["#7C3AED", "#2563EB", "#0891B2", "#F97316"];
const summaryStats = [["Avg. session length", "6m 42s"], ["Retention (30-day)", "71%"], ["AI response accuracy", "93.4%"], ["Support tickets open", "12"]];

function SummaryStat({ label, value }) {
  const animated = useCountUp(value);
  return (
    <div className="card-shell p-5">
      <p className="font-display text-xl font-semibold text-ink">{animated}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}

export default function ReportsAnalytics() {
  const loading = useMountLoading();

  if (loading) {
    return (
      <div>
        <SectionHeader eyebrow="Insights" title="Reports & Analytics" description="Usage, engagement and system health across the platform." />
        <div className="grid lg:grid-cols-3 gap-5">
          <SkeletonChart className="lg:col-span-2" height={240} />
          <SkeletonChart height={220} />
        </div>
        <div className="mt-5"><SkeletonStatCards /></div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Insights"
        title="Reports & Analytics"
        description="Usage, engagement and system health across the platform."
        action={<Button variant="outline" icon={Download}>Export report</Button>}
      />

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 card-shell p-6">
          <h3 className="font-display font-semibold text-ink mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-violet-600"/> Platform Growth</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={chartAxisTick} />
              <Tooltip content={<GlassTooltip />} />
              <Line type="monotone" dataKey="patients" stroke="#7C3AED" strokeWidth={2.5} dot={false} {...chartAnimation} />
              <Line type="monotone" dataKey="doctors" stroke="#2563EB" strokeWidth={2.5} dot={false} {...chartAnimation} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card-shell p-6">
          <h3 className="font-display font-semibold text-ink mb-4">Feature Engagement</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={engagement} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3} {...chartAnimation}>
                {engagement.map((e, i) => <Cell key={e.name} fill={colors[i]} />)}
              </Pie>
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Tooltip content={<GlassTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mt-5">
        {summaryStats.map(([l, v]) => <SummaryStat key={l} label={l} value={v} />)}
      </div>
    </div>
  );
}
