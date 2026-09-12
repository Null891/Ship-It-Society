import { format } from "@/content/club";

/* ==========================================================================
   Cycle facts, derived.

   The home page needs the cycle's length in days and each week's day span in
   several places (the plate, the week gauges, the hero's TYPE readout). None
   of them may retype "30": the format in content/club.ts already states the
   day ranges, so the numbers are read back out of it here and everything
   downstream follows a single edit to that file.

   Day labels are written "Day 1", "Day 6-7", "Day 22-24". Only the `day`
   field is parsed, so prose elsewhere in the entry cannot affect the result.
   ========================================================================== */

const numbersIn = (label: string) => (label.match(/\d+/g) ?? []).map(Number);

export type CycleWeek = {
  id: string;
  label: string;
  title: string;
  summary: string;
  days: readonly { day: string; title: string; body: string }[];
  /** First and last day of the cycle this week covers. */
  from: number;
  to: number;
  /** How many days that span is. */
  span: number;
};

export const CYCLE_WEEKS: CycleWeek[] = format.weeks.map((week) => {
  const all = week.days.flatMap((d) => numbersIn(d.day));
  const from = Math.min(...all);
  const to = Math.max(...all);
  return {
    id: week.id,
    label: week.label,
    title: week.title,
    summary: week.summary,
    days: week.days,
    from,
    to,
    span: to - from + 1,
  };
});

/** The cycle's length in days: the last day the published format names. */
export const CYCLE_DAYS = Math.max(...CYCLE_WEEKS.map((w) => w.to));

/** How many weeks a cycle runs. */
export const CYCLE_WEEK_COUNT = CYCLE_WEEKS.length;

/** "Scope · Build · Harden · Ship" — the four week titles, in order. */
export const CYCLE_WEEK_TITLES = CYCLE_WEEKS.map((w) => w.title);

/** Every day entry in the cycle, flattened, in order. */
export const CYCLE_DAY_COUNT = CYCLE_WEEKS.reduce((n, w) => n + w.days.length, 0);
