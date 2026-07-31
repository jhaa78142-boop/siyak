import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import ProductImage from "./ProductImage";
import BookCoverCard from "./BookCoverCard";
import { productCategories } from "../data/products";
import { catSeoSlug, seoSlug } from "../lib/slugify";

// "OUR SPECIAL PRODUCTS" — four flagship material families, each opening
// straight into that material's page under Pipes & Tubes. The Nickel Alloys
// tile keeps the existing interactive book (BookCoverCard / nickel-alloy
// catalogue) since it already covers the same ground.
const PIPES_TUBES_SLUG = "pipes-tubes";
const pipesTubes = productCategories.find((c) => c.slug === PIPES_TUBES_SLUG);
const materialTile = (name) =>
  pipesTubes?.materialTypes?.find((mt) => mt.name === name);

const stainlessSteel = materialTile("Stainless Steel Pipes & Tubes");
const duplex = materialTile("Duplex Steel Pipes & Tubes");
const copperAlloy = materialTile("Copper Alloy Pipes & Tubes");

const BLURBS = {
  "Stainless Steel Pipes & Tubes":
    "The workhorse grade for corrosion resistance — SS 304 to 904L in seamless and welded pipes & tubes for chemical, marine and process piping.",
  "Duplex Steel Pipes & Tubes":
    "Duplex & super duplex, UNS S31803 to S32760 — nearly double the strength of standard stainless for demanding offshore and process lines.",
  "Copper Alloy Pipes & Tubes":
    "Cu-Ni 90/10 & 70/30 pipes and tubes engineered for seawater and marine cooling systems, prized for biofouling and corrosion resistance.",
};

function MaterialTile({ mt, delay }) {
  if (!mt) return null;
  const href = `/products/${catSeoSlug(pipesTubes.slug)}/${seoSlug(mt.name)}`;

  return (
    <Reveal delay={delay}>
      <Link
        to={href}
        className="group relative block overflow-hidden rounded-sm shadow-lg hover:shadow-2xl transition-shadow duration-300"
      >
        <div className="relative overflow-hidden aspect-[4/3]">
          <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
            <ProductImage
              category={mt}
              aspect="aspect-[4/3]"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1a14]/90 via-[#0a1a14]/55 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-5">
            <h3 className="font-display uppercase text-lg sm:text-xl text-white font-bold leading-tight tracking-wide drop-shadow-lg">
              {mt.name.replace(" Pipes & Tubes", "")}
            </h3>
            <div className="mt-1.5 h-[3px] w-14 bg-teal-light" />
            <p className="mt-3 text-[12.5px] text-white/85 leading-snug line-clamp-3 font-medium">
              {BLURBS[mt.name] || mt.short}
            </p>
            <div className="mt-4">
              <span className="inline-flex items-center gap-2 bg-teal hover:bg-teal-light text-white font-display uppercase text-[11px] tracking-[0.12em] font-bold px-4 py-2 rounded-sm transition-colors duration-200 group-hover:bg-teal-light">
                View Details <ArrowRight size={12} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}

export default function SpecialProducts() {
  return (
    <section className="bg-white py-12 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section header — teal bar */}
        <Reveal className="mb-12">
          <div className="bg-teal text-center py-4 px-6 rounded-sm">
            <h2 className="font-display uppercase text-xl sm:text-2xl text-white tracking-[0.18em] font-bold">
              OUR SPECIAL PRODUCTS
            </h2>
          </div>
        </Reveal>

        {/* Four flagship material families */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MaterialTile mt={stainlessSteel} delay={0} />
          <MaterialTile mt={duplex} delay={0.08} />
          <Reveal delay={0.16}>
            <BookCoverCard />
          </Reveal>
          <MaterialTile mt={copperAlloy} delay={0.24} />
        </div>

      </div>
    </section>
  );
}
