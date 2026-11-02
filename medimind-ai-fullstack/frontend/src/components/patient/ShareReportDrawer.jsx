import { useState, useEffect } from "react";
import { ShieldCheck, User, Calendar, Clock, Info, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Drawer, PremiumButton, SegmentedControl, Chip, SearchField, ListRow, IconTile } from "../premium";
import { api } from "../../lib/api";

const DURATION_OPTIONS = [
  { value: 1, label: "1 day" },
  { value: 3, label: "3 days" },
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
];

const PURPOSE_OPTIONS = [
  { value: "Appointment consultation", label: "Consultation" },
  { value: "Follow-up review", label: "Follow-up" },
  { value: "Emergency access", label: "Emergency" },
  { value: "Second opinion", label: "Second Opinion" },
];

export default function ShareReportDrawer({ open, onClose, report }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [purpose, setPurpose] = useState("Appointment consultation");
  const [duration, setDuration] = useState(7);
  const [sharing, setSharing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      loadDoctors();
    }
  }, [open]);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get("/appointments/doctors");
      setDoctors(res?.data || []);
    } catch (err) {
      console.error("Failed to load doctors", err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!selectedDoctor || !report) return;
    setSharing(true);
    try {
      await api.post("/consents", {
        doctorId: selectedDoctor._id,
        reportIds: [report._id || report.id],
        purpose,
        durationDays: duration,
      });
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setSelectedDoctor(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to share report", err);
    } finally {
      setSharing(false);
    }
  };

  const filteredDoctors = doctors.filter((d) =>
    d.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Share Health Record"
      width="max-w-md"
    >
      {success ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <CheckCircle2 size={32} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--mm-ink)]">Access Granted</h3>
          <p className="mt-2 text-sm text-[var(--mm-muted)] leading-relaxed">
            {selectedDoctor.fullName} can now securely access your {report?.fileName}.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-950/60">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 shrink-0 text-teal-600 dark:text-teal-400" size={18} />
              <div>
                <p className="text-sm font-semibold text-teal-950 dark:text-teal-100">Secure Sharing</p>
                <p className="mt-1 text-sm leading-relaxed text-teal-900 dark:text-teal-100">
                  You are sharing <strong>{report?.fileName}</strong>. You can revoke this access at any time from your Consent Manager.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Select Doctor
            </label>
            {selectedDoctor ? (
              <div className="rounded-xl border border-[var(--mm-accent)] bg-[var(--mm-accent-soft)] p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--mm-accent)] text-white">
                      <User size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--mm-ink)]">{selectedDoctor.fullName}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{selectedDoctor.specialization}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDoctor(null)}
                    className="text-[11px] font-semibold text-[var(--mm-accent-deep)] hover:underline"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <SearchField
                  value={search}
                  onChange={setSearch}
                  placeholder="Search doctors by name or specialty..."
                />
                <div className="max-h-60 overflow-y-auto rounded-xl border border-[var(--mm-border)] bg-[rgba(15,23,42,0.02)] dark:bg-white/[0.02]">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--mm-accent)] border-t-transparent" />
                    </div>
                  ) : filteredDoctors.length > 0 ? (
                    filteredDoctors.map((d) => (
                      <ListRow
                        key={d._id}
                        onClick={() => setSelectedDoctor(d)}
                        leading={<IconTile icon={User} size={14} />}
                        title={d.fullName}
                        meta={d.specialization}
                        className="border-b border-[var(--mm-border)] last:border-0 hover:bg-[rgba(15,23,42,0.04)] dark:hover:bg-white/5"
                      />
                    ))
                  ) : (
                    <div className="py-8 text-center text-sm text-[var(--mm-muted)]">
                      No doctors found matching "{search}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Purpose of Access
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PURPOSE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPurpose(opt.value)}
                  className={`rounded-xl border p-2.5 text-left transition-all ${
                    purpose === opt.value
                      ? "border-[var(--mm-accent)] bg-[var(--mm-accent-soft)] text-[var(--mm-accent-deep)]"
                      : "border-[var(--mm-border)] bg-transparent text-[var(--mm-muted)] hover:border-[var(--mm-accent)]"
                  }`}
                >
                  <p className="text-sm font-semibold">{opt.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Access Duration
            </label>
            <SegmentedControl
              options={DURATION_OPTIONS}
              value={duration}
              onChange={setDuration}
            />
            <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
              <Clock size={12} /> Access will automatically expire after {duration} days.
            </p>
          </div>

          <div className="pt-2">
            <PremiumButton
              role="patient"
              fullWidth
              size="lg"
              icon={ShieldCheck}
              loading={sharing}
              disabled={!selectedDoctor || sharing}
              onClick={handleShare}
            >
              Grant Access
            </PremiumButton>
            <p className="mt-3 text-center text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              By clicking "Grant Access", you consent to share this health record with the selected doctor for the specified duration and purpose.
            </p>
          </div>
        </div>
      )}
    </Drawer>
  );
}
