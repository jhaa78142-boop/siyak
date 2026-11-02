import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useRef, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle, Home, RefreshCw, ArrowRight, ShieldCheck, HeartPulse,
  Brain, Activity, Sparkles, Mail,
} from "lucide-react";
import logo from "../assets/logo.png";
import AIPulse from "../components/AIPulse";

export default function Error500({ title, message, onRetry }) {
  const pageRef = useRef(null);
  const [errorTitle] = useState(title || "Something went wrong on our end.");
  const [errorMessage] = useState(
    message || "Our servers hit an unexpected issue while processing your request. Your health data is completely safe — this is just a temporary hiccup. Our team has been notified automatically."
  );

  const particles = useMemo(() => Array.from({ length: 16 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    delay: Math.random() * 5,
    duration: 6 + Math.random() * 8,
    opacity: 0.25 + Math.random() * 0.4,
  })), []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleRetry = () => {
    if (typeof onRetry === "function") {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-paper text-ink selection-highlight overflow-x-hidden relative">
      <div className="film-grain" aria-hidden="true" />

      <nav className="sticky top-0 z-[80] bg-white/40 backdrop-blur-xl border-b border-transparent">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 py-3.5 lg:px-10">
          <Link to="/welcome" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-rose-500/30 via-amber-500/20 to-violet-500/30 blur opacity-100" />
              <img src={logo} alt="MediMind AI" className="relative h-10 w-10" />
            </div>
            <div className="leading-tight">
              <span className="font-display-modern font-bold text-[17px] tracking-tight text-slate-900 block leading-none">MediMind AI</span>
              <span className="font-mono text-[9.5px] tracking-[0.2em] text-rose-600 uppercase">Server Error · 500</span>
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
              <Home size={14} />
              Welcome
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden min-h-[calc(100vh-72px)] flex items-center py-16">
        <div className="absolute inset-0" style={{
          background: "linear-gradient(135deg,#FFF7ED 0%,#FEF3C7 25%,#FDF2F8 55%,#F5F3FF 100%)",
        }} aria-hidden="true" />
        <motion.div
          animate={{ x: [0, 50, -20, 0], y: [0, -40, 30, 0], rotate: [0, 6, -3, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -right-32 w-[680px] h-[680px] rounded-full filter blur-[80px] opacity-55 pointer-events-none bg-gradient-to-br from-rose-400 via-amber-400 to-orange-400"
        />
        <motion.div
          animate={{ x: [0, -40, 30, 0], y: [0, 30, -40, 0] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-36 -left-36 w-[720px] h-[720px] rounded-full filter blur-[80px] opacity-55 pointer-events-none bg-gradient-to-br from-violet-400/80 via-fuchsia-400/60 to-rose-400/70"
        />
        <div className="absolute inset-0 dots-grid-fine opacity-70" aria-hidden="true" />
        <div className="absolute inset-0" aria-hidden="true" style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,255,255,0.92) 0%, transparent 70%)",
        }} />
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute rounded-full bg-gradient-to-br from-amber-400/60 to-rose-400/60"
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

        <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 w-full">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7 relative z-10">
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2.5 font-mono text-[10.5px] tracking-[0.18em] uppercase px-4 py-2 rounded-full mb-7 border bg-white/70 backdrop-blur border-rose-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                <AlertTriangle size={14} className="text-amber-500" />
                <span className="text-rose-700 font-semibold">Server Error · HTTP 500</span>
                <span className="h-1 w-1 rounded-full bg-slate-300" />
                <AIPulse size={14} tone="teal" />
                <span className="text-teal-700 font-semibold">Data safe · Incident logged</span>
              </motion.div>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative mb-6 inline-block"
              >
                <h1 className="font-display-modern font-black text-[8rem] sm:text-[11rem] lg:text-[13rem] leading-none tracking-tighter">
                  <span className="text-gradient-primary">5</span>
                  <motion.span
                    animate={{ rotate: [0, -12, 10, -6, 4, -2, 0], y: [0, -8, 0] }}
                    transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-block text-slate-900"
                    style={{ transformOrigin: "center 60%" }}
                  >
                    0
                  </motion.span>
                  <span className="text-gradient-primary">0</span>
                </h1>
                <div className="absolute -inset-4 bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-violet-500/10 blur-3xl rounded-full -z-10" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="font-display-modern font-extrabold tracking-tight text-slate-900 text-[2rem] sm:text-[2.4rem] lg:text-[3rem] leading-[1.05] mb-5"
              >
                {errorTitle}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-slate-600 text-[17px] lg:text-[18.5px] max-w-2xl leading-relaxed mb-9"
              >
                {errorMessage}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap items-center gap-4 mb-11"
              >
                <motion.button
                  whileHover={{ y: -1, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRetry}
                  className="btn-premium group relative inline-flex items-center gap-2.5 text-[14.5px] font-bold text-white bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 px-8 py-4 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.45)_inset,0_10px_28px_-8px_rgba(14,165,165,0.6)] hover:shadow-[0_1px_0_rgba(255,255,255,0.45)_inset,0_20px_48px_-10px_rgba(14,165,165,0.75)]"
                >
                  <RefreshCw size={16} />
                  Retry request
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </motion.button>
                <Link to="/welcome"
                  className="group relative inline-flex items-center gap-3.5 text-[14.5px] font-semibold text-slate-800 bg-white/80 backdrop-blur border border-slate-200 px-7 py-4 rounded-full hover:border-teal-300/70 hover:bg-white hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.15)] transition-all"
                >
                  <Home size={15} />
                  <span>Back to Welcome</span>
                </Link>
                <a href="mailto:care@medimind.ai"
                  className="group relative inline-flex items-center gap-3.5 text-[14.5px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-7 py-4 rounded-full hover:bg-slate-100 transition-all"
                >
                  <Mail size={15} />
                  <span>Contact support</span>
                </a>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="flex flex-wrap items-center gap-6 pt-6 border-t border-slate-200/70"
              >
                {[
                  { i: ShieldCheck, t: "End-to-End Encrypted" },
                  { i: Brain, t: "Zero data exposure" },
                  { i: HeartPulse, t: "Health records intact" },
                  { i: Activity, t: "Auto-escalated to on-call" },
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

            {/* Right: status card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 relative"
            >
              <div className="absolute -inset-6 bg-gradient-to-br from-rose-400/25 via-amber-400/20 to-violet-400/20 blur-3xl rounded-[3rem]" />
              <div className="relative rounded-[2rem] p-[1.5px] bg-gradient-to-br from-white via-rose-200 via-amber-200 to-violet-200 shadow-[0_30px_80px_-20px_rgba(15,23,42,0.25)]">
                <div className="relative rounded-[calc(2rem-1.5px)] overflow-hidden bg-white noise-overlay p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-400/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200">
                      <AlertTriangle size={12} className="text-rose-500" />
                      <span className="font-mono text-[10px] tracking-wide text-rose-700 font-bold">INCIDENT ACTIVE</span>
                    </div>
                  </div>

                  {/* Status card */}
                  <div className="relative rounded-2xl bg-gradient-to-br from-rose-50 via-white to-amber-50 border border-rose-200/70 p-6 mb-5 overflow-hidden">
                    <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-gradient-to-br from-rose-400/20 via-amber-400/20 to-violet-400/20 blur-2xl" />
                    <div className="relative flex items-center gap-3 mb-5">
                      <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-rose-500 via-amber-500 to-orange-500 flex items-center justify-center shadow-[0_12px_28px_-10px_rgba(244,63,94,0.6)]">
                        <Sparkles size={24} className="text-white" strokeWidth={2.2} />
                        <span className="absolute inset-0 rounded-2xl border border-rose-300/50 animate-ripple opacity-70" />
                      </div>
                      <div>
                        <p className="font-mono text-[10px] tracking-[0.2em] text-rose-700 uppercase font-bold mb-0.5">
                          Response status
                        </p>
                        <p className="font-display-modern font-extrabold text-2xl text-slate-900 leading-none">
                          500 Internal Server
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: "API Gateway", status: "degraded", tone: "amber" },
                        { label: "Auth Service", status: "operational", tone: "emerald" },
                        { label: "Database", status: "operational", tone: "emerald" },
                        { label: "AI Pipeline", status: "watch", tone: "teal" },
                        { label: "Object Storage", status: "operational", tone: "emerald" },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                row.tone === "emerald" ? "bg-emerald-400 animate-glow-pulse" :
                                row.tone === "amber" ? "bg-amber-400 animate-pulse" :
                                "bg-teal-400 animate-glow-pulse"
                              }`}
                            />
                            <span className="text-[13px] font-semibold text-slate-700">{row.label}</span>
                          </div>
                          <span className={`font-mono text-[10.5px] font-bold tracking-wide px-2.5 py-1 rounded-full ${
                            row.tone === "emerald"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : row.tone === "amber"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-teal-50 text-teal-700 border border-teal-200"
                          }`}>
                            {row.status.toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative rounded-2xl p-4 bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200/70 overflow-hidden">
                      <div className="absolute top-2 right-2 h-8 w-8 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 flex items-center justify-center">
                        <HeartPulse size={12} className="text-teal-600" />
                      </div>
                      <p className="font-mono text-[9px] tracking-[0.2em] text-teal-700 uppercase font-bold mb-1">
                        Records
                      </p>
                      <p className="font-display-modern font-bold text-lg text-slate-900 leading-none mb-1">Intact</p>
                      <p className="text-[10.5px] text-slate-500 font-semibold">E2E encrypted</p>
                    </div>
                    <div className="relative rounded-2xl p-4 bg-gradient-to-br from-violet-50 to-indigo-50 border border-violet-200/70 overflow-hidden">
                      <div className="absolute top-2 right-2 h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
                        <Brain size={12} className="text-violet-600" />
                      </div>
                      <p className="font-mono text-[9px] tracking-[0.2em] text-violet-700 uppercase font-bold mb-1">
                        ETA Fix
                      </p>
                      <p className="font-display-modern font-bold text-lg text-slate-900 leading-none mb-1">~2 min</p>
                      <p className="text-[10.5px] text-slate-500 font-semibold">Auto-healing</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <footer className="relative overflow-hidden bg-slate-950 text-white pt-12 pb-8">
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
                Core systems operational
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
