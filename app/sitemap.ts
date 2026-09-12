import type { MetadataRoute } from "next";
import { siteUpdated } from "@/content/club";
import { projects } from "@/content/projects";
import { absoluteUrl } from "@/lib/site";

/* ==========================================================================
   /sitemap.xml

   `lastModified` is a date typed in content (`siteUpdated`, and each
   project's `published`), never the time of the build or the request. A
   date that moves on every deploy tells a crawler that everything changed
   when nothing did, and crawlers learn to ignore it.

   Listed: every public page. Left out:
     /projects and its case studies, while the archive is empty. An empty
       archive is a designed status panel for visitors, not a page worth
       indexing. They join the sitemap with the first project.
     /team, which redirects to /about. A sitemap lists final URLs only.
     /api/*, which robots.txt disallows.
   ========================================================================== */

const PAGES: { path: string; priority: number }[] = [
  { path: "/", priority: 1 },
  { path: "/hackathons", priority: 0.8 },
  { path: "/join", priority: 0.8 },
  { path: "/handbook", priority: 0.7 },
  { path: "/about", priority: 0.7 },
  { path: "/sponsors", priority: 0.6 },
  { path: "/get-involved", priority: 0.6 },
];

/** Home prints without a trailing slash, matching its canonical link. */
const url = (path: string) => (path === "/" ? absoluteUrl("/").replace(/\/$/, "") : absoluteUrl(path));

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = PAGES.map(({ path, priority }) => ({
    url: url(path),
    lastModified: siteUpdated,
    changeFrequency: "monthly",
    priority,
  }));

  if (projects.length === 0) return pages;

  const newest = projects.map((p) => p.published).sort().at(-1) ?? siteUpdated;
  return [
    ...pages,
    {
      url: url("/projects"),
      lastModified: newest > siteUpdated ? newest : siteUpdated,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...projects.map((p) => ({
      url: url(`/projects/${p.slug}`),
      lastModified: p.published,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
  ];
}
