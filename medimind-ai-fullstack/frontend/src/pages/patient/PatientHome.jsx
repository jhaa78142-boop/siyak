import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import {
  Activity, AlarmClock, AlertTriangle, ArrowUpRight, CalendarCheck,
  ChevronRight, Droplets, HeartPulse, MessageCircle, Moon, ShieldCheck,
  Sparkles, Sunrise, Trophy, Wind,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, CartesianGrid, Tooltip as RTooltip } from "recharts";
import { Badge, ProgressRing } from "../../components/Bits";
import { SkeletonChart, SkeletonCard, SkeletonStatCards } from "../../components/Skeleton";
import { useMountLoading } from "../../hooks/useMountLoading";
import { useCountUp } from "../../hooks/useCountUp";
import { GlassTooltip, chartAnimation, chartAxisTick, chartGridColor } from "../../lib/chartTheme";
import { currentPatient, healthTimeline, medicineReminders, upcomingAppointments, vitalsHistory } from "../../lib/mockData";
import { useAuth } from "../../lib/AuthContext";

const ease = [0.16, 1, 0.3, 1];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function timeLabel() {
  return new Date().toLocaleString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function PulseWave() {
  return (
    <svg className="ph-wave" viewBox="0 0 640 120" preserveAspectRatio="none" aria-hidden>
      <path
        className="ph-wave-path"
        d="M0 60 H80 L95 60 L110 20 L130 100 L150 60 H220 L235 60 L250 35 L270 85 L290 60 H380 L395 60 L410 15 L435 105 L455 60 H520 L535 60 L550 40 L570 80 L590 60 H640"
        fill="none"
        stroke="url(#phWaveGrad)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient id="phWaveGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(94,234,212,0)" />
          <stop offset="35%" stopColor="rgba(94,234,212,0.85)" />
          <stop offset="70%" stopColor="rgba(45,212,191,1)" />
          <stop offset="100%" stopColor="rgba(125,211,252,0)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function TiltScore({ score, animated }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-40, 40], [8, -8]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(mx, [-40, 40], [-10, 10]), { stiffness: 180, damping: 18 });

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - (r.left + r.width / 2));
    my.set(e.clientY - (r.top + r.height / 2));
  };

  return (
    <motion.div
      ref={ref}
      className="ph-score-stage"
      style={{ rotateX: rx, rotateY: ry }}
      onMouseMove={onMove}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
    >
      <div className="ph-score-orbit ph-score-orbit-a" />
      <div className="ph-score-orbit ph-score-orbit-b" />
      <div className="ph-score-core">
        <ProgressRing value={score} size={172} stroke={11} color="#5EEAD4" />
        <div className="ph-score-readout">
          <strong>{animated}</strong>
          <small>health score</small>
        </div>
      </div>
      <div className="ph-score-badge">
        <ArrowUpRight size={12} /> +4 this month
      </div>
    </motion.div>
  );
}

export default function PatientHome() {
  const { profile } = useAuth();
  const loading = useMountLoading();
  const patientScore = profile?.patientProfile?.healthScore ?? currentPatient.healthScore;
  const healthScore = useCountUp(patientScore);
  const healthScoreRaw = profile?.patientProfile?.healthScore ?? profile?.healthScore ?? currentPatient.healthScore;

  const patientName = profile?.fullName || profile?.name || currentPatient.name;
  const firstName = patientName.split(" ")[0] || patientName;

  const dueToday = medicineReminders.filter((r) => r.scheduleGroup === "today" && (r.status === "due" || r.status === "taken" || r.taken));
  const takenCount = dueToday.filter((r) => r.taken || r.status === "taken").length;
  const completionRatio = dueToday.length > 0 ? takenCount / dueToday.length : 1;
  const streakN = Math.min(7, dueToday.length > 0 ? (completionRatio >= 0.8 ? 4 : 1) : 7);
  const streakLabel = streakN >= 7 ? "7-day+ streak" : `${streakN}-day streak`;

  const parseTimeMin = (t) => {
    const m = t.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!m) return 0;
    let h = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    if ((m[3] || "AM").toUpperCase() === "PM" && h !== 12) h += 12;
    if ((m[3] || "AM").toUpperCase() === "AM" && h === 12) h = 0;
    return h * 60 + mm;
  };
  const nowMin = (() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  })();
  const notTaken = dueToday.filter((r) => !(r.taken || r.status === "taken")).sort((a, b) => parseTimeMin(a.time) - parseTimeMin(b.time));
  const nextMed = notTaken[0];
  const nextMedName = nextMed?.name?.split(" ")[0] || nextMed?.name || "Medication";
  const nextMedMin = nextMed ? parseTimeMin(nextMed.time) : nowMin + 60;
  let minutesUntilNext = nextMedMin - nowMin;
  if (minutesUntilNext < 0) minutesUntilNext = Math.max(1, 60 * 12 + minutesUntilNext);

  useEffect(() => {
    document.documentElement.style.setProperty("--ph-score", String(healthScoreRaw ?? 0));
  }, [healthScoreRaw]);

  if (loading) {
    return (
      <div>
        <SkeletonStatCards />
        <div className="grid xl:grid-cols-3 gap-5">
          <SkeletonChart className="xl:col-span-2" height={230} />
          <SkeletonCard lines={2} />
        </div>
      </div>
    );
  }

  const vitals = [
    { icon: HeartPulse, label: "Heart rate", value: "71", unit: "bpm", note: "Steady resting range", tone: "rose", spark: [62, 68, 71, 69, 73, 71, 70] },
    { icon: Droplets, label: "Blood oxygen", value: "98", unit: "%", note: "Excellent saturation", tone: "sky", spark: [97, 98, 98, 97, 99, 98, 98] },
    { icon: Moon, label: "Sleep", value: "7.6", unit: "hrs", note: "+0.8 hrs vs last week", tone: "violet", spark: [6.2, 6.8, 7.1, 7.4, 6.9, 7.8, 7.6] },
    { icon: Wind, label: "Breathing", value: "14", unit: "/min", note: "Calm respiratory rate", tone: "teal", spark: [15, 14, 14, 16, 13, 14, 14] },
  ];

  return (
    <div className="ph-dash">
      {/* Intro */}
      <motion.header
        className="ph-intro"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
      >
        <div className="ph-intro-copy">
          <p className="ph-kicker">
            <Sunrise size={13} />
            <span>{timeLabel()}</span>
          </p>
          <h1 className="ph-headline">
            {greeting()}, <em>{firstName}</em>
          </h1>
          <p className="ph-sub">
            Your body is speaking in quiet patterns today. Here is the clearest picture — composed for calm decisions.
          </p>
        </div>
        <div className="ph-intro-actions">
          <Link to="/patient/ai-chat" className="ph-cta-primary">
            <MessageCircle size={16} /> Ask MediMind
          </Link>
          <Link to="/patient/health-score" className="ph-cta-ghost">
            Full score <ArrowUpRight size={14} />
          </Link>
        </div>
      </motion.header>

      {/* Hero bento */}
      <div className="ph-bento">
        <motion.section
          className="ph-panel ph-panel-hero"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.06, ease }}
        >
          <div className="ph-hero-aura" />
          <div className="ph-hero-grain" />
          <PulseWave />
          <div className="ph-hero-layout">
            <div className="ph-hero-text">
              <p className="ph-live">
                <i /> Live rhythm · stable
              </p>
              <h2>
                Small signals.
                <span> Meaningful progress.</span>
              </h2>
              <p>
                Vitals look composed. Consistency is compounding into a stronger baseline — keep listening, not chasing.
              </p>
              <div className="ph-hero-meta">
                <span><ShieldCheck size={14} /> Private by design</span>
                <span><Sparkles size={14} /> AI insight ready</span>
              </div>
            </div>
            <TiltScore score={currentPatient.healthScore} animated={healthScore} />
          </div>
        </motion.section>

        <motion.section
          className="ph-panel ph-panel-streak"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease }}
        >
          <div className="ph-streak-icon">
            {dueToday.length === 0 || completionRatio >= 0.8 ? <Trophy size={20} /> : <AlertTriangle size={20} />}
          </div>
          <p className="ph-panel-label">Today&apos;s win</p>
          {dueToday.length === 0 ? (
            <h3>No doses due — rest well.</h3>
          ) : completionRatio >= 0.8 ? (
            <>
              <h3>{takenCount}/{dueToday.length} on track</h3>
              <p className="ph-panel-note">{streakLabel}. Quiet consistency beats perfect days.</p>
            </>
          ) : (
            <>
              <h3>Next: {nextMedName}</h3>
              <p className="ph-panel-note">Due in {minutesUntilNext} min</p>
              <Link to="/patient/reminders" className="ph-text-link">Open reminders <ChevronRight size={13} /></Link>
            </>
          )}
          <div className="ph-streak-bar">
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: `${Math.round(completionRatio * 100)}%` }}
              transition={{ duration: 1.1, delay: 0.4, ease }}
            />
          </div>
        </motion.section>

        <motion.section
          className="ph-panel ph-panel-insight"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16, ease }}
        >
          <p className="ph-panel-label soft">MediMind insight</p>
          <h3>Your LDL trend deserves attention, not alarm.</h3>
          <p className="ph-panel-note">
            A follow-up with Dr. Verma and a little less saturated fat may nudge the next reading the right way.
          </p>
          <Link to="/patient/report-analyzer" className="ph-text-link light">
            Review the full picture <ArrowUpRight size={13} />
          </Link>
        </motion.section>
      </div>

      {/* Vital constellation */}
      <motion.div
        className="ph-vitals"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.07, delayChildren: 0.18 } },
        }}
      >
        {vitals.map((v) => (
          <motion.article
            key={v.label}
            className={`ph-vital ph-vital-${v.tone}`}
            variants={{
              hidden: { opacity: 0, y: 18 },
              show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } },
            }}
            whileHover={{ y: -4 }}
          >
            <div className="ph-vital-top">
              <span className="ph-vital-icon"><v.icon size={16} /></span>
              <span className="ph-vital-label">{v.label}</span>
            </div>
            <p className="ph-vital-value">
              {v.value}<small>{v.unit}</small>
            </p>
            <p className="ph-vital-note">{v.note}</p>
            <svg className="ph-spark" viewBox="0 0 84 28" preserveAspectRatio="none" aria-hidden>
              <polyline
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={v.spark.map((n, i) => {
                  const min = Math.min(...v.spark);
                  const max = Math.max(...v.spark);
                  const y = 24 - ((n - min) / Math.max(max - min, 1)) * 18;
                  return `${(i / (v.spark.length - 1)) * 84},${y}`;
                }).join(" ")}
              />
            </svg>
          </motion.article>
        ))}
      </motion.div>

      {/* Chart + today plan */}
      <div className="ph-mid">
        <motion.section
          className="ph-panel ph-panel-chart"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.28, ease }}
        >
          <div className="ph-section-head">
            <div>
              <h2><Activity size={16} /> Weekly pulse</h2>
              <p>Heart rate across the last seven days</p>
            </div>
            <span className="ph-chip">Auto-synced</span>
          </div>
          <div className="ph-mini-grid">
            <div><label>Avg HR</label><strong>72 <em>bpm</em></strong></div>
            <div><label>SpO₂</label><strong>98 <em>%</em></strong></div>
            <div><label>Sleep</label><strong>7.6 <em>hrs</em></strong></div>
            <div><label>Focus</label><strong>86 <em>%</em></strong></div>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={vitalsHistory} margin={{ top: 8, right: 6, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="phPulseFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0D9488" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#0D9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} tick={chartAxisTick} />
              <RTooltip content={<GlassTooltip />} />
              <Area type="monotone" dataKey="hr" stroke="#0F766E" strokeWidth={2.6} fill="url(#phPulseFill)" {...chartAnimation} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.section>

        <motion.section
          className="ph-panel ph-panel-today"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.34, ease }}
        >
          <div className="ph-section-head">
            <div>
              <h2>Today, gently</h2>
              <p>One rhythm to keep</p>
            </div>
            <Link to="/patient/reminders" className="ph-text-link">Open plan</Link>
          </div>
          <p className="ph-today-copy">
            Next reminder: <strong>Atorvastatin at 9:00 PM</strong>. A quiet close to the day.
          </p>
          <div className="ph-rhythm">
            <div className="ph-rhythm-top">
              <span>Medication rhythm</span>
              <strong>86%</strong>
            </div>
            <div className="ph-streak-bar tall">
              <motion.span initial={{ width: 0 }} animate={{ width: "86%" }} transition={{ duration: 1.15, delay: 0.5, ease }} />
            </div>
            <p>6 days on track this week. That consistency matters.</p>
          </div>
          <div className="ph-day-ribbon">
            {medicineReminders.slice(0, 4).map((m, i) => (
              <div key={m.id} className={`ph-day-bead ${m.taken || m.status === "taken" ? "is-done" : i === 0 ? "is-next" : ""}`}>
                <span>{m.time.replace(/\s*(AM|PM)/i, (x) => x.trim().charAt(0))}</span>
                <b>{m.name.split(" ")[0]}</b>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Lower triad */}
      <div className="ph-lower">
        <motion.section
          className="ph-panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.38, ease }}
        >
          <div className="ph-section-head">
            <h2><CalendarCheck size={15} /> Next appointments</h2>
            <Link to="/patient/appointments" className="ph-text-link">See all</Link>
          </div>
          <div className="ph-list">
            {upcomingAppointments.slice(0, 2).map((a) => (
              <div key={a.id} className="ph-list-row">
                <div className="ph-avatar">
                  {a.doctor.split(" ").map((n) => n[0]).slice(-2).join("")}
                </div>
                <div>
                  <p className="ph-list-title">{a.doctor}</p>
                  <p className="ph-list-meta">{a.date} · {a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="ph-panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.42, ease }}
        >
          <div className="ph-section-head">
            <h2><AlarmClock size={15} /> Medicine plan</h2>
            <Link to="/patient/reminders" className="ph-text-link">Manage</Link>
          </div>
          <div className="ph-list">
            {medicineReminders.slice(0, 3).map((m) => (
              <div key={m.id} className="ph-list-row between">
                <div>
                  <p className="ph-list-title">{m.name}</p>
                  <p className="ph-list-meta">{m.time}</p>
                </div>
                <Badge tone={m.status === "taken" || m.taken ? "good" : m.status === "upcoming" ? "info" : "warn"}>
                  {m.status === "taken" || m.taken ? "Taken" : m.status === "upcoming" ? "Soon" : "Due"}
                </Badge>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="ph-panel ph-panel-moments"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.46, ease }}
        >
          <div className="ph-section-head">
            <div>
              <h2>Health moments</h2>
              <p>What changed recently</p>
            </div>
            <Link to="/patient/timeline" className="ph-text-link">Timeline</Link>
          </div>
          <div className="ph-moments">
            {healthTimeline.slice(0, 3).map((item) => (
              <article key={item.id}>
                <div className="ph-moment-meta">
                  <i className={item.tone === "good" ? "good" : item.tone === "warn" ? "warn" : ""} />
                  {item.date} · {item.type}
                </div>
                <h4>{item.title}</h4>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
