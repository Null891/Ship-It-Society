"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks";

/* ==========================================================================
   A headline that brightens word by word as the section crosses the screen.

   Contract notes:

     · The server renders the words at full strength. Nothing is dimmed
       unless JavaScript runs, so a no-JS or reduced-motion visitor reads a
       finished sentence, not a half-lit one.
     · The floor is 0.42, not the 0.35 that looks best. #f2f2f3 at 0.35 over
       black measures 2.96:1; at 0.42 it is 3.83:1, which clears the 3:1
       large-text minimum with room to spare. Display type only — never put
       this on body copy.
     · Opacity is written straight to the spans from the scroll
       subscription. No React state, so scrubbing costs one style write per
       word per frame and no renders.
   ========================================================================== */

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const FLOOR = 0.42;

export function WordReveal({
  text,
  id,
  className = "",
}: {
  text: string;
  id?: string;
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const reduced = usePrefersReducedMotion();
  const words = text.split(" ");

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 88%", "end 52%"],
  });

  const paint = (p: number) => {
    const el = ref.current;
    if (!el) return;
    const spans = el.querySelectorAll<HTMLElement>("[data-word]");
    const t = clamp01(p);
    const n = spans.length || 1;
    spans.forEach((span, i) => {
      // Each word has its own window, and the windows overlap, so the
      // brightening reads as a wave rather than as a queue.
      const start = (i / n) * 0.7;
      const o = FLOOR + (1 - FLOOR) * clamp01((t - start) / 0.26);
      const next = o.toFixed(2);
      if (span.dataset.o !== next) {
        span.dataset.o = next;
        span.style.opacity = next;
      }
    });
  };

  useEffect(() => {
    if (reduced) return;
    paint(scrollYProgress.get());
    // paint is recreated every render but only reads refs; the effect is
    // keyed on what actually decides whether it should run at all.
     
  }, [reduced, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduced) return;
    paint(p);
  });

  return (
    <h2 ref={ref} id={id} className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span data-word="">{word}</span>
          {i < words.length - 1 ? " " : ""}
        </span>
      ))}
    </h2>
  );
}
