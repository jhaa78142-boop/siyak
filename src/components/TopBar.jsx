import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, Award } from "lucide-react";
import { companyInfo } from "../data/products";

export default function TopBar() {
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    window.googleTranslateElementInit = function () {
      try {
        if (
          typeof window.google !== "undefined" &&
          window.google.translate &&
          window.google.translate.TranslateElement
        ) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              layout:
                window.google.translate.TranslateElement.InlineLayout.SIMPLE,
              autoDisplay: false,
            },
            "google_translate_element",
          );
        }
      } catch (e) {
        // fail silently if translate isn't available
      }
    };

    const existing = document.querySelector(
      'script[src*="translate.google.com/translate_a/element.js"]',
    );
    if (existing) {
      if (window.googleTranslateElementInit) window.googleTranslateElementInit();
      return;
    }

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.head.appendChild(script);
  }, []);

  return (
    <div className="hidden sm:block bg-ink text-paper/90 border-b border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 h-11 flex items-center justify-between gap-6 text-xs">
        {/* LEFT — ISO / Government Recognised Star Export House */}
        <div className="flex items-center gap-2 shrink-0">
          <Award
            size={14}
            className="text-teal-light shrink-0"
            aria-hidden="true"
          />
          <span
            className="font-medium tracking-wide text-[12px] whitespace-nowrap"
            style={{ color: "#d5f5e3" }}
          >
            ISO 9001:2015 Certified
          </span>
        </div>

        {/* RIGHT — three items in the exact same order as neonalloys:
            1) Google Translate (Language selector)
            2) Email
            3) HS Codes link   (rightmost) */}
        <ul className="flex items-center gap-6 m-0 p-0 list-none shrink-0">
          <li className="flex items-center">
            <div
              id="google_translate_element"
              className="flex items-center"
              suppressHydrationWarning
            />
          </li>

          <li className="hidden md:flex items-center gap-2">
            <a
              href={`mailto:${companyInfo.emails[0]}`}
              className="flex items-center gap-2 hover:text-teal-light transition-colors"
            >
              <Mail
                size={13}
                className="text-teal-light shrink-0"
                aria-hidden="true"
              />
              <span className="tracking-wide text-[13px] whitespace-nowrap">
                {companyInfo.emails[0]}
              </span>
            </a>
          </li>

          <li className="flex items-center">
            <Link
              to="/hs-codes"
              className="flex items-center gap-2 hover:text-teal-light transition-colors group"
            >
              <ArrowRight
                size={14}
                className="text-teal-light shrink-0 group-hover:translate-x-0.5 transition-transform"
                aria-hidden="true"
              />
              <span className="font-display uppercase tracking-[0.18em] text-[12px] font-medium whitespace-nowrap">
                HS Codes
              </span>
            </Link>
          </li>
        </ul>
      </div>

      <style>{`
        /* Google Translate widget — visual parity with reference */
        #google_translate_element {
          display: inline-flex !important;
          align-items: center !important;
        }
        #google_translate_element .goog-te-gadget {
          font-family: inherit !important;
          font-size: 12px !important;
          color: #fafafa !important;
          line-height: 1 !important;
          white-space: nowrap !important;
        }
        #google_translate_element .goog-te-gadget-simple {
          background-color: transparent !important;
          border: none !important;
          border-left: 1px solid rgba(255,255,255,0.12) !important;
          border-right: 1px solid rgba(255,255,255,0.12) !important;
          border-radius: 0 !important;
          padding: 4px 14px !important;
          font-size: 12px !important;
          color: #fafafa !important;
          line-height: 1 !important;
          height: auto !important;
          min-height: 30px !important;
          display: inline-flex !important;
          align-items: center !important;
          white-space: nowrap !important;
          overflow: visible !important;
          margin: 0 !important;
          vertical-align: middle !important;
        }
        #google_translate_element .goog-te-gadget-simple > span {
          display: inline-flex !important;
          align-items: center !important;
          line-height: 1 !important;
          padding: 0 !important;
          margin: 0 !important;
          vertical-align: middle !important;
        }
        #google_translate_element .goog-te-gadget-simple > span a {
          display: inline-flex !important;
          align-items: center !important;
          color: #fafafa !important;
          text-decoration: none !important;
          padding: 0 !important;
          margin: 0 !important;
          border: none !important;
          line-height: 1 !important;
          vertical-align: middle !important;
          white-space: nowrap !important;
          font-size: 12px !important;
        }
        #google_translate_element .goog-te-gadget-simple > span a > span:first-child {
          color: #fafafa !important;
          display: inline !important;
          padding: 0 !important;
          margin: 0 4px 0 0 !important;
          border: none !important;
          line-height: 1 !important;
          vertical-align: middle !important;
          white-space: nowrap !important;
          font-size: 12px !important;
        }
        /* the small separator inside the widget label */
        #google_translate_element .goog-te-gadget-simple > span a > span[style*="border-left"] {
          display: none !important;
        }
        /* the dropdown arrow */
        #google_translate_element .goog-te-gadget-simple > span a > span[aria-hidden] {
          color: #fafafa !important;
          display: inline !important;
          padding: 0 0 0 6px !important;
          margin: 0 !important;
          border: none !important;
          line-height: 1 !important;
          vertical-align: middle !important;
          font-size: 10px !important;
          opacity: 0.85;
        }
        /* the google globe icon */
        #google_translate_element .goog-te-gadget-icon {
          display: inline-block !important;
          width: 16px !important;
          height: 16px !important;
          margin-right: 6px !important;
          vertical-align: middle !important;
          padding: 0 !important;
          border: none !important;
          line-height: 1 !important;
        }
        /* cleardot spacer images */
        #google_translate_element .goog-te-gadget-simple img[src*="cleardot"] {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }

        /* Powered-by Google text (hide) */
        .VIpgJd-ZVi9od-l4eHX-hSRGPd,
        .VIpgJd-ZVi9od-l4eHX-hSRGPd:link,
        .VIpgJd-ZVi9od-l4eHX-hSRGPd:visited,
        .VIpgJd-ZVi9od-l4eHX-hSRGPd:hover,
        .VIpgJd-ZVi9od-l4eHX-hSRGPd:active {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          width: 0 !important;
          height: 0 !important;
          overflow: hidden !important;
        }
        #google_translate_element .goog-te-gadget > a {
          display: none !important;
        }

        /* suppress Google translation banner overlay */
        .goog-te-banner-frame,
        .goog-te-banner-frame.skiptranslate,
        iframe.goog-te-banner-frame {
          display: none !important;
          visibility: hidden !important;
          height: 0 !important;
          width: 0 !important;
          overflow: hidden !important;
          border: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
          position: absolute !important;
          top: -9999px !important;
          left: -9999px !important;
        }
        body {
          top: 0 !important;
          position: static !important;
        }
        .skiptranslate iframe.goog-te-banner-frame {
          display: none !important;
        }
        /* remove translation highlight backgrounds */
        font.goog-te-gadget {
          font-family: inherit !important;
        }
        .goog-text-highlight {
          background-color: transparent !important;
          background: transparent !important;
          box-shadow: none !important;
          -webkit-box-shadow: none !important;
        }
      `}</style>
    </div>
  );
}
