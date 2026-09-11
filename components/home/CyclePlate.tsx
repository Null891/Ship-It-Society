"use client";

import { useRef } from "react";
import { useAnimationFrame, useMotionValueEvent, useScroll, useVelocity } from "motion/react";
import { format } from "@/content/club";
import { usePrefersReducedMotion, useRunWhenVisible } from "@/lib/hooks";
import { polar } from "@/lib/geometry";
import { Annotation, Barcode, RegMark } from "@/components/ui/Poster";

/* ==========================================================================
   The cycle plate.

   A technical-poster composition rebuilt as native SVG rather than dropped
   in as a picture: concentric discs, a radial tick burst, a drawn arc, corner
   arrows, a stepped index and a fill bar.

   It is not decoration. The form carries the content — the disc is one
   hackathon cycle, the index rail is weeks 01-04, and the bar reads day 1 to
   day 30. Scrolling the section turns the disc, steps the index and fills
   the bar, so the graphic states the same thing the timeline beside it does.

   Everything is driven imperatively from one scroll subscription: no React
   state changes while scrolling, and no re-render per frame. Continuous
   motion is gated on being on screen with the tab visible, and reduced
   motion pins the whole thing to its finished state — where the bar is full,
   the index sits on week 04, and every label is readable.
   ========================================================================== */

const WEEKS = format.weeks.map((w) => ({ label: w.label, title: w.title }));
const TOTAL_DAYS = 30;

export function CyclePlate() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { ref: gateRef, running } = useRunWhenVisible<HTMLDivElement>();

  const discRef = useRef<SVGGElement>(null);
  const burstRef = useRef<SVGGElement>(null);
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

    // The bar reads day 1 through day 30.
    if (barRef.current) barRef.current.setAttribute("width", String(Math.max(0.001, t * 268)));
    if (dayRef.current) {
      dayRef.current.textContent = `DAY ${String(Math.max(1, Math.round(t * TOTAL_DAYS))).padStart(2, "0")} / ${TOTAL_DAYS}`;
    }

    // The index steps through the four weeks.
    const active = Math.min(WEEKS.length - 1, Math.floor(t * WEEKS.length));
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

  useMotionValueEvent(scrollYProgress, "change", paint);

  // Reduced motion, and the first paint, both land on a readable state.
  useAnimationFrame((_, delta) => {
    if (reduced) return;
    if (!running) return;
    const v = velocity.get();
    angle.current += (delta / 1000) * (5 + Math.min(Math.abs(v) / 70, 55));
    const a = angle.current % 360;
    if (discRef.current) discRef.current.style.transform = `rotate(${a}deg)`;
    // The burst turns the other way, so the two rings never read as one object.
    if (burstRef.current) burstRef.current.style.transform = `rotate(${-a * 1.6}deg)`;
  });

  return (
    <section
      className="relative overflow-hidden bg-ink py-20 text-paper md:py-28"
      aria-labelledby="cycle-title"
    >
      <div ref={gateRef} className="edge relative">
        <div ref={sectionRef} className="grid12 items-center gap-y-12">
          {/* --- left: the plate ------------------------------------------- */}
          <div className="col-span-4 md:col-span-6">
            <div className="relative mx-auto aspect-square w-full max-w-[420px]">
              <svg viewBox="0 0 320 320" className="h-full w-full" aria-hidden>
                {/* outer disc */}
                <circle cx="160" cy="160" r="146" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.18" />
                <circle cx="160" cy="160" r="132" fill="var(--color-ink-soft)" />
                <circle cx="160" cy="160" r="132" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.24" />

                {/* the arc that draws as the cycle advances */}
                <circle
                  ref={arcRef}
                  cx="160" cy="160" r="146"
                  fill="none"
                  stroke="var(--color-marigold)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  strokeDashoffset={1}
                  transform="rotate(-90 160 160)"
                  style={{ transition: "stroke-dashoffset 90ms linear" }}
                />

                {/* slow disc: fine tick ring */}
                <g ref={discRef} style={{ transformOrigin: "160px 160px" }}>
                  {Array.from({ length: 90 }, (_, i) => {
                    const a = (i / 90) * Math.PI * 2;
                    const inner = i % 6 === 0 ? 104 : 114;
                    const [x1, y1] = polar(160, 160, inner, a);
                    const [x2, y2] = polar(160, 160, 124, a);
                    return (
                      <line
                        key={i}
                        x1={x1} y1={y1}
                        x2={x2} y2={y2}
                        stroke="currentColor"
                        strokeWidth={i % 6 === 0 ? 1 : 0.5}
                        opacity={i % 6 === 0 ? 0.5 : 0.22}
                      />
                    );
                  })}
                </g>

                {/* the marigold burst at the centre */}
                <g ref={burstRef} style={{ transformOrigin: "160px 160px" }}>
                  {Array.from({ length: 64 }, (_, i) => {
                    const a = (i / 64) * Math.PI * 2;
                    const [x1, y1] = polar(160, 160, 40, a);
                    const [x2, y2] = polar(160, 160, 60, a);
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

                <circle cx="160" cy="160" r="34" fill="var(--color-marigold)" />
                <circle cx="160" cy="160" r="4" fill="var(--color-ink)" />
                <line x1="160" y1="160" x2="160" y2="132" stroke="var(--color-ink)" strokeWidth="1.6" />

                {/* corner arrow, straight from the reference */}
                <path d="M18 78 L18 44 L52 44" fill="none" stroke="var(--color-marigold)" strokeWidth="1.6" className="draw-path" pathLength={1} />
                <path d="M302 242 L302 276 L268 276" fill="none" stroke="var(--color-marigold)" strokeWidth="1.6" className="draw-path" pathLength={1} style={{ ["--draw-i" as string]: 2 }} />
              </svg>

              {/* the vertical week index, over the plate */}
              <ul className="absolute left-0 top-1/2 -translate-y-1/2 space-y-2.5" aria-hidden>
                {WEEKS.map((w, i) => (
                  <li
                    key={w.label}
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

          {/* --- right: the readout ---------------------------------------- */}
          <div className="col-span-4 md:col-span-5 md:col-start-8">
            <div className="flex items-center gap-3">
              <RegMark size={13} className="text-marigold" />
              <Annotation tone="current" className="text-[var(--color-muted)]">
                04 / The cycle
              </Annotation>
            </div>

            <h2 id="cycle-title" className="optical mt-5 text-3xl font-semibold">
              Four weeks. One deployment.
            </h2>
            <p className="pretty mt-5 max-w-[42ch] text-base text-[var(--color-paper-muted)]">
              Every hackathon turns the same way. Scope, build, harden, ship —
              and the clock does not stop for anyone.
            </p>

            <dl className="mt-9">
              {WEEKS.map((w) => (
                <div
                  key={w.label}
                  className="flex items-baseline gap-4 border-t border-[var(--color-line-dark)] py-3"
                >
                  <dt className="mono-label w-16 shrink-0 text-marigold">{w.label}</dt>
                  <dd className="text-base">{w.title}</dd>
                </div>
              ))}
            </dl>

            {/* the fill bar, reading day 1 to day 30 */}
            <div className="mt-8">
              <svg viewBox="0 0 268 10" className="h-2.5 w-full" aria-hidden>
                <rect x="0" y="3" width="268" height="4" fill="currentColor" opacity="0.16" rx="2" />
                <rect ref={barRef} x="0" y="3" width="0.001" height="4" fill="var(--color-marigold)" rx="2"
                      style={{ transition: "width 90ms linear" }} />
              </svg>
              <div className="mt-2.5 flex items-center justify-between">
                <Annotation tone="current" className="text-[var(--color-muted)]">
                  <span ref={dayRef}>DAY 01 / {TOTAL_DAYS}</span>
                </Annotation>
                <Barcode seed="cycle-plate" bars={22} height={16} className="opacity-35" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
