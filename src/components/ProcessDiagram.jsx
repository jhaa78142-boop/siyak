import { motion, useScroll, useInView, animate } from 'framer-motion';
import { useRef } from 'react';
import { Factory, Flame, ClipboardCheck, Award, Globe } from 'lucide-react';
import Reveal from './Reveal';
import { EASE, DURATION, LOOP } from '../lib/motion';
import rawMaterialImg from '../assets/process/raw-material-sourcing.webp';
import forgingImg from '../assets/process/forging-rolling.webp';
import qualityTestingImg from '../assets/process/quality-testing.webp';
import dispatchImg from '../assets/process/global-dispatch.webp';

const steps = [
  { id: 1, icon: Factory,       title: "Raw Material Sourcing",  description: "Premium-grade steel alloys sourced from certified mills worldwide.",      image: rawMaterialImg   },
  { id: 2, icon: Flame,          title: "Forging & Rolling",       description: "Precision hot and cold forming to exact dimensional specifications.",       image: forgingImg       },
  { id: 3, icon: ClipboardCheck, title: "Quality Testing",         description: "Rigorous dimensional, chemical, and mechanical property checks.",           image: qualityTestingImg },
  { id: 4, icon: Award,          title: "Certification",           description: "ISO 9001:2015 and third-party inspection documentation with every shipment." },
  { id: 5, icon: Globe,          title: "Global Dispatch",         description: "Export-ready packaging and logistics delivered to 40+ countries.",           image: dispatchImg      },
];

export default function ProcessDiagram() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <section ref={containerRef} className="bg-paper text-deep py-14 sm:py-16 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-teal/8 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <Reveal className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-teal font-semibold">Our Process</span>
          <h2 className="font-display uppercase text-3xl sm:text-4xl md:text-5xl text-deep mt-3 leading-tight">
            From Raw Material to Global Delivery
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed text-steel-dark">
            A polished process built around certified steel, strict inspection and fast export readiness.
          </p>
        </Reveal>

        <div className="relative rounded-lg border border-teal-pale bg-white shadow-rest overflow-hidden">
          {/* Scroll-driven timeline line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-teal-pale hidden md:block" />
          <motion.div
            className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-teal via-teal-light to-teal hidden md:block"
            style={{ scaleY: scrollYProgress, transformOrigin: "top" }}
          />

          <div className="space-y-12 md:space-y-24 py-12 px-6 md:px-10">
            {steps.map((step, index) => (
              <ProcessStep key={step.id} step={step} index={index} isEven={index % 2 === 0} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessStep({ step, index, isEven }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-140px", amount: 0.35 });
  const IconComponent = step.icon;
  const delay = index * 0.12;

  return (
    <div ref={ref} className={`relative flex flex-col gap-8 md:gap-12 ${isEven ? "md:flex-row" : "md:flex-row-reverse"}`}>
      {/* Image panel */}
      <div className="flex-1">
        {step.image && (
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 1.04 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: DURATION.slow, delay: delay + 0.15, ease: EASE.enter }}
            className="relative max-w-md mx-auto md:mx-0"
          >
            <div className={`absolute -z-10 w-full h-full border-2 border-teal/40 rounded-lg ${isEven ? "md:-bottom-4 md:-left-4" : "md:-bottom-4 md:-right-4"} -bottom-4 -right-4`} />
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden shadow-hover">
              <motion.img
                src={step.image}
                alt={step.title}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ filter: "contrast(1.06) saturate(1.1) brightness(1.02)" }}
                initial={{ scale: 1.12 }}
                animate={isInView ? { scale: 1 } : {}}
                transition={{ duration: 1.4, delay: delay + 0.15, ease: EASE.enter }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep/40 via-transparent to-transparent" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Step badge — clip-corner (industrial) instead of circle (consumer) */}
      <div className="relative z-10 flex items-start justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: DURATION.base, delay, ease: EASE.enter }}
          className="relative"
        >
          <div className="w-16 h-16 md:w-20 md:h-20 clip-corner bg-white border-2 border-teal-light flex items-center justify-center shadow-hover">
            <IconComponent size={28} className="text-teal" strokeWidth={2} />
          </div>
          {/* Framer Motion pulse ring — replaces inline @keyframes */}
          {isInView && (
            <motion.div
              className="absolute inset-[-12px] border border-teal/30 clip-corner pointer-events-none"
              animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.25, 1] }}
              transition={{ ...LOOP.pulse, repeat: Infinity }}
            />
          )}
        </motion.div>
      </div>

      {/* Content card */}
      <div className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: DURATION.base, delay: delay + 0.1, ease: EASE.enter }}
          className="bg-white shadow-rest border border-teal-pale rounded-lg p-8"
        >
          {/* Step number — clip-corner shape, not a circle */}
          <span className="inline-flex items-center justify-center h-12 w-12 clip-corner-sm bg-teal-pale text-teal font-display font-bold text-lg mb-4 shadow-sm">
            {String(step.id).padStart(2, "0")}
          </span>
          <h3 className="font-display uppercase text-2xl text-deep mb-3">{step.title}</h3>
          <p className="text-steel-dark leading-relaxed">{step.description}</p>
        </motion.div>
      </div>
    </div>
  );
}
