import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FileText, CalendarCheck, Pill, Stethoscope, Syringe, Download, CalendarDays, Sparkles } from "lucide-react";
import {
  PageStack, Reveal, HeroBand, SectionCard, PageHeader, EmptyState,
  SegmentedControl, PremiumButton, Chip, Toolbar, PageSkeleton, easePremium,
} from "../../components/premium";
import { healthTimeline } from "../../lib/mockData";
import { exportTimelinePdf } from "../../lib/pdfExport";
import { useMountLoading } from "../../hooks/useMountLoading";

const iconMap = { Report: FileText, Appointment: CalendarCheck, Prescription: Pill, Symptom: Stethoscope, Vaccination: Syringe };

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "good", label: "Good" },
  { value: "warn", label: "Attention" },
  { value: "neutral", label: "Neutral" },
];

const toneClass = (tone) => (tone === "good" ? "good" : tone === "warn" ? "warn" : "neutral");

export default function Timeline() {
  const loading = useMountLoading();
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(
    () => (filter === "all" ? healthTimeline : healthTimeline.filter((t) => (t.tone || "neutral") === filter)),
    [filter]
  );

  const groups = useMemo(() => {
    const out = [];
    filtered.forEach((item) => {
      const parts = item.date.split(" ");
      const month = parts[0];
      const year = parts[2] || "";
      let yg = out.find((g) => g.year === year);
      if (!yg) {
        yg = { year, months: [] };
        out.push(yg);
      }
      let mg = yg.months.find((m) => m.month === month);
      if (!mg) {
        mg = { month, items: [] };
        yg.months.push(mg);
      }
      mg.items.push(item);
    });
    return out;
  }, [filtered]);

  const exportPdf = () => {
    try {
      exportTimelinePdf(healthTimeline.map((t) => ({ date: t.date, type: t.type, title: t.title, detail: t.detail })));
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <PageStack fast>
        <PageSkeleton />
      </PageStack>
    );
  }

  return (
    <PageStack>
      {/* Page header */}
      <Reveal index={0}>
        <PageHeader
          eyebrow="Your health story"
          title="Health Timeline"
          description="A chronological record of everything MediMind AI has tracked for you."
          actions={
            <PremiumButton variant="outline" icon={Download} magnetic={false} onClick={exportPdf}>
              Export PDF
            </PremiumButton>
          }
        />
      </Reveal>

      {/* Hero showcase */}
      <Reveal index={1}>
        <HeroBand
          kicker="Everything, in order"
          title={
            <>
              Your health, told as <span>one steady story.</span>
            </>
          }
          copy="Reports, appointments, prescriptions and symptoms — collected into a single, scrollable record you can hand to any clinician."
          cta={
            <PremiumButton role="patient" icon={Download} magnetic={false} onClick={exportPdf}>
              Export full timeline (PDF)
            </PremiumButton>
          }
          right={
            <div className="flex flex-col gap-2 text-sm text-white/80">
              <span className="flex items-center gap-2"><CalendarDays size={15} /> {healthTimeline.length} recorded moments</span>
              <span className="flex items-center gap-2"><Sparkles size={15} /> Auto-organised by date</span>
            </div>
          }
        />
      </Reveal>

      {/* Timeline */}
      <Reveal index={2}>
        <SectionCard
          icon={CalendarDays}
          title="Chronological record"
          subtitle="Grouped by month — filter to focus on what matters"
          action={
            <Toolbar>
              <SegmentedControl options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
            </Toolbar>
          }
        >
          {filtered.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Nothing in this view"
              detail="No events match this filter yet. Switch back to “All” to see your full timeline."
              actionLabel="Show all"
              onAction={() => setFilter("all")}
            />
          ) : (
            <div className="relative pt-1">
              {/* Animated gradient spine */}
              <motion.span
                className="absolute left-3 top-2 bottom-2 w-px origin-top rounded-full"
                style={{ background: "linear-gradient(180deg, var(--mm-accent), var(--mm-accent-deep) 55%, transparent)" }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 1.1, ease: easePremium }}
                aria-hidden
              />

              <div className="space-y-8">
                {groups.map((yg) => (
                  <div key={yg.year}>
                    <div className="sticky top-2 z-[2] mb-4 pl-10">
                      <span className="inline-flex items-center rounded-full border border-[var(--mm-border)] bg-[color-mix(in_srgb,var(--mm-surface)_86%,transparent)] backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[var(--mm-accent-deep)] shadow-sm">
                        {yg.year}
                      </span>
                    </div>

                    <div className="space-y-6">
                      {yg.months.map((mg) => (
                        <div key={`${yg.year}-${mg.month}`}>
                          <p className="pl-10 mb-3 text-xs font-semibold text-[var(--mm-muted)] uppercase tracking-wide">{mg.month}</p>
                          <div className="space-y-5">
                            {mg.items.map((t, i) => {
                              const Icon = iconMap[t.type] || FileText;
                              const dot = toneClass(t.tone);
                              return (
                                <motion.div
                                  key={t.id}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.45, ease: easePremium, delay: i * 0.05 }}
                                  className="relative flex gap-4"
                                >
                                  {/* Rail + glow dot */}
                                  <div className="relative z-[1] w-6 shrink-0 flex justify-center pt-1.5">
                                    <span className="relative block">
                                      <span
                                        className="absolute inset-0 rounded-full bg-[var(--mm-accent-soft)] blur-[6px] scale-[2.2]"
                                        aria-hidden
                                      />
                                      <span className={`mm-timeline-dot ${dot} relative block`} />
                                    </span>
                                  </div>

                                  <div className="min-w-0 flex-1 -mt-0.5">
                                    <div className="flex items-start justify-between gap-3">
                                      <p className="text-sm font-semibold text-[var(--mm-ink)] flex items-center gap-1.5 min-w-0">
                                        <Icon size={14} className="text-[var(--mm-accent-deep)] shrink-0" />
                                        <span className="truncate">{t.title}</span>
                                      </p>
                                      <Chip tone={dot}>{t.type}</Chip>
                                    </div>
                                    <p className="text-[11px] font-medium text-[var(--mm-muted)] mt-1">{t.date}</p>
                                    <p className="text-xs text-[var(--mm-muted)] mt-1 leading-relaxed max-w-2xl">{t.detail}</p>
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[11px] text-[var(--mm-muted)] mt-6 leading-relaxed">
            This timeline is for personal records and continuity of care — it is not a medical diagnosis. Consult a clinician for interpretation.
          </p>
        </SectionCard>
      </Reveal>
    </PageStack>
  );
}
