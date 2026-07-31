import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/siyak-logo.png";
import { productCategories } from "../data/products";

const heroImage = productCategories.find((category) => category.image)?.image;

export default function PageLoader() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const isVisited = sessionStorage.getItem("siyakSiteLoaded");
    if (isVisited) {
      setLoading(false);
      return;
    }

    let mounted = true;
    setLoading(true);
    let progressInterval;
    const rampProgress = () => {
      progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + Math.max(1, Math.floor((100 - prev) / 10)), 98));
      }, 160);
    };
    rampProgress();

    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    const imageReady = new Promise((resolve) => {
      if (!heroImage) return resolve();
      const img = new Image();
      img.src = heroImage;
      if (img.complete) return resolve();
      img.onload = img.onerror = () => resolve();
    });

    const loaded = Promise.all([fontsReady, imageReady]);
    const minStay = new Promise((resolve) => setTimeout(resolve, 1150));

    Promise.all([loaded, minStay]).then(() => {
      if (!mounted) return;
      setProgress(100);
      setTimeout(() => {
        if (!mounted) return;
        setLoading(false);
        sessionStorage.setItem("siyakSiteLoaded", "true");
        clearInterval(progressInterval);
      }, 180);
    });

    return () => {
      mounted = false;
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] bg-ink flex items-center justify-center px-6"
          aria-hidden="true"
        >
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute w-[520px] h-[520px] rounded-full bg-teal/15 blur-3xl"
              style={{ left: "12%", top: "18%" }}
              animate={{
                scale: [1, 1.18, 1],
                opacity: [0.24, 0.5, 0.24],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute w-[420px] h-[420px] rounded-full bg-teal-light/12 blur-3xl"
              style={{ right: "10%", bottom: "18%" }}
              animate={{
                scale: [1.18, 1, 1.18],
                opacity: [0.38, 0.2, 0.38],
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
              }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
            >
              <div className="h-80 w-80 rounded-full border border-teal/10" />
            </motion.div>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-md">
            <motion.div
              className="relative grid place-items-center h-28 w-28 rounded-full border border-teal/40 bg-white/5 shadow-[0_0_70px_rgba(20,184,173,0.12)]"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <img src={logo} alt="Siyak Steel International" className="h-24 w-auto" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.65, ease: "easeOut" }}
            >
              <p className="text-xs uppercase tracking-[0.4em] text-steel/70 mb-3">Welcome to Siyak Steel</p>
              <p className="text-4xl font-display font-semibold text-paper leading-tight">
                Smooth start. Premium steel from the world’s best suppliers.
              </p>
              <p className="mt-4 text-sm text-steel max-w-xs leading-relaxed">
                A polished opening experience designed to feel fast, modern, and effortless.
              </p>
            </motion.div>

            <div className="w-full">
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="origin-left h-full bg-gradient-to-r from-teal via-teal-light to-amber"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: Math.min(progress, 100) / 100 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  style={{ boxShadow: "0 0 32px rgba(20,184,173,0.35)" }}
                />
              </div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.35 }}
                className="mt-3 text-xs uppercase tracking-[0.35em] text-steel/60"
              >
                {Math.floor(progress)}% complete
              </motion.p>
            </div>
          </div>

          <div className="absolute inset-0 grid-texture opacity-15 pointer-events-none" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
