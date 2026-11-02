import { motion } from "framer-motion";
import { useCountUp } from "../hooks/useCountUp";

export default function StatCard({ icon: Icon, label, value, delta, deltaTone = "good" }) {
  const animatedValue = useCountUp(value);

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="mm-metric"
    >
      <div className="mm-metric-icon">
        <Icon size={17} strokeWidth={2.2} />
      </div>
      {delta && <span className={`mm-metric-delta ${deltaTone}`}>{delta}</span>}
      <p className="mm-metric-value">{animatedValue}</p>
      <p className="mm-metric-label">{label}</p>
    </motion.div>
  );
}
