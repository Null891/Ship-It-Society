import { ImageResponse } from "next/og";
import { club, hero } from "@/content/club";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${club.name} — ${club.school}`;

/* The social card. Built with system type rather than Switzer: next/og needs
   the font binary at request time, and the Fontshare licence keeps us on
   their CDN. The composition carries the brand, not the typeface. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000000",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              fontSize: 30,
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: "-0.03em",
            }}
          >
            Ship It Society
          </span>
          <span style={{ width: 18, height: 18, background: "#ff9f0a" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span
            style={{
              fontSize: 92,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.045em",
              lineHeight: 1.02,
            }}
          >
            {hero.headline[0]}
          </span>
          <span
            style={{
              fontSize: 92,
              fontWeight: 700,
              color: "#ffffff",
              letterSpacing: "-0.045em",
              lineHeight: 1.02,
            }}
          >
            {hero.headline[1]}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.16)",
            paddingTop: 28,
          }}
        >
          <span
            style={{
              fontSize: 22,
              color: "#86868b",
              letterSpacing: "0.09em",
              textTransform: "uppercase",
            }}
          >
            {club.school}
          </span>
          <span
            style={{
              fontSize: 22,
              color: "#ff9f0a",
              letterSpacing: "0.09em",
              textTransform: "uppercase",
            }}
          >
            One-month hackathons
          </span>
        </div>
      </div>
    ),
    size,
  );
}
