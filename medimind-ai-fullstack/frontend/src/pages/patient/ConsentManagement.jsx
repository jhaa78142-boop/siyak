import { useState, useEffect } from "react";
import { ShieldCheck, User, Calendar, Clock, Trash2, AlertCircle, CheckCircle2, ChevronRight, FileText } from "lucide-react";
import {
  PageStack,
  Reveal,
  PageHeader,
  SectionCard,
  Chip,
  IconButton,
  EmptyState,
  Skeleton,
  useIsLowEnd,
  ListRow,
  IconTile,
} from "../../components/premium";
import { api } from "../../lib/api";

export default function ConsentManagement() {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const lowEnd = useIsLowEnd();

  const loadConsents = async () => {
    setLoading(true);
    try {
      const res = await api.get("/consents/patient");
      setConsents(res?.data || []);
    } catch (err) {
      console.error("Failed to load consents", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsents();
  }, []);

  const handleRevoke = async (id) => {
    if (!window.confirm("Are you sure you want to revoke this access? The doctor will no longer be able to view these records.")) return;
    try {
      await api.patch(`/consents/${id}/revoke`);
      loadConsents();
    } catch (err) {
      console.error("Failed to revoke consent", err);
    }
  };

  const getStatusTone = (status) => {
    if (status === "active") return "good";
    if (status === "revoked") return "bad";
    return "neutral";
  };

  return (
    <PageStack>
      <Reveal index={0}>
        <PageHeader
          eyebrow="Data Privacy"
          title="Consent Manager"
          description="Control which doctors have access to your health records and for how long."
          actions={<Chip tone="accent">ABDM Compliant</Chip>}
        />
      </Reveal>

      <div className="grid w-full lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <Reveal index={1} className="w-full">
            <SectionCard
              icon={ShieldCheck}
              title="Active & Past Consents"
              subtitle="Manage your shared records and permissions"
              className="h-full"
            >
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                  <Skeleton className="h-20 w-full rounded-2xl" />
                </div>
              ) : consents.length > 0 ? (
                <div className="space-y-4">
                  {consents.map((c) => (
                    <div
                      key={c._id}
                      className="group relative overflow-hidden rounded-2xl border border-[var(--mm-border)] bg-[rgba(15,23,42,0.02)] p-4 transition-all hover:bg-[rgba(15,23,42,0.04)] dark:bg-white/[0.02] dark:hover:bg-white/[0.04]"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--mm-accent-soft)] text-[var(--mm-accent-deep)]">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--mm-ink)]">{c.doctor?.fullName}</p>
                            <p className="text-xs text-[var(--mm-muted)]">{c.doctor?.specialization}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Chip tone={getStatusTone(c.status)} size="sm">
                                {c.status.toUpperCase()}
                              </Chip>
                              <span className="flex items-center gap-1 text-[11px] text-[var(--mm-muted)]">
                                <Calendar size={11} /> Granted {new Date(c.createdAt).toLocaleDateString()}
                              </span>
                              {c.status === "active" && (
                                <span className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
                                  <Clock size={11} /> Expires {new Date(c.expiresAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {c.status === "active" && (
                          <IconButton
                            icon={Trash2}
                            label="Revoke Access"
                            tone="bad"
                            onClick={() => handleRevoke(c._id)}
                          />
                        )}
                      </div>

                      <div className="mt-4 border-t border-[var(--mm-border)] pt-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--mm-muted)] mb-2">Shared Records</p>
                        <div className="flex flex-wrap gap-2">
                          {c.reports?.map((r) => (
                            <div key={r._id} className="flex items-center gap-2 rounded-lg bg-[var(--mm-surface)] border border-[var(--mm-border)] px-2.5 py-1.5">
                              <FileText size={12} className="text-[var(--mm-accent)]" />
                              <span className="text-xs font-medium text-[var(--mm-ink)]">{r.fileName}</span>
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 text-xs italic text-[var(--mm-muted)]">
                          <strong>Purpose:</strong> {c.purpose}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={ShieldCheck}
                  title="No consents found"
                  detail="You haven't shared any reports with doctors yet. Shared reports will appear here for you to manage."
                />
              )}
            </SectionCard>
          </Reveal>
        </div>

        <div className="lg:col-span-4">
          <Reveal index={2} className="w-full">
            <SectionCard
              icon={AlertCircle}
              title="Privacy Notice"
              subtitle="How sharing works"
              className="h-full"
            >
              <div className="space-y-5">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--mm-ink)]">End-to-End Control</p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--mm-muted)]">
                      Only you can grant access. Doctors cannot view your records without your explicit digital consent.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--mm-ink)]">Auto-Expiration</p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--mm-muted)]">
                      Access is temporary. It automatically expires after the chosen period to ensure your data isn't shared indefinitely.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                    <Trash2 size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--mm-ink)]">Instant Revocation</p>
                    <p className="mt-1 text-xs leading-relaxed text-[var(--mm-muted)]">
                      Change your mind? Click the revoke button to immediately cut off access to your records.
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-4 dark:bg-white/5">
                  <p className="text-[11px] font-medium leading-relaxed text-[var(--mm-muted)]">
                    MediMind AI follows the ABHA (Ayushman Bharat Health Account) principles of patient-centric health data consent.
                  </p>
                </div>
              </div>
            </SectionCard>
          </Reveal>
        </div>
      </div>
    </PageStack>
  );
}
