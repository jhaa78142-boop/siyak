import { ShieldCheck } from "lucide-react";

const badges = [
  { text: "ISO 9001:2015", icon: true },
  { text: "ASTM International" },
  { text: "ANSI / ASME", icon: true },
  { text: "MSS-SP Standards" },
  { text: "DIN / BS Certified", icon: true },
  { text: "NACE MR 01-75" },
  { text: "API 6D", icon: true },
  { text: "Third-Party Inspected" },
];

export default function MarqueeStrip() {
  const loop = [...badges, ...badges];
  return (
    <section className="bg-teal border-y border-teal-pale py-5 overflow-hidden" aria-label="Certification standards">
      <div className="flex gap-0 w-max animate-marquee">
        {loop.map((b, i) => (
          <div key={i} className="flex items-center shrink-0">
            {/* Vertical rule separator */}
            <span className="w-px h-5 bg-white/30 mx-8" aria-hidden="true" />
            {b.icon && (
              <ShieldCheck size={13} className="text-white/80 mr-2 shrink-0" aria-hidden="true" />
            )}
            <span className="font-display uppercase text-[13px] tracking-[0.18em] text-white font-semibold whitespace-nowrap">
              {b.text}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
