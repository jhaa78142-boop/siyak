import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

/**
 * PageTransition - Wraps pages with smooth transition animations
 * Works in conjunction with View Transitions API
 */
export default function PageTransition({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{
          duration: 0.3,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
