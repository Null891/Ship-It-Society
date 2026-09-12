import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

/* /robots.txt. Everything is crawlable except the form endpoints, which
   accept POSTs only and have nothing to index. The sitemap address comes
   from lib/site.ts, so it follows NEXT_PUBLIC_SITE_URL to a custom domain. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
