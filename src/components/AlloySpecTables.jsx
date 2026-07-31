/**
 * Chemical Composition, Standards & Equivalents, Key Features, and
 * Applications tables for a single-grade product page.
 *
 * Spec data is the product — treat it like a data product, not a table bolted
 * onto a hero. Apply the spec-label treatment so grades/elements/standard
 * numbers look authoritative and instantly scannable.
 */
export default function AlloySpecTables({ chem, standardsEquiv, name }) {
  const keyFeatures = [
    "High quality raw materials",
    "Precision manufacturing",
    "Corrosion resistance",
    "Excellent mechanical properties",
    "International standards compliance",
    "Custom sizes available",
  ];

  const hasChem = chem?.length > 0;
  const hasStandards = !!standardsEquiv;

  return (
    <div className="mt-8 space-y-5">

      {/* ── Chemical Composition ────────────────────────────────── */}
      {hasChem && (
        <div className="bg-white border border-teal-pale rounded-lg overflow-hidden shadow-rest">
          <div className="bg-deep px-5 py-3 flex items-center justify-between">
            <h3 className="font-display uppercase text-sm text-paper tracking-[0.15em]">
              Chemical Composition
            </h3>
            {name && (
              <span className="spec-label text-teal-light/80">{name}</span>
            )}
          </div>
          {/* Horizontal scroll on narrow viewports with fade affordance */}
          <div className="spec-table-scroll">
            <table className="w-full text-sm min-w-[320px]">
              <thead>
                <tr className="border-b border-teal-pale bg-teal-pale/30">
                  <th scope="col" className="spec-label text-left text-steel-dark px-5 py-2.5 w-2/5">
                    Element
                  </th>
                  <th scope="col" className="spec-label text-left text-steel-dark px-5 py-2.5">
                    Composition %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-pale">
                {chem.map((row, i) => (
                  <tr
                    key={row.el}
                    className={i % 2 === 0 ? "bg-white" : "bg-teal-pale/15"}
                  >
                    <th
                      scope="row"
                      className="font-mono font-semibold text-teal text-[12px] tracking-[0.12em] uppercase text-left px-5 py-2.5 w-2/5"
                    >
                      {row.el}
                    </th>
                    <td className="px-5 py-2.5 font-mono text-[12px] text-deep tabular-nums">
                      {row.pct}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Standards & Equivalents ────────────────────────────── */}
      {hasStandards && (
        <div className="bg-white border border-teal-pale rounded-lg overflow-hidden shadow-rest">
          <div className="bg-deep px-5 py-3">
            <h3 className="font-display uppercase text-sm text-paper tracking-[0.15em]">
              Standards &amp; Equivalents
            </h3>
          </div>
          <div className="spec-table-scroll">
            <table className="w-full text-sm min-w-[320px]">
              <tbody className="divide-y divide-teal-pale">
                {standardsEquiv.uns && (
                  <tr className="bg-white">
                    <th scope="row" className="spec-label text-left text-steel-dark px-5 py-3 w-2/5">
                      UNS No.
                    </th>
                    <td className="px-5 py-3 font-mono font-semibold text-teal text-[12px] tracking-[0.12em] uppercase">
                      {standardsEquiv.uns}
                    </td>
                  </tr>
                )}
                {standardsEquiv.wnr && (
                  <tr className="bg-teal-pale/15">
                    <th scope="row" className="spec-label text-left text-steel-dark px-5 py-3 w-2/5">
                      Werkstoff Nr.
                    </th>
                    <td className="px-5 py-3 font-mono font-semibold text-teal text-[12px] tracking-[0.12em] uppercase">
                      {standardsEquiv.wnr}
                    </td>
                  </tr>
                )}
                {standardsEquiv.trade && (
                  <tr className="bg-white">
                    <th scope="row" className="spec-label text-left text-steel-dark px-5 py-3 w-2/5">
                      Also Known As
                    </th>
                    <td className="px-5 py-3 text-[13px] text-steel-dark">
                      {standardsEquiv.trade}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Key Features ────────────────────────────────────────── */}
      <div className="bg-white border border-teal-pale rounded-lg overflow-hidden shadow-rest">
        <div className="bg-teal px-5 py-3">
          <h3 className="font-display uppercase text-sm text-white tracking-[0.15em]">
            Key Features
          </h3>
        </div>
        <div className="p-5">
          <div className="grid sm:grid-cols-2 gap-3">
            {keyFeatures.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                {/* Small teal square — industrial bullet, not consumer dot */}
                <span className="shrink-0 w-2 h-2 bg-teal clip-corner-sm" aria-hidden="true" />
                <span className="text-sm text-steel-dark">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
