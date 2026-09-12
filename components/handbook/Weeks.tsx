"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { Eyebrow } from "@/components/ui/Button";
import { Annotation } from "@/components/ui/Poster";
import { RevealLines, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { r3 } from "@/lib/geometry";
import { format } from "@/content/club";
import { sections } from "@/content/handbook";

/* ==========================================================================
   02 — The four weeks, as an exploded stack.

   An isometric drawing built from the format itself: one plate per week,
   exploded up the vertical axis, joined by dashed connectors, with a side
   tag on every plate linked by a thin orthogonal leader. The ticks along
   each plate's front edge are that week's dated steps — a real count, not
   texture.

   The plate for the week you are reading lights marigold. That is written
   imperatively from the scroll MotionValue: the paint function sets a data
   attribute on the plates and the tags and returns, so React does not
   re-render while you scroll and nothing here can drop a frame.

   Everything degrades to the same picture: the server renders all four
   plates with the first one lit, which is also where reduced motion and a
   page with no JavaScript rest. Every week and day is written out in full
   beside the drawing, and the drawing is aria-hidden.
   ========================================================================== */

const weeks = format.weeks;

/* Plate geometry, in viewBox units. A plan square seen from above along the
   isometric axis, flattened a little so four of them stack in a readable
   height: half-width W, half-height H, and D of extruded thickness. */
const W = 80;
const H = 30;
const D = 5;
const CX = 104;
const GAP = 82;
const TOP = 36;
const VB_W = 320;
const VB_H = 324;
/** Where the leader lines stop and the side tags begin. */
const TAG_X = 200;

const centre = (i: number) => TOP + i * GAP;

/** The top face: left, top, right, bottom vertices of the plate. */
function face(cy: number) {
  return `M${CX} ${cy - H}L${CX + W} ${cy}L${CX} ${cy + H}L${CX - W} ${cy}Z`;
}

/** The two visible side faces, giving the plate its thickness. */
function sides(cy: number) {
  const left = `M${CX - W} ${cy}L${CX} ${cy + H}L${CX} ${cy + H + D}L${CX - W} ${cy + D}Z`;
  const right = `M${CX} ${cy + H}L${CX + W} ${cy}L${CX + W} ${cy + D}L${CX} ${cy + H + D}Z`;
  return [left, right];
}

/** One tick per dated step, set along the plate's front-left edge. */
function ticks(cy: number, count: number) {
  const len = Math.hypot(W, H);
  const dx = r3((W / len) * 7);
  const dy = r3((-H / len) * 7);
  return Array.from({ length: count }, (_, i) => {
    const t = (i + 1) / (count + 1);
    const x = r3(CX - W + t * W);
    const y = r3(cy + t * H);
    return `M${x} ${y}l${dx} ${dy}`;
  });
}

const PLATES = weeks.map((week, i) => {
  const cy = centre(i);
  const next = i < weeks.length - 1 ? centre(i + 1) : null;
  return {
    id: week.id,
    face: face(cy),
    sides: sides(cy),
    ticks: ticks(cy, week.days.length),
    leader: `M${CX + W} ${cy}H${TAG_X}`,
    connector: next === null ? null : `M${CX} ${cy + H + D}V${next - H}`,
    /** Vertical position of the side tag, as a share of the drawing. */
    top: `${r3((cy / VB_H) * 100)}%`,
  };
});

const copy = sections.weeks;

export function Weeks() {
  const stackRef = useRef<HTMLDivElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const litRef = useRef(0);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: columnRef,
    offset: ["start 62%", "end 55%"],
  });

  const paint = useCallback((progress: number) => {
    const n = weeks.length;
    const clamped = progress < 0 ? 0 : progress > 1 ? 1 : progress;
    const index = Math.min(n - 1, Math.floor(clamped * n));
    if (litRef.current === index && stackRef.current?.dataset.painted === "1") {
      return;
    }
    litRef.current = index;
    const root = stackRef.current;
    if (!root) return;
    root.dataset.painted = "1";
    root.querySelectorAll<SVGElement | HTMLElement>("[data-week]").forEach((el) => {
      el.dataset.lit = String(Number(el.dataset.week) === index);
    });
    if (countRef.current) {
      countRef.current.textContent = String(index + 1).padStart(2, "0");
    }
  }, []);

  useEffect(() => {
    // Reduced motion rests on the first plate, which is what the server drew.
    paint(reduced ? 0 : scrollYProgress.get());
  }, [paint, reduced, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (reduced) return;
    paint(progress);
  });

  return (
    <section className="pt-28 md:pt-40" aria-labelledby="weeks-title">
      <div className="edge">
        <div className="grid12">
          <div className="col-span-4 md:col-span-7">
            <Eyebrow index={2}>{copy.eyebrow}</Eyebrow>
            <RevealLines
              lines={copy.title}
              id="weeks-title"
              className="optical mt-5 text-3xl font-normal"
            />
            <p className="pretty mt-6 max-w-[46ch] text-base text-[var(--stage-muted)]">
              {copy.intro}
            </p>
          </div>
        </div>

        <div className="grid12 mt-12 items-start md:mt-16">
          {/* The stack. It bleeds past the left edge of the grid — the page's
              deliberate break — and pins while the weeks scroll past it. */}
          <div className="col-span-4 md:sticky md:top-24 md:col-span-5 md:-ml-10 xl:-ml-14">
            <div className="flex items-baseline justify-between gap-4 pl-0 md:pl-10 xl:pl-14">
              <Annotation className="text-[var(--stage-subtle)]">
                {copy.stackLabel}
              </Annotation>
              <span className="mono-label tnum text-[var(--stage-muted)]">
                <span ref={countRef}>01</span>
                <span className="opacity-45">
                  {" / "}
                  {String(weeks.length).padStart(2, "0")}
                </span>
              </span>
            </div>

            <div ref={stackRef} className="relative mt-5">
              <svg
                aria-hidden
                viewBox={`0 0 ${VB_W} ${VB_H}`}
                className="h-auto w-full"
                fill="none"
              >
                {/* Painter's order: the lowest plate first, so a plate above
                    always overlaps the one it sits on. */}
                {PLATES.map((plate, i) => ({ plate, i }))
                  .reverse()
                  .map(({ plate, i }) => (
                    <g
                      key={plate.id}
                      data-week={i}
                      data-lit={i === 0}
                      className="[--pl-fill:var(--color-surface-900)] [--pl-line:var(--stage-line-strong)] [--pl-side:var(--color-ink-soft)] [--pl-tick:var(--stage-line-strong)] data-[lit=true]:[--pl-fill:var(--color-marigold-dim)] data-[lit=true]:[--pl-line:var(--color-marigold)] data-[lit=true]:[--pl-tick:var(--color-marigold)]"
                    >
                      {plate.connector && (
                        <path
                          d={plate.connector}
                          stroke="var(--stage-line)"
                          strokeWidth="1"
                          strokeDasharray="3 4"
                        />
                      )}
                      {plate.sides.map((d) => (
                        <path
                          key={d}
                          d={d}
                          fill="var(--pl-side)"
                          stroke="var(--pl-line)"
                          strokeWidth="1"
                          className="transition-[stroke,fill] duration-[var(--dur-base)] ease-[var(--ease-apple)]"
                        />
                      ))}
                      <path
                        d={plate.face}
                        fill="var(--pl-fill)"
                        stroke="var(--pl-line)"
                        strokeWidth="1"
                        className="transition-[stroke,fill] duration-[var(--dur-base)] ease-[var(--ease-apple)]"
                      />
                      {plate.ticks.map((d) => (
                        <path
                          key={d}
                          d={d}
                          stroke="var(--pl-tick)"
                          strokeWidth="1.5"
                          className="transition-[stroke] duration-[var(--dur-base)] ease-[var(--ease-apple)]"
                        />
                      ))}
                      <path
                        d={plate.leader}
                        stroke="var(--pl-line)"
                        strokeWidth="1"
                        className="transition-[stroke] duration-[var(--dur-base)] ease-[var(--ease-apple)]"
                      />
                      <circle
                        cx={CX + W}
                        cy={centre(i)}
                        r="2.5"
                        fill="var(--pl-line)"
                        className="transition-[fill] duration-[var(--dur-base)] ease-[var(--ease-apple)]"
                      />
                    </g>
                  ))}
              </svg>

              {/* Side tags, anchored to the leader lines. */}
              {weeks.map((week, i) => (
                <div
                  aria-hidden
                  key={week.id}
                  data-week={i}
                  data-lit={i === 0}
                  className="absolute -translate-y-1/2 text-[var(--stage-subtle)] transition-colors duration-[var(--dur-base)] data-[lit=true]:text-marigold"
                  style={{
                    left: `calc(${r3((TAG_X / VB_W) * 100)}% + 6px)`,
                    top: PLATES[i].top,
                  }}
                >
                  <span className="mono-label block">{week.label}</span>
                  <span className="mt-1 block text-sm font-medium tracking-[-0.01em] text-[var(--stage-fg)]">
                    {week.title}
                  </span>
                  <span className="mono-label mt-1 block text-[var(--stage-subtle)]">
                    {week.days.length} steps
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Every week and day, in text. */}
          <div
            ref={columnRef}
            className="col-span-4 mt-12 md:col-span-6 md:col-start-7 md:mt-0"
          >
            {weeks.map((week, i) => (
              <Stagger
                key={week.id}
                className={`rule-t pt-6 ${i === 0 ? "" : "mt-12 md:mt-16"}`}
              >
                <StaggerItem index={0} className="flex items-baseline justify-between gap-4">
                  <span className="mono-label text-marigold">{week.label}</span>
                  <span className="mono-label text-[var(--stage-subtle)]">
                    {week.days.length} steps
                  </span>
                </StaggerItem>
                <StaggerItem index={1}>
                  <h3 className="mt-4 text-2xl font-normal tracking-[-0.028em]">
                    {week.title}
                  </h3>
                  <p className="pretty mt-2 max-w-[44ch] text-base text-[var(--stage-muted)]">
                    {week.summary}
                  </p>
                </StaggerItem>
                <StaggerItem index={2} as="div">
                  <ul className="mt-5">
                    {week.days.map((day) => (
                      <li
                        key={day.day}
                        className="rule-t grid grid-cols-[88px_1fr] gap-x-4 py-2.5 md:grid-cols-[104px_1fr]"
                      >
                        <span className="mono-label pt-1 text-[var(--stage-subtle)]">
                          {day.day}
                        </span>
                        <span className="text-base">{day.title}</span>
                      </li>
                    ))}
                  </ul>
                </StaggerItem>
              </Stagger>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
