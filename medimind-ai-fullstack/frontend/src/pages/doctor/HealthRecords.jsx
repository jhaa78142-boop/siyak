import { Fragment, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, FileText, Brain, Download, ShieldCheck, Loader2, Clock, Info } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import { Badge } from "../../components/Bits";
import { api } from "../../lib/api";

const ease = [0.16, 1, 0.3, 1];

const typeColors = {
  Lab: "#4F46E5",
  Imaging: "#0284C7",
  Prescription: "#7C3AED",
  Other: "#059669",
};

export default function HealthRecords() {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConsent, setActiveConsent] = useState(null);
  const [error, setError] = useState("");
  const [expandedReport, setExpandedReport] = useState("");
  const [reviewing, setReviewing] = useState("");

  const loadSharedRecords = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/consents/doctor");
      setConsents(res?.data || []);
      if (res?.data?.length > 0) {
        setActiveConsent(res.data[0]);
      }
    } catch (err) {
      setError(err.message || "Failed to load shared records.");
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (report) => {
    try {
      const blob = await api.download(`/doctor/reports/${report._id}/file`);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = report.fileName || "shared-report";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Report is no longer shared or could not be downloaded.");
    }
  };

  const review = async (report, action, summary) => {
    setReviewing(report._id);
    setError("");
    try {
      await api.patch(`/doctor/reports/${report._id}/review`, { action, summary });
      await loadSharedRecords();
      setExpandedReport(report._id);
    } catch (err) {
      setError(err.message || "Unable to save report review.");
    } finally {
      setReviewing("");
    }
  };

  useEffect(() => {
    loadSharedRecords();
  }, []);

  return (
    <div className="dh-dash">
      <SectionHeader
        eyebrow="Patient-controlled access"
        title={<>Shared Health Records<em>.</em></>}
        description="View medical records shared with you by patients through digital consent."
        action={<Badge tone="doctor">ABDM Secure</Badge>}
      />

      {error && <div role="alert" className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "0.38fr 0.62fr", gap: "1rem" }}>
        {/* Patient sidebar */}
        <motion.div
          className="dh-panel"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.06, ease }}
          style={{ padding: "0.55rem" }}
        >
          <div style={{ padding: "0.75rem 0.8rem 0.5rem" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 650, fontSize: "0.95rem", color: "var(--dh-ink)", letterSpacing: "-0.02em", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <ShieldCheck size={15} style={{ color: "var(--dh-blue)" }} /> Shared by Patients
            </h3>
            <p style={{ fontSize: "0.72rem", color: "var(--dh-muted)", marginTop: "0.15rem" }}>{consents.length} active consents</p>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="animate-spin text-[var(--dh-blue)]" size={24} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
              {consents.map((c) => (
                <button
                  key={c._id}
                  onClick={() => setActiveConsent(c)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: "0.65rem", padding: "0.75rem 0.8rem", borderRadius: "0.85rem",
                    border: "none", cursor: "pointer", textAlign: "left",
                    background: activeConsent?._id === c._id ? "rgba(79,70,229,0.08)" : "transparent",
                    transition: "background 0.2s var(--ease-premium)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                    <div className="dh-avatar" style={{ width: "2.2rem", height: "2.2rem", fontSize: "0.62rem" }}>
                      {c.patient?.fullName?.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--dh-ink)" }}>{c.patient?.fullName}</p>
                      <p style={{ fontSize: "0.66rem", color: "var(--dh-muted)" }}>{c.reports?.length || 0} records shared</p>
                    </div>
                  </div>
                  <ChevronRight size={13} style={{ color: "#94A3B8" }} />
                </button>
              ))}
              {consents.length === 0 && (
                <div className="py-8 text-center px-4">
                  <Info size={24} className="mx-auto mb-2 opacity-20" />
                  <p className="text-xs text-[var(--dh-muted)] leading-relaxed">No patients have shared records with you yet.</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Records detail */}
        <AnimatePresence mode="wait">
          {activeConsent ? (
            <motion.div
              key={activeConsent._id}
              className="dh-panel"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.45, ease }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.15rem" }}>
                <div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 650, fontSize: "1.1rem", color: "var(--dh-ink)", letterSpacing: "-0.02em" }}>
                    {activeConsent.patient?.fullName}'s Records
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <p style={{ fontSize: "0.75rem", color: "var(--dh-muted)" }}>
                      Shared for: <strong>{activeConsent.purpose}</strong>
                    </p>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <p className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                      <Clock size={12} /> Expires {new Date(activeConsent.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge tone="doctor">{activeConsent.reports?.length || 0} Documents</Badge>
              </div>

              {/* Records list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.55rem" }}>
                {activeConsent.reports?.map((r) => (
                  <Fragment key={r._id}>
                  <div
                    className="group"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "0.85rem 1rem", borderRadius: "0.95rem",
                      background: "rgba(59,91,255,0.03)", border: "1px solid rgba(59,91,255,0.05)",
                      cursor: "pointer", transition: "background 0.2s, border-color 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{
                        display: "grid", placeItems: "center",
                        width: "2.2rem", height: "2.2rem", borderRadius: "0.65rem",
                        background: `${typeColors[r.reportType] || "#4F46E5"}15`,
                        color: typeColors[r.reportType] || "#4F46E5",
                      }}>
                        <FileText size={15} />
                      </div>
                      <div>
                        <p style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--dh-ink)" }}>{r.fileName}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.2rem" }}>
                          <Badge tone="neutral" style={{ fontSize: "0.62rem" }}>{r.reportType}</Badge>
                          {r.analysis?.summary && (
                            <span style={{ fontSize: "0.68rem", color: "var(--dh-blue, #4F46E5)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                              <Brain size={10} /> {r.analysis.summary.slice(0, 40)}...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadReport(r)}
                      aria-label={`Download shared report ${r.fileName}`}
                      style={{
                        display: "grid", placeItems: "center", width: "1.85rem", height: "1.85rem",
                        borderRadius: "0.5rem", border: "none", cursor: "pointer",
                        background: "rgba(79,70,229,0.06)", color: "var(--dh-blue, #4F46E5)",
                        transition: "background 0.2s",
                      }}
                    >
                      <Download size={13} />
                    </button>
                    <button type="button" onClick={() => setExpandedReport(expandedReport === r._id ? "" : r._id)} className="ml-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                      {expandedReport === r._id ? "Hide review" : "Review"}
                    </button>
                  </div>
                    {expandedReport === r._id && (
                    <section className="mt-2 rounded-xl border border-slate-100 bg-white p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">AI draft — doctor review required</p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{r.analysis?.summary || "Not provided"}</p>
                      <p className="mt-2 text-xs text-slate-500">AI draft status: {r.doctorReview?.aiDraftDecision || "pending"} · Review status: {r.doctorReview?.status || "awaiting_review"}</p>
                      {r.analysis?.findings?.length > 0 && (
                        <div className="mt-3 overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead><tr><th className="p-2">Value</th><th className="p-2">Result</th><th className="p-2">Reference</th><th className="p-2">Status</th></tr></thead>
                            <tbody>{r.analysis.findings.map((finding, index) => <tr key={`${finding.name}-${index}`} className="border-t border-slate-100"><td className="p-2">{finding.name || "Not provided"}</td><td className="p-2">{finding.value || "Not provided"} {finding.unit || ""}</td><td className="p-2">{finding.referenceRange || "Not provided"}</td><td className="p-2">{finding.status || "unknown"}</td></tr>)}</tbody>
                          </table>
                        </div>
                      )}
                      <details className="mt-3">
                        <summary className="cursor-pointer text-xs font-semibold text-indigo-700">Show preserved OCR text</summary>
                        <pre className="mt-2 max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-700">{r.analysis?.rawExtractedText || "Not provided"}</pre>
                      </details>
                      {r.doctorReview?.reviewedSummary && (
                        <div className="mt-3 rounded-lg bg-emerald-50 p-3">
                          <p className="text-xs font-semibold text-emerald-800">Doctor-reviewed value</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-emerald-900">{r.doctorReview.reviewedSummary}</p>
                        </div>
                      )}
                      {r.doctorReview?.status !== "reviewed" && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button disabled={reviewing === r._id} onClick={() => review(r, "accept_ai")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Accept AI draft</button>
                          <button disabled={reviewing === r._id} onClick={() => {
                            const nextText = window.prompt("Enter your reviewed summary:", r.analysis?.summary || "");
                            if (nextText?.trim()) review(r, "edit", nextText.trim());
                          }} className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 disabled:opacity-50">Edit summary</button>
                          <button disabled={reviewing === r._id} onClick={() => {
                            if (window.confirm("Reject this AI draft?")) review(r, "reject_ai");
                          }} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50">Reject AI draft</button>
                          <button disabled={reviewing === r._id} onClick={() => review(r, "needs_clarification")} className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 disabled:opacity-50">Needs clarification</button>
                        </div>
                      )}
                      </section>
                    )}
                  </Fragment>
                ))}
              </div>

              {/* Patient context */}
              <div style={{
                marginTop: "1.15rem", padding: "0.95rem 1rem", borderRadius: "0.95rem",
                background: "rgba(79,70,229,0.04)", border: "1px solid rgba(79,70,229,0.08)",
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem",
              }}>
                {[
                  ["Age / Gender", "Not provided", "var(--dh-ink)"],
                  ["Contact", "Not provided", "var(--dh-ink)"],
                  ["Access Status", "Consent Active", "#10B981"],
                ].map(([label, value, color]) => (
                  <div key={label}>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--dh-muted)", fontWeight: 600 }}>{label}</p>
                    <p style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 650, color, marginTop: "0.15rem" }}>{value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="dh-panel flex flex-col items-center justify-center text-center py-20">
              <ShieldCheck size={48} className="opacity-10 mb-4" />
              <h3 className="text-lg font-semibold text-[var(--dh-ink)]">Select a Patient</h3>
              <p className="text-sm text-[var(--dh-muted)] mt-2">Choose a patient from the sidebar to view shared health records.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
