import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { WebPageLd } from "../components/JsonLd";
import { absoluteUrl } from "../lib/site";

export default function TermsOfService() {
  return (
    <section className="bg-paper text-deep min-h-[80vh] py-24 px-6">
      <SEO
        title="Terms of Service"
        description="Review the terms of use for Siyak Steel International's website and enquiry services."
        noIndex={false}
      />
      <WebPageLd
        url={absoluteUrl("/terms-of-service")}
        title="Terms of Service"
        description="Review the terms of use for Siyak Steel International's website and enquiry services."
      />
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="font-display uppercase text-3xl sm:text-4xl">Terms of Service</h1>
        <p className="text-sm leading-relaxed text-steel-dark">
          These terms govern your use of the Siyak Steel International website and enquiry channels.
        </p>
        <div className="space-y-6 text-sm text-steel-dark leading-relaxed">
          <div>
            <h2 className="font-display uppercase text-base text-deep mb-2">Use of Site</h2>
            <p>You may use this website for lawful business enquiries only. Do not misuse the site or submit content that is abusive, threatening or unlawful.</p>
          </div>
          <div>
            <h2 className="font-display uppercase text-base text-deep mb-2">Enquiry Accuracy</h2>
            <p>Please provide accurate contact and enquiry information. We use your details only to respond to requests and will not share them outside of what is needed to fulfil your enquiry.</p>
          </div>
          <div>
            <h2 className="font-display uppercase text-base text-deep mb-2">Intellectual Property</h2>
            <p>All website content is owned by Siyak Steel International. You may not reproduce or redistribute materials without prior written permission.</p>
          </div>
          <div>
            <h2 className="font-display uppercase text-base text-deep mb-2">Limitation of Liability</h2>
            <p>Information on this website is provided for general informational purposes only. We are not liable for any loss arising from reliance on site content.</p>
          </div>
          <div>
            <h2 className="font-display uppercase text-base text-deep mb-2">Contact</h2>
            <p>If you have questions about these terms, please <Link to="/contact" className="text-teal hover:text-teal-light">contact us</Link>.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
