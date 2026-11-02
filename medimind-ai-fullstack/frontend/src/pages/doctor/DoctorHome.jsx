import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CalendarClock, ClipboardList, FileSearch, Loader2, Repeat, Users } from "lucide-react";
import { Link } from "react-router-dom";
import SectionHeader from "../../components/SectionHeader";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";
import { useI18n } from "../../lib/I18nContext";

function formatTime(value, timezone) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone || "Asia/Kolkata",
  }).format(new Date(value));
}

export default function DoctorHome() {
  const { profile } = useAuth();
  const { t } = useI18n();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/doctor/dashboard");
      setDashboard(data);
    } catch (requestError) {
      setError(t(requestError.message || "Unable to load your dashboard."));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { load(); }, [load]);

  const stats = dashboard ? [
    { label: t("Today's appointments"), value: dashboard.todayAppointments.length, icon: CalendarClock },
    { label: t("Upcoming appointments"), value: dashboard.upcomingAppointments.length, icon: Users },
    { label: t("Pending requests"), value: dashboard.pendingRequests, icon: ClipboardList },
    { label: t("Reports awaiting review"), value: dashboard.reportsAwaitingReview, icon: FileSearch },
    { label: t("Follow-ups due"), value: dashboard.followUpsDue, icon: Repeat },
  ] : [];

  return (
    <div className="dh-dash">
      <SectionHeader
        eyebrow={t("Doctor workspace")}
        title={<>{t("Overview")}<em>.</em></>}
        description={t("Welcome, {name}. Today's schedule and review counts use only records authorized for your account.").replace("{name}", profile?.fullName || t("Doctor"))}
      />
      {loading ? (
        <div className="flex justify-center py-16" role="status" aria-label={t("Loading doctor dashboard")}>
          <Loader2 className="animate-spin text-indigo-600" />
        </div>
      ) : error ? (
        <div className="rounded-xl border border-rose-100 bg-rose-50 p-5 text-sm text-rose-700" role="alert">
          <AlertCircle size={16} className="mr-2 inline" />{error}
          <button className="ml-3 underline" onClick={load}>{t("Retry")}</button>
        </div>
      ) : dashboard && (
        <>
          <section aria-label={t("Doctor dashboard counts")} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {stats.map(({ label, value, icon: Icon }) => (
              <article key={label} className="dh-panel p-4">
                <div className="flex items-center justify-between gap-2 text-sm text-slate-500">
                  <span>{label}</span>
                  <Icon size={16} aria-hidden="true" />
                </div>
                <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
              </article>
            ))}
          </section>

          <section className="dh-panel mt-4 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{t("Today")}</h2>
                <p className="mt-1 text-sm text-slate-500">{t("Times shown in {timezone}.").replace("{timezone}", dashboard.timezone)}</p>
              </div>
              <Link to="/doctor/appointments" className="text-sm font-semibold text-indigo-700 hover:underline">{t("Manage appointments")}</Link>
            </div>
            {dashboard.todayAppointments.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">{t("No appointments scheduled for today.")}</p>
            ) : (
              <ul className="mt-3 divide-y divide-slate-100">
                {dashboard.todayAppointments.map((appointment) => (
                  <li key={appointment._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div>
                      <p className="font-medium text-slate-800">{appointment.patient?.fullName || t("Not provided")}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatTime(appointment.scheduledAt, dashboard.timezone)} · {appointment.mode}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{appointment.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <p className="mt-3 text-xs text-slate-500">
            {t("Verification: {status}. Appointment access does not grant access to medical records.").replace("{status}", t(dashboard.verificationStatus))}
          </p>
        </>
      )}
    </div>
  );
}
