import type { MetadataRoute } from "next";
import { club, hero } from "@/content/club";

/* The web app manifest, served at /manifest.webmanifest.

   Every icon here is rendered from app/icon.svg, so the tab, the home
   screen and the install prompt all show the same mark. The colours match
   the viewport theme colour in app/layout.tsx: one black stage. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: club.name,
    short_name: club.shortName,
    description: hero.standfirst,
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
