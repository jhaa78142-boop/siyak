import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { DURATION, EASE } from "../lib/motion";

export default function PageHero({ eyebrow, title, crumb, crumbs, image, imageAlt }) {
  // `crumbs` (optional) lets a page render a multi-level trail, e.g.
  // Home / Products / Pipes & Tubes / Stainless Steel Pipes & Tubes.
  // Each item is { label, to } — the last item renders as plain text.
  // Falls back to the original single `crumb` string for every other page.
  const trail = crumbs || [{ label: crumb }];

  // `image` (optional) swaps the flat paper background for a real photo
  // with a dark gradient scrim, switching heading/breadcrumb text to light
  // so it stays legible over the photo.
  return (
    <section
      className={`relative overflow-hidden border-b border-teal-pale ${
        image ? "py-28 sm:py-32 text-paper" : "bg-paper text-deep py-20"
      }`}
    >
      {image ? (
        <>
          <img
            src={image}
            alt={imageAlt || ""}
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-deep via-deep/80 to-deep/55" />
          <div className="absolute inset-0 bg-deep/20" />
        </>
      ) : (
        <div className="absolute inset-0 grid-texture opacity-[0.07]" />
      )}
      <div className="relative max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DURATION.base, ease: EASE.enter }}
        >
          <div className={`flex items-center flex-wrap gap-1.5 text-xs mb-4 ${image ? "text-paper/70" : "text-steel"}`}>
            <Link to="/" className="hover:text-teal transition-colors">Home</Link>
            {trail.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <ChevronRight size={12} />
                {item.to ? (
                  <Link to={item.to} className="hover:text-teal transition-colors">
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-teal">{item.label}</span>
                )}
              </span>
            ))}
          </div>
          {eyebrow && (
            <span className="text-xs uppercase tracking-[0.22em] text-teal font-semibold">
              {eyebrow}
            </span>
          )}
          <h1 className={`font-display uppercase text-3xl sm:text-4xl md:text-5xl mt-3 leading-tight ${image ? "text-paper" : "text-deep"}`}>
            {title}
          </h1>
        </motion.div>
      </div>
    </section>
  );
}
