import type { MetadataRoute } from "next";

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://shipitsociety.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // The application endpoint has nothing to index and should not be crawled.
      disallow: "/api/",
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
