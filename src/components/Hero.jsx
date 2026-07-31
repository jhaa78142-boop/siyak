import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, useTransform, useScroll } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import ImagePlaceholder from "./ImagePlaceholder";
import { fadeUp, stagger, DURATION, EASE } from "../lib/motion";
import bgElectropolished from "../assets/products/electropolished-pipe.webp";
import bgFlanges from "../assets/hero-bg/hero-flanges.webp";
import bgTubeSheet from "../assets/products/tube-sheet.webp";
import bgWireMesh from "../assets/products/wire-mesh.webp";

const slides = [
  { image: bgElectropolished, name: "Electropolished Pipes", caption: "Electropolished Pipe", tagline: "Hygienic Grade Finish" },
  { image: bgFlanges,    name: "Flanges",              caption: "Flanges",              tagline: "Every Face, Every Class" },
  { image: bgTubeSheet,  name: "Tube Sheets",          caption: "Tube Sheets",          tagline: "Heat Exchanger Grade" },
  { image: bgWireMesh,   name: "Wire Mesh",            caption: "Wire Mesh",            tagline: "Woven & Welded" },
];

export default function Hero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 600], [0, 80]);

  const count = slides.length || 1;
  const next = useCallback(() => setActive((a) => (a + 1) % count), [count]);
  const prev = useCallback(() => setActive((a) => (a - 1 + count) % count), [count]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 6500);
    return () => clearInterval(t);
  }, [next, paused]);

  const slide = slides[active];

  // Respect prefers-reduced-motion for ambient blob
  const prefersReduced = typeof window !== "undefined" && window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.hero, ease: EASE.enter }}
      className="relative text-paper overflow-hidden min-h-[65vh] sm:min-h-[75vh] md:min-h-[85vh] flex items-center"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Ambient light — disabled when prefers-reduced-motion */}
      {!prefersReduced && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[1]">
          <motion.div
            className="absolute w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl"
            style={{ left: "10%", top: "10%" }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.18, 0.36, 0.18] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      {/* Photo carousel background with parallax */}
      <motion.div style={{ y: prefersReduced ? 0 : y1 }} className="absolute inset-0 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          {slide ? (
            <motion.div
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.0, ease: EASE.enter }}
              className="absolute inset-0"
            >
              <motion.img
                src={slide.image}
                alt={slide.name}
                loading="eager"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-center"
                style={{ filter: "contrast(1.04) saturate(1.05) brightness(1.0)" }}
              />
            </motion.div>
          ) : (
            <ImagePlaceholder label="Siyak Steel" className="absolute inset-0" aspect="" />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/10 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 via-transparent to-transparent" />
        <div className="absolute inset-0 grid-texture opacity-6" />
      </motion.div>

      {/* Prev / next arrow controls */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-6 bottom-8 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-20 h-11 w-11 bg-ink/60 border border-paper/30 hover:bg-teal hover:border-teal flex items-center justify-center transition-all duration-300 backdrop-blur-xl shadow-elevated hover:shadow-teal/30 clip-corner"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute left-[72px] sm:left-auto sm:right-6 bottom-8 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 z-20 h-11 w-11 bg-ink/60 border border-paper/30 hover:bg-teal hover:border-teal flex items-center justify-center transition-all duration-300 backdrop-blur-xl shadow-elevated hover:shadow-teal/30 clip-corner"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Hero text — unified stagger block, not 3 separate animations */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-16 sm:py-20">
        <motion.div
          className="max-w-3xl"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            variants={fadeUp}
            className="font-display uppercase leading-[1.05] text-paper text-3xl sm:text-5xl md:text-6xl tracking-tight"
          >
            Forged for the world's hardest working sites.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-4 text-paper/90 max-w-xl text-base sm:text-lg leading-relaxed"
          >
            Pipes, flanges, fittings &amp; fasteners stocked in depth and shipped to over 40 countries.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 bg-teal hover:bg-teal-light text-ink font-display uppercase text-sm tracking-[0.15em] px-6 py-3 clip-corner-lg transition-all duration-300 shadow-lg hover:shadow-teal/40 min-h-[44px]"
            >
              Explore Products
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-2" />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border border-steel/40 hover:border-teal-light hover:text-teal-light text-paper/90 font-display uppercase text-sm tracking-[0.15em] px-6 py-3 transition-all duration-300 min-h-[44px]"
            >
              Request a Quote
            </Link>
          </motion.div>

          {/* Slide tick indicators — horizontal lines, brand idiom */}
          {slides.length > 1 && (
            <motion.div
              variants={fadeUp}
              className="mt-6 flex items-center gap-3"
            >
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`Show slide ${i + 1}`}
                  className="group py-3 px-0.5"
                >
                  <span
                    className={`block h-[3px] transition-all duration-500 ${
                      i === active
                        ? "w-10 bg-teal-light shadow-[0_0_12px_rgba(20,184,173,0.6)]"
                        : "w-5 bg-steel/40 group-hover:bg-steel/70"
                    }`}
                  />
                </button>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Caption banner, bottom-right — same clip-corner system as CTAs */}
      {slide && (
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 20, x: 20 }}
            transition={{ duration: DURATION.fast, ease: EASE.enter }}
            className="absolute bottom-6 right-0 z-10 hidden md:block bg-teal-light px-6 py-4 max-w-sm clip-corner shadow-elevated shadow-ink/50 backdrop-blur-sm"
          >
            <p className="spec-label text-ink/60">{slide.tagline}</p>
            <p className="font-display uppercase text-xl text-ink leading-snug mt-1">{slide.caption}</p>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.section>
  );
}
