import {
  club,
  format,
  hero,
  join,
  meeting,
  meetingLine,
  prizes,
  security,
  teams,
} from "./club";
import { sponsors } from "./sponsors";

/* ==========================================================================
   The handbook — how one cycle actually runs.

   This file holds the page's own framing copy and nothing else. Every fact
   on /handbook is derived from content/club.ts and content/sponsors.ts:
   the stages are real days out of `format.weeks`, the spec rows are read
   off those same days, the rubric is `prizes.criteria`, the checklist is
   `security.checks`, and the tooling is looked up in `sponsors` by name.

   That means a change to the format changes this page with it, and the
   handbook can never disagree with the format page about a date, a rule or
   an amount.

   Voice: short declaratives. No exclamation marks. No hype words.
   ========================================================================== */

/* --- Derivations ---------------------------------------------------------- */

/** Every dated step in the cycle, in order. */
const allDays = format.weeks.flatMap((week) => week.days);

/** The last day number named in the format: the length of one cycle. */
export const cycleDays = Math.max(
  ...allDays.map((d) => Number(/(\d+)\s*$/.exec(d.day)?.[1] ?? 0)),
);

/** The opening clause of a day's body, used as a spec value. */
const opening = (text: string) => text.split(". ")[0].replace(/\.$/, "");

/** Every day number in a step label: "Day 8-11" -> [8, 11]. */
const numbersIn = (label: string) => (label.match(/\d+/g) ?? []).map(Number);

/**
 * The real day window each week covers, read off its first and last step.
 * Drawn as a ruler on the spec sheet, so the drawing cannot claim a window
 * the format does not have.
 */
export const weekSpans = format.weeks.map((week) => {
  const first = numbersIn(week.days[0].day);
  const last = numbersIn(week.days[week.days.length - 1].day);
  return {
    id: week.id,
    label: week.label,
    title: week.title,
    start: first[0] ?? 1,
    end: last[last.length - 1] ?? 1,
    steps: week.days.length,
  };
});

/** A day, found by the week it belongs to and its title. */
function dayOf(weekId: string, title: string) {
  const week = format.weeks.find((w) => w.id === weekId);
  const day = week?.days.find((d) => d.title === title);
  return week && day ? { week, day } : null;
}

/** "$100". Prizes are whole amounts, paid in cash. */
const money = (amount: number) =>
  prizes.currency === "USD" ? `$${amount}` : `${amount} ${prizes.currency}`;

/* --- The loop ------------------------------------------------------------
   Six stages, each one a real day out of the format. Two of them run on a
   sponsor's tooling, and the sponsor is looked up by name so its blurb,
   contribution and URL come from content/sponsors.ts rather than from here.
   A stage whose day is renamed drops out instead of rendering a stub.
   ------------------------------------------------------------------------ */

type StageSource = { week: string; day: string; sponsor?: string };

const STAGE_SOURCES: StageSource[] = [
  { week: "week-01", day: "Kickoff" },
  { week: "week-01", day: "Spec" },
  { week: "week-02", day: "Core build", sponsor: "Base44" },
  { week: "week-03", day: "Security review", sponsor: "ArgosX" },
  { week: "week-04", day: "Deploy" },
  { week: "week-04", day: "Demo" },
];

export type StageTool = {
  name: string;
  blurb: string;
  contribution: string;
  url: string;
};

export type Stage = {
  id: string;
  /** "01". Position in the loop. */
  index: string;
  title: string;
  /** "Day 8-11". */
  range: string;
  body: string;
  weekLabel: string;
  weekTitle: string;
  weekSummary: string;
  tool?: StageTool;
};

export const stages: Stage[] = STAGE_SOURCES.map((source, i) => {
  const found = dayOf(source.week, source.day);
  if (!found) return null;
  const { week, day } = found;
  const sponsor = source.sponsor
    ? sponsors.find((s) => s.name === source.sponsor)
    : undefined;
  const stage: Stage = {
    id: day.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    index: String(i + 1).padStart(2, "0"),
    title: day.title,
    range: day.day,
    body: day.body,
    weekLabel: week.label,
    weekTitle: week.title,
    weekSummary: week.summary,
    ...(sponsor
      ? {
          tool: {
            name: sponsor.name,
            blurb: sponsor.blurb,
            contribution: sponsor.contribution,
            url: sponsor.url,
          },
        }
      : {}),
  };
  return stage;
}).filter((stage): stage is Stage => stage !== null);

/** The learning branch: a sponsor that sits beside the path, not on it. */
const learningSponsor = sponsors.find((s) => s.name === "boot.dev");

export type Tool = StageTool & { where: string };

/** Every tool on or beside the path, with the stage it attaches to. */
export const tools: Tool[] = [
  ...stages.flatMap((stage) =>
    stage.tool ? [{ ...stage.tool, where: `On the path at ${stage.title.toLowerCase()}` }] : [],
  ),
  ...(learningSponsor
    ? [
        {
          name: learningSponsor.name,
          blurb: learningSponsor.blurb,
          contribution: learningSponsor.contribution,
          url: learningSponsor.url,
          where: "A branch off the loop, open the whole month",
        },
      ]
    : []),
];

/* --- Masthead ------------------------------------------------------------- */

const firstStage = stages[0];
const lastStage = stages[stages.length - 1];

export const handbookPage = {
  eyebrow: "Handbook",
  title: ["How a cycle", "actually runs."],
  standfirst:
    "One hackathon end to end: the stages a project moves through, the four weeks around them, the rules that do not bend, and the review it clears before anyone outside the room sees it.",
  meta: {
    title: "Handbook",
    description: `How a ${cycleDays}-day hackathon runs at ${club.name}: ${stages.length} stages, ${format.weeks.length} weeks, the rules of the build, the judging weights, and the security checks every project clears before it ships.`,
  },
  /** Spec rows for the masthead panel. */
  panelRows: [
    { label: "Cycle", value: `${cycleDays} days · ${format.weeks.length} weeks` },
    {
      label: "Stages",
      value: `${stages.length}, ${firstStage.title.toLowerCase()} to ${lastStage.title.toLowerCase()}`,
    },
    { label: "Meets", value: meetingLine },
  ],
};

/* --- Section framing ------------------------------------------------------ */

export const sections = {
  loop: {
    eyebrow: "The loop",
    title: "Six stages. One path.",
    intro:
      "Every project takes the same route in the same order. Two stages run on a sponsor's tooling. Choose one to read where it sits in the month.",
    hubLabel: `${cycleDays} days · one cycle`,
    toolsTitle: "Tooling on the path",
    panelLabel: "Stage detail",
  },
  weeks: {
    eyebrow: "The four weeks",
    title: "The stack, exploded.",
    intro:
      "The stages sit inside four weeks. Each week has one job and ends before the next one starts.",
    stackLabel: "Week stack",
  },
  rules: {
    eyebrow: "Rules of the build",
    title: "What is fixed.",
    intro:
      "These are the parts nobody negotiates. Everything else about the project is yours to decide.",
    numberLabel: "days per cycle",
    rulerLabel: "The month, week by week",
  },
  rubric: {
    eyebrow: "The rubric",
    title: "How a demo is scored.",
    intro:
      "Four weights, set before the cycle starts. Judges score against them with the product open in front of them.",
    totalLabel: "Weights total",
  },
  prizes: {
    eyebrow: "Prizes",
    title: prizes.headline,
    intro: prizes.standfirst,
    poolLabel: "Pool per hackathon",
    rulesTitle: "Eligibility",
  },
  checklist: {
    eyebrow: "The checklist",
    title: `${security.checks.length} checks, then a URL.`,
    intro:
      "The scan comes back as a list. You clear it, run it again, and only then does the project get a public address.",
    cellLabel: "Check",
    requiredLabel: "Required",
    gateLabel: "The gate",
    gateState: "Enforced before launch",
  },
  close: {
    eyebrow: "Next",
    title: ["Read it once.", "Then come build."],
    body: join.standfirst,
    contactLabel: "Questions before you apply",
  },
};

/* --- The spec sheet -------------------------------------------------------
   Label/value rows, grouped. Every value is read off content/club.ts: the
   ship rules are the opening clause of the day that states them, so the
   spec sheet and the format cannot drift apart.
   ------------------------------------------------------------------------ */

const deploy = dayOf("week-04", "Deploy");
const demo = dayOf("week-04", "Demo");
const rescan = dayOf("week-04", "Fix and re-scan");

export type SpecRow = { label: string; value: string };
export type SpecGroup = { group: string; rows: SpecRow[] };

export const spec: SpecGroup[] = [
  {
    group: "Cycle",
    rows: [
      { label: "Length", value: `${cycleDays} days` },
      { label: "Weeks", value: String(format.weeks.length) },
      { label: "Phases", value: format.weeks.map((w) => w.title).join(" · ") },
      { label: "Dated steps", value: String(allDays.length) },
    ],
  },
  {
    group: "Meetings",
    rows: [
      { label: "Cadence", value: meeting.cadence },
      { label: "Time", value: meeting.time },
      ...(meeting.room ? [{ label: "Room", value: meeting.room }] : []),
    ],
  },
  {
    group: "Teams",
    rows: [
      { label: "Solo entries", value: "Allowed" },
      { label: "Team size", value: `${teams.min + 1} to ${teams.max}` },
      { label: "Applying", value: "One form per person" },
      { label: "Teams lock", value: `${firstStage.range}, at kickoff` },
    ],
  },
  {
    group: "Ship",
    rows: [
      ...(deploy ? [{ label: "Deploy", value: opening(deploy.day.body) }] : []),
      ...(rescan ? [{ label: "Security", value: opening(rescan.day.body) }] : []),
      ...(demo ? [{ label: "Demo", value: opening(demo.day.body) }] : []),
    ],
  },
  {
    group: "Judging",
    rows: prizes.criteria.map((c) => ({ label: c.term, value: c.weight })),
  },
];

/* --- The rubric ----------------------------------------------------------- */

/** Each criterion with its weight as a number, for the slider fills. */
export const rubric = prizes.criteria.map((c) => ({
  ...c,
  percent: Number.parseInt(c.weight, 10),
}));

/** The weights add to this. Printed as a readout, so it stays honest. */
export const weightTotal = rubric.reduce((sum, c) => sum + c.percent, 0);

/* --- Prizes --------------------------------------------------------------- */

export const prizeTiers = prizes.tiers.map((tier) => ({
  ...tier,
  money: money(tier.amount),
}));

export const prizePool = money(
  prizes.tiers.reduce((sum, tier) => sum + tier.amount, 0),
);

/* --- The gate ------------------------------------------------------------- */

/** The rule the whole review exists to enforce, stated where it happens. */
export const shipRule = rescan ? rescan.day.body : security.headline;

/* --- Close ---------------------------------------------------------------- */

export const closeActions = {
  primary: hero.primaryCta,
  secondary: hero.secondaryCta,
};
