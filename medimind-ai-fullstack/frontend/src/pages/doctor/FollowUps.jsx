import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CalendarClock, CheckCircle2, Loader2, Repeat } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";
import { localDateTimeToISOString } from "../../lib/timezone";

function formatTime(value, timezone) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

export default function FollowUps() {
  const { profile } = useAuth();
  const timezone = profile?.doctorProfile?.availability?.timezone || "Asia/Kolkata";
  const [followUps, setFollowUps] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [appointmentId, setAppointmentId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [followUpsResponse, patientsResponse, appointmentsResponse] = await Promise.all([
        api.get("/prescriptions/follow-ups"),
        api.get("/doctor/patients"),
        api.get("/appointments?limit=100"),
      ]);
      setFollowUps(followUpsResponse.data || []);
      setPatients(patientsResponse.data.items || []);
      setAppointments(appointmentsResponse.data.items || []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load follow-up recommendations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  const patientAppointments = appointments.filter((appointment) =>
    appointment.patient?._id === patientId && ["Confirmed", "InProgress", "Completed"].includes(appointment.status)
  );

  const createRecommendation = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/prescriptions/follow-ups", {
        patientId,
        appointmentId,
        dueDate: localDateTimeToISOString(dueDate, timezone),
        reason,
      });
      setDueDate("");
      setReason("");
      await load();
    } catch (requestError) {
      setError(requestError.message || "Unable to create follow-up recommendation.");
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (followUp, status) => {
    if (!window.confirm(`Mark this follow-up ${status.toLowerCase()}?`)) return;
    try {
      await api.patch(`/prescriptions/follow-ups/${followUp._id}`, { status });
      await load();
    } catch (requestError) {
      setError(requestError.message || "Unable to update follow-up.");
    }
  };

  return (
    <div className="dh-dash">
      <SectionHeader eyebrow="Continuity of care" title={<>Follow-ups<em>.</em></>} description="Create follow-up recommendations linked to an appointment. Recommendations are not booked appointments." />
      {error && <div role="alert" className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle size={15} className="mr-2 inline" />{error}</div>}
      <form onSubmit={createRecommendation} className="dh-panel grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="text-xs font-medium text-slate-600">Patient
          <select required value={patientId} onChange={(event) => { setPatientId(event.target.value); setAppointmentId(""); }} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="">Select a patient</option>
            {patients.map((patient) => <option key={patient._id} value={patient._id}>{patient.fullName || "Not provided"}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-600">Related appointment
          <select required value={appointmentId} onChange={(event) => setAppointmentId(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
            <option value="">Select appointment</option>
            {patientAppointments.map((appointment) => <option key={appointment._id} value={appointment._id}>{formatTime(appointment.scheduledAt, timezone)} · {appointment.status}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium text-slate-600">Due date
          <input required type="datetime-local" value={dueDate} onChange={(event) => setDueDate(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <label className="text-xs font-medium text-slate-600">Instructions
          <input required maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
        </label>
        <button disabled={saving} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 sm:col-span-2 xl:col-span-4">
          {saving ? "Saving…" : "Create recommendation"}
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-14" role="status" aria-label="Loading follow-ups"><Loader2 className="animate-spin text-indigo-600" /></div>
      ) : followUps.length === 0 ? (
        <div className="dh-panel mt-4 p-8 text-center text-sm text-slate-500">No follow-up recommendations.</div>
      ) : (
        <ul className="mt-4 space-y-3">
          {followUps.map((followUp) => (
            <li key={followUp._id} className="dh-panel flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-semibold text-slate-800">{followUp.patient?.fullName || "Not provided"}</p>
                <p className="mt-1 text-sm text-slate-600">{followUp.reason || "Not provided"}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><CalendarClock size={13} />{formatTime(followUp.dueDate, timezone)} · {followUp.status}</p>
              </div>
              {followUp.status === "Scheduled" && (
                <div className="flex gap-2">
                  <button type="button" onClick={() => updateStatus(followUp, "Completed")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700"><CheckCircle2 size={14} />Complete</button>
                  {new Date(followUp.dueDate) <= new Date() && <button type="button" onClick={() => updateStatus(followUp, "Missed")} className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">Missed</button>}
                </div>
              )}
              <span className="sr-only"><Repeat /></span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
