import { motion } from "framer-motion";
import { Phone } from "lucide-react";
import { companyInfo } from "../data/products";
import useHasEntered from "../hooks/useHasEntered";

export default function CallFloat({ hideForCookieBanner = false }) {
  const number = companyInfo.phones[2].replace(/\s/g, "");
  const entered = useHasEntered(1550);
  return (
    <motion.a
      href={`tel:${number}`}
      aria-label="Call us now"
      aria-hidden={hideForCookieBanner}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: hideForCookieBanner ? 0 : 1, scale: hideForCookieBanner ? 0.5 : 1 }}
      transition={entered ? { duration: 0.25 } : { delay: 1.15, duration: 0.4, type: "spring" }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      className={`fixed bottom-[168px] right-6 sm:bottom-6 sm:right-[168px] z-40 h-14 w-14 rounded-full bg-deep shadow-lg shadow-black/30 flex items-center justify-center transition-opacity duration-300 sm:!opacity-100 sm:pointer-events-auto ${
        hideForCookieBanner ? "pointer-events-none" : "pointer-events-auto"
      }`}
    >
      <span className="absolute inset-0 rounded-full bg-deep animate-ping opacity-30" />
      <svg viewBox="0 0 24 24" width="28" height="28" className="relative">
        <path fill="#0bbfaf" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
      </svg>
    </motion.a>
  );
}
