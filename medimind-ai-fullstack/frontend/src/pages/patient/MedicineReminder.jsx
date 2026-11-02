import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlarmClock, Plus, Check, Bell, ArrowRight, CalendarDays, Clock3,
  PackageOpen, Sparkles, CircleCheck, CircleAlert, Pill, RotateCcw,
} from "lucide-react";
import { useToast } from "../../components/Toast";
import { medicineReminders as seed } from "../../lib/mockData";
import {
  PageStack, Reveal, HeroBand, SectionCard, ListRow,
  PageHeader, PremiumButton, PremiumModal, PremiumInput, Chip, EmptyState,
  useIsLowEnd, easePremium,
} from "../../components/premium";

const groups = [
  { id: "now", label: "Due now", description: "A gentle nudge for the next dose", icon: CircleAlert, tone: "amber" },
  { id: "today", label: "Today", description: "Your remaining doses for today", icon: Clock3, tone: "teal" },
  { id: "upcoming", label: "Coming up", description: "Planned ahead, no action needed yet", icon: CalendarDays, tone: "indigo" },
];

const statusDetails = {
  taken: { label: "Taken", helper: "Logged today", icon: CircleCheck, classes: "border-emerald-200 bg-emerald-50 text-emerald-700", button: "bg-emerald-500 text-white hover:bg-emerald-600" },
  due: { label: "Due", helper: "Tap when you've taken it", icon: CircleAlert, classes: "border-amber-200 bg-amber-50 text-amber-700", button: "border-2 border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100" },
  missed: { label: "Missed", helper: "Needs your attention", icon: CircleAlert, classes: "border-rose-200 bg-rose-50 text-rose-700", button: "border-2 border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100" },
  upcoming: { label: "Upcoming", helper: "Planned for later", icon: CalendarDays, classes: "border-indigo-200 bg-indigo-50 text-indigo-700", button: "border-2 border-indigo-200 bg-indigo-50 text-indigo-500" },
};

const chipTone = { taken: "good", due: "warn", missed: "bad", upcoming: "info" };
const leadingTone = {
  taken: "bg-emerald-50 text-emerald-600",
  due: "bg-amber-50 text-amber-600",
  missed: "bg-rose-50 text-rose-600",
  upcoming: "bg-indigo-50 text-indigo-600",
};

const getGroup = (reminder) => reminder.status === "due" ? "now" : reminder.scheduleGroup || "upcoming";

function CompletionRing({ value, lowEnd }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative h-28 w-28">
      <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90">
        <circle cx="56" cy="56" r={r} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="9" />
        <motion.circle
          cx="56"
          cy="56"
          r={r}
          fill="none"
          stroke="#5EEAD4"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={lowEnd ? { strokeDashoffset: offset } : { strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: lowEnd ? 0 : 1.1, ease: easePremium }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-semibold text-white tabular-nums">{value}%</span>
        <span className="text-[10px] text-slate-300">today</span>
      </div>
    </div>
  );
}

export default function MedicineReminder() {
  const [reminders, setReminders] = useState(seed);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", dosage: "", time: "" });
  const { toast } = useToast();
  const lowEnd = useIsLowEnd();

  const toggleTaken = (id) => {
    setReminders(r => r.map(x => {
      if (x.id !== id) return x;
      const nextTaken = !x.taken;
      const next = { ...x, taken: nextTaken, status: nextTaken ? "taken" : "due" };
      toast(next.taken ? `Marked ${x.name} as taken` : `Marked ${x.name} as not taken`, { tone: next.taken ? "success" : "info" });
      return next;
    }));
  };
  const addReminder = (e) => {
    e.preventDefault();
    if (!form.name) return;
    setReminders(r => [...r, { id: Date.now(), name: form.name, dosage: form.dosage || "As prescribed", time: form.time || "08:00 AM", taken: false, status: "due", scheduleGroup: "today", stockRemaining: 30, stockTotal: 30, refillThreshold: 7 }]);
    toast(`Reminder added for ${form.name}`, { tone: "success" });
    setForm({ name: "", dosage: "", time: "" });
    setShowForm(false);
  };

  const takenCount = reminders.filter((reminder) => reminder.status === "taken").length;
  const refillSoon = reminders.filter((reminder) => reminder.stockRemaining <= reminder.refillThreshold);
  const groupedReminders = groups.map((group) => ({ ...group, reminders: reminders.filter((reminder) => getGroup(reminder) === group.id) })).filter((group) => group.reminders.length);

  const trackable = reminders.filter((reminder) => getGroup(reminder) !== "upcoming");
  const completion = trackable.length
    ? Math.round((trackable.filter((reminder) => reminder.status === "taken").length / trackable.length) * 100)
    : 100;

  return (
    <PageStack>
      <Reveal index={0}>
        <PageHeader
          eyebrow="A little support, right on time"
          title="Medicine Reminder"
          description="A calm view of what you've taken, what needs attention, and what's coming next."
          actions={
            <PremiumButton role="patient" icon={Plus} onClick={() => setShowForm(true)}>
              Add medicine
            </PremiumButton>
          }
        />
      </Reveal>

      <Reveal index={1}>
        <HeroBand
          kicker={<><Sparkles size={13} /> Your rhythm today</>}
          title={
            <>
              You're doing great.
              <span> Keep the rhythm.</span>
            </>
          }
          copy="Quiet consistency beats perfect days. Here's where you stand right now."
          right={
            <div className="flex items-center gap-5">
              <div className="text-right">
                <p className="font-display text-3xl font-semibold text-white tabular-nums">
                  {takenCount}
                  <span className="text-lg text-slate-300">/{trackable.length}</span>
                </p>
                <p className="text-[11px] text-slate-300 mt-0.5">logged today</p>
              </div>
              <CompletionRing value={completion} lowEnd={lowEnd} />
            </div>
          }
        />
      </Reveal>

      {refillSoon.length > 0 && (
        <Reveal index={2}>
          <div className="rounded-[1.15rem] border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
            <span className="h-9 w-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
              <PackageOpen size={17} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-amber-800">
                {refillSoon.length === 1 ? "One refill to plan" : `${refillSoon.length} refills to plan`}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                {refillSoon.map((r) => r.name).join(", ")} {refillSoon.length === 1 ? "is" : "are"} running low.
                {refillSoon[0].refillDate ? ` ${refillSoon[0].refillDate}.` : " Consider ordering soon."}
              </p>
            </div>
          </div>
        </Reveal>
      )}

      {groupedReminders.length === 0 ? (
        <Reveal index={3}>
          <SectionCard icon={Pill} title="No reminders yet">
            <EmptyState
              icon={Pill}
              title="Your medicine board is empty"
              detail="Add a medicine to start tracking your daily doses."
              actionLabel="Add medicine"
              onAction={() => setShowForm(true)}
            />
          </SectionCard>
        </Reveal>
      ) : (
        groupedReminders.map((group, groupIndex) => {
          const GroupIcon = group.icon;
          return (
            <Reveal key={group.id} index={3 + groupIndex}>
              <SectionCard
                icon={GroupIcon}
                title={group.label}
                subtitle={group.description}
                action={<Chip tone="neutral">{group.reminders.length} {group.reminders.length === 1 ? "dose" : "doses"}</Chip>}
                bodyClassName="!pt-1"
              >
                <div aria-label={group.label}>
                  {group.reminders.map((m, index) => {
                    const status = statusDetails[m.status || (m.taken ? "taken" : "due")];
                    const StatusIcon = status.icon;
                    const isUpcoming = m.status === "upcoming";
                    const low = m.stockRemaining <= m.refillThreshold;
                    return (
                      <div
                        key={m.id}
                        className={index === group.reminders.length - 1 ? "" : "border-b border-[var(--mm-border)]"}
                      >
                        <ListRow
                          leading={
                            <span className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${leadingTone[m.status || "due"]}`}>
                              <AlarmClock size={16} />
                            </span>
                          }
                          title={m.name}
                          meta={
                            <span className="flex items-center gap-1.5">
                              <Bell size={11} /> {m.time}
                              <span className="text-slate-400">· {m.dosage}</span>
                            </span>
                          }
                          trailing={
                            <>
                              {low && !isUpcoming && <Chip tone="warn">Refill soon</Chip>}
                              <Chip tone={chipTone[m.status || "due"]}>
                                <StatusIcon size={11} />
                                {status.label}
                              </Chip>
                              <motion.button
                                type="button"
                                onClick={() => toggleTaken(m.id)}
                                disabled={isUpcoming}
                                whileTap={isUpcoming ? undefined : { scale: 0.93 }}
                                transition={{ type: "spring", stiffness: 500, damping: 26 }}
                                aria-label={`${status.label}: ${m.name}`}
                                className={`h-9 px-3 rounded-xl flex items-center gap-1.5 text-xs font-semibold shrink-0 transition-colors ${status.button} ${isUpcoming ? "cursor-default opacity-70" : ""}`}
                              >
                                {m.status === "taken" ? <Check size={14} /> : <StatusIcon size={14} />}
                                {m.status === "taken" ? "Taken" : isUpcoming ? "Not yet" : "I've taken it"}
                              </motion.button>
                            </>
                          }
                        />
                        <p className={`px-1 pb-2 -mt-1 text-[11px] ${m.status === "missed" ? "text-rose-600" : "text-[var(--mm-muted)]"}`}>
                          {status.helper} · {m.stockRemaining} doses left
                        </p>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            </Reveal>
          );
        })
      )}

      <Reveal index={7}>
        <div className="rounded-[1.15rem] border border-[var(--mm-border)] bg-[var(--mm-surface)] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="h-9 w-9 rounded-xl bg-[var(--mm-accent-soft)] text-[var(--mm-accent-deep)] flex items-center justify-center shrink-0">
              <RotateCcw size={16} />
            </span>
            <p className="text-sm text-[var(--mm-muted)]">Need to change a schedule or medication?</p>
          </div>
          <button type="button" className="text-sm font-semibold text-[var(--mm-accent-deep)] flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mm-accent)] rounded-lg px-1">
            Review with your doctor <ArrowRight size={15} />
          </button>
        </div>
      </Reveal>

      <PremiumModal
        open={showForm}
        onClose={() => setShowForm(false)}
        size="md"
        title="Add a medicine reminder"
        description="A gentle nudge, exactly when you need it."
        footer={
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
            <PremiumButton variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </PremiumButton>
            <PremiumButton type="submit" form="add-medicine-form" role="patient" icon={Plus}>
              Save reminder
            </PremiumButton>
          </div>
        }
      >
        <form id="add-medicine-form" onSubmit={addReminder} className="space-y-4">
          <PremiumInput
            label="Medicine name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Vitamin D3"
            autoFocus
          />
          <PremiumInput
            label="Dosage"
            value={form.dosage}
            onChange={(e) => setForm({ ...form, dosage: e.target.value })}
            placeholder="1 tablet, daily"
          />
          <PremiumInput
            label="Time"
            type="time"
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
          />
        </form>
      </PremiumModal>
    </PageStack>
  );
}
