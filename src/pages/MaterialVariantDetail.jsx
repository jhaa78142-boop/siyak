import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, ArrowRight, Mail } from "lucide-react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import ProductImage from "../components/ProductImage";
import CategorySidebar from "../components/CategorySidebar";
import AlloySpecTables from "../components/AlloySpecTables";
import ApplicationsSection from "../components/ApplicationsSection";
import CTABand from "../components/CTABand";
import { productCategories } from "../data/products";
import SEO from "../components/SEO";
import { OrganizationLd, BreadcrumbLd, WebPageLd } from "../components/JsonLd";
import { absoluteUrl } from "../lib/site";
import { slugify, seoSlug, catSeoSlug } from "../lib/slugify";

const EXPORT_COUNTRIES =
  "Canada, Azerbaijan, Kuwait, Morocco, Jordan, Italy, Australia, Chine, Uganda, London, Malaysia, Kazakhstan, Africa, Algeria, Mozambique, Israel, New Zealand, Turkey, Ethiopa, UAE, Colombia, Mexico, UK, Indonesia, Saudi Arabia, Democratic Republic of the Congo, Iraq, Houston, Venezuela, Sri Lanka, Nigeria, Russia, Peru, Egypt, Bahrain, Germany, Ghana, South Africa, Thailand (Bangkok), Argentina, Vietnam, Iran, Dubai, Brazil, Sudan, Trinidad and Tobago, Tunisia, United States, Angola, Cameroon.";

function gradeBlurb(type) {
  if (type.gradeText) return type.gradeText;
  if (type.grades?.length) return type.grades.join(", ");
  if (type.standards?.length) return type.standards.join(", ");
  return "";
}

export default function MaterialVariantDetail() {
  const { slug, typeSlug, variantSlug } = useParams();
  const category = productCategories.find((c) => slug.startsWith(c.slug));

  if (!category) return <Navigate to="/products" replace />;

  const materialTypes = category.materialTypes || [];
  const family = materialTypes.find(
    (mt) => mt.variants?.length && typeSlug.startsWith(slugify(mt.name))
  );

  if (!family) return <Navigate to={`/products/${catSeoSlug(category.slug)}`} replace />;

  const variant = family.variants.find((v) => {
    const baseSlug = slugify(v.name);
    return variantSlug.startsWith(baseSlug);
  });

  if (!variant) return <Navigate to={`/products/${catSeoSlug(category.slug)}/${seoSlug(family.name)}`} replace />;

  const siblingVariants = family.variants.filter((v) => v.name !== variant.name);
  const related = productCategories.filter((c) => c.slug !== slug).slice(0, 3);
  const variantSizes = variant.sizes || category.sizes;
  const variantGrades = variant.grades?.join(", ");
  const variantStandards = variant.standards || family.standards || category.standards;
  const resolvedImage = variant.image || family.image || null;
  const pageDescription = `${variant.desc} Available in ${variant.grades.join(", ")}, size range ${variantSizes}, meeting standards ${category.standards.join(", ")}.`;

  return (
    <>
      <SEO
        title={`${variant.name} | ${family.name}`}
        description={pageDescription}
        keywords={`${variant.name.toLowerCase()}, ${variant.grades.join(", ").toLowerCase()}, ${family.name.toLowerCase()}, ${category.name.toLowerCase()}`}
        type="product"
      />
      <OrganizationLd />
      <WebPageLd
        url={absoluteUrl(`/products/${catSeoSlug(category.slug)}/${seoSlug(family.name)}/${seoSlug(variant.name)}`)}
        title={`${variant.name} | ${family.name}`}
        description={pageDescription}
      />
      <BreadcrumbLd
        items={[
          { name: "Home", url: absoluteUrl("/") },
          { name: "Products", url: absoluteUrl("/products") },
          { name: category.name, url: absoluteUrl(`/products/${catSeoSlug(category.slug)}`) },
          { name: family.name, url: absoluteUrl(`/products/${catSeoSlug(category.slug)}/${seoSlug(family.name)}`) },
          { name: variant.name, url: absoluteUrl(`/products/${catSeoSlug(category.slug)}/${seoSlug(family.name)}/${seoSlug(variant.name)}`) },
        ]}
      />
      <PageHero eyebrow={family.name} title={variant.name} crumb={variant.name} />

      {/* NEONALLOYS STYLE BREADCRUMB STRIP — 4 levels deep */}
      <section className="bg-paper border-b border-teal-pale/50">
        <div className="max-w-7xl px-6 py-3 text-xs">
          <span className="text-steel-dark">You are here:&nbsp;&nbsp;</span>
          <Link to="/products" className="text-teal hover:underline font-medium">
            Products
          </Link>
          <span className="text-steel-dark mx-2">/</span>
          <Link to={`/products/${catSeoSlug(category.slug)}`} className="text-teal hover:underline font-medium">
            {category.name}
          </Link>
          <span className="text-steel-dark mx-2">/</span>
          <Link to={`/products/${catSeoSlug(category.slug)}/${seoSlug(family.name)}`} className="text-teal hover:underline font-medium">
            {family.name}
          </Link>
          <span className="text-steel-dark mx-2">/</span>
          <span className="text-deep font-semibold">{variant.name}</span>
        </div>
      </section>

      {/* MAIN 2-COLUMN LAYOUT */}
      <section className="bg-paper py-10">
        <div className="max-w-7xl px-6 grid lg:grid-cols-[260px_1fr] gap-10">
          {/* =============== LEFT SIDEBAR — 2 widgets ================================== */}
          <aside className="space-y-6">
            <CategorySidebar
              category={category}
              activeTypeSlug={typeSlug}
              activeVariantSlug={variantSlug}
            />
          </aside>

          {/* =============== MAIN DOCUMENT COLUMN =================================== */}
          <div>
            {/* ---- 1. H1 HEADER + SHORT DESCRIPTION ------------------ */}
            <Reveal>
              <h1 className="font-display uppercase text-3xl md:text-4xl text-deep leading-tight tracking-tight">
                {variant.name}
              </h1>
              <div className="mt-2 h-[3px] w-24 bg-teal" />
              <p className="mt-5 text-[15.5px] leading-relaxed text-[#333]">
                {variant.desc}
              </p>
            </Reveal>

            {/* ---- 2. RANGE / FORM / GRADES SPEC BLOCK ---------------- */}
            <Reveal className="mt-10">
              <h1 className="font-display uppercase text-2xl md:text-3xl text-deep leading-tight">
                {variant.name}
              </h1>
              <div className="mt-4 bg-gradient-to-r from-deep to-deep/95 border border-teal-pale rounded-lg px-6 py-5 text-paper">
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-10 gap-y-4 font-mono text-[12.5px] tracking-[0.06em]">
                  {variantSizes && (
                    <div className="flex items-baseline gap-3">
                      <span className="font-display uppercase text-teal font-bold text-sm tracking-[0.15em]">
                        RANGE
                      </span>
                      <span className="text-paper font-bold leading-relaxed">{variantSizes}</span>
                    </div>
                  )}
                  {variant.form && (
                    <div className="flex items-baseline gap-3">
                      <span className="font-display uppercase text-teal font-bold text-sm tracking-[0.15em]">
                        FORM
                      </span>
                      <span className="text-paper font-bold leading-relaxed">{variant.form}</span>
                    </div>
                  )}
                  {variant.type && (
                    <div className="flex items-baseline gap-3">
                      <span className="font-display uppercase text-teal font-bold text-sm tracking-[0.15em]">
                        TYPE
                      </span>
                      <span className="text-paper font-bold leading-relaxed">{variant.type}</span>
                    </div>
                  )}
                  {variantGrades && (
                    <div className="flex items-baseline gap-3 sm:col-span-2 w-full">
                      <span className="font-display uppercase text-teal font-bold text-sm tracking-[0.15em] shrink-0">
                        GRADE
                      </span>
                      <span className="text-paper font-bold leading-relaxed">{variantGrades}</span>
                    </div>
                  )}
                  {variant.schedule && (
                    <div className="flex items-baseline gap-3">
                      <span className="font-display uppercase text-teal font-bold text-sm tracking-[0.15em]">
                        SCHEDULE
                      </span>
                      <span className="text-paper font-bold leading-relaxed">{variant.schedule}</span>
                    </div>
                  )}
                  {variant.end && (
                    <div className="flex items-baseline gap-3">
                      <span className="font-display uppercase text-teal font-bold text-sm tracking-[0.15em]">
                        END
                      </span>
                      <span className="text-paper font-bold leading-relaxed">{variant.end}</span>
                    </div>
                  )}
                  {variant.length && (
                    <div className="flex items-baseline gap-3">
                      <span className="font-display uppercase text-teal font-bold text-sm tracking-[0.15em]">
                        LENGTH
                      </span>
                      <span className="text-paper font-bold leading-relaxed">{variant.length}</span>
                    </div>
                  )}
                  {variantStandards?.length && (
                    <div className="flex items-baseline gap-3 sm:col-span-2 w-full">
                      <span className="font-display uppercase text-teal font-bold text-sm tracking-[0.15em] shrink-0">
                        STANDARDS
                      </span>
                      <span className="text-paper font-bold leading-relaxed">{variantStandards.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            </Reveal>

            {/* ---- 2b. Image + Available Forms 2-col row (if image) -- */}
            {resolvedImage && (
              <Reveal className="mt-12">
                <div className="grid md:grid-cols-[1.05fr_1fr] gap-10 items-start">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
                    animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <ProductImage
                      category={{ image: resolvedImage, name: variant.name }}
                      className="rounded-lg shadow-xl shadow-deep/10"
                      aspect="aspect-[4/3]"
                    />
                  </motion.div>
                  {category.items?.length > 0 && (
                    <div className="rounded-lg border border-teal-pale overflow-hidden shadow-sm">
                      <div className="bg-deep px-6 py-4">
                        <h2 className="font-display uppercase text-lg text-paper tracking-wide">
                          Available Forms
                        </h2>
                      </div>
                      <div className="p-5 grid sm:grid-cols-2 gap-3 bg-white">
                        {category.items.map((item) => (
                          <div key={item} className="flex items-center gap-3 bg-teal-pale/40 border border-teal-pale clip-corner-sm px-4 py-3">
                            <span className="shrink-0 w-1.5 h-1.5 bg-teal clip-corner-sm" aria-hidden="true" />
                            <span className="text-sm font-medium text-deep">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Reveal>
            )}

            {/* ---- 3. GRADE H2 PANEL (single grade overview for this variant) -------- */}
            <div className="mt-14">
              <Reveal>
                <div>
                  <h2 className="font-display uppercase text-2xl md:text-[26px] text-deep leading-tight tracking-tight">
                    {variant.name} — Grade Specification
                  </h2>
                  <div className="mt-2 h-[3px] w-20 bg-teal" />
                  <div className="mt-7 space-y-8">
                    <div className="border-l-[3px] border-teal/50 pl-5 ml-0.5">
                      <h3 className="font-display uppercase text-lg md:text-xl text-deep tracking-wide">
                        Composition & Standards
                      </h3>
                      <p className="mt-3 text-[14px] leading-relaxed text-steel-dark font-mono tracking-wide whitespace-pre-wrap">
                        {gradeBlurb(variant)}
                      </p>
                      {siblingVariants.length > 0 && (
                        <div className="mt-5 flex flex-wrap items-center gap-x-1.5 gap-y-2 text-[13px]">
                          {siblingVariants.slice(0, 10).map((v, i) => (
                            <span key={v.name} className="inline-flex items-center">
                              <Link
                                to={`/products/${catSeoSlug(category.slug)}/${seoSlug(family.name)}/${seoSlug(v.name)}`}
                                className="text-teal font-semibold hover:underline underline-offset-2"
                              >
                                {v.grades?.[0] || v.name.split(" ").slice(0, 3).join(" ")}
                              </Link>
                              {i < Math.min(siblingVariants.length, 10) - 1 && (
                                <span className="text-steel-dark/50 ml-1.5" aria-hidden="true">•</span>
                              )}
                            </span>
                          ))}
                          {siblingVariants.length > 10 && (
                            <span className="text-steel-dark">
                              +{siblingVariants.length - 10} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>

            {/* ---- 3b. Chem / Standards-equiv tables via AlloySpecTables + ApplicationsSection */}
            {(variant.chem?.length > 0 || variant.standardsEquiv?.length > 0 || variant.applications?.length > 0) && (
              <div className="mt-16 space-y-12">
                {(variant.chem?.length > 0 || variant.standardsEquiv?.length > 0) && (
                  <Reveal>
                    <h2 className="font-display uppercase text-2xl text-deep leading-tight tracking-tight mb-8">
                      {variant.name} — Chemical & Standards Data:
                    </h2>
                    <div className="h-[3px] w-20 bg-teal -mt-6 mb-8" />
                    <AlloySpecTables chem={variant.chem} standardsEquiv={variant.standardsEquiv} name={variant.name} />
                  </Reveal>
                )}
                {variant.applications?.length > 0 && (
                  <ApplicationsSection applications={variant.applications} />
                )}
              </div>
            )}

            {/* ---- 4. SPECIFICATION TABLES (variant-level + family-level + category-level) */}
            {([...(variant.specTables || []), ...(family.specTables || []), ...(category.specTables || [])].length > 0) && (
              <div className="mt-16 space-y-10">
                <Reveal>
                  <h2 className="font-display uppercase text-2xl text-deep leading-tight tracking-tight">
                    {variant.name} Specifications:
                  </h2>
                  <div className="mt-2 h-[3px] w-20 bg-teal" />
                </Reveal>
                {[...(variant.specTables || []), ...(family.specTables || []), ...(category.specTables || [])].map((tbl, i) => (
                  <Reveal key={i} delay={i * 0.08}>
                    <div className="bg-white border border-teal-pale rounded-lg overflow-hidden shadow-sm">
                      {tbl.title && (
                        <div className="bg-deep px-6 py-4 border-b border-teal-pale">
                          <h3 className="font-display uppercase text-base sm:text-lg text-paper tracking-wide">
                            {tbl.title}
                          </h3>
                        </div>
                      )}
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[600px]">
                          <thead>
                            <tr className="bg-teal/10 border-b border-teal-pale">
                              {tbl.headers.map((h, hi) => (
                                <th key={hi} className="text-left px-4 sm:px-6 py-3.5 font-semibold text-deep uppercase tracking-wide text-xs whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {tbl.rows.map((row, ri) => (
                              <tr key={ri} className={`border-b border-teal-pale/60 last:border-b-0 ${ri % 2 ? "bg-teal-pale/20" : ""}`}>
                                {row.map((cell, ci) => (
                                  <td key={ci} className="px-4 sm:px-6 py-3.5 text-steel-dark align-top font-mono text-[12.5px] tracking-wide whitespace-pre-wrap">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}

            {/* ---- 4b. Sibling variant grades (other grades in same family) ---------- */}
            {siblingVariants.length > 0 && (
              <div className="mt-20">
                <Reveal className="mb-10">
                  <span className="text-xs uppercase tracking-[0.25em] text-teal font-semibold">
                    Other Grades in This Family
                  </span>
                  <h2 className="font-display uppercase text-2xl sm:text-3xl mt-3 text-deep leading-tight">
                    {family.name} Grades
                  </h2>
                  <div className="mt-2 h-[3px] w-20 bg-teal" />
                </Reveal>

                <div className="space-y-5">
                  {siblingVariants.map((v, i) => (
                    <Reveal key={v.name} delay={i * 0.05}>
                      <Link
                        to={`/products/${catSeoSlug(category.slug)}/${seoSlug(family.name)}/${seoSlug(v.name)}`}
                        className="group block bg-white border border-teal-pale rounded-lg p-6 sm:p-7 hover:border-teal hover:shadow-lg hover:shadow-teal/10 transition-all duration-300"
                      >
                        <div className="flex items-start gap-3">
                          <ChevronRight size={20} className="text-teal shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-display uppercase text-sm sm:text-base text-deep group-hover:text-teal transition-colors">
                              {v.name}
                            </h3>
                            <div className="mt-1 h-px w-16 bg-teal" />
                            {v.desc && (
                              <p className="mt-3 text-sm text-steel-dark leading-relaxed line-clamp-2">
                                {v.desc}
                              </p>
                            )}
                            {v.grades?.length > 0 && (
                              <div className="mt-4 flex flex-wrap gap-2">
                                {v.grades.slice(0, 6).map((g) => (
                                  <span
                                    key={g}
                                    className="inline-flex items-center clip-corner-sm bg-teal-pale/70 px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-teal"
                                  >
                                    {g}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <ArrowRight size={16} className="shrink-0 text-teal opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all mt-1" />
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}

            {/* ---- 5. EMAIL CTA LINE (info@siyaksteel.com...) -------- */}
            <Reveal className="mt-16">
              <div className="bg-gradient-to-r from-teal/5 via-teal/10 to-teal/5 border border-teal/30 rounded-lg px-6 sm:px-8 py-5 flex items-center gap-4 flex-wrap">
                <Mail size={20} className="text-teal shrink-0" />
                <div className="flex-1 text-sm sm:text-[15px] text-deep font-medium leading-relaxed">
                  Call us on the numbers given on Contact Us page OR Email us at{" "}
                  <a
                    href="mailto:info@siyaksteel.com"
                    className="text-teal font-bold underline underline-offset-2 hover:no-underline transition"
                  >
                    info@siyaksteel.com
                  </a>{" "}
                  for quick response
                </div>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 bg-teal hover:bg-teal-light text-white font-display uppercase text-xs tracking-wide px-5 py-3 rounded-sm clip-corner transition-colors shrink-0"
                >
                  Send an Enquiry <ArrowRight size={14} />
                </Link>
              </div>
            </Reveal>

            {/* ---- 6. EXPORT DESTINATIONS BLOCK — neonalloys exact format */}
            <Reveal className="mt-14">
              <div className="border-t border-gray-200 pt-10">
                <h3 className="font-display uppercase text-[13.5px] font-bold text-[#111] tracking-[0.05em] leading-snug">
                  EXPORT DESTINATIONS FOR {variant.name.toUpperCase()}, {family.name.toUpperCase()}, {category.grades?.slice(0,2).join(", ").toUpperCase()}
                </h3>
                <p className="mt-4 text-[14px] leading-[1.85] text-[#333]">
                  {EXPORT_COUNTRIES}
                </p>
                <p className="mt-5 text-[14px] leading-[1.85] text-[#333]">
                  Data from the UN, Singapore, Manama, Tehran, Pretoria, Mogadishu, Abu Dhabi, Douala, Freetown, Abidjan, Beirut, Dar es Salaam, Bethlehem, Harare, Byblos, Alexandria, Dakar, Aqaba, Giza, Bulawayo, Soweto, Kampala, Jeddah, Addis Ababa, Cairo, Port Harcourt, New York, Hong Kong, Sharm el-Sheikh, Mecca, Casablanca, Benin, Kano, Colombo, Antananarivo, Khartoum, Muscat, Subra al-Haymah, Ibadan, Kaduna, Luanda, Cape Town, Ouagadougou, Zaria, Mbuji-Mayi, Jerusalem, Yaoundé, Dubai, Kinshasa, Fez, Amman, Algiers, Tel Aviv, Cairo, Omdurman, Rabat, Riyadh, Kolwezi, Doha, Conakry, Dammam, Maputo, Tripoli, Brazzaville, Bamako, Port Elizabeth, Lubumbashi, Accra, Istanbul, Lagos, Nairobi, Lusaka, Durban, Maiduguri, Johannesburg.
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ---- 7. RELATED PRODUCTS (3 cols, at very bottom) ------- */}
        <div className="max-w-7xl px-6 mt-20">
          <Reveal>
            <h3 className="font-display uppercase text-2xl text-deep mb-6">
              Related Product Lines
            </h3>
            <div className="mt-2 h-[3px] w-20 bg-teal mb-8" />
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-6">
            {related.map((cat, i) => (
              <Reveal key={cat.slug} delay={i * 0.08}>
                <Link
                  to={`/products/${catSeoSlug(cat.slug)}`}
                  className="group block bg-white border border-teal-pale rounded-lg overflow-hidden hover:shadow-lg hover:shadow-teal/10 hover:-translate-y-1 transition-all duration-300"
                >
                  <ProductImage category={cat} />
                  <div className="p-5">
                    <h4 className="font-display uppercase text-base text-deep group-hover:text-teal transition-colors">
                      {cat.name}
                    </h4>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
