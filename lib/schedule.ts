/* ==========================================================================
   Schedule — every live date on the site, derived from content/club.ts.

   Pure functions. Each one takes `now` and the data it needs as arguments,
   so the same inputs give the same answer on the server (Calendar, the ICS
   feed), in the browser (Countdown), and in a plain Node test that has no
   `@/` alias. Nothing here reads the clock or imports a runtime value.

   Definitions — decided once, here, and used everywhere:

     Zone      The club meets in Sunnyvale, so every wall-clock time is
               America/Los_Angeles. The UTC offset for a date is looked up
               with Intl, never hardcoded, so the DST change on Nov 1, 2026
               (and every one after it) lands on the right hour.

     Kickoff   A cycle's window OPENS at 00:00 local on its `start` date.
               Midnight rather than the meeting time, because start dates
               are not always meeting days (Hackathon 02 opens Oct 28, a
               week off the meeting cadence), and because the calendar
               prints windows as whole days: day 1 is all of the start date.

     Deadline  23:59 local on the `end` date, read with the entry's own
               explicit offset. That is exactly deadlineOf() in
               content/club.ts; it is restated here only because this module
               must not import runtime values. The schedule test asserts the
               two agree for every entry, and that each offset is the real
               Pacific offset on that date.

     Status    planned  before kickoff
               running  from kickoff (inclusive) to the deadline (exclusive)
               complete from the deadline on

     Days      A window's length is its inclusive count of local dates.

     Meetings  Every `cadenceDays` from the anchor, at the anchor's local
               wall-clock time. A meeting stops being "next" the instant it
               starts; the content has no end time to hold it open longer.
   ========================================================================== */

import type { SeasonEntry } from "@/content/club";

export const ZONE = "America/Los_Angeles";

const DAY_MS = 86_400_000;
const MINUTE_MS = 60_000;

export type CycleStatus = "planned" | "running" | "complete";
export type SeasonState = "before" | "running" | "between" | "after";
export type EventKind = "meeting" | "deadline" | "kickoff";

/** The parts of content's `meeting` this module needs. */
export type MeetingSource = { room: string; nextMeeting: string };

export type ScheduleEvent = {
  kind: EventKind;
  /** Short and factual: "Next meeting", "Hackathon 01 closes". */
  label: string;
  at: Date;
  /** The room, for meetings only. Deadlines and kickoffs are not in a room. */
  location: string | null;
  /** The cycle a deadline or kickoff belongs to. */
  cycle: SeasonEntry | null;
};

const pad = (n: number) => String(n).padStart(2, "0");

/* --- Zone arithmetic ------------------------------------------------------ */

type WallParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
  if (!f) {
    // Numeric fields only. They are read back as numbers, never shown, so
    // ICU's locale punctuation cannot leak into markup.
    f = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    });
    formatters.set(timeZone, f);
  }
  return f;
}

/** The wall-clock fields of an instant in a zone. */
export function zonedParts(at: Date, timeZone = ZONE): WallParts {
  const out: WallParts = { year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0 };
  for (const part of formatter(timeZone).formatToParts(at)) {
    if (part.type in out) out[part.type as keyof WallParts] = Number(part.value);
  }
  // Some engines print midnight as 24 even with h23.
  if (out.hour === 24) out.hour = 0;
  return out;
}

/** Minutes the zone is ahead of UTC at an instant: -420 in PDT, -480 in PST. */
export function zoneOffsetMinutes(at: Date, timeZone = ZONE): number {
  const p = zonedParts(at, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  const whole = Math.floor(at.getTime() / 1000) * 1000;
  return Math.round((asUtc - whole) / MINUTE_MS);
}

function parseDate(date: string): [number, number, number] {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) throw new Error(`schedule: expected YYYY-MM-DD, got "${date}"`);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function parseTime(time: string): [number, number] {
  const m = /^(\d{2}):(\d{2})$/.exec(time);
  if (!m) throw new Error(`schedule: expected HH:MM, got "${time}"`);
  return [Number(m[1]), Number(m[2])];
}

/** Whole days since 1970-01-01 for a calendar date. Zone-free. */
export function dayNumber(date: string): number {
  const [y, mo, d] = parseDate(date);
  return Date.UTC(y, mo - 1, d) / DAY_MS;
}

/** The calendar date `days` after `date` ("2026-12-30" + 3 = "2027-01-02"). */
export function addDays(date: string, days: number): string {
  const t = new Date((dayNumber(date) + days) * DAY_MS);
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/** The local calendar date of an instant, as YYYY-MM-DD. */
export function localDate(at: Date, timeZone = ZONE): string {
  const p = zonedParts(at, timeZone);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/**
 * The instant a wall-clock time happens in a zone, DST-aware.
 *
 * Treat the wall time as if it were UTC, look up the zone's real offset near
 * that guess, correct, and look again: the second look only matters on the
 * two days a year when the offset changes between the guess and the answer.
 * Matches Temporal's "compatible" rule at the edges — a time skipped by the
 * spring-forward gap resolves an hour later, and a time repeated by the
 * fall-back overlap resolves to its first occurrence.
 */
export function localInstant(date: string, time: string, timeZone = ZONE): Date {
  const [y, mo, d] = parseDate(date);
  const [h, mi] = parseTime(time);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const first = guess - zoneOffsetMinutes(new Date(guess), timeZone) * MINUTE_MS;
  const second = guess - zoneOffsetMinutes(new Date(first), timeZone) * MINUTE_MS;
  const p = zonedParts(new Date(second), timeZone);
  return new Date(p.hour === h && p.minute === mi ? second : first);
}

/* --- Meetings ------------------------------------------------------------- */

/**
 * The next meeting strictly after `now`: the anchor's local date stepped by
 * `cadenceDays`, at the anchor's local wall-clock time. 12:15 stays 12:15
 * across the DST change even though the UTC instant moves an hour.
 */
export function nextMeeting(
  now: Date,
  anchorISO: string,
  cadenceDays = 14,
  timeZone = ZONE,
): Date {
  return meetingsFrom(now, anchorISO, 1, cadenceDays, timeZone)[0];
}

/** The next `count` meetings strictly after `now`. */
export function meetingsFrom(
  now: Date,
  anchorISO: string,
  count: number,
  cadenceDays = 14,
  timeZone = ZONE,
): Date[] {
  const anchor = new Date(anchorISO);
  if (Number.isNaN(anchor.getTime())) {
    throw new Error(`schedule: meeting anchor "${anchorISO}" is not a date`);
  }
  if (!(cadenceDays > 0)) throw new Error("schedule: cadence must be positive");

  const anchorDate = localDate(anchor, timeZone);
  const wall = zonedParts(anchor, timeZone);
  const time = `${pad(wall.hour)}:${pad(wall.minute)}`;
  const at = (k: number) => localInstant(addDays(anchorDate, k * cadenceDays), time, timeZone);

  // Jump straight to the right step instead of walking from the anchor,
  // then settle: at most one extra step when today's meeting has started.
  const elapsed = dayNumber(localDate(now, timeZone)) - dayNumber(anchorDate);
  let k = Math.max(0, Math.ceil(elapsed / cadenceDays));
  while (at(k).getTime() <= now.getTime()) k++;

  return Array.from({ length: Math.max(0, count) }, (_, i) => at(k + i));
}

/* --- Cycles --------------------------------------------------------------- */

/** When a cycle's window opens: 00:00 local on its start date. */
export function kickoffAt(entry: SeasonEntry, timeZone = ZONE): Date {
  return localInstant(entry.start, "00:00", timeZone);
}

/** When submissions close: 23:59 on the end date, as deadlineOf() defines it. */
export function deadlineAt(entry: SeasonEntry): Date {
  return new Date(`${entry.end}T23:59:00${entry.utcOffset}`);
}

export function cycleStatus(entry: SeasonEntry, now: Date): CycleStatus {
  const t = now.getTime();
  if (t < kickoffAt(entry).getTime()) return "planned";
  if (t < deadlineAt(entry).getTime()) return "running";
  return "complete";
}

/** Inclusive count of local dates in a window. Sep 23 to Oct 23 is 31. */
export function cycleLength(entry: SeasonEntry): number {
  return dayNumber(entry.end) - dayNumber(entry.start) + 1;
}

/** Which day of its window `now` falls on, clamped to 1..total. */
export function cycleDay(
  entry: SeasonEntry,
  now: Date,
  timeZone = ZONE,
): { day: number; total: number } {
  const total = cycleLength(entry);
  const raw = dayNumber(localDate(now, timeZone)) - dayNumber(entry.start) + 1;
  return { day: Math.min(total, Math.max(1, raw)), total };
}

/** Fraction of the window's time elapsed, kickoff to deadline, 0..1. */
export function cycleProgress(entry: SeasonEntry, now: Date): number {
  const start = kickoffAt(entry).getTime();
  const end = deadlineAt(entry).getTime();
  const p = (now.getTime() - start) / (end - start);
  return p < 0 ? 0 : p > 1 ? 1 : p;
}

/** The season in kickoff order, without mutating the source. */
export function ordered(season: readonly SeasonEntry[]): SeasonEntry[] {
  return [...season].sort((a, b) => dayNumber(a.start) - dayNumber(b.start));
}

export function currentCycle(now: Date, season: readonly SeasonEntry[]): SeasonEntry | null {
  return ordered(season).find((e) => cycleStatus(e, now) === "running") ?? null;
}

export function nextCycle(now: Date, season: readonly SeasonEntry[]): SeasonEntry | null {
  return ordered(season).find((e) => cycleStatus(e, now) === "planned") ?? null;
}

/** The most recent cycle whose deadline has passed. */
export function lastCompleteCycle(
  now: Date,
  season: readonly SeasonEntry[],
): SeasonEntry | null {
  const done = ordered(season).filter((e) => cycleStatus(e, now) === "complete");
  return done.length ? done[done.length - 1] : null;
}

export function seasonState(now: Date, season: readonly SeasonEntry[]): SeasonState {
  if (currentCycle(now, season)) return "running";
  const list = ordered(season);
  if (list.length === 0) return "after";
  if (now.getTime() < kickoffAt(list[0]).getTime()) return "before";
  return nextCycle(now, season) ? "between" : "after";
}

/* --- The one target ------------------------------------------------------- */

/**
 * The most useful thing to count down to: the soonest of the next meeting,
 * the running cycle's deadline, and — when no cycle is running — the next
 * kickoff. A tie goes to the cycle event.
 */
export function nextEvent(
  now: Date,
  season: readonly SeasonEntry[],
  meeting: MeetingSource,
  cadenceDays = 14,
): ScheduleEvent {
  const candidates: ScheduleEvent[] = [];

  const running = currentCycle(now, season);
  if (running) {
    candidates.push({
      kind: "deadline",
      label: `${running.name} closes`,
      at: deadlineAt(running),
      location: null,
      cycle: running,
    });
  } else {
    const next = nextCycle(now, season);
    if (next) {
      candidates.push({
        kind: "kickoff",
        label: `${next.name} kicks off`,
        at: kickoffAt(next),
        location: null,
        cycle: next,
      });
    }
  }

  candidates.push({
    kind: "meeting",
    label: "Next meeting",
    at: nextMeeting(now, meeting.nextMeeting, cadenceDays),
    location: meeting.room || null,
    cycle: null,
  });

  return candidates.reduce((best, c) => (c.at.getTime() < best.at.getTime() ? c : best));
}

/* --- Display -------------------------------------------------------------
   Built from numeric parts and fixed English names rather than
   toLocaleString, whose spacing and punctuation differ between Node's ICU
   and the browser's ("12:15 PM" with a narrow no-break space in one and a
   plain space in the other). Identical strings on both sides means these
   are safe to render during hydration.
   ------------------------------------------------------------------------ */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export type WallClock = {
  year: number;
  month: string;
  monthShort: string;
  day: number;
  weekday: string;
  weekdayShort: string;
  /** "12:15 PM" */
  time: string;
  /** YYYY-MM-DD, local. */
  date: string;
};

/** An instant as the people in the room would read it. */
export function wallClock(at: Date, timeZone = ZONE): WallClock {
  const p = zonedParts(at, timeZone);
  const month = MONTHS[p.month - 1];
  const weekday = WEEKDAYS[new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay()];
  const h12 = p.hour % 12 || 12;
  return {
    year: p.year,
    month,
    monthShort: month.slice(0, 3),
    day: p.day,
    weekday,
    weekdayShort: weekday.slice(0, 3),
    time: `${h12}:${pad(p.minute)} ${p.hour < 12 ? "AM" : "PM"}`,
    date: `${p.year}-${pad(p.month)}-${pad(p.day)}`,
  };
}

/** Whole days, hours, minutes and seconds from `now` until `at`, never negative. */
export function remaining(now: Date, at: Date) {
  const s = Math.max(0, Math.floor((at.getTime() - now.getTime()) / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}
