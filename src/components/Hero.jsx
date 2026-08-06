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
  { image: bgElectropolished, name: "Electropolished Pipes" },
  { image: bgFlanges, name: "Flanges" },
  { image: bgTubeSheet, name: "Tube Sheets" },
  { image: bgWireMesh, name: "Wire Mesh" },
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
      className="relative overflow-hidden w-full max-h-[500px]"
      style={{ aspectRatio: "1280 / 350", maxWidth: "100%" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="absolute inset-0 overflow-hidden">
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
              />
            </motion.div>
          ) : (
            <ImagePlaceholder label="Siyak Steel" className="absolute inset-0" aspect="" />
          )}
        </AnimatePresence>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 h-10 w-10 sm:h-11 sm:w-11 rounded-full bg-black/55 hover:bg-black/75 text-white flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 sm:gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Show slide ${i + 1}`}
              className="transition-all duration-300"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  i === active
                    ? "h-3 w-3 sm:h-3.5 sm:w-3.5 bg-white ring-2 ring-white/60"
                    : "h-2.5 w-2.5 sm:h-3 sm:w-3 bg-white/45 hover:bg-white/70"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </motion.section>
  );
}
