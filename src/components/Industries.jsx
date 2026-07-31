import { Factory, Fuel, Building2, Ship, Flame, FlaskConical, Plane, Car, Train, Newspaper, Zap } from "lucide-react";
import Reveal from "./Reveal";
import { industries } from "../data/products";

const iconMap = {
  "Aerospace": Plane,
  "Automobile": Car,
  "Cement": Factory,
  "Oil & Gas": Fuel,
  "Power": Zap,
  "Pharma": FlaskConical,
  "Paper": Newspaper,
  "Railway": Train,
  "Power Plants": Flame,
  "Construction": Building2,
  "Ship Building": Ship,
  "Refineries": Flame,
  "Pharma & Dairy": FlaskConical,
};

export default function Industries() {
  return (
    <section id="industries" className="scroll-mt-24 bg-paper py-14 sm:py-16 relative overflow-hidden border-t border-teal-pale">
      <div className="relative max-w-7xl mx-auto px-6">
        <Reveal className="max-w-2xl mb-14">
          <span className="text-xs uppercase tracking-[0.22em] text-teal font-semibold">
            Industries We Serve
          </span>
          <h2 className="font-display uppercase text-3xl sm:text-4xl mt-3 leading-tight text-deep">
            Where our materials<br />actually get put to work.
          </h2>
        </Reveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {industries.map((ind, i) => {
            const Icon = iconMap[ind.name] || Factory;
            return (
              <Reveal key={ind.name} delay={i * 0.06} direction="none">
                <div className="group bg-white rounded-xl border border-teal-pale overflow-hidden h-full transition-shadow duration-300 hover:shadow-lg hover:shadow-deep/5">
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <img
                      src={ind.image}
                      alt={ind.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        style={{ filter: "contrast(1.06) saturate(1.1) brightness(1.02)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep/70 via-deep/10 to-transparent" />
                    <div className="absolute bottom-3 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-teal">
                      <Icon size={20} strokeWidth={1.8} />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display uppercase text-xl tracking-wide text-deep">{ind.name}</h3>
                    <p className="mt-2.5 text-sm text-deep leading-relaxed">{ind.desc}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
