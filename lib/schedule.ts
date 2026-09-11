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

     Deadline  23:59 local on the `end` date, resolved through the zone like
               every other wall time. content/club.ts also carries a written
               offset for each entry (deadlineOf); the schedule test asserts
               the two agree, which catches a hand-typed -07:00 in winter.

     Status    planned  before kickoff
               running  from kickoff (inclusive) to the deadline (exclusive)
               complete from the deadline on

     Days      A window's length is its inclusive count of local dates.
               Day 1 is the start date; the last day is the end date.

     Meetings  Every `cadenceDays` from the anchor, at the anchor's local
               wall-clock time. A meeting stops being "next" the instant it
               starts; the content has no end time to hold it open longer.
               Dates listed in `skip` are stepped over without moving the
               cadence. Meetings are only projected up to the season's final
               deadline: past that point the content file has nothing to say,
               and a stale file should go quiet rather than invent a date.
   ========================================================================== */

import type { SeasonEntry } from "@/content/club";

export const ZONE = "America/Los_Angeles";
/** How the zone is printed beside a time. */
export const ZONE_LABEL = "PT";
/** "Every other week", in days. The anchor is content's meeting.nextMeeting. */
export const MEETING_CADENCE_DAYS = 14;

const DAY_MS = 86_400_000;
const MINUTE_MS = 60_000;

export type CycleStatus = "planned" | "running" | "complete";
export type SeasonState = "before" | "running" | "between" | "after";
export type EventKind = "meeting" | "deadline" | "kickoff";

/** The parts of content's `meeting` this module needs. */
export type MeetingSource = {
  room: string;
  nextMeeting: string;
  /** Local dates (YYYY-MM-DD) on the cadence when the club does not meet. */
  skip?: readonly string[];
};

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
 * Read the wall time as if it were UTC (the "guess"); the real instant is
 * within a day of it. Sample the zone's offset a day either side — the two
 * only differ when a DST change is near — and keep whichever offset gives
 * back the same wall time. The edges follow Temporal's "compatible" rule:
 * a time repeated by the fall-back overlap resolves to its first
 * occurrence, and a time skipped by the spring-forward gap resolves to the
 * same distance past the gap (02:30 becomes 03:30).
 */
export function localInstant(date: string, time: string, timeZone = ZONE): Date {
  const [y, mo, d] = parseDate(date);
  const [h, mi] = parseTime(time);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const before = zoneOffsetMinutes(new Date(guess - DAY_MS), timeZone);
  const after = zoneOffsetMinutes(new Date(guess + DAY_MS), timeZone);

  const fits = (offset: number): number | null => {
    const t = guess - offset * MINUTE_MS;
    const p = zonedParts(new Date(t), timeZone);
    return p.year === y && p.month === mo && p.day === d && p.hour === h && p.minute === mi
      ? t
      : null;
  };

  const a = fits(before);
  const b = after === before ? a : fits(after);
  if (a !== null && b !== null) return new Date(Math.min(a, b));
  if (a !== null) return new Date(a);
  if (b !== null) return new Date(b);
  return new Date(guess - before * MINUTE_MS);
}

/* --- Meetings ------------------------------------------------------------- */

export type MeetingOptions = {
  /** Local dates on the cadence when there is no meeting. */
  skip?: readonly string[];
  /** Project no meeting later than this instant. */
  until?: Date | null;
  timeZone?: string;
};

/**
 * The next `count` meetings strictly after `now`: the anchor's local date
 * stepped by `cadenceDays`, at the anchor's local wall-clock time. 12:15
 * stays 12:15 across the DST change even though the UTC instant moves an
 * hour. May return fewer than `count` when `until` cuts the run short.
 */
export function meetingsFrom(
  now: Date,
  anchorISO: string,
  count: number,
  cadenceDays = MEETING_CADENCE_DAYS,
  options: MeetingOptions = {},
): Date[] {
  const anchor = new Date(anchorISO);
  if (Number.isNaN(anchor.getTime())) {
    throw new Error(`schedule: meeting anchor "${anchorISO}" is not a date`);
  }
  if (!(cadenceDays > 0)) throw new Error("schedule: cadence must be positive");

  const timeZone = options.timeZone ?? ZONE;
  const skip = new Set(options.skip ?? []);
  const until = options.until?.getTime() ?? Infinity;
  const anchorDate = localDate(anchor, timeZone);
  const wall = zonedParts(anchor, timeZone);
  const time = `${pad(wall.hour)}:${pad(wall.minute)}`;

  // Jump straight to the first step on or after today instead of walking
  // from the anchor. Steps before the anchor never exist.
  const elapsed = dayNumber(localDate(now, timeZone)) - dayNumber(anchorDate);
  let k = Math.max(0, Math.ceil(elapsed / cadenceDays));

  const out: Date[] = [];
  const want = Math.max(0, count);
  // Bounded: skipped dates are rare, so this never needs more than a few
  // extra steps. The cap only exists so a bad skip list cannot spin.
  for (let guard = 0; out.length < want && guard < want + 366; guard++, k++) {
    const date = addDays(anchorDate, k * cadenceDays);
    if (skip.has(date)) continue;
    const at = localInstant(date, time, timeZone);
    if (at.getTime() <= now.getTime()) continue;
    if (at.getTime() > until) break;
    out.push(at);
  }
  return out;
}

/** The next meeting strictly after `now`, or null if `until` has passed. */
export function nextMeeting(
  now: Date,
  anchorISO: string,
  cadenceDays = MEETING_CADENCE_DAYS,
  options: MeetingOptions = {},
): Date | null {
  return meetingsFrom(now, anchorISO, 1, cadenceDays, options)[0] ?? null;
}

/* --- Cycles --------------------------------------------------------------- */

/** When a cycle's window opens: 00:00 local on its start date. */
export function kickoffAt(entry: SeasonEntry, timeZone = ZONE): Date {
  return localInstant(entry.start, "00:00", timeZone);
}

/** When submissions close: 23:59 local on the end date. */
export function deadlineAt(entry: SeasonEntry, timeZone = ZONE): Date {
  return localInstant(entry.end, "23:59", timeZone);
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

/**
 * Which day of its window `now` falls on. 0 before kickoff, `total` once
 * complete, so a caller can print it for any status without lying.
 */
export function cycleDay(
  entry: SeasonEntry,
  now: Date,
  timeZone = ZONE,
): { day: number; total: number } {
  const total = cycleLength(entry);
  const status = cycleStatus(entry, now);
  if (status === "planned") return { day: 0, total };
  if (status === "complete") return { day: total, total };
  const raw = dayNumber(localDate(now, timeZone)) - dayNumber(entry.start) + 1;
  return { day: Math.min(total, Math.max(1, raw)), total };
}

const clamp01 = (p: number) => (p < 0 ? 0 : p > 1 ? 1 : p);

/** Fraction of the window's time elapsed, kickoff to deadline, 0..1. */
export function cycleProgress(entry: SeasonEntry, now: Date): number {
  const start = kickoffAt(entry).getTime();
  const end = deadlineAt(entry).getTime();
  return clamp01((now.getTime() - start) / (end - start));
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

/** The first kickoff and the final deadline, or null for an empty season. */
export function seasonBounds(
  season: readonly SeasonEntry[],
): { start: Date; end: Date } | null {
  const list = ordered(season);
  if (!list.length) return null;
  const end = list.reduce(
    (latest, e) => Math.max(latest, deadlineAt(e).getTime()),
    -Infinity,
  );
  return { start: kickoffAt(list[0]), end: new Date(end) };
}

/** Fraction of the season elapsed, first kickoff to final deadline, 0..1. */
export function seasonProgress(now: Date, season: readonly SeasonEntry[]): number {
  const b = seasonBounds(season);
  if (!b) return 1;
  return clamp01((now.getTime() - b.start.getTime()) / (b.end.getTime() - b.start.getTime()));
}

/* --- The one target ------------------------------------------------------- */

/**
 * The most useful thing to count down to: the soonest of the next meeting,
 * the running cycle's deadline, and — when no cycle is running — the next
 * kickoff. A tie goes to the cycle event. Null once the season is over:
 * there is nothing true left to count down to.
 */
export function nextEvent(
  now: Date,
  season: readonly SeasonEntry[],
  meeting: MeetingSource,
  cadenceDays = MEETING_CADENCE_DAYS,
): ScheduleEvent | null {
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

  const bounds = seasonBounds(season);
  if (bounds && meeting.nextMeeting) {
    const at = nextMeeting(now, meeting.nextMeeting, cadenceDays, {
      skip: meeting.skip,
      until: bounds.end,
    });
    if (at) {
      candidates.push({
        kind: "meeting",
        label: "Next meeting",
        at,
        location: meeting.room || null,
        cycle: null,
      });
    }
  }

  if (!candidates.length) return null;
  return candidates.reduce((best, c) => (c.at.getTime() < best.at.getTime() ? c : best));
}

/* --- View models -----------------------------------------------------------
   What the Countdown and the Calendar print, computed once here so the two
   surfaces cannot disagree about which cycle is "current" or "next".
   ------------------------------------------------------------------------ */

export type CountdownView = {
  state: SeasonState;
  /** Null only when the season is over. */
  event: ScheduleEvent | null;
  /** The cycle the progress readouts describe: running, else next, else last. */
  focus: SeasonEntry | null;
  focusStatus: CycleStatus | null;
  /** 1-based position of `focus` in the season. */
  focusIndex: number;
  cycles: number;
  day: number;
  total: number;
  /** Time elapsed in the focus cycle, 0..1. */
  cycleProgress: number;
  /** Time elapsed in the season, 0..1. */
  seasonProgress: number;
  /** Cycles whose deadline has passed. */
  complete: number;
};

export function countdownView(
  now: Date,
  season: readonly SeasonEntry[],
  meeting: MeetingSource,
  cadenceDays = MEETING_CADENCE_DAYS,
): CountdownView {
  const list = ordered(season);
  const focus =
    currentCycle(now, list) ?? nextCycle(now, list) ?? lastCompleteCycle(now, list);
  const { day, total } = focus ? cycleDay(focus, now) : { day: 0, total: 0 };
  return {
    state: seasonState(now, list),
    event: nextEvent(now, list, meeting, cadenceDays),
    focus,
    focusStatus: focus ? cycleStatus(focus, now) : null,
    focusIndex: focus ? list.indexOf(focus) + 1 : 0,
    cycles: list.length,
    day,
    total,
    cycleProgress: focus ? cycleProgress(focus, now) : 0,
    seasonProgress: seasonProgress(now, list),
    complete: list.filter((e) => cycleStatus(e, now) === "complete").length,
  };
}

export type CalendarRow = {
  entry: SeasonEntry;
  /** 1-based position in the season. */
  index: number;
  status: CycleStatus;
  /** The soonest planned cycle. Exactly one row, or none once all have opened. */
  next: boolean;
  kickoff: Date;
  deadline: Date;
  day: number;
  total: number;
  progress: number;
};

export function calendarRows(now: Date, season: readonly SeasonEntry[]): CalendarRow[] {
  const list = ordered(season);
  const upcoming = nextCycle(now, list);
  return list.map((entry, i) => {
    const { day, total } = cycleDay(entry, now);
    return {
      entry,
      index: i + 1,
      status: cycleStatus(entry, now),
      next: entry === upcoming,
      kickoff: kickoffAt(entry),
      deadline: deadlineAt(entry),
      day,
      total,
      progress: cycleProgress(entry, now),
    };
  });
}

/**
 * One cycle drawn as one lunar month: new at kickoff, full at mid-cycle, new
 * again on the last day. Returns the phase angle as a fraction, 0..1.
 */
export function moonPhase(day: number, total: number): number {
  if (total <= 1) return 0;
  return clamp01((day - 1) / (total - 1));
}

/** Lit fraction of the disc for a phase, 0 (new) to 1 (full). */
export function illumination(phase: number): number {
  return (1 - Math.cos(phase * 2 * Math.PI)) / 2;
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

/** A calendar date as "Sep 23". Zone-free: the date is already local. */
export function shortDate(date: string): string {
  const [, mo, d] = parseDate(date);
  return `${MONTHS[mo - 1].slice(0, 3)} ${d}`;
}

/** A calendar date as "Wed, Sep 23". */
export function weekdayDate(date: string): string {
  const [y, mo, d] = parseDate(date);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()];
  return `${weekday.slice(0, 3)}, ${MONTHS[mo - 1].slice(0, 3)} ${d}`;
}

/** A window as "Sep 23 – Oct 23". */
export function windowLabel(entry: SeasonEntry): string {
  return `${shortDate(entry.start)} – ${shortDate(entry.end)}`;
}

/** Two digits for a readout: 7 -> "07". Larger numbers are left whole. */
export const two = pad;

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
