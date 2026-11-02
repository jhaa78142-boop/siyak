import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Brain, Heart, Activity, Zap, Shield, Sparkles,
  CheckCircle2, Loader2, ScanLine, Cpu, Database,
  Lock, Eye, TrendingUp, BarChart3, Wifi
} from "lucide-react";

const ease = [0.16, 1, 0.3, 1];

/* ═══════════════════════════════════════════════════════════════
   PREMIUM LOADER COMPONENT
   Ultra-premium loading screen with multiple stages and effects
   ═══════════════════════════════════════════════════════════════ */

export default function PremiumLoader({ onComplete, targetRole = "patient" }) {
  const [stage, setStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showDNA, setShowDNA] = useState(false);

  const stages = [
    { icon: Shield, label: "Initializing secure connection", color: "from-emerald-500 to-teal-500", duration: 800 },
    { icon: Brain, label: "Loading AI engine", color: "from-violet-500 to-purple-500", duration: 900 },
    { icon: Database, label: "Syncing health data", color: "from-blue-500 to-indigo-500", duration: 700 },
    { icon: Cpu, label: "Encrypting session", color: "from-cyan-500 to-teal-500", duration: 600 },
    { icon: CheckCircle2, label: "Ready to launch", color: "from-emerald-400 to-green-500", duration: 500 },
  ];

  const currentStage = stages[Math.min(stage, stages.length - 1)];

  useEffect(() => {
    setShowDNA(true);
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const targetProgress = ((stage + 1) / stages.length) * 100;
        const diff = targetProgress - prev;
        return prev + Math.min(diff * 0.15, 5);
      });
    }, 30);

    // Stage progression
    const stageTimeout = setTimeout(() => {
      if (stage < stages.length - 1) {
        setStage((s) => s + 1);
      } else {
        setTimeout(() => {
          onComplete?.();
        }, 400);
      }
    }, currentStage.duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(stageTimeout);
    };
  }, [stage, currentStage.duration, onComplete, stages.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at center, rgba(6,182,212,0.15) 0%, rgba(255,255,255,0.98) 45%, white 100%)",
      }}
    >
      {/* Animated grid background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "50px 50px"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-3xl opacity-20"
            style={{
              width: Math.random() * 300 + 200,
              height: Math.random() * 300 + 200,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 2 === 0 
                ? "radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)",
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* DNA Helix Animation */}
      <AnimatePresence>
        {showDNA && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.08, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <svg width="600" height="600" viewBox="0 0 600 600" className="absolute">
              {[...Array(15)].map((_, i) => {
                const y = 40 + i * 35;
                return (
                  <g key={i}>
                    <motion.circle
                      cx="200"
                      cy={y}
                      r="8"
                      fill="#06b6d4"
                      animate={{
                        cx: [200, 250, 200],
                        cy: [y, y + 17.5, y + 35],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.circle
                      cx="400"
                      cy={y}
                      r="8"
                      fill="#8b5cf6"
                      animate={{
                        cx: [400, 350, 400],
                        cy: [y, y + 17.5, y + 35],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "easeInOut",
                      }}
                    />
                    <motion.line
                      x1="200"
                      y1={y}
                      x2="400"
                      y2={y}
                      stroke="#cbd5e1"
                      strokeWidth="2"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 0.8,
                        delay: i * 0.15,
                      }}
                    />
                  </g>
                );
              })}
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main loader content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-6">
        {/* Logo pulse */}
        <motion.div
          className="flex justify-center mb-12"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease }}
        >
          <motion.div
            className="relative"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {/* Rotating rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border-2 opacity-20"
                style={{
                  borderColor: i % 2 === 0 ? "#06b6d4" : "#8b5cf6",
                  width: 120 + i * 15,
                  height: 120 + i * 15,
                  left: `calc(50% - ${(120 + i * 15) / 2}px)`,
                  top: `calc(50% - ${(120 + i * 15) / 2}px)`,
                }}
                animate={{ rotate: 360 }}
                transition={{
                  duration: 8 - i * 2,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}

            {/* Center icon */}
            <div className="relative w-28 h-28 rounded-full bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-cyan-500/50">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Brain size={48} className="text-white" strokeWidth={1.5} />
              </motion.div>

              {/* Pulse effect */}
              <motion.div
                className="absolute inset-0 rounded-full bg-cyan-400"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Stage indicator */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stage}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.4, ease }}
            className="text-center mb-8"
          >
            <motion.div
              className="inline-flex items-center justify-center gap-3 px-6 py-3 rounded-full bg-white/80 backdrop-blur-xl border border-gray-200 shadow-lg mb-4"
              animate={{ boxShadow: ["0 4px 20px rgba(6,182,212,0.1)", "0 4px 30px rgba(6,182,212,0.3)", "0 4px 20px rgba(6,182,212,0.1)"] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${currentStage.color} flex items-center justify-center`}>
                <currentStage.icon size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-900">{currentStage.label}</p>
                <p className="text-[10px] font-mono text-slate-500 tracking-wider">STAGE {stage + 1}/{stages.length}</p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="relative mb-6">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 rounded-full relative overflow-hidden"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                animate={{ x: ["-100%", "200%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs font-mono text-slate-500">{Math.round(progress)}%</span>
            <span className="text-xs font-semibold text-gray-700">Almost there...</span>
          </div>
        </div>

        {/* Status indicators */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: Lock, label: "AES-256 Encrypted", active: stage >= 0 },
            { icon: Wifi, label: "Secure Connection", active: stage >= 1 },
            { icon: Eye, label: "Privacy Protected", active: stage >= 2 },
            { icon: Zap, label: "AI Powered", active: stage >= 3 },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: item.active ? 1 : 0.3,
                scale: item.active ? 1 : 0.9,
              }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className={`flex items-center gap-2 p-3 rounded-xl transition-all ${
                item.active
                  ? "bg-emerald-50 border border-emerald-200"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <item.icon
                size={14}
                className={item.active ? "text-emerald-500" : "text-gray-400"}
                strokeWidth={2.5}
              />
              <span className={`text-[10px] font-semibold ${item.active ? "text-emerald-700" : "text-gray-400"}`}>
                {item.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Scanning line effect */}
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"
          animate={{ top: ["20%", "80%", "20%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Bottom system info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 text-[9px] font-mono text-slate-400 tracking-wider"
      >
        <div className="flex items-center gap-1.5">
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-emerald-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          SYSTEM ONLINE
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-cyan-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
          />
          HIPAA COMPLIANT
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            className="h-1.5 w-1.5 rounded-full bg-violet-400"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
          />
          AI ENGINE READY
        </div>
      </motion.div>
    </motion.div>
  );
}
