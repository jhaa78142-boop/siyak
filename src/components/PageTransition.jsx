import { motion } from "framer-motion";

const transition = {
  duration: 0.45,
  ease: [0.22, 1, 0.36, 1],
};

export default function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1, transition }}
      exit={{ opacity: 0, y: -12, scale: 0.98, transition: { ...transition, duration: 0.28 } }}
      className="min-h-[calc(100vh-5rem)]"
    >
      {children}
    </motion.div>
  );
}
