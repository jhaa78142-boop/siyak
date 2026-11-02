import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Check, FileSearch, Loader2, Pencil, ShieldCheck, Sparkles, X } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import { api } from "../../lib/api";

export default function AISummary() {
  const [patients, setPatients] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [patientResponse, summaryResponse] = await Promise.all([
        api.get("/doctor/patients"),
        api.get("/ai/summary"),
      ]);
      setPatients(patientResponse.data.items || []);
      setSummaries(summaryResponse.data || []);
      setSelectedPatientId((current) => current || patientResponse.data.items?.[0]?._id || "");
    } catch (requestError) {
      setError(requestError.message || "Unable to load consent-authorized summary data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const selected = summaries.find((summary) => summary._id === selectedId) || summaries[0];

  const generate = async () => {
    if (!selectedPatientId) return;
    setGenerating(true);
    setError("");
    try {
      const { data } = await api.post("/ai/summary", { patientId: selectedPatientId });
      await load();
      setSelectedId(data._id);
    } catch (requestError) {
      setError(requestError.message || "AI summary is unavailable.");
    } finally {
      setGenerating(false);
    }
  };

  const review = async (action, text) => {
    setError("");
    try {
      await api.patch(`/ai/summary/${selected._id}/review`, { action, text });
      setEditing(false);
      await load();
    } catch (requestError) {
      setError(requestError.message || "Unable to save doctor review.");
    }
  };

  return (
    <div className="dh-dash">
      <SectionHeader
        eyebrow="Consent-scoped clinical support"
        title={<>AI Summary<em>.</em></>}
        description="Summaries use only reports currently shared with you. AI output remains a draft until you review it."
      />
      {error && <div role="alert" className="mb-4 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle size={16} className="mr-2 inline" />{error}</div>}
      {loading ? (
        <div className="flex justify-center py-16" role="status" aria-label="Loading summaries"><Loader2 className="animate-spin text-indigo-600" /></div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
          <aside className="dh-panel space-y-4 p-4">
            <label className="block text-sm font-medium text-slate-700">
              Patient with appointment history
              <select value={selectedPatientId} onChange={(event) => setSelectedPatientId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2">
                <option value="">Select a patient</option>
                {patients.map((patient) => <option key={patient._id} value={patient._id}>{patient.fullName || "Not provided"}</option>)}
              </select>
            </label>
            <button type="button" disabled={!selectedPatientId || generating} onClick={generate} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {generating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              Generate from shared reports
            </button>
            <p className="rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">
              Only active consented reports are eligible. No appointment alone unlocks records. The configured AI provider processes the selected report text.
            </p>
            <h2 className="border-t border-slate-100 pt-3 text-sm font-semibold text-slate-800">Available summaries</h2>
            {summaries.length === 0 ? (
              <p className="text-sm text-slate-500">No active, consent-authorized summaries.</p>
            ) : (
              <ul className="space-y-2">
                {summaries.map((summary) => (
                  <li key={summary._id}>
                    <button type="button" onClick={() => setSelectedId(summary._id)} className={`w-full rounded-lg p-3 text-left text-sm ${selected?._id === summary._id ? "bg-indigo-50 text-indigo-800" : "hover:bg-slate-50"}`}>
                      <span className="block font-medium">{summary.patient?.fullName || "Patient"}</span>
                      <span className="mt-1 block text-xs text-slate-500">{new Date(summary.generatedAt).toLocaleString()} · {summary.reviewStatus}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          {!selected ? (
            <section className="dh-panel flex min-h-72 flex-col items-center justify-center p-8 text-center">
              <FileSearch size={30} className="text-slate-300" />
              <p className="mt-3 text-sm text-slate-600">Select an existing summary or generate one from shared reports.</p>
            </section>
          ) : (
            <article className="dh-panel space-y-5 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{selected.patient?.fullName || "Patient"} summary</h2>
                  <p className="mt-1 text-xs text-slate-500">{new Date(selected.generatedAt).toLocaleString()} · {selected.reviewStatus}</p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800"><ShieldCheck size={13} />AI draft — doctor review required</span>
              </div>
              {editing ? (
                <label className="block text-sm font-medium text-slate-700">
                  Doctor-reviewed summary
                  <textarea value={editText} onChange={(event) => setEditText(event.target.value)} rows={8} maxLength={10000} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm" />
                </label>
              ) : (
                <div className="whitespace-pre-wrap rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-800">{selected.doctorApprovedText || selected.summaryText}</div>
              )}
              {selected.highlights?.length > 0 && (
                <section>
                  <h3 className="text-sm font-semibold text-slate-800">Highlights</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">{selected.highlights.map((item, index) => <li key={index}>{item}</li>)}</ul>
                </section>
              )}
              <section>
                <h3 className="text-sm font-semibold text-slate-800">Sources</h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {(selected.sourceReferences || []).map((source) => <li key={source.report}>• {source.label}</li>)}
                </ul>
              </section>
              <section>
                <h3 className="text-sm font-semibold text-slate-800">Missing-information warnings</h3>
                <ul className="mt-2 space-y-1 text-sm text-amber-800">
                  {(selected.missingInformation || []).map((warning, index) => <li key={index}>• {warning}</li>)}
                </ul>
              </section>
              {selected.reviewStatus === "draft" && !editing && (
                <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                  <button type="button" onClick={() => review("approve")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"><Check size={14} />Accept draft</button>
                  <button type="button" onClick={() => { setEditText(selected.summaryText); setEditing(true); }} className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700"><Pencil size={14} />Edit</button>
                  <button type="button" onClick={() => review("reject")} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700"><X size={14} />Reject draft</button>
                </div>
              )}
              {editing && (
                <div className="flex gap-2">
                  <button type="button" onClick={() => review("edit", editText)} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white">Save reviewed text</button>
                  <button type="button" onClick={() => setEditing(false)} className="rounded-lg bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-700">Cancel</button>
                </div>
              )}
            </article>
          )}
        </div>
      )}
    </div>
  );
}
