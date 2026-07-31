import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { WebPageLd } from "../components/JsonLd";
import { absoluteUrl } from "../lib/site";

export default function PrivacyPolicy() {
  return (
    <section className="bg-paper text-deep min-h-[80vh] py-24 px-6">
      <SEO
        title="Privacy Policy"
        description="Read Siyak Steel International's privacy policy covering data handling, contact form use and analytics." 
        noIndex={false}
      />
      <WebPageLd
        url={absoluteUrl("/privacy-policy")}
        title="Privacy Policy"
        description="Read Siyak Steel International's privacy policy covering data handling, contact form use and analytics."
      />
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="font-display uppercase text-3xl sm:text-4xl">Privacy Policy</h1>
        <p className="text-sm leading-relaxed text-steel-dark">
          Siyak Steel International respects your privacy and is committed to protecting the personal information you provide when using this site.
        </p>
        <div className="space-y-6 text-sm text-steel-dark leading-relaxed">
          <div>
            <h2 className="font-display uppercase text-base text-deep mb-2">Information Collected</h2>
            <p>We collect contact details provided through forms, including name, email, phone number, product interest and message content.</p>
          </div>
          <div>
            <h2 className="font-display uppercase text-base text-deep mb-2">Use of Information</h2>
            <p>Submitted details are used solely to respond to enquiries and manage quote requests. We do not sell or share your personal information with third parties except to fulfil your enquiry.</p>
          </div>
          <div>
            <h2 className="font-display uppercase text-base text-deep mb-2">Analytics</h2>
            <p>We may use analytics tools to measure site performance and improve user experience. No sensitive personal information is collected through analytics.</p>
          </div>
          <div>
            <h2 className="font-display uppercase text-base text-deep mb-2">Cookies</h2>
            <p>Basic technical cookies may be used for site functionality and analytics. You may opt out using your browser settings or by not accepting cookies where available.</p>
          </div>
          <div>
            <h2 className="font-display uppercase text-base text-deep mb-2">Contact</h2>
            <p>If you have questions about this policy, please <Link to="/contact" className="text-teal hover:text-teal-light">contact us</Link>.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
