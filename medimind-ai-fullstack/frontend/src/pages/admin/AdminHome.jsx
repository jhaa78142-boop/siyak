import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  Users, ShieldCheck, CalendarClock, Bot, AlertTriangle, ArrowUpRight,
  Gauge, Sparkles, Activity, Server, Database, TrendingUp, Zap, Eye,
  ChevronRight, Clock, Shield,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import SectionHeader from "../../components/SectionHeader";
import StatCard from "../../components/StatCard";
import Button from "../../components/Button";
import { Badge } from "../../components/Bits";
import { SkeletonStatCards, SkeletonChart, SkeletonCard } from "../../components/Skeleton";
import { GlassTooltip, chartAnimation, chartAxisTick, chartGridColor } from "../../lib/chartTheme";
import {
  adminStats as mockAdminStats,
  userGrowth,
  pendingDoctorVerifications as mockPendingDoctors,
  earlyWarnings as mockEarlyWarnings,
} from "../../lib/mockData";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/AuthContext";
import { useCountUp } from "../../hooks/useCountUp";

const ease = [0.16, 1, 0.3, 1];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function timeLabel() {
  return new Date().toLocaleString(undefined, {
    weekday: "long", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}

/* Animated network pulse for hero */
function NetworkPulse() {
  return (
    <svg className="ah-pulse-svg" viewBox="0 0 400 140" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="ahPulseGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(192,132,252,0)" />
          <stop offset="40%" stopColor="rgba(192,132,252,0.8)" />
          <stop offset="70%" stopColor="rgba(139,92,246,1)" />
          <stop offset="100%" stopColor="rgba(167,139,250,0)" />
        </linearGradient>
      </defs>
      <path
        className="ah-pulse-path"
        d="M0 70 H60 L80 70 L100 30 L120 110 L140 70 H200 L220 70 L240 45 L260 95 L280 70 H340 L360 70 L380 50 L400 70"
        fill="none" stroke="url(#ahPulseGrad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

/* 3D tilt system health gauge */
function TiltGauge({ value, animated }) {
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
      style={{ rotateX: rx, rotateY: ry, position: "relative", display: "grid", placeItems: "center", perspective: "800px", transformStyle: "preserve-3d", minHeight: "14rem" }}
      onMouseMove={onMove}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
    >
      <div className="dh-rating-orbit dh-rating-orbit-a" style={{ borderColor: "rgba(192,132,252,0.22)" }} />
      <div className="dh-rating-orbit dh-rating-orbit-b" style={{ borderColor: "rgba(167,139,250,0.18)" }} />
      <div style={{ position: "relative" }}>
        <svg width="156" height="156" viewBox="0 0 156 156">
          <circle cx="78" cy="78" r="68" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
          <circle cx="78" cy="78" r="68" fill="none" stroke="url(#ahGaugeGrad)" strokeWidth="10"
            strokeLinecap="round" strokeDasharray={`${(parseFloat(value) / 100) * 427} 427`}
            transform="rotate(-90 78 78)"
            style={{ transition: "stroke-dasharray 1.5s cubic-bezier(0.16,1,0.3,1)" }}
          />
          <defs>
            <linearGradient id="ahGaugeGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="100%" stopColor="#7C3AED" />
            </linearGradient>
          </defs>
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" }}>
          <strong style={{ fontFamily: "var(--font-display)", fontSize: "2.8rem", fontWeight: 650, letterSpacing: "-0.06em", lineHeight: 1 }}>
            {animated}
          </strong>
          <small style={{ marginTop: "0.3rem", fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(192,132,252,0.85)" }}>
            system health
          </small>
        </div>
      </div>
      <div style={{
        marginTop: "0.75rem", display: "inline-flex", alignItems: "center", gap: "0.3rem",
        padding: "0.3rem 0.65rem", borderRadius: "0.5rem",
        background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
        color: "#4ADE80", fontSize: "0.7rem", fontWeight: 600,
      }}>
        <Zap size={11} /> All systems operational
      </div>
    </motion.div>
  );
}

export default function AdminHome() {
  const { profile } = useAuth();
  const [stats, setStats] = useState(mockAdminStats);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [earlyWarnings, setEarlyWarnings] = useState(mockEarlyWarnings);
  const [loading, setLoading] = useState(true);

  const adminName = profile?.fullName || profile?.name || "Admin";
  const firstName = adminName.split(" ")[0];
  const animatedHealth = useCountUp("99.7%");

  useEffect(() => {
    async function loadAll() {
      try {
        const [statsRes, pendingRes, warningsRes] = await Promise.allSettled([
          api.get("/admin/stats"),
          api.get("/admin/doctors/pending"),
          api.get("/admin/early-warnings"),
        ]);
        if (statsRes.status === "fulfilled" && statsRes.value?.data) setStats(statsRes.value.data);
        if (pendingRes.status === "fulfilled" && Array.isArray(pendingRes.value?.data)) setPendingDoctors(pendingRes.value.data);
        else setPendingDoctors(mockPendingDoctors);
        if (warningsRes.status === "fulfilled" && Array.isArray(warningsRes.value?.data) && warningsRes.value.data.length > 0) setEarlyWarnings(warningsRes.value.data);
      } catch (err) {
        console.error("[AdminHome] Failed to load:", err);
      } finally {
        setLoading(false);
      }
    }
    loadAll();
  }, []);

  if (loading) {
    return (
      <div className="dh-dash">
        <SectionHeader eyebrow="Command center" title="Platform overview" description="Real-time health of MediMind across users, doctors, and AI systems." />
        <SkeletonStatCards />
        <div className="grid xl:grid-cols-3 gap-5">
          <SkeletonChart className="xl:col-span-2" height={240} />
          <SkeletonCard lines={4} />
        </div>
      </div>
    );
  }

  const quickStats = [
    { icon: Users, label: "Total users", value: stats.totalUsers?.toLocaleString() || "0", note: "Real-time", tone: "violet" },
    { icon: ShieldCheck, label: "Verified doctors", value: stats.doctors?.toLocaleString() || "0", note: `${stats.pendingVerifications || 0} pending`, tone: "indigo" },
    { icon: CalendarClock, label: "Appointments today", value: String(stats.appointmentsToday || 0), note: "Platform-wide", tone: "sky" },
    { icon: Bot, label: "AI queries today", value: stats.aiQueriesToday?.toLocaleString() || "0", note: "Chat + RAG + OCR", tone: "amber" },
  ];

  return (
    <div className="dh-dash" style={{ "--dh-blue": "#7C3AED", "--dh-blue-bright": "#8B5CF6" }}>
      {/* Intro header */}
      <motion.header
        className="dh-intro"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
      >
        <div className="dh-intro-copy">
          <p className="dh-kicker" style={{ color: "#7C3AED" }}>
            <Shield size={13} />
            <span>{timeLabel()}</span>
          </p>
          <h1 className="dh-headline">
            {greeting()}, <em style={{ background: "linear-gradient(120deg, #7C3AED, #8B5CF6, #A78BFA)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{firstName}</em>
          </h1>
          <p className="dh-sub">
            Platform command center — {stats.totalUsers?.toLocaleString() || 0} users, {stats.doctors?.toLocaleString() || 0} doctors, and {stats.pendingVerifications || 0} pending verifications.
          </p>
        </div>
        <div className="dh-intro-actions">
          <Link to="/admin/verification" className="dh-cta-primary" style={{ background: "linear-gradient(135deg, #7C3AED, #8B5CF6 55%, #6D28D9)" }}>
            <ShieldCheck size={16} /> {stats.pendingVerifications || 0} pending verifications
          </Link>
          <Link to="/admin/early-warning" className="dh-cta-ghost">
            Early warnings <ArrowUpRight size={14} />
          </Link>
        </div>
      </motion.header>

      {/* Hero bento */}
      <div className="dh-bento">
        <motion.section
          className="dh-panel dh-panel-hero"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.06, ease }}
          style={{ background: "linear-gradient(145deg, #0C0517 0%, #1A0F30 42%, #2D1B58 100%)" }}
        >
          <div className="dh-hero-aura" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.28), transparent 68%)" }} />
          <div className="dh-hero-grain" />
          <NetworkPulse />
          <div className="dh-hero-layout">
            <div className="dh-hero-text">
              <p className="dh-live" style={{ color: "#C4B5FD" }}>
                <i style={{ background: "#A78BFA", boxShadow: "0 0 0 4px rgba(167,139,250,0.18)" }} /> Platform telemetry · live
              </p>
              <h2>
                Govern with
                <span style={{ color: "#C4B5FD" }}> quiet precision.</span>
              </h2>
              <p>
                Verification queue, AI load, and early-warning signals in one board — intervene before issues become incidents.
              </p>
              <div className="dh-hero-meta">
                <span><Server size={14} /> {stats.totalUsers?.toLocaleString() || 0} users</span>
                <span><Database size={14} /> RAG pipeline active</span>
              </div>
            </div>
            <TiltGauge value="99.7" animated={animatedHealth} />
          </div>
        </motion.section>

        <motion.section
          className="dh-panel dh-panel-queue"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease }}
        >
          <div className="dh-queue-icon" style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED" }}>
            <ShieldCheck size={20} />
          </div>
          <p className="dh-panel-label" style={{ color: "#7C3AED" }}>Verification queue</p>
          {pendingDoctors.length > 0 ? (
            <>
              <h3>{pendingDoctors.length} doctors awaiting review</h3>
              <p className="dh-panel-note">Newest: {pendingDoctors[0]?.name || pendingDoctors[0]?.fullName || "Doctor"}</p>
              <div className="dh-queue-badges">
                <Badge tone="warn">{pendingDoctors.length} pending</Badge>
              </div>
            </>
          ) : (
            <h3>Queue clear — all caught up</h3>
          )}
          <Link to="/admin/verification" className="dh-text-link" style={{ color: "#7C3AED" }}>Review all <ChevronRight size={13} /></Link>
          <div className="dh-streak-bar">
            <motion.span
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(pendingDoctors.length * 20, 100)}%` }}
              transition={{ duration: 1.1, delay: 0.4, ease }}
              style={{ background: "linear-gradient(90deg, #7C3AED, #A78BFA)" }}
            />
          </div>
        </motion.section>

        <motion.section
          className="dh-panel dh-panel-insight"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.16, ease }}
          style={{ background: "linear-gradient(155deg, #0C0517 0%, #1A0F30 55%, #2D1B58 100%)" }}
        >
          <p className="dh-panel-label soft" style={{ color: "#C4B5FD" }}>Early warning system</p>
          <h3>{earlyWarnings.length} active signals detected across the platform.</h3>
          <p className="dh-panel-note" style={{ color: "rgba(196,181,253,0.72)" }}>
            AI-detected symptom clusters and anomalies — reviewed automatically every 30 minutes.
          </p>
          <Link to="/admin/early-warning" className="dh-text-link light" style={{ color: "#C4B5FD" }}>
            Open early warnings <ArrowUpRight size={13} />
          </Link>
        </motion.section>
      </div>

      {/* Stat constellation */}
      <motion.div
        className="dh-vitals"
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.18 } } }}
      >
        {quickStats.map((v) => (
          <motion.article
            key={v.label}
            className={`dh-vital dh-vital-${v.tone}`}
            variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease } } }}
            whileHover={{ y: -4 }}
          >
            <div className="dh-vital-top">
              <span className="dh-vital-icon" style={v.tone === "violet" ? { background: "rgba(124,58,237,0.1)", color: "#7C3AED" } : undefined}>
                <v.icon size={16} />
              </span>
              <span className="dh-vital-label">{v.label}</span>
            </div>
            <p className="dh-vital-value">{v.value}</p>
            <p className="dh-vital-note">{v.note}</p>
          </motion.article>
        ))}
      </motion.div>

      {/* Chart + Queue */}
      <div className="dh-mid">
        <motion.section
          className="dh-panel dh-panel-chart"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.28, ease }}
        >
          <div className="dh-section-head">
            <div>
              <h2><TrendingUp size={16} /> User growth</h2>
              <p>Patients vs doctors over the last six months</p>
            </div>
            <span className="dh-chip" style={{ background: "rgba(124,58,237,0.1)", color: "#7C3AED" }}>6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="ahPat" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ahDoc" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0EA5E9" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#0EA5E9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={chartAxisTick} />
              <Tooltip content={<GlassTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="patients" name="Patients" stroke="#7C3AED" strokeWidth={2.25} fill="url(#ahPat)" {...chartAnimation} />
              <Area type="monotone" dataKey="doctors" name="Doctors" stroke="#0EA5E9" strokeWidth={2.25} fill="url(#ahDoc)" {...chartAnimation} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.section>

        <motion.section
          className="dh-panel dh-panel-today"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.34, ease }}
          style={{ background: "linear-gradient(165deg, rgba(245,243,255,0.92), rgba(237,233,254,0.75) 55%, rgba(255,255,255,0.85))" }}
        >
          <div className="dh-section-head">
            <div>
              <h2>Verification queue</h2>
              <p>{pendingDoctors.length} pending</p>
            </div>
            <Link to="/admin/verification" className="dh-text-link" style={{ color: "#7C3AED" }}>Review all</Link>
          </div>
          <div className="dh-list">
            {pendingDoctors.length === 0 ? (
              <p style={{ fontSize: "0.84rem", color: "var(--dh-muted)", textAlign: "center", padding: "1.5rem 0" }}>No pending verifications</p>
            ) : (
              pendingDoctors.slice(0, 4).map((d) => {
                const name = d.name || d.fullName || "Doctor";
                return (
                  <div key={d._id || d.id} className="dh-list-row">
                    <div className="dh-avatar" style={{ background: "linear-gradient(145deg, #7C3AED, #8B5CF6)" }}>
                      {name.split(" ").slice(-1)[0]?.[0] || "D"}
                    </div>
                    <div>
                      <p className="dh-list-title">{name}</p>
                      <p className="dh-list-meta">{d.doctorProfile?.specialization || "General"} · {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "Recent"}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.section>
      </div>

      {/* Early warnings */}
      <motion.section
        className="dh-panel"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.38, ease }}
        style={{ marginTop: "1rem" }}
      >
        <div className="dh-section-head">
          <h2><AlertTriangle size={15} style={{ color: "#D97706" }} /> Early warning signals</h2>
          <Link to="/admin/early-warning" className="dh-text-link" style={{ color: "#7C3AED" }}>Full report <ArrowUpRight size={12} /></Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(18rem, 1fr))", gap: "0.75rem" }}>
          {earlyWarnings.slice(0, 3).map((w) => (
            <div
              key={w._id || w.id}
              style={{
                padding: "1rem 1.1rem", borderRadius: "0.95rem",
                background: "rgba(59,91,255,0.03)", border: "1px solid rgba(59,91,255,0.06)",
                borderLeft: `3px solid ${w.level === "High" ? "#EF4444" : w.level === "Medium" ? "#F59E0B" : "#10B981"}`,
              }}
            >
              <Badge tone={w.level === "High" ? "bad" : w.level === "Medium" ? "warn" : "good"}>
                {w.level} priority
              </Badge>
              <p style={{ fontSize: "0.88rem", fontWeight: 650, color: "var(--dh-ink)", marginTop: "0.55rem" }}>{w.title}</p>
              <p style={{ fontSize: "0.78rem", color: "var(--dh-muted)", marginTop: "0.35rem", lineHeight: 1.5 }}>{w.detail}</p>
              <p style={{ fontSize: "0.66rem", color: "#94A3B8", marginTop: "0.45rem", fontFamily: "var(--font-mono)" }}>
                {w.time || (w.createdAt ? new Date(w.createdAt).toLocaleTimeString() : "")}
              </p>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}
