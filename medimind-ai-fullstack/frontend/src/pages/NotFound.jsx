import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useEffect, useState, useMemo } from "react";
import {
  ArrowRight, Home, Search, HeartPulse, ShieldCheck,
  Sparkles, Activity, Stethoscope, Brain, Compass,
  FileSearch, AlertTriangle, ArrowLeft, RefreshCw,
} from "lucide-react";
import logo from "../assets/logo.png";
import AIPulse from "../components/AIPulse";

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  }),
};
const fadeIn = {
  hidden: { opacity: 0 },
  show: (i = 0) => ({
    opacity: 1,
    transition: { delay: i * 0.1, duration: 0.8, ease: "easeOut" },
  }),
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: (i = 0) => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  }),
};

const suggestions = [
  {
    icon: Home, title: "Back to Welcome",
    text: "Start fresh at our landing page.",
    to: "/welcome", gradient: "from-teal-500 via-cyan-500 to-sky-500",
  },
  {
    icon: Stethoscope, title: "Patient Portal",
    text: "Access your health record and AI triage.",
    to: "/patient", gradient: "from-blue-500 via-indigo-500 to-violet-500",
  },
  {
    icon: Search, title: "Symptom Checker",
    text: "Let our AI help you understand how you feel.",
    to: "/patient/symptom-checker", gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
  },
  {
    icon: FileSearch, title: "Report Analyzer",
    text: "Upload any lab report and get an AI summary.",
    to: "/patient/report-analyzer", gradient: "from-emerald-500 via-teal-500 to-cyan-500",
  },
];

function Tilt3D({ children, className = "", intensity = 10 }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [intensity, -intensity]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-intensity, intensity]), { stiffness: 200, damping: 20 });
  const handleMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => { x.set(0); y.set(0); };
  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function HeroParticles() {
  const particles = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 5,
    duration: 6 + Math.random() * 8,
    opacity: 0.25 + Math.random() * 0.4,
  })), []);
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-gradient-to-br from-teal-400/60 to-cyan-500/60"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -40, 0],
            x: [0, 15, 0],
            opacity: [p.opacity, p.opacity * 1.6, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function NotFound() {
  const pageRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReducedMotion(rm);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reducedMotion]);

  return (
    <div
      ref={pageRef}
      className="min-h-screen bg-paper text-ink selection-highlight overflow-x-hidden relative"
    >
      {!reducedMotion && <div className="film-grain" aria-hidden="true" />}

      {/* NAV */}
      <nav className="sticky top-0 z-[80] bg-white/40 backdrop-blur-xl border-b border-transparent">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 py-3.5 lg:px-10">
          <Link to="/welcome" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-teal-500/30 via-cyan-500/20 to-blue-500/30 blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <img src={logo} alt="MediMind AI" className="relative h-10 w-10" />
            </div>
            <div className="leading-tight">
              <span className="font-display-modern font-bold text-[17px] tracking-tight text-slate-900 block leading-none">MediMind AI</span>
              <span className="font-mono text-[9.5px] tracking-[0.2em] text-teal-600 uppercase">Clinical Intelligence · v4.2</span>
            </div>
          </Link>
          <div className="hidden md:flex items-center gap-2.5 pl-3 border-l border-slate-200/80">
            <Link
              to="/login"
              className="text-sm font-semibold text-slate-700 hover:text-teal-700 px-4 py-2 rounded-full hover:bg-teal-50/80 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/welcome"
              className="btn-premium group relative inline-flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 px-5 py-2.5 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_8px_24px_-6px_rgba(14,165,165,0.55)]"
            >
              <ArrowLeft size={14} />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO / 404 */}
      <section className="relative overflow-hidden min-h-[calc(100vh-72px)] flex items-center">
        <div className="absolute inset-0 hero-gradient" aria-hidden="true" />
        <motion.div
          animate={{ x: [0, 50, -20, 0], y: [0, -40, 30, 0], rotate: [0, 6, -3, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -right-32 w-[680px] h-[680px] aurora-orb bg-gradient-to-br from-teal-400 via-cyan-400 to-sky-400"
        />
        <motion.div
          animate={{ x: [0, -40, 30, 0], y: [0, 30, -40, 0], rotate: [0, -4, 5, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-36 -left-36 w-[720px] h-[720px] aurora-orb bg-gradient-to-br from-violet-400/80 via-indigo-400/60 to-blue-400/70"
        />
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/3 left-1/2 w-[380px] h-[380px] aurora-orb bg-gradient-to-br from-fuchsia-400/50 via-purple-400/40 to-teal-400/50"
        />
        <div className="absolute inset-0 dots-grid-fine opacity-70" aria-hidden="true" />
        <div className="absolute inset-0" aria-hidden="true" style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,255,255,0.9) 0%, transparent 70%)",
        }} />
        <HeroParticles />

        <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 py-16 lg:py-24 w-full">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* LEFT */}
            <div className="lg:col-span-7 relative z-10">
              <motion.div variants={fadeIn} initial="hidden" animate="show" custom={0}
                className="inline-flex items-center gap-2.5 font-mono text-[10.5px] tracking-[0.18em] uppercase px-4 py-2 rounded-full mb-7 border bg-white/70 backdrop-blur border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                <AlertTriangle size={14} className="text-amber-500" />
                <span className="text-amber-700 font-semibold">Error · HTTP 404</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <AIPulse size={14} tone="teal" />
                <span className="text-teal-700 font-semibold">AI still online</span>
              </motion.div>

              <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
                <div className="relative mb-3 inline-block">
                  <h1 className="font-display-modern font-black text-[8rem] sm:text-[11rem] lg:text-[14rem] leading-none tracking-tighter">
                    <span className="text-gradient-primary">4</span>
                    <motion.span
                      animate={{ rotate: [0, -12, 10, -6, 4, -2, 0], y: [0, -8, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="inline-block text-slate-900"
                      style={{ transformOrigin: "center 60%" }}
                    >
                      0
                    </motion.span>
                    <span className="text-gradient-primary">4</span>
                  </h1>
                  <div className="absolute -inset-4 bg-gradient-to-br from-teal-500/10 via-cyan-500/10 to-violet-500/10 blur-3xl rounded-full -z-10" />
                </div>
              </motion.div>

              <motion.div variants={fadeUp} initial="hidden" animate="show" custom={1}>
                <h2 className="font-display-modern font-extrabold tracking-tight text-slate-900 text-[2rem] sm:text-[2.4rem] lg:text-[3rem] leading-[1.05] mb-5">
                  This page went off the
                  <span className="font-serif italic font-medium text-slate-700"> charts.</span>
                </h2>
              </motion.div>

              <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2}
                className="text-slate-600 text-[17px] lg:text-[18.5px] max-w-xl leading-relaxed mb-9"
              >
                We couldn't find the page you were looking for — but your health records are still safe and sound.
                Try one of the links below, or head back to welcome and pick up from there.
              </motion.p>

              <motion.div variants={fadeUp} initial="hidden" animate="show" custom={3}
                className="flex flex-wrap items-center gap-4 mb-11"
              >
                <Link to="/welcome"
                  className="btn-premium group relative inline-flex items-center gap-2.5 text-[14.5px] font-bold text-white bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 px-8 py-4 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.45)_inset,0_10px_28px_-8px_rgba(14,165,165,0.6)] hover:shadow-[0_1px_0_rgba(255,255,255,0.45)_inset,0_20px_48px_-10px_rgba(14,165,165,0.75)]"
                >
                  <Home size={16} />
                  Go to Welcome Page
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <button onClick={() => window.history.back()}
                  className="group relative inline-flex items-center gap-3.5 text-[14.5px] font-semibold text-slate-800 bg-white/80 backdrop-blur border border-slate-200 px-7 py-4 rounded-full hover:border-teal-300/70 hover:bg-white hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.15)] transition-all"
                >
                  <RefreshCw size={15} />
                  <span>Go Back</span>
                </button>
              </motion.div>

              {/* Trust row */}
              <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4}
                className="flex flex-wrap items-center gap-6 pt-6 border-t border-slate-200/70"
              >
                {[
                  { i: ShieldCheck, t: "HIPAA & GDPR Ready" },
                  { i: Brain, t: "AI Always Online" },
                  { i: HeartPulse, t: "Health Records Safe" },
                  { i: Activity, t: "All Systems Operational" },
                ].map((b) => (
                  <div key={b.t} className="flex items-center gap-2 text-[12px] font-semibold text-slate-600">
                    <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 flex items-center justify-center text-teal-600">
                      <b.i size={13} />
                    </span>
                    <span>{b.t}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT: 3D visual */}
            <motion.div variants={fadeIn} initial="hidden" animate="show" custom={1.5}
              className="lg:col-span-5 relative"
            >
              <Tilt3D intensity={8} className="relative">
                <motion.div
                  className="absolute -inset-6 bg-gradient-to-br from-teal-400/25 via-cyan-400/20 to-violet-400/20 blur-3xl rounded-[3rem]"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="relative rounded-[2rem] p-[1.5px] bg-gradient-to-br from-white via-teal-200 via-cyan-200 to-violet-200 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.25)]">
                  <div className="relative rounded-[calc(2rem-1.5px)] overflow-hidden bg-white noise-overlay p-8">
                    {/* chrome */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                        <Compass size={12} className="text-slate-400" />
                        <span className="font-mono text-[10px] tracking-wide text-slate-500">medimind.ai/unknown</span>
                      </div>
                    </div>

                    {/* big signal search */}
                    <div className="relative rounded-2xl bg-gradient-to-br from-slate-50 via-white to-slate-50 border border-slate-200 p-6 mb-5 overflow-hidden">
                      <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br from-teal-400/20 via-cyan-400/20 to-violet-400/20 blur-2xl" />
                      <div className="relative flex items-center gap-3 mb-4">
                        <div className="relative h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center shadow-[0_10px_24px_-8px_rgba(249,115,22,0.55)]">
                          <Search size={22} className="text-white" strokeWidth={2.2} />
                          <span className="absolute inset-0 rounded-2xl border border-amber-300/50 animate-ripple opacity-70" />
                        </div>
                        <div>
                          <p className="font-mono text-[10px] tracking-[0.2em] text-amber-700 uppercase font-bold mb-0.5">Search signal · not found</p>
                          <p className="font-display-modern font-bold text-lg text-slate-900 leading-none">Route unreachable</p>
                        </div>
                      </div>

                      {/* fake "url not in index" */}
                      <div className="space-y-2">
                        <div className="h-2.5 w-full rounded-full bg-slate-200/80 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-violet-400"
                            initial={{ width: 0 }} animate={{ width: "38%" }}
                            transition={{ delay: 0.6, duration: 1.4, ease: "easeOut" }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                          <span>Scanned routes</span><span>3,142 / ∞  indexed</span>
                        </div>
                      </div>
                    </div>

                    {/* 2 small result cards */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="relative rounded-2xl p-4 bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200/70 overflow-hidden">
                        <div className="absolute top-2 right-2 h-8 w-8 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center">
                          <Sparkles size={12} className="text-teal-600" />
                        </div>
                        <p className="font-mono text-[9px] tracking-[0.2em] text-teal-700 uppercase font-bold mb-1">AI Triage</p>
                        <p className="font-display-modern font-bold text-[15px] text-slate-900 leading-none mb-1">Ready</p>
                        <p className="text-[10.5px] text-slate-500 font-semibold">320ms · Live</p>
                      </div>
                      <div className="relative rounded-2xl p-4 bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200/70 overflow-hidden">
                        <div className="absolute top-2 right-2 h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
                          <ShieldCheck size={12} className="text-violet-600" />
                        </div>
                        <p className="font-mono text-[9px] tracking-[0.2em] text-violet-700 uppercase font-bold mb-1">Data Safe</p>
                        <p className="font-display-modern font-bold text-[15px] text-slate-900 leading-none mb-1">Encrypted</p>
                        <p className="text-[10.5px] text-slate-500 font-semibold">E2E · 256-bit</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating */}
                <motion.div
                  style={{ transform: `translate3d(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px, 0)` }}
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-6 -top-8 bg-white rounded-2xl p-4.5 w-60 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25)] border border-slate-100 backdrop-blur"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 font-mono text-[10px] tracking-wide text-indigo-600 font-semibold">
                      <div className="relative h-6 w-6 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
                        <Brain size={11} className="text-white" />
                        <span className="absolute inset-0 rounded-lg animate-ripple border border-indigo-300/50" />
                      </div>
                      AI SUGGESTION
                    </div>
                  </div>
                  <p className="text-[12px] text-slate-700 leading-snug font-medium">
                    Try <span className="text-teal-600 font-bold">/welcome</span> or jump
                    straight into <span className="text-indigo-600 font-bold">AI triage</span>.
                  </p>
                </motion.div>
              </Tilt3D>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SUGGESTIONS */}
      <section className="relative py-24 lg:py-28 overflow-hidden">
        <div className="absolute inset-0 dots-grid opacity-40" aria-hidden="true" />

        <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-3xl mx-auto text-center mb-16">
            <motion.div variants={fadeIn} custom={0}
              className="inline-flex items-center gap-2 font-mono text-[10.5px] tracking-[0.2em] uppercase text-teal-700 bg-teal-50 border border-teal-200/70 px-4 py-2 rounded-full mb-6"
            >
              <Sparkles size={12} /> Where to next?
            </motion.div>
            <h2 className="font-display-modern text-4xl lg:text-[3.2rem] font-extrabold tracking-tight text-slate-900 leading-[1.05] mb-6">
              Quick links to get you
              <span className="text-gradient-primary"> back on track.</span>
            </h2>
            <p className="text-slate-600 text-[17px] leading-relaxed max-w-xl mx-auto">
              Everything you need is still a click away. Pick one of the paths below to continue your journey.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7">
            {suggestions.map((s, i) => (
              <motion.div key={s.title} variants={scaleIn} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }} custom={i}
                className="group relative"
              >
                <div className={`absolute -inset-px rounded-3xl bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-60 blur transition-all duration-700`} />
                <Link to={s.to}
                  className={`relative block rounded-3xl bg-white border border-slate-200/80 h-full p-7 lg:p-8 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_28px_-18px_rgba(15,23,42,0.15)] group-hover:shadow-[0_1px_2px_rgba(15,23,42,0.05),0_24px_48px_-20px_rgba(15,23,42,0.2)] group-hover:-translate-y-1 transition-all duration-500`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${s.gradient} opacity-90 rounded-t-3xl`} />
                  <div className={`relative h-14 w-14 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-white shadow-[0_10px_24px_-8px_currentColor] group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 mb-6`}>
                    <s.icon size={24} strokeWidth={2.2} />
                  </div>
                  <h3 className="font-display-modern font-bold text-[20px] text-slate-900 mb-2 leading-tight">
                    {s.title}
                  </h3>
                  <p className="text-[14.5px] text-slate-600 leading-relaxed mb-5">{s.text}</p>
                  <div className="flex items-center gap-1 text-[12.5px] font-bold text-teal-600 group-hover:gap-2 group-hover:text-teal-700 transition-all">
                    Open <ArrowRight size={15} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER (compact) */}
      <footer className="relative overflow-hidden bg-slate-950 text-white pt-16 pb-8">
        <div className="absolute inset-0 bio-grid opacity-40" aria-hidden="true" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="MediMind AI" className="h-10 w-10" />
              <div>
                <span className="font-display-modern font-bold text-lg tracking-tight text-white block leading-none">MediMind AI</span>
                <span className="font-mono text-[9.5px] tracking-[0.22em] text-teal-400 uppercase">Clinical Intelligence</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[12.5px] text-white/45 font-medium">
              <span>© 2026 MediMind AI Technologies Pvt. Ltd.</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                All systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
