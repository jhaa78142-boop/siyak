import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Bell, CalendarCheck, FileText, ShieldCheck, Sparkles } from "lucide-react";
import { api } from "../lib/api";

const notificationPresentation = {
  "appointment-confirmed": { title: "Appointment confirmed", icon: CalendarCheck },
  "appointment-updated": { title: "Appointment updated", icon: CalendarCheck },
  "appointment-reminder": { title: "Appointment reminder", icon: CalendarCheck },
  "prescription-ready": { title: "Prescription update", icon: FileText },
  "report-ready": { title: "Report update", icon: FileText },
  "report-shared": { title: "Report access update", icon: ShieldCheck },
  "report-reviewed": { title: "Report review completed", icon: FileText },
  "doctor-verification": { title: "Verification status update", icon: ShieldCheck },
  "system": { title: "Account notification", icon: Bell },
  "emergency-alert": { title: "Important health alert", icon: AlertTriangle },
  "monthly-health-report": { title: "Health report available", icon: Sparkles },
};

function notificationTitle(type) {
  return notificationPresentation[type]?.title || "MediMind notification";
}

export default function NotificationDropdown({ open, onClose, anchorRef }) {
  const panelRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([api.get("/notifications"), api.get("/notifications/preferences")])
      .then(([notificationResponse, preferencesResponse]) => {
        if (!active) return;
        setNotifications(notificationResponse.data || []);
        setTimezone(preferencesResponse.data?.timezone || "Asia/Kolkata");
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load notifications.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleClick = (event) => {
      if (panelRef.current?.contains(event.target)) return;
      if (anchorRef?.current?.contains(event.target)) return;
      onClose();
    };
    const handleKey = (event) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, onClose, anchorRef]);

  const markRead = async (item) => {
    if (item.read) return;
    try {
      await api.patch(`/notifications/${item._id}/read`, {});
      setNotifications((current) => current.map((notification) =>
        notification._id === item._id ? { ...notification, read: true } : notification
      ));
    } catch (requestError) {
      setError(requestError.message || "Unable to update notification status.");
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.12 } }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-xl shadow-slate-900/10 dark:border-slate-700/70 dark:bg-slate-900"
          role="region"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3 dark:border-slate-700/70">
            <p className="text-sm font-semibold text-ink">Notifications</p>
            <span className="text-[10px] font-semibold text-slate-500">{notifications.filter((item) => !item.read).length} unread</span>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? <p role="status" className="px-4 py-6 text-center text-sm text-slate-500">Loading notifications…</p> : null}
            {error && <p role="alert" className="px-4 py-3 text-xs text-rose-700">{error}</p>}
            {!loading && !error && notifications.length === 0 && <p className="px-4 py-6 text-center text-sm text-slate-500">No notifications.</p>}
            {!loading && notifications.map((item) => {
              const presentation = notificationPresentation[item.triggerType] || {};
              const Icon = presentation.icon || Bell;
              let time = "Time unavailable";
              try {
                time = new Intl.DateTimeFormat(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: timezone,
                }).format(new Date(item.createdAt));
              } catch {
                time = new Date(item.createdAt).toLocaleString();
              }
              return (
                <button
                  type="button"
                  key={item._id}
                  onClick={() => markRead(item)}
                  aria-label={`${notificationTitle(item.triggerType)}${item.read ? "" : ", unread"}`}
                  className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 dark:border-slate-800 ${item.read ? "opacity-70" : "hover:bg-slate-50 dark:hover:bg-white/5"}`}
                >
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"><Icon size={14} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-[13px] font-semibold text-ink">{notificationTitle(item.triggerType)}</span>
                      {!item.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-600" aria-hidden="true" />}
                    </span>
                    <span className="mt-1 block text-[11px] text-slate-500">{time}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
