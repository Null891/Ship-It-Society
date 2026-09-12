"use client";

import { memo, useMemo } from "react";
import { deadlineOf, season } from "@/content/club";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Hud";
import {
  ZONE_LABEL,
  calendarRows,
  seasonState,
  two,
  wallClock,
  weekdayDate,
  type CalendarRow,
} from "@/lib/schedule";
import { r3 } from "@/lib/geometry";
import { useScheduleNow } from "@/components/countdown/useScheduleNow";
import { Moon } from "./Moon";

/* ==========================================================================
   The season calendar: one row per hackathon, and the cycle as a moon.

   Status comes from the date, never from a row's position: planned before
   kickoff, running until the deadline, complete after it. The soonest
   planned cycle is "next". The row in focus — the running cycle, or the
   next one when none is running — sits on the panel step, so the calendar
   and the home countdown always agree about which cycle matters now.

   Rendered for the server's instant first (see useScheduleNow), then for
   the visitor's clock, re-derived once a minute. Every status boundary is a
   whole minute, so nothing flips late.

   Reveal safety: RevealRoot adds `.is-in` to [data-reveal] elements by
   hand. React would strip it if a re-render changed that element's class,
   so every [data-reveal] element here has a constant className and the
   classes that follow the status live one level down.
   ========================================================================== */

const STATUS: Record<
  "running" | "next" | "planned" | "complete",
  { label: string; tone: "solid" | "accent" | "line"; dim?: boolean }
> = {
  running: { label: "Running", tone: "solid" },
  next: { label: "Next", tone: "accent" },
  planned: { label: "Planned", tone: "line" },
  complete: { label: "Complete", tone: "line", dim: true },
};

function Crosshair({ active }: { active: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={`h-4 w-4 ${active ? "text-marigold" : "text-[var(--stage-line-strong)]"}`}
      fill="none"
    >
      <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1" />
      <path d="M8 0v5M8 11v5M0 8h5M11 8h5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/* The clock ticks every second but the rows change at most once a minute:
   `rows` is memoised on the minute, so memoised children skip the rest. */
const StaticMoon = memo(Moon);

const Row = memo(function Row({ row, focus }: { row: CalendarRow; focus: boolean }) {
  const key = row.status === "planned" ? (row.next ? "next" : "planned") : row.status;
  const s = STATUS[key];
  const done = row.status === "complete";
  const close = wallClock(row.deadline);
  const fg = done ? "text-[var(--stage-subtle)]" : "text-[var(--stage-fg)]";
  const sub = done ? "text-[var(--stage-subtle)]" : "text-[var(--stage-muted)]";

  return (
    <div
      className={`grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-start gap-x-4 gap-y-3 px-4 py-5 transition-colors duration-[var(--dur-fast)] ease-[var(--ease-apple)] md:grid-cols-[3rem_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_6.5rem_1rem] md:items-center md:px-5 ${
        focus ? "chamfer bg-[var(--color-surface-800)]" : "hover:bg-[var(--color-surface-900)]"
      }`}
    >
      <span className={`mono-label tnum pt-1.5 md:pt-0 ${focus ? "text-marigold" : "text-[var(--stage-subtle)]"}`}>
        {two(row.index)}
      </span>

      <h3 className={`text-lg font-medium ${fg}`}>{row.entry.name}</h3>

      {/* Below md the labels form their own column; from md up the table
          header names the columns and the labels stay for screen readers. */}
      <p className="col-span-2 col-start-2 row-start-2 grid grid-cols-[4rem_minmax(0,1fr)] items-baseline font-mono text-sm md:col-span-1 md:col-start-3 md:row-start-1 md:block">
        <span className="mono-label text-[var(--stage-subtle)] md:sr-only">Opens</span>
        <time dateTime={row.entry.start} className={`tnum ${fg}`}>
          {weekdayDate(row.entry.start)}
        </time>
      </p>

      <p className="col-span-2 col-start-2 row-start-3 grid grid-cols-[4rem_minmax(0,1fr)] items-baseline font-mono text-sm md:col-span-1 md:col-start-4 md:row-start-1 md:block">
        <span className="mono-label text-[var(--stage-subtle)] md:sr-only">Closes</span>
        <time dateTime={deadlineOf(row.entry)} className="tnum">
          <span className={`block ${fg}`}>{weekdayDate(row.entry.end)}</span>
          <span className={`block ${sub}`}>
            {close.time} {ZONE_LABEL}
          </span>
        </time>
      </p>

      <span className="col-start-3 row-start-1 justify-self-end md:col-start-5 md:justify-self-start">
        <Tag
          tone={s.tone}
          className={s.dim ? "border-[var(--stage-line)]! text-[var(--stage-subtle)]!" : ""}
        >
          {s.label}
        </Tag>
      </span>

      <span className="hidden md:col-start-6 md:row-start-1 md:block">
        <Crosshair active={focus} />
      </span>

      {row.status === "running" && (
        <div className="col-span-2 col-start-2 flex items-center gap-4 md:col-span-4 md:col-start-2">
          <div className="relative h-[3px] flex-1 bg-[var(--stage-line-strong)]">
            <div
              className="absolute inset-0 origin-left bg-marigold"
              style={{ transform: `scaleX(${r3(row.day / row.total)})` }}
            />
          </div>
          <span className="mono-label tnum text-[var(--stage-fg)]">
            Day {two(row.day)} / {row.total}
          </span>
        </div>
      )}
    </div>
  );
});

export function CalendarBoard({
  renderedAt,
  className = "",
}: {
  renderedAt: number;
  className?: string;
}) {
  const { now } = useScheduleNow(renderedAt);
  const minute = Math.floor(now / 60_000);

  const { rows, state } = useMemo(() => {
    const at = new Date(minute * 60_000);
    return { rows: calendarRows(at, season), state: seasonState(at, season) };
  }, [minute]);

  const focus =
    rows.find((r) => r.status === "running") ??
    rows.find((r) => r.next) ??
    [...rows].reverse().find((r) => r.status === "complete") ??
    null;
  const highlighted = focus && focus.status !== "complete" ? focus : null;
  const complete = rows.filter((r) => r.status === "complete").length;

  return (
    <div className={`grid12 gap-y-10 ${className}`}>
      <div className="col-span-4 md:col-span-12 lg:col-span-8">
        <div
          aria-hidden
          className="mono-label hidden grid-cols-[3rem_minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1fr)_6.5rem_1rem] gap-x-4 px-5 pb-3 text-[var(--stage-subtle)] md:grid"
        >
          <span>#</span>
          <span>Hackathon</span>
          <span>Opens</span>
          <span>Closes</span>
          <span>Status</span>
          <span />
        </div>

        <ol className="rule-b">
          {rows.map((row, i) => (
            <li
              key={row.entry.name}
              data-reveal=""
              className="rule-t"
              style={{ "--reveal-i": i } as React.CSSProperties}
            >
              <Row row={row} focus={row === highlighted} />
            </li>
          ))}
        </ol>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 md:px-5">
          <Button href="/calendar.ics" variant="quiet" arrow>
            Download calendar (.ics)
          </Button>
          <p className="mono-label text-[var(--stage-subtle)]">
            Hackathons and meetings · Times in {ZONE_LABEL}
          </p>
        </div>
      </div>

      <StaticMoon
        cycle={focus?.entry ?? null}
        status={focus?.status ?? null}
        day={focus?.day ?? 0}
        total={focus?.total ?? 0}
        state={state}
        complete={complete}
        cycles={rows.length}
        className="col-span-4 md:col-span-7 lg:col-span-4 lg:col-start-9"
      />
    </div>
  );
}
