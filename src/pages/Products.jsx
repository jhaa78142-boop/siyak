import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import ProductImage from "../components/ProductImage";
import TiltCard from "../components/TiltCard";
import CTABand from "../components/CTABand";
import { productCategories } from "../data/products";
import SEO from "../components/SEO";
import { OrganizationLd, BreadcrumbLd, WebPageLd } from "../components/JsonLd";
import { absoluteUrl } from "../lib/site";
import { catSeoSlug } from "../lib/slugify";

export default function Products() {
  return (
    <>
      <SEO
        title="Steel Pipes, Flanges & Fittings Catalogue"
        description="Browse Siyak Steel International's full product catalogue — 17 product lines including pipes, flanges, fittings, fasteners and more."
        keywords="steel pipes catalogue, industrial fittings, flanges exporter, stainless steel products, carbon steel piping"
      />
      <OrganizationLd />
      <WebPageLd
        url={absoluteUrl("/products")}
        title="Steel Pipes, Flanges & Fittings Catalogue"
        description="Browse Siyak Steel International's full product catalogue — 17 product lines including pipes, flanges, fittings, fasteners and more."
      />
      <BreadcrumbLd
        items={[
          { name: "Home", url: absoluteUrl("/") },
          { name: "Products", url: absoluteUrl("/products") },
        ]}
      />
      <PageHero
        eyebrow="Full Catalogue"
        title="Seventeen product lines, one stockist"
        crumb="Products"
      />

      <section className="relative bg-white py-14 overflow-hidden">
        <div className="absolute inset-0 grid-texture-light opacity-60 pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-[420px] h-[420px] bg-teal-pale/40 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-[420px] h-[420px] bg-teal-pale/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          {/* overflow-hidden prevents 3D TiltCard perspective from leaking on mobile */}
          <div className="overflow-hidden">
          <div className="flex flex-wrap justify-center gap-5">
            {productCategories.map((cat, i) => (
              <Reveal
                key={cat.slug}
                delay={(i % 8) * 0.05}
                className="w-full sm:w-[calc(50%-10px)] lg:w-[calc(25%-15px)]"
              >
                <TiltCard className="group h-full" maxTilt={6}>
                  <Link
                    to={`/products/${catSeoSlug(cat.slug)}`}
                    className="flex flex-col h-full bg-white border border-teal-pale/60 rounded-lg overflow-hidden hover:shadow-xl hover:shadow-teal/5 hover:border-teal-light/70 transition-all duration-300"
                  >
                    <div className="overflow-hidden">
                      <div className="transition-transform duration-500 group-hover:scale-105">
                        <ProductImage category={cat} />
                      </div>
                    </div>
                    <div className="flex flex-col flex-1 p-5">
                      <h3 className="font-display uppercase text-base text-deep group-hover:text-teal transition-colors leading-snug">
                        {cat.name}
                      </h3>
                      <p className="mt-2 text-[13px] text-steel-dark leading-relaxed line-clamp-2 flex-1">{cat.short}</p>



                      <div className="mt-3 pt-3 border-t border-teal-pale/50 flex items-center justify-between">
                        <span className="text-[11px] spec-label text-steel-dark truncate">{cat.sizes}</span>
                        <span className="shrink-0 inline-flex items-center gap-1 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-teal/85">
                          Details <ArrowUpRight size={11} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              </Reveal>
            ))}
          </div>
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
