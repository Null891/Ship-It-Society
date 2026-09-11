/* ==========================================================================
   Shipped projects.

   Empty until the first hackathon finishes. /projects renders a designed
   empty state for that case rather than a gap — see projectsPage.empty.

   To add one: copy the shape below, give it a real slug, and it appears in
   the archive and gets its own case-study page automatically.
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

export const projectsPage = {
  eyebrow: "Archive",
  headline: "Everything the club has shipped.",
  title: ["Everything the club", "has shipped."],
  standfirst:
    "Each entry is a real deployment with a real URL. The write-up covers what got cut, what the security review found, and what it took to clear it.",
  /* The designed empty state. Shown until the first project lands. */
  empty: {
    index: "00",
    label: "Awaiting first cycle",
    headline: "The first projects land in October.",
    body: "Hackathon 01 runs September 23 to October 23. Every project that clears its security review is written up here, with the live URL, the stack, and what the scan found.",
    cta: { label: "See the format", href: "/hackathons" },
  },
};
