import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, User } from "lucide-react";
import { productCategories, companyInfo } from "../data/products";
import { catSeoSlug } from "../lib/slugify";
import logo from "../assets/siyak-logo.png";

const LinkedinGlyph = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.38-1.85 3.61 0 4.28 2.38 4.28 5.47v6.27ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
  </svg>
);
const FacebookGlyph = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.16 8.44 9.93v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.78l-.44 2.9h-2.34V22c4.78-.77 8.44-4.93 8.44-9.94Z" />
  </svg>
);
const InstagramGlyph = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const socialLinks = [
  { Icon: LinkedinGlyph, label: "Siyak Steel on LinkedIn" },
  { Icon: FacebookGlyph, label: "Siyak Steel on Facebook" },
  { Icon: InstagramGlyph, label: "Siyak Steel on Instagram" },
];

const standards = [
  "ISO 9001:2015",
  "ASTM International",
  "ANSI / ASME",
  "MSS-SP Standards",
  "NACE MR 01-75",
  "API 6D",
];

export default function Footer({ onOpenCookieSettings }) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-paper">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <div className="grid lg:grid-cols-[1.2fr_1fr_0.9fr_0.9fr_1.2fr] gap-10">

          {/* Brand column */}
          <div>
            <img src={logo} alt="Siyak Steel International" loading="lazy" decoding="async" className="h-20 w-auto mb-5" />
            <p className="text-sm text-steel leading-relaxed max-w-xs">
              An ISO 9001:2015 certified manufacturer, stockist and exporter of ferrous &amp;
              non-ferrous metal products, trusted across 40+ countries.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {socialLinks.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="h-9 w-9 rounded-full border border-steel/30 flex items-center justify-center hover:border-teal-light hover:text-teal-light transition-colors"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Products — all categories in a single column, matching neonalloys.com's footer style */}
          <div>
            <h4 className="font-display uppercase text-sm tracking-wide text-teal-light mb-5">Products</h4>
            <div className="flex flex-col gap-y-2.5 text-sm text-steel">
              {productCategories.map((cat) => (
                <Link key={cat.slug} to={`/products/${catSeoSlug(cat.slug)}`} className="hover:text-teal-light transition-colors leading-snug">
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Company links */}
          <div>
            <h4 className="font-display uppercase text-sm tracking-wide text-teal-light mb-5">Company</h4>
            <ul className="space-y-3 text-sm text-steel">
              {[
                ["Home", "/"],
                ["About Us", "/about"],
                ["Industries", "/#industries"],
                ["Quality Policy", "/quality"],
                ["Certificate", "/quality#certifications"],
                ["Contact Us", "/contact"],
              ].map(([label, to]) => (
                <li key={to}>
                  <Link to={to} className="hover:text-teal-light transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Standards & Certifications */}
          <div>
            <h4 className="font-display uppercase text-sm tracking-wide text-teal-light mb-5">Standards</h4>
            <ul className="space-y-2.5">
              {standards.map((s) => (
                <li key={s} className="flex items-center gap-2">
                  <span className="shrink-0 w-1.5 h-1.5 bg-teal clip-corner-sm" aria-hidden="true" />
                  <span className="spec-label text-steel/80">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display uppercase text-sm tracking-wide text-teal-light mb-5">Contact</h4>
            <ul className="space-y-4 text-sm text-steel">
              <li className="flex gap-3">
                <MapPin size={17} className="text-teal-light shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-teal-light mb-1">Head Office</p>
                  <p>{companyInfo.address}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <User size={17} className="text-teal-light shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-teal-light">{companyInfo.contactPerson}</p>
                </div>
              </li>
              <li className="flex gap-3">
                <Phone size={17} className="text-teal-light shrink-0 mt-0.5" />
                <span className="flex flex-col gap-1">
                  {companyInfo.phones.map((p) => (
                    <a key={p} href={`tel:${p.replace(/\s/g, "")}`} className="hover:text-teal-light transition-colors">{p}</a>
                  ))}
                </span>
              </li>
              <li className="flex gap-3">
                <Mail size={17} className="text-teal-light shrink-0 mt-0.5" />
                <span className="flex flex-col gap-1">
                  {companyInfo.emails.map((e) => (
                    <a key={e} href={`mailto:${e}`} className="hover:text-teal-light transition-colors">{e}</a>
                  ))}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col gap-3 text-xs text-steel/70 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Siyak Steel International. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-teal-light transition-colors">Privacy Policy</Link>
            <Link to="/terms-of-service" className="hover:text-teal-light transition-colors">Terms of Service</Link>
            <button type="button" onClick={onOpenCookieSettings} className="hover:text-teal-light transition-colors">
              Cookie Settings
            </button>
            <span>{companyInfo.certification}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
