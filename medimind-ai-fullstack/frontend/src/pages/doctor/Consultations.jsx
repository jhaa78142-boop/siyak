import { useCallback, useEffect, useState } from "react";
import { AlertCircle, ClipboardList, Loader2 } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";

function formatTime(value, timezone) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

const fields = [
  ["chiefComplaint", "Chief complaint"],
  ["symptoms", "Symptoms"],
  ["history", "Relevant history"],
  ["observations", "Observations"],
  ["assessment", "Assessment"],
  ["plan", "Plan"],
  ["advice", "Advice"],
  ["followUp", "Follow-up recommendation"],
];
const emptyNotes = () => Object.fromEntries(fields.map(([key]) => [key, ""]));

export default function Consultations() {
  const { profile } = useAuth();
  const timezone = profile?.doctorProfile?.availability?.timezone || "Asia/Kolkata";
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [notes, setNotes] = useState(emptyNotes());
  const [recordId, setRecordId] = useState("");
  const [amendingId, setAmendingId] = useState("");
  const [viewOnly, setViewOnly] = useState(false);
  const [amendmentReason, setAmendmentReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [patientResponse, appointmentResponse, consultationResponse] = await Promise.all([
        api.get("/doctor/patients"),
        api.get("/appointments?limit=100"),
        api.get("/consultations?limit=100"),
      ]);
      setPatients(patientResponse.data.items || []);
      setAppointments(appointmentResponse.data.items || []);
      setConsultations(consultationResponse.data.items || []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load consultation records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const eligibleAppointments = appointments.filter((appointment) =>
    appointment.patient?._id === patientId
    && ["Confirmed", "InProgress", "Completed"].includes(appointment.status)
  );
  const reset = () => {
    setPatientId("");
    setAppointmentId("");
    setNotes(emptyNotes());
    setRecordId("");
    setAmendingId("");
    setViewOnly(false);
    setAmendmentReason("");
  };
  const assignNotes = (record) => {
    setNotes(Object.fromEntries(fields.map(([key]) => [key, record[key] || ""])));
  };

  const saveDraft = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = { patientId, appointmentId, ...notes };
      const response = recordId
        ? await api.patch(`/consultations/${recordId}`, body)
        : await api.post("/consultations", body);
      setRecordId(response.data._id);
      await load();
    } catch (requestError) {
      setError(requestError.message || "Unable to save consultation draft.");
    } finally {
      setSaving(false);
    }
  };

  const finalize = async () => {
    if (!recordId) {
      setError("Save the consultation draft before finalizing.");
      return;
    }
    if (!window.confirm("Finalize this consultation note? Future changes require a retained amendment.")) return;
    setSaving(true);
    setError("");
    try {
      await api.patch(`/consultations/${recordId}/finalize`, { confirm: true });
      await load();
      reset();
    } catch (requestError) {
      setError(requestError.message || "Unable to finalize consultation.");
    } finally {
      setSaving(false);
    }
  };

  const selectRecord = (record) => {
    setRecordId(record.status === "draft" ? record._id : "");
    setAmendingId("");
    setViewOnly(record.status !== "draft");
    setPatientId(record.patient?._id || "");
    setAppointmentId(record.appointment?._id || "");
    assignNotes(record);
  };

  const selectAmendment = (record) => {
    setRecordId("");
    setAmendingId(record._id);
    setViewOnly(false);
    setPatientId(record.patient?._id || "");
    setAppointmentId(record.appointment?._id || "");
    assignNotes(record);
  };

  const saveAmendment = async () => {
    if (!window.confirm("Save this amendment and retain the prior finalized note?")) return;
    setSaving(true);
    setError("");
    try {
      await api.patch(`/consultations/${amendingId}/amend`, {
        confirm: true,
        reason: amendmentReason,
        ...notes,
      });
      await load();
      reset();
    } catch (requestError) {
      setError(requestError.message || "Unable to amend the finalized consultation.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dh-dash">
      <SectionHeader eyebrow="Clinical documentation" title={<>Consultations<em>.</em></>} description="Write draft notes linked to a confirmed appointment. Finalized notes are immutable; amendments preserve previous versions." />
      {error && <div role="alert" className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle size={15} className="mr-2 inline" />{error}</div>}
      {loading ? (
        <div className="flex justify-center py-16" role="status" aria-label="Loading consultations"><Loader2 className="animate-spin text-indigo-600" /></div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <form onSubmit={saveDraft} className="dh-panel space-y-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">{amendingId ? "Amend finalized note" : recordId ? "Consultation draft" : "New consultation note"}</h2>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">{amendingId ? "Amendment pending" : recordId ? "Draft" : "Not finalized"}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">Related patient
                <select required disabled={Boolean(recordId || amendingId || viewOnly)} value={patientId} onChange={(event) => { setPatientId(event.target.value); setAppointmentId(""); }} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <option value="">Select a patient</option>
                  {patients.map((patient) => <option key={patient._id} value={patient._id}>{patient.fullName || "Not provided"}</option>)}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-700">Confirmed appointment
                <select required disabled={Boolean(recordId || amendingId || viewOnly)} value={appointmentId} onChange={(event) => setAppointmentId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2">
                  <option value="">Select an appointment</option>
                  {eligibleAppointments.map((appointment) => <option key={appointment._id} value={appointment._id}>{formatTime(appointment.scheduledAt, timezone)} · {appointment.status}</option>)}
                  {(recordId || amendingId || viewOnly) && appointmentId && <option value={appointmentId}>Original appointment</option>}
                </select>
              </label>
            </div>
            {fields.map(([key, label]) => (
              <label key={key} className="block text-sm font-medium text-slate-700">{label}
                <textarea readOnly={viewOnly} maxLength={10000} rows={key === "chiefComplaint" ? 2 : 3} value={notes[key]} onChange={(event) => setNotes((current) => ({ ...current, [key]: event.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-3 read-only:bg-slate-50" />
              </label>
            ))}
            {amendingId && <label className="block text-sm font-medium text-slate-700">Reason for amendment
              <input required maxLength={1000} value={amendmentReason} onChange={(event) => setAmendmentReason(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" />
            </label>}
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">AI suggestions, if used elsewhere, are not confirmed diagnoses. This note contains only clinician-entered content.</p>
            <div className="flex flex-wrap gap-2">
              {!amendingId && !viewOnly && <button disabled={saving} className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save draft"}</button>}
              {!amendingId && !viewOnly && <button type="button" disabled={saving} onClick={finalize} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Finalize with confirmation</button>}
              {amendingId && <button type="button" disabled={saving} onClick={saveAmendment} className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">Confirm amendment</button>}
              <button type="button" onClick={reset} className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700">Clear</button>
            </div>
          </form>

          <aside className="dh-panel space-y-3 p-4">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900"><ClipboardList size={17} />Consultation history</h2>
            {consultations.length === 0 ? <p className="text-sm text-slate-500">No consultation notes.</p> : (
              <ul className="space-y-2">
                {consultations.map((record) => (
                  <li key={record._id} className="rounded-xl border border-slate-100 p-3">
                    <p className="text-sm font-medium text-slate-800">{record.patient?.fullName || "Not provided"}</p>
                    <p className="mt-1 text-xs text-slate-500">{record.status} · {formatTime(record.updatedAt, timezone)}</p>
                    {record.status === "draft" ? (
                      <button type="button" onClick={() => selectRecord(record)} className="mt-2 text-xs font-semibold text-indigo-700">Edit draft</button>
                    ) : (
                      <div className="mt-2 flex gap-3">
                        <button type="button" onClick={() => selectRecord(record)} className="text-xs font-semibold text-indigo-700">View note</button>
                        <button type="button" onClick={() => selectAmendment(record)} className="text-xs font-semibold text-amber-700">Amend</button>
                      </div>
                    )}
                    {record.amendments?.length > 0 && <p className="mt-1 text-xs text-slate-500">{record.amendments.length} previous version(s) retained</p>}
                    {record.amendments?.map((amendment) => (
                      <details key={amendment._id || amendment.version} className="mt-2 rounded-lg bg-slate-50 p-2 text-xs">
                        <summary className="cursor-pointer font-semibold text-slate-700">Version {amendment.version} · {amendment.reason}</summary>
                        <div className="mt-2 space-y-2">
                          {fields.map(([key, label]) => <p key={key}><strong>{label}:</strong> {amendment[key] || "Not provided"}</p>)}
                        </div>
                      </details>
                    ))}
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
