/* ==========================================================================
   Ship It Society — the single edit surface.

   Everything the club changes over time lives here. No component holds a
   name, date, or dollar figure.

   Nothing in this file may ship as a placeholder. `npm run build` runs
   scripts/check-placeholders.mjs, which fails the build on TODO, TBA, TBD,
   "to come", example.com, "Fill in" and friends. The site was once rejected
   from a domain registry for exactly that, so the check is not optional.

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
   Deliberately no dollar figures. The pool is sponsor-funded and set per
   hackathon, and an unfilled number reads worse than no number at all.
   To show amounts later, add `amount` back to each tier and render it.
   ------------------------------------------------------------------------- */

export const prizes = {
  eyebrow: "Prizes",
  headline: "Sponsor-funded. Paid in cash.",
  standfirst:
    "Our sponsors fund a cash prize pool for every hackathon. Judging weights a working deployment above everything else.",
  tiers: [
    { place: "01", title: "First", note: "Best shipped product" },
    { place: "02", title: "Second", note: "Runner-up" },
    { place: "03", title: "Most secure", note: "Cleanest scan result" },
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

export const meeting = {
  cadence: "Every other week",
  time: "During lunch",
  /** Set once a room is assigned; "" hides the line rather than printing a placeholder. */
  room: "A-104",
  nextMeeting: "2026-09-23T12:15:00-07:00",
};

/**
 * The one meeting string every surface prints. Empty parts drop out, so an
 * unassigned room shows "Every other week · 1:30 - 2:10 PM" rather than a
 * dangling "· Room TBD". Footer, /join, /team, /hackathons and the countdown
 * all render this, so they cannot drift apart the way they previously did.
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
};

/* --- Join ----------------------------------------------------------------- */

export const join = {
  eyebrow: "Join",
  title: ["No experience required.", "Effort is."],
  headline: "No experience required. Effort is.",
  standfirst:
    "You do not need to have built anything before. You do need to show up for one month and finish what you start.",
  points: [
    "Open to every grade.",
    "No application fee and no prerequisites.",
    "Bring your own device. A laptop or Chromebook is enough.",
    "The club runs on Discord. The invite comes with your acceptance.",
    "Come to one meeting before you commit. See whether the format suits you.",
  ],
  success: {
    title: "Application received.",
    body: "We read every one. Expect a reply within a week, and come to the next meeting either way.",
  },
};

/* --- What you will learn --------------------------------------------------
   The club gives people the tools to build and ship. Each item names one
   tool, and the last one is the point of the club: the work does not count
   until it is live.
   ------------------------------------------------------------------------- */

export const learn = {
  eyebrow: "What you will learn",
  headline: ["Tools you keep.", "Work you can show."],
  standfirst:
    "The point of this club is not the club. It is what you can build with it afterward.",
  items: [
    {
      term: "AI-assisted building",
      detail:
        "Using AI tooling the way working engineers do: to move through the solved parts, so your time goes to the parts that are not.",
    },
    {
      term: "Real deployment",
      detail:
        "Repos, deploys, and a live URL. Your project exists outside your laptop, and anyone with the link can use it.",
    },
    {
      term: "Security review",
      detail:
        "Finding the holes before a stranger does. The same checks a professional team clears before launch.",
    },
    {
      term: "Shipping",
      detail:
        "Cutting scope to hit a date, and finishing. The skill is the launch, not the slides.",
    },
  ],
};

/* --- FAQ -------------------------------------------------------------------
   Written from the questions the officers actually get. New questions go in
   here rather than anywhere else on the site, so every answer has one home.
   ------------------------------------------------------------------------- */

export const faq = {
  eyebrow: "FAQ",
  headline: ["Asked often.", "Answered once."],
  items: [
    {
      q: "Where and when do you meet?",
      a: "Every other week during lunch in room A-104. Bring your food, not a permission slip.",
    },
    {
      q: "Why does the application ask for my email?",
      a: "So we can reply with your acceptance and the Discord invite. It is the one field we cannot do without.",
    },
    {
      q: "Can I join with a friend?",
      a: "Yes, and you can compete as a team. Apply separately so we can track both applications, then name your team at kickoff.",
    },
    {
      q: "How much time does a hackathon take?",
      a: "The meetings run one lunch period every other week. The build itself fits around your schedule; the deadline does not.",
    },
    {
      q: "Do I need my own laptop?",
      a: "Bring your own device if you have one. A laptop or Chromebook is enough, and the library lends them when you do not have one.",
    },
    {
      q: "Where do we talk between meetings?",
      a: "The club runs on Discord. It is where specs get reviewed, findings get cleared, and the demo link goes out. The invite is in the footer.",
    },
  ],
};

/* --- Footer --------------------------------------------------------------- */

export const footer = {
  note: "A student-run club at Fremont High School. Built and maintained by its officers.",
};
