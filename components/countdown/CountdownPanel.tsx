"use client";

import { useMemo } from "react";
import { club, hero, meeting, prizes, season, teams } from "@/content/club";
import { Button, Eyebrow } from "@/components/ui/Button";
import { StatusDot, TickBar } from "@/components/ui/Hud";
import { Odometer } from "@/components/ui/Odometer";
import {
  ZONE_LABEL,
  countdownView,
  deadlineAt,
  eventDate,
  eventSentence,
  lastCompleteCycle,
  remaining,
  shortDate,
  two,
  wallClock,
} from "@/lib/schedule";
import { NeedleDial } from "./NeedleDial";
import { TickSpinner } from "./TickSpinner";
import { useScheduleNow } from "./useScheduleNow";

/* ==========================================================================
   The countdown, as a data-transfer panel.

   Every value is derived from content/club.ts through lib/schedule.ts:

     ring      season elapsed, first kickoff to final deadline
     digits    time to the next event — a meeting, the running cycle's
               deadline, or the next kickoff, whichever is soonest
     ticks     days of the cycle in focus (running, else next, else last)
     dial      the same cycle's elapsed time, as a fraction
     event     what is next, when, and the room only when it is a meeting

   Four states, and none of them renders nothing: a meeting is next, a
   cycle's deadline is next, a kickoff is next, or the season is over.

   The view is recomputed once a minute. Every boundary the schedule knows
   (00:00 kickoffs, 23:59 deadlines, 12:15 meetings) falls on a whole
   minute, so a minute-floored instant picks the same event as the exact
   one; only the digits read the clock every second.

   Screen readers get a static sentence and the event list, never the
   digits, so nothing is announced once a second.
   ========================================================================== */

const UNITS = ["Days", "Hrs", "Min", "Sec"] as const;

/**
 * The outline echo: the same digits in per-character boxes matching
 * Odometer's, lifted a fraction of a line so the pair reads as a stacked
 * double number rather than a shadow. Dropped on narrow screens, where a
 * 1px outline at that size turns to noise.
 */
function Echo({ value }: { value: string }) {
  return (
    <span
      aria-hidden
      className="text-outline pointer-events-none absolute left-0 top-[-0.14em] hidden leading-[1em] [--outline:var(--color-marigold)] md:inline-flex"
    >
      {value.split("").map((ch, i) => (
        <span key={i} className="inline-block w-[0.62em] text-center">
          {ch}
        </span>
      ))}
    </span>
  );
}

function BigValue({ value }: { value: string }) {
  return (
    <span className="relative inline-block">
      <Echo value={value} />
      <Odometer value={value} className="relative" />
    </span>
  );
}

function Cell({
  label,
  aside,
  className = "",
  children,
}: {
  label: string;
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`p-5 md:p-7 ${className}`}>
      <div className="flex min-h-6 items-center justify-between gap-4">
        <h3 className="mono-label text-[var(--stage-subtle)]">{label}</h3>
        {aside}
      </div>
      {children}
    </div>
  );
}

export function CountdownPanel({ renderedAt }: { renderedAt: number }) {
  const { now, live } = useScheduleNow(renderedAt);
  const minute = Math.floor(now / 60_000);
  const view = useMemo(() => countdownView(new Date(minute * 60_000), season, meeting), [minute]);
  const { event, focus, focusStatus, state } = view;

  const left = event && live ? remaining(new Date(now), event.at) : null;
  const digits = left
    ? [two(left.days), two(left.hours), two(left.minutes), two(left.seconds)]
    : ["--", "--", "--", "--"];

  const when = event ? wallClock(event.at) : null;
  const previous = lastCompleteCycle(new Date(minute * 60_000), season);
  const seasonPct = Math.round(view.seasonProgress * 100);
  const cyclePct = Math.round(view.cycleProgress * 100);
  // The room never breaks across a line at its hyphen.
  const meetingFacts = (
    <>
      {meeting.cadence}
      {meeting.room && (
        <>
          , in room <span className="whitespace-nowrap">{meeting.room}</span>
        </>
      )}
      . {meeting.time}.
    </>
  );

  /* --- Words for the state ------------------------------------------------ */

  const heading = event ? event.label : "Season complete";

  let lead: React.ReactNode;
  if (!event) {
    lead = `All ${view.cycles} hackathons this season have closed.`;
  } else if (event.kind === "meeting") {
    lead =
      focus && focusStatus === "running" ? (
        <>
          {focus.name} is on day {view.day} of {view.total}. {meetingFacts}
        </>
      ) : (
        meetingFacts
      );
  } else if (event.kind === "deadline") {
    lead = `Day ${view.day} of ${view.total}. ${prizes.rules[1]}`;
  } else {
    const opener = previous
      ? `${previous.name} has closed.`
      : `${event.cycle?.name ?? "The first hackathon"} opens the season.`;
    lead = `${opener} ${teams.summary}`;
  }

  const countdownLabel = !event
    ? "Hackathons closed"
    : event.kind === "meeting"
      ? "Time to next meeting"
      : event.kind === "deadline"
        ? "Time to deadline"
        : "Time to kickoff";

  const summary = event
    ? `${event.label}: ${eventSentence(event.at)} Pacific time${event.location ? `, in room ${event.location}` : ""}.`
    : "";

  /* --- Cycle cell --------------------------------------------------------- */

  const cycleValue =
    focusStatus === "running"
      ? `Day ${two(view.day)} of ${view.total}`
      : focusStatus === "complete"
        ? `Day ${view.total} of ${view.total}`
        : `Not started · ${view.total} days`;

  const status =
    focusStatus === "running"
      ? { tone: "ok" as const, blink: true, text: `${focus?.name} · Running` }
      : focusStatus === "planned"
        ? { tone: "accent" as const, blink: false, text: `${focus?.name} · Opens ${focus ? shortDate(focus.start) : ""}` }
        : { tone: "muted" as const, blink: false, text: "Season complete" };

  const lastCycle = state === "after" ? focus : null;

  return (
    <section className="pt-28 md:pt-40" aria-labelledby="countdown-title">
      <div className="edge">
        <div className="grid12">
          <div className="col-span-4 md:col-span-7">
            <Eyebrow index={7}>Schedule</Eyebrow>
            <h2 id="countdown-title" className="optical mt-5 text-3xl font-normal">
              {heading}
            </h2>
            <p className="pretty mt-5 max-w-[48ch] text-lg text-[var(--stage-muted)]">{lead}</p>
          </div>
        </div>

        <div data-reveal="" className="mt-10 md:mt-14">
          <div className="chamfer-line [--fill:var(--color-surface-900)] [--line:var(--stage-line-strong)]">
            {/* Title bar */}
            <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-[var(--stage-line)] px-5 py-3.5 md:px-7">
              <p className="mono-label flex items-center gap-2.5 text-[var(--stage-fg)]">
                <StatusDot tone={status.tone} blink={status.blink} />
                {status.text}
              </p>
              <p className="mono-label flex gap-5 text-[var(--stage-subtle)]">
                {focus && (
                  <span className="tnum">
                    Cycle {two(view.focusIndex)} / {two(view.cycles)}
                  </span>
                )}
                <span>Times in {ZONE_LABEL}</span>
              </p>
            </div>

            <div className="grid md:grid-cols-12">
              {/* Season ring */}
              <Cell
                label="Season elapsed"
                className="border-b border-[var(--stage-line)] md:col-span-4 md:border-r lg:col-span-3"
              >
                <div className="mt-5 flex items-center gap-6 md:block">
                  <TickSpinner progress={view.seasonProgress} className="w-28 shrink-0 md:mx-auto md:w-full md:max-w-[176px]">
                    <span className="tnum font-mono text-xl font-light leading-none text-[var(--stage-fg)]">
                      {seasonPct}%
                    </span>
                  </TickSpinner>
                  <p className="mono-label text-[var(--stage-muted)] md:mt-5 md:text-center">
                    <span className="tnum">{view.complete}</span> of{" "}
                    <span className="tnum">{view.cycles}</span> closed
                  </p>
                </div>
              </Cell>

              {/* The clock */}
              <Cell
                label={countdownLabel}
                className="border-b border-[var(--stage-line)] md:col-span-8 lg:col-span-9"
              >
                {event ? (
                  <>
                    <dl aria-hidden className="mt-6 flex flex-wrap gap-y-4 md:mt-8">
                      {UNITS.map((unit, i) => (
                        <div
                          key={unit}
                          className={
                            i === 0
                              ? "pr-3 sm:pr-5 lg:pr-7"
                              : "border-l border-[var(--stage-line)] px-3 sm:px-5 lg:px-7"
                          }
                        >
                          <dt className="mono-label text-[var(--stage-subtle)]">{unit}</dt>
                          <dd className="tnum mt-3 font-mono text-5xl font-light tracking-normal text-[var(--stage-fg)] md:mt-6">
                            <BigValue value={digits[i]} />
                          </dd>
                        </div>
                      ))}
                    </dl>
                    <p className="sr-only">{summary}</p>
                  </>
                ) : (
                  <dl className="mt-6 md:mt-8">
                    <dt className="sr-only">Hackathons closed this season</dt>
                    <dd className="tnum font-mono text-5xl font-light tracking-normal text-[var(--stage-fg)] md:mt-10">
                      <BigValue value={`${two(view.complete)}/${two(view.cycles)}`} />
                    </dd>
                  </dl>
                )}
              </Cell>

              {/* Cycle progress */}
              <Cell
                label="Cycle progress"
                aside={
                  <span className="flex items-center gap-2.5">
                    <NeedleDial value={view.cycleProgress} className="h-7 w-12" />
                    <span className="mono-label tnum text-[var(--stage-muted)]">{cyclePct}%</span>
                  </span>
                }
                className="border-b border-[var(--stage-line)] md:col-span-6 md:border-r"
              >
                <p className="tnum mt-4 flex flex-wrap items-baseline gap-x-3 text-xl font-normal text-[var(--stage-fg)]">
                  {focus && <span className="whitespace-nowrap text-[var(--stage-muted)]">{focus.name}</span>}
                  <span className="whitespace-nowrap">{cycleValue}</span>
                </p>
                <TickBar total={view.total || 1} filled={view.day} height={20} className="mt-5" />
                {focus && (
                  <p className="mono-label mt-3 flex justify-between gap-4 text-[var(--stage-subtle)]">
                    <span>
                      {focusStatus === "planned" ? "Opens" : "Opened"} {shortDate(focus.start)}
                    </span>
                    <span>
                      {focusStatus === "complete" ? "Closed" : "Closes"} {shortDate(focus.end)}
                    </span>
                  </p>
                )}
              </Cell>

              {/* What is next */}
              <Cell
                label={event ? "Next event" : "Last deadline"}
                className="border-b border-[var(--stage-line)] md:col-span-6"
              >
                <dl className="mt-4 grid grid-cols-[5.5rem_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-base">
                  {event && when ? (
                    <>
                      <dt className="mono-label pt-[0.3em] text-[var(--stage-subtle)]">Event</dt>
                      <dd className="text-[var(--stage-fg)]">{event.label}</dd>
                      <dt className="mono-label pt-[0.3em] text-[var(--stage-subtle)]">Date</dt>
                      <dd className="tnum text-[var(--stage-fg)]">{eventDate(event.at)}</dd>
                      <dt className="mono-label pt-[0.3em] text-[var(--stage-subtle)]">Time</dt>
                      <dd className="tnum text-[var(--stage-fg)]">
                        {when.time} {ZONE_LABEL}
                      </dd>
                      {event.kind === "meeting" && event.location && (
                        <>
                          <dt className="mono-label pt-[0.3em] text-[var(--stage-subtle)]">Room</dt>
                          <dd className="tnum text-[var(--stage-fg)]">{event.location}</dd>
                        </>
                      )}
                    </>
                  ) : lastCycle ? (
                    <>
                      <dt className="mono-label pt-[0.3em] text-[var(--stage-subtle)]">Cycle</dt>
                      <dd className="text-[var(--stage-fg)]">{lastCycle.name}</dd>
                      <dt className="mono-label pt-[0.3em] text-[var(--stage-subtle)]">Date</dt>
                      <dd className="tnum text-[var(--stage-fg)]">{eventDate(deadlineAt(lastCycle))}</dd>
                      <dt className="mono-label pt-[0.3em] text-[var(--stage-subtle)]">Time</dt>
                      <dd className="tnum text-[var(--stage-fg)]">
                        {wallClock(deadlineAt(lastCycle)).time} {ZONE_LABEL}
                      </dd>
                    </>
                  ) : null}
                </dl>
              </Cell>

              {/* Actions */}
              <div className="flex flex-col gap-3 p-5 sm:flex-row sm:flex-wrap sm:items-center md:col-span-12 md:px-7">
                <Button href={hero.primaryCta.href} size="lg" arrow>
                  {hero.primaryCta.label}
                </Button>
                {event ? (
                  <Button href="/calendar.ics" variant="ghost" size="lg">
                    Add to calendar
                  </Button>
                ) : (
                  club.discord && (
                    <Button href={club.discord} variant="ghost" size="lg">
                      Join the Discord
                    </Button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
