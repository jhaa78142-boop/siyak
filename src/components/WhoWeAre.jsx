import { Link } from "react-router-dom";
import { ArrowRight, Handshake } from "lucide-react";
import Reveal from "./Reveal";
// TODO: swap this placeholder for a real company/facility photo once received.
import whoWeAreImg from "../assets/about/about-hero.webp";

export default function WhoWeAre() {
  return (
    <section className="bg-white py-12 sm:py-14">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
        <Reveal direction="right">
          <div className="relative">
            <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-teal rounded-lg -z-10" />
            <div className="relative aspect-[5/4] rounded-lg overflow-hidden shadow-2xl shadow-deep/25">
              <img
                src={whoWeAreImg}
                alt="Siyak Steel International team and facility"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep/50 via-transparent to-transparent" />
            </div>
            <div className="absolute -left-4 bottom-4 sm:-left-6 sm:bottom-6 bg-white rounded-lg shadow-xl shadow-deep/20 px-3.5 py-2.5 flex items-center gap-2.5 max-w-[190px]">
              <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-teal-pale text-teal">
                <Handshake size={16} />
              </span>
              <div>
                <p className="font-display uppercase text-sm text-deep leading-none">13+ Years</p>
                <p className="text-[10.5px] text-steel-dark mt-1 leading-snug">Of trusted client partnerships worldwide</p>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal direction="left">
          <span className="text-xs uppercase tracking-[0.22em] text-teal font-semibold">Who We Are</span>
          <h2 className="font-display uppercase text-3xl sm:text-4xl mt-3 text-deep leading-tight">
            An export house carved out of relentless effort.
          </h2>
          <p className="mt-5 text-steel-dark leading-relaxed">
            Founded by <span className="font-semibold text-teal">Mr. Narpat Siyak</span>, Siyak Steel International
            is an ISO 9001:2015 certified manufacturer, stockist and exporter of ferrous &amp; non-ferrous metal
            products — pipes, tubes, flanges, fittings, sheets, plates, bars and fasteners — trusted across
            40+ countries.
          </p>
          <Link
            to="/about"
            className="mt-6 group inline-flex items-center gap-2 font-display uppercase text-sm tracking-[0.15em] text-teal hover:text-teal-light transition-colors"
          >
            Read More
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
