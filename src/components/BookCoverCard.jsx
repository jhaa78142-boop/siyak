import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import coverBg from "../assets/hero-bg/aj.webp";

/**
 * BookCoverCard — the middle tile in "OUR SPECIAL PRODUCTS".
 * Clicking it opens the full interactive book on its own page
 * (/nickel-alloy-catalogue).
 */
export default function BookCoverCard() {
  return (
    <Link
      to="/nickel-alloy-catalogue"
      className="group relative block overflow-hidden rounded-sm shadow-lg hover:shadow-2xl transition-shadow duration-300"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
          <img
            src={coverBg}
            alt="Nickel Alloy Products"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a14]/90 via-[#0a1a14]/55 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <h3 className="font-display uppercase text-lg sm:text-xl text-white font-bold leading-tight tracking-wide drop-shadow-lg">
            Nickel Alloy Products
          </h3>
          <div className="mt-1.5 h-[3px] w-14 bg-teal-light" />
          <p className="mt-3 text-[12.5px] text-white/85 leading-snug line-clamp-3 font-medium">
            Nickel 200/201, Monel, Hastelloy, Inconel, Alloy 20, Cupro-Nickel &amp; Titanium —
            open the book for full composition and properties.
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center gap-2 bg-teal hover:bg-teal-light text-white font-display uppercase text-[11px] tracking-[0.12em] font-bold px-4 py-2 rounded-sm transition-colors duration-200 group-hover:bg-teal-light">
              Open The Book <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
