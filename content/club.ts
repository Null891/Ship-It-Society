/* ==========================================================================
   Ship It Society — the single edit surface.

   Everything the club changes over time lives here. No component holds a
   name, date, or dollar figure.

   Nothing in this file may ship as a placeholder. `npm run build` runs
   scripts/check-placeholders.mjs first, and it fails the build on stub text
   (the full list is at the top of that script). The site was once rejected
   from a domain registry for exactly that, so the check is not optional.

   Facts are typed once and derived everywhere else: the FAQ, the join steps
   and the page descriptions read `meeting`, `teams`, `prizes` and `season`
   rather than restating them, so changing a fact here changes every sentence
   that mentions it.

   Voice: short declaratives. No exclamation marks. No hype words.
   ========================================================================== */

export const club = {
  name: "Ship It Society",
  shortName: "Ship It",
  school: "Fremont High School",
  location: "Sunnyvale, California",
  email: "bob.murphy.97chute@gmail.com",
  instagram: "", // Profile URL. Leave "" to hide the link.
  discord: "https://discord.gg/NcAk7Tfv5", // Invite URL. Leave "" to hide the link.
  github: "https://github.com/Null891/Ship-It-Society",
  /** Meeting slides. Leave "" to hide every slides link on the site. */
  slides: "",
  /** The club's own description, used on About, in forms and in metadata. */
  bio: "Ship It Society is a hackathon club at Fremont High School dedicated to helping students bring their ideas to life. Each hackathon follows the same principle: take a concept from initial idea to a fully deployed product.",
};

/* --- Hero ----------------------------------------------------------------- */

export const hero = {
  eyebrow: "Fremont High School",
  headline: ["One month.", "Idea to shipped."],
  standfirst:
    "A hackathon club where every project goes live. You build with AI-assisted tooling, pass a security review, and deploy to a real URL.",
  primaryCta: { label: "Apply to join", href: "/join" },
  secondaryCta: { label: "See the format", href: "/hackathons" },
  scrollCue: "Scroll to watch a build",
};

/* --- The numbers ----------------------------------------------------------
   Shown as count-ups. Keep these honest. A new club with real small numbers
   reads better than a new club with invented big ones.
   ------------------------------------------------------------------------- */

export const stats = [
  { value: 30, suffix: "", label: "Days per hackathon", detail: "Idea to deployed" },
  { value: 2, suffix: "", label: "Weeks between meets", detail: "Officers run every event" },
  { value: 100, suffix: "%", label: "Projects security tested", detail: "Before anything is public" },
  { value: 0, suffix: "", label: "Slide decks required", detail: "Ship a product, not a pitch" },
];

/* --- What the club is ----------------------------------------------------- */

export const premise = {
  eyebrow: "The premise",
  headline: "Most clubs end in a slide deck. This one ends in a URL.",
  body: [
    "Ship It Society runs on a one-month cycle. On day one you have an idea. On day thirty it is deployed, security tested, and open to anyone with the link.",
    "You will use AI-assisted coding the way working engineers actually use it. Move faster through the parts that are already solved, and spend the time you save on the parts that are not.",
  ],
};

/* --- The one-month format -------------------------------------------------
   Four weeks, thirty days. Rendered as a sticky pair: the week label pins
   while its days scroll past. Keep each day to one line.

   The day ranges here must add up to the 30 in `stats` and to the calendar
   windows below. If you change the cycle length, change all three.
   ------------------------------------------------------------------------- */

export const format = {
  eyebrow: "The format",
  headline: "Thirty days, start to finish.",
  standfirst:
    "The schedule is fixed, so the scope has to flex. You cut features to hit the date. That constraint is the whole point.",
  weeks: [
    {
      id: "week-01",
      label: "Week 01",
      title: "Scope",
      summary: "Decide what it is, and what it is deliberately not.",
      days: [
        {
          day: "Day 1",
          title: "Kickoff",
          body: "Teams form, ideas get pitched in ninety seconds, scope gets cut in half.",
        },
        {
          day: "Day 2-3",
          title: "Spec",
          body: "One page. What it does, who it is for, and what you are not building.",
        },
        {
          day: "Day 4-5",
          title: "Setup",
          body: "Repo, deploy target, and the smallest thing that runs end to end.",
        },
        {
          day: "Day 6-7",
          title: "Spec review",
          body: "Officers read every spec. Most get cut again. Ambition is not the constraint, time is.",
        },
      ],
    },
    {
      id: "week-02",
      label: "Week 02",
      title: "Build",
      summary: "Make the one thing the product cannot exist without.",
      days: [
        {
          day: "Day 8-11",
          title: "Core build",
          body: "The single feature the product cannot exist without. Nothing else yet.",
        },
        {
          day: "Day 12-13",
          title: "Second pass",
          body: "The next feature, if and only if the first one holds up under use.",
        },
        {
          day: "Day 14",
          title: "Checkpoint",
          body: "It runs, or the plan changes. Officers review every team in the room.",
        },
      ],
    },
    {
      id: "week-03",
      label: "Week 03",
      title: "Harden",
      summary: "Stop adding. Start proving it holds.",
      days: [
        {
          day: "Day 15-17",
          title: "Edges",
          body: "Error states, empty states, and the paths nobody thought to test.",
        },
        {
          day: "Day 18-19",
          title: "Feature freeze",
          body: "Nothing new after this point. Everything left on the board is a fix.",
        },
        {
          day: "Day 20-21",
          title: "Security review",
          body: "ArgosX runs against the build. Findings come back as a list you have to clear.",
        },
      ],
    },
    {
      id: "week-04",
      label: "Week 04",
      title: "Ship",
      summary: "Clear the findings, deploy it, then defend it.",
      days: [
        {
          day: "Day 22-24",
          title: "Fix and re-scan",
          body: "Nothing ships with open findings. Run it again until it comes back clean.",
        },
        {
          day: "Day 25-27",
          title: "Polish",
          body: "Copy, spacing, and the first ten seconds someone spends with it.",
        },
        {
          day: "Day 28-29",
          title: "Deploy",
          body: "Live URL, real users. It exists outside your laptop now.",
        },
        {
          day: "Day 30",
          title: "Demo",
          body: "Five minutes in front of the room. Judges use the product, not the deck.",
        },
      ],
    },
  ],
};

/* --- Security step -------------------------------------------------------- */

export const security = {
  eyebrow: "Before it goes live",
  headline: "Nothing ships unreviewed.",
  body: [
    "Every project runs through ArgosX before it is allowed a public URL. The scan returns a list of findings, and you clear them the way a professional team would. Fix, re-run, repeat.",
    "Most students never see this part. It is the difference between code that works and code that is safe to put in front of strangers.",
  ],
  checks: [
    { term: "Secrets", detail: "No keys, tokens, or credentials in the shipped bundle." },
    { term: "Injection", detail: "User input is validated on the server, not just the client." },
    { term: "Auth", detail: "Sessions expire. Routes that need a user actually check for one." },
    { term: "Dependencies", detail: "Nothing ships on a package with a known advisory." },
    { term: "Exposure", detail: "Admin routes, debug endpoints, and stack traces are closed." },
  ],
};

/* --- Prizes ---------------------------------------------------------------
   Per hackathon, in whole dollars of `currency`. The amounts are real and
   sponsor-funded; change them here and the prize table, the FAQ and the
   structured data all follow. Never set an amount to 0 to mean "unknown" —
   remove the tier instead.
   ------------------------------------------------------------------------- */

export const prizes = {
  eyebrow: "Prizes",
  headline: "Sponsor-funded. Paid in cash.",
  standfirst:
    "Our sponsors fund a cash prize pool for every hackathon. Judging weights a working deployment above everything else.",
  currency: "USD",
  tiers: [
    { place: "01", title: "First", amount: 100, note: "Best shipped product" },
    { place: "02", title: "Second", amount: 50, note: "Runner-up" },
    { place: "03", title: "Most secure", amount: 50, note: "Cleanest scan result" },
  ],
  /** Per hackathon. Every rule here follows from the format and judging above. */
  rules: [
    "Prizes are awarded every hackathon, funded by the club's sponsors and paid in cash.",
    "Only projects that are live at the deadline are judged.",
    "A project with open security findings cannot place.",
    "Judges score against the weights below and use the product, not the slides.",
  ],
  criteria: [
    { term: "Shipped", weight: "40%", detail: "It is live and a stranger can use it." },
    { term: "Secure", weight: "25%", detail: "Clean scan, no open findings." },
    { term: "Useful", weight: "20%", detail: "It solves a problem someone actually has." },
    { term: "Craft", weight: "15%", detail: "It feels considered, not assembled." },
  ],
};

/* --- Schedule and countdown -----------------------------------------------
   The season is the single source of truth for hackathon dates. The
   countdown deadline and the calendar windows are both DERIVED from it
   below, so the homepage and /hackathons can no longer disagree — which
   they previously did (homepage said Oct 7, the calendar said Oct 23).

   ISO 8601 with an explicit offset. Pacific is -07:00 during daylight
   saving and -08:00 from early November to early March.
   ------------------------------------------------------------------------- */

export type SeasonEntry = {
  name: string;
  /** Local date, YYYY-MM-DD. */
  start: string;
  /** Local date, YYYY-MM-DD. The deadline is 23:59 on this day. */
  end: string;
  utcOffset: string;
};

/** Raw season dates. lib/schedule.ts derives every live status from these. */
export const season: SeasonEntry[] = [
  { name: "Hackathon 01", start: "2026-09-23", end: "2026-10-23", utcOffset: "-07:00" },
  { name: "Hackathon 02", start: "2026-10-28", end: "2026-11-28", utcOffset: "-08:00" },
  { name: "Hackathon 03", start: "2026-12-02", end: "2027-01-02", utcOffset: "-08:00" },
];

/** "2026-10-23" -> "Oct 23". Parsed as UTC so it cannot drift a day. */
export function short(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** End of the submission day, as a real instant. */
export function deadlineOf(entry: SeasonEntry): string {
  return `${entry.end}T23:59:00${entry.utcOffset}`;
}

/* --- Meetings -------------------------------------------------------------
   `nextMeeting` is the ANCHOR: any one real meeting, as an ISO instant with
   its offset. lib/schedule.ts steps it forward every 14 days at the same
   wall-clock time to find the next one, so it never needs updating unless
   the day, the time or the cadence changes.
   ------------------------------------------------------------------------- */

export const meeting = {
  cadence: "Every other week",
  time: "Lunch, 12:15 PM",
  /** The room. "" hides it everywhere rather than printing a stub. */
  room: "A-104",
  nextMeeting: "2026-09-23T12:15:00-07:00",
};

/**
 * The one meeting string every surface prints. Empty parts drop out, so with
 * no room set it reads "Every other week · Lunch, 12:15 PM" and never ends
 * in a dangling separator. The footer, /join, /hackathons, the countdown and
 * the FAQ all derive from this or from `meeting`, so they cannot drift apart
 * the way they previously did.
 */
export const meetingLine = [meeting.cadence, meeting.time, meeting.room]
  .filter(Boolean)
  .join(" · ");

export const schedule = {
  ...meeting,
  nextHackathonName: season[0].name,
  nextHackathonDeadline: deadlineOf(season[0]),
  /** Display rows for /hackathons, derived so they cannot drift from the deadline. */
  season: season.map((entry, i) => ({
    name: entry.name,
    window: `${short(entry.start)} - ${short(entry.end)}`,
    deadline: deadlineOf(entry),
    status: i === 0 ? ("upcoming" as const) : ("planned" as const),
  })),
};

/* --- People ---------------------------------------------------------------
   image is optional. With no image the card renders a monogram tile, which
   is a designed state rather than a broken one. Drop files into /public/team/
   and set image to "/team/name.jpg".

   There is deliberately no `bio` field. Four officers with four unwritten
   bios reads as unfinished; four officers with names and roles reads as a
   team. Add bios back when they are actually written.
   ------------------------------------------------------------------------- */

export type Officer = {
  name: string;
  role: string;
  image: string;
};

export const officers: Officer[] = [
  { name: "Nikhil Nagaraj", role: "Co-founder", image: "" },
  { name: "Pinakin Joshi", role: "Co-founder", image: "" },
  { name: "Derrick Chien", role: "Co-founder", image: "" },
  { name: "Abhinava Sivakumaran", role: "Co-founder", image: "" },
];

/* --- Page mastheads --------------------------------------------------------
   Title arrays control exactly where the display lines break.
   ------------------------------------------------------------------------- */

export const teamPage = {
  eyebrow: "Team",
  title: ["Officers run", "every hackathon."],
  standfirst:
    "Students run the club end to end. Officers plan each cycle, review every spec, and judge every demo.",
};

export const hackathonsPage = {
  eyebrow: "Hackathons",
  title: ["One month.", "Idea to shipped."],
  standfirst:
    "Every hackathon runs the same thirty days. Officers run each one end to end, and the deadline never moves.",
  /** Search and share snippet. Derived, so it follows the season. */
  meta: {
    title: "Hackathons",
    description: `The format, the season calendar and the prizes. ${season.length} hackathons, ${short(season[0].start)} to ${short(season[season.length - 1].end)}, each one idea to deployed product with a security review before launch.`,
  },
};

/* --- Teams ----------------------------------------------------------------
   Confirmed by the club: build solo or in a team of two to four, and teams
   lock at kickoff.
   ------------------------------------------------------------------------- */

export const teams = {
  min: 1,
  max: 4,
  summary: "Build solo, or in a team of two to four. Teams lock at kickoff.",
  rules: [
    "Solo entries are welcome.",
    "Teams are two to four people.",
    "Everyone applies individually, then teams form at kickoff.",
    "Teams lock on day 1. The team that starts is the team that ships.",
  ],
};

/* --- About -----------------------------------------------------------------
   The club in its own words, then the facts that back it up.
   ------------------------------------------------------------------------- */

export const about = {
  eyebrow: "About",
  title: ["Ideas in.", "Products out."],
  standfirst: club.bio,
  facts: [
    { term: "Founded by", detail: `${officers.length} students, who run every hackathon themselves.` },
    { term: "Format", detail: "One-month hackathons, idea to deployed product." },
    { term: "Standard", detail: "Every project is security reviewed before it goes live." },
    { term: "Meets", detail: meetingLine },
  ],
};

/* --- Join -----------------------------------------------------------------
   Two phrases are shared with the FAQ, so they are typed once here.
   ------------------------------------------------------------------------- */

/** How long an applicant waits for an officer's email. */
const replyWindow = "within a week";
/** What a member needs to bring. */
const deviceNote = "A laptop or Chromebook is enough.";
const joinStandfirst =
  "You do not need to have built anything before. You do need to show up for one month and finish what you start.";

export const join = {
  eyebrow: "Join",
  title: ["No experience required.", "Effort is."],
  headline: "No experience required. Effort is.",
  standfirst: joinStandfirst,
  /** Search and share snippet. */
  meta: {
    title: hero.primaryCta.label,
    description: `Apply to ${club.name} at ${club.school}. ${joinStandfirst}`,
  },
  points: [
    "Open to every grade.",
    "No application fee and no prerequisites.",
    `Bring your own device. ${deviceNote}`,
    "The club Discord is open to anyone, before or after you apply.",
    "Come to one meeting before you commit. See whether the format suits you.",
  ],
  /** What happens after you press send. Each step is a fact stated elsewhere
   *  on the site; keep them in sync if the process changes. */
  after: [
    { step: "01", title: "Confirmation", detail: "You see a confirmation as soon as the application sends." },
    { step: "02", title: "A reply", detail: `An officer reads it and replies by email ${replyWindow}.` },
    { step: "03", title: "Discord", detail: "Join the club Discord. It is open to anyone, before or after applying." },
    { step: "04", title: "Next meeting", detail: `Come to the next meeting. ${meetingLine}.` },
    { step: "05", title: "Kickoff", detail: `Build solo or form a team of up to ${teams.max}. Teams lock on day 1.` },
  ],
  success: {
    title: "Application received.",
    body: `We read every one. Expect a reply ${replyWindow}, and come to the next meeting either way.`,
  },
};

/* --- What you will learn --------------------------------------------------
   Four concrete skills a member leaves with. The premise, the format and
   the security section already say what the club DOES; this list says what
   a member can do afterward that they could not do before. Each one maps to
   a step in the format, but none of them restates it.
   ------------------------------------------------------------------------- */

export const learn = {
  eyebrow: "What you will learn",
  headline: ["Tools you keep.", "Work you can show."],
  standfirst:
    "The point of this club is not the club. It is what you can build with it afterward.",
  items: [
    {
      term: "Git as a team",
      detail:
        "Branches, commits and pull requests on one shared repo, so a whole team can work on the same code without overwriting each other.",
    },
    {
      term: "Reviewing AI output",
      detail:
        "Asking an AI tool for one specific change, then reading the diff before you accept it. You answer for every line that ships.",
    },
    {
      term: "Triaging a finding",
      detail:
        "Reading a scanner report, deciding whether a finding is real, and writing the smallest fix that closes it.",
    },
    {
      term: "Running in production",
      detail:
        "Environment variables, build logs and a live domain. Knowing what to check when it works on your laptop and fails online.",
    },
  ],
};

/* --- FAQ -------------------------------------------------------------------
   Written from the questions the officers actually get, and capped at ten.
   New questions go in here rather than anywhere else on the site, so every
   answer has one home.

   Any answer that states a fact reads it from the objects above — meeting,
   teams, prizes, join — so it cannot contradict the page it summarises.
   `link` is optional: where the answer continues, rendered after it. The
   whole list is also published as FAQPage structured data.
   ------------------------------------------------------------------------- */

export type FaqItem = {
  q: string;
  a: string;
  link?: { label: string; href: string };
};

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];
const inWords = (n: number) => NUMBER_WORDS[n] ?? String(n);

/** "$100". Prizes are whole amounts, paid in cash. */
const money = (amount: number) =>
  prizes.currency === "USD" ? `$${amount}` : `${amount} ${prizes.currency}`;

const faqItems: (FaqItem | null)[] = [
  {
    q: "Where and when do you meet?",
    a: `${meeting.cadence}${meeting.room ? `, in room ${meeting.room}` : ""}. ${meeting.time}. Bring your food.`,
  },
  {
    q: "Do I need to know how to code?",
    a: `No. ${join.standfirst}`,
  },
  {
    q: "How much time does a hackathon take?",
    a: `One month from kickoff to demo. Meetings take one lunch period, ${meeting.cadence.toLowerCase()}. The build fits around your schedule; the deadline does not move.`,
  },
  {
    q: "Can I join with a friend?",
    a: `Yes. Apply separately, then form your team at kickoff: solo, or two to ${inWords(teams.max)} people. Teams lock on day 1, so the team that starts is the team that ships.`,
  },
  {
    q: "What can I win?",
    a: `${prizes.tiers.map((t) => `${t.title} ${money(t.amount)}`).join(", ")}, every hackathon, paid in cash by the club's sponsors. ${prizes.rules[1]} ${prizes.rules[2]}`,
  },
  {
    q: "What happens after I apply?",
    a: `${join.after[0].detail} ${join.after[1].detail} Then join the Discord, come to the next meeting, and build from kickoff.`,
    link: { label: "Every step, on the Join page", href: "/join" },
  },
  {
    // Keep in step with lib/apply.ts: five required fields, one optional.
    q: "Why does the application ask for my email?",
    a: `So an officer can reply. Every application gets an answer by email ${replyWindow}. The form also asks for your name, grade, experience and a line on why you want to join; a project idea is optional.`,
  },
  {
    q: "Do I need my own laptop?",
    a: `Yes, bring your own device. ${deviceNote}`,
  },
  club.discord
    ? {
        q: "Where do we talk between meetings?",
        a: "On the club Discord. It is open to anyone, before or after you apply. Specs get reviewed there, findings get cleared, and demo links go out.",
        link: { label: "Join the Discord", href: club.discord },
      }
    : null,
  {
    q: "Can I give a talk, or donate to the club?",
    a: "Yes. Each has a short form on the Get involved page: offer a talk or a workshop at a meeting, or donate a prize or a gift. An officer replies by email to arrange it.",
    link: { label: "Get involved", href: "/get-involved" },
  },
];

export const faq = {
  eyebrow: "FAQ",
  headline: ["Asked often.", "Answered once."],
  items: faqItems.filter((item): item is FaqItem => item !== null),
};

/* --- Footer --------------------------------------------------------------- */

export const footer = {
  note: "A student-run club at Fremont High School. Built and maintained by its officers.",
};
