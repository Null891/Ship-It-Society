"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { usePrefersReducedMotion } from "@/lib/hooks";

/* ==========================================================================
   One week of the format.

   A sticky pair: the week card pins in the left column while its days scroll
   past on the right. CSS position: sticky does the pinning — no JS, nothing
   to desynchronise, and it degrades to a stacked list on small screens.

   The card carries a progress track that fills as you move through the days,
   so the pinned column is doing work rather than just sitting there. Like the
   hero, it is written imperatively from a MotionValue subscription: React
   never re-renders while you scroll, and it avoids Motion's scroll-linked
   style path, which mishandles keyframe offsets (see HeroSequence).
   ========================================================================== */

type Day = { day: string; title: string; body: string };

export function WeekRow({
  label,
  title,
  summary,
  days,
}: {
  label: string;
  title: string;
  summary: string;
  days: readonly Day[];
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: rowRef,
    // The range has to span more than a viewport, or the track fills before
    // the reader has reached the days. Starting near the bottom of the screen
    // and ending only once the block has scrolled well past the middle gives
    // roughly a viewport of travel even for the shorter week.
    offset: ["start 80%", "end 35%"],
  });

  const paint = useCallback(
    (p: number) => {
      const clamped = p < 0 ? 0 : p > 1 ? 1 : p;
      if (fillRef.current) {
        fillRef.current.style.transform = `scaleX(${clamped})`;
      }
      if (countRef.current) {
        const step = Math.min(days.length, Math.max(1, Math.ceil(clamped * days.length)));
        const next = String(step).padStart(2, "0");
        // Touch the DOM only when the number actually changes.
        if (countRef.current.textContent !== next) {
          countRef.current.textContent = next;
        }
      }
    },
    [days.length],
  );

  useEffect(() => {
    // Reduced motion gets the completed state rather than an empty track.
    paint(reduced ? 1 : scrollYProgress.get());
  }, [paint, reduced, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduced) return;
    paint(p);
  });

  return (
    <div ref={rowRef} className="grid12 mt-20 md:mt-28">
      <div className="col-span-4 md:sticky md:top-28 md:col-span-4 md:self-start">
        <div className="rule-t pt-5">
          <div className="flex items-baseline justify-between gap-4">
            <p className="mono-label text-[var(--stage-muted)]">{label}</p>
            <p className="mono-label text-[var(--stage-muted)]">
              <span ref={countRef}>01</span>
              <span className="opacity-45"> / {String(days.length).padStart(2, "0")}</span>
            </p>
          </div>

          {/* Progress through this week's days. */}
          <div
            aria-hidden
            className="relative mt-4 h-px w-full overflow-hidden bg-[var(--stage-line)]"
          >
            <span
              ref={fillRef}
              className="absolute inset-0 origin-left bg-marigold"
              style={{ transform: "scaleX(0)" }}
            />
          </div>

          <h3 className="mt-5 text-2xl font-semibold tracking-[-0.028em]">
            {title}
          </h3>
          <p className="pretty mt-3 max-w-[26ch] text-base text-[var(--stage-muted)]">
            {summary}
          </p>
        </div>
      </div>

      <Stagger
        as="ul"
        stagger={0.05}
        className="col-span-4 mt-8 md:col-span-7 md:col-start-6 md:mt-0"
      >
        {days.map((d) => (
          <StaggerItem
            as="li"
            key={d.day}
            className="rule-t grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 py-6 first:border-t-0 md:grid-cols-[104px_1fr] md:py-7"
          >
            <span className="mono-label pt-[3px] text-[var(--stage-muted)]">
              {d.day}
            </span>
            <div>
              <h4 className="text-lg font-medium tracking-[-0.018em]">
                {d.title}
              </h4>
              <p className="pretty mt-1.5 max-w-[48ch] text-base text-[var(--stage-muted)]">
                {d.body}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
