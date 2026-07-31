import { motion } from "framer-motion";
import { companyInfo } from "../data/products";
import { DURATION, EASE } from "../lib/motion";

/**
 * Slim statement band directly under the Hero — matches neonalloys.com's
 * homepage pattern: a one-line intro sentence over a bold centered motto.
 * Animates on MOUNT (not on scroll) so it's visible immediately on page load.
 */
export default function TraditionBand() {
  return (
    <section className="bg-teal-pale/40 border-b border-teal/15 py-8 sm:py-10">
      <motion.div
        className="max-w-3xl mx-auto px-6 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.base, delay: 0.15, ease: EASE.enter }}
      >
        <p className="text-steel-dark text-sm sm:text-base leading-relaxed">
          Exporters of Steel with huge stocks —{" "}
          <span className="font-semibold text-teal">{companyInfo.name}</span>{" "}
          has become one of the most reliable sources.
        </p>
        <p className="mt-3 font-display uppercase text-xl sm:text-2xl md:text-3xl text-deep tracking-wide font-bold">
          &ldquo;Steel Is Not Our Business, It&rsquo;s Our Tradition&rdquo;
        </p>
      </motion.div>
    </section>
  );
}
