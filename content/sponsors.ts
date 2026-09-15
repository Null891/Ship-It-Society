import { club } from "./club";

/* ==========================================================================
   Sponsors.

   `logo` is a path to an SVG in /public/brand/, e.g. "/brand/argosx.svg",
   and only a file the sponsor supplied or approved goes there. Left "", the
   lockup sets the sponsor's name in type, which is a designed state — a
   wordmark, not a broken image.
   ========================================================================== */

export type Sponsor = {
  name: string;
  /** One line. What they actually do, in the club's voice. */
  blurb: string;
  /** What they give the club. Kept concrete. */
  contribution: string;
  url: string;
  logo: string;
  tier: "founding" | "supporting";
};

export const sponsors: Sponsor[] = [
  {
    name: "Base44",
    blurb: "AI-assisted app building. The tooling members use to move fast in week one.",
    contribution: "Platform access for every member and part of the prize pool.",
    url: "https://base44.com",
    logo: "",
    tier: "founding",
  },
  {
    name: "ArgosX",
    blurb: "Security testing. Every project passes through it before it gets a public URL.",
    contribution: "Scans for every team and part of the prize pool.",
    url: "https://getargosx.com",
    logo: "",
    tier: "founding",
  },
  {
    name: "boot.dev",
    blurb: "Backend development courses. Practical Python, Go, and servers members learn by building.",
    contribution: "Learning resources for members and part of the prize pool.",
    url: "https://www.boot.dev",
    logo: "",
    tier: "supporting",
  },
];

/** "A, B and C". */
const listOf = (items: string[]) =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

const sponsorStandfirst =
  "Sponsorship pays for prizes and tooling. It does not buy a say in what students build.";

export const sponsorPage = {
  eyebrow: "Sponsors",
  headline: "Who funds this.",
  standfirst: sponsorStandfirst,
  /** Search and share snippet. Names the sponsors, so it follows the list above. */
  meta: {
    title: "Sponsors",
    description: `${listOf(sponsors.map((s) => s.name))} back ${club.name}. ${sponsorStandfirst}`,
  },
  /* Where sponsorship goes. Mirrors each sponsor's `contribution` above —
     if a contribution changes, change this list with it. */
  funds: [
    {
      term: "Prize pool",
      detail: "Every sponsor puts part of their support into the cash prizes for each hackathon.",
    },
    {
      term: "Build tooling",
      detail: "Base44 platform access for every member, and boot.dev courses to learn with.",
    },
    {
      term: "Security scans",
      detail: "ArgosX scans for every team, so nothing ships without a review.",
    },
  ],
  /* What support does NOT buy. This used to be a sponsorship sales pitch —
     placement, access, and a named prize whose funder sat on its own judging
     panel. For a student club that was the wrong offer to make and the wrong
     thing to publish: it put influence up for sale. The honest version of this
     section is the boundary itself. */
  principles: {
    eyebrow: "How this works",
    headline: "What support does not buy.",
    standfirst:
      "The club is run by students and the work belongs to them. Support pays for prizes and tooling. It buys no say in what gets built, and no say in who wins.",
    terms: [
      {
        term: "Students choose",
        detail: "Members pick their own projects. No sponsor sets a brief, a theme, or a stack.",
      },
      {
        term: "Judging is independent",
        detail: "Officers and invited judges score against the published rubric. Funding a prize does not buy a seat on the panel.",
      },
      {
        term: "The work stays theirs",
        detail: "Members keep the copyright and the deployment. Nothing is signed over to the club or to a sponsor.",
      },
      {
        term: "Credit, not advertising",
        detail: "Sponsors are named here and thanked at demos. This site carries no advertising and no affiliate links.",
      },
    ],
    cta: { label: "Email the club", href: `mailto:${club.email}` },
  },
};
