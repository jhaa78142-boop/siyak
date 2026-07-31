import { motion } from "framer-motion";
import Reveal from "./Reveal";
import { EASE } from "../lib/motion";

const countries = [
  { name: "Poland", code: "pl" },
  { name: "UAE", code: "ae" },
  { name: "Saudi Arabia", code: "sa" },
  { name: "Qatar", code: "qa" },
  { name: "Oman", code: "om" },
  { name: "Kuwait", code: "kw" },
  { name: "Bahrain", code: "bh" },
  { name: "Singapore", code: "sg" },
  { name: "Malaysia", code: "my" },
  { name: "Indonesia", code: "id" },
  { name: "Vietnam", code: "vn" },
  { name: "Thailand", code: "th" },
  { name: "Philippines", code: "ph" },
  { name: "Germany", code: "de" },
  { name: "Netherlands", code: "nl" },
  { name: "UK", code: "gb" },
  { name: "Italy", code: "it" },
  { name: "France", code: "fr" },
  { name: "Spain", code: "es" },
  { name: "Belgium", code: "be" },
  { name: "South Africa", code: "za" },
  { name: "Nigeria", code: "ng" },
  { name: "Egypt", code: "eg" },
  { name: "Kenya", code: "ke" },
  { name: "Ghana", code: "gh" },
  { name: "Tanzania", code: "tz" },
  { name: "USA", code: "us" },
  { name: "Canada", code: "ca" },
  { name: "Mexico", code: "mx" },
  { name: "Brazil", code: "br" },
  { name: "Argentina", code: "ar" },
  { name: "Bangladesh", code: "bd" },
  { name: "Sri Lanka", code: "lk" },
  { name: "Nepal", code: "np" },
  { name: "Australia", code: "au" },
  { name: "New Zealand", code: "nz" },
  { name: "China", code: "cn" },
  { name: "Japan", code: "jp" },
  { name: "South Korea", code: "kr" },
  { name: "Turkey", code: "tr" },
  { name: "Iran", code: "ir" },
  { name: "Israel", code: "il" },
];

export default function TrustedBy() {
  return (
    <section className="relative bg-paper py-14 sm:py-16 border-t border-teal-pale overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs uppercase tracking-[0.25em] text-teal font-semibold">
            Global Reach
          </span>
          <h2 className="font-display uppercase text-2xl sm:text-3xl md:text-4xl mt-3 text-deep leading-tight">
            Trusted by exporters and contractors<br className="hidden sm:block" /> in 40+ countries
          </h2>
        </Reveal>

        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-px bg-teal-pale rounded-xl overflow-hidden shadow-lg">
          {countries.map((country, i) => (
            <motion.div
              key={country.code}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.05, ease: EASE.enter }}
              whileHover={{ backgroundColor: "#0b3537" }}
              className="group relative bg-white p-4 text-center cursor-default"
              aria-hidden="true"
            >
              <img
                src={`https://flagcdn.com/w80/${country.code}.png`}
                alt=""
                className="mx-auto h-6 w-auto object-contain mb-2"
                loading="lazy"
              />
              <div className="font-display uppercase text-xs text-deep group-hover:text-teal-light transition-colors duration-300">
                {country.name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
