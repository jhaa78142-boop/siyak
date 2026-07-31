import { motion } from "framer-motion";
import Reveal from "./Reveal";
import { DURATION, EASE } from "../lib/motion";

const testimonials = [
  {
    name: "Verified Buyer",
    company: "Global EPC Contractor",
    country: "UAE",
    quote:
      "Siyak Steel delivered exact grades and test certificates on time. Their technical team kept our project moving through customs delays.",
  },
  {
    name: "Procurement Lead",
    company: "Industrial Fabricator",
    country: "India",
    quote:
      "The material quality and export packing met our customer’s overseas inspection standards without rework.",
  },
  {
    name: "Purchase Manager",
    company: "Refinery Maintenance Contractor",
    country: "Saudi Arabia",
    quote:
      "We needed alloy steel valves on a tight shutdown schedule. Siyak confirmed stock the same day and shipped within the week.",
  },
  {
    name: "Verified Buyer",
    company: "Power Plant EPC",
    country: "Kenya",
    quote:
      "Mill certificates matched every batch we received, which made customs clearance and site QA straightforward on our end.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-ink text-paper py-14 sm:py-16">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-[0.22em] text-teal font-semibold">Client Confidence</span>
            <h2 className="font-display uppercase text-3xl sm:text-4xl mt-4 leading-tight">
              Real buyer feedback from verified procurement teams.
            </h2>
          </div>
        </Reveal>

        <div className="grid gap-6 lg:grid-cols-2">
          {testimonials.map((testimonial, index) => (
            <Reveal key={index} delay={index * 0.1}>
              <motion.div
                className="relative clip-corner border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl shadow-black/10"
                whileHover={{ y: -4 }}
                transition={{ duration: DURATION.fast, ease: EASE.micro }}
              >
                <div className="mb-5 text-paper/90 text-base leading-relaxed">
                  “{testimonial.quote}”
                </div>
                <div className="mt-6 border-t border-white/10 pt-5 flex flex-col gap-2 text-sm text-paper/80">
                  <span className="text-paper font-semibold">{testimonial.name}</span>
                  <span>{testimonial.company}</span>
                  <span className="uppercase tracking-[0.18em] text-xs text-teal">{testimonial.country}</span>
                </div>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
