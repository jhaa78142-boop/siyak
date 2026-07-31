import { useParams, Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import ProductImage from "../components/ProductImage";
import CategorySidebar from "../components/CategorySidebar";
import CTABand from "../components/CTABand";
import { productCategories } from "../data/products";
import SEO from "../components/SEO";
import { OrganizationLd, ProductLd, BreadcrumbLd, WebPageLd } from "../components/JsonLd";
import { absoluteUrl } from "../lib/site";
import { slugify, seoSlug, catSeoSlug } from "../lib/slugify";

// ------------------------------------------------------------------
// EXPORT DESTINATIONS — master list shared by every product page,
// mirrors the long country block that closes every neonalloys detail
// page (info@siyaksteel.com for quick response → EXPORT DESTINATIONS
// header → comma-separated country list). Replaces neonalloys email
// with Siyak branding, keeps the country set 1:1 point-to-point.
// ------------------------------------------------------------------
const EXPORT_COUNTRIES =
  "Canada, Azerbaijan, Kuwait, Morocco, Jordan, Italy, Australia, Chine, Uganda, London, Malaysia, Kazakhstan, Africa, Algeria, Mozambique, Israel, New Zealand, Turkey, Ethiopa, UAE, Colombia, Mexico, UK, Indonesia, Saudi Arabia, Democratic Republic of the Congo, Iraq, Houston, Venezuela, Sri Lanka, Nigeria, Russia, Peru, Egypt, Bahrain, Germany, Ghana, South Africa, Thailand (Bangkok), Argentina, Vietnam, Iran, Dubai, Brazil, Sudan, Trinidad and Tobago, Tunisia, United States, Angola, Cameroon.";

// ------------------------------------------------------------------
// GROUP-PANEL BUILDER — maps the 6 standard materialTypes (Nickel,
// Copper, Stainless, Duplex, Carbon, Alloy) into the classic 3 H2
// family panels that neonalloys renders on every pipes/flanges/
// fittings category page. If a category has a different number of
// types (e.g. Flanges = 4 types with no pair-grouping) we fall back
// to rendering each type as its own H2-grade block directly.
// ------------------------------------------------------------------
function buildGroupPanels(category) {
  const mt = category.materialTypes || [];

  // CASE A — 6 types arranged in the 3 canonical family pairs
  // (Nickel+Copper, Stainless+Duplex, Carbon+Alloy)
  if (mt.length >= 6 && /Pipes|Tubes|Flanges|Fittings|Sheets|Plates|Bars/.test(category.name)) {
    const [nickel, copper, stainless, duplex, carbon, alloy] = mt;
    return [
      {
        h2: `Nickel & Copper Alloy ${category.name}`,
        intro:
          "Adopting the highest industry standards, we manufacture finest range of nickel and copper alloy products. These items are fabricated from qualitative raw material as per global demand and ensure accurate precision. Available in wide range of technical specifications, our comprehensive range is highly acknowledged in Indian as well as overseas market for their attributes of high strength, excellent finish, and complete reliability in-services.",
        sections: [
          { h3: nickel.name.includes("Nickel") ? "Nickel Alloy" : nickel.name, body: nickel },
          { h3: copper.name.includes("Copper") ? "Copper Alloy" : copper.name, body: copper },
        ],
      },
      {
        h2: `Stainless & Duplex Steel ${category.name}`,
        intro:
          "Leveraging on our finest manufacturing unit and experienced work force, our company offers stainless and duplex steel products. High quality items are stainless because of a protective layer on their surfaces which reduces the rate of corrosion to almost negligible levels. Available in different grades and dimensions, these are widely used in various industries such as construction, cement, petrochemical and more.",
        sections: [
          { h3: stainless.name.includes("Stainless") ? "Stainless Steel" : stainless.name, body: stainless },
          { h3: duplex.name.includes("Duplex") ? "Duplex Steel" : duplex.name, body: duplex },
        ],
      },
      {
        h2: `Carbon & Alloy Steel ${category.name}`,
        intro:
          "We are one of the most trusted manufacturers for offering finest range of Carbon and Alloy Steel products. Used in different industries for diverse applications, these can be availed in standard as well as customized dimensions as per the requirement of the clients. These are appreciated for their sturdy and precise construction. We are known for offering our product range at reasonable prices and delivering consignment within given time frame.",
        sections: [
          { h3: carbon.name.includes("Carbon") ? "Carbon Steel" : carbon.name, body: carbon },
          { h3: alloy.name.includes("Alloy") ? "Alloy Steel" : alloy.name, body: alloy },
        ],
      },
    ];
  }

  // CASE B — 4 types (typical Flanges / Buttweld / Socketweld layout):
  // High Nickel → Stainless → Carbon → Alloy, each as its own H2 block
  if (mt.length === 4) {
    return mt.map((t) => ({
      h2: t.name,
      intro: "",
      sections: [{ h3: t.name, body: t }],
    }));
  }

  // CASE C — anything else: just render each materialType as a section
  return mt.map((t) => ({
    h2: t.name,
    intro: "",
    sections: [{ h3: t.name, body: t }],
  }));
}

// ------------------------------------------------------------------
// GRADE-BLOB EXTRACTOR — pulls the "grades list" text out of a type
// object. Tries (a) H3 grade blurb captured from scrape, (b) mt.grades
// array, and (c) falls back to standards list so nothing ever shows
// empty on categories that haven't had their grade paragraph hand-
// edited yet.
// ------------------------------------------------------------------
function gradeBlurb(type) {
  if (type.gradeText) return type.gradeText;
  if (type.grades?.length) return type.grades.join(", ");
  if (type.standards?.length) return type.standards.join(", ");
  return "";
}

export default function ProductDetail() {
  const { slug } = useParams();
  const category = productCategories.find((c) => slug.startsWith(c.slug));

  if (!category) return <Navigate to="/products" replace />;

  const related = productCategories.filter((c) => c.slug !== slug).slice(0, 3);
  const groupPanels = buildGroupPanels(category);

  return (
    <>
      <SEO
        title={category.name}
        description={`${category.short} Available in ${category.grades.join(", ")}, meeting standards ${category.standards.join(", ")}. Request a quote today.`}
        keywords={`${category.slug}, ${category.name.toLowerCase()}, ${category.grades.join(", ").toLowerCase()}, industrial ${category.name.toLowerCase()}`}
        type="product"
      />
      <OrganizationLd />
      <WebPageLd
        url={absoluteUrl(`/products/${catSeoSlug(category.slug)}`)}
        title={category.name}
        description={`${category.short} Available in ${category.grades.join(", ")}, meeting standards ${category.standards.join(", ")}. Request a quote today.`}
      />
      <ProductLd product={category} />
      <BreadcrumbLd
        items={[
          { name: "Home", url: absoluteUrl("/") },
          { name: "Products", url: absoluteUrl("/products") },
          { name: category.name, url: absoluteUrl(`/products/${catSeoSlug(category.slug)}`) },
        ]}
      />
      <PageHero eyebrow="Product Line" title={category.name} crumb={category.name} />

      {/* NEONALLOYS STYLE BREADCRUMB STRIP — "You are here: Products /" */}
      <section className="bg-paper border-b border-teal-pale/50">
        <div className="max-w-7xl px-6 py-3 text-xs">
          <span className="text-steel-dark">You are here:&nbsp;&nbsp;</span>
          <Link to="/products" className="text-teal hover:underline font-medium">
            Products
          </Link>
          <span className="text-steel-dark mx-2">/</span>
          <span className="text-deep font-semibold">{category.name}</span>
        </div>
      </section>

      {/* MAIN 2-COLUMN LAYOUT — left sidebar nav + right document area */}
      <section className="bg-paper py-10">
        <div className="max-w-7xl px-6 grid lg:grid-cols-[260px_1fr] gap-10">
          {/* =============================================================
              LEFT SIDEBAR — mirrors neonalloys 2-widget sidebar layout:
              (1) Category-level nav box with all Types + nested Variants,
              (2) "Product Range" nav box listing every core 14 categories.
              ============================================================= */}
          <aside className="space-y-6">
            <CategorySidebar category={category} />
          </aside>

          {/* =============================================================
              MAIN DOCUMENT COLUMN — point-to-point neonalloys structure:
              1. H1 + short
              2. RANGE / FORM spec block
              3. 3 family-group H2 panels with H3 grade subsections
              4. Spec tables (if any)
              5. Email CTA line
              6. EXPORT DESTINATIONS country list
              7. Clickable material-type cards
              8. Related products (3-column)
              ============================================================= */}
          <div>
            {/* ---- 1. H1 HEADER + SHORT DESCRIPTION ------------------ */}
            <Reveal>
              <h1 className="font-display uppercase text-3xl md:text-4xl text-deep leading-tight tracking-tight">
                {category.name}
              </h1>
              <div className="mt-2 h-[3px] w-24 bg-teal" />
              <p className="mt-5 text-[15px] leading-relaxed text-[#333]">
                {category.short}
              </p>
            </Reveal>

            {/* ---- 2. RANGE / FORM / GRADES SPEC BLOCK (+ hero photo) - */}
            <Reveal className="mt-10">
              <h1 className="font-display uppercase text-2xl md:text-3xl text-deep leading-tight">
                {category.name}
              </h1>
              <div className="mt-2 h-[3px] w-20 bg-teal" />

              <div className={`mt-6 grid gap-8 ${category.image ? "md:grid-cols-[1fr_1.1fr]" : ""}`}>
                {category.image && (
                  <ProductImage
                    category={category}
                    className="rounded-lg shadow-xl shadow-deep/10"
                    aspect="aspect-[4/3]"
                  />
                )}

                <div>
                  <div className="bg-gradient-to-r from-deep to-deep/95 border border-teal-pale rounded-lg px-6 py-5 text-paper">
                    <div className="flex flex-col gap-4 font-mono text-[12.5px] tracking-[0.06em]">
                      {category.sizes && (
                        <div className="flex items-baseline gap-3">
                          <span className="font-display uppercase text-teal font-bold text-sm tracking-[0.15em]">
                            RANGE
                          </span>
                          <span className="text-paper font-bold leading-relaxed">{category.sizes}</span>
                        </div>
                      )}
                      {category.form && (
                        <div className="flex items-baseline gap-3">
                          <span className="font-display uppercase text-teal font-bold text-sm tracking-[0.15em]">
                            FORM
                          </span>
                          <span className="text-paper font-bold leading-relaxed">{category.form}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {groupPanels.length > 0 && (
                    <ul className="mt-5 space-y-2">
                      {groupPanels.map((gp) => (
                        <li key={gp.h2} className="flex items-start gap-2.5 text-[14.5px] text-[#333]">
                          <span className="mt-2 w-1.5 h-1.5 rounded-full bg-teal shrink-0" />
                          <span>{gp.h2.replace(category.name, "").trim() || gp.h2}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </Reveal>

            {/* ---- 2b. TYPES OF [PRODUCT] — mirrors neon alloys "» TYPES OF PIPE FITTINGS" block */}
            {category.items?.length > 0 && (
              <Reveal className="mt-10">
                <div>
                  <h2 className="font-display uppercase text-xl md:text-2xl text-deep leading-tight tracking-tight flex items-center gap-2">
                    <span className="text-teal font-black">»</span>
                    TYPES OF {category.name.toUpperCase()}
                  </h2>
                  <div className="mt-2 h-[3px] w-20 bg-teal" />
                  <p className="mt-4 text-[14.5px] leading-relaxed text-[#333]">
                    {category.items.join(", ")}
                  </p>
                </div>
              </Reveal>
            )}

            {/* ---- 3. NEON ALLOYS STYLE SECTION PANELS ------------------ */}
            {/* Each section uses the exact "» HEADING" prefix format with a teal
                underline and the verbatim grade / spec text below it, mirroring
                the neonalloys detail page structure exactly. */}
            <div className="mt-14 space-y-0">
              {groupPanels.map((gp, gi) => (
                <Reveal key={gp.h2} delay={gi * 0.05}>
                  {/* Family intro paragraph (Nickel & Copper / Stainless & Duplex / Carbon & Alloy) */}
                  {gp.intro && (
                    <div className="mb-10">
                      <h2 className="font-display uppercase text-xl md:text-2xl text-deep leading-tight tracking-tight flex items-center gap-2">
                        <span className="text-teal font-black">»</span>
                        {gp.h2}
                      </h2>
                      <div className="mt-2 h-[3px] w-20 bg-teal" />
                      <p className="mt-5 text-[15px] leading-relaxed text-[#333]">
                        {gp.intro}
                      </p>
                    </div>
                  )}

                  {/* Individual material type sections */}
                  {gp.sections.map((s) => (
                    <div key={s.h3} className="mb-10">
                      <h3 className="font-display uppercase text-lg md:text-xl text-deep leading-tight tracking-tight flex items-center gap-2">
                        <span className="text-teal font-black">»</span>
                        {s.h3}
                      </h3>
                      <div className="mt-2 h-[2px] w-16 bg-teal/60" />
                      <p className="mt-4 text-[13.5px] leading-relaxed text-[#333] tracking-wide whitespace-pre-wrap">
                        {gradeBlurb(s.body) ||
                          (s.body.grades ? s.body.grades.join(", ") : "") ||
                          (s.body.desc ? s.body.desc.slice(0, 300) : "")}
                      </p>
                    </div>
                  ))}
                </Reveal>
              ))}
            </div>

            {/* ---- SPECIFICATION TABLES (1:1 neonalloys dark-header) -- */}
            {category.specTables?.length > 0 && (
              <div className="mt-16 space-y-10">
                <Reveal>
                  <h2 className="font-display uppercase text-2xl text-deep leading-tight tracking-tight">
                    {category.name} Specifications:
                  </h2>
                  <div className="mt-2 h-[3px] w-20 bg-teal" />
                </Reveal>
                {category.specTables.map((tbl, i) => (
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
                                <th
                                  key={hi}
                                  className="text-left px-4 sm:px-6 py-3.5 font-semibold text-deep uppercase tracking-wide text-xs whitespace-nowrap"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {tbl.rows.map((row, ri) => (
                              <tr
                                key={ri}
                                className={`border-b border-teal-pale/60 last:border-b-0 ${ri % 2 ? "bg-teal-pale/20" : ""}`}
                              >
                                {row.map((cell, ci) => (
                                  <td
                                    key={ci}
                                    className="px-4 sm:px-6 py-3.5 text-steel-dark align-top font-mono text-[12.5px] tracking-wide whitespace-pre-wrap"
                                  >
                                    {cell}
                                  </td>
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
                  EXPORT DESTINATIONS FOR {category.name.toUpperCase()}, {category.grades?.slice(0,3).join(", ").toUpperCase()} {category.name.toUpperCase()}
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

        {/* ---- 8. RELATED PRODUCTS (3 cols, at very bottom) ------- */}
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
