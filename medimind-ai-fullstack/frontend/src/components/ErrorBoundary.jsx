import { Component } from "react";
import { motion } from "framer-motion";
import {
  RefreshCw, Home, AlertOctagon, ShieldCheck, Brain, HeartPulse,
  Mail, ArrowRight, Bug, Activity,
} from "lucide-react";
import logo from "../assets/logo.png";
import AIPulse from "./AIPulse";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] Uncaught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.href = "/welcome";
  };

  render() {
    if (this.state.hasError) {
      const err = this.state.error;
      const msg = err?.message || "Something unexpected happened.";
      return (
        <div className="min-h-screen bg-paper text-ink selection-highlight overflow-x-hidden relative">
          <div className="film-grain" aria-hidden="true" />

          {/* NAV */}
          <nav className="sticky top-0 z-[80] bg-white/40 backdrop-blur-xl border-b border-transparent">
            <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 py-3.5 lg:px-10">
              <a href="/welcome" className="flex items-center gap-3 group shrink-0">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-rose-500/30 via-amber-500/20 to-violet-500/30 blur opacity-100" />
                  <img src={logo} alt="MediMind AI" className="relative h-10 w-10" />
                </div>
                <div className="leading-tight">
                  <span className="font-display-modern font-bold text-[17px] tracking-tight text-slate-900 block leading-none">MediMind AI</span>
                  <span className="font-mono text-[9.5px] tracking-[0.2em] text-rose-600 uppercase">Error Recovery · Active</span>
                </div>
              </a>
            </div>
          </nav>

          <section className="relative overflow-hidden min-h-[calc(100vh-72px)] flex items-center py-16">
            <div className="absolute inset-0" style={{
              background: "linear-gradient(135deg,#FFF7ED 0%,#FEF3C7 25%,#FDF2F8 55%,#F5F3FF 100%)",
            }} aria-hidden="true" />
            <motion.div
              animate={{ x: [0, 50, -20, 0], y: [0, -40, 30, 0], rotate: [0, 6, -3, 0] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-24 -right-32 w-[680px] h-[680px] rounded-full filter blur-[80px] opacity-50 pointer-events-none bg-gradient-to-br from-rose-400 via-amber-400 to-orange-400"
            />
            <motion.div
              animate={{ x: [0, -40, 30, 0], y: [0, 30, -40, 0] }}
              transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-36 -left-36 w-[720px] h-[720px] rounded-full filter blur-[80px] opacity-50 pointer-events-none bg-gradient-to-br from-violet-400/80 via-fuchsia-400/60 to-rose-400/70"
            />
            <div className="absolute inset-0 dots-grid-fine opacity-70" aria-hidden="true" />
            <div className="absolute inset-0" aria-hidden="true" style={{
              background: "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(255,255,255,0.92) 0%, transparent 70%)",
            }} />

            <div className="relative max-w-[1280px] mx-auto px-6 lg:px-10 w-full">
              <div className="max-w-3xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="inline-flex items-center gap-2.5 font-mono text-[10.5px] tracking-[0.18em] uppercase px-4 py-2 rounded-full mb-7 border bg-white/70 backdrop-blur border-rose-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                    <AlertOctagon size={14} className="text-rose-500" />
                    <span className="text-rose-700 font-semibold">Runtime Error · Recovery Mode</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <AIPulse size={14} tone="teal" />
                    <span className="text-teal-700 font-semibold">Platform still safe</span>
                  </div>

                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="relative mb-6 inline-block"
                  >
                    <div className="relative flex items-center gap-2">
                      <span className="font-display-modern font-black text-[7rem] sm:text-[9rem] lg:text-[11rem] leading-none tracking-tighter">
                        <span className="block text-gradient-primary">5</span>
                      </span>
                      <motion.div
                        animate={{ rotate: [0, -15, 12, -8, 6, -3, 0], y: [0, -10, 0] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                        className="font-display-modern font-black text-[7rem] sm:text-[9rem] lg:text-[11rem] leading-none tracking-tighter inline-flex items-center justify-center"
                        style={{ transformOrigin: "center 60%" }}
                      >
                        <div className="relative">
                          <AlertOctagon className="text-slate-900 w-[0.7em] h-[0.7em]" strokeWidth={1.4} />
                        </div>
                      </motion.div>
                      <span className="font-display-modern font-black text-[7rem] sm:text-[9rem] lg:text-[11rem] leading-none tracking-tighter">
                        <span className="block text-gradient-primary">0</span>
                      </span>
                    </div>
                    <div className="absolute -inset-4 bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-violet-500/10 blur-3xl rounded-full -z-10" />
                  </motion.div>

                  <h1 className="font-display-modern font-extrabold tracking-tight text-slate-900 text-[2rem] sm:text-[2.4rem] lg:text-[3rem] leading-[1.05] mb-5">
                    Something hit a <span className="font-serif italic font-medium text-slate-700">speed bump.</span>
                  </h1>
                  <p className="text-slate-600 text-[17px] lg:text-[18.5px] leading-relaxed mb-8">
                    An unexpected error occurred in the application, but your health data remains encrypted and safe.
                    Our engineering team has been notified. Use the buttons below to get back on track.
                  </p>

                  {/* Error detail card */}
                  <div className="relative rounded-2xl overflow-hidden mb-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50 to-white border border-slate-200 rounded-2xl" />
                    <div className="relative p-5 lg:p-6">
                      <div className="flex items-start gap-4">
                        <div className="relative h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br from-rose-500 via-amber-500 to-orange-500 flex items-center justify-center shadow-[0_10px_24px_-8px_rgba(244,63,94,0.55)]">
                          <Bug size={22} className="text-white" strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <p className="font-mono text-[10px] tracking-[0.2em] text-rose-700 uppercase font-bold">Error Summary</p>
                            <span className="font-mono text-[9.5px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                              ref #{Date.now().toString(36).toUpperCase()}
                            </span>
                          </div>
                          <p className="font-display-modern font-semibold text-[14.5px] text-slate-900 leading-relaxed break-words line-clamp-3">
                            {msg}
                          </p>
                          {this.state.errorInfo?.componentStack && (
                            <details className="mt-3">
                              <summary className="cursor-pointer text-[11.5px] font-semibold text-slate-500 hover:text-slate-700 select-none">
                                Technical details
                              </summary>
                              <pre className="mt-2 p-3 rounded-xl bg-slate-950 text-slate-300 text-[11px] font-mono overflow-x-auto leading-relaxed">
                                {String(this.state.errorInfo.componentStack).slice(0, 800)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 mb-11">
                    <motion.button
                      whileHover={{ y: -1, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={this.handleReset}
                      className="btn-premium relative inline-flex items-center gap-2.5 text-[14.5px] font-bold text-white bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 px-8 py-4 rounded-full shadow-[0_1px_0_rgba(255,255,255,0.45)_inset,0_10px_28px_-8px_rgba(14,165,165,0.6)] hover:shadow-[0_1px_0_rgba(255,255,255,0.45)_inset,0_20px_48px_-10px_rgba(14,165,165,0.75)]"
                    >
                      <RefreshCw size={16} />
                      Try again
                      <ArrowRight size={16} />
                    </motion.button>
                    <a href="/welcome"
                      className="group relative inline-flex items-center gap-3.5 text-[14.5px] font-semibold text-slate-800 bg-white/80 backdrop-blur border border-slate-200 px-7 py-4 rounded-full hover:border-teal-300/70 hover:bg-white hover:shadow-[0_8px_24px_-12px_rgba(15,23,42,0.15)] transition-all"
                    >
                      <Home size={15} />
                      <span>Go to Welcome Page</span>
                    </a>
                    <button onClick={this.handleReload}
                      className="group relative inline-flex items-center gap-3.5 text-[14.5px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-7 py-4 rounded-full hover:bg-slate-100 transition-all"
                    >
                      <Activity size={15} />
                      <span>Full reload</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-6 pt-6 border-t border-slate-200/70">
                    {[
                      { i: ShieldCheck, t: "Health records safe" },
                      { i: Brain, t: "No data was lost" },
                      { i: HeartPulse, t: "Encryption active" },
                      { i: Mail, t: "care@medimind.ai" },
                    ].map((b) => (
                      <div key={b.t} className="flex items-center gap-2 text-[12px] font-semibold text-slate-600">
                        <span className="h-7 w-7 rounded-lg bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-100 flex items-center justify-center text-teal-600">
                          <b.i size={13} />
                        </span>
                        <span>{b.t}</span>
                      </div>
                    ))}
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
                </div>
              </div>
            </div>
          </footer>
        </div>
      );
    }
    return this.props.children;
  }
}
