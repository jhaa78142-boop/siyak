import { stats } from "../data/products";
import StatCounter from "./StatCounter";
import Reveal from "./Reveal";

export default function StatsBand() {
  return (
    <section className="relative bg-deep text-paper py-16 overflow-hidden border-t border-teal/20">
      <div className="absolute inset-0 plate-texture opacity-40" />
      <div className="relative max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {stats.map((s) => (
              <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
