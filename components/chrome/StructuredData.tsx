import { club, hero, schedule } from "@/content/club";

/* ==========================================================================
   JSON-LD.

   Describes the club as an organisation and the next hackathon as an event,
   so search engines can show the meeting details directly rather than
   guessing them out of the prose. Rendered on the server; it never reaches
   the client bundle.
   ========================================================================== */

const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://shipitsociety.vercel.app";

/* Built once at module load rather than per render. Reading the clock during
   render makes a component impure; and because these pages are statically
   generated, "now" is build time either way. Rebuild to refresh the event. */
const GRAPH = buildGraph();

function buildGraph() {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": `${SITE}/#org`,
      name: club.name,
      description: hero.standfirst,
      url: SITE,
      memberOf: { "@type": "CollegeOrUniversity", name: club.school },
      areaServed: club.location,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE}/#site`,
      url: SITE,
      name: club.name,
      publisher: { "@id": `${SITE}/#org` },
      inLanguage: "en-US",
    },
  ];

  // Only advertise the hackathon while it is still ahead of us.
  if (new Date(schedule.nextHackathonDeadline).getTime() > Date.now()) {
    graph.push({
      "@type": "Event",
      name: `${club.name} — ${schedule.nextHackathonName}`,
      description:
        "A two-week hackathon: idea to deployed, security tested before launch.",
      startDate: schedule.nextMeeting,
      endDate: schedule.nextHackathonDeadline,
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: { "@type": "Place", name: club.school, address: club.location },
      organizer: { "@id": `${SITE}/#org` },
      isAccessibleForFree: true,
    });
  }
  return graph;
}

const JSON_LD = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": GRAPH,
});

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON_LD }}
    />
  );
}
