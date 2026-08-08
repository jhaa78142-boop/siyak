/**
 * NickelAlloyCatalogue — exact replica of neonalloys.com/nickel-products.php layout.
 * The page is ONLY the book on a pure black background.
 * No PageHero, no description text, no CTA band — nothing but the book.
 */
import NeonAlloysBook from "../components/BookCatalogue";
import SEO from "../components/SEO";
import { OrganizationLd, BreadcrumbLd, WebPageLd } from "../components/JsonLd";
import { absoluteUrl } from "../lib/site";

export default function NickelAlloyCatalogue() {
  const pageDescription =
    "Browse our full Nickel Alloy product book — Nickel 200/201, Monel 400/K-500, Hastelloy C-276/C-22, Inconel 600/601/625/800/825, Alloy 20, Cupro-Nickel, Titanium and SMO-254 — with chemical composition and key mechanical properties for every grade.";

  return (
    <>
      {/* SEO only — no visible page chrome */}
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

      {/* The book IS the page — black background fills everything below navbar */}
      <NeonAlloysBook />
    </>
  );
}

