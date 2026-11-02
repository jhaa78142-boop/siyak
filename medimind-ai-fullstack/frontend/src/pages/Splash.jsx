import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logo.png";

export default function Splash() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState(0); // 0 ribbons, 1 mark settled, 2 wordmark, 3 tagline, 4 leave

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 900);
    const t2 = setTimeout(() => setPhase(2), 1700);
    const t3 = setTimeout(() => setPhase(3), 2500);
    const t4 = setTimeout(() => {
      setPhase(4);
      navigate("/welcome");
    }, 4400);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [navigate]);

  return (
    <AnimatePresence>
      {phase < 4 && (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070B14] overflow-hidden"
        >
          {/* ambient pulse field */}
          <div className="absolute inset-0">
            <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-orange-600/20 blur-[100px] animate-pulse-slow" />
            <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/20 blur-[100px] animate-pulse-slow" />
          </div>

          {/* faint ECG line sweeping across */}
          <svg className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-24 opacity-30" viewBox="0 0 800 100" preserveAspectRatio="none">
            <polyline
              className="ecg-line"
              points="0,50 120,50 150,15 180,85 210,50 340,50 370,25 400,75 430,50 800,50"
              fill="none"
              stroke="#22D3EE"
              strokeWidth="2"
            />
          </svg>

          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
              animate={{
                scale: phase >= 1 ? 1 : 0.75,
                opacity: 1,
                rotate: 0,
                y: phase >= 2 ? -14 : 0,
              }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <motion.img
                src={logo}
                alt="MediMind AI"
                className="h-28 w-28 md:h-32 md:w-32 drop-shadow-[0_0_40px_rgba(34,211,238,0.35)]"
                animate={{ filter: phase >= 1 ? "brightness(1)" : "brightness(1.4)" }}
              />
            </motion.div>

            <AnimatePresence>
              {phase >= 2 && (
                <motion.h1
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="font-display text-3xl md:text-4xl font-semibold text-white mt-5 tracking-tight"
                >
                  Medi<span className="bg-gradient-to-r from-orange-400 via-rose-400 to-cyan-400 bg-clip-text text-transparent">Mind</span> AI
                </motion.h1>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {phase >= 3 && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-slate-400 text-sm md:text-[15px] mt-3 tracking-wide"
                >
                  Your health, understood in real time.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: phase >= 3 ? "180px" : "0px" }}
            transition={{ duration: 1.6, ease: "easeInOut" }}
            className="h-[3px] mt-8 rounded-full bg-gradient-to-r from-orange-400 via-rose-400 to-cyan-400"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
