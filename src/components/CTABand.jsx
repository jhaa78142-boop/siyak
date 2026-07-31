import { Link } from "react-router-dom";
import { ArrowRight, MessageSquare } from "lucide-react";
import Reveal from "./Reveal";
import { companyInfo } from "../data/products";

export default function CTABand() {
  const waLink = `https://wa.me/${companyInfo.whatsapp?.replace(/[^0-9]/g, "")}`;

  return (
    <section className="relative bg-teal py-10 sm:py-12 overflow-hidden">
      <div className="absolute inset-0 plate-texture opacity-20" />
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <Reveal>
          {/* Response / logistics micro-stat strip above CTAs */}
          <div className="inline-flex flex-wrap items-center justify-center gap-x-6 gap-y-1 mb-8">
            <span className="spec-label text-ink/60">Usually responds within 1 business day</span>
            <span className="w-px h-4 bg-ink/20 hidden sm:block" aria-hidden="true" />
            <span className="spec-label text-ink/60">Ships to 40+ countries worldwide</span>
            <span className="w-px h-4 bg-ink/20 hidden sm:block" aria-hidden="true" />
            <span className="spec-label text-ink/60">ISO 9001:2015 certified</span>
          </div>

          <h2 className="font-display uppercase text-3xl sm:text-4xl text-ink leading-tight">
            Got a spec sheet?<br />Let's get you a quote.
          </h2>
          <p className="mt-4 text-ink/80 max-w-xl mx-auto">
            Send us your requirement and our technical team will respond with pricing,
            availability and lead time.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 bg-ink hover:bg-deep text-paper font-display uppercase text-sm tracking-[0.15em] px-7 py-4 clip-corner transition-colors min-h-[44px]"
            >
              Request a Quote
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            {companyInfo.whatsapp && (
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with Siyak Steel on WhatsApp"
                className="group inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-ink/20 hover:border-ink/30 text-ink font-display uppercase text-sm tracking-[0.15em] px-7 py-4 clip-corner transition-colors min-h-[44px] backdrop-blur-sm"
              >
                <MessageSquare size={16} aria-hidden="true" />
                Chat on WhatsApp
              </a>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
