/**
 * NeonAlloysBook.jsx — recreation of neonalloys.com/nickel-products.php
 *
 * Closed state : one full-width dark cover (image + floating product-name
 *                labels + green "Click here for more details" bar) laid
 *                as an absolutely-positioned overlay ON TOP of the trifold.
 * Open state   : the cover fades/tilts away (bounded 3D tilt, never swings
 *                outside its own box — no more edge-bleed/overflow glitches)
 *                revealing the always-present 3-column table underneath:
 *                NICKEL/MONEL/HASTELLOY | INCONEL/ALLOY/CUPRO-NICKEL |
 *                TITANIUM/NICKEL ALLOYS, plus Siyak contact info bottom-right.
 * Click product : modal popup with chemical composition, key properties,
 *                 standards & specs.
 *
 * Note: the previous version rotated the cover and right flap a full 180°
 * with transform-origin on their own edge. That swings the rotated plane
 * OUTSIDE the flex container by a full panel-width on each side, which
 * overflowed the page on real viewports (the bug reported: only a sliver of
 * each flap visible at the far edges of the window). This version keeps
 * every element's rendered footprint inside its own box at all times.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import coverBg from "../assets/hero-bg/book-cover-steel-pipe.webp";
import siyakLogo from "../assets/siyak-logo-dark.png";

/* ══════════════════════════════════════════════════════════
   ALL PRODUCT DATA  (from neonalloys.com HTML source)
══════════════════════════════════════════════════════════ */
const PRODUCTS = {
  "Nickel 200": {
    desc: "Commercially pure (99.6%) wrought nickel with good mechanical properties and resistance to a range of corrosive media. Good thermal, electrical and magnetostrictive properties. Used for variety of processing equipment, particularly to maintain product purity in handling foods, synthetic fibers and alkalies. Standard product forms are round, flats, pipe, tube, plate, forging stock, strip and wire.",
    chem: [["Ni","99.00% min"],["Cu","0.25% max"],["Fe","0.40% max"],["Mn","0.35% max"],["C","0.15% max"],["Si","0.35% max"],["S","0.01% max"]],
    props: ["Tensile strength: 55.00–75.00","Yield strength: 12.00–30.00","Elongation: 60.00–40.00%","Hardness: 70.00"],
    standards: "UNS N02200  BS 3072-3076 (Na11)  ASTM B 160 B 163\nB 725 B730 ASME SB. 160-SB. 163\nBoiler Code Sections III, VIII, IX",
    specs: "DIN 17740, 17750-17754\nWerkstoff Nr. 2.4060 / 2.4066",
  },
  "Nickel 201": {
    desc: "Commercially pure (99.6%) wrought nickel essentially the same as Nickel 200 but with a lower carbon content to prevent embrittlement by intergranular carbon at temperatures over 600°F (315°C). Lower carbon content also reduces hardness — Nickel 201 particularly suitable for cold-formed items. Standard product forms are round, flats, pipe, tube, plate, sheet, forging stock, strip and wire.",
    chem: [["Ni","99.00% min"],["Cu","0.25% max"],["Fe","0.40% max"],["Mn","0.35% max"],["C","0.02% max"],["Si","0.35% max"],["S","0.01% max"]],
    props: ["Tensile strength: 50.00–70.00","Yield strength: 10.00–28.00","Elongation: 60.00–40.00%","Hardness: 62.00"],
    standards: "UNS N02201\nBS 3072-3076 (Na12)  ASTM B 160 B 163\nB 725, B730 ASME SB. 160-SB. 163\nBoiler Code Sections III, VIII, IX",
    specs: "DIN 17740, 17750-17754\nWerkstoff Nr. 2.4061, 2.4068\nVdTüV 345",
  },
  "Monel- 400": {
    desc: "A nickel-copper alloy with high strength and excellent corrosion resistance in a range of media including sea water, hydrofluoric acid, chemical and hydrocarbon processing equipment, valves, pumps, shafts, fittings, fasteners and heat exchangers. Standard product forms are round, hexagon, flats, forging stock, pipe, tube, plate, sheet, strip and wire.",
    chem: [["Ni","63.00% min"],["Cu","28.00–34.00%"],["Al","2.5 max"],["Fe","2.50% max"],["Mn","2.00% max"],["C","0.30% max"],["S","0.02% max"],["Si","0.50% max"]],
    props: ["Tensile strength: 75.00–85.00","Yield strength: 25.00–45.00","Elongation: 50.00–35.00%","Hardness: 75.00"],
    standards: "UNS NO4400  MIL-T-1368\nBS 3072-3076 (NA 13)\nASTM B  Boiler Code Sections III, IV, VIII, IX\nNACE MR-01-75",
    specs: "MONEL IS REGISTERED TRADEMARK OF SPECIAL METAL LTD.\nMIL-T-23520\nWerkstoff Nr. 2.4360, 2.4361\nQQ-N-281",
  },
  "Monel-K 500": {
    desc: "Corrosion-hardenable nickel-copper alloy that combines the corrosion resistance of Monel alloy 400 with greater hardness. It also has low permeability and is non-magnetic. Used for pump shafts, valves, instruments, doctor blades and scrapers, trim, fasteners and marine propeller shafts. Product forms are round, hexagon, flats, forging stock, tube, plate, sheet, strip and wire.",
    chem: [["Ni","63.00% min"],["Cu","27.00–33.00%"],["Al","2.30–3.15%"],["Ti","0.35–0.85%"],["Fe","2.00% max"],["C","0.25% max"],["Mn","1.50% max"],["S","0.01% max"],["Si","0.50% max"]],
    props: ["Tensile strength: 90.00–110.00","Yield strength: 40.00–65.00","Elongation: 45.00–25.00%","Hardness: N/A"],
    standards: "UNS N05500\nASTM B865\nMIL-N-24549",
    specs: "Werkstoff Nr. 2.4375",
  },
  "Hastelloy C-276": {
    desc: "Nickel-molybdenum-chromium superalloy with an addition of tungsten designed to have exceptional corrosion resistance in a wide range of severe environments. One of the most versatile corrosion-resistant alloys available, outstanding resistance to pitting, crevice corrosion and stress-corrosion cracking.",
    chem: [["Ni","Balance"],["Mo","15.0–17.0%"],["Cr","14.5–16.5%"],["Fe","4.0–7.0%"],["W","3.0–4.5%"],["Co","2.5% max"],["Mn","1.0% max"],["C","0.01% max"]],
    props: ["Tensile strength: 100.00–115.00 ksi","Yield strength: 41.00–52.00 ksi","Elongation: 40.00–50.00%","Hardness: 90 HRB"],
    standards: "UNS N10276\nASTM B574 / B619 / B622 / B626 / B575",
    specs: "Werkstoff Nr. 2.4819\nEN: NiMo16Cr15W",
  },
  "Hastelloy C-22": {
    desc: "Nickel-chromium-molybdenum-tungsten alloy with better overall corrosion resistance than C-276, particularly resistant to pitting, crevice corrosion and stress-corrosion cracking in oxidizing environments while maintaining resistance in reducing environments.",
    chem: [["Ni","Balance"],["Cr","20.0–22.5%"],["Mo","12.5–14.5%"],["Fe","2.0–6.0%"],["W","2.5–3.5%"],["Co","2.5% max"],["Mn","0.50% max"],["C","0.015% max"]],
    props: ["Tensile strength: 100.00 ksi","Yield strength: 45.00 ksi","Elongation: 45.00%","Hardness: 93 HRB"],
    standards: "UNS N06022\nASTM B574 / B619 / B622 / B626 / B575",
    specs: "Werkstoff Nr. 2.4602\nEN: NiCr21Mo14W",
  },
  "Inconel 600": {
    desc: "Standard engineering material for applications requiring resistance to corrosion and heat. Excellent mechanical properties with desirable combination of high strength and good workability. Used in chemical processing, food processing and nuclear reactor applications.",
    chem: [["Ni","72.00% min"],["Cr","14.0–17.0%"],["Fe","6.0–10.0%"],["Mn","1.0% max"],["Cu","0.5% max"],["C","0.15% max"],["Si","0.5% max"],["S","0.015% max"]],
    props: ["Tensile strength: 80.00–100.00 ksi","Yield strength: 30.00–50.00 ksi","Elongation: 35.00–55.00%","Hardness: 75 HRB"],
    standards: "UNS N06600\nASTM B163 / B167 / B168 / B517 / B564",
    specs: "Werkstoff Nr. 2.4816\nEN: NiCr15Fe",
  },
  "Inconel 601": {
    desc: "A nickel-chromium alloy with an addition of aluminium for outstanding resistance to oxidation and other forms of high-temperature corrosion. The alloy also has useful strength at high temperatures. Used in heat treating equipment, thermal processing, gas turbines and power generation.",
    chem: [["Ni","58.0–63.0%"],["Cr","21.0–25.0%"],["Al","1.0–1.7%"],["Fe","Balance"],["C","0.10% max"],["Mn","1.0% max"],["Si","0.5% max"],["Cu","1.0% max"]],
    props: ["Tensile strength: 80.00–115.00 ksi","Yield strength: 30.00–55.00 ksi","Elongation: 30.00–55.00%","Hardness: 85 HRB"],
    standards: "UNS N06601\nASTM B163 / B167 / B168",
    specs: "Werkstoff Nr. 2.4851\nEN: NiCr23Fe",
  },
  "Inconel 625": {
    desc: "A nickel-chromium-molybdenum alloy with excellent fatigue strength and stress-corrosion cracking resistance to chloride ions. Resists a wide range of severely corrosive environments and is especially resistant to pitting and crevice corrosion. Used in chemical processing, aerospace, marine engineering, pollution-control equipment and nuclear reactors.",
    chem: [["Ni","58.0% min"],["Cr","20.0–23.0%"],["Mo","8.0–10.0%"],["Nb+Ta","3.15–4.15%"],["Fe","5.0% max"],["Al","0.40% max"],["Ti","0.40% max"],["C","0.10% max"]],
    props: ["Tensile strength: 120.00–150.00 ksi","Yield strength: 60.00–110.00 ksi","Elongation: 30.00–55.00%","Hardness: 96 HRB"],
    standards: "UNS N06625\nASTM B443 / B444 / B446 / B564",
    specs: "Werkstoff Nr. 2.4856\nEN: NiCr22Mo9Nb",
  },
  "Inconel 800": {
    desc: "A nickel-iron-chromium alloy with good strength and resistance to oxidation and carburization in high-temperature atmospheres through 1100°F (593°C). Used in petrochemical furnace cracker tubes, heat exchangers and other high-temperature processing equipment.",
    chem: [["Ni","30.0–35.0%"],["Cr","19.0–23.0%"],["Fe","Balance"],["Al","0.15–0.60%"],["Ti","0.15–0.60%"],["C","0.10% max"],["Mn","1.5% max"],["Cu","0.75% max"]],
    props: ["Tensile strength: 65.00–100.00 ksi","Yield strength: 25.00–50.00 ksi","Elongation: 30.00–60.00%","Hardness: 75 HRB"],
    standards: "UNS N08800\nASTM B163 / B407 / B408 / B409 / B514 / B515 / B564",
    specs: "Werkstoff Nr. 1.4876\nEN: X10NiCrAlTi32-21",
  },
  "Inconel 825": {
    desc: "A nickel-iron-chromium alloy with additions of molybdenum, copper and titanium providing exceptional resistance to both reducing and oxidizing acids, stress-corrosion cracking and localized attack. Applications include chemical processing, pollution control, oil and gas recovery and acid production.",
    chem: [["Ni","38.0–46.0%"],["Cr","19.5–23.5%"],["Fe","Balance"],["Mo","2.5–3.5%"],["Cu","1.5–3.0%"],["Ti","0.6–1.2%"],["C","0.05% max"],["Al","0.2% max"]],
    props: ["Tensile strength: 85.00–100.00 ksi","Yield strength: 35.00–45.00 ksi","Elongation: 30.00–50.00%","Hardness: 85 HRB"],
    standards: "UNS N08825\nASTM B163 / B423 / B424 / B425 / B514 / B515 / B564",
    specs: "Werkstoff Nr. 2.4858\nEN: NiCr21Mo",
  },
  "Inconel 800 HT": {
    desc: "A version of Alloy 800 with higher levels of aluminum and titanium to improve elevated-temperature properties. Especially recommended for use at temperatures above 1000°F (540°C) where resistance to creep and stress-rupture is required in addition to oxidation and carburization resistance.",
    chem: [["Ni","30.0–35.0%"],["Cr","19.0–23.0%"],["Fe","Balance"],["Al+Ti","0.85–1.20%"],["C","0.06–0.10%"],["Mn","1.5% max"],["Cu","0.75% max"],["Si","1.0% max"]],
    props: ["Tensile strength: 65.00–100.00 ksi","Yield strength: 25.00–45.00 ksi","Elongation: 25.00–55.00%","Hardness: 80 HRB"],
    standards: "UNS N08811\nASTM B163 / B407 / B408 / B409 / B514 / B515",
    specs: "Werkstoff Nr. 1.4876-HT\nEN: X8NiCrAlTi32-21",
  },
  "Alloy-904L": {
    desc: "A low-carbon, high-alloy austenitic stainless steel that resists corrosion by dilute sulphuric acid and many chloride-containing solutions. Especially suitable for sulphuric acid at various concentrations and temperatures. Used in chemical processing, petrochemical and pollution control applications.",
    chem: [["Ni","23.0–28.0%"],["Cr","19.0–23.0%"],["Mo","4.0–5.0%"],["Cu","1.0–2.0%"],["Fe","Balance"],["Mn","2.0% max"],["C","0.02% max"],["N","0.10% max"]],
    props: ["Tensile strength: 71.00 ksi","Yield strength: 32.00 ksi","Elongation: 35.00%","Hardness: 70 HRB"],
    standards: "UNS N08904\nASTM A240 / A479 / A182",
    specs: "Werkstoff Nr. 1.4539\nEN: X1NiCrMoCu25-20-5",
  },
  "Alloy-20": {
    desc: "Carpenter 20 is an austenitic stainless steel possessing excellent resistance to hot sulfuric acid and many other aggressive environments which would readily attack type 316 stainless steel. Used in chemical, pharmaceutical and food processing industries.",
    chem: [["Ni","32.0–38.0%"],["Cr","19.0–21.0%"],["Mo","2.0–3.0%"],["Cu","3.0–4.0%"],["Fe","Balance"],["Cb+Ta","8×C–1.0%"],["C","0.07% max"],["Mn","2.0% max"]],
    props: ["Tensile strength: 80.00 ksi","Yield strength: 35.00 ksi","Elongation: 30.00%","Hardness: 80 HRB"],
    standards: "UNS N08020\nASTM B473 / B462 / B463 / B464 / B465 / B472",
    specs: "Werkstoff Nr. 2.4660",
  },
  "Cupro-Nickel (90/10)": {
    desc: "Copper-nickel alloy with 10% nickel. Good resistance to corrosion by seawater, stress-corrosion cracking, impingement corrosion and biofouling. Widely used in marine, offshore and coastal installations, condensers, heat exchangers, evaporators and distillation equipment.",
    chem: [["Cu","Balance"],["Ni","9.0–11.0%"],["Fe","1.0–1.8%"],["Mn","0.5–1.0%"],["Pb","0.02% max"],["Zn","0.5% max"],["C","0.05% max"],["S","0.02% max"]],
    props: ["Tensile strength: 38.00–42.00 ksi","Yield strength: 15.00–18.00 ksi","Elongation: 30.00–40.00%","Hardness: 55 HRB"],
    standards: "UNS C70600\nASTM B111 / B171 / B359 / B395 / B466 / B467",
    specs: "Werkstoff Nr. 2.0872\nEN: CuNi10Fe1Mn",
  },
  "Cupro-Nickel (70/30)": {
    desc: "Copper-nickel alloy with 30% nickel. Higher nickel content provides greater strength and corrosion resistance than 90/10, particularly for high-velocity seawater, elevated temperatures and brackish water. Suitable for condenser tubing, heat exchangers and desalination plants.",
    chem: [["Cu","Balance"],["Ni","29.0–33.0%"],["Fe","0.4–0.7%"],["Mn","1.0% max"],["Pb","0.02% max"],["Zn","0.5% max"],["C","0.05% max"],["S","0.02% max"]],
    props: ["Tensile strength: 52.00–62.00 ksi","Yield strength: 20.00–28.00 ksi","Elongation: 30.00–40.00%","Hardness: 72 HRB"],
    standards: "UNS C71500\nASTM B111 / B171 / B359 / B395 / B466 / B467",
    specs: "Werkstoff Nr. 2.0882\nEN: CuNi30Mn1Fe",
  },
  "Titanium Grade1": {
    desc: "Commercially pure titanium — lowest strength, highest ductility. Excellent corrosion resistance in oxidizing, reducing and neutral media. Used in chemical processing, chlorine and chloride-containing environments, seawater systems and medical implants.",
    chem: [["Ti","Balance"],["O","0.18% max"],["N","0.03% max"],["C","0.08% max"],["H","0.015% max"],["Fe","0.20% max"]],
    props: ["Tensile strength: 35.00 ksi","Yield strength: 25.00 ksi","Elongation: 24.00%","Hardness: 70 HB"],
    standards: "UNS R50250\nASTM B265 / B337 / B338 / B348 / B367",
    specs: "Werkstoff Nr. 3.7025\nEN: Ti 99.8",
  },
  "Titanium Grade2": {
    desc: "Commercially pure titanium with slightly higher strength than Grade 1. The standard grade for most applications. Excellent formability, weldability and resistance to corrosion. Used in chemical processing, marine, aerospace, medical and offshore applications.",
    chem: [["Ti","Balance"],["O","0.25% max"],["N","0.03% max"],["C","0.08% max"],["H","0.015% max"],["Fe","0.30% max"]],
    props: ["Tensile strength: 50.00 ksi","Yield strength: 40.00 ksi","Elongation: 20.00%","Hardness: 80 HB"],
    standards: "UNS R50400\nASTM B265 / B337 / B338 / B348",
    specs: "Werkstoff Nr. 3.7035\nEN: Ti 99.6",
  },
  "Titanium Grade5": {
    desc: "Titanium-6Al-4V — the most widely used titanium alloy, combining high strength with low weight and excellent corrosion resistance. The alpha-beta alloy used extensively in aerospace, medical, marine and chemical industries.",
    chem: [["Ti","Balance"],["Al","5.50–6.75%"],["V","3.50–4.50%"],["O","0.20% max"],["Fe","0.40% max"],["N","0.05% max"],["C","0.08% max"],["H","0.015% max"]],
    props: ["Tensile strength: 130.00 ksi","Yield strength: 120.00 ksi","Elongation: 10.00%","Hardness: 30 HRC"],
    standards: "UNS R56400\nASTM B265 / B337 / B338 / B348 / B367",
    specs: "Werkstoff Nr. 3.7165\nEN: TiAl6V4",
  },
  "SMO-254": {
    desc: "A superaustenitic stainless steel designed for maximum resistance to pitting and crevice corrosion. High contents of chromium, nickel, molybdenum and nitrogen giving very high pitting resistance. Designed as an alternative to nickel alloys for use in aggressive chloride environments.",
    chem: [["Ni","17.5–18.5%"],["Cr","19.5–20.5%"],["Mo","6.0–6.5%"],["Cu","0.5–1.0%"],["N","0.18–0.22%"],["Fe","Balance"],["Mn","1.0% max"],["C","0.02% max"]],
    props: ["Tensile strength: 94.00 ksi","Yield strength: 43.00 ksi","Elongation: 35.00%","Hardness: 96 HRB"],
    standards: "UNS S31254\nASTM A240 / A479 / A182",
    specs: "Werkstoff Nr. 1.4547\nEN: X1CrNiMoCuN20-18-7",
  },
};

/* ══════════════════════════════════════════════════════════
   EXACT 3-PANEL LAYOUT  (matches neonalloys.com screenshot)
══════════════════════════════════════════════════════════ */
const LEFT_SECTIONS   = [
  { header: "NICKEL",    items: ["Nickel 200","Nickel 201"] },
  { header: "MONEL",     items: ["Monel- 400","Monel-K 500"] },
  { header: "HASTELLOY", items: ["Hastelloy C-276","Hastelloy C-22"] },
];
const MID_SECTIONS    = [
  { header: "INCONEL",      items: ["Inconel 600","Inconel 601","Inconel 625","Inconel 800","Inconel 825","Inconel 800 HT"] },
  { header: "ALLOY",        items: ["Alloy-904L","Alloy-20"] },
  { header: "CUPRO-NICKEL", items: ["Cupro-Nickel (90/10)","Cupro-Nickel (70/30)"] },
];
const RIGHT_SECTIONS  = [
  { header: "TITANIUM",     items: ["Titanium Grade1","Titanium Grade2","Titanium Grade5"] },
  { header: "NICKEL ALLOYS",items: ["SMO-254"] },
];

/* floating cover labels (decorative) — spread across the full-width cover,
   loosely echoing the 3-column layout underneath (left/mid/right thirds) */
const COVER_LABELS = [
  { text:"NICKEL 200",      x:"16%", y:"12%", size:12, color:"#fff" },
  { text:"MONEL",           x:"50%", y:"9%",  size:22, color:"#fff", bold:true },
  { text:"MONEL-K 500",     x:"82%", y:"13%", size:12, color:"#fff" },
  { text:"HASTELLOY C-276", x:"14%", y:"30%", size:12, color:"#fff" },
  { text:"INCONEL",         x:"50%", y:"36%", size:30, color:"#5cb85c", bold:true },
  { text:"HASTELLOY C-22",  x:"84%", y:"30%", size:12, color:"#fff" },
  { text:"NICKEL 201",      x:"15%", y:"52%", size:12, color:"#fff" },
  { text:"ALLOY",           x:"50%", y:"57%", size:22, color:"#fff", bold:true },
  { text:"ALLOY-904L",      x:"84%", y:"52%", size:12, color:"#fff" },
  { text:"CUPRO-NICKEL",    x:"16%", y:"72%", size:12, color:"#fff" },
  { text:"TITANIUM",        x:"50%", y:"77%", size:20, color:"#fff", bold:true },
  { text:"SMO-254",         x:"83%", y:"72%", size:12, color:"#fff" },
];

/* ══════════════════════════════════════════════════════════
   PRODUCT DETAIL MODAL
══════════════════════════════════════════════════════════ */
function ProductModal({ name, onClose }) {
  const data = PRODUCTS[name];
  if (!data) return null;
  return (
    <div
      onClick={onClose}
      style={{
        position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",
        zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px",
      }}
    >
      <div
        onClick={e=>e.stopPropagation()}
        style={{
          background:"#fff",border:"1px solid #ccc",borderRadius:"4px",
          maxWidth:"800px",width:"100%",maxHeight:"90vh",overflowY:"auto",
          padding:"30px 32px",position:"relative",
          fontFamily:"Arial,Helvetica,sans-serif",fontSize:"14px",color:"#333",
          boxShadow:"0 8px 40px rgba(0,0,0,0.35)",
        }}
      >
        {/* × */}
        <button onClick={onClose} style={{
          position:"absolute",top:8,right:10,background:"none",
          border:"1px solid #aaa",width:24,height:24,cursor:"pointer",
          fontSize:14,fontWeight:700,color:"#555",lineHeight:"22px",
          textAlign:"center",borderRadius:"2px",
        }}>×</button>

        {/* Title */}
        <h2 style={{fontSize:18,fontWeight:700,marginBottom:14,color:"#222",textTransform:"uppercase"}}>
          {name}
        </h2>

        {/* Description */}
        <p style={{fontSize:13.5,lineHeight:1.7,marginBottom:20,textAlign:"justify",color:"#333"}}>
          {data.desc}
        </p>

        {/* Two columns */}
        <div style={{display:"flex",gap:32,flexWrap:"wrap",marginBottom:16}}>
          <div style={{flex:"1 1 260px"}}>
            <h3 style={{color:"#5cb85c",fontSize:13.5,fontWeight:600,marginBottom:10}}>
              Limiting Chemical Composition %
            </h3>
            {data.chem.map(([el,val],i)=>(
              <div key={i} style={{fontSize:13,lineHeight:1.9,color:"#333"}}>
                {el}..........{val}
              </div>
            ))}
          </div>
          <div style={{flex:"1 1 260px"}}>
            <h3 style={{color:"#5cb85c",fontSize:13.5,fontWeight:600,marginBottom:10}}>
              Key properties (in annealed condition)
            </h3>
            {data.props.map((p,i)=>(
              <div key={i} style={{fontSize:13,lineHeight:1.9,color:"#333"}}>{p}</div>
            ))}
          </div>
        </div>

        {data.standards&&(
          <p style={{fontSize:13,lineHeight:1.7,marginBottom:16,whiteSpace:"pre-line",color:"#333"}}>
            {data.standards}
          </p>
        )}
        {data.specs&&(
          <>
            <h3 style={{color:"#5cb85c",fontSize:13.5,fontWeight:600,marginBottom:8}}>
              Specifications and Designations
            </h3>
            <p style={{fontSize:13,lineHeight:1.7,whiteSpace:"pre-line",color:"#333"}}>
              {data.specs}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SINGLE SECTION (header + clickable items)
══════════════════════════════════════════════════════════ */
function Section({ header, items, onSelect, last }) {
  const GRN = "#5cb85c";
  return (
    <div style={{ borderBottom: last ? "none" : `1.5px solid ${GRN}` }}>
      <div style={{
        background:"#f0f0f0",borderBottom:`1.5px solid ${GRN}`,
        padding:"7px 6px",textAlign:"center",
      }}>
        <span style={{
          color:GRN,fontWeight:700,fontSize:12,textTransform:"uppercase",
          letterSpacing:"0.04em",fontFamily:"Arial,sans-serif",
        }}>{header}</span>
      </div>
      <div style={{padding:"6px 4px",background:"#fff"}}>
        {items.map((item,i)=>(
          <div key={i} style={{textAlign:"center",margin:"5px 0"}}>
            <span
              role="button"
              tabIndex={0}
              onClick={()=>onSelect(item)}
              onKeyDown={e=>e.key==="Enter"&&onSelect(item)}
              style={{
                fontSize:11,color:"#333",textTransform:"uppercase",
                fontFamily:"Arial,sans-serif",fontWeight:500,cursor:"pointer",
                letterSpacing:"0.03em",display:"inline-block",transition:"color 0.15s",
              }}
              onMouseEnter={e=>e.currentTarget.style.color=GRN}
              onMouseLeave={e=>e.currentTarget.style.color="#333"}
            >{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PANEL COLUMN
══════════════════════════════════════════════════════════ */
function PanelColumn({ sections, onSelect, footer }) {
  return (
    <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column"}}>
      <div style={{flex:1,overflowY:"auto"}}>
        {sections.map((s,i)=>(
          <Section key={s.header} header={s.header} items={s.items}
            onSelect={onSelect} last={i===sections.length-1&&!footer} />
        ))}
      </div>
      {footer&&(
        <div style={{
          background:"#5cb85c",padding:"12px 10px",textAlign:"center",
          fontFamily:"Arial,sans-serif",fontSize:11,color:"#fff",lineHeight:1.7,
          flexShrink:0,
        }}>
          <strong>Siyak Steel International</strong><br/>
          91/95, Kika Street, Gulalwadi<br/>
          Mumbai – 400 004 (India)<br/>
          Tel: +91 22 2345 6789<br/>
          Email: info@siyaksteel.com
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════ */
export default function NeonAlloysBook() {
  const [isOpen,  setIsOpen]  = useState(false);
  const [product, setProduct] = useState(null);

  /* double-green inset border from neonalloys CSS, applied once to the
     whole book frame instead of per-panel (avoids stacking it 3x). */
  const BORDER = "inset 0 0 0 10px #fff,inset 0 0 0 11px #69c146,inset 0 0 0 12px #fff,inset 0 0 0 13px #69c146";

  return (
    <>
      {product&&<ProductModal name={product} onClose={()=>setProduct(null)}/>}

      {/* Outer frame: fixed height + real width on sm+, auto height stacked
          on mobile. overflow:hidden means nothing can ever bleed past this
          box no matter what the cover animation does. */}
      <div
        className="relative w-full sm:h-[520px] overflow-hidden rounded-sm bg-white"
        style={{ boxShadow: `0 6px 24px rgba(0,0,0,0.35),${BORDER}` }}
      >
        {/* ───── TRIFOLD PAGES — always mounted underneath the cover ───── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 h-full divide-y sm:divide-y-0 sm:divide-x divide-[#69c146]">
          <PanelColumn sections={LEFT_SECTIONS} onSelect={setProduct} />
          <PanelColumn sections={MID_SECTIONS} onSelect={setProduct} />
          <PanelColumn sections={RIGHT_SECTIONS} onSelect={setProduct} footer />
        </div>

        {/* ───── COVER — one full-width overlay, tilts + fades away in place
               (never rotates past its own footprint, so it can never bleed
               outside the frame the way a full 180° swing would). ───── */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              key="cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -18, scale: 0.97 }}
              whileHover={{ scale: 1.008 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              onClick={() => setIsOpen(true)}
              style={{
                position: "absolute", inset: 0, zIndex: 20,
                transformOrigin: "0% 50%", transformStyle: "preserve-3d",
                cursor: "pointer", overflow: "hidden",
              }}
            >
              {/* bg image */}
              <img src={coverBg} alt="" style={{
                position:"absolute",inset:0,width:"100%",height:"100%",
                objectFit:"cover",filter:"brightness(0.60)",
              }}/>

              {/* Siyak logo box */}
              <div style={{
                position:"absolute",top:12,left:"50%",transform:"translateX(-50%)",
                background:"#fff",borderRadius:"3px",padding:"5px 8px",
                boxShadow:"0 2px 10px rgba(0,0,0,0.5)",zIndex:3,
              }}>
                <img src={siyakLogo} alt="Siyak Steel International"
                  style={{height:36,width:"auto",objectFit:"contain",display:"block"}}/>
              </div>

              {/* floating labels */}
              {COVER_LABELS.map((l,i)=>(
                <span key={i} style={{
                  position:"absolute",left:l.x,top:l.y,
                  color:l.color,fontSize:l.size,
                  fontWeight:l.bold?700:600,
                  textTransform:"uppercase",letterSpacing:"0.04em",
                  textShadow:"0 1px 6px rgba(0,0,0,0.9)",
                  fontFamily:"Arial,sans-serif",
                  transform:"translateX(-50%)",
                  whiteSpace:"nowrap",
                }}>{l.text}</span>
              ))}

              {/* CTA button */}
              <div style={{
                position:"absolute",bottom:0,left:0,right:0,
                background:"#5cb85c",padding:"13px 8px",textAlign:"center",
              }}>
                <span style={{
                  color:"#fff",fontWeight:700,fontSize:13,
                  textTransform:"uppercase",letterSpacing:"0.1em",
                  fontFamily:"Arial,sans-serif",
                }}>Click here for more details</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ───── Close-book pill — only shown once opened ───── */}
        {isOpen && (
          <button
            onClick={() => setIsOpen(false)}
            style={{
              position:"absolute",top:10,right:10,zIndex:21,
              background:"#5cb85c",color:"#fff",border:"none",
              padding:"5px 14px",fontSize:11,fontWeight:700,
              textTransform:"uppercase",letterSpacing:"0.08em",
              cursor:"pointer",fontFamily:"Arial,sans-serif",borderRadius:"3px",
              boxShadow:"0 2px 8px rgba(0,0,0,0.35)",
            }}
          >
            Close Book
          </button>
        )}
      </div>
    </>
  );
}
