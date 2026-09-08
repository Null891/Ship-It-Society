import type { Transition, Variants } from "motion/react";

/* ==========================================================================
   Shared motion language.

   Every duration and curve here mirrors a token in globals.css. Components
   import these rather than inventing their own timing, so the whole site
   moves with one hand.
   ========================================================================== */

/** cubic-bezier(0.16, 1, 0.3, 1) — the entrance curve. Fast out, long settle. */
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
/** cubic-bezier(0.25, 0.1, 0.25, 1) — UI state changes. */
export const EASE_APPLE = [0.25, 0.1, 0.25, 1] as const;
/** cubic-bezier(0.65, 0, 0.35, 1) — symmetric crossfades. */
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const DUR = {
  fast: 0.18,
  base: 0.28,
  slow: 0.42,
  xslow: 0.7,
} as const;

export const enter: Transition = {
  duration: DUR.xslow,
  ease: EASE_OUT_EXPO,
};

/** How far into the viewport an element must be before it reveals.
 *  Generous, so nothing animates while it is still under the fold. */
export const VIEWPORT = { once: true, margin: "0px 0px -12% 0px" } as const;

/** A line of display type rising out of its own mask. */
export const maskedLine: Variants = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: enter },
};

/** Quiet entrance for supporting content. Small distance, no scale, no blur. */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE_OUT_EXPO } },
};

export const staggerParent = (stagger = 0.06, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});
