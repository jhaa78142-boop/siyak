import { ShieldCheck } from "lucide-react";
import Reveal from "./Reveal";

// Real client-supplied logo crops (src/assets/certifications/logos/*.webp) for
// agencies/clients we have actual artwork for. Agencies without supplied
// artwork fall back to a crisp, code-drawn wordmark so the strip still reads
// cleanly at any size.
import ritesLogo from "../assets/certifications/logos/rites.webp";
import pdilLogo from "../assets/certifications/logos/pdil.webp";
import lloydLogo from "../assets/certifications/logos/lloyd.webp";
import questLogo from "../assets/certifications/logos/quest.webp";
import tataProjectsLogo from "../assets/certifications/logos/tata_projects.webp";
import tuvSudLogo from "../assets/certifications/logos/tuv_sud.webp";
import bureauVeritasLogo from "../assets/certifications/logos/bureau_veritas.webp";
import tuvNordLogo from "../assets/certifications/logos/tuv_nord.webp";
import thermotechLogo from "../assets/certifications/logos/thermotech.webp";
import ltLogo from "../assets/certifications/logos/lt.webp";
import khdLogo from "../assets/certifications/logos/khd.webp";

const agencies = [
  { name: "DNV", sub: "Det Norske Veritas", render: () => (
      <div className="flex flex-col items-center gap-1.5">
        <div className="px-3 py-1 bg-[#0f5ea8] text-white font-display font-bold text-lg tracking-wide">DNV</div>
        <span className="text-[9px] uppercase tracking-[0.15em] text-steel-dark">Det Norske Veritas</span>
      </div>
  )},
  { name: "Bureau Veritas", img: bureauVeritasLogo },
  { name: "NPCIL", sub: "Nuclear Power Corp. of India", render: () => (
      <div className="flex flex-col items-center gap-1">
        <span className="font-display font-bold text-xl text-deep">NPCIL</span>
        <span className="text-[9px] uppercase tracking-[0.12em] text-steel-dark text-center leading-tight">Nuclear Power Corp.<br/>of India Ltd.</span>
      </div>
  )},
  { name: "TUV India", render: () => (
      <div className="font-display font-black text-2xl text-ink tracking-tight">
        TÜV <span className="text-teal">INDIA</span>
      </div>
  )},
  { name: "PDIL", img: pdilLogo },
  { name: "Lloyd's Register", render: () => (
      <div className="font-display font-bold text-base text-[#0b3d91] leading-tight text-center">
        Lloyd's<br/>Register
      </div>
  )},
  { name: "SGS", render: () => (
      <div className="font-display font-black text-3xl text-ink italic tracking-tighter">SGS</div>
  )},
  { name: "TATA Projects", img: tataProjectsLogo },
  { name: "BHEL", render: () => (
      <div className="px-2.5 py-1 bg-[#1a4fa0] text-white font-display font-bold text-lg tracking-wide">BHEL</div>
  )},
  { name: "Larsen & Toubro", img: ltLogo },
  { name: "HEG Ltd.", render: () => (
      <div className="font-display font-bold text-2xl tracking-tight">
        <span className="text-[#0f5ea8]">HE</span><span className="text-steel">G</span>
      </div>
  )},
  { name: "TUV SUD", img: tuvSudLogo },
  { name: "EIL", sub: "Engineers India Ltd.", render: () => (
      <div className="flex flex-col items-center gap-1">
        <div className="w-11 h-11 rounded-full border-2 border-[#1a4fa0] flex items-center justify-center font-display font-bold text-sm text-[#1a4fa0]">EIL</div>
      </div>
  )},
  { name: "VELOSI", render: () => (
      <div className="font-display font-bold text-xl text-deep tracking-wide uppercase">Velosi</div>
  )},
  { name: "IQC", render: () => (
      <div className="font-display font-black text-2xl text-[#1a4fa0] tracking-tight">IQC</div>
  )},
  { name: "Germanischer Lloyd", render: () => (
      <div className="font-display font-semibold text-sm text-ink text-center leading-tight">
        Germanischer<br/>Lloyd
      </div>
  )},
  { name: "Bechtel", render: () => (
      <div className="font-display font-bold text-2xl text-[#b8202e] tracking-tight">BECHTEL</div>
  )},
  { name: "RITES", img: ritesLogo },
  { name: "Lloyd Register Quality Assurance", img: lloydLogo },
  { name: "Quest", img: questLogo },
  { name: "TUV NORD", img: tuvNordLogo },
  { name: "Thermotech Boiler", img: thermotechLogo },
  { name: "KHD Humboldt Wedag", img: khdLogo },
];

function LogoCard({ agency }) {
  return (
    <div className="shrink-0 w-48 sm:w-64 h-28 sm:h-36 mx-3 sm:mx-4 flex items-center justify-center rounded-xl border border-teal-pale bg-white shadow-sm px-6 py-4">
      {agency.img ? (
        <img
          src={agency.img}
          alt={agency.name}
          loading="lazy"
          decoding="async"
          className="max-w-full max-h-full w-auto h-auto object-contain"
        />
      ) : (
        <div className="logo-content w-full h-full flex items-center justify-center transform scale-110 sm:scale-125">
          {agency.render()}
        </div>
      )}
    </div>
  );
}

export default function ThirdPartyInspection() {
  return (
    <section id="third-party-inspection" className="scroll-mt-24 relative bg-white py-12 sm:py-14 border-t border-teal-pale overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-teal font-semibold">
              <ShieldCheck size={16} /> Third-Party Inspection
            </span>
            <h2 className="font-display uppercase text-3xl sm:text-4xl mt-4 text-deep leading-tight">
              Inspected and approved by global agencies
            </h2>
            <p className="mt-4 text-steel-dark leading-relaxed">
              Every consignment can be verified by independent, internationally recognised
              inspection and certification bodies before it leaves our facility.
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal direction="none">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-white to-transparent z-10" />

          <div className="flex w-max animate-marquee">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center shrink-0">
                {agencies.map((agency) => (
                  <LogoCard key={`${copy}-${agency.name}`} agency={agency} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
