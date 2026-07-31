import { useState } from "react";
import { ShieldCheck, BadgeCheck } from "lucide-react";
import Reveal from "./Reveal";
import DownloadCatalogue from "./DownloadCatalogue";
import CatalogueModal from "./CatalogueModal";

const certifications = [
  {
    title: "ISO 9001:2015",
    subtitle: "Quality Management System",
    note: "Independent audit, documented processes, certified supply chain.",
  },
  {
    title: "Third-party Testing",
    subtitle: "Traceable material certificates",
    note: "Batch-wise inspection and certs supplied with every export shipment.",
  },
];

export default function CertificationsBand() {
  const [catalogueOpen, setCatalogueOpen] = useState(false);
  return (
    <section id="certifications" className="scroll-mt-24 relative bg-paper py-16">
      <div className="absolute inset-0 plate-texture opacity-20 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-[0.22em] text-teal font-semibold">Certifications</span>
            <h2 className="font-display uppercase text-3xl sm:text-4xl mt-4 text-deep leading-tight">
              Certified systems. Verifiable paperwork.
            </h2>
            <p className="mt-4 text-deep leading-relaxed">
              We hold an ISO 9001:2015 quality management system and supply full inspection
              documentation with every shipment — so your procurement team has traceable
              evidence at every stage.
            </p>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-[1.3fr_1fr] gap-8 items-center">
          <Reveal direction="right">
            <div className="grid gap-4">
              {certifications.map((cert) => (
                <div key={cert.title} className="bg-white border border-teal-pale clip-corner p-7 shadow-rest">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center clip-corner-sm bg-teal/10 text-teal">
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      {/* ISO cert number gets spec-label weight */}
                      <h3 className="font-mono font-bold text-[15px] tracking-[0.12em] uppercase text-teal">{cert.title}</h3>
                      <p className="text-sm text-steel-dark mt-0.5">{cert.subtitle}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-steel-dark leading-relaxed">{cert.note}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal direction="left">
            <div className="relative overflow-hidden clip-corner border border-teal-pale bg-gradient-to-br from-paper via-white to-paper p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,173,0.15),_transparent_40%)]" />
              <div className="relative">
                <div className="h-80 clip-corner border border-teal-pale bg-gradient-to-br from-teal-pale/70 to-white flex items-center justify-center text-center p-10">
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center h-14 w-14 clip-corner-sm bg-teal/10 text-teal">
                      <BadgeCheck size={28} />
                    </div>
                    <div>
                      <p className="spec-label text-teal mb-2">ISO 9001:2015</p>
                      <p className="text-sm text-steel-dark leading-relaxed">
                        Certificate available on request — contact our team for documentation and spec sheets for your procurement records.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <DownloadCatalogue onClick={() => setCatalogueOpen(true)} />
                  <span className="text-sm text-steel-dark">Download company profile / product catalogue.</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
      <CatalogueModal open={catalogueOpen} onClose={() => setCatalogueOpen(false)} />
    </section>
  );
}
