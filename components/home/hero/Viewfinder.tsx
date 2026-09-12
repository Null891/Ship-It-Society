"use client";

import { useImperativeHandle, useRef } from "react";
import { club, schedule } from "@/content/club";
import { ZONE_LABEL, two, wallClock } from "@/lib/schedule";
import { phaseAt } from "@/lib/sequence";
import { useNow } from "@/lib/hooks";
import { HudFrame, StatusDot, TickBar } from "@/components/ui/Hud";
import { CYCLE_DAYS, CYCLE_WEEKS } from "@/components/home/fx/cycle";
import styles from "./hero.module.css";

/* ==========================================================================
   The hero's viewfinder.

   A recording frame laid over the build canvas: corner brackets, four small
   bordered boxes, construction geometry behind, and a status bar along the
   foot. It is an instrument, so every field on it reports something real —

     PHASE    what drawFrame is drawing right now, from lib/sequence phaseAt
     DATE     today, in the club's own time zone
     TARGET   the next hackathon, from content/club schedule
     TYPE     the cycle's length in days, derived from the published format
     CYCLE    which of the format's four weeks the picture has reached
     DAY      the same progress as a day of that cycle, on a tick meter
     CLOCK    the current time in America/Los_Angeles

   Nothing here re-renders while you scroll. HeroSequence owns the one scroll
   subscription on the page and calls paint() from inside its own frame, so
   the overlay costs a handful of DOM writes per frame and no React work at
   all. The clock is the single exception, and it is isolated into its own
   component so its once-a-second render cannot touch anything else.

   The whole layer is aria-hidden: it is marginalia restating facts the page
   states in prose, and a clock that announced itself every second would be
   hostile.
   ========================================================================== */

export type ViewfinderHandle = {
  /** Paint the overlay for sequence progress 0..1. */
  paint(p: number): void;
};

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/* The tick meter's lit and unlit geometry. These mirror TickBar's own
   drawing exactly — it renders one <rect> per tick, lit ones at full height
   from y=0 — because the meter is repainted in place rather than
   re-rendered. If TickBar's shape changes, change these with it. */
const TICK_H = 13;
const LIT_FILL = "var(--color-marigold)";
const DIM_FILL = "var(--stage-line-strong)";

const TONE_COLOR: Record<"muted" | "accent" | "ok", string> = {
  muted: "var(--stage-subtle)",
  accent: "var(--color-marigold)",
  ok: "var(--color-ok)",
};

/** A small chamfered HUD box: mono caption, mono value. */
function Box({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`chamfer-line px-2.5 py-1.5 [--cut:var(--cut-sm)] [--fill:color-mix(in_srgb,var(--color-ink)_82%,transparent)] [--line:var(--stage-line)] ${className}`}
    >
      <span className="mono-label block text-[var(--stage-subtle)]">{label}</span>
      <span className="mono-label mt-1 block text-[var(--stage-fg)]">{children}</span>
    </div>
  );
}

/* --- Stamps ---------------------------------------------------------------
   useNow returns 0 on the server, so both print a shaped placeholder until
   the browser's clock starts. Server and client render the same markup,
   which is what keeps hydration quiet.
   ------------------------------------------------------------------------- */

function DateStamp() {
  const now = useNow();
  if (!now) return <span className="tnum">--- -- ----</span>;
  const w = wallClock(new Date(now));
  return (
    <span className="tnum">
      {w.monthShort.toUpperCase()} {two(w.day)} {w.year}
    </span>
  );
}

function ZoneClock() {
  const now = useNow();
  const w = now ? wallClock(new Date(now)) : null;
  return (
    <span className="tnum">
      {w ? w.time : "--:-- --"} {ZONE_LABEL}
    </span>
  );
}

/* --- The overlay ---------------------------------------------------------- */

export function Viewfinder({
  cue,
  ref,
}: {
  /** The scroll cue's words, from content. Null where there is no scrub to
   *  cue — reduced motion collapses the runway to a single screen. */
  cue: string | null;
  ref?: React.Ref<ViewfinderHandle>;
}) {
  const phaseRef = useRef<HTMLSpanElement>(null);
  const dotWrapRef = useRef<HTMLSpanElement>(null);
  const weekRef = useRef<HTMLSpanElement>(null);
  const cellsRef = useRef<HTMLSpanElement>(null);
  const ticksRef = useRef<HTMLSpanElement>(null);
  const dayRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<SVGGElement>(null);
  const cueRef = useRef<HTMLSpanElement>(null);

  /* Only touch the DOM when a value actually changes. A full scrub moves the
     day through thirty values and the week through four, so the overwhelming
     majority of frames write nothing but the one transform below. */
  const lastDay = useRef(-1);
  const lastWeek = useRef(-1);
  const lastPhase = useRef("");

  useImperativeHandle(ref, () => ({
    paint(p: number) {
      const t = clamp01(p);

      const phase = phaseAt(t);
      if (phase.label !== lastPhase.current) {
        lastPhase.current = phase.label;
        if (phaseRef.current) phaseRef.current.textContent = phase.label;
        const dot = dotWrapRef.current?.firstElementChild as HTMLElement | null;
        if (dot) {
          dot.style.backgroundColor = TONE_COLOR[phase.tone];
          // A settled state stops blinking; a working one keeps reporting.
          dot.classList.toggle("fui-blink", phase.tone !== "ok");
        }
      }

      const day = Math.round(t * CYCLE_DAYS);
      if (day !== lastDay.current) {
        lastDay.current = day;
        if (dayRef.current) dayRef.current.textContent = two(day);
        ticksRef.current?.querySelectorAll("rect").forEach((r, i) => {
          const on = i < day;
          r.setAttribute("y", on ? "0" : String(TICK_H * 0.45));
          r.setAttribute("height", String(on ? TICK_H : TICK_H * 0.55));
          r.setAttribute("fill", on ? LIT_FILL : DIM_FILL);
        });
      }

      const lit = Math.ceil(t * CYCLE_WEEKS.length);
      if (lit !== lastWeek.current) {
        lastWeek.current = lit;
        const week = CYCLE_WEEKS[Math.max(0, lit - 1)];
        if (weekRef.current) {
          weekRef.current.textContent = `${two(Math.max(1, lit))} ${week.title}`;
        }
        const cells = cellsRef.current?.children;
        if (cells) {
          for (let i = 0; i < cells.length; i++) {
            (cells[i] as HTMLElement).style.opacity = i < lit ? "1" : "0.16";
          }
        }
      }

      // The construction geometry opens out as the build proceeds.
      if (ringRef.current) {
        ringRef.current.style.transform = `rotate(${(t * 42).toFixed(2)}deg) scale(${(1 + t * 0.07).toFixed(4)})`;
      }
      if (cueRef.current) {
        cueRef.current.style.opacity = String(1 - clamp01(t / 0.05));
      }
    },
  }));

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-10">
      {/* --- construction geometry -----------------------------------------
          Concentric circles and two long diagonals: the guides a frame is
          composed on. Faint enough to read as ruling, never as ornament. */}
      <svg
        className={`absolute inset-0 h-full w-full text-[var(--stage-fg)] ${styles.fade}`}
        style={{ ["--in" as string]: "380ms" }}
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <g opacity="0.14">
          <path d="M-260 -120 L1260 1180" stroke="currentColor" strokeWidth="1" />
          <path d="M1260 -120 L-260 1180" stroke="currentColor" strokeWidth="1" />
        </g>
        <g ref={ringRef} style={{ transformOrigin: "500px 500px" }} opacity="0.2">
          <circle cx="500" cy="500" r="176" stroke="currentColor" strokeWidth="0.8" />
          <circle cx="500" cy="500" r="302" stroke="currentColor" strokeWidth="0.8" strokeDasharray="2 9" />
          <circle cx="500" cy="500" r="428" stroke="currentColor" strokeWidth="0.8" />
          <circle
            cx="500"
            cy="500"
            r="566"
            stroke="var(--color-marigold)"
            strokeWidth="0.9"
            strokeDasharray="1 16"
          />
        </g>
      </svg>

      {/* the viewfinder's own corner brackets */}
      <div
        className={`absolute inset-3 md:inset-6 xl:inset-8 ${styles.fade}`}
        style={{ ["--in" as string]: "300ms" }}
      >
        <HudFrame className="h-full w-full" size={20} />
      </div>

      <div
        className={`edge relative flex h-full flex-col pb-4 pt-[74px] md:pb-6 md:pt-[100px] ${styles.fade}`}
        style={{ ["--in" as string]: "460ms" }}
      >
        {/* --- top corners ------------------------------------------------ */}
        <div className="flex items-start justify-between gap-3">
          <Box label="Phase" className="min-w-[116px]">
            <span className="flex items-center gap-2">
              <span ref={dotWrapRef} className="flex">
                <StatusDot tone="muted" blink />
              </span>
              <span ref={phaseRef}>{phaseAt(0).label}</span>
            </span>
          </Box>
          <Box label="Date" className="text-right">
            <DateStamp />
          </Box>
        </div>

        {/* Everything that belongs at the foot of the frame. One auto margin,
            not two: flexbox splits free space between every auto margin in a
            line, so a second one would strand this group in the middle. */}
        <div className="mt-auto">
        {/* --- the spec rail ----------------------------------------------
            A strip above the status bar on a phone, where the foot of the
            stage is the only margin there is; a right-hand rail on a
            desktop, where the composition has a proper margin to spare. */}
        <div className="mb-3 flex flex-wrap items-stretch gap-2 md:absolute md:right-10 md:top-1/2 md:mb-0 md:w-[190px] md:-translate-y-1/2 md:flex-col md:gap-2.5 xl:right-14">
          <Box label="Target" className="flex-1 md:flex-none">
            {schedule.nextHackathonName}
          </Box>
          <Box label="Type" className="flex-1 md:flex-none">
            {CYCLE_DAYS}-day cycle
          </Box>
          {/* One cell per week of the published format. */}
          <Box label="Cycle" className="w-full md:w-auto">
            <span className="flex items-center gap-2">
              <span ref={cellsRef} className="flex shrink-0 items-center gap-[3px]">
                {CYCLE_WEEKS.map((w) => (
                  <span
                    key={w.id}
                    className="block h-3 w-[7px] bg-marigold"
                    style={{ opacity: 0.16 }}
                  />
                ))}
              </span>
              <span ref={weekRef} className="truncate">
                {two(1)} {CYCLE_WEEKS[0].title}
              </span>
            </span>
          </Box>
        </div>

        {/* --- the status bar --------------------------------------------- */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--stage-line)] pt-2.5 md:gap-x-5">
          <span className="mono-label order-1 shrink-0 text-[var(--stage-muted)]">
            <ZoneClock />
          </span>
          <span className="mono-label order-2 hidden shrink-0 text-[var(--stage-subtle)] lg:block">
            {club.location}
          </span>
          {cue && (
            <span
              ref={cueRef}
              className="mono-label order-3 ml-auto shrink-0 text-[var(--stage-subtle)] md:order-5 md:ml-0"
            >
              {cue}
            </span>
          )}
          <span className="order-4 flex w-full min-w-0 items-center gap-2.5 md:w-auto md:flex-1">
            <span ref={ticksRef} className="min-w-0 flex-1">
              <TickBar total={CYCLE_DAYS} filled={0} height={TICK_H} />
            </span>
            <span className="mono-label shrink-0 text-[var(--stage-muted)]">
              Day{" "}
              <span ref={dayRef} className="tnum text-[var(--stage-fg)]">
                00
              </span>
              <span className="text-[var(--stage-subtle)]"> / {CYCLE_DAYS}</span>
            </span>
          </span>
          </div>
        </div>
      </div>
    </div>
  );
}
