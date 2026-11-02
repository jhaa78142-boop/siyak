import { useState, useRef, useEffect } from "react";
import {
  Camera, Mail, Phone, Droplet, Users, Loader2, Check, CheckCircle2, Clock8,
  ShieldCheck, Sparkles, Stethoscope, AlertTriangle, HeartPulse, ArrowRight, LifeBuoy,
} from "lucide-react";
import { currentPatient } from "../../lib/mockData";
import { useAuth } from "../../lib/AuthContext";
import { api } from "../../lib/api";
import { useToast } from "../../components/Toast";
import {
  PageStack, Reveal, HeroBand, SectionCard, ProgressBar,
  PageHeader, PremiumInput, Select, PremiumButton, GlassCard, useIsLowEnd,
} from "../../components/premium";

/* Key-fact chip tuned for the dark hero band. */
function HeroChip({ icon: Icon, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-white/90">
      {Icon && <Icon size={12} className="text-teal-200" />}
      {children}
    </span>
  );
}

/* Step indicator pill — the original two-pill progress concept, restyled. */
function StepPill({ step, label, status }) {
  const tone =
    status === "complete"
      ? "border-emerald-300/40 bg-emerald-400/15 text-emerald-100"
      : status === "active"
        ? "border-teal-300/50 bg-white/10 text-white shadow-[0_0_0_3px_rgba(45,212,191,0.18)]"
        : "border-white/10 bg-white/5 text-slate-300/80";

  return (
    <div className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 ${tone}`}>
      <span className="grid h-5 w-5 place-items-center rounded-full bg-white/15 text-[11px] font-semibold">{step}</span>
      <span className="text-sm font-semibold">{label}</span>
      {status === "active" ? (
        <span className="h-2 w-2 rounded-full bg-current animate-pulse" aria-hidden />
      ) : status === "complete" ? (
        <CheckCircle2 size={14} />
      ) : (
        <Clock8 size={14} />
      )}
    </div>
  );
}

export default function PatientProfile() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const lowEnd = useIsLowEnd();

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [detailedCollapsed, setDetailedCollapsed] = useState(() => {
    try {
      return localStorage.getItem("medimind:profile:detailed:collapsed") === "1";
    } catch {
      return false;
    }
  });

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    bloodGroup: "",
    gender: "",
    allergies: "",
    chronicConditions: "",
    avatarUrl: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || profile.name || "",
        phone: profile.phone || "",
        bloodGroup: profile.patientProfile?.bloodGroup || "",
        gender: profile.patientProfile?.gender || "",
        allergies: (profile.patientProfile?.allergies || []).join(", "),
        chronicConditions: (profile.patientProfile?.chronicConditions || []).join(", "),
        avatarUrl: profile.avatarUrl || "",
      });
    }
  }, [profile]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast("Image must be smaller than 2MB", { tone: "error" });
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      setForm((prev) => ({ ...prev, avatarUrl: base64 }));
      try {
        await api.patch("/auth/profile", { avatarUrl: base64 });
        await refreshProfile();
        toast("Profile picture updated!", { tone: "success" });
      } catch (err) {
        toast("Failed to update profile picture", { tone: "error" });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setSaving(true);
    setSaveError(false);
    try {
      await api.patch("/auth/profile", {
        fullName: form.fullName,
        phone: form.phone,
        avatarUrl: form.avatarUrl,
        patientProfile: {
          bloodGroup: form.bloodGroup,
          gender: form.gender,
          allergies: form.allergies ? form.allergies.split(",").map((a) => a.trim()) : [],
          chronicConditions: form.chronicConditions ? form.chronicConditions.split(",").map((c) => c.trim()) : [],
        },
      });
      await refreshProfile();
      toast("Profile saved successfully!", { tone: "success" });
    } catch (err) {
      setSaveError(true);
      toast(err?.message || "Failed to save profile", { tone: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleFinishLater = () => {
    setDetailedCollapsed(true);
    try {
      localStorage.setItem("medimind:profile:detailed:collapsed", "1");
    } catch {}
  };

  const toggleDetailed = () => {
    const next = !detailedCollapsed;
    setDetailedCollapsed(next);
    try {
      localStorage.setItem("medimind:profile:detailed:collapsed", next ? "1" : "0");
    } catch {}
  };

  const quickComplete = form.fullName.trim() !== "" && form.phone.trim() !== "";
  const detailedComplete =
    form.gender.trim() !== "" || form.allergies.trim() !== "" || form.chronicConditions.trim() !== "";

  const quickStatus = quickComplete ? "complete" : "active";
  const detailedStatus = quickComplete ? (detailedComplete ? "complete" : "active") : "pending";

  const completenessFields = [
    form.fullName,
    form.phone,
    form.bloodGroup,
    form.gender,
    form.allergies,
    form.chronicConditions,
  ];
  const filledCount = completenessFields.filter((v) => (v || "").trim() !== "").length;
  const completeness = Math.round((filledCount / completenessFields.length) * 100);

  const name = form.fullName || currentPatient.name;
  const healthScore = profile?.patientProfile?.healthScore ?? currentPatient.healthScore;
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("");

  const genderOptions = [
    { value: "Male", label: "Male" },
    { value: "Female", label: "Female" },
    { value: "Other", label: "Other" },
  ];

  return (
    <PageStack>
      <Reveal index={0}>
        <PageHeader
          eyebrow="Your account"
          title="Profile"
          description="Keep your details current so doctors and AI recommendations stay accurate."
        />
      </Reveal>

      <Reveal index={1}>
        <HeroBand
          kicker={<><Sparkles size={12} /> Identity studio</>}
          title={name}
          copy="Keep your record current — doctors and MediMind's AI both read from here."
          right={
            <div className="flex flex-col items-center gap-2.5">
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                  aria-label="Upload profile picture"
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative block h-24 w-24 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mm-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                  aria-label="Change profile picture"
                >
                  {form.avatarUrl ? (
                    <img
                      src={form.avatarUrl}
                      alt={name}
                      className="h-24 w-24 rounded-full object-cover ring-2 ring-teal-400/70 shadow-lg"
                    />
                  ) : (
                    <span className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 text-2xl font-display font-semibold text-white">
                      {initials}
                    </span>
                  )}
                  <span className="absolute inset-0 grid place-items-center rounded-full bg-slate-950/50 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    {uploading ? <Loader2 size={20} className="animate-spin" /> : <Camera size={20} />}
                  </span>
                </button>
              </div>
              <span className="text-[11px] font-medium text-white/60">
                {uploading ? "Uploading…" : "Tap to change photo"}
              </span>
            </div>
          }
        >
          <div className="relative z-[1] mt-4 grid max-w-3xl gap-5 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-white/70 mb-2">
                <span>Profile completeness</span>
                <span className="tabular-nums">{completeness}%</span>
              </div>
              <ProgressBar value={completeness} className="bg-white/15!" delay={lowEnd ? 0 : 0.2} />
            </div>
            <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
              <StepPill step={1} label="Quick" status={quickStatus} />
              <StepPill step={2} label="Detailed" status={detailedStatus} />
            </div>
          </div>

          <div className="relative z-[1] mt-5 flex flex-wrap items-center gap-2">
            <HeroChip icon={Droplet}>{form.bloodGroup || "Blood group —"}</HeroChip>
            <HeroChip icon={Users}>{form.gender || "Gender —"}</HeroChip>
            <HeroChip icon={ShieldCheck}>Health score {healthScore}</HeroChip>
          </div>
        </HeroBand>
      </Reveal>

      <form onSubmit={handleSave} className="space-y-6">
        <Reveal index={2}>
          <SectionCard
            icon={Users}
            title="Basics"
            subtitle="The essentials doctors read first"
            spotlight={!lowEnd}
            hover={!lowEnd}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <PremiumInput
                label="Full name"
                icon={Users}
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                placeholder="Your full name"
              />
              <PremiumInput
                label="Email"
                icon={Mail}
                value={profile?.email || ""}
                disabled
                hint="Managed by your account"
              />
              <PremiumInput
                label="Phone"
                icon={Phone}
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="+91 90000 00000"
              />
              <PremiumInput
                label="Blood group"
                icon={Droplet}
                value={form.bloodGroup}
                onChange={(e) => setForm((f) => ({ ...f, bloodGroup: e.target.value }))}
                placeholder="e.g. O+, B+"
              />
              <Select
                label="Gender"
                value={form.gender}
                onChange={(v) => setForm((f) => ({ ...f, gender: v }))}
                options={genderOptions}
              />
            </div>
          </SectionCard>
        </Reveal>

        <Reveal index={3}>
          <SectionCard
            icon={Stethoscope}
            title="Medical details"
            subtitle="Allergies and long-term conditions"
            spotlight={!lowEnd}
            hover={!lowEnd}
            action={
              !detailedCollapsed ? (
                <PremiumButton
                  size="sm"
                  variant="ghost"
                  iconRight={ArrowRight}
                  onClick={handleFinishLater}
                  magnetic={!lowEnd}
                >
                  Finish later
                </PremiumButton>
              ) : null
            }
          >
            {detailedCollapsed ? (
              <button
                type="button"
                onClick={toggleDetailed}
                className="w-full rounded-xl border border-dashed border-[var(--mm-border)] px-4 py-4 text-left transition-colors hover:border-[var(--mm-accent)] hover:bg-[var(--mm-accent-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mm-accent)]"
              >
                <span className="text-sm font-semibold text-[var(--mm-ink)]">Click to expand</span>
                <span className="text-sm text-[var(--mm-muted)]"> — allergies, chronic conditions</span>
              </button>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <PremiumInput
                  label="Allergies"
                  icon={AlertTriangle}
                  value={form.allergies}
                  onChange={(e) => setForm((f) => ({ ...f, allergies: e.target.value }))}
                  placeholder="Peanuts, Penicillin"
                  hint="Separate each with a comma"
                />
                <PremiumInput
                  label="Chronic conditions"
                  icon={HeartPulse}
                  value={form.chronicConditions}
                  onChange={(e) => setForm((f) => ({ ...f, chronicConditions: e.target.value }))}
                  placeholder="Diabetes, Hypertension, Asthma"
                  className="sm:col-span-2"
                />
              </div>
            )}
          </SectionCard>
        </Reveal>

        {saveError && (
          <Reveal index={4}>
            <GlassCard
              hover={false}
              spotlight={!lowEnd}
              className="border-rose-200/70 bg-rose-50/60 dark:border-rose-500/25 dark:bg-rose-500/10"
            >
              <p className="text-sm font-medium text-rose-700 dark:text-rose-400">
                We couldn't save your changes — check your connection.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <PremiumButton size="sm" icon={Check} onClick={() => handleSave()} magnetic={!lowEnd}>
                  Try again
                </PremiumButton>
                <PremiumButton
                  size="sm"
                  variant="outline"
                  icon={LifeBuoy}
                  href="mailto:support@medimind.ai?subject=Profile%20Save%20Issue"
                  magnetic={!lowEnd}
                >
                  Contact support
                </PremiumButton>
              </div>
            </GlassCard>
          </Reveal>
        )}

        <Reveal index={saveError ? 5 : 4}>
          <div className="sticky bottom-4 z-20">
            <GlassCard hover={false} spotlight={!lowEnd} padding={false}>
              <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-[1.35rem]">
                <div className="flex items-center gap-2 text-xs text-[var(--mm-muted)]">
                  <ShieldCheck size={14} className="text-[var(--mm-accent-deep)] shrink-0" />
                  Your changes save straight to your account.
                </div>
                <PremiumButton
                  icon={Check}
                  onClick={() => handleSave()}
                  loading={saving}
                  disabled={saving}
                  magnetic={!lowEnd}
                >
                  {saving ? "Saving…" : "Save changes"}
                </PremiumButton>
              </div>
            </GlassCard>
          </div>
        </Reveal>

        {/* Keeps Enter-to-submit working while the visible action is a PremiumButton. */}
        <button type="submit" className="sr-only" tabIndex={-1} aria-hidden="true">
          Save changes
        </button>
      </form>
    </PageStack>
  );
}
