import { companyInfo } from "../data/products";
import { siteUrl, siteLogo, absoluteUrl } from "../lib/site";

export function OrganizationLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: companyInfo.name,
          tagline: companyInfo.tagline,
          description: `${companyInfo.name} is an ISO 9001:2015 certified manufacturer, stockist and exporter of industrial piping components. Contact person: ${companyInfo.contactPerson}`,
          url: siteUrl,
          logo: siteLogo,
          address: {
            "@type": "PostalAddress",
            streetAddress: companyInfo.address,
            addressLocality: "Mumbai",
            postalCode: "400004",
            addressCountry: "IN",
          },
          contactPoint: [
            {
              "@type": "ContactPoint",
              telephone: companyInfo.phones[0],
              email: companyInfo.emails[0],
              contactType: "customer service",
            },
            {
              "@type": "ContactPoint",
              name: companyInfo.contactPerson,
              telephone: companyInfo.phones[0],
              email: companyInfo.emails[0],
              contactType: "sales",
            },
          ],
          founder: {
            "@type": "Person",
            name: companyInfo.contactPerson,
          },
          sameAs: [
            "https://www.linkedin.com/company/siyak-steel-international",
          ],
        }),
      }}
    />
  );
}

export function ProductLd({ product }) {
  if (!product) return null;
  const productUrl = absoluteUrl(`/products/${product.slug}`);
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          description: product.short,
          url: productUrl,
          image: product.image ? absoluteUrl(product.image) : undefined,
          brand: { "@type": "Brand", name: companyInfo.name },
          additionalProperty: [
            { name: "Grades", value: product.grades?.join(", ") },
            { name: "Sizes", value: product.sizes },
            { name: "Standards", value: product.standards?.join(", ") },
          ],
        }),
      }}
    />
  );
}

export function WebPageLd({ url, title, description }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          url,
          name: title,
          description,
          isPartOf: {
            "@type": "WebSite",
            url: siteUrl,
            name: companyInfo.name,
          },
        }),
      }}
    />
  );
}

export function BreadcrumbLd({ items }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        }),
      }}
    />
  );
}
