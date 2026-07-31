import { motion } from "framer-motion";

const shimmer = {
  opacity: [0.65, 0.9, 0.65],
  transition: {
    duration: 1.4,
    repeat: Infinity,
    ease: "easeInOut",
  },
};

export default function PageSkeleton() {
  return (
    <div className="min-h-screen bg-paper px-6 py-20">
      <div className="mx-auto max-w-7xl space-y-10">
        <motion.div animate={shimmer} className="h-16 w-3/5 rounded-2xl bg-slate-200/80" />
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <motion.div animate={shimmer} className="h-64 rounded-[2rem] bg-slate-200/80" />
            <div className="grid gap-4 sm:grid-cols-2">
              <motion.div animate={shimmer} className="h-28 rounded-3xl bg-slate-200/80" />
              <motion.div animate={shimmer} className="h-28 rounded-3xl bg-slate-200/80" />
            </div>
            <div className="space-y-4">
              <motion.div animate={shimmer} className="h-5 w-4/5 rounded-full bg-slate-200/80" />
              <motion.div animate={shimmer} className="h-5 w-3/4 rounded-full bg-slate-200/80" />
              <motion.div animate={shimmer} className="h-5 w-5/6 rounded-full bg-slate-200/80" />
            </div>
          </div>
          <div className="space-y-4">
            <motion.div animate={shimmer} className="h-24 rounded-[1.5rem] bg-slate-200/80" />
            <motion.div animate={shimmer} className="h-48 rounded-[1.5rem] bg-slate-200/80" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <motion.div animate={shimmer} className="h-40 rounded-3xl bg-slate-200/80" />
          <motion.div animate={shimmer} className="h-40 rounded-3xl bg-slate-200/80" />
          <motion.div animate={shimmer} className="h-40 rounded-3xl bg-slate-200/80" />
        </div>
      </div>
    </div>
  );
}
