import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ship-it-society.vercel.app";

/* `lastmod` has to be a real freshness signal. Previously this called
   new Date() per request, which told crawlers the whole site changed on
   every fetch — worthless as a signal. force-static prerenders the sitemap
   once, so BUILD_DATE is frozen at build time, and case studies carry their
   own publish date from content/projects.ts. */
export const dynamic = "force-static";

const BUILD_DATE = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/hackathons",
    "/projects",
    "/team",
    "/sponsors",
    "/join",
  ].map((path) => ({
    url: `${SITE}${path}`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : path === "/join" ? 0.9 : 0.7,
  }));

  const caseStudies = projects.map((p) => ({
    url: `${SITE}/projects/${p.slug}`,
    lastModified: new Date(p.published),
    changeFrequency: "yearly" as const,
    priority: 0.6,
  }));

  return [...routes, ...caseStudies];
}
