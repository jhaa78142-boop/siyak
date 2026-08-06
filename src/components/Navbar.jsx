import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, MessageSquare } from "lucide-react";
import { productCategories } from "../data/products";
import { catSeoSlug } from "../lib/slugify";
import logo from "../assets/siyak-logo.png";
import { DURATION, EASE } from "../lib/motion";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Products", to: "/products", mega: true },
  { label: "HS Codes", to: "/hs-codes" },
  { label: "Quality Policy", to: "/quality" },
  { label: "Certificate", to: "/quality#certifications" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar({ onOpenQuote }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [location.pathname]);


  return (
    <>
      <header className="relative sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md shadow-deep/5">
        <nav className="relative max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img src={logo} alt="Siyak Steel International" className="h-16 w-auto" />
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) =>
              link.mega ? (
                <div
                  key={link.to}
                  className="relative"
                  onMouseEnter={() => setMegaOpen(true)}
                  onMouseLeave={() => setMegaOpen(false)}
                >
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center gap-1 px-4 py-2 min-h-[44px] text-sm font-display tracking-wide uppercase transition-colors ${
                        isActive ? "text-teal" : "text-deep hover:text-teal"
                      }`
                    }
                  >
                    {link.label}{" "}
                    <ChevronDown size={14} className={`transition-transform ${megaOpen ? "rotate-180" : ""}`} />
                  </NavLink>

                  <AnimatePresence>
                    {megaOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: DURATION.instant }}
                        className="absolute left-0 top-full pt-3 w-64"
                      >
                        <div className="bg-white border border-teal-pale rounded-md shadow-elevated shadow-deep/12 overflow-hidden py-1">
                          {productCategories.map((cat) => (
                            <Link
                              key={cat.slug}
                              to={`/products/${catSeoSlug(cat.slug)}`}
                              className="block px-5 py-2.5 text-sm text-deep hover:bg-paper hover:text-teal transition-colors"
                            >
                              {cat.name}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-4 py-2 min-h-[44px] flex items-center text-sm font-display tracking-wide uppercase transition-colors ${
                      isActive ? "text-teal" : "text-deep hover:text-teal"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              )
            )}
          </div>

          <div className="hidden lg:block">
            <button
              type="button"
              onClick={onOpenQuote}
              className="inline-flex items-center gap-2 bg-teal hover:bg-teal-light text-white font-display uppercase text-sm tracking-wide px-5 py-3 transition-colors clip-corner min-h-[44px]"
            >
              <MessageSquare size={16} aria-hidden="true" />
              Let's Talk
            </button>
          </div>

          {/* Mobile hamburger — explicit size for touch target */}
          <button
            className="lg:hidden w-11 h-11 flex items-center justify-center transition-colors text-deep"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: DURATION.fast, ease: EASE.enter }}
              className="lg:hidden bg-white border-t border-teal-pale overflow-hidden"
            >
              <div className="px-6 py-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    className={({ isActive }) =>
                      `flex items-center min-h-[44px] border-b border-teal-pale text-sm font-display uppercase tracking-wide ${
                        isActive ? "text-teal" : "text-deep"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
                <button
                  type="button"
                  onClick={onOpenQuote}
                  className="mt-4 w-full text-center bg-teal text-white font-display uppercase text-sm tracking-wide px-5 py-3.5 clip-corner min-h-[44px]"
                >
                  Let's Talk
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
