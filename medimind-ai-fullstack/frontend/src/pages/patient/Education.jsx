import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Clock,
  PlayCircle,
  Search,
  AlertTriangle,
  ExternalLink,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";
import {
  PageStack,
  Reveal,
  HeroBand,
  SectionCard,
  PageHeader,
  PremiumButton,
  Chip,
  GlassCard,
  ErrorState,
  Skeleton,
  useIsLowEnd,
} from "../../components/premium";
import { educationArticles } from "../../lib/mockData";
import { api } from "../../lib/api";

const images = [
  "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=500&q=80",
];

const trendingTopics = ["Diabetes", "Hypertension", "Asthma", "Migraine", "Arthritis"];

const ease = [0.16, 1, 0.3, 1];

export default function Education() {
  const lowEnd = useIsLowEnd();
  const [diseaseQuery, setDiseaseQuery] = useState("");
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [diseaseLoading, setDiseaseLoading] = useState(false);
  const [diseaseError, setDiseaseError] = useState("");

  const lookupDisease = async (term) => {
    const q = (term ?? diseaseQuery).trim();
    if (!q) return;
    setDiseaseLoading(true);
    setDiseaseError("");
    setDiseaseResult(null);
    try {
      const res = await api.get("/disease-info/" + encodeURIComponent(q));
      setDiseaseResult(res?.data || null);
    } catch (err) {
      setDiseaseError(err?.message || "Lookup failed. Please try again.");
    } finally {
      setDiseaseLoading(false);
    }
  };

  const handleDiseaseSearch = (e) => {
    if (e) e.preventDefault();
    lookupDisease(diseaseQuery);
  };

  const showReadingPanel = diseaseLoading || Boolean(diseaseError) || Boolean(diseaseResult);

  return (
    <PageStack>
      <Reveal index={0}>
        <PageHeader
          eyebrow="Knowledge base"
          title="Health Education"
          description="Curated, doctor-reviewed reading to help you understand your health better."
          actions={<Chip tone="info">Curated library</Chip>}
        />
      </Reveal>

      <Reveal index={1}>
        <HeroBand
          kicker={
            <>
              <BookOpen size={12} /> Learning studio
            </>
          }
          title={
            <>
              Understand your health.
              <span> Read with confidence.</span>
            </>
          }
          copy="Search any condition for a plain-language overview, or browse our doctor-reviewed explainers — written to inform, never to alarm."
        >
          <div className="relative z-[1] mt-7 max-w-2xl">
            <form onSubmit={handleDiseaseSearch} className="flex flex-col gap-2.5 sm:flex-row">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/55" aria-hidden />
                <input
                  value={diseaseQuery}
                  onChange={(e) => setDiseaseQuery(e.target.value)}
                  placeholder="e.g. diabetes, hypertension, asthma…"
                  aria-label="Search a health condition"
                  className="w-full rounded-xl border border-white/20 bg-white/10 py-3 pl-11 pr-4 text-sm text-white outline-none backdrop-blur transition placeholder:text-white/55 focus:border-teal-300/70 focus:bg-white/15 focus-visible:ring-2 focus-visible:ring-teal-300/40"
                />
              </div>
              <PremiumButton role="patient" type="submit" size="lg" icon={Search} loading={diseaseLoading}>
                {diseaseLoading ? "Loading…" : "Search"}
              </PremiumButton>
            </form>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-white/55">
                <TrendingUp size={12} /> Trending
              </span>
              {trendingTopics.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setDiseaseQuery(t);
                    lookupDisease(t);
                  }}
                  className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/85 transition hover:border-teal-300/50 hover:bg-white/10"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </HeroBand>
      </Reveal>

      <Reveal index={2}>
        <div className="group relative h-56 overflow-hidden rounded-[1.15rem] border border-[var(--mm-border)] md:h-64">
          <img
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80"
            alt="Wellness talk"
            className={`h-full w-full object-cover ${lowEnd ? "" : "transition-transform duration-700 group-hover:scale-105"}`}
          />
          <div className="absolute inset-0 flex flex-col justify-center bg-gradient-to-r from-ink/85 via-ink/45 to-transparent px-8">
            <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
              <PlayCircle size={14} /> Featured video
            </span>
            <h3 className="max-w-sm font-display text-2xl font-semibold text-white">
              5-minute guide: reading your own lab report
            </h3>
          </div>
        </div>
      </Reveal>

      <Reveal index={3}>
        <SectionCard
          icon={BookOpen}
          title="Reading room"
          subtitle="Doctor-reviewed explainers, in plain language"
          action={<Chip tone="accent">{educationArticles.length} articles</Chip>}
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {educationArticles.map((a, i) => (
              <motion.div
                key={a.id}
                initial={lowEnd ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i, duration: 0.5, ease }}
              >
                <GlassCard padding={false} hover className="overflow-hidden">
                  <article className="group/card">
                    <div className="relative overflow-hidden">
                      <img
                        src={images[i % images.length]}
                        alt={a.title}
                        className={`h-40 w-full object-cover ${
                          lowEnd ? "" : "transition-transform duration-700 group-hover/card:scale-105"
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                      <Chip tone="accent" className="absolute left-3 top-3">
                        {a.tag}
                      </Chip>
                      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 text-[11px] font-medium text-white/90">
                        <Clock size={11} /> {a.read}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm font-semibold leading-snug text-[var(--mm-ink)]">{a.title}</h3>
                      <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--mm-accent-deep)]">
                        Read article <ArrowUpRight size={12} />
                      </p>
                    </div>
                  </article>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </SectionCard>
      </Reveal>

      {showReadingPanel && (
        <Reveal index={4}>
          <SectionCard
            icon={BookOpen}
            title="Reading panel"
            subtitle="Live overview from Wikipedia"
            action={
              diseaseResult && diseaseResult.found !== false ? <Chip tone="accent">{diseaseResult.title}</Chip> : null
            }
          >
            {diseaseLoading && (
              <div className="space-y-3">
                <Skeleton className="h-44 rounded-2xl" />
                <Skeleton className="h-16 rounded-xl" />
              </div>
            )}

            {!diseaseLoading && diseaseError && (
              <ErrorState title="Lookup failed" detail={diseaseError} onRetry={() => lookupDisease(diseaseQuery)} />
            )}

            {!diseaseLoading && !diseaseError && diseaseResult && (
              <div className="space-y-3">
                {diseaseResult.found === false ? (
                  <div className="flex items-start gap-2 rounded-xl border border-[var(--mm-border)] bg-[rgba(15,23,42,0.02)] p-4 text-sm text-[var(--mm-muted)] dark:bg-white/[0.03]">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-[var(--mm-muted)]" />
                    No matching Wikipedia article was found for this term. Try a different spelling or more common name.
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-[var(--mm-border)] bg-[rgba(15,23,42,0.02)] dark:bg-white/[0.03]">
                    <div className="flex flex-col sm:flex-row">
                      {diseaseResult.thumbnail && (
                        <img
                          src={diseaseResult.thumbnail}
                          alt={diseaseResult.title || ""}
                          className="h-44 w-full shrink-0 object-cover sm:h-auto sm:w-56"
                        />
                      )}
                      <div className="flex-1 p-5">
                        <h4 className="mb-2 font-display text-xl font-semibold text-[var(--mm-ink)]">
                          {diseaseResult.title}
                        </h4>
                        <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--mm-muted)]">
                          {diseaseResult.extract}
                        </p>
                        {diseaseResult.wikipediaUrl && (
                          <PremiumButton
                            variant="outline"
                            size="sm"
                            icon={ExternalLink}
                            iconRight={ArrowUpRight}
                            href={diseaseResult.wikipediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Read more on Wikipedia
                          </PremiumButton>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {diseaseResult.disclaimer && (
                  <p className="mt-2 border-t border-[var(--mm-border)] pt-3 text-[11px] leading-relaxed text-[var(--mm-muted)]">
                    {diseaseResult.disclaimer}
                  </p>
                )}
              </div>
            )}
          </SectionCard>
        </Reveal>
      )}
    </PageStack>
  );
}
