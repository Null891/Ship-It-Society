/* ==========================================================================
   Ship It Society — the single edit surface.

   Everything the club changes over time lives here. No component holds a
   name, date, or dollar figure. Anything marked TODO is a placeholder:
   search this file for "TODO" to find every unfinished item.

   Voice: short declaratives. No exclamation marks. No hype words.
   ========================================================================== */

export const club = {
  name: "Ship It Society",
  shortName: "Ship It",
  school: "Fremont High School", // TODO: confirm the exact name to print
  location: "Sunnyvale, California", // TODO: confirm city
  email: "hello@example.com", // TODO: club contact email
  instagram: "", // TODO: profile URL. Leave "" to hide the link.
  discord: "", // TODO: invite URL. Leave "" to hide the link.
  github: "", // TODO: org URL. Leave "" to hide the link.
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
   Rendered as a sticky pair: the week label pins while its days scroll past.
   Keep each day to one line.
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
      title: "Build",
      summary: "Decide fast, then make something that runs.",
      days: [
        {
          day: "Day 1",
          title: "Kickoff",
          body: "Teams form, ideas get pitched in ninety seconds, scope gets cut in half.",
        },
        {
          day: "Day 2-3",
          title: "Spec",
          body: "One page. What it does, who it is for, and what you are deliberately not building.",
        },
        {
          day: "Day 4-6",
          title: "Core build",
          body: "The single feature the product cannot exist without. Nothing else yet.",
        },
        {
          day: "Day 7",
          title: "Checkpoint",
          body: "It runs locally, or the plan changes. Officers review every team.",
        },
      ],
    },
    {
      id: "week-02",
      label: "Week 02",
      title: "Ship",
      summary: "Harden it, prove it is safe, put it on the internet.",
      days: [
        {
          day: "Day 8-10",
          title: "Fill in",
          body: "The second and third features, if and only if the first one holds.",
        },
        {
          day: "Day 11",
          title: "Security review",
          body: "A scan runs against the build. Findings come back as a list you have to clear.",
        },
        {
          day: "Day 12",
          title: "Fix and re-scan",
          body: "Nothing ships with open findings. Run it again until it comes back clean.",
        },
        {
          day: "Day 13",
          title: "Deploy",
          body: "Live URL, real users. It exists outside your laptop now.",
        },
        {
          day: "Day 14",
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
   Set the real figures once sponsorship is finalised. An amount of 0 renders
   as "TBA" rather than "$0", so this is safe to launch with.
   ------------------------------------------------------------------------- */

export const prizes = {
  eyebrow: "Prizes",
  headline: "Sponsor-funded. Paid in cash.",
  standfirst:
    "Our sponsors fund a prize pool for every hackathon. Judging weights a working deployment above everything else.",
  pool: { amount: 0, label: "Prize pool per hackathon" }, // TODO: e.g. 500
  tiers: [
    { place: "01", title: "First", amount: 0, note: "Best shipped product" }, // TODO
    { place: "02", title: "Second", amount: 0, note: "Runner-up" }, // TODO
    { place: "03", title: "Most secure", amount: 0, note: "Cleanest scan result" }, // TODO
  ],
  criteria: [
    { term: "Shipped", weight: "40%", detail: "It is live and a stranger can use it." },
    { term: "Secure", weight: "25%", detail: "Clean scan, no open findings." },
    { term: "Useful", weight: "20%", detail: "It solves a problem someone actually has." },
    { term: "Craft", weight: "15%", detail: "It feels considered, not assembled." },
  ],
};

/* --- Schedule and countdown -----------------------------------------------
   ISO 8601 with an explicit offset. Pacific is -07:00 during daylight saving
   and -08:00 from early November to early March. The countdown reads
   nextHackathonDeadline first and falls back to nextMeeting. Dates in the
   past are hidden automatically, so a stale date degrades quietly.
   ------------------------------------------------------------------------- */

export const schedule = {
  cadence: "TBD", // TODO: confirm the day
  time: "1:30 - 2:10 PM", // TODO: confirm the time
  room: "Room TBD", // TODO: confirm the room
  nextMeeting: "2026-09-23T13:30:00-07:00", // TODO: real date
  nextHackathonDeadline: "2026-10-23T23:59:00-07:00", // TODO: real date
  nextHackathonName: "Hackathon 01", // TODO: name it
  season: [
    { name: "Hackathon 01", window: "Sep 23 - Oct 23", status: "upcoming" as const }, // TODO
    { name: "Hackathon 02", window: "Oct 28 - Nov 28", status: "planned" as const }, // TODO
    { name: "Hackathon 03", window: "Dec 2 - Jan 2", status: "planned" as const }, // TODO
  ],
};

/* --- People ---------------------------------------------------------------
   image is optional. With no image the card renders a monogram tile, which
   is a designed state rather than a broken one. Drop files into /public/team/
   and set image to "/team/name.jpg".
   ------------------------------------------------------------------------- */

export type Officer = {
  name: string;
  role: string;
  bio: string;
  image: string;
};

export const officers: Officer[] = [
  {
    name: "Nikhil Nagaraj",
    role: "Co-founder",
    bio: "TODO: one sentence. What you build, or why you started this.",
    image: "",
  },
  {
    name: "Pinakin Joshi",
    role: "Co-founder",
    bio: "TODO: one sentence.",
    image: "",
  },
  {
    name: "Derrick Chien",
    role: "Co-founder",
    bio: "TODO: one sentence.",
    image: "",
  },
  {
    name: "Abhinava Sivakumaran",
    role: "Co-founder",
    bio: "TODO: one sentence.",
    image: "",
  },
];

/* --- Join ----------------------------------------------------------------- */

export const join = {
  eyebrow: "Join",
  headline: "No experience required. Effort is.",
  standfirst:
    "You do not need to have built anything before. You do need to show up for one month and finish what you start.",
  points: [
    "Open to every grade.",
    "No application fee and no prerequisites.",
    "Come to one meeting before you commit. See whether the format suits you.",
  ],
  success: {
    title: "Application received.",
    body: "We read every one. Expect a reply within a week, and come to the next meeting either way.",
  },
};

/* --- Footer --------------------------------------------------------------- */

export const footer = {
  note: "A student-run club at Fremont High School. Built and maintained by its officers.",
};
