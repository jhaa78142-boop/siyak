import { Shield, Award, CheckCircle, Upload } from "lucide-react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import CTABand from "../components/CTABand";
import SEO from "../components/SEO";
import { OrganizationLd, BreadcrumbLd, WebPageLd } from "../components/JsonLd";
import { absoluteUrl } from "../lib/site";

const certifications = [
  {
    icon: Shield,
    title: "ISO 9001:2015",
    desc: "Quality Management System certified by an independent accredited body — covering procurement, processing, inspection and dispatch.",
  },
  {
    icon: Award,
    title: "ASTM / ASME Compliant",
    desc: "All materials sourced and supplied conform to ASTM International and ASME standards for chemical composition, mechanical properties and dimensional tolerances.",
  },
  {
    icon: CheckCircle,
    title: "Third-Party Inspection",
    desc: "Independent inspection agencies verify every consignment. Test certificates and Mill Test Reports accompany all shipments.",
  },
  {
    icon: CheckCircle,
    title: "NACE MR 01-75 / API 6D",
    desc: "Products available conforming to NACE and API standards for sour service, high-pressure, and critical application environments.",
  },
];

export default function Certificate() {
  return (
    <>
      <SEO
        title="Certifications — ISO 9001:2015 Certified Exporter"
        description="Siyak Steel International holds ISO 9001:2015 certification. All products conform to ASTM / ASME / NACE / API standards. Mill test certificates available with every shipment."
        keywords="iso 9001 steel exporter, astm certified steel, mill test certificate, third party inspection, nace api certified"
      />
      <OrganizationLd />
      <WebPageLd
        url={absoluteUrl("/certificate")}
        title="Certifications — ISO 9001:2015 Certified Exporter"
        description="Siyak Steel International holds ISO 9001:2015 certification with full ASTM / ASME compliance."
      />
      <BreadcrumbLd
        items={[
          { name: "Home", url: absoluteUrl("/") },
          { name: "Certificate", url: absoluteUrl("/certificate") },
        ]}
      />

      <PageHero
        eyebrow="ISO 9001:2015 Certified"
        title="Certified quality, documented at every step."
        crumb="Certificate"
      />

      {/* Certifications grid */}
      <section className="bg-paper py-16">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="mb-12 text-center max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-[0.25em] text-teal font-semibold">Our Certifications</span>
            <h2 className="font-display uppercase text-3xl sm:text-4xl mt-3 text-deep leading-tight">
              Standards we uphold
            </h2>
            <p className="mt-4 text-steel-dark leading-relaxed">
              Every shipment from Siyak Steel International is backed by documented
              quality checks, third-party inspection reports and internationally
              recognised certifications.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-2 gap-6">
            {certifications.map((cert, i) => (
              <Reveal key={cert.title} delay={i * 0.1}>
                <div className="relative h-full bg-white border border-teal-pale rounded-lg p-7 hover:shadow-lg hover:shadow-teal/8 transition-shadow duration-300">
                  <span className="absolute top-6 right-6 font-display text-3xl text-teal-pale">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <cert.icon size={26} className="text-teal" strokeWidth={1.6} />
                  <h3 className="font-display uppercase text-base mt-5 text-deep">{cert.title}</h3>
                  <p className="mt-2.5 text-sm text-steel-dark leading-relaxed">{cert.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Certificate upload placeholder */}
      <section className="bg-white py-16 border-t border-teal-pale">
        <div className="max-w-7xl mx-auto px-6">
          <Reveal className="mb-10">
            <span className="text-xs uppercase tracking-[0.25em] text-teal font-semibold">Certificate Document</span>
            <h2 className="font-display uppercase text-2xl sm:text-3xl mt-3 text-deep leading-tight">
              ISO 9001:2015 Certificate
            </h2>
            <div className="mt-2 h-[3px] w-20 bg-teal" />
          </Reveal>

          <Reveal>
            <div className="border-2 border-dashed border-teal/30 rounded-xl bg-teal-pale/20 p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal/10 mb-5">
                <Upload size={28} className="text-teal" strokeWidth={1.5} />
              </div>
              <h3 className="font-display uppercase text-lg text-deep mb-3">
                Certificate Coming Soon
              </h3>
              <p className="text-steel-dark text-sm leading-relaxed max-w-sm mx-auto">
                Our ISO 9001:2015 certificate document will be uploaded here shortly.
                For immediate verification, please contact us directly.
              </p>
              <a
                href="mailto:info@siyaksteel.com"
                className="mt-6 inline-flex items-center gap-2 bg-teal hover:bg-teal-light text-white font-display uppercase text-xs tracking-[0.12em] px-6 py-3 rounded-sm transition-colors"
              >
                Contact for Certificate
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}
