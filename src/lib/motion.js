/**
 * Siyak Steel — shared motion system
 *
 * Single source of truth for all Framer Motion durations, easing curves,
 * named animation variants, and loop configs. Import from here instead of
 * inlining values in individual components.
 */

// ---------------------------------------------------------------------------
// Easing curves
// ---------------------------------------------------------------------------
export const EASE = {
  /** Primary entrance easing — smooth expo-out, used for all reveals & page entries */
  enter: [0.22, 1, 0.36, 1],
  /** Micro-interaction easing — crisp material-like ease for hovers & toggles */
  micro: [0.4, 0, 0.2, 1],
};

// ---------------------------------------------------------------------------
// Duration bands
// ---------------------------------------------------------------------------
export const DURATION = {
  /** Micro-interactions: hover, toggle, dropdown (0.15–0.25s) */
  instant: 0.18,
  /** Fast transitions: drawers, popovers (0.3–0.4s) */
  fast: 0.35,
  /** Standard scroll-reveals and page element entries (0.6–0.7s) */
  base: 0.65,
  /** Slower reveals for heavier elements (0.8–1s) */
  slow: 0.9,
  /** Hero-only entrances — used sparingly (1.0–1.2s) */
  hero: 1.1,
};

// ---------------------------------------------------------------------------
// Named animation variants
// — Use with `variants` + `initial`/`animate` or `whileInView` on a parent.
// — Children declare the same variant names; the parent drives them via
//   `staggerChildren` on the `visible` transition.
// ---------------------------------------------------------------------------

/** Fade + rise from below — default scroll-reveal */
export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.base, ease: EASE.enter },
  },
};

/** Simple fade in — for elements that shouldn't move */
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.base, ease: EASE.enter },
  },
};

/** Scale + fade — for cards, modals, pop-in elements */
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.base, ease: EASE.enter },
  },
};

/** Fade + slide from left */
export const fadeLeft = {
  hidden: { opacity: 0, x: -28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.base, ease: EASE.enter },
  },
};

/** Fade + slide from right */
export const fadeRight = {
  hidden: { opacity: 0, x: 28 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: DURATION.base, ease: EASE.enter },
  },
};

/**
 * Stagger container — apply to a parent `motion.div`.
 * Children with any of the above variants will animate in sequence.
 *
 * @example
 * <motion.div variants={stagger} initial="hidden" whileInView="visible">
 *   <motion.p variants={fadeUp}>Item 1</motion.p>
 *   <motion.p variants={fadeUp}>Item 2</motion.p>
 * </motion.div>
 */
export const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0,
    },
  },
};

/** Stagger with longer delay between children — for grids */
export const staggerSlow = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0,
    },
  },
};

// ---------------------------------------------------------------------------
// Loop configs (pass to `transition` on `animate`)
// ---------------------------------------------------------------------------
export const LOOP = {
  float: {
    repeat: Infinity,
    duration: 6,
    ease: "easeInOut",
  },
  slowFloat: {
    repeat: Infinity,
    duration: 8,
    ease: "easeInOut",
  },
  pulse: {
    repeat: Infinity,
    duration: 2.4,
    ease: "easeInOut",
  },
};
