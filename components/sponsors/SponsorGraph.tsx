import { sponsors } from "@/content/sponsors";
import { club } from "@/content/club";
import { r3 } from "@/lib/geometry";

/* ==========================================================================
   Who funds what, drawn as a graph.

   The club sits at the left; an edge runs to each sponsor. Edges draw
   themselves in when the section is revealed, and hovering a node lifts its
   own edge. Pure CSS and SVG — no JavaScript, nothing to hydrate.

   It is decoration over a real list: the same sponsors, roles and
   contributions are set as text immediately below, so the graph is
   aria-hidden and nothing here is the only copy of anything.
   ========================================================================== */

const W = 860;
const H = 420;
const HUB = { x: 132, y: H / 2 };
const NODE_X = 540;

export function SponsorGraph({ className = "" }: { className?: string }) {
  const rows = sponsors.map((s, i) => {
    const y = r3(((i + 1) / (sponsors.length + 1)) * H);
    // A cubic that leaves the hub horizontally and arrives horizontally.
    const d = `M${HUB.x + 46} ${HUB.y} C ${HUB.x + 200} ${HUB.y}, ${NODE_X - 190} ${y}, ${NODE_X} ${y}`;
    return { ...s, y, d, i };
  });

  return (
    <div className={className} aria-hidden>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" fill="none">
        {/* Construction lines, as on a schematic. */}
        <g stroke="var(--stage-line)" strokeWidth="1">
          <path d={`M0 ${H / 2} H${W}`} opacity="0.5" />
          <path d={`M${NODE_X} 0 V${H}`} opacity="0.35" />
        </g>

        {rows.map((s) => (
          <g key={s.name} className="group/node">
            <path
              d={s.d}
              className="draw-path"
              pathLength={1}
              stroke="var(--color-paper)"
              strokeWidth="1"
              opacity="0.34"
              style={{ ["--draw-i" as string]: s.i }}
            />
            {/* The lit copy, revealed on hover of this node. */}
            <path
              d={s.d}
              stroke="var(--color-marigold)"
              strokeWidth="1.4"
              opacity="0"
              className="transition-opacity duration-[var(--dur-base)] group-hover/node:opacity-100"
            />
            <circle cx={NODE_X} cy={s.y} r="4" fill="var(--color-marigold)" />
            <rect
              x={NODE_X + 22}
              y={s.y - 27}
              width={W - NODE_X - 46}
              height="54"
              fill="var(--color-surface-900)"
              stroke="var(--stage-line-strong)"
              strokeWidth="1"
              className="transition-[stroke] duration-[var(--dur-base)] group-hover/node:stroke-marigold"
            />
            <text
              x={NODE_X + 40}
              y={s.y - 4}
              fill="var(--color-fg)"
              fontSize="19"
              style={{ fontFamily: "var(--font-sans)", fontWeight: 400 }}
            >
              {s.name}
            </text>
            <text
              x={NODE_X + 40}
              y={s.y + 16}
              className="font-mono"
              fill="var(--color-muted)"
              fontSize="11"
              style={{ letterSpacing: "0.09em" }}
            >
              {(s.tier === "founding" ? "FOUNDING" : "SUPPORTING").padEnd(11, " ")}
            </text>
          </g>
        ))}

        {/* The hub. */}
        <circle cx={HUB.x} cy={HUB.y} r="46" fill="var(--color-marigold)" />
        <circle cx={HUB.x} cy={HUB.y} r="60" stroke="var(--stage-line-strong)" strokeWidth="1" />
        <text
          x={HUB.x}
          y={HUB.y - 4}
          textAnchor="middle"
          fill="var(--color-ink)"
          fontSize="15"
          style={{ fontFamily: "var(--font-sans)", fontWeight: 500 }}
        >
          {club.shortName}
        </text>
        <text
          x={HUB.x}
          y={HUB.y + 14}
          textAnchor="middle"
          className="font-mono"
          fill="var(--color-ink)"
          fontSize="10"
          opacity="0.72"
          style={{ letterSpacing: "0.1em" }}
        >
          {sponsors.length} SPONSORS
        </text>
      </svg>
    </div>
  );
}
