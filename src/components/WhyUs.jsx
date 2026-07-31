import { ShieldCheck, Package, ClipboardCheck, Headphones, Boxes, Truck } from "lucide-react";
import { motion } from "framer-motion";
import Reveal from "./Reveal";
import { whyUs } from "../data/products";
import onTimeDeliveryImg from "../assets/about/trusted-partnership.webp";
import { DURATION, EASE } from "../lib/motion";

const icons = [Boxes, ShieldCheck, Package, ClipboardCheck, Truck, Headphones];

export default function WhyUs() {
  return (
    <section className="bg-white py-14 sm:py-16 relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6">
        <Reveal className="max-w-2xl mb-12">
          <span className="text-xs uppercase tracking-[0.25em] text-teal font-semibold">Why Choose Us</span>
          <h2 className="font-display uppercase text-3xl sm:text-4xl mt-3 text-deep leading-tight">
            Six reasons our clients<br />don't shop around twice.
          </h2>
        </Reveal>

        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8">
          {/* Featured large card on the left */}
          <div>
            <Reveal>
              <div className="h-full bg-white border border-teal-pale rounded-2xl p-8 shadow-sm">
                <div className="flex flex-col gap-6">
                  <div className="flex-1">
                    <div className="h-16 w-16 rounded-lg bg-teal-pale flex items-center justify-center mb-6">
                      <ShieldCheck size={28} className="text-teal" />
                    </div>
                    <h3 className="font-display uppercase text-2xl text-deep">Customer-first operations</h3>
                    <p className="mt-3 text-sm text-deep leading-relaxed">We prioritise on-time export packing, accurate documentation and a single point of contact for each shipment — so buyers can plan confidently.</p>
                  </div>
                  <img src={onTimeDeliveryImg} alt="Trusted partnership with our clients" className="h-52 w-full object-cover rounded-xl" />
                </div>
              </div>
            </Reveal>
          </div>

          {/* Compact list on the right */}
          <div className="space-y-6">
            {whyUs.slice(1).map((item, i) => {
              const Icon = icons[(i + 1) % icons.length];
              const isDelivery = item.title === "On-Time Delivery";
              return (
                <Reveal key={item.title} delay={i * 0.06}>
                  <motion.div whileHover={{ y: -4 }} transition={{ duration: DURATION.fast, ease: EASE.micro }} className="group relative h-full bg-white border border-teal-pale rounded-xl p-6 hover:border-teal-light transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 clip-corner-sm bg-teal-pale flex items-center justify-center overflow-hidden">
                        <Icon size={20} className="text-teal" />
                      </div>
                      <div>
                        <h4 className="font-display uppercase text-sm text-deep tracking-wide">{item.title}</h4>
                        <p className="mt-2 text-sm text-deep leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
