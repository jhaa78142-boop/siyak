import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CalendarClock, Check, Clock, Loader2, X } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";
import { localDateTimeToISOString } from "../../lib/timezone";

function localDate(value, timezone) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone || "Asia/Kolkata",
  }).format(new Date(value));
}

export default function DoctorAppointments() {
  const { profile } = useAuth();
  const timezone = profile?.doctorProfile?.availability?.timezone || "Asia/Kolkata";
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState("");
  const [reschedule, setReschedule] = useState({});
  const [filter, setFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/appointments?limit=100");
      setAppointments(data.items || []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const update = async (appointment, action, payload = {}) => {
    if (!window.confirm(`Confirm appointment action: ${action.replaceAll("-", " ")}?`)) return;
    setWorking(appointment._id);
    setError("");
    try {
      await api.patch(`/appointments/${appointment._id}/status`, { action, ...payload });
      await load();
    } catch (requestError) {
      setError(requestError.message || "Appointment update failed.");
    } finally {
      setWorking("");
    }
  };

  const visible = filter === "all" ? appointments : appointments.filter((item) => item.status === filter);
  const pendingCount = appointments.filter((item) => item.status === "Pending").length;

  return (
    <div className="dh-dash">
      <SectionHeader
        eyebrow="Schedule management"
        title={<>Appointments<em>.</em></>}
        description="Review requests and manage valid appointment transitions. Patient access to records remains consent-scoped."
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <p className="mr-auto rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{pendingCount} pending requests</p>
        <label className="sr-only" htmlFor="appointment-filter">Filter appointments</label>
        <select id="appointment-filter" value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          <option value="all">All statuses</option>
          {["Pending", "Confirmed", "RescheduleProposed", "InProgress", "Completed", "Cancelled", "Rejected", "No-show"].map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>
      {error && (
        <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700" role="alert">
          <AlertCircle size={16} className="mr-2 inline" />{error}
          <button onClick={load} className="ml-3 underline">Retry</button>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-16" role="status" aria-label="Loading appointments">
          <Loader2 className="animate-spin text-indigo-600" />
        </div>
      ) : visible.length === 0 ? (
        <div className="dh-panel p-10 text-center text-sm text-slate-500">No appointments in this view.</div>
      ) : (
        <ul className="space-y-3">
          {visible.map((appointment) => {
            const isWorking = working === appointment._id;
            return (
              <li key={appointment._id} className="dh-panel p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900">{appointment.patient?.fullName || "Not provided"}</p>
                    <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1"><CalendarClock size={14} />{localDate(appointment.scheduledAt, timezone)}</span>
                      <span>{appointment.mode}</span>
                      <span>{appointment.status}</span>
                    </p>
                    {appointment.reason && <p className="mt-2 text-sm text-slate-600">Reason: {appointment.reason}</p>}
                    {appointment.proposedAt && <p className="mt-2 text-sm text-indigo-700">Proposed: {localDate(appointment.proposedAt, timezone)}</p>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {appointment.status === "Pending" && (
                      <>
                        <button disabled={isWorking} onClick={() => update(appointment, "accept")} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><Check size={14} />Accept</button>
                        <button disabled={isWorking} onClick={() => update(appointment, "reject")} className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50"><X size={14} />Reject</button>
                      </>
                    )}
                    {appointment.status === "Confirmed" && (
                      <>
                        <button disabled={isWorking} onClick={() => update(appointment, "start")} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Start</button>
                        <button disabled={isWorking} onClick={() => update(appointment, "no-show")} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50">No-show</button>
                        <button
                          disabled={isWorking}
                          onClick={() => setReschedule((current) => {
                            const next = { ...current };
                            if (next[appointment._id] !== undefined) delete next[appointment._id];
                            else next[appointment._id] = "";
                            return next;
                          })}
                          className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50"
                        ><Clock size={14} />Propose time</button>
                        <button disabled={isWorking} onClick={() => {
                          const reason = window.prompt("Why is this appointment being cancelled?");
                          if (reason?.trim()) update(appointment, "cancel", { cancelReason: reason.trim() });
                        }} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 disabled:opacity-50">Cancel</button>
                      </>
                    )}
                    {appointment.status === "InProgress" && (
                      <button disabled={isWorking} onClick={() => update(appointment, "complete")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Complete</button>
                    )}
                    {isWorking && <Loader2 size={16} className="animate-spin self-center text-indigo-600" aria-label="Saving appointment" />}
                  </div>
                </div>
                {appointment.status === "Confirmed" && reschedule[appointment._id] !== undefined && (
                  <form className="mt-4 flex flex-wrap items-end gap-2 border-t border-slate-100 pt-4" onSubmit={(event) => {
                    event.preventDefault();
                    const value = reschedule[appointment._id];
                    if (!value) return;
                    try {
                      const proposedAt = localDateTimeToISOString(value, timezone);
                      update(appointment, "propose-reschedule", { proposedAt });
                    } catch (requestError) {
                      setError(requestError.message || "Choose a valid time in your schedule timezone.");
                      return;
                    }
                    setReschedule((current) => {
                      const next = { ...current };
                      delete next[appointment._id];
                      return next;
                    });
                  }}>
                    <label className="flex flex-col gap-1 text-xs text-slate-600">
                      Proposed date and time
                      <input type="datetime-local" required aria-label="Proposed appointment date and time" value={reschedule[appointment._id]} onChange={(event) => setReschedule((current) => ({ ...current, [appointment._id]: event.target.value }))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                    </label>
                    <button className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white">Send proposal</button>
                    <button type="button" onClick={() => setReschedule((current) => {
                      const next = { ...current };
                      delete next[appointment._id];
                      return next;
                    })} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold">Close</button>
                  </form>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
