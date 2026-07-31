import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import Reveal from "./Reveal";
import ProductImage from "./ProductImage";
import TiltCard from "./TiltCard";
import { productCategories } from "../data/products";
import { catSeoSlug } from "../lib/slugify";

// Show every product line except the last one on the homepage grid — the
// last one is still available on the dedicated /products page.
const featured = productCategories.slice(0, -1);

export default function FeaturedProducts() {
  return (
    <section className="bg-paper py-14 sm:py-16 border-t border-teal-pale relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <Reveal className="flex flex-wrap items-end justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <span className="text-xs uppercase tracking-[0.25em] text-teal font-semibold">Our Products</span>
            <h2 className="font-display uppercase text-3xl sm:text-4xl md:text-5xl mt-3 text-deep leading-tight">
              Every product line.<br />Every grade stocked.
            </h2>
            <p className="mt-4 text-sm sm:text-base text-steel-dark leading-relaxed max-w-lg">
              From seamless pipe to precision fasteners — each line is stocked across every
              major grade, tested, and export-packed to ASTM / ASME / MSS specification.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-teal font-display uppercase text-sm tracking-[0.15em] hover:text-teal-light transition-all duration-300 group shrink-0"
          >
            View Full Catalogue
            <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </Reveal>

        {/* overflow-hidden prevents 3D-perspective transforms from leaking outside on mobile */}
        <div className="overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((cat, i) => (
              <Reveal key={cat.slug} delay={(i % 6) * 0.06}>
                <TiltCard className="group h-full" maxTilt={4}>
                  <Link
                    to={`/products/${catSeoSlug(cat.slug)}`}
                    className="flex h-full flex-col bg-white border border-teal-pale rounded-xl overflow-hidden transition-all duration-300 hover:border-teal-light hover:shadow-hover"
                  >
                    <div className="relative overflow-hidden">
                      <div className="transition-transform duration-700 group-hover:scale-105">
                        <ProductImage category={cat} />
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 p-5 sm:p-6">
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <h3 className="font-display uppercase text-base text-deep group-hover:text-teal transition-colors leading-snug">
                          {cat.name}
                        </h3>
                        <span
                          className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border border-teal-pale text-teal group-hover:bg-teal group-hover:text-white group-hover:border-teal transition-all duration-300"
                          aria-hidden="true"
                        >
                          <ArrowUpRight size={16} />
                        </span>
                      </div>
                      <p className="text-xs sm:text-[13px] text-deep leading-relaxed">{cat.short}</p>
                    </div>
                  </Link>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
