import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Check, X, FileText, Building2, RefreshCw, AlertTriangle } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import { Badge } from "../../components/Bits";
import { SkeletonCard, SkeletonStatCards } from "../../components/Skeleton";
import { useToast } from "../../components/Toast";
import { api } from "../../lib/api";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export default function DoctorVerification() {
  const { toast } = useToast();
  const [queue, setQueue] = useState([]);
  const [counts, setCounts] = useState({ verified: null, rejected: null });
  const [state, setState] = useState("loading"); // loading | ready | error
  const [actingOn, setActingOn] = useState(null); // doctor id currently being approved/rejected

  const load = useCallback(async () => {
    setState("loading");
    try {
      const [pendingRes, doctorsRes] = await Promise.all([
        api.get("/admin/doctors/pending"),
        api.get("/admin/users?role=doctor"),
      ]);
      setQueue(pendingRes.data || []);
      const doctors = doctorsRes.data || [];
      setCounts({
        verified: doctors.filter((d) => d.doctorProfile?.verification?.status === "verified").length,
        rejected: doctors.filter((d) => d.doctorProfile?.verification?.status === "rejected").length,
      });
      setState("ready");
    } catch (err) {
      console.error("[DoctorVerification] failed to load:", err.message);
      setState("error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const act = async (doctor, approve) => {
    let reason = "";
    if (!approve) {
      reason = window.prompt(`Reason for rejecting ${doctor.name}'s application (shown to the doctor):`, "") || "";
    }
    setActingOn(doctor._id);
    try {
      await api.patch(`/admin/doctors/${doctor._id}/verification`, { approve, reason });
      setQueue((q) => q.filter((d) => d._id !== doctor._id));
      setCounts((c) => (approve ? { ...c, verified: (c.verified ?? 0) + 1 } : { ...c, rejected: (c.rejected ?? 0) + 1 }));
      toast(approve ? `${doctor.name} approved` : `${doctor.name}'s application rejected`, { tone: approve ? "success" : "info" });
    } catch (err) {
      toast(err?.message || "Couldn't submit your decision. Please try again.", { tone: "error" });
    } finally {
      setActingOn(null);
    }
  };

  const downloadDocument = async (doctor, verificationDocument) => {
    try {
      const blob = await api.download(`/admin/doctors/${doctor._id}/verification-documents/${verificationDocument._id}`);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = verificationDocument.fileName;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast(err?.message || "Unable to download verification document.", { tone: "error" });
    }
  };

  if (state === "loading") {
    return (
      <div>
        <SectionHeader eyebrow="Trust & safety" title="Doctor Verification" description="Review submitted credentials before granting platform access." />
        <SkeletonStatCards count={3} />
        <div className="space-y-4 mt-6">
          <SkeletonCard lines={2} />
          <SkeletonCard lines={2} />
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div>
        <SectionHeader eyebrow="Trust & safety" title="Doctor Verification" description="Review submitted credentials before granting platform access." />
        <div className="card-shell p-10 text-center text-slate-500">
          <AlertTriangle size={26} className="mx-auto mb-3 text-amber-500" />
          <p className="text-sm mb-4">Couldn't load the verification queue. Check your connection and try again.</p>
          <button onClick={load} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-ink text-white px-4 py-2 rounded-full">
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader eyebrow="Trust & safety" title="Doctor Verification" description="Review submitted credentials before granting platform access." />

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="card-shell p-5"><p className="text-2xl font-display font-semibold">{queue.length}</p><p className="text-xs text-slate-400 mt-1">Awaiting review</p></div>
        <div className="card-shell p-5"><p className="text-2xl font-display font-semibold text-emerald-600">{counts.verified ?? "—"}</p><p className="text-xs text-slate-400 mt-1">Verified doctors</p></div>
        <div className="card-shell p-5"><p className="text-2xl font-display font-semibold text-rose-500">{counts.rejected ?? "—"}</p><p className="text-xs text-slate-400 mt-1">Rejected applications</p></div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {queue.map((d) => (
            <motion.div key={d._id} initial={{ opacity: 1 }} exit={{ opacity: 0, x: -20, height: 0 }} className="card-shell p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {d.avatarUrl ? (
                  <img src={d.avatarUrl} alt={d.name} className="h-12 w-12 rounded-2xl object-cover shrink-0 border border-slate-100" />
                ) : (
                  <div className="h-12 w-12 rounded-2xl bg-violet-50 text-violet-700 flex items-center justify-center font-display font-semibold">
                    {d.name?.split(" ").slice(-1)[0]?.[0] || "?"}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-ink text-sm">{d.name}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1"><Building2 size={11} /> {d.doctorProfile?.hospital || "No hospital listed"}</span>
                    <span className="flex items-center gap-1"><FileText size={11} /> {d.doctorProfile?.licenseNumber || "No license number"}</span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Issuer: {d.doctorProfile?.registrationAuthority || "Not provided"} · Qualifications: {(d.doctorProfile?.qualifications || []).join(", ") || "Not provided"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(d.doctorProfile?.verificationDocuments || []).map((document) => (
                      <button key={document._id} type="button" onClick={() => downloadDocument(d, document)} className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100">
                        View {document.fileName}
                      </button>
                    ))}
                    {(d.doctorProfile?.verificationDocuments || []).length === 0 && (
                      <span className="text-xs text-rose-600">No private verification documents submitted</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone="doctor">{d.doctorProfile?.specialization || "Unspecified"}</Badge>
                <span className="text-xs text-slate-400">{timeAgo(d.createdAt)}</span>
                <button
                  onClick={() => act(d, true)}
                  disabled={actingOn === d._id}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700 disabled:opacity-50"
                >
                  <Check size={13} /> Approve
                </button>
                <button
                  onClick={() => act(d, false)}
                  disabled={actingOn === d._id}
                  className="flex items-center gap-1.5 text-xs font-semibold bg-rose-50 text-rose-600 px-4 py-2 rounded-full hover:bg-rose-100 disabled:opacity-50"
                >
                  <X size={13} /> Reject
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm(`Suspend ${d.name}'s account?`)) return;
                    setActingOn(d._id);
                    try {
                      await api.patch(`/admin/doctors/${d._id}/suspend`, {});
                      setQueue((items) => items.filter((item) => item._id !== d._id));
                      toast(`${d.name} suspended`, { tone: "info" });
                    } catch (err) {
                      toast(err?.message || "Couldn't suspend this doctor.", { tone: "error" });
                    } finally {
                      setActingOn(null);
                    }
                  }}
                  disabled={actingOn === d._id}
                  className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
                >
                  Suspend
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {queue.length === 0 && (
          <div className="card-shell p-12 text-center text-slate-400">
            <ShieldCheck size={30} className="mx-auto mb-3 opacity-50" />
            <p className="text-sm">All caught up — no pending verifications.</p>
          </div>
        )}
      </div>
    </div>
  );
}
