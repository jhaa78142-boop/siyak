import { useEffect, useState } from "react";
import { AlertCircle, Loader2, Save } from "lucide-react";
import SectionHeader from "../../components/SectionHeader";
import { useToast } from "../../components/Toast";
import { useAuth } from "../../lib/AuthContext";
import { api } from "../../lib/api";

const week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const emptyDays = week.map((_, dayOfWeek) => ({ dayOfWeek, enabled: false, startTime: "09:00", endTime: "17:00", breaks: [] }));

export default function DoctorAvailability() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(30);
  const [days, setDays] = useState(emptyDays);
  const [leaveDates, setLeaveDates] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = profile?.doctorProfile?.availability;
    if (!saved) return;
    setTimezone(saved.timezone || "Asia/Kolkata");
    setSlotDurationMinutes(saved.slotDurationMinutes || 30);
    setLeaveDates((saved.leaveDates || []).map((date) => new Date(date).toISOString().slice(0, 10)).join(", "));
    setDays(week.map((_, dayOfWeek) => {
      const current = saved.workingDays?.find((day) => day.dayOfWeek === dayOfWeek);
      return {
        ...emptyDays[dayOfWeek],
        enabled: Boolean(current),
        startTime: current?.startTime || emptyDays[dayOfWeek].startTime,
        endTime: current?.endTime || emptyDays[dayOfWeek].endTime,
        breaks: current?.breaks || [],
      };
    }));
  }, [profile]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const workingDays = days.filter((day) => day.enabled).map((day) => ({
        dayOfWeek: day.dayOfWeek,
        startTime: day.startTime,
        endTime: day.endTime,
        breaks: day.breaks,
      }));
      const parsedLeaves = leaveDates.split(",").map((date) => date.trim()).filter(Boolean);
      await api.put("/doctor/availability", { timezone, slotDurationMinutes: Number(slotDurationMinutes), workingDays, leaveDates: parsedLeaves });
      await refreshProfile();
      toast("Availability saved", { tone: "success" });
    } catch (requestError) {
      setError(requestError.message || "Unable to save availability.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="dh-dash">
      <SectionHeader eyebrow="Schedule settings" title={<>Availability<em>.</em></>} description="Set the weekly schedule used to validate future appointment requests." />
      {error && <div role="alert" className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700"><AlertCircle size={15} className="mr-2 inline" />{error}</div>}
      <form onSubmit={save} className="dh-panel space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Timezone (IANA)
            <input required value={timezone} onChange={(event) => setTimezone(event.target.value)} placeholder="Asia/Kolkata" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Slot duration
            <select value={slotDurationMinutes} onChange={(event) => setSlotDurationMinutes(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2">
              {[15, 20, 30, 45, 60].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
            </select>
          </label>
        </div>
        <div className="space-y-2">
          {days.map((day) => (
            <fieldset key={day.dayOfWeek} className="grid gap-3 rounded-xl border border-slate-100 p-3 sm:grid-cols-[120px_repeat(2,minmax(0,1fr))] sm:items-end">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <input type="checkbox" checked={day.enabled} onChange={(event) => setDays((all) => all.map((current) => current.dayOfWeek === day.dayOfWeek ? { ...current, enabled: event.target.checked } : current))} />
                {week[day.dayOfWeek]}
              </label>
              {[
                ["startTime", "Start"],
                ["endTime", "End"],
              ].map(([key, label]) => (
                <label key={key} className="text-xs text-slate-500">
                  {label}
                  <input type="time" disabled={!day.enabled} value={day[key]} onChange={(event) => setDays((all) => all.map((current) => current.dayOfWeek === day.dayOfWeek ? { ...current, [key]: event.target.value } : current))} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm disabled:bg-slate-50" />
                </label>
              ))}
              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-600">Breaks</span>
                  <button type="button" disabled={!day.enabled || day.breaks.length >= 8} onClick={() => setDays((all) => all.map((current) => current.dayOfWeek === day.dayOfWeek ? { ...current, breaks: [...current.breaks, { startTime: "", endTime: "" }] } : current))} className="text-xs font-semibold text-indigo-700 disabled:opacity-40">Add break</button>
                </div>
                {day.breaks.map((pause, index) => (
                  <div key={`${day.dayOfWeek}-${index}`} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                    <label className="text-xs text-slate-500">Break starts
                      <input type="time" required disabled={!day.enabled} value={pause.startTime} onChange={(event) => setDays((all) => all.map((current) => current.dayOfWeek === day.dayOfWeek ? { ...current, breaks: current.breaks.map((item, itemIndex) => itemIndex === index ? { ...item, startTime: event.target.value } : item) } : current))} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm disabled:bg-slate-50" />
                    </label>
                    <label className="text-xs text-slate-500">Break ends
                      <input type="time" required disabled={!day.enabled} value={pause.endTime} onChange={(event) => setDays((all) => all.map((current) => current.dayOfWeek === day.dayOfWeek ? { ...current, breaks: current.breaks.map((item, itemIndex) => itemIndex === index ? { ...item, endTime: event.target.value } : item) } : current))} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-2 text-sm disabled:bg-slate-50" />
                    </label>
                    <button type="button" disabled={!day.enabled} onClick={() => setDays((all) => all.map((current) => current.dayOfWeek === day.dayOfWeek ? { ...current, breaks: current.breaks.filter((_, itemIndex) => itemIndex !== index) } : current))} className="mb-1 rounded px-2 py-1 text-xs text-rose-700 disabled:opacity-40" aria-label={`Remove ${week[day.dayOfWeek]} break ${index + 1}`}>Remove</button>
                  </div>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <label className="block text-sm font-medium text-slate-700">
          Leave dates (comma-separated YYYY-MM-DD)
          <input value={leaveDates} onChange={(event) => setLeaveDates(event.target.value)} placeholder="2026-12-25, 2026-12-26" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2" />
        </label>
        <p className="text-xs text-slate-500">The server checks timezone, working intervals, breaks, leave dates, slot alignment, and already-held slots.</p>
        <button disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Save availability
        </button>
      </form>
    </div>
  );
}
