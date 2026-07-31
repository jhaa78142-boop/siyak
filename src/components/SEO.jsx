import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";
import { companyInfo } from "../data/products";
import { siteLogo, absoluteUrl } from "../lib/site";

export default function SEO({
  title,
  description,
  image,
  type = "website",
  keywords = "",
  noIndex = false,
}) {
  const location = useLocation();
  const canonicalUrl = absoluteUrl(location.pathname);

  const defaultTitle = `${companyInfo.name} | ISO 9001:2015 Certified Exporter`;
  const defaultDescription = `${companyInfo.name} — ISO 9001:2015 certified manufacturer, stockist and exporter of pipes, tubes, flanges, fittings, fasteners, bars, plates and valves, serving 40+ countries.`;

  const finalTitle = title ? `${title} | ${companyInfo.name}` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalImage = image ? (image.startsWith("http") ? image : absoluteUrl(image)) : siteLogo;
  const robots = noIndex ? "noindex, nofollow" : "index, follow";

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Tags */}
      <meta property="og:locale" content="en_US" />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:alt" content={`${companyInfo.name} logo and brand image`} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={companyInfo.name} />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:image:alt" content={`${companyInfo.name} brand image`} />
    </Helmet>
  );
}
