"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { Readout } from "@/components/ui/Hud";
import { Annotation } from "@/components/ui/Poster";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { usePrefersReducedMotion } from "@/lib/hooks";
import type { CycleWeek } from "@/components/home/fx/cycle";

/* ==========================================================================
   One week of the format.

   A sticky pair: the week card pins in the left column while its days scroll
   past on the right. CSS position: sticky does the pinning — no JS, nothing
   to desynchronise, and it degrades to a stacked list on small screens.

   Two instruments sit in the pinned column. The segmented gauge is static
   and states where this week falls in the cycle: week two of four is half
   the cycle's weeks, so two of four segments are lit and it reads 50%. The
   hairline track below it is live, filling as you move through this week's
   days.

   Like the hero, the live parts are written imperatively from a MotionValue
   subscription: React never re-renders while you scroll, and it avoids
   Motion's scroll-linked style path, which mishandles keyframe offsets (see
   HeroSequence).

   The day row crossing the middle of the screen lifts onto a panel. That is
   an IntersectionObserver writing a data attribute — no state, no render —
   and with no JavaScript every row simply stays on the canvas.
   ========================================================================== */

/** A small crosshair, closing each row off at the right margin. */
function Crosshair({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 14 14" className={`h-3.5 w-3.5 ${className}`} fill="none">
      <path d="M7 0v14M0 7h14" stroke="currentColor" strokeWidth="0.9" />
      <circle cx="7" cy="7" r="2.6" stroke="currentColor" strokeWidth="0.9" />
    </svg>
  );
}

export function WeekRow({
  week,
  index,
  total,
}: {
  week: CycleWeek;
  /** Zero-based position in the cycle. */
  index: number;
  /** How many weeks the cycle runs. */
  total: number;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  const days = week.days;
  const lit = index + 1;
  const percent = Math.round((lit / total) * 100);

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

  /* Which day row is crossing the middle of the screen. The observer writes
     a data attribute straight onto the row; nothing re-renders.

     Exactly one row is ever lit. A band wide enough that a row never falls
     between two frames is also wide enough to hold two short rows at once,
     so the callback keeps the intersecting set and lights only the row
     whose centre is nearest the middle of the viewport. */
  useEffect(() => {
    const list = listRef.current;
    if (!list || typeof IntersectionObserver === "undefined") return;
    const rows = Array.from(list.querySelectorAll<HTMLElement>("li"));
    const inBand = new Set<HTMLElement>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          if (entry.isIntersecting) inBand.add(el);
          else inBand.delete(el);
        }
        const middle = window.innerHeight / 2;
        let best: HTMLElement | null = null;
        let bestGap = Infinity;
        for (const el of inBand) {
          const r = el.getBoundingClientRect();
          const gap = Math.abs(r.top + r.height / 2 - middle);
          if (gap < bestGap) {
            bestGap = gap;
            best = el;
          }
        }
        for (const row of rows) {
          row.dataset.active = row === best ? "true" : "false";
        }
      },
      { rootMargin: "-38% 0px -38% 0px" },
    );
    rows.forEach((row) => io.observe(row));
    return () => io.disconnect();
  }, []);

  return (
    <div ref={rowRef} className="grid12 mt-20 md:mt-28">
      <div className="col-span-4 md:sticky md:top-28 md:col-span-4 md:self-start">
        <div className="rule-t pt-5">
          <div className="flex items-baseline justify-between gap-4">
            <p className="mono-label text-[var(--stage-muted)]">{week.label}</p>
            <p className="mono-label text-[var(--stage-muted)]">
              <span ref={countRef}>01</span>
              <span className="opacity-45"> / {String(days.length).padStart(2, "0")}</span>
            </p>
          </div>

          {/* Where this week falls in the cycle: lit segments out of four. */}
          <div className="mt-4 flex items-center gap-3">
            <svg
              aria-hidden
              viewBox={`0 0 ${total * 14 - 3} 10`}
              preserveAspectRatio="none"
              className="h-2.5 flex-1"
            >
              {Array.from({ length: total }, (_, i) => (
                <rect
                  key={i}
                  x={i * 14}
                  y={i < lit ? 0 : 3}
                  width={11}
                  height={i < lit ? 10 : 4}
                  fill={i < lit ? "var(--color-marigold)" : "var(--stage-line-strong)"}
                />
              ))}
            </svg>
            <span className="mono-label tnum shrink-0 text-marigold">{percent}%</span>
          </div>

          {/* Progress through this week's days. */}
          <div
            aria-hidden
            className="relative mt-3 h-px w-full overflow-hidden bg-[var(--stage-line)]"
          >
            <span
              ref={fillRef}
              className="absolute inset-0 origin-left bg-marigold"
              style={{ transform: "scaleX(0)" }}
            />
          </div>

          <h3 className="mt-5 text-2xl font-normal tracking-[-0.028em]">{week.title}</h3>
          <p className="pretty mt-3 max-w-[26ch] text-base text-[var(--stage-muted)]">
            {week.summary}
          </p>

          <Readout label="Days of the cycle" className="mt-6">
            <span className="mono-label text-[var(--stage-fg)]">
              {String(week.from).padStart(2, "0")} — {String(week.to).padStart(2, "0")}
            </span>
          </Readout>
        </div>
      </div>

      {/* Stagger is a server component and takes no ref, so the observer's
          handle is this wrapper and the rows are found inside it. */}
      <div
        ref={listRef}
        className="col-span-4 mt-8 md:col-span-7 md:col-start-6 md:mt-0"
      >
      <Stagger as="ul">
        {days.map((d, i) => (
          <StaggerItem
            as="li"
            key={d.day}
            index={i}
            className="rule-t -mx-3 grid grid-cols-[auto_1fr_auto] items-start gap-x-4 gap-y-1 px-3 py-6 transition-colors duration-[var(--dur-base)] first:border-t-0 data-[active=true]:bg-[var(--color-surface-900)] data-[active=true]:chamfer md:grid-cols-[104px_1fr_auto] md:gap-x-6 md:py-7"
          >
            <span className="mono-label pt-[3px] text-[var(--stage-muted)]">{d.day}</span>
            <div>
              <h4 className="text-lg font-medium tracking-[-0.018em]">{d.title}</h4>
              <p className="pretty mt-1.5 max-w-[48ch] text-base text-[var(--stage-muted)]">
                {d.body}
              </p>
            </div>
            <span className="flex items-center gap-2 pt-[2px]">
              <Annotation tone="current" className="hidden text-[var(--stage-subtle)] sm:inline">
                {String(i + 1).padStart(2, "0")}
              </Annotation>
              <Crosshair className="text-[var(--stage-line-strong)]" />
            </span>
          </StaggerItem>
        ))}
      </Stagger>
      </div>
    </div>
  );
}
