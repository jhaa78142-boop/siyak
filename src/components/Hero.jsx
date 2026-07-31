import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ImagePlaceholder from "./ImagePlaceholder";
import { DURATION, EASE } from "../lib/motion";
import bgElectropolished from "../assets/products/electropolished-pipe.webp";
import bgFlanges from "../assets/hero-bg/hero-flanges.webp";
import bgTubeSheet from "../assets/products/tube-sheet.webp";
import bgWireMesh from "../assets/products/wire-mesh.webp";

const slides = [
  { image: bgElectropolished, name: "Electropolished Pipes", caption: "Electropolished Pipe" },
  { image: bgFlanges,         name: "Flanges",               caption: "Flanges" },
  { image: bgTubeSheet,       name: "Tube Sheets",           caption: "Tube Sheets" },
  { image: bgWireMesh,        name: "Wire Mesh",             caption: "Wire Mesh" },
];

export default function Hero() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const count = slides.length || 1;
  const next = useCallback(() => setActive((a) => (a + 1) % count), [count]);
  const prev = useCallback(() => setActive((a) => (a - 1 + count) % count), [count]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 6500);
    return () => clearInterval(t);
  }, [next, paused]);

  const slide = slides[active];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.hero, ease: EASE.enter }}
      className="relative overflow-hidden h-[200px] sm:h-[270px] md:h-[330px] lg:h-[360px] xl:h-[390px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Photo carousel */}
      <div className="absolute inset-0">
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
              <img
                src={slide.image}
                alt={slide.name}
                loading="eager"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-center"
                style={{ filter: "contrast(1.04) saturate(1.05) brightness(0.92)" }}
              />
            </motion.div>
          ) : (
            <ImagePlaceholder label="Siyak Steel" className="absolute inset-0" aspect="" />
          )}
        </AnimatePresence>
        {/* Subtle vignette bottom only — no heavy left-side overlay since no text */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
      </div>

      {/* Prev arrow */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-11 sm:w-11 bg-ink/50 border border-paper/30 hover:bg-teal hover:border-teal flex items-center justify-center transition-all duration-300 backdrop-blur-xl clip-corner"
      >
        <ChevronLeft size={20} className="text-paper" />
      </button>

      {/* Next arrow */}
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-11 sm:w-11 bg-ink/50 border border-paper/30 hover:bg-teal hover:border-teal flex items-center justify-center transition-all duration-300 backdrop-blur-xl clip-corner"
      >
        <ChevronRight size={20} className="text-paper" />
      </button>

      {/* Dot pagination — bottom centre */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Show slide ${i + 1}`}
              className="group p-1.5"
            >
              <span
                className={`block rounded-full border transition-all duration-300 ${
                  i === active
                    ? "w-3 h-3 bg-teal-light border-teal-light"
                    : "w-2.5 h-2.5 bg-transparent border-paper/60 group-hover:border-teal-light"
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {/* Caption ribbon — bottom-right, matches Neon Alloys style exactly */}
      {slide && (
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            transition={{ duration: DURATION.fast, ease: EASE.enter }}
            className="absolute bottom-0 right-0 z-10 hidden sm:flex items-center bg-teal w-[70%] md:w-[58%] lg:w-[50%] xl:w-[44%] min-h-[64px] sm:min-h-[76px] md:min-h-[84px] px-6 sm:px-8 md:px-10 py-4 shadow-elevated shadow-ink/40"
            style={{ clipPath: "polygon(6% 0, 100% 0, 100% 100%, 0% 100%)" }}
          >
            <p className="font-display text-ink text-lg sm:text-xl md:text-2xl lg:text-[26px] leading-snug">
              Manufacturer &amp; Exporter of{" "}
              <span className="font-bold uppercase">{slide.caption}</span>
            </p>
          </motion.div>
        </AnimatePresence>
      )}
    </motion.section>
  );
}
