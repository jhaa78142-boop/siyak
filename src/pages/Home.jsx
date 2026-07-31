import Hero from "../components/Hero";
import TraditionBand from "../components/TraditionBand";
import WhyUs from "../components/WhyUs";
import SpecialProducts from "../components/SpecialProducts";
import WhoWeAre from "../components/WhoWeAre";
import FeaturedProducts from "../components/FeaturedProducts";
import TrustedBy from "../components/TrustedBy";
import Industries from "../components/Industries";
import CTABand from "../components/CTABand";
import ThirdPartyInspection from "../components/ThirdPartyInspection";
import Testimonials from "../components/Testimonials";
import ProcessDiagram from "../components/ProcessDiagram";
import SEO from "../components/SEO";
import { OrganizationLd, WebPageLd } from "../components/JsonLd";
import { absoluteUrl } from "../lib/site";

export default function Home() {
  return (
    <>
      <SEO
        title="Premium Steel Pipes, Flanges & Fittings Exporter"
        description="Siyak Steel International — Founded by Mr. Narpat Siyak, ISO 9001:2015 certified manufacturer, stockist and exporter of industrial piping components serving 40+ countries."
        keywords="steel pipes, flanges, fittings, fasteners, industrial steel exporter, stainless steel pipes, carbon steel flanges, Narpat Siyak"
      />
      <OrganizationLd />
      <WebPageLd
        url={absoluteUrl("/")}
        title="Premium Steel Pipes, Flanges & Fittings Exporter"
        description="Siyak Steel International — Founded by Mr. Narpat Siyak, ISO 9001:2015 certified manufacturer, stockist and exporter of industrial piping components serving 40+ countries."
      />
      <Hero />
      <TraditionBand />
      <WhoWeAre />
      <WhyUs />
      <SpecialProducts />
      <FeaturedProducts />
      <ProcessDiagram />
      <Industries />
      <ThirdPartyInspection />
      <Testimonials />
      <TrustedBy />
      <CTABand />
    </>
  );
}
