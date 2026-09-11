import type { Metadata } from "next";
import { club, hackathonsPage, hero, join } from "@/content/club";
import { projects, projectsPage } from "@/content/projects";
import { sponsorPage } from "@/content/sponsors";
import { SITE_URL } from "@/lib/site";

/* ==========================================================================
   Per-page metadata — one shape for every route.

   Next merges metadata SHALLOWLY: a page that sets `openGraph` replaces the
   layout's whole `openGraph` object rather than extending it. Pages that set
   only a title therefore used to share the home page's og:url and og:title,
   and none of them had a canonical URL. `pageMetadata` builds the full set
   from the three things that actually differ per page.

   Paths are relative. They resolve against `metadataBase`, which comes from
   lib/site.ts (here and in the root layout), so a canonical URL can only
   ever point at the one origin the site is served from.

   Two things Next does NOT carry down once a page sets its own `openGraph`,
   both measured on this site:
     - the social image. app/opengraph-image.tsx is file-based metadata on
       the root segment, so only "/" picked it up; every other page shared
       with no image at all. It is referenced explicitly below.
     - the title template. og:title and twitter:title printed the bare
       "Hackathons" while <title> printed "Hackathons — Ship It Society".
       The share title is composed here in the layout's format.

   Titles and descriptions are copy, so they live in content/*.ts as each
   page's `meta`. The page files import one ready-made object from here and
   never restate a word of it.
   ========================================================================== */

/** The social card, rendered by app/opengraph-image.tsx from these values. */
export const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${club.name}. ${hero.headline.join(" ")} A hackathon club at ${club.school}.`,
  type: "image/png",
};

/** The full share title: "Page — Club", as the layout's title template prints it. */
export const shareTitle = (title: string) => `${title} — ${club.name}`;

export function pageMetadata({
  path,
  title,
  description,
  absoluteTitle = false,
}: {
  /** The route, starting with "/". */
  path: string;
  /** The page's own title. The layout's template appends the club name. */
  title: string;
  description: string;
  /** Use `title` as-is, skipping the template. For the home page. */
  absoluteTitle?: boolean;
}): Metadata {
  const share = absoluteTitle ? title : shareTitle(title);
  return {
    metadataBase: new URL(SITE_URL),
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      url: path,
      title: share,
      description,
      siteName: club.name,
      type: "website",
      locale: "en_US",
      images: [OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: share,
      description,
      images: [{ url: OG_IMAGE.url, alt: OG_IMAGE.alt }],
    },
  };
}

/** Metadata for each static route this module covers. */
export const routeMetadata = {
  home: pageMetadata({
    path: "/",
    title: `${club.name} — ${club.school}`,
    description: hero.standfirst,
    absoluteTitle: true,
  }),
  hackathons: pageMetadata({ path: "/hackathons", ...hackathonsPage.meta }),
  projects: pageMetadata({ path: "/projects", ...projectsPage.meta }),
  sponsors: pageMetadata({ path: "/sponsors", ...sponsorPage.meta }),
  join: pageMetadata({ path: "/join", ...join.meta }),
} satisfies Record<string, Metadata>;

/** A case study's metadata, or a no-index stub for a slug that does not exist. */
export function projectMetadata(slug: string): Metadata {
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Project not found", robots: { index: false } };
  return pageMetadata({
    path: `/projects/${project.slug}`,
    title: project.title,
    description: project.tagline,
  });
}
