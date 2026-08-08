import { Target, Eye, Award, Handshake, Flame, Cpu, Factory, ShieldCheck } from "lucide-react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import CTABand from "../components/CTABand";
import StatsBand from "../components/StatsBand";

import SEO from "../components/SEO";
import { OrganizationLd, BreadcrumbLd, WebPageLd } from "../components/JsonLd";
import { absoluteUrl } from "../lib/site";
import productImg from "../assets/products/stainless-steel-pipes-tubes.webp";
import aboutHeroImg from "../assets/about/about-hero.webp";

export default function About() {
  return (
    <>
      <SEO
        title="About Us"
        description="Learn about Siyak Steel International — Founded by Mr. Narpat Siyak, ISO 9001:2015 certified exporter of premium industrial piping components serving 40+ countries."
        keywords="about siyak steel, steel exporter mumbai, industrial piping supplier, iso 9001:2015 certified steel, Narpat Siyak"
      />
      <OrganizationLd />
      <WebPageLd
        url={absoluteUrl("/about")}
        title="About Us"
        description="Learn about Siyak Steel International — ISO 9001:2015 certified exporter of premium industrial piping components serving 40+ countries."
      />
      <BreadcrumbLd
        items={[
          { name: "Home", url: absoluteUrl("/") },
          { name: "About", url: absoluteUrl("/about") },
        ]}
      />
      <PageHero
        eyebrow="Who We Are"
        title="A name built on alloys & accountability"
        crumb="About"
        image={aboutHeroImg}
        imageAlt="Modern industrial warehouse and logistics facility representing Siyak Steel International's export operations"
      />

      <section className="bg-paper py-16">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
          <Reveal direction="right">
            <div className="relative">
              {/* Offset accent frame behind the photo — a small signature
                  flourish rather than a plain, flat image */}
              <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-teal rounded-lg -z-10" />
              <div className="relative aspect-[5/4] rounded-lg overflow-hidden shadow-2xl shadow-deep/25">
                <img
                src={productImg}
                alt="Stainless steel pipes and tubes product"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
                <div className="absolute inset-0 bg-gradient-to-t from-deep/50 via-transparent to-transparent" />
              </div>
              {/* Trust badge overlay */}
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
            <span className="text-xs uppercase tracking-[0.22em] text-teal font-semibold">Our Story</span>
            <h2 className="font-display uppercase text-3xl sm:text-4xl mt-3 text-deep leading-tight">
              An export house carved out of relentless effort.
            </h2>
            <p className="mt-5 text-steel-dark leading-relaxed">
              <span className="font-semibold text-teal">Siyak Steel International</span> is one of India's leading
              manufacturers, exporters, importers and stockists of stainless steel, duplex steel, super
              duplex steel, nickel alloys, titanium, carbon steel, alloy steel and other high-performance
              industrial metal products.
            </p>
            <p className="mt-4 text-steel-dark leading-relaxed">
              Founded by <span className="font-semibold text-teal">Mr. Narpat Siyak</span>, the company was built
              on a vision of delivering world-class products backed by uncompromising quality, technical
              expertise and dependable customer service. Since the establishment of our manufacturing
              facility in <span className="font-semibold text-teal">2013</span>, we have remained committed to
              engineering excellence and complete customer satisfaction.
            </p>
            <p className="mt-4 text-steel-dark leading-relaxed">
              Our comprehensive product portfolio includes pipes, tubes, flanges, buttweld fittings,
              forged fittings, fasteners, sheets, plates, coils, round bars, structural steel products,
              valves, tube sheets, ferrule fittings and custom-engineered components — all manufactured
              in accordance with international standards such as ASTM, ASME, ANSI, DIN, EN, BS, JIS and
              ISO.
            </p>
            <p className="mt-4 text-steel-dark leading-relaxed">
              Supported by advanced manufacturing facilities, rigorous quality control, experienced
              engineers and complete material traceability, we proudly serve customers across oil &amp; gas,
              petrochemical, power generation, marine, pharmaceutical, construction, fertilizer, food
              processing and infrastructure sectors worldwide.
            </p>
          </Reveal>
        </div>
      </section>

      <StatsBand />

      <section className="bg-paper py-20">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-5 gap-12 items-start">
          <Reveal className="lg:col-span-2">
            <span className="text-xs uppercase tracking-[0.22em] text-teal font-semibold">Global Reach</span>
            <h2 className="font-display uppercase text-3xl mt-3 text-deep leading-tight">
              Trusted well beyond our home port
            </h2>
            <div className="mt-3 w-12 h-1 bg-teal rounded-full" />
            <p className="mt-5 text-steel-dark leading-relaxed">
              From our Mumbai base, Siyak Steel International ships to <span className="font-semibold text-teal">40+ countries</span>,
              with a growing footprint across the Middle East, Southeast Asia, Africa and Europe.
              Thirteen years of trade relationships mean our documentation, packing and logistics
              partners are built for one thing: getting certified material through customs and onto
              your site without surprises.
            </p>
          </Reveal>
          <Reveal className="lg:col-span-3" delay={0.1}>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { icon: Flame,        title: "Process & Energy",         desc: "Oil & gas, power generation and cement plants running on our pressure-rated piping and structural steel." },
                { icon: Cpu,          title: "Precision Manufacturing",   desc: "Aerospace, automotive and pharmaceutical lines that depend on tight tolerances and traceable material certs." },
                { icon: Factory,      title: "Heavy Industry",            desc: "Paper, sugar and railway infrastructure projects specified on wear-resistant plates, bars and fasteners." },
                { icon: ShieldCheck,  title: "Stockist Reliability",      desc: "12,000+ tonnes held in inventory across 17 product lines, so orders ship without waiting on a mill run." },
              ].map((item) => (
                <div key={item.title} className="border-l-4 border-teal bg-white rounded-lg p-5 shadow-sm hover:shadow-md hover:border-teal-light transition-all duration-300">
                  <item.icon size={22} className="text-teal mb-3" strokeWidth={1.8} />
                  <h3 className="font-display uppercase text-sm text-deep mb-2">{item.title}</h3>
                  <p className="text-[13px] text-steel-dark leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-paper py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Target,
              title: "Our Mission",
              desc: "Help customers develop their resources by bringing world-class material capability and delivering it locally — fast, certified, and exactly to spec.",
            },
            {
              icon: Eye,
              title: "Our Vision",
              desc: "To be the most trusted name in ferrous and non-ferrous metal exports — known equally for inventory depth and for keeping our word on delivery dates.",
            },
            {
              icon: Award,
              title: "Our Quality",
              desc: "Quality is non-negotiable. Committed personnel and sound infrastructure ensure that only the finest material reaches our clients, every single time.",
            },
          ].map((card, i) => (
            <Reveal key={card.title} delay={i * 0.1}>
              <div className="h-full bg-white border border-teal-pale rounded-lg p-8 hover:border-teal-light hover:shadow-lg hover:shadow-teal/10 transition-all duration-300">
                <card.icon size={28} className="text-teal" strokeWidth={1.6} />
                <h3 className="font-display uppercase text-xl mt-5 text-deep">{card.title}</h3>
                <p className="mt-3 text-sm text-steel-dark leading-relaxed">{card.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <CTABand />
    </>
  );
}
