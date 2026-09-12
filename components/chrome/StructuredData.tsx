import { club, faq, hackathonsPage, meeting, season } from "@/content/club";
import { OG_IMAGE } from "@/lib/metadata";
import { deadlineAt, kickoffAt, zonedParts, zoneOffsetMinutes } from "@/lib/schedule";
import { SITE_URL, absoluteUrl } from "@/lib/site";

/* ==========================================================================
   JSON-LD — schema.org facts about the club, read from content/club.ts.

   StructuredData (every page, from the root layout)
     EducationalOrganization  the club, with its school as parentOrganization
     WebSite                  the site, published by the club
     Event                    one per `season` entry

   FaqStructuredData (the page that shows the FAQ)
     FAQPage                  every question and answer in `faq.items`

   The FAQ is separate because FAQPage markup belongs only on a page where
   the questions are visible; declaring it site-wide would describe pages
   that do not show it.

   Nothing here reads the clock, so the markup is identical at build time and
   on every revalidation. Every season entry is listed, with its real window:
   the window opens at 00:00 and closes at 23:59 local time, as defined in
   lib/schedule.ts, and each offset is looked up through the time zone rather
   than copied, so a window that crosses the November DST change carries
   -07:00 at the start and -08:00 at the end.
   ========================================================================== */

const ORG_ID = `${SITE_URL}/#org`;
const SITE_ID = `${SITE_URL}/#site`;

const pad = (n: number) => String(n).padStart(2, "0");

/** An instant as local ISO 8601 with its offset: "2026-10-28T00:00:00-07:00". */
function localIso(at: Date): string {
  const p = zonedParts(at);
  const offset = zoneOffsetMinutes(at);
  const sign = offset < 0 ? "-" : "+";
  const abs = Math.abs(offset);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}:${pad(p.second)}${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

const postalAddress = {
  "@type": "PostalAddress",
  addressLocality: club.address.locality,
  addressRegion: club.address.region,
  addressCountry: club.address.country,
};

const sameAs = [club.discord, club.github, club.instagram].filter(Boolean);

const organization = {
  "@type": "EducationalOrganization",
  "@id": ORG_ID,
  name: club.name,
  alternateName: club.shortName,
  url: absoluteUrl("/"),
  email: club.email,
  description: club.bio,
  logo: absoluteUrl("/icon.svg"),
  ...(sameAs.length ? { sameAs } : {}),
  parentOrganization: {
    "@type": "HighSchool",
    name: club.school,
    address: postalAddress,
  },
};

const website = {
  "@type": "WebSite",
  "@id": SITE_ID,
  url: absoluteUrl("/"),
  name: club.name,
  description: club.bio,
  inLanguage: "en-US",
  publisher: { "@id": ORG_ID },
};

const place = {
  "@type": "Place",
  name: meeting.room ? `Room ${meeting.room}, ${club.school}` : club.school,
  address: postalAddress,
};

const events = season.map((entry) => ({
  "@type": "Event",
  name: `${club.name} ${entry.name}`,
  description: hackathonsPage.eventDescription,
  url: absoluteUrl("/hackathons"),
  image: absoluteUrl(OG_IMAGE.url),
  startDate: localIso(kickoffAt(entry)),
  endDate: localIso(deadlineAt(entry)),
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: place,
  organizer: { "@id": ORG_ID },
  isAccessibleForFree: true,
}));

const faqPage = {
  "@type": "FAQPage",
  "@id": `${SITE_URL}/#faq`,
  mainEntity: faq.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

/** Serialise for a script tag. "<" is escaped so no string can close it. */
const serialise = (graph: Record<string, unknown>[]) =>
  JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");

const SITE_JSON = serialise([organization, website, ...events]);
const FAQ_JSON = serialise([faqPage]);

export function StructuredData() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: SITE_JSON }} />;
}

export function FaqStructuredData() {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: FAQ_JSON }} />;
}
