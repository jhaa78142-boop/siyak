import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import CTABand from "../components/CTABand";
import NeonAlloysBook from "../components/BookCatalogue";
import SEO from "../components/SEO";
import { OrganizationLd, BreadcrumbLd, WebPageLd } from "../components/JsonLd";
import { absoluteUrl } from "../lib/site";

export default function NickelAlloyCatalogue() {
  const pageDescription =
    "Browse our full Nickel Alloy product book — Nickel 200/201, Monel 400/K-500, Hastelloy C-276/C-22, Inconel 600/601/625/800/825, Alloy 20, Cupro-Nickel, Titanium and SMO-254 — with chemical composition and key mechanical properties for every grade.";

  return (
    <>
      <SEO
        title="Nickel Alloy Products"
        description={pageDescription}
        keywords="nickel alloy products, monel, inconel, hastelloy, incoloy, alloy 20, cupro-nickel, titanium, smo-254"
        type="product"
      />
      <OrganizationLd />
      <WebPageLd
        url={absoluteUrl("/nickel-alloy-catalogue")}
        title="Nickel Alloy Products"
        description={pageDescription}
      />
      <BreadcrumbLd
        items={[
          { name: "Home", url: absoluteUrl("/") },
          { name: "Nickel Alloy Products", url: absoluteUrl("/nickel-alloy-catalogue") },
        ]}
      />

      <PageHero
        eyebrow="Special Products"
        title="Nickel Alloy Products"
        crumb="Nickel Alloy Products"
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal className="max-w-3xl mx-auto text-center mb-10">
            <p className="text-steel-dark leading-relaxed">
              Click the cover below to open the book, then click any grade to see its
              chemical composition and key mechanical properties.
            </p>
          </Reveal>

          <Reveal>
            <NeonAlloysBook />
          </Reveal>
        </div>
      </section>

      <CTABand />
    </>
  );
}
