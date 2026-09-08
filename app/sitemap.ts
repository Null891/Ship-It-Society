import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://shipitsociety.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const routes = ["", "/hackathons", "/projects", "/team", "/sponsors", "/join"].map(
    (path) => ({
      url: `${SITE}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : path === "/join" ? 0.9 : 0.7,
    }),
  );

  // Sample entries are placeholders; keep them out of the index.
  const caseStudies = projects
    .filter((p) => !p.sample)
    .map((p) => ({
      url: `${SITE}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.6,
    }));

  return [...routes, ...caseStudies];
}
