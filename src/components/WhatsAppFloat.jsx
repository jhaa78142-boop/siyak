import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { companyInfo } from "../data/products";
import useHasEntered from "../hooks/useHasEntered";

export default function WhatsAppFloat({ hideForCookieBanner = false }) {
  const { pathname } = useLocation();
  const pageLabel = pathname === "/" ? "your product range" : pathname.replace(/\//g, "").replace(/-/g, " ") || "your products";
  const message = encodeURIComponent(`Hello, I’d like a quote for ${pageLabel}. Please advise grades, sizes and lead times.`);
  const entered = useHasEntered(1400);
  return (
    <motion.a
      href={`https://wa.me/${companyInfo.whatsapp}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      aria-hidden={hideForCookieBanner}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: hideForCookieBanner ? 0 : 1, scale: hideForCookieBanner ? 0.5 : 1 }}
      transition={entered ? { duration: 0.25 } : { delay: 1, duration: 0.4, type: "spring" }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className={`fixed bottom-24 right-6 sm:bottom-6 sm:right-24 z-40 h-14 w-14 rounded-full bg-[#25D366] shadow-lg shadow-black/30 flex items-center justify-center transition-opacity duration-300 sm:!opacity-100 sm:pointer-events-auto ${
        hideForCookieBanner ? "pointer-events-none" : "pointer-events-auto"
      }`}
    >
      <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
      <svg
        viewBox="0 0 24 24"
        className="relative w-8 h-8"
        fill="#ffffff"
        fillRule="evenodd"
        clipRule="evenodd"
        aria-hidden="true"
      >
        <path d="M12.001 2C6.478 2 2 6.478 2 12c0 1.887.523 3.657 1.437 5.166L2 22l4.958-1.416A9.955 9.955 0 0012.001 22c5.522 0 10-4.478 10-10S17.523 2 12.001 2zm0 18.222a8.184 8.184 0 01-4.166-1.135l-.298-.176-3.096.885.892-3.02-.194-.31A8.196 8.196 0 013.777 12c0-4.548 3.7-8.222 8.224-8.222 4.548 0 8.222 3.674 8.222 8.222 0 4.524-3.674 8.222-8.222 8.222zm4.472-6.14c-.297-.15-1.758-.867-2.03-.967-.273-.1-.471-.15-.67.148-.197.298-.767.967-.94 1.165-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      </svg>
    </motion.a>
  );
}
