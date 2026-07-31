// Product catalogue data — sourced from Siyak Steel International's
// real product line (carried over from the company's existing site).
// The first eight categories have real client-supplied product photography
// (src/assets/products/*.jpg — fasteners, plates-sheets, round-bar-wire and
// perforated-sheets were cropped from the client's composite product photo).
// Electropolished Fittings, Electropolished Pipe, Instrument Fittings,
// Valves and Wire Mesh now also have real photography
// (src/assets/products/*.webp) — every category has a real product photo.

import pipesTubesImg from "../assets/products/pipes-tubes-notext.jpg";
import stainlessSteelPipesTubesImg from "../assets/products/stainless-steel-pipes-tubes.webp";
import carbonSteelPipesTubesImg from "../assets/products/carbon-steel-pipes-tubes.webp";
import duplexSuperDuplexPipesTubesImg from "../assets/products/duplex-super-duplex-pipes-tubes.webp";
import alloySteelPipeTubeImg from "../assets/products/alloy-steel-pipe-tube.webp";
import copperAlloyPipesTubesImg from "../assets/products/copper-alloy-pipes-tubes.webp";
import nickelFlangesImg from "../assets/products/nickel-flanges.webp";
import stainlessSteelFlangesImg from "../assets/products/stainless-steel-flanges.webp";
import carbonSteelFlangesImg from "../assets/products/carbon-steel-flanges.webp";
import alloySteelFlangesImg from "../assets/products/alloy-steel-flanges.webp";
import duplexSuperDuplexFlangesImg from "../assets/products/duplex-super-duplex-flanges.webp";
import copperNickelFlangesImg from "../assets/products/copper-nickel-flanges.webp";
import buttWeldedImg from "../assets/products/butt-welded-fittings-hq.webp";
import alloyButtWeldImg from "../assets/products/alloy-butt-weld.webp";
import stainlessButtWeldImg from "../assets/products/stainless-butt-weld.webp";
import duplexButtWeldImg from "../assets/products/duplex-butt-weld.webp";
import nickelAlloyButtWeldImg from "../assets/products/nickel-alloy-butt-weld.webp";
import copperNickelButtWeldImg from "../assets/products/copper-nickel-butt-weld.webp";
import flangesImg from "../assets/products/stainless-steel-flanges.webp";
import forgedFittingsImg from "../assets/products/forged-fittings-notext.jpg";
import stainlessForgedFittingsImg from "../assets/products/stainless-forged-fittings.webp";
import alloyForgedFittingsImg from "../assets/products/alloy-forged-fittings.webp";
import nickelForgedFittingsImg from "../assets/products/nickel-forged-fittings.webp";
import fastenersImg from "../assets/products/fasteners-notext.jpg";
import stainlessFastenersImg from "../assets/products/stainless-fasteners.webp";
import alloyFastenersImg from "../assets/products/alloy-fasteners.webp";
import duplexFastenersImg from "../assets/products/duplex-fasteners.webp";
import nickelFastenersImg from "../assets/products/nickel-fasteners.webp";
import platesSheetsImg from "../assets/products/plates-sheets-notext.jpg";
import carbonSteelPlatesSheetsImg from "../assets/products/carbon-steel-plates-sheets.webp";
import alloySteelPlatesImg from "../assets/products/alloy-steel-plates.webp";
import nickelAlloyPlatesSheetsImg from "../assets/products/nickel-alloy-plates-sheets.webp";
import roundBarWireImg from "../assets/products/round-bar-wire-notext.jpg";
import alloySteelBarImg from "../assets/products/alloy-steel-bar.webp";
import carbonSteelBarWireImg from "../assets/products/carbon-steel-bar-wire.webp";
import nickelAlloyRoundBarImg from "../assets/products/nickel-alloy-round-bar.webp";
import copperNickelRoundBarImg from "../assets/products/copper-nickel-round-bar.webp";
import perforatedSheetsImg from "../assets/products/perforated-sheets-notext.jpg";
import mildSteelPerforatedImg from "../assets/products/mild-steel-perforated.webp";
import aluminiumPerforatedImg from "../assets/products/aluminium-perforated.webp";
import electropolishedFittingsImg from "../assets/products/electropolished-fittings.webp";
import electropolishedPipeImg from "../assets/products/electropolished-pipe.webp";
import instrumentFittingsImg from "../assets/products/instrument-fittings.webp";
import brassInstrumentFittingsImg from "../assets/products/brass-instrument-fittings.webp";
import monelInstrumentFittingsImg from "../assets/products/monel-instrument-fittings.webp";
import valvesImg from "../assets/products/valves.webp";
import carbonSteelValvesImg from "../assets/products/carbon-steel-valves.webp";
import alloySteelValvesImg from "../assets/products/alloy-steel-valves.webp";
import wireMeshImg from "../assets/products/wire-mesh.webp";
import carbonSteelWireMeshImg from "../assets/products/carbon-steel-wire-mesh.webp";
import galvanizedWireMeshImg from "../assets/products/galvanized-wire-mesh.webp";
import anglesChannelsImg from "../assets/products/angles-channels.webp";
import tubeSheetImg from "../assets/products/tube-sheet.webp";
import aerospaceImg from "../assets/industries/aerospace.webp";
import automobileImg from "../assets/industries/automobile.webp";
import cementImg from "../assets/industries/cement.webp";
import oilGasImg from "../assets/industries/oil-gas.jpg";
import powerImg from "../assets/industries/power.webp";
import pharmaImg from "../assets/industries/pharma.webp";
import paperImg from "../assets/industries/paper.webp";
import railwayImg from "../assets/industries/railway.webp";
import { ALLOYS, alloyVariant } from "./alloyReference";
import { STEEL, steelVariant } from "./steelReference";

export const productCategories = [
  {
    slug: "pipes-tubes",
    name: "Pipes & Tubes",
    short: "We are a well-known manufacturer of steel pipes and tubes that are available in varied grades of stainless steel, carbon steel & nickel alloys.",
    grades: ["Nickel 200/201", "Monel 400/K500", "Inconel 600/601/625/825", "Alloy 20/CB3", "Hastelloy C276", "Cu-Ni 90/10 & 70/30", "SS 304 to 904L", "Duplex UNS S31803/S32760", "Carbon Steel A53/A106/API 5L", "Alloy Steel A335 P1-P91"],
    sizes: "15 NB UP TO 1200 NB IN SCH 5S, 10S, 10, 20, 40S, 40, STD, 60, 80S, 80, XS, 100, 120, 140, 160 & XXS",
    standards: ["ASTM/ASME SA 312", "SA 358", "SA 790", "A53", "A106", "A335", "A691", "SB 111", "SB 163", "SB 167", "SB 464", "SB 466", "SB 619", "SB 704/705"],
    form: "SEAMLESS / ERW / WELDED IN ROUND & SQUARE.",
    items: ["Seamless Pipes & Tubes", "ERW Welded Pipes & Tubes", "Round Pipes", "Square Pipes", "U-Tubes / Heat Exchanger Tubes"],
    image: pipesTubesImg,
    // Material sub-types are grouped the way buyers actually shop a pipe line:
    // broad alloy families (Stainless, Duplex, Carbon, Alloy Steel) sit as
    // standalone entries, while the various high-nickel superalloys — which
    // share one spec sheet layout and are always compared side-by-side — are
    // nested under a single "Nickel Alloy Pipes & Tubes" family so the sidebar
    // stays a clean 6-item list instead of 16 flat entries. Opening the family
    // reveals its individual grade pages, each carrying its own chemical
    // composition and standards-equivalent tables.
    materialTypes: [
      {
        name: "Nickel Alloy Pipes & Tubes",
        grades: ["Nickel 200/201", "Monel 400/K500", "Inconel 600/601/625", "Incoloy 800/825", "Alloy 20", "Hastelloy B2/C22/C276"],
        image: pipesTubesImg,
        desc: `Manufacturers & Exporters of Nickel Alloy Pipes & Tubes, Nickel Alloy 200/201 Seamless Pipes & Seamless Tubes, Nickel 200/201 Welded Pipes & Welded Tubes in India.\n\nLeading Manufacturer and Exporter of Nickel Alloy Pipes & Tubes from Mumbai.\n\nAdopting the highest industry standards, we manufacture finest range of nickel and copper alloy pipes. These pipes are fabricated from qualitative raw material as per global demand and ensure accurate precision. Available in wide range of technical specifications, our comprehensive range is highly acknowledged in Indian as well as overseas market for their attributes of high strength, excellent finish, and complete reliability in-services.\n\nWe offer superior quality nickel alloy tubes and nickel alloy pipes, tubes and pipes that are widely used where they are subjected to harsh environments at high temperatures. These products find application in water treatment, petrochemical and oil industries. Our complete range is tested on variety of international parameters to ensure zero defect products. These nickel alloy pipes and nickel alloy tubes are offered in various grades and specifications.\n\nOur product includes tubes and pipes, Nickel 200 Pipes, Nickel 201 Pipes, Nickel 200 Tubes, Nickel 201 Tubes etc. These products are available at best possible prices which is another important feature exhibited by our products range.\n\nMonel 400/K500 Pipes, Inconel 600/625 Tubes, Incoloy 800/825 Pipes & Tubes, Hastelloy B2/C22/C276 Seamless Pipes & Tubes, Alloy 20 Welded Pipes & Welded Tubes Supplier & Exporter in India.`,
        gradeText: `ASTM / ASME SB 163 UNS 2200 ( NICKEL 200 )\nASTM / ASME SB 163 UNS 2201 (NICKEL 201 )\nASTM / ASME SB 163 / 165 UNS 4400 (MONEL 400 )\nASTM / ASME SB 464 UNS 8020 ( ALLOY 20 / 20 CB 3 )\nASTM / ASME SB 704/705 UNS 8825 INCONEL (825)\nASTM / ASME SB 167 / 517 UNS 6600 (INCONEL 600 )\nASTM / ASME SB 167 UNS 6601 ( INCONEL 601 )\nASTM / ASME SB 704 /705 UNS 6625 (INCONEL 625)\nASTM / ASME SB 619/622/626 UNS 10276 ( HASTELLOY C 276 )`,
        exportHeading: "EXPORT DESTINATIONS FOR NICKEL ALLOY PIPES, NICKEL ALLOY TUBES, NICKEL ALLOY SEAMLESS PIPES, NICKEL ALLOY WELDED TUBES",
        specTables: [
          {
            title: "High Nickel Pipes & Tubes Chemical Composition",
            headers: ["Element", "Value"],
            rows: [
              ["Ni", "99.0 min"],
              ["Fe", "0.4 max"],
              ["C",  "0.15 max"],
              ["Mn", "0.35 max"],
              ["Si", "0.1 max"],
              ["Cu", "0.25 max"],
              ["Mg", ""],
              ["Ti", ""],
              ["S",  "0.01 max"],
            ],
          },
          {
            title: "High Nickel Standards Cross Reference",
            headers: ["STANDARD", "UNS", "WERKSTOFF NR.", "EN", "BS", "GOST", "JIS", "AFNOR"],
            rows: [
              ["Nickel 200", "N02200", "2.4066", "Ni 99.2", "NA 11", "НП-2", "NW 2200", "N-100M"],
            ],
          },
          {
            title: "Other Types of High Nickel Alloy Pipes & Nickel Alloy Tubes",
            headers: ["Pipes", "Tubes"],
            rows: [
              ["Nickel Alloy 200 Pipes", "Nickel Alloy 201 Tubes"],
              ["Nickel Alloy 200 Seamless & Welded Pipes", "Nickel Alloy 200 Seamless & Welded Tubes"],
              ["Nickel 200 Seamless Tubes", "Nickel 201 Welded Pipes"],
              ["Monel 400/K500 Pipes & Tubes", "Inconel 600/625 Seamless Pipes"],
              ["Inconel 800/825 Welded Pipes", "Hastelloy B2/C22/C276 Pipes"],
              ["Hastelloy B2/C22/C276 Tubes", "Alloy 20 Pipes & Tubes"],
            ],
          },
        ],
        variants: [
          alloyVariant(ALLOYS.ni200, { 
            name: "Nickel Alloy 200 Pipes & Tubes", 
            sizes: "Seamless 1/2\" - 10\", Welded 1/2\" - 48\"",
            type: "Seamless / ERW / Welded / Fabricated / LSAW Pipes",
            form: "Round, Square, Rectangular, Hydraulic Etc.",
            end: "Plain End, Beveled End, Threaded",
            length: "Single Random, Double Random & Cut Length",
            standards: ["ASTM / ASME SB 163"],
            desc: "We are a well-known manufacturer & exporter of Nickel 200 Pipe & Tubes. Nickel 200 Pipe are usually used in industries such as construction, oil extraction, medicine, food, paper, machinery, chemicals, food containers and others. Nickel Alloy 200 is technically pure nickel with good mechanical properties and excellent resistance to alkali hydroxides as well as organic compositions. Even when exposed to high temperature, Alloy 200 retain its strength and is ductile at low temperature. The Nickel 200 Pipes & Tubes are manufactured to sustain very high pressure and product warranty. Designed as per international and national standards, these Nickel 200 Seamless Pipes & Tubes are offered in customized length sizes and shapes. Also referred as UNS N02200 / Werkstoff Nr. 2.4066.",
            chem: [
              ["Ni", "99.0 min"], ["Fe", "0.4 max"], ["C", "0.15 max"], ["Mn", "0.35 max"],
              ["Si", "0.1 max"], ["Cu", "0.25 max"], ["S", "0.01 max"],
            ],
            standardsEquiv: [
              ["Standard", "UNS", "Werkstoff Nr.", "EN", "BS", "GOST", "JIS", "AFNOR"],
              ["Nickel 200", "N02200", "2.4066", "Ni 99.2", "NA 11", "НП-2", "NW 2200", "N-100M"],
            ],
          }),
          alloyVariant(ALLOYS.ni201, { name: "Nickel Alloy 201 Pipes & Tubes", sizes: "1/8\" NB to 12\" NB (Pipes); 6mm to 101.6mm OD (Tubes)" }),
          alloyVariant(ALLOYS.monel400, { 
            name: "Monel 400 Pipes & Tubes", 
            sizes: "15\" NB TO 150\" NB IN",
            type: "Seamless / ERW / Welded / Fabricated / CDW",
            form: "Round, Square, Rectangular, Hydraulic Etc.",
            end: "Plain End, Beveled End, Threaded",
            length: "Single Random, Double Random & Cut Length",
            standards: ["ASTM / ASME SB 163 / 165", "Seamless Pipes & Tubes — B 161 / SB 163", "Welded Pipes & Tubes — B 725 / SB 775"],
            desc: "We are manufacturers and exporters of Monel 400 Pipes and Tubes, fabricated from high quality raw materials. As monel resists to stress, corrosion & cracking in fresh waters, these Monel 400 pipes and tubes are immensely used in the marine industries. Available in the coil, square, round, rectangular & 'U' shape, and others are available in horn tube, capillary tube, IBR tube, and precision tube, hydraulic tube, boiler tube. Grade UNS N04400 / Werkstoff Nr. 2.4360.",
            standardsEquiv: [
              ["Standard", "UNS", "Werkstoff Nr.", "EN", "BS", "GOST", "JIS", "AFNOR"],
              ["Monel 400", "N04400", "2.4360", "NiCu30Fe", "NA 13", "МНЖМц 28-2,5-1,5", "NW 4400", "NU-30M"],
            ],
          }),
          alloyVariant(ALLOYS.monelK500, { name: "Monel K500 Pipes & Tubes", sizes: "1/8\" NB to 8\" NB (Pipes); 6mm to 76.2mm OD (Tubes)" }),
          alloyVariant(ALLOYS.inconel600, { name: "Inconel 600 Pipes & Tubes", sizes: "1/8\" NB to 12\" NB (Pipes); 6mm to 101.6mm OD (Tubes)" }),
          alloyVariant(ALLOYS.inconel601, { name: "Inconel 601 Pipes & Tubes", sizes: "1/8\" NB to 12\" NB (Pipes); 6mm to 101.6mm OD (Tubes)" }),
          alloyVariant(ALLOYS.inconel625, { 
            name: "Inconel 625 Pipes & Tubes", 
            sizes: "15\" NB TO 150\" NB IN",
            type: "Seamless / ERW / Welded / Fabricated / CDW",
            form: "Round, Square, Rectangular, Hydraulic Etc.",
            end: "Plain End, Beveled End, Threaded",
            length: "Single Random, Double Random & Cut Length",
            standards: ["ASME SB-444", "ASME SB-775", "ASME SB-725"],
            desc: "We manufacture Inconel 625 Pipes & Tubes using high-grade metal alloys. These pipes are proven to dispatch a longer duration of service life with the rust-free features. Owing to its remarkable quality and design, it is widely used in oil refineries and chemical industries. Alloy 625 has excellent fatigue strength and stress-corrosion cracking resistance to chloride ions. Excellent weldability and is frequently used to weld AL-6XN. Resists a wide range of severely corrosive environments and is especially resistant to pitting and crevice corrosion. Used in chemical processing, aerospace and marine engineering, pollution-control equipment, and nuclear reactors. Grade UNS N06625 / Werkstoff Nr. 2.4856.",
            chem: [
              ["Nickel", "58 min."], ["Cromium (Cr)", "20.0 - 23.0"], ["Iron", "5.0 max."], ["Molybdenum", "8.0 - 10.0"],
              ["Niobium + Tantalum", "3.15 - 4.15 max."], ["Carbon", "0.010 max."], ["Manganese", "0.50 max."], ["Silicon", "0.50 max"],
              ["Phosphorus", "0.015 max."], ["Sulfur", "0.015 max."], ["Aluminium", "0.40 max."], ["Titanium", "0.40 max."], ["Cobalt", "1.0 max."],
            ],
            standardsEquiv: [
              ["Standard", "UNS", "Werkstoff Nr.", "EN", "GOST / OR", "BS", "GOST", "JIS", "AFNOR"],
              ["Inconel 625", "N06625", "2.4856", "NiCr22Mo9Nb", "ЭИ602", "NA 21", "ХН75МБТЮ", "NCF 625", "NC22DNB4M"],
            ],
          }),
          alloyVariant(ALLOYS.incoloy800, { name: "Inconel 800 Pipes & Tubes", sizes: "1/8\" NB to 12\" NB (Pipes); 6mm to 101.6mm OD (Tubes)" }),
          alloyVariant(ALLOYS.incoloy825, { name: "Inconel 825 Pipes & Tubes", sizes: "1/8\" NB to 12\" NB (Pipes); 6mm to 101.6mm OD (Tubes)" }),
          alloyVariant(ALLOYS.alloy20, { name: "Alloy 20 Pipes & Tubes", sizes: "1/8\" NB to 12\" NB (Pipes); 6mm to 101.6mm OD (Tubes)" }),
          alloyVariant(ALLOYS.hastelloyC276, { 
            name: "Hastelloy C276 Pipes & Tubes", 
            sizes: "1/2\" NB TO 12\" NB IN",
            type: "Seamless / ERW / Welded / Fabricated / CDW",
            form: "Round, Square, Rectangular, Hydraulic Etc.",
            end: "Plain End, Beveled End, Threaded",
            length: "Single Random, Double Random & Cut Length",
            standards: ["ASTM / ASME B622", "B619", "B626"],
            desc: "With the help of latest technology and sophisticated, we have been able to offer a wide range of high quality of Hastelloy C276 Pipes & Tubes to our esteemed customers. Range of Hastelloy tubes comprises Seamless Hastelloy Tubes, ERW Hastelloy Tubes, Welded Hastelloy Tubes and CDW Hastelloy Tubes. Range of Hastelloy Pipes includes Seamless Hastelloy Pipes, ERW Hastelloy Pipes, Welded Hastelloy pipes and fabricated Hastelloy Pipes. Used for manufacturing digester and bleachers that are used in paper pulp and paper making industry. Also used for processing impure phosphoric acid. Grade UNS N10276 / Werkstoff Nr. 2.4819.",
            chem: [
              ["", "Ni", "Fe", "C", "Mn", "Si", "Cu", "Cr", "Mo", "S", "P", "N"],
              ["Hastelloy C276", "bal", "Bal", "0.01 max", "1.0 max", "0.08 max", "3 - 4", "14.5 - 16.5", "15 - 17", "0.03 max", "0.04 max", "bal"],
            ],
            standardsEquiv: [
              ["Standard", "UNS", "Werkstoff Nr.", "EN", "JIS", "GOST", "AFNOR", "OR"],
              ["Hastelloy C276", "N10276", "2.4819", "NiMo16Cr15W", "NW 0276", "ХН65МВУ", "-", "ЭП760"],
              ["Hastelloy C22",  "N06022", "2.4602", "NiCr21Mo14W", "NW 6022", "-",        "-", "-"],
              ["Hastelloy B2",   "N10665", "2.4617", "-",              "-",        "-",        "-", "-"],
            ],
          }),
        ],
      },
      {
        name: "Stainless Steel Pipes & Tubes",
        grades: ["SS 304 to 347H", "SS 904L", "ASTM A312/A358"],
        desc: `Stainless Steel Pipes, SS Tubes, SS Pipes, Stainless Steel Seamless Pipes & Seamless Tubes Supplier & Exporter in India.\n\nStainless steel pipe & Tubes is utilized for many conveyance and structural applications where resistance to corrosion is an important attribute. We maintain inventories of both welded and seamless pipe. Our range of stainless steel pipes, ERW stainless steel pipes and duplex steel pipes are offered as per the standard dimensions and the international quality and safety standards. These pipes are highly durable, reliable, corrosion resistant and possess high strength.\n\nAll Stainless Steel Pipes & Stainless Steel Tubes is manufactured and inspected/tested to the relevant standards including ASTM, ASME and API etc.\n\nOffered products are manufactured using premium quality stainless steel and ultra-modern technology in compliance with international standards. Apart from this, clients can avail these pipes and tubes from us in various specifications.\n\nStainless Steel 304/304L ERW Pipes, SS 316/316l Seamless Pipes, Steel 310/310S Welded Tubes, Stainless Steel 347/347H EFW Pipes & Tubes Manufacturer in India.`,
        gradeText: `ASTM / ASME SA 312 TP 304, ASTM / ASME SA 312 304L, ASTM / ASME SA 312 304H, ASTM / ASME SA 312 309S, ASTM / ASME SA 312 309H, ASTM / ASME SA 312 310S, ASTM / ASME SA 312 310H, ASTM / ASME SA 312 316, ASTM / ASME SA 312 316L, ASTM / ASME SA 312 316TI, ASTM / ASME SA 312 316H, ASTM / ASME SA 312 316 LN, ASTM / ASME SA 312 317, ASTM / ASME SA 312 317L, ASTM / ASME SA 312 321, ASTM / ASME SA 312 321H, ASTM / ASME SA 312 347, ASTM / ASME SA 312 347 H, ASTM / ASME SA 312 904L\nWelded: ASTM / ASME SA 358 CL 1 & CL 3 GR. 304, 304L, 304H, 309S, 309H, 310S, 310H, 316, 316H, 321, 321H, 347`,
        exportHeading: "EXPORT DESTINATIONS FOR STEEL PIPES, SS TUBES, STAINLESS STEEL PIPES, SS PIPES, STEEL TUBES, STEEL SEAMLESS PIPES & TUBES",
        image: stainlessSteelPipesTubesImg,
        specTables: [
          {
            title: "Stainless Steel Pipes & Tubes — Grades Available, Type & Size",
            headers: ["Attribute", "Seamless", "Welded / EFW"],
            rows: [
              ["Grades Available", "ASTM / ASME SA 312 TP 304\nASTM / ASME SA 312 304L\nASTM / ASME SA 312 304H\nASTM / ASME SA 312 309S\nASTM / ASME SA 312 309H\nASTM / ASME SA 312 310S\nASTM / ASME SA 312 310H\nASTM / ASME SA 312 316\nASTM / ASME SA 312 316L\nASTM / ASME SA 312 316TI\nASTM / ASME SA 312 316H\nASTM / ASME SA 312 316 LN\nASTM / ASME SA 312 317\nASTM / ASME SA 312 317L\nASTM / ASME SA 312 321\nASTM / ASME SA 312 321H\nASTM / ASME SA 312 347\nASTM / ASME SA 312 347 H\nASTM / ASME SA 312 904L", "ASTM / ASME SA 358 CL 1 & CL 3 GR. 304\nASTM / ASME SA 358 CL 1 & CL 3 GR 304L\nASTM / ASME SA 358 CL 1 & CL 3 GR 304H\nASTM / ASME SA 358 CL 1 & CL 3 GR 309S\nASTM / ASME SA 358 CL 1 & CL 3 GR 309H\nASTM / ASME SA 358 CL 1 & CL 3 GR 310S\nASTM / ASME SA 358 CL 1 & CL 3 GR 310H\nASTM / ASME SA 358 CL 1 & CL 3 GR 316\nASTM / ASME SA 358 CL 1 & CL 3 GR 316H\nASTM / ASME SA 358 CL 1 & CL 3 GR 321\nASTM / ASME SA 358 CL 1 & CL 3 GR 321H\nASTM / ASME SA 358 CL 1 & CL 3 GR 347"],
              ["Type", "Seamless & Welded", ""],
              ["Size", "Upto 24\"", ""],
            ],
          },
          {
            title: "Other Types of Stainless Steel Pipes & Stainless Steel Tubes",
            headers: ["Stainless Pipes", "Stainless Tubes"],
            rows: [
              ["Stainless Steel Pipes", "Stainless Steel Tubes"],
              ["Stainless Steel Seamless Pipes", "Stainless Steel Seamless Tubes"],
              ["Stainless Steel Welded Tubes", "Stainless Steel Welded Pipes"],
              ["SS Pipes & Tubes", "SS Seamless Pipes"],
              ["SS Welded Pipes", "SS Pipes"],
              ["SS Tubes", "Steel Pipes & Tubes"],
              ["Stainless 304/304L Pipes", "SS 310/310S Pipe & Tube"],
              ["Stainless Steel 316/316L Pipes", "Stainless 446 Pipes & Tubes"],
            ],
          },
        ],
        variants: [
          steelVariant(STEEL.ss304, { 
            name: "SS 304 Pipes & Tubes", 
            sizes: "1/8\" NB to 30\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
            type: "Seamless / ERW / Welded / Fabricated / EFW",
            form: "Round, Square, Rectangular, Hydraulic Etc",
            schedule: "SCH20, SCH30, SCH40, STD, SCH80, XS, SCH60, SCH80, SCH120, SCH140, SCH160, XXS",
            end: "Plain End, Beveled End, Treaded",
            length: "Single Random, Double Random & Cut Length",
            desc: "SS 304 Pipes & Tubes (UNS S30400) are austenitic stainless steel grades with excellent corrosion resistance, widely used in chemical processing, food and beverage, and general piping applications. Available in seamless, ERW, welded, and EFW configurations."
          }),
          steelVariant(STEEL.ss304l, { 
            name: "SS 304L Pipes & Tubes", 
            sizes: "1/8\" NB to 30\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
            type: "Seamless / ERW / Welded / Fabricated / EFW",
            form: "Round, Square, Rectangular, Hydraulic Etc",
            schedule: "SCH20, SCH30, SCH40, STD, SCH80, XS, SCH60, SCH80, SCH120, SCH140, SCH160, XXS",
            end: "Plain End, Beveled End, Treaded",
            length: "Single Random, Double Random & Cut Length",
            desc: "SS 304L Pipes & Tubes (UNS S30403) are low-carbon versions of 304 stainless steel, offering excellent resistance to intergranular corrosion after welding. Ideal for welded applications in chemical and petrochemical industries."
          }),
          steelVariant(STEEL.ss304h, { 
            name: "SS 304H Pipes & Tubes", 
            sizes: "1/8\" NB to 30\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
            type: "Seamless / ERW / Welded / Fabricated / EFW",
            form: "Round, Square, Rectangular, Hydraulic Etc",
            schedule: "SCH20, SCH30, SCH40, STD, SCH80, XS, SCH60, SCH80, SCH120, SCH140, SCH160, XXS",
            end: "Plain End, Beveled End, Treaded",
            length: "Single Random, Double Random & Cut Length",
            desc: "SS 304H Pipes & Tubes are high-carbon variants of 304 stainless steel, providing enhanced strength at elevated temperatures. Suitable for high-temperature applications in power generation and industrial furnaces."
          }),
          steelVariant(STEEL.ss309s, { 
            name: "SS 309S Pipes & Tubes", 
            sizes: "1/8\" NB to 30\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
            type: "Seamless / ERW / Welded / Fabricated / EFW",
            form: "Round, Square, Rectangular, Hydraulic Etc",
            schedule: "SCH20, SCH30, SCH40, STD, SCH80, XS, SCH60, SCH80, SCH120, SCH140, SCH160, XXS",
            end: "Plain End, Beveled End, Treaded",
            length: "Single Random, Double Random & Cut Length",
            desc: "SS 309S Pipes & Tubes offer excellent high-temperature oxidation resistance up to 1035°C. Used in heat exchangers, furnace parts, and other high-temperature industrial applications."
          }),
          steelVariant(STEEL.ss309h, { 
            name: "SS 309H Pipes & Tubes", 
            sizes: "1/8\" NB to 30\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
            type: "Seamless / ERW / Welded / Fabricated / EFW",
            form: "Round, Square, Rectangular, Hydraulic Etc",
            schedule: "SCH20, SCH30, SCH40, STD, SCH80, XS, SCH60, SCH80, SCH120, SCH140, SCH160, XXS",
            end: "Plain End, Beveled End, Treaded",
            length: "Single Random, Double Random & Cut Length",
            desc: "SS 309H Pipes & Tubes are high-carbon versions of 309 stainless steel, providing improved creep strength at elevated temperatures. Perfect for heat treatment equipment and furnace components."
          }),
          steelVariant(STEEL.ss310s, { 
            name: "SS 310S Pipes & Tubes", 
            sizes: "1/8\" NB to 30\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
            type: "Seamless / ERW / Welded / Fabricated / EFW",
            form: "Round, Square, Rectangular, Hydraulic Etc",
            schedule: "SCH20, SCH30, SCH40, STD, SCH80, XS, SCH60, SCH80, SCH120, SCH140, SCH160, XXS",
            end: "Plain End, Beveled End, Treaded",
            length: "Single Random, Double Random & Cut Length",
            desc: "SS 310S Pipes & Tubes offer excellent resistance to oxidation up to 1035°C and high temperature strength. Widely used in thermal processing, heat exchangers, and chemical processing industries."
          }),
          steelVariant(STEEL.ss310h, { 
            name: "SS 310H Pipes & Tubes", 
            sizes: "1/8\" NB to 30\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
            type: "Seamless / ERW / Welded / Fabricated / EFW",
            form: "Round, Square, Rectangular, Hydraulic Etc",
            schedule: "SCH20, SCH30, SCH40, STD, SCH80, XS, SCH60, SCH80, SCH120, SCH140, SCH160, XXS",
            end: "Plain End, Beveled End, Treaded",
            length: "Single Random, Double Random & Cut Length",
            desc: "SS 310H Pipes & Tubes are high-carbon stainless steel grades optimized for high-temperature creep and strength. Ideal for power generation, incinerators, and industrial furnace applications."
          }),
          steelVariant(STEEL.ss316, { 
            name: "SS 316 Pipes & Tubes", 
            sizes: "1/8\" NB to 30\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
            type: "Seamless / ERW / Welded / Fabricated / EFW",
            form: "Round, Square, Rectangular, Hydraulic Etc",
            schedule: "SCH20, SCH30, SCH40, STD, SCH80, XS, SCH60, SCH80, SCH120, SCH140, SCH160, XXS",
            end: "Plain End, Beveled End, Treaded",
            length: "Single Random, Double Random & Cut Length",
            desc: "SS 316 Pipes & Tubes (UNS S31600) offer superior corrosion resistance compared to 304, especially against chlorides and chemical environments. Perfect for marine, pharmaceutical, and food processing applications."
          }),
          steelVariant(STEEL.ss316l, { 
            name: "SS 316L Pipes & Tubes", 
            sizes: "1/8\" NB to 30\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
            type: "Seamless / ERW / Welded / Fabricated / EFW",
            form: "Round, Square, Rectangular, Hydraulic Etc",
            schedule: "SCH20, SCH30, SCH40, STD, SCH80, XS, SCH60, SCH80, SCH120, SCH140, SCH160, XXS",
            end: "Plain End, Beveled End, Treaded",
            length: "Single Random, Double Random & Cut Length",
            desc: "SS 316L Pipes & Tubes (UNS S31603) are low-carbon versions of 316 stainless steel, providing excellent resistance to intergranular corrosion. Widely used in chemical processing, pulp and paper, and marine applications."
          }),
          steelVariant(STEEL.ss316ti, { 
            name: "SS 316Ti Pipes & Tubes", 
            sizes: "1/8\" NB to 30\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
            type: "Seamless / ERW / Welded / Fabricated / EFW",
            form: "Round, Square, Rectangular, Hydraulic Etc",
            schedule: "SCH20, SCH30, SCH40, STD, SCH80, XS, SCH60, SCH80, SCH120, SCH140, SCH160, XXS",
            end: "Plain End, Beveled End, Treaded",
            length: "Single Random, Double Random & Cut Length",
            desc: "SS 316Ti Pipes & Tubes are titanium-stabilized stainless steel grades, offering excellent resistance to intergranular corrosion even after welding. Suitable for high-temperature process equipment."
          }),
          steelVariant(STEEL.ss316h, { 
            name: "SS 316H Pipes & Tubes", 
            sizes: "1/8\" NB to 30\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
            type: "Seamless / ERW / Welded / Fabricated / EFW",
            form: "Round, Square, Rectangular, Hydraulic Etc",
            schedule: "SCH20, SCH30, SCH40, STD, SCH80, XS, SCH60, SCH80, SCH120, SCH140, SCH160, XXS",
            end: "Plain End, Beveled End, Treaded",
            length: "Single Random, Double Random & Cut Length",
            desc: "SS 316H Pipes & Tubes are high-carbon stainless steel grades, providing enhanced creep and stress-rupture strength at elevated temperatures. Used in power generation and high-temperature process piping."
          }),
          steelVariant(STEEL.ss316ln, { 
            name: "SS 316LN Pipes & Tubes", 
            sizes: "1/8\" NB to 30\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
            type: "Seamless / ERW / Welded / Fabricated / EFW",
            form: "Round, Square, Rectangular, Hydraulic Etc",
            schedule: "SCH20, SCH30, SCH40, STD, SCH80, XS, SCH60, SCH80, SCH120, SCH140, SCH160, XXS",
            end: "Plain End, Beveled End, Treaded",
            length: "Single Random, Double Random & Cut Length",
            desc: "SS 316LN Pipes & Tubes are nitrogen-alloyed, low-carbon stainless steel grades, offering improved strength and corrosion resistance. Used in cryogenic applications and chemical processing."
          }),
          steelVariant(STEEL.ss317, { 
            name: "SS 317 Pipes & Tubes", 
            sizes: "1/8\" NB to 30\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
            type: "Seamless / ERW / Welded / Fabricated / EFW",
            form: "Round, Square, Rectangular, Hydraulic Etc",
            schedule: "SCH20, SCH30, SCH40, STD, SCH80, XS, SCH60, SCH80, SCH120, SCH140, SCH160, XXS",
            end: "Plain End, Beveled End, Treaded",
            length: "Single Random, Double Random & Cut Length",
            desc: "SS 317 Pipes & Tubes offer improved resistance to pitting and crevice corrosion compared to 316 stainless steel. Ideal for chemical processing, pulp and paper, and marine applications."
          }),
          steelVariant(STEEL.ss317l, { 
            name: "SS 317L Pipes & Tubes", 
            sizes: "1/8\" NB to 30\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
            type: "Seamless / ERW / Welded / Fabricated / EFW",
            form: "Round, Square, Rectangular, Hydraulic Etc",
            schedule: "SCH20, SCH30, SCH40, STD, SCH80, XS, SCH60, SCH80, SCH120, SCH140, SCH160, XXS",
            end: "Plain End, Beveled End, Treaded",
            length: "Single Random, Double Random & Cut Length",
            desc: "SS 317L Pipes & Tubes are low-carbon versions of 317 stainless steel, providing excellent resistance to intergranular corrosion. Perfect for welded chemical processing equipment."
          }),
          steelVariant(STEEL.ss321, { 
            name: "SS 321 Pipes & Tubes", 
            sizes: "1/8\" NB to 30\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
            type: "Seamless / ERW / Welded / Fabricated / EFW",
            form: "Round, Square, Rectangular, Hydraulic Etc",
            schedule: "SCH20, SCH30, SCH40, STD, SCH80, XS, SCH60, SCH80, SCH120, SCH140, SCH160, XXS",
            end: "Plain End, Beveled End, Treaded",
            length: "Single Random, Double Random & Cut Length",
            desc: "SS 321 Pipes & Tubes are titanium-stabilized stainless steel grades, offering excellent resistance to intergranular corrosion. Widely used in aerospace, chemical processing, and power generation."
          }),
          steelVariant(STEEL.ss321h, { 
            name: "SS 321H Pipes & Tubes", 
            sizes: "1/8\" NB to 30\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
            type: "Seamless / ERW / Welded / Fabricated / EFW",
            form: "Round, Square, Rectangular, Hydraulic Etc",
            schedule: "SCH20, SCH30, SCH40, STD, SCH80, XS, SCH60, SCH80, SCH120, SCH140, SCH160, XXS",
            end: "Plain End, Beveled End, Treaded",
            length: "Single Random, Double Random & Cut Length",
            desc: "SS 321H Pipes & Tubes are high-carbon, titanium-stabilized stainless steel grades, offering enhanced creep strength at elevated temperatures. Used in heat exchangers and high-temperature process equipment."
          }),
          steelVariant(STEEL.ss347, { 
            name: "SS 347 Pipes & Tubes", 
            sizes: "1/8\" NB to 30\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
            type: "Seamless / ERW / Welded / Fabricated / EFW",
            form: "Round, Square, Rectangular, Hydraulic Etc",
            schedule: "SCH20, SCH30, SCH40, STD, SCH80, XS, SCH60, SCH80, SCH120, SCH140, SCH160, XXS",
            end: "Plain End, Beveled End, Treaded",
            length: "Single Random, Double Random & Cut Length",
            desc: "SS 347 Pipes & Tubes are niobium-stabilized stainless steel grades, providing excellent resistance to intergranular corrosion. Ideal for high-temperature applications in chemical and petrochemical industries."
          }),
          steelVariant(STEEL.ss347h, { 
            name: "SS 347H Pipes & Tubes", 
            sizes: "1/8\" NB to 30\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
            type: "Seamless / ERW / Welded / Fabricated / EFW",
            form: "Round, Square, Rectangular, Hydraulic Etc",
            schedule: "SCH20, SCH30, SCH40, STD, SCH80, XS, SCH60, SCH80, SCH120, SCH140, SCH160, XXS",
            end: "Plain End, Beveled End, Treaded",
            length: "Single Random, Double Random & Cut Length",
            desc: "SS 347H Pipes & Tubes are high-carbon, niobium-stabilized stainless steel grades, offering improved creep strength at elevated temperatures. Used in power generation and high-temperature process piping."
          }),
          steelVariant(STEEL.ss904l, { 
            name: "SS 904L Pipes & Tubes", 
            sizes: "1/8\" NB to 30\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
            type: "Seamless / ERW / Welded / Fabricated / EFW",
            form: "Round, Square, Rectangular, Hydraulic Etc",
            schedule: "SCH20, SCH30, SCH40, STD, SCH80, XS, SCH60, SCH80, SCH120, SCH140, SCH160, XXS",
            end: "Plain End, Beveled End, Treaded",
            length: "Single Random, Double Random & Cut Length",
            desc: "SS 904L Pipes & Tubes are superaustenitic stainless steel grades with exceptional resistance to pitting and crevice corrosion. Perfect for harsh chemical environments, seawater applications, and acid processing."
          }),
        ],
      },
      {
        name: "Carbon Steel Pipes & Tubes",
        grades: ["ASTM A53/A106", "API 5L Gr.B-X70", "ASTM A333"],
        short: "We are leading manufacturer & exporter of Carbon Steel Pipes that are widely used in oil and gas pipelines, water transportation & utility plumbing.",
        desc: `Carbon Steel Pipes & Tubes Suppliers & Manufacturers in India. Carbon Steel (CS) pipes are widely used in oil and gas pipelines, water transportation, utility plumbing and process plant services where corrosion resistance is handled via coatings or inhibitors. These cost-effective pipes offer consistent mechanical strength, easy weldability and broad availability across standard schedules.\n\nCarbon Steel Grades: ASTM A53 Grade B, ASTM A106 Grade B / A106 Grade C, API 5L Grade B through X70 (Line Pipe), ASTM A333 Low Temperature Services, IS 1239, IS 3589.`,
        gradeText: "Seamless: ASTM A106 GR B / API 5L GR B / GR X42–X70. ERW: ASTM A53 GR B / IS 1239 / IS 3589. LSAW/SAW: Large OD process & pipeline grades as per project requirements.",
        exportHeading: "EXPORT DESTINATIONS FOR CARBON STEEL PIPES, CS SEAMLESS PIPES, CARBON STEEL TUBES, API 5L LINE PIPES",
        image: carbonSteelPipesTubesImg,
        specTables: [
          {
            title: "Carbon Steel Pipes & Tubes Specifications",
            headers: ["Attribute", "Details"],
            rows: [
              ["Standard & Grades", "ASTM / ASME A53 Gr. A/B, A106 Gr. A/B/C, API 5L Gr.B, X42, X46, X52, X56, X60, X65, X70; ASTM A333 Gr.1, Gr.3, Gr.6; IS 1239, IS 3589"],
              ["Type", "Seamless, ERW, EFW, LSAW, SAW, Galvanized"],
              ["Size", "1/8\" NB UP TO 1200 NB / 6mm OD TO 508mm OD; Special large diameters available as LSAW"],
              ["Form", "Round, Square, Rectangular, hydraulic, Line Pipe"],
            ],
          },
          {
            title: "Other Types of Carbon Steel Pipes & Carbon Steel Tubes",
            headers: ["CS Pipes", "CS Tubes"],
            rows: [
              ["Carbon Steel Seamless Pipes", "Carbon Steel Seamless Tubes"],
              ["Carbon Steel ERW Pipes", "API 5L Welded Line Pipes"],
              ["Carbon Steel A106 Gr.B Pipes", "Carbon Steel A53 Gr.B Tubes"],
              ["API 5L X52 Line Pipes", "Carbon Steel API 5L X65 Pipes"],
              ["Carbon Steel Galvanized Pipes", "Carbon Steel A333 LT Tubes"],
              ["Carbon Steel Fabricated Pipes", "Carbon Steel LSAW Tubes"],
            ],
          },
        ],
        variants: [
          steelVariant(STEEL.csA53B, { name: "Carbon Steel ASTM A53 Gr.B Pipes & Tubes", sizes: "Seamless 1/2\" NB to 60\" NB; ERW 1/2\" NB to 24\" NB; SAW 16\" NB to 100\" NB" }),
          steelVariant(STEEL.csA106B, { name: "Carbon Steel ASTM A106 Gr.B Pipes & Tubes", sizes: "Seamless 1/2\" NB to 60\" NB; ERW 1/2\" NB to 24\" NB; SAW 16\" NB to 100\" NB" }),
          steelVariant(STEEL.api5lB, { name: "API 5L Gr.B Line Pipe", sizes: "Seamless 1/2\" NB to 60\" NB; ERW 1/2\" NB to 24\" NB; SAW 16\" NB to 100\" NB" }),
          steelVariant(STEEL.api5lX42, { name: "API 5L X42 Line Pipe", sizes: "Seamless 1/2\" NB to 60\" NB; ERW 1/2\" NB to 24\" NB; SAW 16\" NB to 100\" NB" }),
          steelVariant(STEEL.api5lX46, { name: "API 5L X46 Line Pipe", sizes: "Seamless 1/2\" NB to 60\" NB; ERW 1/2\" NB to 24\" NB; SAW 16\" NB to 100\" NB" }),
          steelVariant(STEEL.api5lX52, { name: "API 5L X52 Line Pipe", sizes: "Seamless 1/2\" NB to 60\" NB; ERW 1/2\" NB to 24\" NB; SAW 16\" NB to 100\" NB" }),
          steelVariant(STEEL.api5lX60, { name: "API 5L X60 Line Pipe", sizes: "Seamless 1/2\" NB to 60\" NB; ERW 1/2\" NB to 24\" NB; SAW 16\" NB to 100\" NB" }),
          steelVariant(STEEL.api5lX65, { name: "API 5L X65 Line Pipe", sizes: "Seamless 1/2\" NB to 60\" NB; ERW 1/2\" NB to 24\" NB; SAW 16\" NB to 100\" NB" }),
          steelVariant(STEEL.api5lX70, { name: "API 5L X70 Line Pipe", sizes: "Seamless 1/2\" NB to 60\" NB; ERW 1/2\" NB to 24\" NB; SAW 16\" NB to 100\" NB" }),
          steelVariant(STEEL.csA333, { name: "Carbon Steel ASTM A333 Low Temperature Pipes & Tubes", sizes: "Seamless 1/2\" NB to 60\" NB; ERW 1/2\" NB to 24\" NB; SAW 16\" NB to 100\" NB" }),
        ],
      },
      {
        name: "Alloy Steel Pipes & Tubes",
        grades: ["ASTM A335 P1-P92", "ASTM A691"],
        short: "We are manufacturer of Alloy Steel Pipes which are selected for elevated-temperature and high-pressure service in power generation, refinery reactors.",
        sizes: "1/2\" NB to 24\" NB",
        desc: `Alloy Steel Pipes & Tubes — Chrome-Moly (Cr-Mo) seamless & welded pipe manufacturers in India. Alloy steel grade piping is selected for elevated-temperature and high-pressure service in power generation, superheater circuits, refinery reactors and process lines where plain carbon steel loses creep strength.\n\nWidely used alloys: ASTM A335 P1 (½ Mo), P2 (⅛ Mo), P5 (5 Cr), P9 (9 Cr-1Mo), P11 (1¼ Cr ½ Mo), P12 (1 Cr ½ Mo), P22 (2¼ Cr 1 Mo), P23, P91 (9 Cr-1Mo-V-Nb), P92.`,
        gradeText:
          "ASTM / ASME A335 P1, P2, P5, P9, P11, P12, P22, P23, P91, P92 (Seamless). Welded/Efw: ASTM A691 1Cr, 1¼Cr, 2¼Cr, 5Cr, 9Cr classes.",
        exportHeading:
          "EXPORT DESTINATIONS FOR ALLOY STEEL PIPES, ALLOY STEEL SEAMLESS TUBES, ASTM A335 P91 PIPES, ALLOY PIPES & TUBES",
        image: alloySteelPipeTubeImg,
        specTables: [
          {
            title: "Alloy Steel Pipes & Tubes Specifications",
            headers: ["Attribute", "Details"],
            rows: [
              [
                "Standard & Grades",
                "ASTM / ASME A335 P1, P2, P5, P9, P11, P12, P22, P23, P91, P92. ASTM A691 1Cr, 1¼Cr, 2¼Cr (EW/EFW classes).",
              ],
              ["Type", "Seamless, ERW, EFW, LSAW"],
              ["Size", "Upto 24\" / 1/2\" NB to 24\" NB"],
              [
                "Form",
                "Round, Square, Rectangular, boiler & heater tubes, superheater & reheater tubing.",
              ],
            ],
          },
          {
            title: "Other Types of Alloy Steel Pipes & Alloy Steel Tubes",
            headers: ["Alloy Pipes", "Alloy Tubes"],
            rows: [
              ["ASTM A335 P91 Pipes", "ASTM A335 P22 Tubes"],
              ["ASTM A335 P11 Pipes", "ASTM A335 P5 Tubes"],
              ["ASTM A335 P9 Pipes", "ASTM A335 P1 Pipes"],
              ["ASTM A691 2¼Cr EFW Pipes", "Alloy Steel A335 P12 Tubes"],
              ["A335 P23 Seamless Pipes", "ASTM A335 P92 Tubes"],
              ["Chrome Moly Alloy Pipes", "Alloy Steel Boiler Tubes"],
            ],
          },
        ],
        variants: [
          steelVariant(STEEL.asP1, { name: "Alloy Steel ASTM A335 P1 Pipes & Tubes", sizes: "1/2\" NB to 24\" NB" }),
          steelVariant(STEEL.asP2, { name: "Alloy Steel ASTM A335 P2 Pipes & Tubes", sizes: "1/2\" NB to 24\" NB" }),
          steelVariant(STEEL.asP5, { name: "Alloy Steel ASTM A335 P5 Pipes & Tubes", sizes: "1/2\" NB to 24\" NB" }),
          steelVariant(STEEL.asP9, { name: "Alloy Steel ASTM A335 P9 Pipes & Tubes", sizes: "1/2\" NB to 24\" NB" }),
          steelVariant(STEEL.asP11, { name: "Alloy Steel ASTM A335 P11 Pipes & Tubes", sizes: "1/2\" NB to 24\" NB" }),
          steelVariant(STEEL.asP12, { name: "Alloy Steel ASTM A335 P12 Pipes & Tubes", sizes: "1/2\" NB to 24\" NB" }),
          steelVariant(STEEL.asP22, { name: "Alloy Steel ASTM A335 P22 Pipes & Tubes", sizes: "1/2\" NB to 24\" NB" }),
          steelVariant(STEEL.asP23, { name: "Alloy Steel ASTM A335 P23 Pipes & Tubes", sizes: "1/2\" NB to 24\" NB" }),
          steelVariant(STEEL.asP91, { name: "Alloy Steel ASTM A335 P91 Pipes & Tubes", sizes: "1/2\" NB to 24\" NB" }),
          steelVariant(STEEL.asP92, { name: "Alloy Steel ASTM A335 P92 Pipes & Tubes", sizes: "1/2\" NB to 24\" NB" }),
          steelVariant(STEEL.a691_1cr, { name: "Alloy Steel ASTM A691 1Cr Pipes", sizes: "1/2\" NB to 24\" NB" }),
          steelVariant(STEEL.a691_125cr, { name: "Alloy Steel ASTM A691 1¼Cr Pipes", sizes: "1/2\" NB to 24\" NB" }),
          steelVariant(STEEL.a691_225cr, { name: "Alloy Steel ASTM A691 2¼Cr Pipes", sizes: "1/2\" NB to 24\" NB" }),
        ],
      },
      {
        name: "Duplex Steel Pipes & Tubes",
        grades: ["Duplex UNS S31803/S32205", "Super Duplex UNS S32750/S32760/S32950"],
        short: "We are manufacturer of Duplex Steel Pipes that are widely used as heat exchangers in refinery industries, petrochemical plants, paper & pulp industries.",
        desc: `Leading Manufacturer and Exporter of Duplex Steel Pipes & Tubes, Duplex Seamless Pipes, Duplex Steel Welded Tubes in India.\n\nOur range of Duplex Steel Tubes are manufactured from quality raw materials and is highly demanded by our clients spread across the globe. Our range of duplex steel pipes & tubes are widely used as heat exchangers in refinery industries, petrochemical plants, paper & pulp industries, sugar & beverage industries.\n\nWe offer Duplex Steel Pipes and Tubes in excellent condition and in seamless & welded pipes forms for export and local purpose. We offer Duplex Steel Pipes and Tubes in following grades.\n\nDuplex Steel Pipes and Tubes are called as “duplex”, for the reason that they have a two-segment microstructure that consists of grains of austenitic and ferritic steel. When Duplex steel is being melted it hardens from the liquid segment to a totally ferritic formation. As the material gets cool down to room temperature, approximately half of the ferritic grains make over to austenitic grains (“islands”). Well, the outcome is a microstructure of approximately 50 percent of austenite and 50 percent of ferrite. Super Duplex Steels are roughly twice as powerful as standard austenitic or ferritic steels.\n\nDuplex Steel UNS S31803 Welded Pipes Manufacturer, UNS S32205 Seamless Tubes Supplier, Super Duplex UNS S32750 / S32950 Pipes & Tubes in India.`,
        gradeText:
          "ASTM / ASME SA 790 UNS-S31803 / S32205 / S32750 / S32760 / S32950.",
        exportHeading:
          "EXPORT DESTINATIONS FOR DUPLEX PIPES, DUPLEX STEEL TUBES, DUPLEX STEEL PIPES, DUPLEX TUBES",
        image: duplexSuperDuplexPipesTubesImg,
        specTables: [
          {
            title: "Duplex Steel Pipes & Tubes Specifications",
            headers: ["Attribute", "Details"],
            rows: [
              [
                "Standard & Grades",
                "ASTM / ASME SA 790 UNS -S31803, UNS -S 32760, UNS S32205, UNS S32750, UNS S32950",
              ],
              ["Type", "Seamless & Welded"],
              ["Size", "Upto 24\""],
              ["Form", "Round, Square, Rectangular, hydraulic etc."],
            ],
          },
          {
            title: "Other Types of Duplex Steel Pipes & Duplex Steel Tubes",
            headers: ["Duplex Pipes", "Duplex Tubes"],
            rows: [
              ["Duplex Steel Pipes", "Duplex Steel Tubes"],
              ["Duplex Steel Seamless & Welded Pipes", "Duplex Steel Seamless & Welded Tubes"],
              ["UNS S31803 Seamless Tubes", "UNS S32205 Welded Pipes"],
              ["Duplex Pipes & Tubes", "Super Duplex Seamless Pipes"],
              ["UNS S32750 Welded Pipes", "UNS S32950 ERW Pipes"],
              ["Duplex EFW Tubes", "Super Duplex Pipes & Tubes"],
            ],
          },
        ],
        variants: [
          steelVariant(STEEL.duplex2205, {
            name: "Duplex S31803 Pipes & Tubes",
            sizes: "1/2\" NB to 24\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
          }),
          steelVariant(STEEL.superDuplex2507, {
            name: "Duplex S32760 Pipes & Tubes",
            sizes: "1/2\" NB to 24\" NB (Pipes); 6mm to 101.6mm OD (Tubes)",
          }),
        ],
      },
      {
        name: "Copper Alloy Pipes & Tubes",
        grades: ["Cu-Ni 90/10 (UNS C70600)", "Cu-Ni 70/30 (UNS C71500)", "ASTM B111/B466"],
        short: "We are manufacturers of Copper Alloy Pipes & Tubes that are used in engineering and construction industry and are highly advanced.",
        desc: `We are Manufacturers and Exporters of Copper Alloy Seamless & Welded Pipes, Cupro Alloy Pipes & Tubes, Copper Alloy Tubes Supplier in India.\n\nBeing a patron-oriented organization, we strive to bring forth a range of Copper Alloy Pipes and Tubes.\n\nWe offer a wide range of premium quality Copper Alloy all over the globe and tubes that are supplied in the various dimensions, grades and other technical specifications and are very well known for their high quality, reliability, and durability and corrosion resistance. These are widely used in engineering and construction industry and are highly advanced and are completely free from defects. Copper Alloy Pipes & Copper Alloy Tubes are highly reliable as they are made under the supervision of expert professionals.\n\nWe set the standard for quality, consistency and service in the plumbing, refrigeration and HVAC industries. With years of experience in manufacturing, we continue to offer robust quality Copper Alloy at very reasonable prices across the world. We welcome your queries and are happy to add you to our client list and provide you with our best possible service.\n\nCopper Alloy EFW / ERW Pipes & Tubes Manufacturer. Cu-Ni 70/30 Seamless Pipes & Cu-Ni 90/10 Welded Tubes Supplier & Exporter.`,
        gradeText: `ASTM / ASME SB 111 UNS NO. C 10100 , 10200 , 10300 , 10800 , 12000, 12200, 70600 , 71500\nASTM / ASME SB 466 UNS NO. C 70600 ( CU -NI- 90/10) , C 71500 ( CU -NI- 70/30) IBR - NON IBR`,
        exportHeading:
          "EXPORT DESTINATIONS FOR COPPER ALLOY PIPES, CUPRO NICKEL PIPES, COPPER ALLOY TUBES, COPPER PIPES",
        image: copperAlloyPipesTubesImg,
        specTables: [
          {
            title: "Cupro Nickel Pipes & Cupro Nickel Tubes (UNS No.70600 / UNS No.71500) Dimension",
            headers: [
              "Pipe / Tube Type",
              "Nominal\nPipe Size",
              "O.D.",
              "I.D.",
              "Wall Thickness",
            ],
            rows: [
              [
                "Copper Alloy",
                "1/4\"\n3/8\"",
                "0.305\n0.315",
                "-\n-",
                "0.035\n0.030\n-\n-",
              ],
              [
                "Copper Alloy",
                "3/8\"\n1/2\"",
                "0.402\n0.430",
                "0.450\n-",
                "0.049\n0.035\n0.025\n-",
              ],
              [
                "Copper Alloy",
                "1/2\"\n5/8\"",
                "0.527\n0.545",
                "0.569\n-",
                "0.049\n0.040\n0.028\n-",
              ],
              [
                "Copper Alloy",
                "5/8\"\n3/4\"",
                "0.652\n0.666",
                "-\n-",
                "0.049\n0.042\n-\n-",
              ],
              [
                "Copper Alloy",
                "3/4\"\n7/8\"",
                "0.745\n0.785",
                "0.811\n-",
                "0.065\n0.045\n0.032\n-",
              ],
              [
                "Copper Alloy",
                "1\"\n1-1/8\"",
                "0.995\n1.025",
                "1.055\n-",
                "0.065\n0.050\n0.035\n-",
              ],
              [
                "Copper Alloy",
                "1-1/4\"\n1-3/8\"",
                "1.245\n1.265",
                "1.291\n1.295",
                "0.065\n0.055\n0.042\n0.040",
              ],
              [
                "Copper Alloy",
                "1-1/2\"\n1-5/8\"",
                "1.481\n1.505",
                "1.527\n1.541",
                "0.072\n0.060\n0.049\n0.042",
              ],
              [
                "Copper Alloy",
                "2\"\n2-1/8\"",
                "1.959\n1.985",
                "2.009\n2.041",
                "0.083\n0.070\n0.058\n0.042",
              ],
              [
                "Copper Alloy",
                "2-1/2\"\n2-5/8\"",
                "2.435\n2.465",
                "2.495\n-",
                "0.095\n0.080\n0.065\n-",
              ],
              [
                "Copper Alloy",
                "3\"\n3-1/8\"",
                "2.907\n2.945",
                "2.981\n3.030",
                "0.109\n0.090\n0.072\n0.045",
              ],
            ],
          },
          {
            title: "Other Types of Copper Alloy Pipes & Copper Alloy Tubes",
            headers: ["Copper Pipes", "Copper Tubes"],
            rows: [
              ["Copper Alloy Pipes", "Copper Alloy Tubes"],
              ["Cu-Ni 70/30 Pipes & Tubes", "Cu-Ni 90/10 Pipes & Tubes"],
              ["Copper Nickel Tubes", "Copper Nickel Pipes"],
              ["Cupro Nickel ERW Tubes", "Cupro Nickel EFW Pipes"],
              ["Cupro Nickel Seamless Tubes", "Cupro Nickel Welded Pipes"],
              ["Copper UNS C70600 Pipes", "Copper UNS C70600 Tubes"],
              [
                "Cupro Nickel UNS C71500 Pipes",
                "Cupro Nickel UNS C71500 Tubes",
              ],
            ],
          },
        ],
        variants: [
          steelVariant(STEEL.cuNi9010, {
            name: "Cu-Ni 90/10 Pipes & Tubes",
            sizes:
              "6mm to 50.8mm OD (Tubes); 1/2\" NB to 6\" NB (Pipes). Cupro Nickel 90/10 — UNS C70600.",
          }),
          steelVariant(STEEL.cuNi7030, {
            name: "Cu-Ni 70/30 Pipes & Tubes",
            sizes:
              "6mm to 50.8mm OD (Tubes); 1/2\" NB to 6\" NB (Pipes). Cupro Nickel 70/30 — UNS C71500.",
          }),
        ],
      },
    ],
  },
  {
    slug: "sheets-plates",
    name: "Sheets & Plates",
    short: "We have been offering to our clients a vast range of Sheets and Coils that are offered in various specifications to our clients.",
    grades: ["Nickel 200/201", "Monel 400", "Inconel 600/601/625/825", "Alloy 20/CB3", "Hastelloy C276", "SS 304 to 430", "Carbon Steel A36/A516", "Alloy Steel A387 Gr.2-22"],
    sizes: "0.5 mm To 200 mm thick in 1000 mm To 3000 mm width & 2500 mm To 12500 mm length",
    standards: ["ASTM A240", "A516", "A387", "A204", "IS 2062", "IS 2002", "DIN 17175", "NACE MR 01-75"],
    form: "Hot Rolled, Cold Rolled, Coils, Sheared Plates, Boiler Quality, Cladded",
    items: ["Hot Rolled Plates", "Cold Rolled Sheets", "Chequered Plates", "Coils", "Boiler Quality Plates"],
    image: platesSheetsImg,
    materialTypes: [
      {
        name: "Nickel Alloy Sheets, Plates & Coils",
        grades: ["Nickel 200/201", "Monel 400/K500", "Inconel 600/601/625", "Incoloy 800/825", "Alloy 20", "Hastelloy B2/C22/C276"],
        gradeText: `ASTM / ASME SB 162 UNS 2200 ( NICKEL 200 )
ASTM / ASME SB 162 UNS 2201 ( NICKEL 201 )
ASTM / ASME SB 162 / 127 UNS 4400 ( MONEL 400 )
ASTM / ASME SB 168 UNS 6600 ( INCONEL 600 )
ASTM / ASME SB 168 UNS 6601 ( INCONEL 601 )
ASTM / ASME SB 443 UNS 6625 ( INCONEL 625 )
ASTM / ASME SB 424 UNS 8825 ( INCOLOY 825 )
ASTM / ASME SB 409 UNS 8800 ( INCOLOY 800 )
ASTM / ASME SB 463 UNS 8020 ( ALLOY 20 / 20 CB 3 )
ASTM / ASME SB 575 UNS 10276 ( HASTELLOY C 276 )
ASTM / ASME SB 575 UNS 10665 ( HASTELLOY B2 )
ASTM / ASME SB 575 UNS 06022 ( HASTELLOY C22 )`,
        desc: "Thirteen high-nickel grades \u2014 from commercially pure nickel through Monel, Inconel, Incoloy, Alloy 20 and the Hastelloy B/C family \u2014 covering every sheets, plates & coils application where standard stainless steel would corrode.",
        image: nickelAlloyPlatesSheetsImg,
        variants: [
          alloyVariant(ALLOYS.ni200, { name: "Nickel Alloy 200 Sheets, Plates & Coils", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width, up to 12500mm length" }),
          alloyVariant(ALLOYS.ni201, { name: "Nickel Alloy 201 Sheets, Plates & Coils", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width, up to 12500mm length" }),
          alloyVariant(ALLOYS.monel400, { name: "Monel 400 Sheets, Plates & Coils", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width, up to 12500mm length" }),
          alloyVariant(ALLOYS.monelK500, { name: "Monel K500 Sheets, Plates & Coils", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width, up to 12500mm length" }),
          alloyVariant(ALLOYS.inconel600, { name: "Inconel 600 Sheets, Plates & Coils", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width, up to 12500mm length" }),
          alloyVariant(ALLOYS.inconel601, { name: "Inconel 601 Sheets, Plates & Coils", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width, up to 12500mm length" }),
          alloyVariant(ALLOYS.inconel625, { name: "Inconel 625 Sheets, Plates & Coils", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width, up to 12500mm length" }),
          alloyVariant(ALLOYS.incoloy800, { name: "Incoloy 800 Sheets, Plates & Coils", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width, up to 12500mm length" }),
          alloyVariant(ALLOYS.incoloy825, { name: "Incoloy 825 Sheets, Plates & Coils", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width, up to 12500mm length" }),
          alloyVariant(ALLOYS.alloy20, { name: "Alloy 20 Sheets, Plates & Coils", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width, up to 12500mm length" }),
          alloyVariant(ALLOYS.hastelloyB2, { name: "Hastelloy B2 Sheets, Plates & Coils", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width, up to 12500mm length" }),
          alloyVariant(ALLOYS.hastelloyC22, { name: "Hastelloy C22 Sheets, Plates & Coils", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width, up to 12500mm length" }),
          alloyVariant(ALLOYS.hastelloyC276, { name: "Hastelloy C276 Sheets, Plates & Coils", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width, up to 12500mm length" }),
        ],
      },
      {
        name: "Stainless Steel Plates & Sheets",
        grades: ["ASTM A240 304 to 347"],
        gradeText: `ASTM A240 TP 304, ASTM A240 TP 304L, ASTM A240 TP 304H, ASTM A240 TP 309S, ASTM A240 TP 309H, ASTM A240 TP 310S, ASTM A240 TP 310H, ASTM A240 TP 316, ASTM A240 TP 316L, ASTM A240 TP 316Ti, ASTM A240 TP 316H, ASTM A240 TP 316LN, ASTM A240 TP 317, ASTM A240 TP 317L, ASTM A240 TP 321, ASTM A240 TP 321H, ASTM A240 TP 347, ASTM A240 TP 347H, ASTM A240 TP 904L`,
        image: platesSheetsImg,
        desc: "Hot and cold rolled stainless stock for fabrication, tankage and structural cladding where corrosion resistance and a clean finish are required.",
        variants: [
          steelVariant(STEEL.ss304, { name: "SS 304 Plates & Sheets", spec: "ASTM A240", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width" }),
          steelVariant(STEEL.ss304l, { name: "SS 304L Plates & Sheets", spec: "ASTM A240", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width" }),
          steelVariant(STEEL.ss316, { name: "SS 316 Plates & Sheets", spec: "ASTM A240", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width" }),
          steelVariant(STEEL.ss316l, { name: "SS 316L Plates & Sheets", spec: "ASTM A240", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width" }),
          steelVariant(STEEL.ss321, { name: "SS 321 Plates & Sheets", spec: "ASTM A240", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width" }),
          steelVariant(STEEL.ss347, { name: "SS 347 Plates & Sheets", spec: "ASTM A240", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width" }),
        ],
      },
      {
        name: "Carbon Steel Plates & Sheets",
        grades: ["ASTM A516 Gr.60/70", "A283 Gr.C"],
        gradeText: `ASTM A516 Gr.60, ASTM A516 Gr.70, ASTM A515 Gr.60, ASTM A515 Gr.70, ASTM A283 Gr.C, ASTM A285 Gr.C, IS 2062 Gr.A/B/C, IS 2002`,
        desc: "General structural and pressure-vessel plate for fabrication, construction and equipment manufacturing, stocked in depth across common thicknesses.",
        image: carbonSteelPlatesSheetsImg,
        variants: [
          steelVariant(STEEL.a516_70, { name: "Carbon Steel ASTM A516 Gr.70 Plates & Sheets", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width" }),
          steelVariant(STEEL.a516_60, { name: "Carbon Steel ASTM A516 Gr.60 Plates & Sheets", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width" }),
          steelVariant(STEEL.a283_c, { name: "Carbon Steel ASTM A283 Gr.C Plates & Sheets", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width" }),
        ],
      },
      {
        name: "Alloy Steel Plates",
        grades: ["ASTM A387 Gr.5/9/11/22/91 (Cr-Mo)"],
        gradeText: `ASTM A387 Gr.2 Cl.1/Cl.2, ASTM A387 Gr.5 Cl.1/Cl.2, ASTM A387 Gr.9 Cl.1/Cl.2, ASTM A387 Gr.11 Cl.1/Cl.2, ASTM A387 Gr.12 Cl.1/Cl.2, ASTM A387 Gr.22 Cl.1/Cl.2, ASTM A387 Gr.91 Cl.1/Cl.2`,
        desc: "Chrome-moly alloy plate for elevated-temperature pressure vessels and reactor shells in refinery and petrochemical service.",
        image: alloySteelPlatesImg,
        variants: [
          steelVariant(STEEL.asP5, { name: "Alloy Steel ASTM A387 Gr.5 Plates", spec: "ASTM A387 Gr.5", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width" }),
          steelVariant(STEEL.asP9, { name: "Alloy Steel ASTM A387 Gr.9 Plates", spec: "ASTM A387 Gr.9", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width" }),
          steelVariant(STEEL.asP11, { name: "Alloy Steel ASTM A387 Gr.11 Plates", spec: "ASTM A387 Gr.11", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width" }),
          steelVariant(STEEL.asP22, { name: "Alloy Steel ASTM A387 Gr.22 Plates", spec: "ASTM A387 Gr.22", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width" }),
          steelVariant(STEEL.asP91, { name: "Alloy Steel ASTM A387 Gr.91 Plates", spec: "ASTM A387 Gr.91", sizes: "0.5mm to 200mm thick, 1000mm to 3000mm width" }),
        ],
      },
    ],
  },
  {
    slug: "round-bars",
    name: "Round Bars",
    short: "We are offering a wide range of Round Bars that are available in varied grades of stainless steel, carbon steel, nickel alloys & alloy steel.",
    grades: ["Monel, Nickel, Inconel, Hastelloy, Copper, Brass, Bronze, Titanium", "SS 304 to 430", "Carbon Steel IS 2062/ASTM A36", "Alloy Steel A387 Gr.2-22"],
    sizes: "Standard & Custom Sizes up to 5m length",
    standards: ["ASTM A240", "A516", "A515", "A387", "A204", "IS 2062", "IS 2002", "DIN 17175"],
    form: "Round/Square/ Hexagonal/ Rectangular",
    items: ["Round Bars", "Square Bars", "Hexagonal Bars", "Rectangular Bars", "Wire & Wire Rod"],
    image: roundBarWireImg,
    materialTypes: [
      {
        name: "Nickel Alloy Round Bar & Rod",
        grades: ["Nickel 200/201", "Monel 400/K500", "Inconel 600/601/625", "Incoloy 800/825", "Alloy 20", "Hastelloy B2/C22/C276"],
        gradeText: `ASTM / ASME SB 160 UNS 2200 ( NICKEL 200 )
ASTM / ASME SB 160 UNS 2201 ( NICKEL 201 )
ASTM / ASME SB 164 UNS 4400 ( MONEL 400 )
ASTM / ASME SB 166 UNS 6600 ( INCONEL 600 )
ASTM / ASME SB 166 UNS 6601 ( INCONEL 601 )
ASTM / ASME SB 446 UNS 6625 ( INCONEL 625 )
ASTM / ASME SB 425 UNS 8825 ( INCOLOY 825 )
ASTM / ASME SB 408 UNS 8800 ( INCOLOY 800 )
ASTM / ASME SB 473 UNS 8020 ( ALLOY 20 / 20 CB 3 )
ASTM / ASME SB 574 UNS 10276 ( HASTELLOY C 276 )
ASTM / ASME SB 574 UNS 10665 ( HASTELLOY B2 )
ASTM / ASME SB 574 UNS 06022 ( HASTELLOY C22 )`,
        desc: "Thirteen high-nickel grades \u2014 from commercially pure nickel through Monel, Inconel, Incoloy, Alloy 20 and the Hastelloy B/C family \u2014 covering every round bar & rod application where standard stainless steel would corrode.",
        image: nickelAlloyRoundBarImg,
        variants: [
          alloyVariant(ALLOYS.ni200, { name: "Nickel Alloy 200 Round Bar & Rod", sizes: "3.17mm to 350mm dia. (Round/Square/Hexagonal/Rectangular)" }),
          alloyVariant(ALLOYS.ni201, { name: "Nickel Alloy 201 Round Bar & Rod", sizes: "3.17mm to 350mm dia. (Round/Square/Hexagonal/Rectangular)" }),
          alloyVariant(ALLOYS.monel400, { name: "Monel 400 Round Bar & Rod", sizes: "3.17mm to 350mm dia. (Round/Square/Hexagonal/Rectangular)" }),
          alloyVariant(ALLOYS.monelK500, { name: "Monel K500 Round Bar & Rod", sizes: "3.17mm to 350mm dia. (Round/Square/Hexagonal/Rectangular)" }),
          alloyVariant(ALLOYS.inconel600, { name: "Inconel 600 Round Bar & Rod", sizes: "3.17mm to 350mm dia. (Round/Square/Hexagonal/Rectangular)" }),
          alloyVariant(ALLOYS.inconel601, { name: "Inconel 601 Round Bar & Rod", sizes: "3.17mm to 350mm dia. (Round/Square/Hexagonal/Rectangular)" }),
          alloyVariant(ALLOYS.inconel625, { name: "Inconel 625 Round Bar & Rod", sizes: "3.17mm to 350mm dia. (Round/Square/Hexagonal/Rectangular)" }),
          alloyVariant(ALLOYS.incoloy800, { name: "Incoloy 800 Round Bar & Rod", sizes: "3.17mm to 350mm dia. (Round/Square/Hexagonal/Rectangular)" }),
          alloyVariant(ALLOYS.incoloy825, { name: "Incoloy 825 Round Bar & Rod", sizes: "3.17mm to 350mm dia. (Round/Square/Hexagonal/Rectangular)" }),
          alloyVariant(ALLOYS.alloy20, { name: "Alloy 20 Round Bar & Rod", sizes: "3.17mm to 350mm dia. (Round/Square/Hexagonal/Rectangular)" }),
          alloyVariant(ALLOYS.hastelloyB2, { name: "Hastelloy B2 Round Bar & Rod", sizes: "3.17mm to 350mm dia. (Round/Square/Hexagonal/Rectangular)" }),
          alloyVariant(ALLOYS.hastelloyC22, { name: "Hastelloy C22 Round Bar & Rod", sizes: "3.17mm to 350mm dia. (Round/Square/Hexagonal/Rectangular)" }),
          alloyVariant(ALLOYS.hastelloyC276, { name: "Hastelloy C276 Round Bar & Rod", sizes: "3.17mm to 350mm dia. (Round/Square/Hexagonal/Rectangular)" }),
        ],
      },
      {
        name: "Stainless Steel Round Bar & Wire",
        grades: ["ASTM A276/A479 304 to 347"],
        gradeText: `ASTM A276 / A479 TP 304, TP 304L, TP 304H, TP 309S, TP 310S, TP 316, TP 316L, TP 316Ti, TP 317, TP 317L, TP 321, TP 321H, TP 347, TP 347H, TP 904L`,
        image: roundBarWireImg,
        desc: "Precision-finished bar stock for CNC machining, fasteners and shafting where corrosion resistance and dimensional accuracy are both critical.",
        variants: [
          steelVariant(STEEL.ss304, { name: "SS 304 Round Bar & Wire", spec: "ASTM A276/A479", sizes: "3.17mm to 400mm dia." }),
          steelVariant(STEEL.ss304l, { name: "SS 304L Round Bar & Wire", spec: "ASTM A276/A479", sizes: "3.17mm to 400mm dia." }),
          steelVariant(STEEL.ss316, { name: "SS 316 Round Bar & Wire", spec: "ASTM A276/A479", sizes: "3.17mm to 400mm dia." }),
          steelVariant(STEEL.ss316l, { name: "SS 316L Round Bar & Wire", spec: "ASTM A276/A479", sizes: "3.17mm to 400mm dia." }),
          steelVariant(STEEL.ss321, { name: "SS 321 Round Bar & Wire", spec: "ASTM A276/A479", sizes: "3.17mm to 400mm dia." }),
          steelVariant(STEEL.ss347, { name: "SS 347 Round Bar & Wire", spec: "ASTM A276/A479", sizes: "3.17mm to 400mm dia." }),
        ],
      },
      {
        name: "Carbon Steel Bar & Wire",
        grades: ["AISI 1018/1045"],
        gradeText: `AISI 1018, AISI 1020, AISI 1025, AISI 1040, AISI 1045, IS 2062 Gr.A/B/C, IS 8500`,
        desc: "General-purpose bar and wire rod for fabrication, construction and light-engineering applications at a competitive cost.",
        image: carbonSteelBarWireImg,
        variants: [
          steelVariant(STEEL.aisi1018, { name: "AISI 1018 Carbon Steel Bar & Wire", sizes: "3.17mm to 400mm dia." }),
          steelVariant(STEEL.aisi1045, { name: "AISI 1045 Carbon Steel Bar & Wire", sizes: "3.17mm to 400mm dia." }),
        ],
      },
      {
        name: "Alloy Steel Bar",
        grades: ["AISI 4140/4340"],
        gradeText: `AISI 4130, AISI 4140, AISI 4340, EN 19 (708M40), EN 24 (817M40), EN 36, ASTM A29 / A322`,
        desc: "High-strength alloy bar for machined components subject to heavy loading, commonly heat-treated after machining for added toughness.",
        image: alloySteelBarImg,
        variants: [
          steelVariant(STEEL.aisi4140_b7, { name: "AISI 4140 Alloy Steel Bar", spec: "ASTM A29", sizes: "3.17mm to 400mm dia." }),
          steelVariant(STEEL.aisi4340, { name: "AISI 4340 Alloy Steel Bar", sizes: "3.17mm to 400mm dia." }),
        ],
      },
      {
        name: "Copper Nickel Round Bar & Rod",
        grades: ["Cu-Ni 90/10 (UNS C70600)", "Cu-Ni 70/30 (UNS C71500)"],
        sizes: "3.17mm to 350mm dia. (Round/Square/Hexagonal/Rectangular)",
        gradeText: `ASTM / ASME SB 151 UNS C70600 ( CU-NI 90/10 )
ASTM / ASME SB 151 UNS C71500 ( CU-NI 70/30 )`,
        desc: "Bar stock for marine hardware and seawater-service components requiring biofouling and corrosion resistance.",
        image: copperNickelRoundBarImg,
      },
    ],
  },
  {
    slug: "flanges",
    name: "Flanges",
    short: "We offer stainless steel flanges in various specifications and configurations. Form : Slip on, socket weld, blind, lapped, screwed, weld neck, reducing, spectacle, slip on boss, plate.",
    grades: ["Monel, Nickel, Inconel, Hastelloy, Copper, Brass, Bronze, Titanium", "ASTM A182 F304 to 904L", "ASTM A105 / A694 F42-70", "ASTM A182 F1/F5/F9/F11/F22/F91"],
    sizes: "1/2\" NB TO 24\" NB",
    standards: ["ASTM A182", "A105", "A694", "A350 LF3/LF2"],
    form: "Class 150#, 300#, 600#, 900#, 1500# & 2500#",
    items: ["Plate Blank Flanges", "Screwed Bars", "Spectacle Blind", "Lapped", "Reducing", "Welded Socketweld", "SORF", "Threaded", "Weldneck", "Slipon", "Blind", "Socket Weld", "Lap Joint", "Ring Joint", "Oriface", "Long Weldneck", "Deck Flange", "RTJ Flange"],
    image: flangesImg,
    materialTypes: [
      {
        name: "Nickel Alloy Flanges",
        grades: ["Nickel 200/201", "Monel 400/K500", "Inconel 600/601/625", "Incoloy 800/825", "Alloy 20", "Hastelloy B2/C22/C276"],
        gradeText: `ASTM / ASME SB 160 / 162 UNS 2200 ( NICKEL 200 )
ASTM / ASME SB 160 / 162 UNS 2201 ( NICKEL 201 )
ASTM / ASME SB 164 / 165 UNS 4400 ( MONEL 400 )
ASTM / ASME SB 164 UNS 4500 ( MONEL K 500 )
ASTM / ASME SB 166 / 168 UNS 6600 ( INCONEL 600 )
ASTM / ASME SB 166 UNS 6601 ( INCONEL 601 )
ASTM / ASME SB 443 / 444 UNS 6625 ( INCONEL 625 )
ASTM / ASME SB 424 / 425 UNS 8825 ( INCOLOY 825 )
ASTM / ASME SB 409 / 408 UNS 8800 ( INCOLOY 800 )
ASTM / ASME SB 463 / 473 UNS 8020 ( ALLOY 20 / 20 CB 3 )
ASTM / ASME SB 575 UNS 10276 ( HASTELLOY C 276 )
ASTM / ASME SB 575 UNS 10665 ( HASTELLOY B2 )
ASTM / ASME SB 575 UNS 06022 ( HASTELLOY C22 )`,
        desc: "Thirteen high-nickel forged grades \u2014 from commercially pure nickel through Monel, Inconel, Incoloy, Alloy 20 and the Hastelloy B/C family \u2014 for caustic, marine, high-temperature and severe chemical-process joints where standard stainless steel flanges would corrode.",
        image: nickelFlangesImg,
        variants: [
          alloyVariant(ALLOYS.ni200, { name: "Nickel Alloy 200 Flanges", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          alloyVariant(ALLOYS.ni201, { name: "Nickel Alloy 201 Flanges", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          alloyVariant(ALLOYS.monel400, { name: "Monel 400 Flanges", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          alloyVariant(ALLOYS.monelK500, { name: "Monel K500 Flanges", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          alloyVariant(ALLOYS.inconel600, { name: "Inconel 600 Flanges", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          alloyVariant(ALLOYS.inconel601, { name: "Inconel 601 Flanges", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          alloyVariant(ALLOYS.inconel625, { name: "Inconel 625 Flanges", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          alloyVariant(ALLOYS.incoloy800, { name: "Incoloy 800 Flanges", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          alloyVariant(ALLOYS.incoloy825, { name: "Incoloy 825 Flanges", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          alloyVariant(ALLOYS.alloy20, { name: "Alloy 20 Flanges", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          alloyVariant(ALLOYS.hastelloyB2, { name: "Hastelloy B2 Flanges", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          alloyVariant(ALLOYS.hastelloyC22, { name: "Hastelloy C22 Flanges", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          alloyVariant(ALLOYS.hastelloyC276, { name: "Hastelloy C276 Flanges", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
        ],
      },
      {
        name: "Stainless Steel Flanges",
        grades: ["ASTM A182 F304 to F904L"],
        gradeText: `ASTM A182 F 304, ASTM A182 F 304L, ASTM A182 F 304H, ASTM A182 F 309H, ASTM A182 F 310, ASTM A182 F 316, ASTM A182 F 316L, ASTM A182 F 316H, ASTM A182 F 317, ASTM A182 F 317L, ASTM A182 F 321, ASTM A182 F 321H, ASTM A182 F 347, ASTM A182 F 347H, ASTM A182 F 904L`,
        desc: "Forged flanges for corrosion-resistant, leak-tight joints across chemical, pharma and marine piping systems, available in every standard face finish.",
        image: stainlessSteelFlangesImg,
        variants: [
          steelVariant(STEEL.ss304, { name: "SS F304 Flanges", spec: "ASTM A182 F304", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          steelVariant(STEEL.ss304l, { name: "SS F304L Flanges", spec: "ASTM A182 F304L", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          steelVariant(STEEL.ss304h, { name: "SS F304H Flanges", spec: "ASTM A182 F304H", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          steelVariant(STEEL.ss310s, { name: "SS F310 Flanges", spec: "ASTM A182 F310", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          steelVariant(STEEL.ss316, { name: "SS F316 Flanges", spec: "ASTM A182 F316", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          steelVariant(STEEL.ss316l, { name: "SS F316L Flanges", spec: "ASTM A182 F316L", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          steelVariant(STEEL.ss317, { name: "SS F317 Flanges", spec: "ASTM A182 F317", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          steelVariant(STEEL.ss317l, { name: "SS F317L Flanges", spec: "ASTM A182 F317L", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          steelVariant(STEEL.ss321, { name: "SS F321 Flanges", spec: "ASTM A182 F321", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          steelVariant(STEEL.ss347, { name: "SS F347 Flanges", spec: "ASTM A182 F347", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          steelVariant(STEEL.ss904l, { name: "SS F904L Flanges", spec: "ASTM A182 F904L", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
        ],
      },
      {
        name: "Carbon Steel Flanges",
        grades: ["ASTM A105", "A350 LF2/LF3"],
        gradeText: `ASTM A105, ASTM A350 LF 2 CL1/CL2, ASTM A350 LF3, ASTM A181 Gr.I, ASTM A181 Gr.II`,
        desc: "The standard forged flange grade for general and low-temperature piping joints, valued for its balance of strength, machinability and cost across most industrial systems.",
        image: carbonSteelFlangesImg,
        variants: [
          steelVariant(STEEL.a105_cs, { name: "Carbon Steel ASTM A105 Flanges", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          steelVariant(STEEL.a350_lf2, { name: "Carbon Steel ASTM A350 LF2 Flanges", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
        ],
      },
      {
        name: "Alloy Steel Flanges",
        grades: ["ASTM A182 F1/F5/F9/F11/F22/F91"],
        gradeText: `ASTM A182 F1, ASTM A182 F5, ASTM A182 F5a, ASTM A182 F9, ASTM A182 F11 CL1/CL2/CL3, ASTM A182 F12 CL1/CL2, ASTM A182 F22 CL1/CL3, ASTM A182 F91`,
        desc: "Chrome-moly forged flanges rated for elevated-temperature and high-pressure service in power generation and refinery piping where carbon steel would lose strength.",
        image: alloySteelFlangesImg,
        variants: [
          steelVariant(STEEL.asP1, { name: "Alloy Steel ASTM A182 F1 Flanges", spec: "ASTM A182 F1", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          steelVariant(STEEL.asP5, { name: "Alloy Steel ASTM A182 F5 Flanges", spec: "ASTM A182 F5", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          steelVariant(STEEL.asP9, { name: "Alloy Steel ASTM A182 F9 Flanges", spec: "ASTM A182 F9", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          steelVariant(STEEL.asP11, { name: "Alloy Steel ASTM A182 F11 Flanges", spec: "ASTM A182 F11", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          steelVariant(STEEL.asP22, { name: "Alloy Steel ASTM A182 F22 Flanges", spec: "ASTM A182 F22", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          steelVariant(STEEL.asP91, { name: "Alloy Steel ASTM A182 F91 Flanges", spec: "ASTM A182 F91", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
        ],
      },
      {
        name: "Duplex & Super Duplex Flanges",
        grades: ["ASTM A182 F51 (2205)", "F44 (2507)"],
        gradeText: `ASTM A182 F51 UNS S31803 / S32205 (DUPLEX 2205)
ASTM A182 F53 UNS S32750 (SUPER DUPLEX 2507)
ASTM A182 F55 UNS S32760 (SUPER DUPLEX)
ASTM A182 F44 UNS S31254 (SUPER AUSTENITIC 254SMO)`,
        desc: "High-strength forged flanges for offshore, subsea and high-chloride service where standard stainless would be undersized or under-protected.",
        image: duplexSuperDuplexFlangesImg,
        variants: [
          steelVariant(STEEL.duplex2205, { name: "Duplex F51 (2205) Flanges", spec: "ASTM A182 F51", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
          steelVariant(STEEL.superDuplex2507, { name: "Super Duplex F44 (2507) Flanges", spec: "ASTM A182 F44", sizes: "1/2\" NB to 24\" NB, Class 150 to 2500" }),
        ],
      },
      {
        name: "Copper Nickel Flanges",
        grades: ["Cu-Ni 90/10 (UNS C70600)", "Cu-Ni 70/30 (UNS C71500)"],
        sizes: "1/2\" NB to 24\" NB, Class 150 to 2500",
        gradeText: `ASTM / ASME SB 151 UNS C70600 ( CU-NI 90/10 )
ASTM / ASME SB 151 UNS C71500 ( CU-NI 70/30 )`,
        desc: "Flanges matched to copper-nickel pipe runs for marine condenser and seawater cooling joints.",
        image: copperNickelFlangesImg,
      },
    ],
  },
  {
    slug: "buttweld-fittings",
    name: "Buttweld Fittings",
    short: "We offer high quality butt weld fittings for different industrial requirements.",
    grades: ["Monel, Nickel, Inconel, Hastelloy, Copper, Brass, Bronze, Titanium", "ASTM A403 WP 304 to 904L", "ASTM A234 WPB / A420 WPL3/WPL6 / MSS-SP-75 WPHY", "ASTM A234 WP1/WP5/WP9/WP11/WP22/WP91"],
    sizes: "1/4\" NB TO 32\" NB. (Seamless & Welded)",
    standards: ["ASTM A403", "A234", "A420", "MSS-SP-75", "ASM 192", "A179"],
    form: "Sch. 5S To Sch. XXS (Seamless & Welded)",
    items: ["Tee", "Elbow", "Reducing Tee", "Coupling", "Long & Short Stub Band", "Reducer", "Return Bends", "Plug & Union", "Cap", "Collar", "Cross"],
    image: buttWeldedImg,
    materialTypes: [
      {
        name: "Nickel Alloy Butt Weld Fittings",
        grades: ["Nickel 200/201", "Monel 400/K500", "Inconel 600/601/625", "Incoloy 800/825", "Alloy 20", "Hastelloy B2/C22/C276"],
        gradeText: `Monel, Nickel, Inconel, Hastelloy, Copper, Brass, Bronze, Titanium, Tantalum, Bismuth, Aluminium, High Speed Steel, Zinc, Lead
Nickel 200/201 (UNS N02200/N02201) — Monel 400/K500 (UNS N04400/N05500) — Inconel 600/601/625 (UNS N06600/N06601/N06625) — Incoloy 800/825 (UNS N08800/N08825) — Alloy 20 (UNS N08020) — Hastelloy B2/C22/C276 (UNS N10665/N06022/N10276)`,
        desc: "Thirteen high-nickel grades — from commercially pure nickel through Monel, Inconel, Incoloy, Alloy 20 and the Hastelloy B/C family — engineered for caustic, marine, high-temperature and severe chemical-process piping circuits where standard stainless steel fittings would corrode.",
        image: nickelAlloyButtWeldImg,
        variants: [
          alloyVariant(ALLOYS.ni200, { name: "Nickel Alloy 200 Butt Weld Fittings", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Elbows, Tees, Reducers, Crosses, Caps, Stub Ends", schedule: "SCH 10 to SCH XXS", end: "Beveled End, Plain End", length: "Standard & Custom Lengths" }),
          alloyVariant(ALLOYS.ni201, { name: "Nickel Alloy 201 Butt Weld Fittings", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Low Carbon Nickel, Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 10 to SCH XXS", end: "Beveled End, Plain End", length: "Standard & Custom Lengths" }),
          alloyVariant(ALLOYS.monel400, { name: "Monel 400 Butt Weld Fittings", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Nickel-Copper Alloy, Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 10 to SCH XXS", end: "Beveled End, Plain End", length: "Standard & Custom Lengths" }),
          alloyVariant(ALLOYS.monelK500, { name: "Monel K500 Butt Weld Fittings", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Age-Hardened, Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Standard & Custom Lengths" }),
          alloyVariant(ALLOYS.inconel600, { name: "Inconel 600 Butt Weld Fittings", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "High Temperature Nickel-Chromium, Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Standard & Custom Lengths" }),
          alloyVariant(ALLOYS.inconel601, { name: "Inconel 601 Butt Weld Fittings", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "High Oxidation Resistance, Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Standard & Custom Lengths" }),
          alloyVariant(ALLOYS.inconel625, { name: "Inconel 625 Butt Weld Fittings", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Nickel-Chromium-Molybdenum, Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Standard & Custom Lengths" }),
          alloyVariant(ALLOYS.incoloy800, { name: "Incoloy 800 Butt Weld Fittings", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Iron-Nickel-Chromium, Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Standard & Custom Lengths" }),
          alloyVariant(ALLOYS.incoloy825, { name: "Incoloy 825 Butt Weld Fittings", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Nickel-Iron-Chromium-Molybdenum, Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Standard & Custom Lengths" }),
          alloyVariant(ALLOYS.alloy20, { name: "Alloy 20 Butt Weld Fittings", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Corrosion Resistant Alloy, Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Standard & Custom Lengths" }),
          alloyVariant(ALLOYS.hastelloyB2, { name: "Hastelloy B2 Butt Weld Fittings", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Nickel-Molybdenum, Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Standard & Custom Lengths" }),
          alloyVariant(ALLOYS.hastelloyC22, { name: "Hastelloy C22 Butt Weld Fittings", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Nickel-Chromium-Molybdenum-Tungsten, Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Standard & Custom Lengths" }),
          alloyVariant(ALLOYS.hastelloyC276, { name: "Hastelloy C276 Butt Weld Fittings", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Superalloy, Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Standard & Custom Lengths" }),
        ],
      },
      {
        name: "Stainless Steel Butt Weld Fittings",
        grades: ["ASTM A403 WP304 to WP904L"],
        gradeText: `ASTM A403 WP 304, WP 304L, WP 304H, WP 309S, WP 310, WP 316, WP 316L, WP 316Ti, WP 317, WP 317L, WP 321, WP 321H, WP 347, WP 347H, WP 904L`,
        desc: "Matched to stainless pipe runs for corrosion-resistant, hygienic and chemical-process circuits where weld integrity and surface finish are inspected closely.",
        image: stainlessButtWeldImg,
        variants: [
          steelVariant(STEEL.ss304, { name: "SS 304 Butt Weld Fittings", spec: "ASTM A403 WP304", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Elbows (45°, 90°, 180°), Tees (Equal, Reducing), Reducers (Concentric, Eccentric), Crosses, Caps, Stub Ends", schedule: "SCH 5S, SCH 10S, SCH 20S, SCH 40S, SCH 80S, SCH 160S, XXS", end: "Beveled End, Plain End", length: "Standard & Custom Lengths" }),
          steelVariant(STEEL.ss310s, { name: "SS 310 Butt Weld Fittings", spec: "ASTM A403 WP310", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "High Temperature Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 5S to SCH XXS", end: "Beveled End", length: "Standard & Custom Lengths" }),
          steelVariant(STEEL.ss316, { name: "SS 316 Butt Weld Fittings", spec: "ASTM A403 WP316", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Elbows, Tees, Reducers, Crosses, Caps, Stub Ends", schedule: "SCH 5S to SCH XXS", end: "Beveled End, Plain End", length: "Standard & Custom Lengths" }),
          steelVariant(STEEL.ss317, { name: "SS 317 Butt Weld Fittings", spec: "ASTM A403 WP317", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 5S to SCH XXS", end: "Beveled End", length: "Standard & Custom Lengths" }),
          steelVariant(STEEL.ss321, { name: "SS 321 Butt Weld Fittings", spec: "ASTM A403 WP321", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Stabilized Grade, Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 5S to SCH XXS", end: "Beveled End", length: "Standard & Custom Lengths" }),
          steelVariant(STEEL.ss347, { name: "SS 347 Butt Weld Fittings", spec: "ASTM A403 WP347", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Niobium Stabilized, Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 5S to SCH XXS", end: "Beveled End", length: "Standard & Custom Lengths" }),
          steelVariant(STEEL.ss904l, { name: "SS 904L Butt Weld Fittings", spec: "ASTM A403 WP904L", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Super Austenitic, Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 5S to SCH XXS", end: "Beveled End", length: "Standard & Custom Lengths" }),
        ],
      },
      {
        name: "Carbon Steel Butt Weld Fittings",
        grades: ["ASTM A234 WPB", "WPC"],
        gradeText: `ASTM A234 WPB, ASTM A234 WPC, ASTM A420 WPL3, ASTM A420 WPL6, MSS SP-75 WPHY 42/46/52/60/65/70/80, ASTM A860 WPHY Grade B`,
        image: buttWeldedImg,
        desc: "General-purpose fittings for moderate and high-temperature service on carbon steel piping systems in refineries, power plants and process units.",
        variants: [
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel ASTM A234 WPB Butt Weld Fittings", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Elbows, Tees, Reducers, Crosses, Caps, Stub Ends", schedule: "SCH 10, SCH 20, SCH 30, SCH 40, SCH 80, SCH 160, XXS", end: "Beveled End, Plain End, Threaded", length: "Custom Lengths Available" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel Reducers", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded", form: "Concentric, Eccentric", schedule: "SCH 10 to SCH XXS", end: "Beveled End, Plain End", length: "Standard & Custom Lengths" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel Concentric Reducers", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded", form: "Concentric", schedule: "SCH 10, SCH 20, SCH 30, SCH 40, SCH 80, SCH 160, XXS", end: "Beveled End, Plain End", length: "As Per Standard or Custom" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel Tees", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Equal Tees, Reducing Tees", schedule: "SCH 10 to SCH XXS", end: "Beveled End, Plain End", length: "Standard & Custom" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel Pipe Nipples", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded", form: "Barrel Nipples, Close Nipples, Hex Nipples", schedule: "SCH 40, SCH 80, SCH 160", end: "Threaded (NPT, BSP), Beveled, Plain", length: "Close, Short, Long, Custom" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel Stub end", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded", form: "Type A, Type B, Type C", schedule: "SCH 10 to SCH XXS", end: "Weld End, Lap Joint End", length: "Standard Stub Lengths" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel Butt weld Tees", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Equal, Reducing, Straight, Lateral", schedule: "SCH 10, SCH 20, SCH 30, SCH 40, SCH 80, SCH 160, XXS", end: "Beveled End", length: "As Per ANSI B16.9" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel Elbows", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "45°, 90°, 180°, Long Radius (LR), Short Radius (SR)", schedule: "SCH 10 to SCH XXS", end: "Beveled End, Plain End", length: "Standard & Custom" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel 3D Elbow", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated / Induction Bent", form: "3D Radius, 90° & 45°", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Custom Radius & Length" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel Stub Ends", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded", form: "Type A (Lap Joint), Type B, Type C", schedule: "SCH 10, SCH 20, SCH 30, SCH 40, SCH 80, SCH 160, XXS", end: "Weld End, Lap Joint End", length: "Standard Stub Lengths" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel End Caps", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Dished", form: "Dished End Caps, Hemispherical, Elliptical", schedule: "SCH 10 to SCH XXS", end: "Beveled End, Weld End", length: "Standard & Custom" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel 5D Elbow", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Induction Bent", form: "5D Radius, 90°, 45°", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Custom Radius & Length" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel 180° SR Return Bends", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded", form: "Short Radius (SR) 180°", schedule: "SCH 10 to SCH XXS", end: "Beveled End, Plain End", length: "As Per Standard" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel Long Radius Elbow", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Long Radius (LR), 90°, 45°, 180°", schedule: "SCH 10 to SCH XXS", end: "Beveled End, Plain End", length: "Standard LR Length" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel Eccentric Reducers", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded", form: "Eccentric, Offset", schedule: "SCH 10 to SCH XXS", end: "Beveled End, Plain End", length: "Standard & Custom" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel Reducing Crosses", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Reducing Cross, Straight Cross", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Standard & Custom" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel Crosses", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Equal Cross, Reducing Cross, Straight Cross", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "As Per ANSI B16.9" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel Couplings", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Forged", form: "Full Couplings, Half Couplings, Reducing Couplings", schedule: "SCH 40, SCH 80, SCH 160", end: "Threaded, Socket Weld, Butt Weld", length: "Standard & Custom" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel Short Radius Elbow", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded", form: "Short Radius (SR), 90°, 45°, 180°", schedule: "SCH 10 to SCH XXS", end: "Beveled End, Plain End", length: "Standard SR Length" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel Pipe Bends", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Induction Bent, Hot Formed, Cold Formed", form: "3D, 5D, 7D, 10D, Custom Radii", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Custom Tangent & Total Length" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel 45° Elbows", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "45°, Long Radius (LR), Short Radius (SR)", schedule: "SCH 10 to SCH XXS", end: "Beveled End, Plain End", length: "Standard & Custom" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel Reducing Elbow", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "90° Reducing, 45° Reducing, LR, SR", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Standard & Custom" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel Piggable Bends", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Induction Bent, Piggable Design", form: "3D, 5D, Custom Radii, Pig-Friendly", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Custom Tangent & Length" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel 180° LR Return Bends", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded", form: "Long Radius (LR) 180°", schedule: "SCH 10 to SCH XXS", end: "Beveled End, Plain End", length: "Standard LR Length" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel Welded Fittings", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Welded / Fabricated", form: "Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 10 to SCH XXS", end: "Beveled End, Plain End", length: "Standard & Custom" }),
          steelVariant(STEEL.csA234WPB, { name: "Carbon Steel Seamless Fittings", spec: "ASTM A234 WPB", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless", form: "Elbows, Tees, Reducers, Crosses, Caps, Stub Ends", schedule: "SCH 10 to SCH XXS", end: "Beveled End, Plain End", length: "As Per Standard" }),
          steelVariant(STEEL.csA234WPB, { name: "ASTM A420 Butt weld Fittings", spec: "ASTM A420", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded", form: "Low Temperature Service, Elbows, Tees, Reducers", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Standard & Custom" }),
          steelVariant(STEEL.csA234WPB, { name: "WPHY 42 Pipe Fittings", spec: "ASTM A860", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Forged", form: "High Yield, Elbows, Tees, Reducers", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Standard & Custom" }),
          steelVariant(STEEL.csA234WPB, { name: "ASTM A234 Pipe Fittings", spec: "ASTM A234", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Elbows, Tees, Reducers, Crosses, Caps, Stub Ends", schedule: "SCH 10 to SCH XXS", end: "Beveled End, Plain End", length: "Standard & Custom" }),
          steelVariant(STEEL.csA234WPB, { name: "ASTM A860 WPHY Pipe Fittings", spec: "ASTM A860", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Forged", form: "High Yield Line Pipe Fittings, WPHY 42 to WPHY 80", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Standard & Custom" }),
        ],
      },
      {
        name: "Alloy Steel Butt Weld Fittings",
        grades: ["ASTM A234 WP5 to WP91"],
        gradeText: `ASTM A234 WP 1, ASTM A234 WP 5, ASTM A234 WP 9, ASTM A234 WP 11, ASTM A234 WP 12, ASTM A234 WP 22, ASTM A234 WP 23, ASTM A234 WP 91, ASTM A234 WP 92`,
        desc: "Chrome-moly fittings rated for elevated-temperature and high-pressure service in power generation and refinery piping circuits where carbon steel would lose strength.",
        image: alloyButtWeldImg,
        variants: [
          steelVariant(STEEL.asP5, { name: "Alloy Steel ASTM A234 WP5 Butt Weld Fittings", spec: "ASTM A234 WP5", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 10 to SCH XXS", end: "Beveled End, Plain End", length: "Standard & Custom Lengths" }),
          steelVariant(STEEL.asP9, { name: "Alloy Steel ASTM A234 WP9 Butt Weld Fittings", spec: "ASTM A234 WP9", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Elbows, Tees, Reducers, Crosses, Caps, Stub Ends", schedule: "SCH 10 to SCH XXS", end: "Beveled End, Plain End", length: "Standard & Custom Lengths" }),
          steelVariant(STEEL.asP11, { name: "Alloy Steel ASTM A234 WP11 Butt Weld Fittings", spec: "ASTM A234 WP11", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Elbows (45°, 90°, 180°), Tees, Reducers, Crosses, Caps", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Standard & Custom Lengths" }),
          steelVariant(STEEL.asP12, { name: "Alloy Steel ASTM A234 WP12 Butt Weld Fittings", spec: "ASTM A234 WP12", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 10 to SCH XXS", end: "Beveled End, Plain End", length: "Standard & Custom Lengths" }),
          steelVariant(STEEL.asP22, { name: "Alloy Steel ASTM A234 WP22 Butt Weld Fittings", spec: "ASTM A234 WP22", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Elbows (LR, SR, 45°, 90°, 180°), Tees, Reducers, Crosses, Caps, Stub Ends", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Standard & Custom Lengths" }),
          steelVariant(STEEL.asP91, { name: "Alloy Steel ASTM A234 WP91 Butt Weld Fittings", spec: "ASTM A234 WP91", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "High Temperature Alloy, Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 10 to SCH XXS", end: "Beveled End", length: "Standard & Custom Lengths" }),
        ],
      },
      {
        name: "Duplex Steel Butt Weld Fittings",
        grades: ["ASTM A815 WP-S31803", "WP-S32750"],
        desc: "Engineered to carry the same pitting and stress-corrosion resistance as duplex pipe through every bend, tee and reducer in offshore and marine piping systems.",
        image: duplexButtWeldImg,
        variants: [
          steelVariant(STEEL.duplex2205, { name: "Duplex 2205 Butt Weld Fittings", spec: "ASTM A815 WP-S31803", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Elbows, Tees, Reducers, Crosses, Caps, Stub Ends", schedule: "SCH 10S, SCH 20S, SCH 40S, SCH 80S, SCH 160S, XXS", end: "Beveled End, Plain End", length: "Standard & Custom Lengths" }),
          steelVariant(STEEL.superDuplex2507, { name: "Super Duplex 2507 Butt Weld Fittings", spec: "ASTM A815 WP-S32750", sizes: "1/4\" NB to 32\" NB (Seamless & Welded)", type: "Seamless / Welded / Fabricated", form: "Super Duplex, Elbows, Tees, Reducers, Crosses, Caps", schedule: "SCH 10S to SCH XXS", end: "Beveled End", length: "Standard & Custom Lengths" }),
        ],
      },
      {
        name: "Copper Nickel Butt Weld Fittings",
        grades: ["Cu-Ni 90/10 (UNS C70600)", "Cu-Ni 70/30 (UNS C71500)"],
        sizes: "1/4\" NB to 32\" NB (Seamless & Welded)",
        desc: "Fittings for marine condenser and seawater cooling circuits, matched to copper-nickel pipe runs for consistent biofouling and corrosion resistance.",
        image: copperNickelButtWeldImg,
      },
    ],
  },
  {
    slug: "socketweld-fittings",
    name: "Socketweld Fittings",
    short: "We offer to our clients specially designed forged pipe fittings. TYPES: Elbow, Tee, Union, Cross, Coup Bushing, Plug, Swage Nipple, Welding Boss, Hexagon Nipple, Barrel Nipple, Welding Nipple, Parraler Nipple, etc.",
    grades: ["Monel, Nickel, Inconel, Hastelloy, Copper, Brass, Bronze, Titanium", "ASTM A182 F304/304L/304H/316/317/317L/321/310/347/904L", "ASTM A105 / A694 F42-70 / A350 LF3/LF2", "ASTM A182 F1/F5/F9/F11/F22/F91"],
    sizes: "1/4\"NB TO 4\"NB.(Socketweld & Threaded)",
    standards: ["ASTM A182", "A105", "A694", "A350"],
    form: "Class 3000#, 6000#, 9000#. Pressure: 1000#,2000#,3000#, 6000#,9000#",
    items: ["Elbow", "Tee", "Union", "Cross", "Coup Bushing", "Plug", "Swage Nipple", "Welding Boss", "Hexagon Nipple", "Barrel Nipple", "Welding Nipple", "Parraler Nipple", "Street Elbow", "Hexagon Nut", "Hose Nipple", "Bend", "Adapter", "Insert", "Weldolet", "Elbowlet", "Letrolet"],
    image: forgedFittingsImg,
    materialTypes: [
      {
        name: "Nickel Alloy Forged Fittings",
        grades: ["Nickel 200/201", "Monel 400/K500", "Inconel 600/601/625", "Incoloy 800/825", "Alloy 20", "Hastelloy B2/C22/C276"],
        gradeText: `Monel, Nickel, Inconel, Hastelloy, Copper, Brass, Bronze, Titanium, Tantalum, Bismuth, Aluminium, High Speed Steel, Zinc, Lead
Nickel 200/201 — Monel 400/K500 — Inconel 600/601/625 — Incoloy 800/825 — Alloy 20 — Hastelloy B2/C22/C276`,
        desc: "Thirteen high-nickel grades \u2014 from commercially pure nickel through Monel, Inconel, Incoloy, Alloy 20 and the Hastelloy B/C family \u2014 covering every forged fittings application where standard stainless steel would corrode.",
        image: nickelForgedFittingsImg,
        variants: [
          alloyVariant(ALLOYS.ni200, { name: "Nickel Alloy 200 Forged Fittings", sizes: "1/4\" NB to 4\" NB, Class 3000/6000/9000#" }),
          alloyVariant(ALLOYS.ni201, { name: "Nickel Alloy 201 Forged Fittings", sizes: "1/4\" NB to 4\" NB, Class 3000/6000/9000#" }),
          alloyVariant(ALLOYS.monel400, { name: "Monel 400 Forged Fittings", sizes: "1/4\" NB to 4\" NB, Class 3000/6000/9000#" }),
          alloyVariant(ALLOYS.monelK500, { name: "Monel K500 Forged Fittings", sizes: "1/4\" NB to 4\" NB, Class 3000/6000/9000#" }),
          alloyVariant(ALLOYS.inconel600, { name: "Inconel 600 Forged Fittings", sizes: "1/4\" NB to 4\" NB, Class 3000/6000/9000#" }),
          alloyVariant(ALLOYS.inconel601, { name: "Inconel 601 Forged Fittings", sizes: "1/4\" NB to 4\" NB, Class 3000/6000/9000#" }),
          alloyVariant(ALLOYS.inconel625, { name: "Inconel 625 Forged Fittings", sizes: "1/4\" NB to 4\" NB, Class 3000/6000/9000#" }),
          alloyVariant(ALLOYS.incoloy800, { name: "Incoloy 800 Forged Fittings", sizes: "1/4\" NB to 4\" NB, Class 3000/6000/9000#" }),
          alloyVariant(ALLOYS.incoloy825, { name: "Incoloy 825 Forged Fittings", sizes: "1/4\" NB to 4\" NB, Class 3000/6000/9000#" }),
          alloyVariant(ALLOYS.alloy20, { name: "Alloy 20 Forged Fittings", sizes: "1/4\" NB to 4\" NB, Class 3000/6000/9000#" }),
          alloyVariant(ALLOYS.hastelloyB2, { name: "Hastelloy B2 Forged Fittings", sizes: "1/4\" NB to 4\" NB, Class 3000/6000/9000#" }),
          alloyVariant(ALLOYS.hastelloyC22, { name: "Hastelloy C22 Forged Fittings", sizes: "1/4\" NB to 4\" NB, Class 3000/6000/9000#" }),
          alloyVariant(ALLOYS.hastelloyC276, { name: "Hastelloy C276 Forged Fittings", sizes: "1/4\" NB to 4\" NB, Class 3000/6000/9000#" }),
        ],
      },
      {
        name: "Stainless Steel Forged Fittings",
        grades: ["ASTM A182 F304 to F347"],
        gradeText: `ASTM A182 F 304, ASTM A182 F 304L, ASTM A182 F 304H, ASTM A182 F 310, ASTM A182 F 316, ASTM A182 F 316L, ASTM A182 F 317, ASTM A182 F 317L, ASTM A182 F 321, ASTM A182 F 321H, ASTM A182 F 347, ASTM A182 F 347H, ASTM A182 F 904L`,
        desc: "Corrosion-resistant socket-weld and threaded fittings for stainless instrumentation and process lines requiring hygienic, low-maintenance joints.",
        image: stainlessForgedFittingsImg,
        variants: [
          steelVariant(STEEL.ss304, { name: "SS F304 Forged Fittings", spec: "ASTM A182 F304", sizes: "1/8\" to 4\", Class 2000/3000/6000/9000" }),
          steelVariant(STEEL.ss304l, { name: "SS F304L Forged Fittings", spec: "ASTM A182 F304L", sizes: "1/8\" to 4\", Class 2000/3000/6000/9000" }),
          steelVariant(STEEL.ss316, { name: "SS F316 Forged Fittings", spec: "ASTM A182 F316", sizes: "1/8\" to 4\", Class 2000/3000/6000/9000" }),
          steelVariant(STEEL.ss316l, { name: "SS F316L Forged Fittings", spec: "ASTM A182 F316L", sizes: "1/8\" to 4\", Class 2000/3000/6000/9000" }),
          steelVariant(STEEL.ss321, { name: "SS F321 Forged Fittings", spec: "ASTM A182 F321", sizes: "1/8\" to 4\", Class 2000/3000/6000/9000" }),
          steelVariant(STEEL.ss347, { name: "SS F347 Forged Fittings", spec: "ASTM A182 F347", sizes: "1/8\" to 4\", Class 2000/3000/6000/9000" }),
        ],
      },
      {
        name: "Carbon Steel Forged Fittings",
        grades: ["ASTM A105"],
        gradeText: `ASTM A105, ASTM A350 LF 2 CL1/CL2, ASTM A350 LF3, ASTM A181 Gr.I, ASTM A181 Gr.II`,
        image: forgedFittingsImg,
        desc: "The standard forged fitting grade for small-bore, high-pressure carbon steel piping and instrumentation take-offs across general industrial service.",
        variants: [
          steelVariant(STEEL.a105_cs, { name: "Carbon Steel ASTM A105 Forged Fittings", sizes: "1/8\" to 4\", Class 2000/3000/6000/9000" }),
        ],
      },
      {
        name: "Alloy Steel Forged Fittings",
        grades: ["ASTM A182 F5/F9/F11/F22/F91"],
        gradeText: `ASTM A182 F1, ASTM A182 F5, ASTM A182 F5a, ASTM A182 F9, ASTM A182 F11 CL1/CL2/CL3, ASTM A182 F12 CL1/CL2, ASTM A182 F22 CL1/CL3, ASTM A182 F91, ASTM A182 F92`,
        desc: "Chrome-moly alloy fittings rated for elevated-temperature service in power and refinery piping where carbon steel would lose strength.",
        image: alloyForgedFittingsImg,
        variants: [
          steelVariant(STEEL.asP5, { name: "Alloy Steel ASTM A182 F5 Forged Fittings", spec: "ASTM A182 F5", sizes: "1/8\" to 4\", Class 2000/3000/6000/9000" }),
          steelVariant(STEEL.asP9, { name: "Alloy Steel ASTM A182 F9 Forged Fittings", spec: "ASTM A182 F9", sizes: "1/8\" to 4\", Class 2000/3000/6000/9000" }),
          steelVariant(STEEL.asP11, { name: "Alloy Steel ASTM A182 F11 Forged Fittings", spec: "ASTM A182 F11", sizes: "1/8\" to 4\", Class 2000/3000/6000/9000" }),
          steelVariant(STEEL.asP22, { name: "Alloy Steel ASTM A182 F22 Forged Fittings", spec: "ASTM A182 F22", sizes: "1/8\" to 4\", Class 2000/3000/6000/9000" }),
          steelVariant(STEEL.asP91, { name: "Alloy Steel ASTM A182 F91 Forged Fittings", spec: "ASTM A182 F91", sizes: "1/8\" to 4\", Class 2000/3000/6000/9000" }),
        ],
      },
    ],
  },
  {
    slug: "fasteners",
    name: "Fasteners",
    short: "We design quality fasteners for critical machine applications and desired results. Forms: Stud Bolts, Hex Bolts, Square Bolts, Hex Nuts, T-Head Bolts, Structural Bolts, U-Bolts, Foundation Bolts, As per drawing and customers specifications.",
    grades: ["Monel, Nickel, Inconel, Hastelloy, Copper, Brass, Bronze, Titanium", "AISI 302, 304, 304L, 316, 316L, 310, 317, 317L, 321, 347, 410, 420, 904L", "Alloy Steel 4.6,5.6, 6.6, 8.8, 10.9 & 12.9", "Carbon Steel: Galvanized, Phosphatised, Hot Deep Galvanized"],
    sizes: "M4 TO M100, length up to 5 meters",
    standards: ["AISI, ASTM, DIN, ISO, BS, 'R', 'S', T Conditions"],
    form: "Severe vibration under impulse pressure, Static pressure, High tolerance, Dimensional preciseness, Corrosion resistance, Perfect installation & application, Long service life, Study construction, Fast performance",
    items: ["Bolts", "Nuts", "Washers", "Anchor Fasteners", "Stud Bolts", "Eye Bolt", "Stud", "Threaded Rod", "Cotter Pin", "Socket Screw", "Fine Fasteners & Spares", "Foundation Fasteners"],
    image: fastenersImg,
    materialTypes: [
      {
        name: "Nickel Alloy Fasteners",
        grades: ["Nickel 200/201", "Monel 400/K500", "Inconel 600/601/625", "Incoloy 800/825", "Alloy 20", "Hastelloy B2/C22/C276"],
        gradeText: `Monel, Nickel, Inconel, Hastelloy, Copper, Brass, Bronze, Titanium, Tantalum, Bismuth, Aluminium, High Speed Steel, Zinc, Lead
Nickel 200/201 — Monel 400/K500 — Inconel 600/601/625 — Incoloy 800/825 — Alloy 20 — Hastelloy B2/C22/C276`,
        desc: "Thirteen high-nickel grades \u2014 from commercially pure nickel through Monel, Inconel, Incoloy, Alloy 20 and the Hastelloy B/C family \u2014 covering every fasteners application where standard stainless steel would corrode.",
        image: nickelFastenersImg,
        variants: [
          alloyVariant(ALLOYS.ni200, { name: "Nickel Alloy 200 Fasteners", sizes: "Length 3mm to 200mm" }),
          alloyVariant(ALLOYS.ni201, { name: "Nickel Alloy 201 Fasteners", sizes: "Length 3mm to 200mm" }),
          alloyVariant(ALLOYS.monel400, { name: "Monel 400 Fasteners", sizes: "Length 3mm to 200mm" }),
          alloyVariant(ALLOYS.monelK500, { name: "Monel K500 Fasteners", sizes: "Length 3mm to 200mm" }),
          alloyVariant(ALLOYS.inconel600, { name: "Inconel 600 Fasteners", sizes: "Length 3mm to 200mm" }),
          alloyVariant(ALLOYS.inconel601, { name: "Inconel 601 Fasteners", sizes: "Length 3mm to 200mm" }),
          alloyVariant(ALLOYS.inconel625, { name: "Inconel 625 Fasteners", sizes: "Length 3mm to 200mm" }),
          alloyVariant(ALLOYS.incoloy800, { name: "Incoloy 800 Fasteners", sizes: "Length 3mm to 200mm" }),
          alloyVariant(ALLOYS.incoloy825, { name: "Incoloy 825 Fasteners", sizes: "Length 3mm to 200mm" }),
          alloyVariant(ALLOYS.alloy20, { name: "Alloy 20 Fasteners", sizes: "Length 3mm to 200mm" }),
          alloyVariant(ALLOYS.hastelloyB2, { name: "Hastelloy B2 Fasteners", sizes: "Length 3mm to 200mm" }),
          alloyVariant(ALLOYS.hastelloyC22, { name: "Hastelloy C22 Fasteners", sizes: "Length 3mm to 200mm" }),
          alloyVariant(ALLOYS.hastelloyC276, { name: "Hastelloy C276 Fasteners", sizes: "Length 3mm to 200mm" }),
        ],
      },
      {
        name: "Stainless Steel Fasteners",
        grades: ["ASTM A193 B8/B8M/B8C/B8T"],
        gradeText: `AISI 302, 304, 304L, 316, 316L, 310, 317, 317L, 321, 347, 410, 420, 904L
ASTM A193 B8 (Grade 304) — B8M (Grade 316) — B8C (Grade 347) — B8T (Grade 321) — B8N (Grade 316N) — B8LN (Grade 316LN)`,
        desc: "Corrosion-resistant stud bolts, hex bolts and nuts for flange joints exposed to moisture, chemicals or marine atmosphere.",
        image: stainlessFastenersImg,
        variants: [
          steelVariant(STEEL.ss304_b8, { name: "SS B8 (304) Fasteners", sizes: "M6 to M100 / 1/4\" to 4\"" }),
          steelVariant(STEEL.ss316_b8m, { name: "SS B8M (316) Fasteners", sizes: "M6 to M100 / 1/4\" to 4\"" }),
          steelVariant(STEEL.ss347_b8c, { name: "SS B8C (347) Fasteners", sizes: "M6 to M100 / 1/4\" to 4\"" }),
          steelVariant(STEEL.ss321_b8t, { name: "SS B8T (321) Fasteners", sizes: "M6 to M100 / 1/4\" to 4\"" }),
        ],
      },
      {
        name: "Alloy Steel Fasteners",
        grades: ["ASTM A193 B7/B16", "A320 L7"],
        gradeText: `ASTM A193 B7 (4140 / 4142 Cr-Mo) — B7M — B16 (Cr-Mo-V) — ASTM A320 L7 — L7A — L7B — L7C — L7M
Alloy Steel Grade 4.6, 5.6, 6.6, 8.8, 10.9, 12.9`,
        desc: "High-tensile fasteners for standard flange and structural joints, the most widely specified grade across pressure piping worldwide.",
        image: alloyFastenersImg,
        variants: [
          steelVariant(STEEL.aisi4140_b7, { name: "Alloy Steel B7 Fasteners", sizes: "M6 to M100 / 1/4\" to 4\"" }),
          steelVariant(STEEL.aisi4140_l7, { name: "Alloy Steel L7 Fasteners", sizes: "M6 to M100 / 1/4\" to 4\"" }),
          steelVariant(STEEL.b16_crmov, { name: "Alloy Steel B16 Fasteners", sizes: "M6 to M100 / 1/4\" to 4\"" }),
        ],
      },
      {
        name: "Duplex & Super Duplex Fasteners",
        grades: ["Duplex 2205", "Super Duplex 2507"],
        gradeText: `UNS S31803 / S32205 (DUPLEX 2205)
UNS S32750 (SUPER DUPLEX 2507)
UNS S32760 (SUPER DUPLEX)
Carbon Steel: Galvanized, Phosphatised, Hot Deep Galvanized`,
        desc: "Matched to duplex flanges and fittings for consistent corrosion resistance through the entire bolted joint in offshore and high-chloride service.",
        image: duplexFastenersImg,
        variants: [
          steelVariant(STEEL.duplex2205, { name: "Duplex 2205 Fasteners", sizes: "M6 to M100 / 1/4\" to 4\"" }),
          steelVariant(STEEL.superDuplex2507, { name: "Super Duplex 2507 Fasteners", sizes: "M6 to M100 / 1/4\" to 4\"" }),
        ],
      },
    ],
  },
  {
    slug: "valves",
    name: "Valves",
    short: "Neon Alloys would like to introduce ourselves as one of the Leading Industrial Valves Exporter. Like Ball, Gate, Globe, check, Automatic Control Valve, Pressure Reducing Valve, High Pressure Valve.",
    grades: ["Stainless Steel (Bar Stock / Cast / Forged)", "Carbon Steel / Alloy Steel (Cast / Forged)", "Cast Iron"],
    sizes: "8 MM TO 1200 MM",
    standards: ["BS 5352", "BS 1873", "DIN 3356", "BS 6755", "BS 1414", "API 600", "API 602", "API 6D", "ASME B 16.34", "API 598", "BS 5152", "API 609", "IS 13095"],
    form: "Rating: 125# to 2500# depending on type; Ends: Screwed / Socket Weld / Flanged / Water Type",
    items: ["Globe Valves", "Gate Valves", "Non Return Valves", "Strainer (Y Type, Pot Type, T Type / Dirt Box)", "Butterfly Valves", "Ball Valves", "Check Valves", "Automatic Control Valves", "Pressure Reducing Valves", "High Pressure Valves"],
    specTables: [
      {
        title: "Globe Valves — Design & Test Standards",
        headers: ["", "Forged Range", "Cast Range"],
        rows: [
          ["DESIGN (Mfg.) STD.", "BS 5352", "BS 1873 / DIN 3356"],
          ["TEST (Inspection) STD.", "BS 6755", "BS 6755"],
        ],
      },
      {
        title: "Gate Valves — Design / Pressure / Test Standards",
        headers: ["", "Forged Range", "Cast Range"],
        rows: [
          ["PRESSURE/TEMP. RATING", "ANSI B 16.34 / API 6D", "ANSI B 16.34"],
          ["DESIGN (Mfg.) STD.", "API 602 / BS 5352", "API 600 / API 6D"],
          ["TEST (Inspection) STD.", "API 598 / BS 6755", "API 598 / API 6D"],
        ],
      },
      {
        title: "Non Return Valves — Design & Test Standards",
        headers: ["", "Forged Range", "Cast Range"],
        rows: [
          ["DESIGN (Mfg.) STD.", "BS 5352", "BS 1868 / API 6D"],
          ["TEST (Inspection) STD.", "BS 6755", "BS 6755 / API 6D"],
        ],
      },
    ],
    image: valvesImg,
    materialTypes: [
      {
        name: "Stainless Steel Valves",
        grades: ["SS 304", "SS 316"],
        gradeText: `Bar Stock: AISI 304, 316, 316L, 321, 347
Cast: ASTM A351 CF8 (304), CF8M (316), CF8C (347), CF3 (304L), CF3M (316L)
Forged: ASTM A182 F304, F304L, F316, F316L
Trim: SS 304 / 316 — Rating: 150# to 2500#`,
        image: valvesImg,
        desc: "Corrosion-resistant valve bodies and trim for process, chemical and marine piping systems requiring reliable, low-maintenance shut-off.",
      },
      {
        name: "Carbon Steel Valves",
        grades: ["ASTM A216 WCB"],
        gradeText: `Cast: ASTM A216 WCB / WCC
Forged: ASTM A105
Low Temperature: ASTM A352 LCB, LCC
Rating: 150# to 2500# (ASME B16.34 / API 600 / API 6D)`,
        desc: "The standard valve body material for general oil & gas and utility piping, balancing strength and cost across a wide pressure range.",
        image: carbonSteelValvesImg,
      },
      {
        name: "Alloy Steel Valves",
        grades: ["ASTM A217 WC6/WC9"],
        gradeText: `Cast: ASTM A217 WC6 (1¼Cr-½Mo), WC9 (2¼Cr-1Mo), C12A (9Cr-1Mo-V)
Forged: ASTM A182 F11, F22, F91
Rating: 150# to 2500# (ASME B16.34 / API 600)`,
        desc: "Chrome-moly valve bodies for elevated-temperature service in power generation and refinery process lines.",
        image: alloySteelValvesImg,
      },
    ],
  },
  {
    slug: "perforated-sheets",
    name: "Perforated Sheets",
    short: "Round, slotted and decorative-pattern perforated sheet and coil for filtration screens, architectural cladding and ventilation panelling, punched to standard or custom hole layouts.",
    grades: ["SS 304/316", "Mild Steel", "Aluminium"],
    sizes: "Custom hole patterns & sheet sizes on request",
    standards: ["As per customer drawing"],
    form: "Punched to custom pattern, pitch and open-area ratio",
    items: ["Round Hole", "Square Hole", "Slotted Hole", "Decorative Patterns"],
    image: perforatedSheetsImg,
    materialTypes: [
      {
        name: "Stainless Steel Perforated Sheets",
        grades: ["SS 304", "SS 316"],
        image: perforatedSheetsImg,
        desc: "Corrosion-resistant perforated stock for filtration screens, cladding and architectural facades in exposed or washdown environments.",
      },
      {
        name: "Mild Steel Perforated Sheets",
        grades: ["IS 2062"],
        desc: "Economical perforated sheet for enclosures, walkways and general screening where corrosion exposure is limited.",
        image: mildSteelPerforatedImg,
      },
      {
        name: "Aluminium Perforated Sheets",
        grades: ["Aluminium 1100/5052"],
        desc: "Lightweight, corrosion-resistant perforated sheet used in acoustic panelling, ducting and decorative architectural work.",
        image: aluminiumPerforatedImg,
      },
    ],
  },
  {
    slug: "electropolished-fittings",
    name: "Electropolished Fittings",
    short: "Fittings finished to a mirror, crevice-free surface for pharmaceutical, dairy and high-purity process lines where product contact demands minimal roughness and easy clean-in-place.",
    grades: ["SS 304/316L"],
    sizes: "1/2\" to 12\" NB",
    standards: ["ASME BPE", "3-A Sanitary Standards"],
    form: "Tri-Clamp & Weld Ends, Ra <32 mirror finish",
    items: ["Tri-Clamp Fittings", "Elbows", "Tees", "Reducers", "Ferrules"],
    image: electropolishedFittingsImg,
    materialTypes: [
      {
        name: "Stainless Steel Electropolished Fittings",
        grades: ["SS 304", "SS 316L"],
        image: electropolishedFittingsImg,
        desc: "Electropolishing removes surface iron and micro-roughness so bacteria and residue cannot lodge in the fitting — the standard requirement for pharma, dairy and high-purity process piping.",
      },
    ],
  },
  {
    slug: "electropolished-pipe",
    name: "Electropolished Pipe",
    short: "Sanitary-grade tubing polished to a fine surface finish for hygienic process piping in pharma, biotech and semiconductor-grade systems.",
    grades: ["SS 304/316L"],
    sizes: "1/2\" to 12\" NB, Ra <20 on request",
    standards: ["ASME BPE", "SEMI F20"],
    form: "Seamless / Welded & Polished, Ra <20 on request",
    items: ["Sanitary Tubing", "Polished Process Pipe"],
    image: electropolishedPipeImg,
    materialTypes: [
      {
        name: "Stainless Steel Electropolished Pipe",
        grades: ["SS 304", "SS 316L"],
        image: electropolishedPipeImg,
        desc: "Interior-polished tube for sanitary process lines and semiconductor gas/liquid systems, finished to tightly controlled surface-roughness values.",
      },
    ],
  },
  {
    slug: "wire-mesh",
    name: "Wire Mesh",
    short: "Woven and welded wire mesh in stainless and carbon steel for filtration, sieving, fencing and structural reinforcement, supplied in standard or custom mesh counts.",
    grades: ["SS 304/316", "Carbon Steel", "Galvanized Steel"],
    sizes: "Custom mesh count & wire diameter",
    standards: ["ASTM E2016", "ISO 9044"],
    form: "Woven, Welded & Crimped, custom mesh count",
    items: ["Woven Wire Mesh", "Welded Mesh", "Crimped Mesh", "Filter Discs"],
    image: wireMeshImg,
    materialTypes: [
      {
        name: "Stainless Steel Wire Mesh",
        grades: ["SS 304", "SS 316"],
        image: wireMeshImg,
        desc: "Corrosion-resistant mesh for filtration, screening and food-grade sieving applications where wash-down cleaning is routine.",
      },
      {
        name: "Carbon Steel Wire Mesh",
        grades: ["Mild Steel"],
        desc: "General fencing, sieving and reinforcement mesh for construction and industrial use in non-corrosive environments.",
        image: carbonSteelWireMeshImg,
      },
      {
        name: "Galvanized Wire Mesh",
        grades: ["Galvanized Steel"],
        desc: "Zinc-coated mesh giving extended outdoor service life for fencing, enclosures and structural reinforcement.",
        image: galvanizedWireMeshImg,
      },
    ],
  },
  {
    slug: "ferrule-fittings",
    name: "Ferrule Fittings",
    short: "We are engaged in importing and supplying a wide range of Ferrule Fittings that is available in different grades and specifications. Material Of Construction : 304, 304L, 316, 316L etc Finish : Mechanical Polish as well as Electropolish finishes.",
    grades: ["Stainless Steel, Nickel Alloys, Carbon Steel, Alloy Steel, Monel, Nickel, Inconel, Hastelloy, Copper, Brass, Bronze, Titanium, Tantalum, Bismuth, Aluminium, High Speed Steel, Zinc, Lead"],
    sizes: "Standard & Custom Sizes, Seamless & Welded",
    standards: ["National & International Standards"],
    form: "Material Of Construction: 304, 304L, 316, 316L etc. Finish: Mechanical Polish as well as Electropolish finishes. Types: Seamless & Welded",
    items: ["Nipples", "Adaptors", "Crosses", "Union Ball Joints", "Reducing Bushing", "Reducers", "Pipe Caps", "Couplings", "Pipe Plug", "Hollow Hex Plug", "Elbow", "Reducing Union", "90 Deg. Union Elbow", "Reducing 90 Deg. Union Elbow", "Extender Leg 90 Deg. Union Elbow", "45 Deg. Union Elbow", "Union Tee", "Female Connector", "Male Connector", "Manifold Tee", "Locator Union", "Extended Run Leg Union Tee", "Reducing Tee", "Tribow", "ATW Weld Ring", "Tube Socket weld To Pipe Butt Weld", "Tube Butt Weld To Tube Socket Weld", "Port Connector", "Equal Tee", "Instrument Tee", "Long Weld Ferrule", "Short Weld Ferrule"],
    image: instrumentFittingsImg,
    materialTypes: [
      {
        name: "Monel Instrument Fittings",
        grades: ["Monel 400"],
        gradeText: `ASTM / ASME SB 164 UNS N04400 ( MONEL 400 )
ASTM / ASME SB 164 UNS N05500 ( MONEL K500 )`,
        desc: "Specified for instrumentation exposed to hydrofluoric acid and other aggressive chemical environments where nickel-copper alloy resistance is required.",
        image: monelInstrumentFittingsImg,
      },
      {
        name: "Stainless Steel Instrument Fittings",
        grades: ["SS 316"],
        gradeText: `SS 304 (ASTM A276 TP 304), SS 304L, SS 316 (ASTM A276 TP 316), SS 316L, SS 316Ti, SS 321, SS 347, SS 904L`,
        image: instrumentFittingsImg,
        desc: "Corrosion-resistant compression and tube fittings for instrumentation and control lines in process plants and offshore facilities.",
      },
      {
        name: "Brass Instrument Fittings",
        grades: ["Brass CW614N"],
        gradeText: `Brass CW614N / C36000 (Free Machining Brass), Brass C37700, Brass Dezincification Resistant (DR Brass)`,
        desc: "Cost-effective fittings for low-pressure air, water and utility instrumentation lines in non-corrosive service.",
        image: brassInstrumentFittingsImg,
      },
    ],
  },
  {
    slug: "angles-channels",
    name: "Angles & Channels",
    short: "Using High grade and superior quality raw materials, we provide an extensive range of stainless steel Angles and Flats.",
    grades: ["SS 304/316", "Carbon Steel", "Mild Steel"],
    sizes: "20x20mm to 200x200mm (Angles); 75x40mm to 400x100mm (Channels)",
    standards: ["ASTM A484", "IS 808", "EN 10056"],
    form: "Hot Rolled, Equal & Unequal Angles, C-Channels",
    items: ["Equal Angles", "Unequal Angles", "Structural Channels", "C-Channels"],
    image: anglesChannelsImg,
    materialTypes: [
      {
        name: "Stainless Steel Angles & Channels",
        grades: ["SS 304", "SS 316"],
        gradeText: `ASTM A276 / ASTM A484 TP 304, TP 304L, TP 316, TP 316L, TP 321, TP 347, TP 904L`,
        image: anglesChannelsImg,
        desc: "Corrosion-resistant structural sections for framing and supports in process plants and coastal or washdown environments.",
      },
      {
        name: "Carbon Steel Angles & Channels",
        grades: ["IS 2062", "ASTM A36"],
        gradeText: `IS 2062 Gr.A/B/C (Indian Standard Structural Steel), ASTM A36 (General Structural), IS 808 (Dimensions for Hot Rolled Steel Sections)`,
        desc: "Economical structural sections for general fabrication, framing and construction support work.",
      },
    ],
  },
  {
    slug: "tube-sheet",
    name: "Tube Sheets",
    short: "One of the most common heat exchangers in service within industrial process applications is the Shell & Tube Heat Exchanger.",
    grades: ["SS 304/316L", "Duplex 2205", "Titanium Gr.2", "Cu-Ni 90/10"],
    sizes: "Up to 3000mm dia, 10mm to 200mm thick, drilled to drawing",
    standards: ["ASTM A240", "TEMA Standards"],
    form: "Plate / Forged, drilled & grooved to customer drawing",
    items: ["Heat Exchanger Tube Sheets", "Condenser Tube Sheets", "Cladded Tube Sheets"],
    image: tubeSheetImg,
    materialTypes: [
      {
        name: "Stainless Steel Tube Sheets",
        grades: ["SS 304", "SS 316L"],
        gradeText: `ASTM A240 TP 304, TP 304L, TP 316, TP 316L, TP 321, TP 321H, TP 347, TP 347H
Sizes: Up to 3000mm diameter, 10mm to 200mm thick, drilled & grooved per TEMA standard`,
        image: tubeSheetImg,
        desc: "Precision-drilled tube sheets for shell-and-tube heat exchangers in process and utility service.",
      },
      {
        name: "Duplex & Titanium Tube Sheets",
        grades: ["Duplex 2205", "Titanium Gr.2"],
        gradeText: `Duplex: UNS S31803 / S32205 (ASTM A182 F51) — Super Duplex: UNS S32750 (ASTM A182 F53)
Titanium: Grade 2 (UNS R50400, ASTM B265) — Cu-Ni 90/10: UNS C70600 (ASTM SB 171)
Carbon Steel: IS 2062 / A516 Gr.70 — Nickel Alloy: Monel 400, Inconel 625`,
        desc: "High-chloride-resistant tube sheets specified for seawater-cooled condensers and aggressive process-side media.",
      },
    ],
  },
  {
    slug: "cladded-plates",
    name: "Cladded Plates",
    short: "Explosion cladding is a process wherein a cladding plate is positioned over the backer plate with a small gap. Specially made explosives are spread on top of the cladding plate.",
    grades: ["SS 304L/316L Clad Carbon Steel", "Inconel 625 Clad", "Duplex 2205 Clad"],
    sizes: "Base 6mm–150mm thick, clad layer 1.5mm–6mm",
    standards: ["ASTM A263 / A264 / A265"],
    form: "Explosion Bonded or Weld Overlay Cladded Plates",
    items: ["Explosion Bonded Clad Plates", "Weld Overlay Clad Plates"],
    image: nickelAlloyPlatesSheetsImg,
    materialTypes: [
      {
        name: "Stainless Steel Clad Plates",
        grades: ["SS 304L", "SS 316L"],
        gradeText: `ASTM A263 / A264 — Cladding: SS 304/304L, 316/316L, 321, 347 over Base: IS 2062 / ASTM A516 Gr.60 / Gr.70
Minimum clad thickness: 10% of total or 1.5mm. Total thickness: 12mm to 150mm`,
        desc: "Carbon-steel-backed clad plate giving corrosion resistance at the process face without the cost of solid alloy plate.",
      },
      {
        name: "Inconel & Duplex Clad Plates",
        grades: ["Inconel 625", "Duplex 2205"],
        gradeText: `ASTM A265 (Nickel Alloy Clad) — Inconel 625 UNS N06625 Clad, Hastelloy C276 UNS N10276 Clad
Duplex 2205 UNS S31803 Clad over Carbon Steel / Low Alloy Steel Base`,
        image: nickelAlloyPlatesSheetsImg,
        desc: "High-performance cladding for pressure vessels and reactors handling severely corrosive process media.",
      },
    ],
  },
  {
    slug: "olets",
    name: "Olets",
    short: "we offer our clients a wide range using the best of raw material, and design compliance is of the best in the industry. TYPES: Insert Weldolets, Sockolets, Threadolet Nippolets, Elbowlets, Banzolets and Coupolets",
    grades: ["Carbon Steel", "Stainless Steel", "Alloy Steel", "Duplex"],
    sizes: "1/2\" to 24\" run x 1/8\" to 4\" branch",
    standards: ["MSS SP-97", "ASTM A105 / A182"],
    form: "Forged Branch Connections — Threaded, Socket Weld or Butt Weld",
    items: ["Weldolets", "Sockolets", "Thredolets", "Elbolets", "Nipolets", "Latrolets"],
    image: stainlessForgedFittingsImg,
    materialTypes: [
      {
        name: "Carbon Steel Olets",
        grades: ["ASTM A105"],
        gradeText: `ASTM A105 (General Service) — ASTM A350 LF2 CL1/CL2 (Low Temperature)
MSS SP-97 — Types: Weldolet, Sockolet, Thredolet, Elbolet, Nipolet, Sweepolet, Latrolet`,
        desc: "The standard branch-connection material for general oil & gas and utility piping systems.",
      },
      {
        name: "Stainless & Alloy Steel Olets",
        grades: ["SS 304/316", "ASTM A182"],
        gradeText: `Stainless: ASTM A182 F304, F304L, F316, F316L, F321, F347, F904L
Alloy Steel: ASTM A182 F11 (1¼Cr-½Mo), F22 (2¼Cr-1Mo), F91 (9Cr-1Mo-V)`,
        image: stainlessForgedFittingsImg,
        desc: "Corrosion-resistant and high-temperature branch connections for process and power-plant piping.",
      },
    ],
  },
];

// Catalogue display order — matches https://www.neonalloys.com/ footer
// Products list order, followed by Siyak specialty products.
const CATALOGUE_ORDER = [
  // EXACT neonalloys.com category sequence
  "pipes-tubes",
  "sheets-plates",
  "round-bars",
  "flanges",
  "buttweld-fittings",
  "socketweld-fittings",
  "fasteners",
  "angles-channels",
  "tube-sheet",
  "ferrule-fittings",
  "cladded-plates",
  "olets",
  "valves",
  // Siyak Steel specialty products (appended after neonalloys core categories)
  "perforated-sheets",
  "electropolished-pipe",
  "electropolished-fittings",
  "wire-mesh",
];
productCategories.sort(
  (a, b) => CATALOGUE_ORDER.indexOf(a.slug) - CATALOGUE_ORDER.indexOf(b.slug)
);

export const industries = [
  {
    name: "Aerospace",
    desc: "Precision-engineered fittings and fasteners held to tight aerospace tolerances for airframe assembly and MRO work.",
    image: aerospaceImg,
  },
  {
    name: "Automobile",
    desc: "High-strength steel components and fasteners engineered for automotive body-in-white and assembly line manufacturing.",
    image: automobileImg,
  },
  {
    name: "Cement",
    desc: "Heavy-duty piping, plates and structural steel built to withstand abrasive, high-temperature cement plant environments.",
    image: cementImg,
  },
  {
    name: "Oil & Gas",
    desc: "Pressure-rated piping components engineered for upstream, midstream and downstream operations.",
    image: oilGasImg,
  },
  {
    name: "Power",
    desc: "Corrosion-resistant piping and structural steel engineered for offshore and onshore power installations.",
    image: powerImg,
  },
  {
    name: "Pharma",
    desc: "Electropolished, sanitary-grade tubing and fittings for high-purity pharmaceutical process lines.",
    image: pharmaImg,
  },
  {
    name: "Paper",
    desc: "Wear-resistant plates, bars and fasteners engineered for heavy-duty paper and pulp manufacturing lines.",
    image: paperImg,
  },
  {
    name: "Railway",
    desc: "Structural-grade steel components and fasteners engineered for rolling stock and rail infrastructure.",
    image: railwayImg,
  },
];

export const stats = [
  { label: "Years of Trade", value: 25, suffix: "+" },
  { label: "Countries Served", value: 40, suffix: "+" },
  { label: "Tonnes Stocked", value: 12000, suffix: "+" },
  { label: "Product Lines", value: 20, suffix: "" },
];

export const whyUs = [
  {
    title: "Largest Inventory",
    desc: "A deep, ready-to-ship stock across every product line keeps your project on schedule, not on backorder.",
  },
  {
    title: "Quality Assurance",
    desc: "Every batch is tested and documented under an ISO 9001:2015 quality system before it leaves our warehouse.",
  },
  {
    title: "Sourcing & Packaging",
    desc: "Materials are sourced, inspected and packed to withstand long-haul export without compromise.",
  },
  {
    title: "Third-Party Inspection",
    desc: "Independent inspection agencies verify every consignment, with full test certificates supplied as standard.",
  },
  {
    title: "On-Time Delivery",
    desc: "Stringent dimensional control and planned logistics mean delivery dates that hold, every time.",
  },
  {
    title: "Customer Support",
    desc: "A dedicated technical team stays engaged from enquiry to delivery, and well beyond it.",
  },
];

export const companyInfo = {
  name: "Siyak Steel International",
  tagline: "Engineering trust into every alloy",
  certification: "ISO 9001:2015 Certified Company",
  address: "Plot No. 2,7 Kikabhai Mansion, 3rd Floor, Office No. 17, Kika Street, Girgaon, Mumbai - 400004, INDIA",
  contactPerson: "Mr. Narpat Siyak",
  phones: ["+91 98209 76537", "+91 22 6615 1478", "+91 22 6659 5225"],
  emails: ["info@siyaksteel.com", "siyaksteel@gmail.com"],
  whatsapp: "919820976537",
};

// HS Codes — main chapters (source: neonalloys.com HS Codes page)
// Top-level commodity chapters followed by their detailed sub-chapter codes.
export const hsCodesData = {
  title: "HS Codes — Commodity Classification",
  chapters: [
    {
      code: "72",
      description: "IRON AND STEEL",
    },
    {
      code: "73",
      description: "ARTICLES OF IRON OR STEEL",
    },
    {
      code: "74",
      description: "COPPER AND ARTICLES THEREOF.",
    },
    {
      code: "75",
      description: "NICKEL AND ARTICLES THEREOF.",
    },
    {
      code: "76",
      description: "ALUMINIUM AND ARTICLES THEREOF.",
    },
  ],
  // Top-level table (rows = HS chapter + description, same format as neonalloys top table)
  table: {
    headers: ["HS Code", "Commodity Description"],
    rows: [
      ["72", "IRON AND STEEL"],
      ["73", "ARTICLES OF IRON OR STEEL"],
      ["74", "COPPER AND ARTICLES THEREOF."],
      ["75", "NICKEL AND ARTICLES THEREOF."],
      ["76", "ALUMINIUM AND ARTICLES THEREOF."],
    ],
  },
};
