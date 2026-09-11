/* ==========================================================================
   The site's own address — one source.

   Three files used to carry their own fallback, and they disagreed: two fell
   back to a host that does not exist. Production sets NEXT_PUBLIC_SITE_URL;
   when the is-a.dev domain goes live, change it there and nowhere else.
   ========================================================================== */

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ship-it-society.vercel.app"
).replace(/\/+$/, "");

/** An absolute URL for a site path, e.g. absoluteUrl("/join"). */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
