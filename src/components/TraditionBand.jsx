import Reveal from "./Reveal";
import { companyInfo } from "../data/products";

/**
 * Slim statement band directly under the Hero — matches neonalloys.com's
 * homepage pattern: a one-line intro sentence over a bold centered motto.
 */
export default function TraditionBand() {
  return (
    <section className="bg-teal-pale/40 border-y border-teal/15 py-8 sm:py-10">
      <Reveal className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-steel-dark text-sm sm:text-base leading-relaxed">
          Exporters of Steel with huge stocks —{" "}
          <span className="font-semibold text-teal">{companyInfo.name}</span>{" "}
          has become one of the most reliable sources.
        </p>
        <p className="mt-3 font-display uppercase text-xl sm:text-2xl md:text-3xl text-deep tracking-wide font-bold">
          &ldquo;Steel Is Not Our Business, It&rsquo;s Our Tradition&rdquo;
        </p>
      </Reveal>
    </section>
  );
}
