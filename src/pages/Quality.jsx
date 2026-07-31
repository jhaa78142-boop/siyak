import { ClipboardCheck, Microscope, FileCheck2, PackageCheck } from "lucide-react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import CTABand from "../components/CTABand";
import CertificationsBand from "../components/CertificationsBand";
import SEO from "../components/SEO";
import { OrganizationLd, BreadcrumbLd, WebPageLd } from "../components/JsonLd";
import { absoluteUrl } from "../lib/site";
import refineryHeroImg from "../assets/quality/refinery-hero.webp";
import pmiTestingImg from "../assets/quality/pmi-testing.webp";

const steps = [
  {
    icon: Microscope,
    title: "Raw Material Testing",
    desc: "Every incoming batch is verified against chemical and mechanical composition standards before it enters our stock.",
  },
  {
    icon: ClipboardCheck,
    title: "In-Process Inspection",
    desc: "Dimensional and visual checks run continuously through fabrication, finishing and surface treatment.",
  },
  {
    icon: FileCheck2,
    title: "Third-Party Certification",
    desc: "Independent inspection agencies verify the consignment and issue test certificates that travel with the goods.",
  },
  {
    icon: PackageCheck,
    title: "Export-Grade Packing",
    desc: "Materials are packed to withstand long-haul sea and air freight without compromising finish or integrity.",
  },
];

export default function Quality() {
  return (
    <>
      <SEO
        title="Quality Assurance"
        description="Siyak Steel International's quality assurance process — ISO 9001:2015 certified with raw material testing and third-party certification."
        keywords="iso 9001:2015 steel, quality assurance industrial piping, third-party steel certification, astm asme standards"
      />
      <OrganizationLd />
      <WebPageLd
        url={absoluteUrl("/quality")}
        title="Quality Assurance"
        description="Siyak Steel International's quality assurance process — ISO 9001:2015 certified with raw material testing and third-party certification."
      />
      <BreadcrumbLd
        items={[
          { name: "Home", url: absoluteUrl("/") },
          { name: "Quality", url: absoluteUrl("/quality") },
        ]}
      />
      <PageHero
        eyebrow="ISO 9001:2015 Certified"
        title="Quality isn't a department. It's the process."
        crumb="Quality"
        image={refineryHeroImg}
        imageAlt="Oil and gas refinery — the process-critical environments Siyak Steel International's piping components are engineered for"
      />

      <section className="bg-paper py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_1.35fr] gap-10 items-start">
            <Reveal direction="right">
              <div className="relative lg:sticky lg:top-28">
                <div className="absolute -bottom-5 -right-5 w-full h-full border-2 border-teal rounded-lg -z-10" />
                <div className="relative aspect-[4/5] rounded-lg overflow-hidden shadow-2xl shadow-deep/25">
                  <img
                    src={pmiTestingImg}
                    alt="Technician performing Positive Material Identification (PMI) testing on a welded pipe fitting"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-deep/60 via-transparent to-transparent" />
                </div>
                <div className="absolute -left-6 bottom-6 sm:-left-8 sm:bottom-8 bg-white rounded-lg shadow-xl shadow-deep/20 px-5 py-4 flex items-center gap-3.5 max-w-[260px]">
                  <span className="shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-teal-pale text-teal">
                    <Microscope size={22} strokeWidth={1.8} />
                  </span>
                  <div>
                    <p className="font-display uppercase text-sm text-deep leading-snug">PMI Testing</p>
                    <p className="text-xs text-steel-dark mt-1 leading-snug">Every alloy verified on the shop floor before it's approved for stock.</p>
                  </div>
                </div>
              </div>
            </Reveal>

            <div>
              <Reveal className="max-w-2xl">
                <h2 className="font-display uppercase text-3xl text-deep leading-tight">
                  Four checkpoints, zero shortcuts.
                </h2>
                <p className="mt-4 text-steel-dark leading-relaxed">
                  From the moment raw material arrives to the moment a container is sealed for export,
                  every step is documented, inspected and signed off — so the test certificate in your
                  hand always matches the metal in your hands.
                </p>
              </Reveal>

              <div className="grid sm:grid-cols-2 gap-6 mt-10">
                {steps.map((step, i) => (
                  <Reveal key={step.title} delay={i * 0.1}>
                    <div className="relative h-full bg-white border border-teal-pale rounded-lg p-7">
                      <span className="absolute top-6 right-6 font-display text-3xl text-teal-pale">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <step.icon size={26} className="text-teal" strokeWidth={1.6} />
                      <h3 className="font-display uppercase text-base mt-5 text-deep">{step.title}</h3>
                      <p className="mt-2.5 text-sm text-steel-dark leading-relaxed">{step.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 border-t border-teal-pale">
        <CertificationsBand />
      </section>
      <section className="bg-white py-16 border-t border-teal-pale">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <Reveal direction="right">
            <span className="text-xs uppercase tracking-[0.22em] text-teal font-semibold">
              Certification
            </span>
            <h2 className="font-display uppercase text-3xl mt-3 leading-tight text-deep">
              ISO 9001:2015 — backed by paperwork, not promises
            </h2>
            <p className="mt-4 text-steel-dark leading-relaxed">
              Our quality management system is independently audited and certified to ISO 9001:2015,
              covering everything from supplier evaluation to final dispatch documentation.
            </p>
          </Reveal>
          <Reveal direction="left">
            <div className="grid grid-cols-2 gap-4">
              {['ASTM A234', 'ASME B16.5', 'MSS-SP-43', 'NACE MR0175', 'API 6D', 'DIN 2576'].map((std) => (
                <div
                  key={std}
                  className="bg-teal-pale border border-teal/20 clip-corner-sm px-4 py-4 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-teal"
                >
                  {std}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}
