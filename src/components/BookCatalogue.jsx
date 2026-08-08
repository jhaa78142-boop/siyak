/**
 * BookCatalogue.jsx — pixel-perfect recreation of neonalloys.com/nickel-products.php
 *
 * CSS sourced verbatim from https://www.neonalloys.com/css/style-nickel.css
 *
 * rm-container:  width 33%, max-width 370px, height 650px
 * Perspective:   1600px (from CSS)
 * Inset borders: 18px #fff, 19px #69c146, 20px #fff, 21px #69c146
 * Bg:            #000 behind book
 * Cover:         transform-origin 0% 50% (left hinge), transition-delay 0.2s (closing)
 * Right:         transform-origin 100% 50% (right hinge), transition-delay 0s (opening)
 * Timing:        0.6s ease-in-out  (all transitions)
 *
 * Three states:
 *   "closed"     — cover sits on top; VIEW PRODUCTS button visible
 *   "open"       — cover flips -180° left; right page flips +180° right
 *   "open-modal" — book sinks translateZ(-500px); product detail flies forward
 *
 * Three book state machine (matches rm-open / rm-in classes from
 * neonalloys source CSS scraped verbatim):
 *   "closed"  → cover overlays inner pages; VIEW PRODUCTS visible.
 *   "open"    → cover rotated -180° on LEFT hinge, right flap +180°
 *               on RIGHT hinge (exactly neonalloys 0.6s ease-in-out).
 *   "in"      → a product grade clicked: book sinks back (translateZ
 *               -500px) while rm-modal detail overlay flies forward
 *               translateZ 0 (same as neonalloys rm-in state).
 */

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import coverBg from "../assets/hero-bg/aj.webp";
import { companyInfo } from "../data/products";

/* ══════════════════════════════════════════════════════════
   DATA  — exact neonalloys grade names + HTML-sourced descriptions
══════════════════════════════════════════════════════════ */
const LEFT_SECTIONS = [
  { header: "NICKEL",    items: ["Nickel 200","Nickel 201"] },
  { header: "MONEL",     items: ["Monel- 400","Monel-k 500"] },
  { header: "HASTELLOY", items: ["Hastelloy c-276","Hastelloy c-22"] },
];
const MID_SECTIONS  = [
  { header: "INCONEL",      items: ["Inconel 600","Inconel 601","Inconel 625","Inconel 800","Inconel 825","Inconel 800 ht"] },
  { header: "ALLOY",        items: ["Alloy-904L","Alloy-20"] },
  { header: "CUPRO-NICKEL", items: ["Cupro-Nickel (90/10)","Cupro-Nickel (70/30)"] },
];
const RIGHT_SECTIONS = [
  { header: "TITANIUM",      items: ["Titanium Grade1","Titanium Grade2","Titanium Grade5"] },
  { header: "Nickel Alloys", items: ["SMO-254"] },
];

const PRODUCTS = {
  "Nickel 200": {
    desc: "Commercially pure (99.6%) wrought nickel with good mechanical properties and resistance to a range of corrosive media. Good thermal, electrical and magnetostrictive properties. Used for variety of processing equipment, particularly to maintain product purity in handling foods, synthetic fibers and alkalies. Standard product forms are round, flats, pipe, tube, plate, forging stock, strip and wire.",
    chem: [["Ni","99.00% min"],["Cu","0.25% max"],["Fe","0.40% max"],["Mn","0.35% max"],["C","0.15% max"],["Si","0.35% max"],["S","0.01% max"]],
    props: ["Tensile strength: 55.00–75.00","Yield strength: 12.00–30.00","Elongation: 60.00–40.00%","Hardness: 70.00"],
    standards: "UNS N02200  BS 3072-3076 (Na11)  ASTM B 160 B 163\nB 725 B730 ASME SB. 160-SB. 163\nBoiler Code Sections III, VIII, IX",
    specs: "DIN 17740, 17750-17754\nWerkstoff Nr. 2.4060 / 2.4066",
  },
  "Nickel 201": {
    desc: "Commercially pure (99.6%) wrought nickel essentially the same as Nickel 200 but with a lower carbon content to prevent embrittlement by intergranular carbon temperatures over 600 oF (3015oC). Lower carbon content also reduces hardness Nickel 201 particularly suitable for cold-formed items. Standard product forms are round, flats, pipe, tube, plate, sheet, forging stock, strip and wire.",
    chem: [["Ni","99.00% min"],["Cu","0.25% max"],["Fe","0.40% max"],["Mn","0.35% max"],["C","0.02% max"],["Si","0.35% max"],["S","0.01% max"]],
    props: ["Tensile strength: 50.00–70.00","Yield strength: 10.00–28.00","Elongation: 60.00–40.00%","Hardness: 62.00"],
    standards: "UNS N02201\nBS 3072-3076 (Na12) ASTM B 160 B 163\nB 725, B730 ASME SB. 160-SB. 163\nBoiler Code Sections III, VIII, IX",
    specs: "DIN 17740, 17750-17754\nWerkstoff Nr. 2.4061, 2.4068\nVdTüV 345",
  },
  "Monel- 400": {
    desc: "A nickel-copper alloy with high strength and excellent corrosion resistance in a range of media including sea water hydrofluoric, chemical and hydrocarbon processing equipment, valves, pumps, shafts, fitting, fasteners and heat exchangers. Standard product forms are round, hexagon, flats, forging stock, pipe, tube, plate, sheet, strip and wire.",
    chem: [["Ni","63.00% min"],["Cu","28.00-34.00%"],["Al","2.5 max"],["Fe","2.50% max"],["Mn","2.00% max"],["C","0.30% max"],["S","0.02% max"],["Si","0.50% max"]],
    props: ["Tensile strength: 75.00–85.00","Yield strength: 25.00–45.00","Elongation: 50.00–35.00%","Hardness: 75.00"],
    standards: "UNS NO4400     MIL-T-1368\nBS 3072-3076 (NA 13)\nASTM B Boiler Code\nSection III, IV, VIII, IX\nNACE MR-01-75",
    specs: "MONEL IS REGISTERED TRADEMARK OF SPECIAL METAL LTD.\nMIL-T-23520\nWerkstoff Nr. 2.4360, 2.4361\nQQ-N-281",
  },
  "Monel-k 500": {
    desc: "Corrosion-hardenable nickel-copper alloy that combines the corrosion resistance of Monel alloy 400 with greater hardness. It also has low permeability and is to under -1 5PF (-101 T). Used for pump shaft, and value instruments, doctor blades and scrapers, trim, fasteners, and marine propeller shafts. Product forms are round, hexagon, flats, forging tube, plate, sheet, strip and wire.",
    chem: [["Ni","63.00% min"],["Cu","27.00-33.00%"],["Al","2.30-3.15%"],["Ti","0.35-0.85%"],["Fe","2.00% max"],["C","0.25% max"],["Mn","1.50% max"],["S","0.01% max"],["Si","0.50% max"]],
    props: ["Tensile strength: 90.00–110.00","Yield strength: 40.00–65.00","Elongation: 45.00–25.00%","Hardness: 140.00–315.00"],
    standards: "MONEL ALLOY K-500\nBS 3072-3076 (NA 13)\nASTM B Boiler Code Section VIII\nNACE MR-01-75",
    specs: "MIL-N-24549 DIN 17743\n17752, 17752\nWERKSTOFF 2.4375\nQQ-N-286",
  },
  "Hastelloy c-276": {
    desc: "A nickel-molybdenum-chromium alloy with an addition of tungsten having excellent corrosion resistance in a wide range of severe environments. The high molybdenum content makes the alloy especially resistant to pitting and crevice corrosion. The low carbon content minimizes carbide precipitation during welding to maintain corrosion resistance in as welded structures. Used in pollution control. chemical processing pulp and paper production and waste treatment Standard product forms are round, forging stock, tube, pipe, plate, sheet, strip and wire.",
    chem: [["Ni","Balance"],["Co","2.50% max"],["S","0.03% max"],["Mo","15.00-17.00%"],["Mn","1.00% max"],["Si","0.08% max"],["Cr","14.50-16.50%"],["C","0.01% max"],["Fe","4.00-7.00%"],["V","0.35% max"],["W","3.00-4.50%"],["P","0.04% max"]],
    props: ["Tensile strength: 45.40","Yield strength: 105.40","Elongation: 70.00%","Hardness: —"],
    standards: "UNS N10276\nASTM B-574 B-575.B-619\nB-622. B-626. B-751\nNACE MR-01-75\nDIN 17744, 17750-17752\nASME SB-574\nSB-575 SB-619 SB-622, SB-626\nBoiler Code Section I, III,VIII, IX.",
    specs: "Werkstoff Nr 2.4819",
  },
  "Hastelloy c-22": {
    desc: "(UNS N06022. W. Ni 2.4602. NiC21Mo1 4W) is a fully austenitic advanced temperatures. This alloy provides exceptional resistance to general corrosion, pitting, crevice corrosion. chemical/petrochemical processing. pollution control (flue gas desulfurization), power, marine, pulp and paper processing, and waste disposal industries Used in pollution control, chemical processing pulp and paper production and waste treatment Standard product forms are round, forging stock, tube, pipe, plate. sheet, strip and wire.",
    chem: [["Ni","Remainder"],["Cr","20.0-22.5"],["Mo","12.5-14.5"],["Fe","2.0-3.5"],["W","2.5-3.5"],["Co","2.5 max"],["V","0.35 max"],["C","0.015 max"],["Mn","0.05 max"],["S","0.02 max"],["Si","0.08 max"],["P","0.02 max"]],
    props: ["Tensile strength: —","Yield strength: —","Elongation: —","Hardness: —"],
    standards: "UNS N06022\nASTM B-574 B-575, B-619\nB-622. B-626\nDIN 17744, 17750\nASME SB-574 SB-575.SB-619\nSB-619 SB-622. SB-626\nSection VIII Div I",
    specs: "Werkstoff Ni 2.4602\n*Hastalloy is an registered trademark of Haynes International.",
  },
  "Inconel 600": {
    desc: "A nickel-chromium alloy with good oxidation resistance at high temperatures and resistance to chloride-ion stress corrosion cracking corrosion by high-purity water and causing corrosion. Used for furnace components, in chemical and food processing, in nuclear engineering and for sparking electrodes. Standard product forms are round, hexagon, extruded section, flats, forging stock, pipe, tube, plate, sheet, strip and wire.",
    chem: [["Ni","72.00% min"],["C","0.15% max"],["S","0.01% max"],["Cr","14.00-17.00%"],["Mn","1.00% max"],["Cu","0.50% max"],["Fe","6.00-10.00%"],["Si","0.50% max"]],
    props: ["Tensile strength: 80.00–100.00","Yield strength: 25.00–50.00","Elongation: 55.00–35.00%","Hardness: 88.00"],
    standards: "UNS N06600 ASME\nBoiler Code Section I. III. VIII. IX\nSAE AMS 5540. 5580, 5665\nASTM B 163 B 165 B 68",
    specs: "DIN 17742, 17750-17754\nWerkstoff Nr. 2.4061",
  },
  "Inconel 601": {
    desc: "A nickel-chromium alloy with an addition of aluminum for out standing resistance to oxidation and other forms of high temperature corrosion. It also has high mechanical properties at elevated temperatures. Used for industrial furnaces; petrochemical and other process equipment; such as baskets, muffles and retorts, petrochemical and other process equipment; and gas-turbine components, Standard product forms are round, flats, forging stock, pipe, tube, plate, sheet, strip and wire.",
    chem: [["Ni","58.00-63.00%"],["Fe","Balance"],["Si","0.50% max"],["Cr","21.00-25.00%"],["C","0.10% max"],["S","0.01% max"],["Al","1.00-1.70%"],["Mn","1.00% max"],["Cu","1.00% max"]],
    props: ["Tensile strength: 80.00–110.00","Yield strength: 25.00–55.00","Elongation: 65.00–35.00%","Hardness: 70.00–95.00"],
    standards: "UNS N06601 ASME\nBoiler Code Section VIII\nSAE Ams 5715, 5870\nASTM B 166-B 165",
    specs: "DIN 17742. 17750-17752\nWerkstoff 2.4851",
  },
  "Inconel 625": {
    desc: "A nickel-chromium-molybdenum alloy with an addition of niobium that acts with the molybdenum to stiffen the alloy's matrix and thereby provide high strength without a strengthening heat treatment. The alloy resists a wide range of severely corrosive environments and is especially resistant to pitting and crevice corrosion. Used in chemical processing, aerospace and marine engineering, pollution control equipment and nuclear reactor. Standard product forms are round, flats, forging stock, extruded section, pipe, tube, plate, sheet, strip and wire.",
    chem: [["Ni","58.00% min"],["C","0.10% max"],["Ti","0.40% max"],["Cr","20.00-23.00%"],["Mn","0.50% max"],["P","0.01% max"],["Mo","8.00-10.00%"],["Si","0.50% max"],["Co","1.00% max"],["Nb+Ta","3.15-4.15%"],["S","0.01% max"],["Fe","5.00% max"],["Ag","0.40% max"]],
    props: ["Tensile strength: 120.00–140.00","Yield strength: 60.00–75.00","Elongation: 55.00–30.00%","Hardness: 145.00–220.00"],
    standards: "*Plus Ta if determined\nUNS N06625\nBS 3072, 3074, 3076 (WA21)\nASTM B443. B444, B446\nB564. B704, B705. B761\nASME SB-443, SB-44. SB-446. SB-564\nBoiler code Sections I, III. VIII. IX",
    specs: "SAE AMS 5561,5599,5666,5337\nDIN 17744,17750,-17752,17754\nWerkstoff Nr 2.4856\nNACE MR 0175\nAFMOR NC 22 0NB",
  },
  "Inconel 800": {
    desc: "A nickel-iron-chromium alloy with good strength and excellent resistance to oxidation and carburization in high temperature atmospheres. Standard product forms are round, flats, forging stock, pipe, tube, plate, sheet, strip and wire.",
    chem: [["Ni","30.00-35.00%"],["Cr","19.00-23.00%"],["Fe","Balance"],["C","0.10% max"],["Mn","1.50% max"],["Cu","0.75% max"],["Si","1.00% max"],["Al","0.15-0.60%"],["Ti","0.15-0.60%"],["S","0.015% max"]],
    props: ["Tensile strength: 65.00–80.00","Yield strength: 25.00–35.00","Elongation: 30.00–55.00%","Hardness: 135"],
    standards: "UNS N08800\nASTM B163 / B407 / B408 / B409 / B514 / B515",
    specs: "DIN 17744, 17750\nWerkstoff 1.4876",
  },
  "Inconel 825": {
    desc: "A nickel-iron-chromium alloy with additions of molybdenum, copper and titanium (Ti). The alloy's composition is designed to provide a similar exceptional resistance to many corrosive media as Alloy 800, combined with many corrosive media — much higher resistance both to reducing acid, to stress-corrosion cracking and to localized attack such as pitting and intergranular corrosion. Standard product forms are round, flats, forging stock, pipe, tube, plate, sheet, strip and wire.",
    chem: [["Ni","38.00-46.00%"],["Cr","19.50-23.50%"],["Fe","Balance"],["Mo","2.50-3.50%"],["Cu","1.50-3.00%"],["Ti","0.60-1.20%"],["C","0.05% max"],["Mn","1.00% max"],["S","0.03% max"],["Si","0.50% max"],["Al","0.20% max"]],
    props: ["Tensile strength: 80.00","Yield strength: 35.00","Elongation: 30.00%","Hardness: 85"],
    standards: "UNS N08825\nASME SB 423 SB 424 SB 425\nASTM B 423 B 424 B 425 B 163",
    specs: "DIN 17744, 17751\nWerkstoff 2.4858",
  },
  "Inconel 800 ht": {
    desc: "A nickel-iron-chromium alloy with good strength and excellent resistance to oxidation and carburization in high temperature atmospheres. High aluminium and titanium content for use at temperatures above 1100°F (593°C). Standard product forms are round, flats, forging stock, pipe, tube, plate, sheet, strip and wire.",
    chem: [["Ni","30.00-35.00%"],["Cr","19.00-23.00%"],["Fe","Balance"],["C","0.06-0.10%"],["Al+Ti","0.85-1.20%"],["Mn","1.50% max"],["Cu","0.75% max"],["Si","1.00% max"]],
    props: ["Tensile strength: 65.00–90.00","Yield strength: 25.00–40.00","Elongation: 25.00–50.00%","Hardness: 140"],
    standards: "UNS N08811\nASTM B163 / B407 / B408 / B409 / B514 / B515",
    specs: "DIN 17744, 17750\nWerkstoff 1.4876",
  },
  "Alloy-904L": {
    desc: "A low-carbon, high-alloy austenitic stainless steel designed to give improved resistance to general corrosion and to stress-corrosion cracking, especially to pitting and crevice corrosion in chloride-containing environments. Especially suitable for sulphuric acid at various concentrations and temperatures",
    chem: [["Ni","23.00-28.00%"],["Cr","19.00-23.00%"],["Mo","4.00-5.00%"],["Cu","1.00-2.00%"],["Fe","Balance"],["C","0.02% max"],["Mn","2.00% max"],["Si","1.00% max"],["S","0.015% max"],["N","0.10% max"],["P","0.045% max"]],
    props: ["Tensile strength: 71.00","Yield strength: 32.00","Elongation: 35.00%","Hardness: 70"],
    standards: "UNS N08904\nASTM A240 / A479 / A182",
    specs: "Werkstoff Nr. 1.4539\nEN X1NiCrMoCu25-20-5",
  },
  "Alloy-20": {
    desc: "Carpenter 20 is an austenitic stainless steel possessing excellent resistance to hot sulfuric acid and many other aggressive environments which would readily attack type 316 stainless steel. Used in chemical, pharmaceutical and food processing industries.",
    chem: [["Ni","32.00-38.00%"],["Cr","19.00-21.00%"],["Mo","2.00-3.00%"],["Cu","3.00-4.00%"],["Fe","Balance"],["Cb+Ta","8 x C – 1.00%"],["C","0.07% max"],["Mn","2.00% max"],["Si","1.00% max"],["S","0.03% max"]],
    props: ["Tensile strength: 80.00","Yield strength: 35.00","Elongation: 30.00%","Hardness: 80"],
    standards: "UNS N08020\nASTM B473 / B462 / B463 / B464 / B465 / B472",
    specs: "Werkstoff Nr. 2.4660",
  },
  "Cupro-Nickel (90/10)": {
    desc: "Copper-nickel alloy, 90% copper 10% nickel. Good resistance to corrosion by seawater, stress-corrosion cracking, impingement corrosion and biofouling. Widely used in marine, offshore and coastal installations, condensers, heat exchangers, evaporators and distillation equipment.",
    chem: [["Cu","Balance"],["Ni","9.00-11.00%"],["Fe","1.00-1.80%"],["Mn","0.50-1.00%"],["Pb","0.02% max"],["Zn","0.50% max"],["C","0.05% max"],["S","0.02% max"]],
    props: ["Tensile strength: 38.00–42.00","Yield strength: 15.00–18.00","Elongation: 30.00–40.00%","Hardness: 55"],
    standards: "UNS C70600\nASTM B111 / B171 / B359 / B395 / B466 / B467",
    specs: "Werkstoff 2.0872\nEN CuNi10Fe1Mn",
  },
  "Cupro-Nickel (70/30)": {
    desc: "Copper-nickel alloy, 70% copper 30% nickel. Higher strength and corrosion resistance than 90/10 especially against high-velocity seawater, elevated temperatures and brackish water. Suitable for condenser tubing, heat exchangers and desalination plants.",
    chem: [["Cu","Balance"],["Ni","29.00-33.00%"],["Fe","0.40-0.70%"],["Mn","1.00% max"],["Pb","0.02% max"],["Zn","0.50% max"],["C","0.05% max"],["S","0.02% max"]],
    props: ["Tensile strength: 52.00–62.00","Yield strength: 20.00–28.00","Elongation: 30.00–40.00%","Hardness: 72"],
    standards: "UNS C71500\nASTM B111 / B171 / B359 / B395 / B466 / B467",
    specs: "Werkstoff 2.0882\nEN CuNi30Mn1Fe",
  },
  "Titanium Grade1": {
    desc: "Commercially pure titanium — lowest strength, highest ductility. Excellent corrosion resistance in oxidizing, reducing and neutral media. Used in chemical processing, chlorine and chloride-containing environments, seawater systems and medical implants.",
    chem: [["Ti","Balance"],["O","0.18% max"],["N","0.03% max"],["C","0.08% max"],["H","0.015% max"],["Fe","0.20% max"]],
    props: ["Tensile strength: 35.00","Yield strength: 25.00","Elongation: 24.00%","Hardness: 70 HB"],
    standards: "UNS R50250\nASTM B265 / B337 / B338 / B348 / B367",
    specs: "Werkstoff Nr. 3.7025\nEN Ti 99.8",
  },
  "Titanium Grade2": {
    desc: "Commercially pure titanium with slightly higher strength than Grade 1. Standard grade for most applications. Excellent formability, weldability and corrosion resistance.",
    chem: [["Ti","Balance"],["O","0.25% max"],["N","0.03% max"],["C","0.08% max"],["H","0.015% max"],["Fe","0.30% max"]],
    props: ["Tensile strength: 50.00","Yield strength: 40.00","Elongation: 20.00%","Hardness: 80 HB"],
    standards: "UNS R50400\nASTM B265 / B337 / B338 / B348",
    specs: "Werkstoff Nr. 3.7035\nEN Ti 99.6",
  },
  "Titanium Grade5": {
    desc: "Ti-6Al-4V — the most widely used titanium alloy combining very high strength with low weight and excellent corrosion resistance.",
    chem: [["Ti","Balance"],["Al","5.50–6.75%"],["V","3.50–4.50%"],["O","0.20% max"],["Fe","0.40% max"],["N","0.05% max"],["C","0.08% max"],["H","0.015% max"]],
    props: ["Tensile strength: 130.00","Yield strength: 120.00","Elongation: 10.00%","Hardness: 30 HRC"],
    standards: "UNS R56400\nASTM B265 / B337 / B338 / B348 / B367",
    specs: "Werkstoff Nr. 3.7165\nEN TiAl6V4",
  },
  "SMO-254": {
    desc: "A superaustenitic stainless steel designed for maximum resistance to pitting and crevice corrosion. High contents of chromium, nickel, molybdenum and nitrogen giving very high pitting resistance equivalent number (PREn > 42). Designed as an alternative to nickel alloys for use in aggressive chloride environments.",
    chem: [["Cr","19.50-20.50%"],["Ni","17.50-18.50%"],["Mo","6.00-6.50%"],["N","0.18-0.22%"],["Cu","0.50-1.00%"],["Fe","Balance"],["C","0.02% max"],["Mn","1.00% max"]],
    props: ["Tensile strength: 94.00","Yield strength: 43.00","Elongation: 35.00%","Hardness: 96"],
    standards: "UNS S31254\nASTM A240 / A479 / A182",
    specs: "Werkstoff Nr. 1.4547\nEN X1CrNiMoCuN20-18-7",
  },
};

/* ══════════════════════════════════════════════════════════
   COVER — WORD CLOUD labels scattered (matches neonalloys cover)
   Positions + colors from screenshot visual match:
   white / green (#69c146) / blue (#4a97d3) varying sizes,
   scattered across the cover in diagonal pattern.
══════════════════════════════════════════════════════════ */
/* COVER WORDS — ONE word per y-row, staggered x. No horizontal overlap possible.
   Last word at y:86% = 559px. VIEW PRODUCTS bar starts at 605px (93%). Clear. */
const COVER_WORDS = [
  { text:"NICKEL 200",          x:"46%", y:"15%", size:26, color:"#ffffff" },
  { text:"INCONEL",             x:"18%", y:"24%", size:22, color:"#ffffff" },
  { text:"NICKEL ALLOYS",       x:"68%", y:"33%", size:22, color:"#69c146" },
  { text:"INCONEL 601",         x:"42%", y:"42%", size:18, color:"#ffffff" },
  { text:"INCONEL 718",         x:"70%", y:"51%", size:18, color:"#ffffff" },
  { text:"INCONEL alloy 600",   x:"44%", y:"60%", size:18, color:"#4a97d3" },
  { text:"MONEL alloys K-500",  x:"28%", y:"68%", size:17, color:"#ffffff" },
  { text:"MONEL 400",           x:"68%", y:"75%", size:22, color:"#69c146" },
  { text:"Hastelloy C276",      x:"36%", y:"82%", size:16, color:"#ffffff" },
  { text:"Hastelloy C22",       x:"68%", y:"86%", size:16, color:"#4a97d3" },
];

/* ══════════════════════════════════════════════════════════
   PALETTE — verbatim neonalloys (from scraped CSS)
══════════════════════════════════════════════════════════ */
const C_GREEN = "#69c146";
const C_BLUE  = "#4a97d3";
const C_PAPER = "#fbfbfb";
/* Exact inset box-shadow from style-nickel.css:
   inset 0 0 0 18px #fff, inset 0 0 0 19px #69c146,
   inset 0 0 0 20px #fff, inset 0 0 0 21px #69c146 */
const PAGE_INSET = "inset 0 0 0 18px #fff, inset 0 0 0 19px #69c146, inset 0 0 0 20px #fff, inset 0 0 0 21px #69c146";
const MODAL_INSET = `inset 0 0 0 18px #fff, inset 0 0 0 19px #69c146, inset 0 0 0 20px #fff, inset 0 0 0 21px #69c146, rgba(0,0,0,0.4) 0 4px 20px`;

/* ══════════════════════════════════════════════════════════
   SHARED SECTION COMPONENT — renders one family (NICKEL / MONEL etc)
   Uses neonalloys rm-content h4 borders: top double / bottom double green
══════════════════════════════════════════════════════════ */
/* SHARED SECTION COMPONENT
   NeonAlloys rm-content CSS (from style-nickel.css):
   h4  { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #69c146 }
   dt  { font-size: 12px; font-weight: 400; color: #333; line-height: 2; text-align: center }
   This EXACTLY matches the CSS — 12px × lineHeight 2 = 24px per item. */
function Family({ header, first, items, onSelect }) {
  return (
    <>
      <h4 style={{
        margin: first ? "0" : "16px 0 0 0",
        padding: "6px 0",
        fontSize: 16,
        fontFamily: "Arial,Helvetica,sans-serif",
        color: C_GREEN,
        fontWeight: 700,
        textTransform: "uppercase",
        textAlign: "center",
        borderTop: first ? "none" : `1px double ${C_GREEN}`,
        borderBottom: `1px double ${C_GREEN}`,
        letterSpacing: "0.04em",
      }}>{header}</h4>

      <dl style={{ margin: 0, display: "block" }}>
        {items.map((name, i) => (
          <dt key={i} style={{
            display: "block",
            margin: 0,
            fontWeight: 700,
            textTransform: "uppercase",
            fontFamily: "Arial,Helvetica,sans-serif",
            textAlign: "center",
            fontSize: 14,
            lineHeight: 2,
            color: "#333",
          }}>
            <a
              href="#"
              onClick={e => { e.preventDefault(); onSelect(name); }}
              style={{
                color: "#333", fontWeight: 700, fontSize: 14,
                fontFamily: "Arial,Helvetica,sans-serif",
                textDecoration: "none",
                cursor: "pointer",
                transition: "color 0.15s ease-in-out",
              }}
              onMouseEnter={e => e.currentTarget.style.color = C_GREEN}
              onMouseLeave={e => e.currentTarget.style.color = "#333"}
            >
              {name}
            </a>
          </dt>
        ))}
      </dl>
    </>
  );
}


/* ══════════════════════════════════════════════════════════
   DETAIL MODAL — renders via React Portal to document.body.
   This escapes the rm-wrapper 3D context entirely, so the
   modal can never overlap with page content outside the book.
   Uses position:fixed to cover the full viewport.
══════════════════════════════════════════════════════════ */
function ProductDetailModal({ name, onClose }) {
  const data = PRODUCTS[name];

  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  if (!data) return null;

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0,
        zIndex: 99998,
        background: "rgba(0,0,0,0.78)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        overflowY: "auto",
        padding: "20px 16px",
      }}
    >
      <div style={{
        position: "relative",
        width: "min(860px, 94vw)",
        background: C_PAPER,
        boxShadow: MODAL_INSET,
        padding: "30px 36px",
        fontFamily: "Arial,Helvetica,sans-serif",
        color: "#000",
        textAlign: "left",
      }}>
        <a href="#" onClick={e => { e.preventDefault(); onClose(); }}
          style={{
            position: "absolute", right: 21, top: 21,
            display: "block", width: 16, height: 16,
            background: "#2a323f", color: "#fff",
            textAlign: "center", lineHeight: "14px",
            fontSize: 15, textDecoration: "none",
            fontFamily: "Arial,sans-serif", cursor: "pointer",
          }}>×</a>

        <h5 style={{
          margin: "0 0 20px 0",
          fontSize: 20,
          fontWeight: 700,
          textTransform: "uppercase",
          fontFamily: "Arial,Helvetica,sans-serif",
          color: "#000",
        }}>{name}</h5>

        <p style={{
          fontFamily: "Arial,Helvetica,sans-serif",
          textAlign: "justify",
          fontSize: 15,
          fontWeight: 300,
          color: "#000",
          margin: "0 0 20px 0",
          lineHeight: 1.6,
        }}>{data.desc}</p>

        <div style={{ overflow: "hidden" }}>
          <div style={{ float: "left", width: "50%" }}>
            <h3 style={{
              fontSize: 15,
              color: C_GREEN,
              fontWeight: 700,
              margin: "0 0 10px 0",
            }}>Limiting Chemical Composition %</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {data.chem.map(([el, val], i) => (
                <li key={i} style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.8, fontFamily: "Arial,Helvetica,sans-serif" }}>
                  {el}...........{val}
                </li>
              ))}
            </ul>
          </div>
          <div style={{ float: "left", width: "50%" }}>
            <h3 style={{
              fontSize: 15,
              color: C_GREEN,
              fontWeight: 700,
              margin: "0 0 10px 0",
            }}>Key properties (in annealed condition)</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {data.props.map((p, i) => (
                <li key={i} style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.8 }}>{p}</li>
              ))}
            </ul>
          </div>
        </div>

        {data.standards && (
          <p style={{
            fontSize: 15,
            fontWeight: 300,
            color: "#000",
            whiteSpace: "pre-line",
            clear: "both",
            marginTop: 14,
            lineHeight: 1.6,
            marginBottom: 0,
          }}>{data.standards}</p>
        )}

        {/* Specifications and Designations */}
        {data.specs && (
          <>
            {/* Header — exact .rm-modal h3 */}
            <h3 style={{
              fontFamily: "Arial,Helvetica,sans-serif",
              fontSize: 15,
              letterSpacing: "0.02em",
              display: "block",
              color: C_GREEN,
              fontWeight: 700,
              margin: "14px 0 4px 0",
            }}>Specifications and Designations</h3>
            {/* Specs text — .rm-modal p */}
            <p style={{
              fontFamily: "Arial,Helvetica,sans-serif",
              fontSize: 15,
              fontWeight: 300,
              color: "#333",
              whiteSpace: "pre-line",
              display: "block",
              clear: "both",
              lineHeight: 1.6,
              margin: 0,
            }}>
              {data.specs}
            </p>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}


/* ══════════════════════════════════════════════════════════
   MAIN EXPORT — EXACT rm-container 3-flip book
   state = "closed" (cover on top) | "open" (book flipped open)
   + modal when clicked = rm-in state (wrapper sinks back)
══════════════════════════════════════════════════════════ */
export default function BookCatalogue() {
  const [book, setBook] = useState("closed"); // closed / open / open-modal
  const [detail, setDetail] = useState(null);

  const openBook    = () => { setBook("open"); setDetail(null); };
  const closeBook   = () => { setBook("closed"); setDetail(null); };
  const selectGrade = (name) => { setDetail(name); setBook("open-modal"); };
  const closeDetail = ()       => { setDetail(null); setBook("open"); };

  const isOpen      = book !== "closed";
  const isModal     = book === "open-modal";

  /* transition timing matches neonalloys: 0.6s ease-in-out */
  const T06 = "0.6s ease-in-out";

  return (
    /*
     * Outer section — mirrors neonalloys page exactly:
     * - background: #000, fills full viewport below the navbar
     * - The book rm-container is the ONLY thing on the page
     * - margin: 50px auto on rm-container (exact from neonalloys CSS)
     */
    <div style={{
      background: "#000",
      width: "100%",
      minHeight: "100vh",
      fontFamily: "Arial,Helvetica,sans-serif",
      fontSize: 14,
      color: "#000",
      overflowX: "hidden",
    }}>
      {/* rm-container — exact neonalloys CSS:
          width: 33%; max-width: 370px; height: 650px; margin: 50px auto;
          On a full-width screen (1344px), 33% = ~443px → capped at 370px.
          3 × 370px = 1110px spread when open = nearly full viewport width. */}
      <div style={{
        width: "33%",
        maxWidth: 370,
        height: 650,
        margin: "20px auto",
        position: "relative",
        perspective: "1600px",
      }}>

      {/* rm-close — fixed to viewport top-right when open, matching NeonAlloys */}
      {isOpen && (
        <button
          onClick={closeBook}
          style={{
            background: C_GREEN,
            textTransform: "uppercase",
            display: "block",
            position: "fixed",
            top: 8,
            right: 0,
            color: "#fff",
            fontSize: 13, fontWeight: 500, lineHeight: "22px",
            padding: "2px 12px",
            cursor: "pointer",
            border: "none",
            borderRadius: "2px 2px 0 0",
            fontFamily: "Arial,sans-serif",
            zIndex: 9999,
            letterSpacing: "0.06em",
          }}
        >CLOSE</button>
      )}

      {/* rm-wrapper — 3D preserve-3d, sinks on modal */}
      <div style={{
        width: "100%", height: "100%",
        position: "relative",
        transformStyle: "preserve-3d",
        transition: `transform ${T06}`,
        transform: isModal ? "translateZ(-500px)" : "translateZ(0)",
      }}>

        {/* ─────────────────────────────────────────────────────
           FLAP 1 — rm-COVER (z-index 100)
           Outside = cover page (image + word-cloud + VIEW PRODUCTS)
           Inside  = first inner page (NICKEL / MONEL / HASTELLOY)
           Hinge: LEFT edge, rotate -180° full swing.
           ───────────────────────────────────────────────────── */}
        <div style={{
          width:"100%", height:"100%",
          position:"absolute", left:0, top:0,
          transformStyle:"preserve-3d",
          textAlign:"center",
          zIndex: 100,
          transformOrigin: "0% 50%",
          transition: T06,
          /* NeonAlloys style-nickel.css: .rm-cover { transition-delay: 0.2s }
             This delay is CONSTANT (same for open AND close), not conditional. */
          transitionDelay: "0.2s",
          transform: isOpen ? "rotateY(-180deg)" : "rotateY(0deg)",
          boxShadow: isOpen ? "0 4px 5px -3px rgba(0,0,0,0.6)" : "none",
        }}>
          {/* OUTSIDE FACE — rm-front */}
          <div style={{
            width:"100%", height:"100%",
            position:"absolute", padding:"10px 0 0 0",
            background: `#000 url(${coverBg}) center/cover no-repeat`,
            backfaceVisibility: "hidden",
            boxShadow: PAGE_INSET,
            overflow:"hidden",
          }}>
            {/* word cloud */}
            {COVER_WORDS.map((w,i)=>(
              <span key={i} style={{
                position:"absolute",
                left:w.x, top:w.y,
                transform:"translate(-50%,-50%)",
                color:w.color, fontSize:w.size,
                fontFamily:"Arial,Helvetica,sans-serif",
                fontWeight:700,
                textShadow:"0 1px 8px rgba(0,0,0,0.75)",
                whiteSpace:"nowrap",
                letterSpacing:"0.01em",
              }}>{w.text}</span>
            ))}

            {/* rm-button-open VIEW PRODUCTS → */}
            <a href="#" onClick={e=>{e.preventDefault();openBook();}}
               style={{
                 position:"absolute",left:0,right:0,bottom:0,
                 color:"#000", fontSize:16, lineHeight:"45px",
                 display:"block", fontWeight:700,textTransform:"uppercase",
                 background: C_GREEN,
                 textDecoration:"none",
                 textAlign:"center",
                 letterSpacing:"0.04em",
                 fontFamily:"Arial,Helvetica,sans-serif",
                 transition:"color 0.15s ease-in-out",
               }}
               onMouseEnter={e=>e.currentTarget.style.color="#fff"}
               onMouseLeave={e=>e.currentTarget.style.color="#000"}
            >
              VIEW PRODUCTS<span style={{display:"inline-block",marginLeft:8}}>→</span>
            </a>
          </div>

          {/* INSIDE FACE — rm-back (pre-rotated -180° so faces viewer after cover flips -180°) */}
          <div style={{
            width:"100%", height:"100%",
            position:"absolute", padding:"10px 0 0 0",
            background: C_PAPER,
            backfaceVisibility: "hidden",
            transform:"rotateY(-180deg)",
            boxShadow: PAGE_INSET,
            overflow:"hidden",
          }}>
            <div style={{padding:"10px 28px"}}>
              {LEFT_SECTIONS.map((s,i)=>(
                <Family key={s.header} header={s.header} first={i===0} items={s.items} onSelect={selectGrade}/>
              ))}
            </div>
          </div>
        </div>
        {/* END FLAP 1 — rm-COVER */}

        {/* PAGE 2 — rm-MIDDLE (z-index 50)
            overflow: hidden — matches NeonAlloys (no scrollbar shown) */}
        <div style={{
          width:"100%", height:"100%",
          position:"absolute", left:0, top:0,
          textAlign:"center",
          transformStyle:"preserve-3d",
          zIndex: 50,
          boxShadow: "0 4px 10px rgba(0,0,0,0.7)",
          pointerEvents: isOpen ? "auto" : "none",
        }}>
          <div style={{
            width:"100%", height:"100%",
            position:"absolute", padding:"10px 0 0 0",
            background: C_PAPER,
            boxShadow: PAGE_INSET,
            overflow:"hidden",
          }}>
            <div style={{padding:"10px 28px"}}>
              {MID_SECTIONS.map((s,i)=>(
                <Family key={s.header} header={s.header} first={i===0} items={s.items} onSelect={selectGrade}/>
              ))}
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────
           FLAP 3 — rm-RIGHT (z-index 60), hinge on RIGHT edge
           Front face shows TITANIUM / Nickel Alloys + Regd Office
           When flipped +180° this swings OPEN toward right to
           reveal itself (covers middle sheet’s right half area).
           Delay: 0.2s AFTER cover begins opening (matches css).
           ───────────────────────────────────────────────────── */}
        <div style={{
          width:"100%", height:"100%",
          position:"absolute", left:0, top:0,
          textAlign:"center",
          transformStyle:"preserve-3d",
          zIndex: 60,
          transformOrigin: "100% 50%",
          transition: T06,
          /* NeonAlloys style-nickel.css: .rm-right { transition-delay: 0s }
             Constant 0s delay — right page always opens/closes first. */
          transitionDelay: "0s",
          transform: isOpen ? "rotateY(180deg)" : "rotateY(0deg)",
        }}>
          {/* FRONT FACE — plain white paper.
              Visible during 0°→90° animation sweep, hidden at 180° (backfaceVisibility:hidden). */}
          <div style={{
            width:"100%", height:"100%",
            position:"absolute",
            background: C_PAPER,
            boxShadow: PAGE_INSET,
            backfaceVisibility: "hidden",
          }} />

          {/* BACK FACE — TITANIUM + NICKEL ALLOYS + Regd. Office footer.
              Pre-rotated rotateY(180°): when rm-right is at 180°, net rotation = 0°
              → faces viewer directly → text appears READABLE (non-mirrored).
              This matches the rm-cover / rm-back pattern exactly. */}
          <div style={{
            width:"100%", height:"100%",
            position:"absolute", padding:"10px 0 0 0",
            background: C_PAPER,
            boxShadow: PAGE_INSET,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            overflow:"hidden",
          }}>
            <div style={{padding:"10px 28px"}}>
              {RIGHT_SECTIONS.map((s,i)=>(
                <Family key={s.header} header={s.header} first={i===0} items={s.items} onSelect={selectGrade}/>
              ))}
            </div>
            {/* Siyak Regd. Office — exact NeonAlloys green bottom band */}
            <div style={{
              position:"absolute",
              left:0, right:0, bottom:0,
              background:C_GREEN,
              padding:"14px 10px",
              color:"#fff",
              fontSize:13,
              fontFamily:"Arial,Helvetica,sans-serif",
              lineHeight:1.5,
              fontWeight:500,
              textAlign:"center",
            }}>
              <strong>Regd. Office</strong><br/>
              {companyInfo.address}<br/>
              Tel: {companyInfo.phones[0]}<br/>
              Email: {companyInfo.emails[0]}
            </div>
          </div>
        </div>
        {/* END rm-right */}

      </div>
      {/* END rm-wrapper */}

      </div>
      {/* END rm-container */}

      {/* Product detail modal — rendered via portal to document.body,
          completely outside the 3D transform context. */}
      {isModal && detail && <ProductDetailModal name={detail} onClose={closeDetail} />}
    </div>
  );
}
