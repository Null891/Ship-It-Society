"use client";

import { useEffect, useRef } from "react";
import { useAnimationFrame, useMotionValueEvent, useScroll, useVelocity } from "motion/react";
import { usePrefersReducedMotion, useRunWhenVisible } from "@/lib/hooks";
import { polar, r3 } from "@/lib/geometry";
import { Annotation, Barcode, RegMark } from "@/components/ui/Poster";
import { Readout } from "@/components/ui/Hud";
import {
  CYCLE_DAYS,
  CYCLE_WEEKS,
  CYCLE_WEEK_TITLES,
} from "@/components/home/fx/cycle";

/* ==========================================================================
   The cycle plate.

   A technical-poster composition rebuilt as native SVG rather than dropped
   in as a picture: concentric discs, a radial tick burst, a drawn arc, a
   rotating ring of type, corner arrows, a stepped index and a fill bar.

   It is not decoration. The form carries the content — the disc is one
   hackathon cycle, the ring reads the four week titles, the index rail is
   weeks 01-04, and the bar reads day 1 to the last day the format names.
   Every number is derived from content/club through fx/cycle; the plate
   cannot state a length the format does not.

   Everything is driven imperatively from one scroll subscription: no React
   state changes while scrolling, and no re-render per frame. Continuous
   rotation is gated on being on screen with the tab visible, and reduced
   motion pins the whole thing to its FINISHED state — the arc closed, the
   bar full, the index on the last week, the ring still.
   ========================================================================== */

const C = 180; // centre of the 360-unit plate
const R_ARC = 150;
const R_RING = 168;
const BAR_W = 268;

/* The ring of type. textLength pins the string to the circle's exact
   circumference, so the repeat count never has to be tuned by eye. */
const RING_TEXT = `${CYCLE_WEEK_TITLES.join("  ·  ")}  ·  `.repeat(4);
const RING_LEN = r3(2 * Math.PI * R_RING);
const RING_PATH = `M ${C - R_RING} ${C} a ${R_RING} ${R_RING} 0 1 1 ${R_RING * 2} 0 a ${R_RING} ${R_RING} 0 1 1 ${-R_RING * 2} 0`;

/** Crosshairs at the four cardinal points, outside the ring. */
const MARKS = [0, 90, 180, 270].map((deg) => {
  const a = (deg / 180) * Math.PI;
  const [x, y] = polar(C, C, 176, a);
  return { x, y, key: deg };
});

export function CyclePlate() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { ref: gateRef, running } = useRunWhenVisible<HTMLDivElement>();

  const discRef = useRef<SVGGElement>(null);
  const burstRef = useRef<SVGGElement>(null);
  const ringRef = useRef<SVGGElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const barRef = useRef<SVGRectElement>(null);
  const dayRef = useRef<HTMLSpanElement>(null);
  const weekRefs = useRef<(HTMLLIElement | null)[]>([]);
  const angle = useRef(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "end 15%"],
  });
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);

  /** Paint everything that depends on section progress. Pure DOM writes. */
  const paint = (p: number) => {
    const t = p < 0 ? 0 : p > 1 ? 1 : p;

    // The arc draws itself as the cycle advances.
    if (arcRef.current) arcRef.current.style.strokeDashoffset = String(1 - t);

    // The bar reads day 1 through the last day of the format.
    if (barRef.current) {
      barRef.current.setAttribute("width", String(Math.max(0.001, t * BAR_W)));
    }
    if (dayRef.current) {
      const day = Math.max(1, Math.round(t * CYCLE_DAYS));
      const next = String(day).padStart(2, "0");
      if (dayRef.current.textContent !== next) dayRef.current.textContent = next;
    }

    // The index steps through the weeks.
    const active = Math.min(CYCLE_WEEKS.length - 1, Math.floor(t * CYCLE_WEEKS.length));
    weekRefs.current.forEach((el, i) => {
      if (!el) return;
      el.style.opacity = i === active ? "1" : "0.3";
      const rule = el.firstElementChild as HTMLElement | null;
      if (rule) {
        rule.style.width = i === active ? "26px" : "10px";
        rule.style.background = i === active ? "var(--color-marigold)" : "currentColor";
      }
    });
  };

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduced) return;
    paint(p);
  });

  /* First paint. Reduced motion rests on the finished state — a closed arc,
     a full bar, the index on the last week — rather than on an empty plate
     nothing will ever fill. */
  useEffect(() => {
    paint(reduced ? 1 : scrollYProgress.get());
    // paint only writes to refs; the effect is keyed on what decides whether
    // it should run at all.
     
  }, [reduced, scrollYProgress]);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    if (!running) return;
    const v = velocity.get();
    angle.current += (delta / 1000) * (5 + Math.min(Math.abs(v) / 70, 55));
    const a = angle.current % 360;
    if (discRef.current) discRef.current.style.transform = `rotate(${a}deg)`;
    // The burst turns the other way, so the two rings never read as one object.
    if (burstRef.current) burstRef.current.style.transform = `rotate(${-a * 1.6}deg)`;
    // The type ring drifts slowest of the three, so it stays readable.
    if (ringRef.current) ringRef.current.style.transform = `rotate(${-a * 0.34}deg)`;
  });

  return (
    <section
      data-shot="cycle"
      className="relative overflow-hidden bg-ink py-20 text-paper md:py-28"
      aria-labelledby="cycle-title"
    >
      <div ref={gateRef} className="edge relative">
        <div ref={sectionRef} className="grid12 items-center gap-y-12">
          {/* --- left: the plate ------------------------------------------- */}
          <div className="col-span-4 md:col-span-6">
            <div className="relative mx-auto aspect-square w-full max-w-[460px]">
              <svg viewBox="0 0 360 360" className="h-full w-full" aria-hidden>
                {/* the ring of type: the four week titles, turning */}
                <g ref={ringRef} style={{ transformOrigin: `${C}px ${C}px` }}>
                  <defs>
                    <path id="cycle-ring-path" d={RING_PATH} fill="none" />
                  </defs>
                  <text
                    className="mono-label"
                    fill="currentColor"
                    fontSize="9"
                    opacity="0.55"
                    letterSpacing="0.18em"
                  >
                    <textPath
                      href="#cycle-ring-path"
                      startOffset="0"
                      textLength={RING_LEN}
                      lengthAdjust="spacing"
                    >
                      {RING_TEXT}
                    </textPath>
                  </text>
                </g>

                {/* cardinal crosshairs */}
                {MARKS.map((m) => (
                  <g key={m.key} opacity="0.5">
                    <path
                      d={`M${m.x - 4} ${m.y} H${m.x + 4} M${m.x} ${m.y - 4} V${m.y + 4}`}
                      stroke="var(--color-marigold)"
                      strokeWidth="1"
                    />
                  </g>
                ))}

                {/* outer disc */}
                <circle cx={C} cy={C} r={R_ARC} fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.18" />
                <circle cx={C} cy={C} r="136" fill="var(--color-ink-soft)" />
                <circle cx={C} cy={C} r="136" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.24" />

                {/* the arc that draws as the cycle advances */}
                <circle
                  ref={arcRef}
                  cx={C}
                  cy={C}
                  r={R_ARC}
                  fill="none"
                  stroke="var(--color-marigold)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1}
                  transform={`rotate(-90 ${C} ${C})`}
                />

                {/* slow disc: fine tick ring, one major tick per week */}
                <g ref={discRef} style={{ transformOrigin: `${C}px ${C}px` }}>
                  {Array.from({ length: 96 }, (_, i) => {
                    const a = (i / 96) * Math.PI * 2;
                    const major = i % (96 / CYCLE_WEEKS.length) === 0;
                    const [x1, y1] = polar(C, C, major ? 104 : 114, a);
                    const [x2, y2] = polar(C, C, 126, a);
                    return (
                      <line
                        key={i}
                        x1={x1} y1={y1}
                        x2={x2} y2={y2}
                        stroke={major ? "var(--color-marigold)" : "currentColor"}
                        strokeWidth={major ? 1.2 : 0.5}
                        opacity={major ? 0.8 : 0.22}
                      />
                    );
                  })}
                </g>

                {/* the marigold burst at the centre */}
                <g ref={burstRef} style={{ transformOrigin: `${C}px ${C}px` }}>
                  {Array.from({ length: 64 }, (_, i) => {
                    const a = (i / 64) * Math.PI * 2;
                    const [x1, y1] = polar(C, C, 42, a);
                    const [x2, y2] = polar(C, C, 62, a);
                    return (
                      <line
                        key={i}
                        x1={x1} y1={y1}
                        x2={x2} y2={y2}
                        stroke="var(--color-marigold)"
                        strokeWidth={i % 2 === 0 ? 1.6 : 0.8}
                        opacity={i % 2 === 0 ? 0.95 : 0.5}
                      />
                    );
                  })}
                </g>

                <circle cx={C} cy={C} r="34" fill="var(--color-marigold)" />
                <circle cx={C} cy={C} r="4" fill="var(--color-ink)" />
                <line x1={C} y1={C} x2={C} y2={C - 28} stroke="var(--color-ink)" strokeWidth="1.6" />

                {/* corner arrows */}
                <path d="M20 96 L20 58 L58 58" fill="none" stroke="var(--color-marigold)" strokeWidth="1.6" className="draw-path" pathLength={1} />
                <path d="M340 264 L340 302 L302 302" fill="none" stroke="var(--color-marigold)" strokeWidth="1.6" className="draw-path" pathLength={1} style={{ ["--draw-i" as string]: 2 }} />
              </svg>

              {/* the vertical week index, over the plate */}
              <ul className="absolute left-0 top-1/2 -translate-y-1/2 space-y-2.5" aria-hidden>
                {CYCLE_WEEKS.map((w, i) => (
                  <li
                    key={w.id}
                    ref={(el) => { weekRefs.current[i] = el; }}
                    className="mono-label flex items-center gap-2 transition-opacity duration-[var(--dur-base)]"
                    style={{ opacity: i === 0 ? 1 : 0.3 }}
                  >
                    <span
                      className="block h-px transition-all duration-[var(--dur-base)] ease-[var(--ease-out-expo)]"
                      style={{ width: i === 0 ? 26 : 10, background: i === 0 ? "var(--color-marigold)" : "currentColor" }}
                    />
                    {String(i + 1).padStart(2, "0")}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* --- right: the legend ----------------------------------------- */}
          <div className="col-span-4 md:col-span-5 md:col-start-8">
            <div className="flex items-center gap-3">
              <RegMark size={13} className="text-marigold" />
              <Annotation tone="current" className="text-[var(--color-muted)]">
                P.01 / Cycle plate
              </Annotation>
            </div>

            <h2 id="cycle-title" className="optical mt-5 text-3xl font-normal">
              {CYCLE_WEEK_TITLES.join(". ")}.
            </h2>

            {/* The plate's legend: which days of the cycle each ring sector
                covers. Both numbers come out of the format's own day labels. */}
            <dl className="mt-8">
              {CYCLE_WEEKS.map((w) => (
                <div
                  key={w.id}
                  className="grid grid-cols-[auto_1fr_auto] items-baseline gap-4 border-t border-[var(--color-line-dark)] py-3"
                >
                  <dt className="mono-label w-16 shrink-0 text-marigold">{w.label}</dt>
                  <dd className="mono-label tnum text-[var(--color-paper-muted)]">
                    Day {String(w.from).padStart(2, "0")} — {String(w.to).padStart(2, "0")}
                  </dd>
                  <dd className="mono-label tnum text-[var(--color-muted)]">
                    {w.span} days
                  </dd>
                </div>
              ))}
            </dl>

            {/* the fill bar, reading day 1 to the last day */}
            <div className="mt-8">
              <svg viewBox={`0 0 ${BAR_W} 10`} className="h-2.5 w-full" aria-hidden preserveAspectRatio="none">
                <rect x="0" y="3" width={BAR_W} height="4" fill="currentColor" opacity="0.16" />
                <rect ref={barRef} x="0" y="3" width="0.001" height="4" fill="var(--color-marigold)" />
              </svg>
              <div className="mt-3 flex items-end justify-between gap-4">
                <Readout label="Cycle day">
                  <span className="tnum text-lg">
                    <span ref={dayRef}>01</span>
                    <span className="text-[var(--color-muted)]"> / {CYCLE_DAYS}</span>
                  </span>
                </Readout>
                <Barcode seed="cycle-plate" bars={22} height={18} className="opacity-35" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
