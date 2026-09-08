"use client";

import { useRef } from "react";
import { ReactLenis, type LenisRef } from "lenis/react";
import { useAnimationFrame } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks";

/* ==========================================================================
   Lenis, driven from Motion's frame loop.

   Lenis moves the real document scroll position rather than transforming a
   wrapper, so Motion's useScroll keeps working. Running Lenis on Motion's
   own rAF (autoRaf: false) keeps the two in step — on separate loops,
   scroll-linked values trail the scroll position by a frame and the hero
   sequence visibly judders.

   With root, Lenis renders no wrapper element, so the DOM is identical
   whether or not it is active. That lets us skip it entirely for
   reduced-motion visitors without any hydration mismatch.
   ========================================================================== */

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);
  const reduced = usePrefersReducedMotion();

  useAnimationFrame((time) => {
    lenisRef.current?.lenis?.raf(time);
  });

  if (reduced) return <>{children}</>;

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        lerp: 0.11,
        wheelMultiplier: 1,
        // Native momentum on touch feels better than a simulated one, and
        // avoids fighting the browser's own overscroll behaviour.
        syncTouch: false,
        smoothWheel: true,
        anchors: { offset: -72 },
      }}
    >
      {children}
    </ReactLenis>
  );
}
