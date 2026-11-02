import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip, CartesianGrid, YAxis } from "recharts";
import { HeartPulse, FileDown, Users2, Activity, Droplet, Sparkles, TrendingUp } from "lucide-react";
import {
  PageStack, Reveal, HeroBand, SectionCard, ChartCard, PageHeader,
  ProgressBar, ListRow, IconTile, PremiumStatCard, StatGrid, PremiumButton, Chip, Tilt3D, PageSkeleton,
} from "../../components/premium";
import { ProgressRing } from "../../components/Bits";
import { useCountUp } from "../../hooks/useCountUp";
import { useMountLoading } from "../../hooks/useMountLoading";
import { GlassTooltip, chartAnimation, chartAxisTick, chartGridColor, roleChartColors } from "../../lib/chartTheme";
import { healthScoreTrend, currentPatient } from "../../lib/mockData";

const factors = [
  { label: "Vitals stability", score: 88, icon: HeartPulse },
  { label: "Medication adherence", score: 74, icon: Droplet },
  { label: "Activity level", score: 81, icon: Activity },
];

const records = [
  { title: "Annual Physical Exam", date: "Jul 02, 2026", doctor: "Dr. Meera Nair" },
  { title: "Lipid Profile", date: "Aug 10, 2026", doctor: "AI-analyzed · Self-uploaded" },
  { title: "COVID-19 Vaccination (Booster)", date: "Feb 14, 2026", doctor: "City Medical Center" },
];

function factorTone(score) {
  if (score >= 85) return "#10B981";
  if (score >= 70) return "#0D9488";
  return "#F59E0B";
}

export default function HealthScore() {
  const loading = useMountLoading();
  const healthScore = useCountUp(currentPatient.healthScore);

  const scoreVal = currentPatient.healthScore;
  const interpretation =
    scoreVal >= 80
      ? { label: "Excellent", tone: "good", copy: "Your habits are compounding into a strong, steady baseline." }
      : scoreVal >= 65
        ? { label: "Good", tone: "info", copy: "A solid baseline — a few small nudges will lift it further." }
        : scoreVal >= 50
          ? { label: "Fair", tone: "warn", copy: "Some signals need attention — small, consistent changes help most." }
          : { label: "Needs attention", tone: "bad", copy: "Let's focus on the fundamentals together, one step at a time." };

  if (loading) {
    return (
      <PageStack fast>
        <PageSkeleton />
      </PageStack>
    );
  }

  const stats = [
    { icon: HeartPulse, label: "Health score", value: currentPatient.healthScore, delta: "+4 / mo", deltaTone: "good", spark: healthScoreTrend.map((h) => h.score) },
    { icon: Sparkles, label: "Top factor", value: 88, delta: "Vitals", deltaTone: "good" },
    { icon: Droplet, label: "Adherence", value: "74%", delta: "On track", deltaTone: "warn" },
    { icon: Users2, label: "Records stored", value: records.length, delta: "Synced", deltaTone: "info" },
  ];

  return (
    <PageStack>
      {/* Page header */}
      <Reveal index={0}>
        <PageHeader
          eyebrow="AI-derived wellness"
          title="Health Score & Records"
          description="A single score summarising your vitals, adherence and activity — updated weekly."
          actions={
            <PremiumButton variant="outline" icon={FileDown} magnetic={false}>
              Export PDF
            </PremiumButton>
          }
        />
      </Reveal>

      {/* Hero showcase — score studio */}
      <Reveal index={1}>
        <HeroBand
          kicker="Your wellness, composed"
          title={
            <>
              One clear number for a <span>calmer, stronger you.</span>
            </>
          }
          copy="Vitals, adherence and activity distilled into a single score — with the factors behind it, so you always know what moves the needle."
          cta={
            <PremiumButton to="/patient/timeline" role="patient" icon={Activity} magnetic={false}>
              View health timeline
            </PremiumButton>
          }
          right={
            <Tilt3D intensity={9} className="relative">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-white/10 blur-2xl scale-110" aria-hidden />
                <ProgressRing value={scoreVal} size={172} stroke={11} color="#5EEAD4" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-4xl font-semibold text-white tabular-nums">{healthScore}</span>
                  <span className="text-[11px] uppercase tracking-widest text-white/70 mt-1">health score</span>
                </div>
              </div>
            </Tilt3D>
          }
        />
      </Reveal>

      {/* Stats */}
      <Reveal index={2}>
        <StatGrid>
          {stats.map((s, i) => (
            <PremiumStatCard key={s.label} index={i} {...s} />
          ))}
        </StatGrid>
      </Reveal>

      {/* Breakdown + trend */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Reveal index={3}>
          <SectionCard icon={Sparkles} title="Factor breakdown" subtitle="What shapes your score" className="h-full">
            <div className="space-y-4">
              {factors.map((f, i) => (
                <div key={f.label} className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm font-medium text-[var(--mm-ink)]">
                      <f.icon size={15} className="text-[var(--mm-accent-deep)]" />
                      {f.label}
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-[var(--mm-ink)]">{f.score}</span>
                  </div>
                  <ProgressBar value={f.score} tone={factorTone(f.score)} delay={0.1 + i * 0.08} />
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-[var(--mm-border)] bg-[rgba(15,23,42,0.02)] dark:bg-white/[0.02] p-4">
              <div className="flex items-center gap-2.5">
                <Chip tone={interpretation.tone} pulse>{interpretation.label}</Chip>
                <span className="text-xs text-[var(--mm-muted)]">Current reading</span>
              </div>
              <p className="text-xs text-[var(--mm-muted)] mt-2 leading-relaxed">{interpretation.copy}</p>
            </div>
          </SectionCard>
        </Reveal>

        <Reveal index={4} className="lg:col-span-2">
          <ChartCard title="6-Month Trend" subtitle="How your score has moved over time" className="h-full">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={healthScoreTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={chartAxisTick} />
                <YAxis hide domain={[50, 100]} />
                <Tooltip content={<GlassTooltip />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={roleChartColors.patient.line}
                  strokeWidth={3}
                  dot={{ r: 4, fill: roleChartColors.patient.line }}
                  {...chartAnimation}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Reveal>
      </div>

      {/* Records */}
      <Reveal index={5}>
        <SectionCard icon={Users2} title="Health Records" subtitle="Stored, synced and ready to share">
          <div className="space-y-2">
            {records.map((r) => (
              <ListRow
                key={r.title}
                leading={<IconTile icon={TrendingUp} size={14} />}
                title={r.title}
                meta={r.doctor}
                trailing={
                  <>
                    <span className="text-xs text-[var(--mm-muted)] hidden sm:inline">{r.date}</span>
                    <Chip tone="accent">Stored</Chip>
                  </>
                }
              />
            ))}
          </div>
        </SectionCard>
      </Reveal>
    </PageStack>
  );
}
