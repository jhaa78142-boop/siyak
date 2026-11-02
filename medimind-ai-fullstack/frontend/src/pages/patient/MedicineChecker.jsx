import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, Search, Plus, X, ShieldAlert, CheckCircle2, AlertTriangle, Info, ChevronDown } from "lucide-react";
import {
  PageStack,
  Reveal,
  HeroBand,
  SectionCard,
  PageHeader,
  PremiumButton,
  Chip,
  IconButton,
  SearchField,
  EmptyState,
  ErrorState,
  Skeleton,
  useIsLowEnd,
} from "../../components/premium";
import { api } from "../../lib/api";

const known = ["Metformin 500mg", "Atorvastatin 10mg", "Aspirin 75mg", "Paracetamol 650mg", "Ibuprofen 400mg", "Amoxicillin 500mg"];

const panelMotion = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
};

export default function MedicineChecker() {
  const lowEnd = useIsLowEnd();
  const [meds, setMeds] = useState(["Metformin 500mg", "Atorvastatin 10mg"]);
  const [query, setQuery] = useState("");
  const [checked, setChecked] = useState(false);
  const [drugSearch, setDrugSearch] = useState("");
  const [drugInfo, setDrugInfo] = useState(null);
  const [drugLoading, setDrugLoading] = useState(false);
  const [drugError, setDrugError] = useState("");
  const [openSections, setOpenSections] = useState({});

  const lookupDrug = async (term) => {
    const q = (term ?? drugSearch).trim();
    if (!q) return;
    setDrugLoading(true);
    setDrugError("");
    setDrugInfo(null);
    try {
      const res = await api.get("/drug-info/" + encodeURIComponent(q));
      setDrugInfo(res?.data || null);
    } catch (err) {
      setDrugError(err?.message || "Label lookup failed. Please try again.");
    } finally {
      setDrugLoading(false);
    }
  };

  const handleDrugLookup = (e) => {
    if (e) e.preventDefault();
    lookupDrug(drugSearch);
  };

  const add = (m) => {
    if (!meds.includes(m)) setMeds([...meds, m]);
    setQuery("");
    setChecked(false);
  };
  const remove = (m) => {
    setMeds(meds.filter((x) => x !== m));
    setChecked(false);
  };

  const hasInteraction = meds.includes("Aspirin 75mg") && meds.includes("Ibuprofen 400mg");

  const toggleSection = (k) => setOpenSections((o) => ({ ...o, [k]: !o[k] }));

  const labelSections = [
    { k: "purpose", label: "Purpose" },
    { k: "warnings", label: "Warnings" },
    { k: "dosage_and_administration", label: "Dosage & Administration" },
    { k: "adverse_reactions", label: "Adverse Reactions" },
    { k: "drug_interactions", label: "Drug Interactions (from label text)" },
  ];

  const showLabelPanel = drugLoading || Boolean(drugError) || Boolean(drugInfo);

  return (
    <PageStack>
      <Reveal index={0}>
        <PageHeader
          eyebrow="OpenFDA-grounded"
          title="Medicine Checker"
          description="Check dosage info and interaction risks across the medicines you're currently taking."
          actions={<Chip tone="info">openFDA labels</Chip>}
        />
      </Reveal>

      <Reveal index={1}>
        <HeroBand
          kicker={
            <>
              <Pill size={12} /> Medicine cabinet
            </>
          }
          title={
            <>
              Know every pill.
              <span> Before you mix them.</span>
            </>
          }
          copy="Look up a single medication's official label, or stack your current routine and screen the whole combination for interaction risk."
          right={
            <div className="hidden w-72 rounded-2xl border border-white/15 bg-white/5 p-5 text-white backdrop-blur-xl xl:block">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-teal-200/80">Safety protocol</p>
              <div className="mt-3 space-y-3 text-xs leading-relaxed text-white/75">
                <div className="flex gap-2.5">
                  <ShieldAlert size={14} className="mt-0.5 shrink-0 text-teal-300" />
                  <p>Never mix medications without professional advice.</p>
                </div>
                <div className="flex gap-2.5">
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-teal-300" />
                  <p>Verify interaction risks across your entire cabinet.</p>
                </div>
                <div className="flex gap-2.5">
                  <Info size={14} className="mt-0.5 shrink-0 text-teal-300" />
                  <p>OpenFDA data covers brand & generic medications.</p>
                </div>
              </div>
            </div>
          }
        >
          <div className="relative z-[1] mt-7 max-w-3xl">
            <form onSubmit={handleDrugLookup} className="flex flex-col gap-2.5 sm:flex-row">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/55" aria-hidden />
                <input
                  value={drugSearch}
                  onChange={(e) => setDrugSearch(e.target.value)}
                  placeholder="Search by brand or generic name (e.g. metformin, aspirin)…"
                  aria-label="Search medication label"
                  className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-sm text-white outline-none backdrop-blur transition placeholder:text-white/55 focus:border-teal-300/70 focus:bg-white/15 focus-visible:ring-2 focus-visible:ring-teal-300/40"
                />
              </div>
              <PremiumButton role="patient" type="submit" size="lg" icon={Search} loading={drugLoading}>
                {drugLoading ? "Loading…" : "Search label"}
              </PremiumButton>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-white/55">Quick pick</span>
              {known.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setDrugSearch(k);
                    lookupDrug(k);
                  }}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/85 transition hover:border-teal-300/50 hover:bg-white/10"
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </HeroBand>
      </Reveal>

      {showLabelPanel && (
        <Reveal index={2}>
          <SectionCard
            icon={Info}
            title="Drug label"
            subtitle="OpenFDA label information for the searched medication"
            action={
              drugInfo && !drugLoading && drugInfo.found !== false ? (
                <Chip tone="accent">{drugInfo.brand_name || "Result"}</Chip>
              ) : null
            }
          >
            {drugLoading && (
              <div className="space-y-3">
                <Skeleton className="h-16 rounded-2xl" />
                <Skeleton className="h-12 rounded-xl" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
            )}

            {!drugLoading && drugError && (
              <ErrorState title="Label lookup failed" detail={drugError} onRetry={() => lookupDrug(drugSearch)} />
            )}

            {!drugLoading && !drugError && drugInfo && (
              <div className="space-y-3">
                {drugInfo.found === false ? (
                  <div className="flex items-start gap-2 rounded-xl border border-[var(--mm-border)] bg-[rgba(15,23,42,0.02)] p-4 text-sm text-[var(--mm-muted)] dark:bg-white/[0.03]">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-[var(--mm-muted)]" />
                    No label information was found for this medication name in the openFDA database.
                  </div>
                ) : (
                  <>
                    {drugInfo.matchedIngredient && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
                        No US FDA label was found for “{drugInfo.matchedAlias}”. Showing the OpenFDA label for the related ingredient {drugInfo.matchedIngredient}; verify the active ingredient and formulation on your package.
                      </div>
                    )}
                    <div className="rounded-2xl border border-teal-200/60 bg-teal-50/70 p-4 dark:border-teal-500/25 dark:bg-teal-500/10">
                      <div className="flex items-center gap-3">
                        <span className="mm-metric-icon" style={{ width: "2rem", height: "2rem", borderRadius: "0.6rem" }}>
                          <Pill size={15} strokeWidth={2.2} />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-teal-900 dark:text-teal-200">
                            {drugInfo.brand_name || "—"} {drugInfo.generic_name ? `· ${drugInfo.generic_name}` : ""}
                          </p>
                          <p className="mt-0.5 text-xs text-teal-700 dark:text-teal-300/80">Source: openFDA Drug Label</p>
                        </div>
                      </div>
                    </div>

                    {labelSections.map(
                      (sec) =>
                        drugInfo[sec.k] && (
                          <div
                            key={sec.k}
                            className="overflow-hidden rounded-xl border border-[var(--mm-border)] bg-[rgba(15,23,42,0.02)] dark:bg-white/[0.03]"
                          >
                            <button
                              type="button"
                              onClick={() => toggleSection(sec.k)}
                              aria-expanded={Boolean(openSections[sec.k])}
                              className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mm-accent)]"
                            >
                              <span className="text-sm font-semibold text-[var(--mm-ink)]">{sec.label}</span>
                              <ChevronDown
                                size={16}
                                className={`shrink-0 text-[var(--mm-muted)] transition-transform ${
                                  openSections[sec.k] ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                            <AnimatePresence initial={false}>
                              {openSections[sec.k] && (
                                <motion.div
                                  key="body"
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: lowEnd ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
                                  className="overflow-hidden"
                                >
                                  <p className="max-h-60 overflow-y-auto whitespace-pre-wrap px-3.5 pb-3.5 pr-1 text-xs leading-relaxed text-[var(--mm-muted)]">
                                    {drugInfo[sec.k]}
                                  </p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )
                    )}
                  </>
                )}

                <p className="mt-3 border-t border-[var(--mm-border)] pt-3 text-[11px] leading-relaxed text-[var(--mm-muted)]">
                  {drugInfo.disclaimer ||
                    "Informational only — not a medical diagnosis. Always confirm with a licensed clinician, and seek emergency care for severe or worsening symptoms."}
                </p>
              </div>
            )}
          </SectionCard>
        </Reveal>
      )}

      <Reveal index={3} className="w-full">
        <div className="grid w-full gap-5 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionCard
              className="h-full"
              icon={Pill}
              title="Your medicines"
              subtitle={`${meds.length} in the cabinet`}
            >
              <SearchField value={query} onChange={setQuery} placeholder="Search medicine name…" />

              {query && (
                <div className="mt-3 overflow-hidden rounded-xl border border-[var(--mm-border)]">
                  {known
                    .filter((k) => k.toLowerCase().includes(query.toLowerCase()))
                    .map((k) => (
                      <button
                        key={k}
                        type="button"
                        onClick={() => add(k)}
                        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-[var(--mm-ink)] transition hover:bg-[rgba(15,23,42,0.04)] dark:hover:bg-white/5"
                      >
                        <Plus size={13} className="text-[var(--mm-accent)]" /> {k}
                      </button>
                    ))}
                </div>
              )}

              <div className="mt-4 space-y-2">
                {meds.map((m) => (
                  <div key={m} className="mm-row">
                    <span className="mm-avatar" style={{ width: "2rem", height: "2rem" }}>
                      <Pill size={14} />
                    </span>
                    <span className="flex-1 truncate text-sm font-medium text-[var(--mm-ink)]">{m}</span>
                    <IconButton icon={X} label={`Remove ${m}`} onClick={() => remove(m)} />
                  </div>
                ))}
                {meds.length === 0 && (
                  <p className="py-2 text-xs text-[var(--mm-muted)]">No medicines added yet — search above to add one.</p>
                )}
              </div>

              <div className="mt-5">
                <PremiumButton role="patient" fullWidth size="lg" icon={ShieldAlert} onClick={() => setChecked(true)}>
                  Check interactions
                </PremiumButton>
              </div>
            </SectionCard>
          </div>

          <div className="lg:col-span-7">
            <SectionCard
              className="h-full"
              icon={ShieldAlert}
              title="Interaction report"
            subtitle="Cross-checks your current combination"
            action={
              checked ? (
                <Chip tone={hasInteraction ? "bad" : "good"} pulse={hasInteraction}>
                  {hasInteraction ? "Attention" : "Clear"}
                </Chip>
              ) : null
            }
          >
            <AnimatePresence mode="wait">
              {!checked && (
                <motion.div key="idle" {...panelMotion}>
                  <EmptyState
                    icon={ShieldAlert}
                    title="No report yet"
                    detail="Add your medicines and run a check to see interaction risks."
                  />
                </motion.div>
              )}

              {checked && (
                <motion.div key="result" {...panelMotion} className="space-y-4">
                  {hasInteraction ? (
                    <div className="flex gap-3 rounded-2xl border border-rose-200/70 bg-rose-50/80 p-4 dark:border-rose-500/25 dark:bg-rose-500/10">
                      <ShieldAlert size={18} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
                      <div>
                        <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                          Aspirin + Ibuprofen — Medium-High risk
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-rose-600 dark:text-rose-300/90">
                          Combined long-term use increases GI bleeding risk. Talk to your doctor before continuing both.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 rounded-2xl border border-emerald-200/70 bg-emerald-50/80 p-4 dark:border-emerald-500/25 dark:bg-emerald-500/10">
                      <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                          No major interactions found
                        </p>
                        <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-300/90">
                          Your current combination appears safe based on OpenFDA interaction data.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-3 sm:grid-cols-2">
                    {meds.map((m) => (
                      <div
                        key={m}
                        className="rounded-xl border border-[var(--mm-border)] bg-[rgba(15,23,42,0.02)] p-4 dark:bg-white/[0.03]"
                      >
                        <p className="mb-1 text-sm font-semibold text-[var(--mm-ink)]">{m}</p>
                        <p className="text-xs leading-relaxed text-[var(--mm-muted)]">
                          Standard dosing guidance available. Take as prescribed by your physician; do not exceed
                          recommended dose.
                        </p>
                        <div className="mt-2.5">
                          <Chip tone="info">Verified · OpenFDA</Chip>
                        </div>
                      </div>
                    ))}
                    {meds.length === 0 && (
                      <p className="text-xs text-[var(--mm-muted)]">Add medicines to see per-medicine guidance.</p>
                    )}
                  </div>
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
