import { HudFrame, StatusDot, Tag } from "@/components/ui/Hud";
import { Barcode } from "@/components/ui/Poster";
import { season, short } from "@/content/club";
import {
  cycleDay,
  cycleStatus,
  currentCycle,
  nextCycle,
  seasonState,
} from "@/lib/schedule";

/* ==========================================================================
   What the archive is waiting on.

   An empty archive is honest — the first cycle has not finished — but it
   should read as a status board, not an apology. Every value here comes from
   the season in content, computed when the page renders (the root layout
   revalidates every six hours), so it stays true as the season moves: before
   the first kickoff, during a cycle, between cycles, and after the last one.
   ========================================================================== */

export function CycleStatusPanel() {
  const now = new Date();
  const state = seasonState(now, season);
  const entry = currentCycle(now, season) ?? nextCycle(now, season) ?? season.at(-1);
  if (!entry) return null;

  const { day, total } = cycleDay(entry, now);
  const status = cycleStatus(entry, now);
  const label =
    status === "running" ? "Running" : status === "planned" ? "Next up" : "Complete";

  return (
    <HudFrame size={10} className="chamfer-line [--cut:12px] p-5">
      <div className="flex items-baseline justify-between gap-3">
        <span className="mono-label text-[var(--stage-subtle)]">Cycle status</span>
        <Tag tone={status === "running" ? "solid" : "line"}>{label}</Tag>
      </div>

      <p className="mt-4 text-lg font-normal">{entry.name}</p>
      <p className="mono-label mt-1.5 text-[var(--stage-muted)]">
        {short(entry.start)} – {short(entry.end)}
      </p>

      {/* One mark per day of the cycle. */}
      <div aria-hidden className="mt-5 flex flex-wrap gap-[3px]">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 ${
              i + 1 === day && status === "running"
                ? "bg-marigold"
                : i < day
                  ? "bg-[var(--stage-line-strong)]"
                  : "bg-[var(--stage-line)]"
            }`}
          />
        ))}
      </div>

      <dl className="mt-5 border-t border-[var(--stage-line)] pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="mono-label text-[var(--stage-subtle)]">Day</dt>
          <dd className="mono-label tnum text-[var(--stage-fg)]">
            {String(day).padStart(2, "0")} / {total}
          </dd>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-3">
          <dt className="mono-label text-[var(--stage-subtle)]">Entries</dt>
          <dd className="mono-label tnum text-[var(--stage-fg)]">
            {state === "after" ? "Season closed" : `After ${short(entry.end)}`}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-[var(--stage-line)] pt-4">
        <span className="mono-label inline-flex items-center gap-2 text-[var(--stage-muted)]">
          <StatusDot tone={status === "running" ? "ok" : "muted"} blink={status === "running"} />
          {status === "running" ? "In progress" : "Standing by"}
        </span>
        <Barcode seed={entry.name} bars={10} height={12} className="opacity-40" />
      </div>
    </HudFrame>
  );
}
