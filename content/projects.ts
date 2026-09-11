import { club, season, short } from "./club";

/* ==========================================================================
   Shipped projects.

   Empty until the first hackathon's deadline passes. /projects renders a
   designed status panel for that case rather than a gap (projectsPage.empty),
   and the sitemap leaves /projects out until there is an entry to index.

   To add one: give every field of the Project type below a real value and
   the entry a unique lowercase slug. It then appears in the archive, in the
   sitemap and at /projects/<slug> automatically.
   ========================================================================== */

export type Project = {
  slug: string;
  title: string;
  tagline: string;
  hackathon: string;
  team: string[];
  /** The one-month story, in three or four short paragraphs. */
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
  /** ISO date the entry was published. Drives sitemap lastmod. */
  published: string;
};

export const projects: Project[] = [];

/** The cycle whose projects will be the archive's first entries. */
const firstCycle = season[0];

export const projectsPage = {
  eyebrow: "Archive",
  headline: "Everything the club has shipped.",
  title: ["Everything the club", "has shipped."],
  standfirst:
    "Each entry is a real deployment with a real URL. The write-up covers what got cut, what the security review found, and what it took to clear it.",
  /** Search and share snippet. */
  meta: {
    title: "Projects",
    description: `The archive of what ${club.name} members have shipped: live URLs, the stack, and what each security review found.`,
  },
  /* The empty state, written as a status readout rather than a promise: it
     says which cycle feeds the archive and when entries publish. Every date
     is derived from the season, so it cannot disagree with the calendar. */
  empty: {
    index: "00",
    label: `Publishing after ${short(firstCycle.end)}`,
    headline: `The first entries publish when ${firstCycle.name} closes.`,
    body: `${firstCycle.name} runs ${short(firstCycle.start)} to ${short(firstCycle.end)}. After its deadline, every project that is live and clears its security review is written up here, with the live URL, the stack, and what the scan found.`,
    cta: { label: "See the format", href: "/hackathons" },
  },
};
