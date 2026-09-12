import { club, meeting, prizes, season } from "@/content/club";
import {
  MEETING_CADENCE_DAYS,
  ZONE,
  ZONE_LABEL,
  addDays,
  cycleLength,
  deadlineAt,
  meetingsFrom,
  ordered,
  seasonBounds,
  shortDate,
  wallClock,
  type MeetingSource,
} from "@/lib/schedule";
import { SITE_URL, absoluteUrl } from "@/lib/site";

/* ==========================================================================
   /calendar.ics — the season as an iCalendar file (RFC 5545).

   Every hackathon contributes two events: its kickoff, as an all-day event
   on the start date (the window opens at 00:00), and its deadline, at 23:59
   Pacific. Then the next eight meetings, projected from the anchor exactly
   as the home countdown does and never past the season's final deadline.

   Times are written in UTC ("Z"), which every client converts to local
   time without needing a VTIMEZONE block. Meetings and deadlines carry no
   end time: the content does not state one, and a guessed duration would be
   a fact nobody wrote down.

   UIDs are derived from the cycle name, or the meeting's local date, and
   the site host, so re-importing or refreshing a subscription updates
   events in place instead of duplicating them.

   Regenerated every six hours, like the pages, so "the next eight" moves
   forward without a redeploy.
   ========================================================================== */

export const revalidate = 21600;

const CRLF = "\r\n";
const MEETINGS = 8;
const encoder = new TextEncoder();

/** TEXT escaping: backslash, semicolon, comma and newlines. */
function text(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Fold a content line to at most 75 octets per physical line. Continuation
 * lines begin with one space, which counts toward their 75. Splits between
 * code points, never inside a multi-byte UTF-8 sequence.
 */
function fold(line: string): string {
  const parts: string[] = [];
  let current = "";
  let octets = 0;
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    if (octets + size > 75) {
      parts.push(current);
      current = ` ${ch}`;
      octets = 1 + size;
    } else {
      current += ch;
      octets += size;
    }
  }
  parts.push(current);
  return parts.join(CRLF);
}

/** 2026-09-23T19:15:00.000Z -> 20260923T191500Z */
const utc = (at: Date) => at.toISOString().replace(/\.\d{3}Z$/, "Z").replace(/[-:]/g, "");
/** 2026-09-23 -> 20260923 */
const dateValue = (date: string) => date.replace(/-/g, "");
const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export function GET() {
  const now = new Date();
  const host = new URL(SITE_URL).hostname;
  const stamp = utc(now);
  const page = absoluteUrl("/hackathons");
  const cycles = ordered(season);

  const events: string[][] = [];

  for (const entry of cycles) {
    const id = slug(entry.name);
    const close = deadlineAt(entry);
    const closeTime = `${wallClock(close).time} ${ZONE_LABEL}`;

    events.push([
      `UID:${id}-kickoff@${host}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${dateValue(entry.start)}`,
      `DTEND;VALUE=DATE:${dateValue(addDays(entry.start, 1))}`,
      `SUMMARY:${text(`${entry.name} kicks off`)}`,
      `DESCRIPTION:${text(
        `Day 1 of ${cycleLength(entry)}. The window runs ${shortDate(entry.start)} to ${shortDate(entry.end)}, and submissions close at ${closeTime} on ${shortDate(entry.end)}.`,
      )}`,
      `URL:${page}`,
      "TRANSP:TRANSPARENT",
    ]);

    events.push([
      `UID:${id}-deadline@${host}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${utc(close)}`,
      `SUMMARY:${text(`${entry.name} closes`)}`,
      `DESCRIPTION:${text(`Submissions close at ${closeTime}. ${prizes.rules[1]}`)}`,
      `URL:${page}`,
      "TRANSP:TRANSPARENT",
    ]);
  }

  const source: MeetingSource = meeting;
  const bounds = seasonBounds(cycles);
  const location = [meeting.room && `Room ${meeting.room}`, club.school].filter(Boolean).join(", ");
  for (const at of meetingsFrom(now, source.nextMeeting, MEETINGS, MEETING_CADENCE_DAYS, {
    skip: source.skip,
    until: bounds?.end ?? null,
  })) {
    events.push([
      `UID:meeting-${dateValue(wallClock(at).date)}@${host}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${utc(at)}`,
      `SUMMARY:${text(`${club.name} meeting`)}`,
      `LOCATION:${text(location)}`,
      `DESCRIPTION:${text(`${meeting.cadence}. ${meeting.time}.`)}`,
      `URL:${page}`,
    ]);
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${text(club.name)}//Season calendar//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `NAME:${text(club.name)}`,
    `X-WR-CALNAME:${text(club.name)}`,
    `X-WR-CALDESC:${text(`Hackathon windows and meetings, ${club.school}.`)}`,
    `X-WR-TIMEZONE:${ZONE}`,
    "REFRESH-INTERVAL;VALUE=DURATION:PT6H",
    "X-PUBLISHED-TTL:PT6H",
    ...events.flatMap((event) => ["BEGIN:VEVENT", ...event, "END:VEVENT"]),
    "END:VCALENDAR",
  ];

  const body = lines.map(fold).join(CRLF) + CRLF;

  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${slug(club.name)}.ics"`,
    },
  });
}
