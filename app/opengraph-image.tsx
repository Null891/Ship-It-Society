import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { club, format, hero, meetingLine } from "@/content/club";
import { OG_IMAGE } from "@/lib/metadata";

/* ==========================================================================
   The social card, 1200 × 630.

   The dark system in one frame: a void-black ground, a faint hairline grid,
   viewfinder corner brackets, the hero headline set large and light, and
   one marigold block — the wordmark's full stop. Every word on it comes from
   content/club.ts, so the card cannot drift from the site the way the old
   one did (it still said "two-week hackathons" long after the format moved
   to one month).

   The format rule along the bottom is a scale, not a meter: thirty ticks for
   the thirty days, cut into the four weeks exactly where content's `format`
   puts the boundaries, and the last tick — demo day — in marigold.

   Type: Geist Light and Geist Mono, read from the geist package (SIL OFL).
   next/og needs the font binary at render time, and Switzer's licence keeps
   it on the Fontshare CDN, so the card uses Geist rather than a lookalike.
   The image is rendered once at build and cached; these reads never run
   per request.
   ========================================================================== */

export const size = { width: OG_IMAGE.width, height: OG_IMAGE.height };
export const contentType = OG_IMAGE.type;
export const alt = OG_IMAGE.alt;

const FONTS = join(process.cwd(), "node_modules", "geist", "dist", "fonts");

/* Colours mirror the @theme tokens in app/globals.css. next/og renders
   outside the stylesheet, so it cannot read the custom properties. */
const INK = "#000000";
const FG = "#f2f2f3";
const MUTED = "#a1a1a7";
const SUBTLE = "#8b8b92";
const MARIGOLD = "#ff9f0a";
const LINE = "rgba(255,255,255,0.12)";
const LINE_FAINT = "rgba(255,255,255,0.05)";
const LINE_STRONG = "rgba(255,255,255,0.28)";

const W = size.width;
const H = size.height;
const PAD = 72;
const GRID = 60;

/** The last day number in a week's final entry: "Day 28-29" -> 29. */
function lastDay(week: (typeof format.weeks)[number]): number {
  const label = week.days[week.days.length - 1].day;
  const m = /(\d+)\s*$/.exec(label);
  if (!m) throw new Error(`opengraph-image: cannot read a day number from "${label}"`);
  return Number(m[1]);
}

const WEEK_ENDS = format.weeks.map(lastDay);
const DAYS = WEEK_ENDS[WEEK_ENDS.length - 1];

function Bracket({ x, y, flipX, flipY }: { x: number; y: number; flipX?: boolean; flipY?: boolean }) {
  const arm = 30;
  return (
    <div
      style={{
        position: "absolute",
        left: flipX ? x - arm : x,
        top: flipY ? y - arm : y,
        width: arm,
        height: arm,
        borderColor: LINE_STRONG,
        borderStyle: "solid",
        borderWidth: 0,
        borderLeftWidth: flipX ? 0 : 2,
        borderRightWidth: flipX ? 2 : 0,
        borderTopWidth: flipY ? 0 : 2,
        borderBottomWidth: flipY ? 2 : 0,
      }}
    />
  );
}

export default async function OpengraphImage() {
  const [light, mono] = await Promise.all([
    readFile(join(FONTS, "geist-sans", "Geist-Light.ttf")),
    readFile(join(FONTS, "geist-mono", "GeistMono-Regular.ttf")),
  ]);

  const ruleWidth = W - PAD * 2;
  const pitch = ruleWidth / (DAYS - 1);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: INK,
          color: FG,
          fontFamily: "Geist",
        }}
      >
        {/* Hairline grid. */}
        {Array.from({ length: Math.floor(W / GRID) }, (_, i) => (
          <div
            key={`v${i}`}
            style={{ position: "absolute", left: (i + 1) * GRID, top: 0, width: 1, height: H, background: LINE_FAINT }}
          />
        ))}
        {Array.from({ length: Math.floor(H / GRID) }, (_, i) => (
          <div
            key={`h${i}`}
            style={{ position: "absolute", top: (i + 1) * GRID, left: 0, height: 1, width: W, background: LINE_FAINT }}
          />
        ))}

        {/* Viewfinder brackets. */}
        <Bracket x={36} y={36} />
        <Bracket x={W - 36} y={36} flipX />
        <Bracket x={36} y={H - 36} flipY />
        <Bracket x={W - 36} y={H - 36} flipX flipY />

        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            padding: `${PAD - 8}px ${PAD}px ${PAD - 12}px`,
          }}
        >
          {/* Masthead: the wordmark, and where the club is. */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 30, letterSpacing: "-0.02em" }}>{club.name}</span>
              <span style={{ width: 17, height: 17, marginLeft: 11, marginTop: 5, background: MARIGOLD }} />
            </div>
            <span
              style={{
                fontFamily: "Geist Mono",
                fontSize: 16,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: MUTED,
              }}
            >
              {`${club.school} // ${club.location}`}
            </span>
          </div>

          {/* The headline, large and light. */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: 74 }}>
            {hero.headline.map((line) => (
              <span
                key={line}
                style={{ fontSize: 112, lineHeight: 1.0, letterSpacing: "-0.045em", marginLeft: -6 }}
              >
                {line}
              </span>
            ))}
          </div>

          {/* The format as a scale: 30 days, four weeks. */}
          <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
            <div style={{ display: "flex", position: "relative", height: 22, width: ruleWidth }}>
              <div style={{ position: "absolute", left: 0, bottom: 0, width: ruleWidth, height: 1, background: LINE }} />
              {Array.from({ length: DAYS }, (_, i) => {
                const day = i + 1;
                const boundary = day === 1 || WEEK_ENDS.includes(day);
                const demo = day === DAYS;
                return (
                  <div
                    key={day}
                    style={{
                      position: "absolute",
                      left: Math.round(i * pitch) - (demo ? 2 : 0),
                      bottom: 0,
                      width: demo ? 4 : 2,
                      height: boundary ? 22 : 10,
                      background: demo ? MARIGOLD : boundary ? FG : LINE_STRONG,
                    }}
                  />
                );
              })}
            </div>
            <div style={{ display: "flex", position: "relative", height: 24, width: ruleWidth, marginTop: 12 }}>
              {format.weeks.map((week, k) => {
                const startDay = k === 0 ? 1 : WEEK_ENDS[k - 1] + 1;
                return (
                  <span
                    key={week.id}
                    style={{
                      position: "absolute",
                      left: Math.round((startDay - 1) * pitch) + (k === 0 ? 0 : 8),
                      fontFamily: "Geist Mono",
                      fontSize: 15,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: SUBTLE,
                    }}
                  >
                    {`${week.label.replace(/^Week\s*/i, "W")} ${week.title}`}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Footer readout: when the club meets. */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 22,
              paddingTop: 18,
              borderTop: `1px solid ${LINE}`,
              fontFamily: "Geist Mono",
              fontSize: 16,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            <span style={{ color: MUTED }}>{`Meets ${meetingLine}`}</span>
            <span style={{ color: FG }}>{`${DAYS} days · idea to shipped`}</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: light, weight: 300, style: "normal" },
        { name: "Geist Mono", data: mono, weight: 400, style: "normal" },
      ],
    },
  );
}
