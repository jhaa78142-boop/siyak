import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import PageHero from "../components/PageHero";
import SEO from "../components/SEO";
import { OrganizationLd, BreadcrumbLd, WebPageLd } from "../components/JsonLd";
import { absoluteUrl } from "../lib/site";
import { hsCodesMeta, hsChapters } from "../data/hsCodes";
import { productCategories } from "../data/products";
import { catSeoSlug } from "../lib/slugify";
import CTABand from "../components/CTABand";

// Flat index of every row for search
const ALL_ROWS = hsChapters.flatMap((ch) => [[ch.code, ch.description], ...ch.codes]);

// Sidebar navigation data — mirroring neonalloys exactly
const ABOUT_LINKS = [
  { label: "About Us", to: "/about" },
  { label: "Quality Policy", to: "/quality-policy" },
  { label: "Certificate", to: "/certificate" },
  { label: "Contact Us", to: "/contact" },
];

export default function HSCodes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const chapterParam = searchParams.get("h");
  const activeChapter = hsChapters.find((c) => c.code === chapterParam) || null;

  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");

  const runSearch = () => setQuery(queryInput.trim());

  const openChapter = (code) => {
    setQuery("");
    setQueryInput("");
    setSearchParams(code ? { h: code } : {});
  };

  const rows = useMemo(() => {
    if (query) {
      const q = query.toLowerCase();
      return ALL_ROWS.filter(
        ([code, desc]) => code.toLowerCase().includes(q) || desc.toLowerCase().includes(q),
      );
    }
    if (activeChapter) {
      return [[activeChapter.code, activeChapter.description], ...activeChapter.codes];
    }
    return hsChapters.map((ch) => [ch.code, ch.description]);
  }, [activeChapter, query]);

  return (
    <>
      <SEO
        title="HS Codes — Commodity Classification"
        description="HS Codes for industrial metals: Iron & Steel (72), Articles of Iron/Steel (73), Copper (74), Nickel (75), Aluminium (76). Complete commodity chapter & subheading codes."
        keywords="hs codes, hsn code, commodity classification, iron steel hs code, copper hs code, nickel hs code, aluminium hs code, export hsn code"
      />
      <OrganizationLd />
      <WebPageLd
        url={absoluteUrl("/hs-codes")}
        title="HS Codes — Commodity Classification"
        description="HS Codes for industrial metals: Iron & Steel (72), Articles of Iron/Steel (73), Copper (74), Nickel (75), Aluminium (76)."
      />
      <BreadcrumbLd
        items={[
          { name: "Home", url: absoluteUrl("/") },
          { name: "HS Codes", url: absoluteUrl("/hs-codes") },
        ]}
      />

      <PageHero
        eyebrow="Commodity Classification"
        title={hsCodesMeta.title}
        crumb="HS Codes"
      />

      <section className="bg-paper py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[220px_1fr] gap-8 items-start">

            {/* ===================== LEFT SIDEBAR — exact neonalloys layout ===================== */}
            <aside className="space-y-6">
              {/* ABOUT SIYAK STEEL */}
              <div>
                <h3 className="font-display uppercase text-sm font-bold text-teal tracking-[0.12em] mb-3">
                  ABOUT SIYAK STEEL
                </h3>
                <ul className="space-y-0">
                  {ABOUT_LINKS.map((link) => (
                    <li key={link.to} className="border-b border-[#e8e8e8]">
                      <Link
                        to={link.to}
                        className="flex items-center gap-2 py-2.5 text-[13.5px] text-[#444] hover:text-teal transition-colors"
                      >
                        <ChevronRight size={12} className="text-teal shrink-0" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-[#ddd]" />

              {/* PRODUCT RANGE */}
              <div>
                <h3 className="font-display uppercase text-sm font-bold text-teal tracking-[0.12em] mb-3">
                  PRODUCT RANGE
                </h3>
                <ul className="space-y-0">
                  {productCategories.map((cat) => (
                    <li key={cat.slug} className="border-b border-[#e8e8e8]">
                      <Link
                        to={`/products/${catSeoSlug(cat.slug)}`}
                        className="flex items-center gap-2 py-2.5 text-[13.5px] text-[#444] hover:text-teal transition-colors"
                      >
                        <ChevronRight size={12} className="text-teal shrink-0" />
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* ===================== MAIN CONTENT COLUMN ===================== */}
            <div>
              {/* "HS CODE" heading with green underline — exact neonalloys style */}
              <h2 className="font-display uppercase text-xl font-bold text-[#222] tracking-wide mb-1">
                HS CODE
              </h2>
              <div className="h-[3px] w-16 bg-teal mb-6" />

              {/* Search bar */}
              <div className="mb-5 flex flex-col sm:flex-row gap-0">
                <input
                  type="search"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && runSearch()}
                  placeholder="Enter HS Code or Keyword"
                  className="flex-1 h-11 px-4 border border-[#ccc] bg-white text-sm text-[#333] placeholder:text-[#999] focus:outline-none focus:border-teal"
                />
                <button
                  type="button"
                  onClick={runSearch}
                  className="h-11 px-7 uppercase text-sm font-bold tracking-wide bg-[#69c146] hover:bg-[#5cab3c] text-white transition-colors shrink-0"
                >
                  SEARCH
                </button>
              </div>

              {/* Back link */}
              {(activeChapter || query) && (
                <button
                  type="button"
                  onClick={() => openChapter(null)}
                  className="mb-4 inline-flex items-center gap-1 text-sm text-teal hover:underline"
                >
                  <ChevronLeft size={14} />
                  All HS Codes
                </button>
              )}

              {/* Table — exact neonalloys teal header, alternating rows */}
              <div className="border border-[#ddd] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#278a9b] text-white">
                        {hsCodesMeta.headers.map((h) => (
                          <th
                            key={h}
                            className="px-5 py-3.5 text-[13px] font-bold uppercase tracking-wide whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={hsCodesMeta.headers.length}
                            className="px-5 py-12 text-center text-[#999] text-sm"
                          >
                            No entries match your search.
                          </td>
                        </tr>
                      ) : (
                        rows.map(([code, desc], idx) => {
                          const isTopLevelChapterLink = code.length === 2 && !activeChapter && !query;
                          const rowBg = idx % 2 === 0 ? "bg-white" : "bg-[#eef3f7]";

                          const codeCell = (
                            <td className="px-5 py-3 text-[13px] font-bold whitespace-nowrap border-t border-[#e5e5e5] text-[#69c146]">
                              {code}
                            </td>
                          );
                          const descCell = (
                            <td className="px-5 py-3 text-[13px] border-t border-[#e5e5e5] text-[#333] uppercase leading-relaxed">
                              {desc === "#N/A" ? (
                                <span className="text-[#999] italic text-xs normal-case">Not Applicable</span>
                              ) : (
                                desc
                              )}
                            </td>
                          );

                          if (isTopLevelChapterLink) {
                            return (
                              <tr
                                key={`${code}-${idx}`}
                                onClick={() => openChapter(code)}
                                className={`${rowBg} cursor-pointer hover:bg-[#e3ecf1] transition-colors`}
                              >
                                {codeCell}
                                {descCell}
                              </tr>
                            );
                          }

                          return (
                            <tr key={`${code}-${idx}`} className={`${rowBg} hover:bg-[#e3ecf1] transition-colors`}>
                              {codeCell}
                              {descCell}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CTABand />
    </>
  );
}
