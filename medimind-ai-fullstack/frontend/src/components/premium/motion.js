/** Shared motion presets — cubic-bezier(0.16, 1, 0.3, 1) everywhere */

export const easePremium = [0.16, 1, 0.3, 1];
export const easeBounce = [0.34, 1.56, 0.64, 1];
export const easeSmooth = [0.65, 0, 0.35, 1];
export const easeOutExpo = [0.19, 1, 0.22, 1];

export const springSnappy = { type: "spring", stiffness: 420, damping: 34 };
export const springSoft = { type: "spring", stiffness: 260, damping: 28 };
export const springMagnetic = { type: "spring", stiffness: 300, damping: 20 };
export const springPress = { type: "spring", stiffness: 500, damping: 30 };

export const fadeUp = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: i * 0.05, duration: 0.55, ease: easePremium },
  }),
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: (i = 0) => ({
    opacity: 1,
    transition: { delay: i * 0.04, duration: 0.4, ease: easePremium },
  }),
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.94 },
  show: (i = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.05, duration: 0.5, ease: easePremium },
  }),
};

export const slideIn = {
  hidden: { opacity: 0, x: -16 },
  show: (i = 0) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, duration: 0.45, ease: easePremium },
  }),
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const staggerFast = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04, delayChildren: 0.02 } },
};

export const pageReveal = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { duration: 0.38, ease: easePremium },
};

export const modalVariants = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  panel: {
    initial: { opacity: 0, y: 24, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1, transition: springSoft },
    exit: { opacity: 0, y: 16, scale: 0.97, transition: { duration: 0.2 } },
  },
};

export const drawerVariants = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  panel: {
    initial: { x: "100%" },
    animate: { x: 0, transition: springSnappy },
    exit: { x: "100%", transition: { duration: 0.28, ease: easePremium } },
  },
};
