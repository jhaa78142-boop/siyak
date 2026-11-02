import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CalendarClock, Loader2, Stethoscope } from "lucide-react";
import { api } from "../../lib/api";
import { isoToLocalDateTime, localDateTimeToISOString } from "../../lib/timezone";
import { useToast } from "../../components/Toast";
import {
  PageHeader,
  PageStack,
  SectionCard,
  Tabs,
  PremiumButton,
} from "../../components/premium";

function formatTime(value, timezone = "Asia/Kolkata") {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

function getBookableTimes(doctor, date, now = Date.now()) {
  const availability = doctor?.doctorProfile?.availability;
  if (!date || !availability?.workingDays?.length || !availability.slotDurationMinutes) return [];
  if ((availability.leaveDates || []).some((leave) => String(leave).slice(0, 10) === date)) return [];

  const [year, month, dayOfMonth] = date.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, dayOfMonth)).getUTCDay();
  const workingDay = availability.workingDays.find((day) => day.dayOfWeek === weekday);
  if (!workingDay) return [];

  const duration = Number(availability.slotDurationMinutes);
  const toMinutes = (time) => {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };
  const start = toMinutes(workingDay.startTime);
  const end = toMinutes(workingDay.endTime);
  const pauses = (workingDay.breaks || []).map((pause) => ({
    start: toMinutes(pause.startTime),
    end: toMinutes(pause.endTime),
  }));
  const times = [];

  for (let minute = start; minute + duration <= end; minute += duration) {
    if (pauses.some((pause) => minute < pause.end && minute + duration > pause.start)) continue;
    const time = `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
    try {
      if (new Date(localDateTimeToISOString(`${date}T${time}`, availability.timezone || "Asia/Kolkata")).getTime() > now) {
        times.push(time);
      }
    } catch {
      // Skip local times that do not exist during a daylight-saving transition.
    }
  }
  return times;
}

export default function Appointments() {
  const { toast } = useToast();
  const [tab, setTab] = useState("book");
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctorId, setDoctorId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [mode, setMode] = useState("Video");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [doctorResponse, appointmentResponse] = await Promise.all([
        api.get("/appointments/doctors"),
        api.get("/appointments?limit=100"),
      ]);
      setDoctors(doctorResponse.data || []);
      setAppointments(appointmentResponse.data.items || []);
    } catch (requestError) {
      setError(requestError.message || "Unable to load scheduling data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const submitBooking = async (event) => {
    event.preventDefault();
    if (!window.confirm("Send this appointment request to the selected doctor?")) return;
    setSaving(true);
    setError("");
    try {
      await api.post("/appointments", {
        doctorId,
        scheduledAt: localDateTimeToISOString(
          `${scheduledDate}T${scheduledTime}`,
          selectedDoctor?.doctorProfile?.availability?.timezone || "Asia/Kolkata"
        ),
        mode,
        reason,
      });
      setScheduledDate("");
      setScheduledTime("");
      setReason("");
      toast("Appointment request sent", { tone: "success" });
      setTab("appointments");
      await load();
    } catch (requestError) {
      setError(requestError.message || "Appointment request failed.");
    } finally {
      setSaving(false);
    }
  };

  const updateAppointment = async (appointment, action, payload = {}) => {
    if (!window.confirm(`Confirm ${action.replaceAll("-", " ")}?`)) return;
    setError("");
    try {
      await api.patch(`/appointments/${appointment._id}/status`, { action, ...payload });
      await load();
    } catch (requestError) {
      setError(requestError.message || "Appointment update failed.");
    }
  };

  const selectedDoctor = doctors.find((doctor) => doctor._id === doctorId);
  const selectedTimezone = selectedDoctor?.doctorProfile?.availability?.timezone || "Asia/Kolkata";
  const earliestAppointment = isoToLocalDateTime(new Date(Date.now() + 60_000), selectedTimezone);
  const earliestDate = earliestAppointment.slice(0, 10);
  const bookableTimes = getBookableTimes(selectedDoctor, scheduledDate);

  return (
    <PageStack>
      <PageHeader
        eyebrow="Care scheduling"
        title="Appointments"
        description="Request a time in a verified doctor's availability or manage your existing appointments."
      />
      {error && <div role="alert" className="rounded-xl border border-rose-100 bg-rose-50 p-4 text-sm text-rose-700"><AlertCircle size={16} className="mr-2 inline" />{error}</div>}
      <Tabs
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "book", label: "Find a doctor" },
          { value: "appointments", label: `My appointments (${appointments.length})` },
        ]}
      />

      {loading ? (
        <div className="flex justify-center py-16" role="status" aria-label="Loading appointments"><Loader2 className="animate-spin text-indigo-600" /></div>
      ) : tab === "book" ? (
        <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
          <section className="grid gap-3 md:grid-cols-2">
            {doctors.length === 0 ? (
              <SectionCard className="p-8 text-center text-sm text-slate-500 md:col-span-2">No verified doctors are currently accepting appointment requests.</SectionCard>
            ) : doctors.map((doctor) => {
              const availability = doctor.doctorProfile?.availability;
              const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
              const today = new Date().toISOString().slice(0, 10);
              const upcomingLeaveDates = (availability?.leaveDates || [])
                .filter((date) => String(date).slice(0, 10) >= today)
                .slice(0, 3);
              return (
                <button key={doctor._id} type="button" onClick={() => {
                  setDoctorId(doctor._id);
                  setScheduledDate("");
                  setScheduledTime("");
                }} className={`rounded-2xl border p-4 text-left transition ${doctorId === doctor._id ? "border-indigo-500 bg-indigo-50" : "border-slate-200 bg-white hover:border-indigo-200"}`}>
                  <span className="flex items-center gap-2 font-semibold text-slate-900"><Stethoscope size={16} className="text-indigo-600" />{doctor.fullName || "Not provided"}</span>
                  <span className="mt-1 block text-sm text-slate-600">{doctor.doctorProfile?.specialization || "Not provided"}</span>
                  <span className="mt-1 block text-xs text-slate-500">{doctor.doctorProfile?.hospital || "Not provided"}</span>
                  <span className="mt-2 block text-xs text-slate-500">
                    {availability?.timezone || "Asia/Kolkata"} · {availability?.slotDurationMinutes || "Not provided"} minute slots
                  </span>
                  <span className="mt-2 block text-xs text-slate-600">
                    {(availability?.workingDays || []).map((day) => `${weekdays[day.dayOfWeek]} ${day.startTime}-${day.endTime}`).join(" · ") || "Schedule not provided"}
                  </span>
                  {upcomingLeaveDates.length > 0 && <span className="mt-1 block text-xs text-slate-500">Leave: {upcomingLeaveDates.map((date) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: availability.timezone || "Asia/Kolkata" }).format(new Date(date))).join(", ")}</span>}
                  {doctor.doctorProfile?.consultationFee != null && <span className="mt-1 block text-xs text-slate-500">Consultation fee: ₹{doctor.doctorProfile.consultationFee}</span>}
                </button>
              );
            })}
          </section>
          <SectionCard className="p-5">
            <h2 className="text-lg font-semibold text-slate-900">Request appointment</h2>
            {selectedDoctor ? (
              <form onSubmit={submitBooking} className="mt-4 space-y-3">
                <p className="text-sm text-slate-600">{selectedDoctor.fullName} · {selectedTimezone}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">Date
                    <input required type="date" min={earliestDate} value={scheduledDate} onChange={(event) => {
                      setScheduledDate(event.target.value);
                      setScheduledTime("");
                    }} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" />
                  </label>
                    <label className="block text-sm font-medium text-slate-700">Available time ({selectedTimezone})
                      <select required disabled={!scheduledDate || bookableTimes.length === 0} value={scheduledTime} onChange={(event) => setScheduledTime(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 disabled:bg-slate-50">
                        <option value="">{scheduledDate ? "Select an available time" : "Choose a date first"}</option>
                        {bookableTimes.map((time) => <option key={time} value={time}>{time}</option>)}
                      </select>
                    </label>
                  </div>
                  <p className="text-xs text-slate-500">
                    {scheduledDate && bookableTimes.length === 0
                      ? "No future slots are available on this date. Choose another working day."
                      : `Choose a listed slot in the doctor’s timezone (${selectedDoctor.doctorProfile?.availability?.slotDurationMinutes || "—"} minutes). Bookings are rechecked when you submit.`}
                  </p>
                <label className="block text-sm font-medium text-slate-700">Consultation mode
                  <select value={mode} onChange={(event) => setMode(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2">
                    {["Video", "In-person", "Phone"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-medium text-slate-700">Reason (optional)
                  <textarea maxLength={1000} rows={3} value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" />
                </label>
                <p className="text-xs text-slate-500">The server checks working hours, breaks, leave, slot duration, and concurrent bookings. This request does not grant access to medical records.</p>
                <PremiumButton type="submit" disabled={saving} className="w-full">{saving ? "Sending…" : "Request appointment"}</PremiumButton>
              </form>
            ) : (
              <p className="mt-3 text-sm text-slate-500">Select a verified doctor to continue.</p>
            )}
          </SectionCard>
        </div>
      ) : (
        <section className="space-y-3">
          {appointments.length === 0 ? (
            <SectionCard className="p-10 text-center text-sm text-slate-500">You have no appointments.</SectionCard>
          ) : appointments.map((appointment) => {
            const timezone = appointment.doctor?.doctorProfile?.availability?.timezone || "Asia/Kolkata";
            return (
              <SectionCard key={appointment._id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold text-slate-900">{appointment.doctor?.fullName || "Not provided"}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                    <CalendarClock size={14} />{formatTime(appointment.scheduledAt, timezone)} · {appointment.mode} · {appointment.status}
                  </p>
                  {appointment.proposedAt && <p className="mt-1 text-sm text-indigo-700">Proposed time: {formatTime(appointment.proposedAt, timezone)}</p>}
                  {appointment.cancelReason && <p className="mt-1 text-xs text-slate-500">Cancellation reason: {appointment.cancelReason}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {appointment.status === "RescheduleProposed" && (
                    <>
                      <button type="button" onClick={() => updateAppointment(appointment, "confirm-reschedule")} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white">Confirm new time</button>
                      <button type="button" onClick={() => updateAppointment(appointment, "reject-reschedule")} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">Decline proposal</button>
                    </>
                  )}
                  {["Pending", "Confirmed", "RescheduleProposed"].includes(appointment.status) && (
                    <button type="button" onClick={() => {
                      const cancelReason = window.prompt("Why are you cancelling this appointment?");
                      if (cancelReason?.trim()) updateAppointment(appointment, "cancel", { cancelReason: cancelReason.trim() });
                    }} className="rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">Cancel</button>
                  )}
                </div>
              </SectionCard>
            );
          })}
        </section>
      )}
    </PageStack>
  );
}
