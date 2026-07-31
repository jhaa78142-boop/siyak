import { Link } from "react-router-dom";
import { ChevronRight, Download } from "lucide-react";
import { productCategories } from "../data/products";
import { slugify, seoSlug, catSeoSlug } from "../lib/slugify";

/**
 * Two-block product navigation used on every product-line, material-type
 * and material-variant page — styled to match neonalloys.com's reference
 * sidebar 1:1: a plain uppercase heading (no card header), a flat list of
 * links prefixed with a small left-hand chevron, and hairline dividers
 * between rows. A family's grade list only expands once you're actually
 * on that family (or one of its grades) — everything else stays collapsed,
 * exactly like the reference site.
 *
 * activeTypeSlug    — slug of the current material type / family, if any
 * activeVariantSlug — slug of the current variant within a family, if any
 */
export default function CategorySidebar({ category, activeTypeSlug, activeVariantSlug }) {
  const materialTypes = category.materialTypes || [];

  return (
    <aside className="lg:sticky lg:top-28 lg:self-start space-y-8">
      {materialTypes.length > 0 && (
        <div>
          <h2 className="font-display uppercase text-base sm:text-lg text-teal font-bold tracking-wide pb-2.5 mb-1 border-b-2 border-teal">
            {category.name}
          </h2>
          <nav className="divide-y divide-dashed divide-teal-pale">
            {materialTypes.map((mt) => {
              const mtSlug = slugify(mt.name);
              const hasVariants = !!mt.variants?.length;
              const isActiveFamily =
                hasVariants && activeTypeSlug && activeTypeSlug.startsWith(mtSlug);
              const isActiveStandalone =
                !hasVariants &&
                activeTypeSlug &&
                activeTypeSlug.startsWith(mtSlug) &&
                !activeVariantSlug;
              const isCurrent = isActiveFamily || isActiveStandalone;

              return (
                <div key={mt.name}>
                  {/* Type / family row */}
                  <Link
                    to={`/products/${catSeoSlug(category.slug)}/${seoSlug(mt.name)}`}
                    className={`flex items-center gap-2 py-2.5 text-sm transition-colors ${
                      isCurrent ? "text-teal font-semibold" : "text-deep hover:text-teal"
                    }`}
                  >
                    <ChevronRight
                      size={13}
                      className={`shrink-0 ${isCurrent ? "text-teal" : "text-teal/70"}`}
                    />
                    <span className="leading-snug">{mt.name}</span>
                  </Link>

                  {/* Grade list — expands only for the family currently being viewed */}
                  {hasVariants && isActiveFamily && (
                    <div className="pb-2 space-y-0.5">
                      {mt.variants.map((v) => {
                        const vSlug = slugify(v.name);
                        const vSeoSlug = seoSlug(v.name);
                        const isActiveVariant =
                          activeVariantSlug && activeVariantSlug.startsWith(vSlug);
                        return (
                          <Link
                            key={v.name}
                            to={`/products/${catSeoSlug(category.slug)}/${seoSlug(mt.name)}/${vSeoSlug}`}
                            className={`flex items-center gap-2 pl-6 py-1.5 text-[12.5px] transition-colors ${
                              isActiveVariant
                                ? "text-teal font-semibold"
                                : "text-steel-dark hover:text-teal"
                            }`}
                          >
                            <ChevronRight
                              size={10}
                              className={`shrink-0 ${isActiveVariant ? "text-teal" : "text-teal/50"}`}
                            />
                            <span className="truncate">{v.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      )}

      <div>
        <h2 className="font-display uppercase text-base sm:text-lg text-teal font-bold tracking-wide pb-2.5 mb-1 border-b-2 border-teal">
          Product Range
        </h2>
        <nav className="divide-y divide-dashed divide-teal-pale">
          {productCategories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/products/${catSeoSlug(cat.slug)}`}
              className={`flex items-center gap-2 py-2.5 text-sm transition-colors ${
                cat.slug === category.slug ? "text-teal font-semibold" : "text-deep hover:text-teal"
              }`}
            >
              <ChevronRight
                size={13}
                className={`shrink-0 ${cat.slug === category.slug ? "text-teal" : "text-teal/70"}`}
              />
              <span>{cat.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Download Catalogue — procurement engineers want the PDF from product pages */}
      <a
        href="/catalogue.pdf"
        download
        className="flex items-center gap-2 w-full justify-center bg-deep hover:bg-ink text-paper font-display uppercase text-[12px] tracking-[0.15em] px-4 py-3.5 clip-corner transition-colors min-h-[44px]"
        aria-label="Download Siyak Steel company catalogue PDF"
      >
        <Download size={14} aria-hidden="true" />
        Download Catalogue
      </a>
    </aside>
  );
}
