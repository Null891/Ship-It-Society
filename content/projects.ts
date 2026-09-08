/* ==========================================================================
   Shipped projects.

   Two sample entries are included and flagged with sample: true so the
   archive layout is never empty before the first hackathon. Delete them once
   you have real projects, or leave them and they will render with a
   "Sample entry" label so nobody mistakes them for real work.
   ========================================================================== */

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  hackathon: string;
  team: string[];
  /** The two-week story, in three or four short paragraphs. */
  story: string[];
  stack: string[];
  /** Open findings remaining at launch. Zero is the only acceptable number. */
  findings: number;
  /** Live deployment. Leave "" if it has come down since. */
  url: string;
  /** Screenshot in /public/projects/. Leave "" for the designed fallback. */
  image: string;
  /** Accent used for the case-study cover plate. */
  cover: "ink" | "surface" | "marigold";
  sample?: boolean;
};

export const projects: Project[] = [
  {
    slug: "sample-late-bus",
    title: "Late Bus",
    tagline: "Live arrival times for the routes the district app forgets.",
    hackathon: "Sample entry",
    team: ["TODO", "TODO"],
    story: [
      "The district transport app covers the main routes and none of the shuttles. If your bus is one of the four it does not track, you stand outside and guess.",
      "The team scoped it down on day two to a single screen: pick your stop, see the next three arrivals. No accounts, no notifications, no map. Everything else was cut.",
      "The security review flagged an exposed admin route left over from testing and a dependency with a known advisory. Both were cleared before the deploy on day thirteen.",
    ],
    stack: ["Next.js", "TypeScript", "Postgres", "Vercel"],
    findings: 0,
    url: "",
    image: "",
    cover: "ink",
    sample: true,
  },
  {
    slug: "sample-office-hours",
    title: "Office Hours",
    tagline: "A shared board for who is free, and when, during tutorial.",
    hackathon: "Sample entry",
    team: ["TODO", "TODO", "TODO"],
    story: [
      "Tutorial period is forty minutes and nobody knows which teachers have space. The information exists on paper, in a binder, in the front office.",
      "One screen, one job: teachers mark themselves open or full, students see it live. The team spent day four through six on the realtime sync and nothing else.",
      "The scan came back with an input validation gap on the teacher status endpoint. A student could have marked any room full. Fixed on day twelve, re-scanned clean.",
    ],
    stack: ["React", "TypeScript", "Supabase"],
    findings: 0,
    url: "",
    image: "",
    cover: "surface",
    sample: true,
  },
];

export const projectsPage = {
  eyebrow: "Archive",
  headline: "Everything the club has shipped.",
  standfirst:
    "Each entry is a real deployment with a real URL. The write-up covers what got cut, what the security review found, and what it took to clear it.",
  empty:
    "The first hackathon has not run yet. When it does, every project from it lands here.",
};
