"use client";

import { useRef } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import { MotionConfig, useAnimationFrame } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks";

/* ==========================================================================
   Lenis, driven from Motion's frame loop, plus the app-wide Motion config.

   Lenis moves the real document scroll position rather than transforming a
   wrapper, so Motion's useScroll keeps working. Running Lenis on Motion's
   own rAF (autoRaf: false) keeps the two in step — on separate loops,
   scroll-linked values trail the scroll position by a frame and the hero
   sequence visibly judders.

   Reduced motion used to return a bare Fragment instead of <ReactLenis>.
   React treats a different element type as a different tree, so the moment
   the media query resolved after hydration it tore down and rebuilt the
   whole app — nav, main, footer, the hero canvas — dropping focus and all
   client state. Now the tree is always identical. ReactLenis recreates only
   its Lenis INSTANCE when its options change (verified in lenis-react: the
   init effect depends on JSON.stringify(options)), and with `root` it
   renders no wrapper, so switching smoothing off touches no DOM at all.

   MotionConfig reducedMotion="user" makes every Motion-driven transition
   (menu, success panel, error text) respect the OS setting too. Before
   this, only the CSS and the hand-written loops did.
   ========================================================================== */

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const reduced = usePrefersReducedMotion();

  useAnimationFrame((time) => {
    lenisRef.current?.lenis?.raf(time);
  });

  return (
    <MotionConfig reducedMotion="user">
      <ReactLenis
        root
        ref={lenisRef}
        options={{
          autoRaf: false,
          lerp: 0.11,
          wheelMultiplier: 1,
          // Reduced motion gets native, unsmoothed scrolling.
          smoothWheel: !reduced,
          // Native momentum on touch feels better than a simulated one, and
          // avoids fighting the browser's own overscroll behaviour.
          syncTouch: false,
          anchors: { offset: -72 },
        }}
      >
        {children}
      </ReactLenis>
    </MotionConfig>
  );
}
