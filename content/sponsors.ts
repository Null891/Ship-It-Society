/* ==========================================================================
   Sponsors.

   logo points at an SVG in /public/brand/. With no file the lockup falls
   back to the sponsor name set in type, which is a designed state — a
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
    url: "", // TODO: sponsor URL
    logo: "", // TODO: /brand/base44.svg
    tier: "founding",
  },
  {
    name: "ArgosX",
    blurb: "Security testing. Every project passes through it before it gets a public URL.",
    contribution: "Scans for every team and part of the prize pool.",
    url: "", // TODO: sponsor URL
    logo: "", // TODO: /brand/argosx.svg
    tier: "founding",
  },
  {
    name: "boot.dev",
    blurb: "Backend development courses. Practical Python, Go, and servers members learn by building.",
    contribution: "Learning resources for members and part of the prize pool.",
    url: "https://www.boot.dev",
    logo: "", // TODO: /brand/bootdev.svg
    tier: "supporting",
  },
];

export const sponsorPage = {
  eyebrow: "Sponsors",
  headline: "Who funds this.",
  standfirst:
    "Sponsorship pays for prizes and tooling. It does not buy a say in what students build.",
  pitch: {
    eyebrow: "Become a sponsor",
    headline: "What sponsorship gets you.",
    standfirst:
      "We are a new club with a specific promise: every project ships, and every project is security tested first. If that is the kind of work you want your name on, get in touch.",
    offers: [
      {
        term: "Placement",
        detail: "Your mark on this site, on every hackathon page, and in the room at demos.",
      },
      {
        term: "Access",
        detail: "First look at what members build, and an open door to the students who built it.",
      },
      {
        term: "A named prize",
        detail: "Fund a category and judge it yourself. Most secure build is already sponsored.",
      },
      {
        term: "Real numbers",
        detail: "A short write-up after each hackathon. What shipped, what it cost, who took part.",
      },
    ],
    cta: { label: "Email the club", href: "mailto:" },
  },
};
