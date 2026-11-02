import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  Plus,
  X,
  Check,
  AlertCircle,
  CheckCircle2,
  CalendarCheck,
  Sparkles,
  Activity,
  ShieldAlert,
  ClipboardList,
} from "lucide-react";
import {
  PageStack,
  Reveal,
  HeroBand,
  SectionCard,
  PageHeader,
  PremiumButton,
  Chip,
  SegmentedControl,
  ProgressBar,
  EmptyState,
  ErrorState,
  Skeleton,
  useIsLowEnd,
} from "../../components/premium";
import { api } from "../../lib/api";

const commonSymptoms = ["Fever", "Headache", "Cough", "Fatigue", "Sore throat", "Nausea", "Body ache", "Shortness of breath"];

const durationOptions = [
  { value: "Just started", label: "Today" },
  { value: "1-2 days", label: "1–2 days" },
  { value: "3-7 days", label: "3–7 days" },
  { value: "More than a week", label: "1 week+" },
];

const panelMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
};

function urgencyTone(urgency) {
  if (urgency === "Emergency" || urgency === "High") return "bad";
  if (urgency === "Medium") return "warn";
  return "good";
}

const bannerTone = {
  bad: "border-rose-200/70 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
  warn: "border-amber-200/70 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  good: "border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
};

export default function SymptomChecker() {
  const navigate = useNavigate();
  const lowEnd = useIsLowEnd();
  const [selected, setSelected] = useState(["Headache", "Fatigue"]);
  const [custom, setCustom] = useState("");
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("1-2 days");
  const [severity, setSeverity] = useState(4);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggle = (s) => setSelected((sel) => (sel.includes(s) ? sel.filter((x) => x !== s) : [...sel, s]));

  const addCustomSymptom = () => {
    const value = custom.trim();
    if (!value) return;
    setSelected((prev) => (prev.some((s) => s.toLowerCase() === value.toLowerCase()) ? prev : [...prev, value]));
    setCustom("");
  };

  const analyze = async () => {
    // Include any text still sitting in the input (user typed but didn't press +)
    const pending = custom.trim();
    const symptoms = [...selected];
    if (pending && !symptoms.some((s) => s.toLowerCase() === pending.toLowerCase())) {
      symptoms.push(pending);
    }

    const freeText = notes.trim() || pending;
    if (symptoms.length === 0 && !freeText) return;

    setLoading(true);
    setResult(null);
    setError("");
    try {
      if (pending) {
        setSelected(symptoms);
        setCustom("");
      }
      const res = await api.post("/ai/symptom-check", {
        symptoms,
        freeText,
        duration,
        severity,
      });
      const data = res?.data || {};
      const conditions =
        Array.isArray(data.conditions) && data.conditions.length > 0
          ? data.conditions
          : (data.possibleCauses || []).map((name, i) => ({
              name,
              confidence: Math.max(30, 75 - i * 12),
            }));
      setResult({
        urgency: data.urgency || "Low",
        conditions,
        advice: data.advice || "",
        redFlags: data.redFlags || [],
        disclaimer: data.disclaimer,
        source: data.source,
      });
    } catch (err) {
      setError(err?.message || "Symptom analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canAnalyze = selected.length > 0 || custom.trim().length > 0 || notes.trim().length > 0;

  const showBookCta = result && (result.urgency === "High" || result.urgency === "Emergency" || result.urgency === "Medium");

  const bookDoctor = () => {
    try {
      sessionStorage.setItem(
        "medimind:booking:ctx",
        JSON.stringify({
          reason: `${result.urgency} urgency symptoms: ${selected.slice(0, 3).join(", ")}`,
          specialty: "",
        })
      );
    } catch {
      /* ignore */
    }
    navigate("/patient/appointments");
  };

  const adviceLines = result?.advice
    ? String(result.advice)
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean)
    : [];

  return (
    <PageStack>
      <Reveal index={0}>
        <PageHeader
          eyebrow="AI-assisted triage"
          title="Symptom Checker"
          description="Select symptoms or type your own — MediMind AI estimates urgency and possible causes (not a diagnosis)."
          actions={<Chip tone="info">Not a diagnosis</Chip>}
        />
      </Reveal>

      <Reveal index={1}>
        <HeroBand
          kicker={
            <>
              <Sparkles size={12} /> Triage desk
            </>
          }
          title={
            <>
              Listen to your body.
              <span> Act with clarity.</span>
            </>
          }
          copy="Pick the symptoms you notice, add a few details, and MediMind AI estimates urgency and possible causes — steady guidance, never a diagnosis."
          cta={
            <PremiumButton role="patient" size="lg" icon={Sparkles} loading={loading} disabled={!canAnalyze} onClick={analyze}>
              {loading ? "Analyzing symptoms…" : "Run AI analysis"}
            </PremiumButton>
          }
          right={
            <div className="hidden w-64 rounded-2xl border border-white/15 bg-white/5 p-5 text-white backdrop-blur-xl xl:block">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-200/80">At a glance</p>
              <div className="mt-3 space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Symptoms</span>
                  <span className="font-semibold tabular-nums">{selected.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Duration</span>
                  <span className="font-semibold">{duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Severity</span>
                  <span className="font-semibold tabular-nums">{severity}/10</span>
                </div>
              </div>
            </div>
          }
        />
      </Reveal>

      <Reveal index={2} className="w-full">
        <div className="grid w-full gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionCard
              className="h-full"
              icon={Stethoscope}
              title="Tell us what's going on"
              subtitle="Select common symptoms or describe your own"
            >
              <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--mm-muted)]">
                Common symptoms
              </p>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.map((s) => {
                  const active = selected.includes(s);
                  return (
                    <motion.button
                      key={s}
                      type="button"
                      onClick={() => toggle(s)}
                      whileTap={lowEnd ? undefined : { scale: 0.95 }}
                      aria-pressed={active}
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mm-accent)] ${
                        active
                          ? "border-transparent bg-[var(--mm-accent)] text-white shadow-sm"
                          : "border-[var(--mm-border)] text-[var(--mm-muted)] hover:border-[var(--mm-accent)] hover:text-[var(--mm-ink)]"
                      }`}
                    >
                      {active && <Check size={12} />}
                      {s}
                    </motion.button>
                  );
                })}
              </div>

              <p className="mb-2.5 mt-6 text-[11px] font-semibold uppercase tracking-wide text-[var(--mm-muted)]">
                Add your own
              </p>
              <div className="flex gap-2">
                <input
                  value={custom}
                  onChange={(e) => setCustom(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomSymptom();
                    }
                  }}
                  placeholder="e.g. dizziness, chest tightness, joint pain…"
                  aria-label="Type a symptom"
                  className="flex-1 rounded-xl border border-[var(--mm-border)] bg-[var(--mm-surface)] px-3.5 py-2.5 text-sm text-[var(--mm-ink)] outline-none transition focus:border-[var(--mm-accent)] focus-visible:ring-2 focus-visible:ring-[var(--mm-accent)]"
                />
                <PremiumButton
                  size="icon"
                  variant="outline"
                  icon={Plus}
                  magnetic={false}
                  disabled={!custom.trim()}
                  onClick={addCustomSymptom}
                  aria-label="Add typed symptom"
                />
              </div>

              {selected.length > 0 && (
                <div className="mt-5">
                  <div className="mb-2.5 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--mm-muted)]">
                      Selected · {selected.length}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelected([])}
                      className="text-[11px] font-semibold text-[var(--mm-accent-deep)] transition hover:opacity-75"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selected.map((s) => (
                      <motion.span
                        key={s}
                        initial={lowEnd ? false : { opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[var(--mm-accent-soft)] py-1.5 pl-3 pr-1.5 text-xs font-semibold text-[var(--mm-accent-deep)]"
                      >
                        {s}
                        <button
                          type="button"
                          onClick={() => toggle(s)}
                          aria-label={`Remove ${s}`}
                          className="grid h-5 w-5 place-items-center rounded-full transition hover:bg-black/10 dark:hover:bg-white/10"
                        >
                          <X size={11} />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              <label
                htmlFor="sym-notes"
                className="mb-2 mt-6 block text-[11px] font-semibold uppercase tracking-wide text-[var(--mm-muted)]"
              >
                More details (optional)
              </label>
              <textarea
                id="sym-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Describe how you feel in your own words…"
                className="min-h-[84px] w-full resize-y rounded-xl border border-[var(--mm-border)] bg-[var(--mm-surface)] px-3.5 py-2.5 text-sm text-[var(--mm-ink)] outline-none transition focus:border-[var(--mm-accent)] focus-visible:ring-2 focus-visible:ring-[var(--mm-accent)]"
              />

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[var(--mm-muted)]">Duration</p>
                  <SegmentedControl options={durationOptions} value={duration} onChange={setDuration} />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--mm-muted)]">Severity</p>
                    <span className="text-xs font-semibold tabular-nums text-[var(--mm-accent-deep)]">{severity}/10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={severity}
                    onChange={(e) => setSeverity(+e.target.value)}
                    aria-label="Severity out of 10"
                    className="mt-2 w-full accent-[var(--mm-accent)]"
                  />
                </div>
              </div>

              <div className="mt-6">
                <PremiumButton
                  role="patient"
                  fullWidth
                  size="lg"
                  icon={Sparkles}
                  loading={loading}
                  disabled={!canAnalyze}
                  onClick={analyze}
                >
                  {loading ? "Analyzing symptoms…" : "Run AI analysis"}
                </PremiumButton>
                <p className="mt-3 text-center text-[11px] text-[var(--mm-muted)]">
                  Informational guidance only — always confirm with a licensed clinician.
                </p>
              </div>
            </SectionCard>
          </div>

          <div className="lg:col-span-5">
            <SectionCard
              className="h-full"
              icon={Activity}
              title="AI assessment"
            subtitle={result ? "Live AI estimate" : "Awaiting your input"}
            action={
              result ? (
                <Chip tone={urgencyTone(result.urgency)} pulse={result.urgency === "Emergency"}>
                  {result.urgency}
                </Chip>
              ) : null
            }
          >
            <AnimatePresence mode="wait">
              {loading && (
                <motion.div key="loading" {...panelMotion} className="space-y-3">
                  <Skeleton className="h-20 rounded-2xl" />
                  <Skeleton className="h-16 rounded-2xl" />
                  <Skeleton className="h-28 rounded-2xl" />
                </motion.div>
              )}

              {!loading && error && (
                <motion.div key="error" {...panelMotion}>
                  <ErrorState title="Analysis failed" detail={error} onRetry={analyze} />
                </motion.div>
              )}

              {!loading && !error && !result && (
                <motion.div key="empty" {...panelMotion}>
                  <EmptyState
                    icon={Stethoscope}
                    title="No assessment yet"
                    detail="Select symptoms or describe how you feel, then run the AI analysis to see possibilities and urgency."
                  />
                </motion.div>
              )}

              {!loading && !error && result && (
                <motion.div key="result" {...panelMotion} className="space-y-5">
                  <div className={`flex items-start gap-3 rounded-2xl border p-4 ${bannerTone[urgencyTone(result.urgency)]}`}>
                    {urgencyTone(result.urgency) === "good" ? (
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    )}
                    <div>
                      <p className="text-sm font-semibold">Urgency · {result.urgency}</p>
                      <p className="mt-0.5 text-xs opacity-80">Based on selected symptoms, duration and severity.</p>
                    </div>
                  </div>

                  {Array.isArray(result.redFlags) && result.redFlags.length > 0 && (
                    <div className="rounded-2xl border border-rose-200/70 bg-rose-50/80 p-4 dark:border-rose-500/25 dark:bg-rose-500/10">
                      <p className="flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-300">
                        <ShieldAlert size={15} /> Red flags noted
                      </p>
                      <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-rose-700/90 dark:text-rose-300/90">
                        {result.redFlags.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-[var(--mm-muted)]">
                      Possible causes
                    </p>
                    <div className="space-y-3">
                      {(result.conditions || []).map((c, i) => (
                        <div
                          key={c.name}
                          className="rounded-xl border border-[var(--mm-border)] bg-[rgba(15,23,42,0.02)] p-3.5 dark:bg-white/[0.03]"
                        >
                          <div className="mb-2 flex items-center justify-between gap-3">
                            <span className="truncate text-sm font-semibold text-[var(--mm-ink)]">{c.name}</span>
                            <div className="flex shrink-0 items-center gap-2">
                              {c.severity && <Chip tone="warn">{c.severity}</Chip>}
                              <span className="text-xs font-semibold tabular-nums text-[var(--mm-accent-deep)]">
                                {c.confidence}%
                              </span>
                            </div>
                          </div>
                          <ProgressBar value={c.confidence} delay={0.1 + i * 0.06} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {adviceLines.length > 0 && (
                    <div className="rounded-2xl border border-[var(--mm-border)] bg-[var(--mm-accent-soft)] p-4">
                      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--mm-accent-deep)]">
                        <ClipboardList size={13} /> Recommended next steps
                      </p>
                      <ul className="mt-2.5 space-y-2">
                        {adviceLines.map((line, i) => (
                          <li key={i} className="flex gap-2 text-sm leading-relaxed text-[var(--mm-ink)]">
                            <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[var(--mm-accent)]" />
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {showBookCta && (
                    <div className="mt-4 pt-4 border-t border-[var(--mm-border)]">
                      <PremiumButton role="patient" fullWidth size="lg" icon={CalendarCheck} onClick={bookDoctor}>
                        Book a doctor
                      </PremiumButton>
                    </div>
                  )}

                  <Chip
                    tone="info"
                    className="!items-start whitespace-normal !px-3 !py-2 !text-[11px] !font-medium !leading-relaxed"
                  >
                    {result.disclaimer || "This is not a medical diagnosis — consult a doctor for confirmation."}
                  </Chip>
                </motion.div>
              )}
            </AnimatePresence>
            </SectionCard>
          </div>
        </div>
      </Reveal>
    </PageStack>
  );
}
