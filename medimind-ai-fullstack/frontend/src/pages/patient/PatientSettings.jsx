import { useEffect, useState } from "react";
import {
  Bell, Moon, Sun, Globe, Lock, Smartphone, Trash2, Users, Sparkles, AlertTriangle,
} from "lucide-react";
import { useTheme } from "../../lib/ThemeContext";
import { api } from "../../lib/api";
import { registerForPushNotifications } from "../../lib/firebase";
import {
  PageStack, Reveal, HeroBand, SectionCard, PageHeader,
  Toggle, Select, PremiumButton, IconTile, useIsLowEnd,
} from "../../components/premium";

/* Settings row — icon + title + description, with a control on the right.
   Mirrors the previous SettingsRow semantics (icon/title/description/right). */
function PrefRow({ icon, title, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="flex min-w-0 items-start gap-3">
        <IconTile icon={icon} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--mm-ink)]">{title}</p>
          {description && (
            <p className="mt-0.5 text-xs leading-relaxed text-[var(--mm-muted)]">{description}</p>
          )}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

const notificationTypes = [
  ["welcome-registration", "Welcome and registration"],
  ["email-verification", "Email verification"],
  ["password-reset", "Password reset"],
  ["appointment-confirmed", "Appointment confirmation"],
  ["appointment-reminder", "Appointment reminder"],
  ["medicine-reminder", "Medicine reminder"],
  ["report-ready", "Report ready"],
  ["emergency-alert", "Emergency alert"],
  ["monthly-health-report", "Monthly health report"],
  ["prescription-ready", "Prescription ready"],
  ["doctor-verification", "Doctor verification"],
  ["system", "System updates"],
];
const notificationChannels = ["email", "push", "sms"];

export default function PatientSettings() {
  const { dark, toggleDark } = useTheme();
  const lowEnd = useIsLowEnd();

  const [notificationPrefs, setNotificationPrefs] = useState({});
  const [notificationTimezone, setNotificationTimezone] = useState("UTC");
  const [monthlyConsent, setMonthlyConsent] = useState(false);
  const [pushRegistered, setPushRegistered] = useState(false);
  const [notificationLoading, setNotificationLoading] = useState(true);
  const [notificationSaving, setNotificationSaving] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [prefs, setPrefs] = useState({
    shareFamily: false,
    aiData: true,
  });
  const [language, setLanguage] = useState("English");

  const setPref = (key) => (val) => setPrefs((p) => ({ ...p, [key]: val }));

  useEffect(() => {
    let active = true;
    api.get("/notifications/preferences")
      .then(({ data }) => {
        if (!active) return;
        setNotificationPrefs(data.preferences || {});
        setNotificationTimezone(data.timezone || "UTC");
        setMonthlyConsent(data.monthlyHealthReportConsent === true);
        setPushRegistered(data.pushRegistered === true);
      })
      .catch((error) => {
        if (active) setNotificationError(error.message);
      })
      .finally(() => {
        if (active) setNotificationLoading(false);
      });
    return () => { active = false; };
  }, []);

  const updateNotificationPreference = async (type, channel, enabled) => {
    const previous = notificationPrefs;
    const next = {
      ...previous,
      [type]: { ...previous[type], [channel]: enabled },
    };
    setNotificationPrefs(next);
    setNotificationError("");
    setNotificationMessage("");
    setNotificationSaving(true);
    try {
      const { data } = await api.patch("/notifications/preferences", {
        preferences: { [type]: { [channel]: enabled } },
      });
      setNotificationPrefs(data.preferences || next);
      setNotificationMessage("Notification preference saved.");
    } catch (error) {
      setNotificationPrefs(previous);
      setNotificationError(error.message);
    } finally {
      setNotificationSaving(false);
    }
  };

  const updateMonthlyConsent = async (granted) => {
    setNotificationError("");
    setNotificationMessage("");
    setNotificationSaving(true);
    try {
      const { data } = await api.patch("/notifications/preferences", {
        monthlyHealthReportConsent: granted,
      });
      setMonthlyConsent(data.monthlyHealthReportConsent === true);
      setNotificationMessage(granted
        ? "Monthly health report consent saved."
        : "Monthly health report consent withdrawn.");
    } catch (error) {
      setNotificationError(error.message);
    } finally {
      setNotificationSaving(false);
    }
  };

  const saveNotificationTimezone = async () => {
    setNotificationError("");
    setNotificationMessage("");
    setNotificationSaving(true);
    try {
      const { data } = await api.patch("/notifications/preferences", {
        timezone: notificationTimezone,
      });
      setNotificationTimezone(data.timezone);
      setNotificationMessage("Reminder timezone saved.");
    } catch (error) {
      setNotificationError(error.message);
    } finally {
      setNotificationSaving(false);
    }
  };

  const enablePushOnDevice = async () => {
    setNotificationError("");
    setNotificationMessage("");
    setNotificationSaving(true);
    try {
      const token = await registerForPushNotifications();
      await api.post("/notifications/push-token", { token });
      setPushRegistered(true);
      setNotificationMessage("Push notifications enabled on this device.");
    } catch (error) {
      setNotificationError(error.message);
    } finally {
      setNotificationSaving(false);
    }
  };

  const removePushDevices = async () => {
    setNotificationError("");
    setNotificationMessage("");
    setNotificationSaving(true);
    try {
      await api.delete("/notifications/push-token");
      setPushRegistered(false);
      setNotificationMessage("Push devices removed from your account.");
    } catch (error) {
      setNotificationError(error.message);
    } finally {
      setNotificationSaving(false);
    }
  };

  const languageOptions = [
    { value: "English", label: "English" },
    { value: "हिन्दी", label: "हिन्दी" },
    { value: "मराठी", label: "मराठी" },
  ];

  return (
    <PageStack>
      <Reveal index={0}>
        <PageHeader
          eyebrow="Preferences"
          title="Settings"
          description="Control notifications, privacy and account preferences."
        />
      </Reveal>

      <Reveal index={1}>
        <HeroBand
          kicker={<><Sparkles size={12} /> Preferences console</>}
          title="Your preferences"
          copy="Tune notifications, privacy and appearance — every change applies instantly across your account."
          right={
            <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/90">
              {dark ? <Moon size={15} className="text-teal-200" /> : <Sun size={15} className="text-teal-200" />}
              {dark ? "Dark theme" : "Light theme"}
            </div>
          }
        />
      </Reveal>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal index={2} className="lg:col-span-2">
          <SectionCard
            icon={Bell}
            title="Notifications"
            subtitle="Choose the channels for each notification type"
            spotlight={!lowEnd}
            hover={!lowEnd}
            bodyClassName="space-y-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--mm-ink)]">Firebase push on this device</p>
                <p className="mt-0.5 text-xs text-[var(--mm-muted)]">
                  {pushRegistered ? "This device is registered for push notifications." : "Register this browser to receive push notifications."}
                </p>
              </div>
              {pushRegistered ? (
                <PremiumButton
                  variant="outline"
                  icon={Trash2}
                  disabled={notificationSaving}
                  onClick={removePushDevices}
                >
                  Remove registered devices
                </PremiumButton>
              ) : (
                <PremiumButton
                  variant="outline"
                  icon={Smartphone}
                  disabled={notificationSaving}
                  onClick={enablePushOnDevice}
                >
                  Enable on this device
                </PremiumButton>
              )}
            </div>

            <div className="overflow-x-auto rounded-2xl border border-[var(--mm-border)]">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-[var(--mm-surface)] text-xs uppercase tracking-wide text-[var(--mm-muted)]">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">Notification</th>
                    {notificationChannels.map((channel) => (
                      <th scope="col" key={channel} className="px-4 py-3 text-center font-semibold">{channel}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--mm-border)]">
                  {notificationTypes.map(([type, label]) => (
                    <tr key={type}>
                      <th scope="row" className="px-4 py-3 font-medium text-[var(--mm-ink)]">{label}</th>
                      {notificationChannels.map((channel) => (
                        <td key={channel} className="px-4 py-3 text-center">
                          <span className="inline-flex">
                            <Toggle
                              checked={notificationPrefs[type]?.[channel] === true}
                              disabled={notificationLoading || notificationSaving}
                              onChange={(enabled) => updateNotificationPreference(type, channel, enabled)}
                              label={`${label} via ${channel}`}
                            />
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-[var(--mm-border)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--mm-ink)]">Monthly health report consent</p>
                <p className="mt-0.5 text-xs text-[var(--mm-muted)]">
                  This separate opt-in is required before a monthly report notification is queued.
                </p>
              </div>
              <Toggle
                checked={monthlyConsent}
                disabled={notificationLoading || notificationSaving}
                onChange={updateMonthlyConsent}
                label="Consent to monthly health report notifications"
              />
            </div>

            <div className="flex flex-col gap-3 rounded-2xl border border-[var(--mm-border)] p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--mm-ink)]">Reminder timezone</p>
                <p className="mt-0.5 text-xs text-[var(--mm-muted)]">Use an IANA timezone, for example Asia/Kolkata.</p>
              </div>
              <div className="flex gap-2">
                <input
                  value={notificationTimezone}
                  onChange={(event) => setNotificationTimezone(event.target.value)}
                  aria-label="Reminder timezone"
                  className="w-44 rounded-xl border border-[var(--mm-border)] bg-[var(--mm-surface)] px-3 py-2 text-sm text-[var(--mm-ink)]"
                  disabled={notificationLoading || notificationSaving}
                />
                <PremiumButton
                  variant="outline"
                  disabled={notificationLoading || notificationSaving}
                  onClick={saveNotificationTimezone}
                >
                  Save
                </PremiumButton>
              </div>
            </div>

            <p className="text-xs text-[var(--mm-muted)]">
              SMS delivery is not available until an SMS provider is configured. Scheduled reminders are queued by the server.
            </p>
            {notificationError && <p role="alert" className="text-sm text-rose-600">{notificationError}</p>}
            {notificationMessage && <p role="status" className="text-sm text-emerald-700">{notificationMessage}</p>}
          </SectionCard>
        </Reveal>

        <Reveal index={3}>
          <SectionCard
            icon={Lock}
            title="Privacy & Data"
            subtitle="Who can see your health data"
            spotlight={!lowEnd}
            hover={!lowEnd}
            bodyClassName="divide-y divide-[var(--mm-border)]"
          >
            <PrefRow
              icon={Lock}
              title="Share records with family"
              description="Let linked family members view your health timeline"
            >
              <Toggle checked={prefs.shareFamily} onChange={setPref("shareFamily")} label="Share records with family" />
            </PrefRow>
            <PrefRow
              icon={Users}
              title="Allow AI to use anonymised data"
              description="Helps improve MediMind AI's medical accuracy"
            >
              <Toggle checked={prefs.aiData} onChange={setPref("aiData")} label="Allow AI to use anonymised data" />
            </PrefRow>
            <PrefRow icon={Globe} title="Language" description="Interface language for your account">
              <Select
                value={language}
                onChange={setLanguage}
                options={languageOptions}
                className="w-36"
              />
            </PrefRow>
          </SectionCard>
        </Reveal>

        <Reveal index={4}>
          <SectionCard
            icon={Moon}
            title="Appearance"
            subtitle="Comfort for every lighting"
            spotlight={!lowEnd}
            hover={!lowEnd}
          >
            <PrefRow
              icon={Moon}
              title="Dark mode"
              description="Reduce glare in low-light environments"
            >
              <Toggle checked={dark} onChange={toggleDark} label="Dark mode" />
            </PrefRow>
          </SectionCard>
        </Reveal>

        <Reveal index={5}>
          <SectionCard
            icon={AlertTriangle}
            title={<span className="text-rose-600 dark:text-rose-400">Danger Zone</span>}
            subtitle="These actions are permanent and cannot be undone."
            className="border-rose-200/70 dark:border-rose-500/25"
            spotlight={!lowEnd}
            hover={!lowEnd}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-[var(--mm-muted)]">
                Deleting your account removes all records, reports and history.
              </p>
              <PremiumButton variant="danger" icon={Trash2} magnetic={!lowEnd}>
                Delete my account
              </PremiumButton>
            </div>
          </SectionCard>
        </Reveal>
      </div>
    </PageStack>
  );
}
