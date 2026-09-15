/* ==========================================================================
   The club mark as a dark object with a light behind it.

   The ship is filled near-black, so it is read by its edge rather than its
   face. The light sits up and to the right: a radial spill on the ground
   behind the mark, and a rim along the edges that face it.

   The rim is built from strokes, not blur or shadow (CLAUDE.md §1): the
   outline stroked four times at falling opacity and rising width, painted
   with a gradient that fades out away from the light. The strokes are
   clipped to the inside of the shapes, so the light wraps just inside the
   edge the way a rim light does; one wide, faint stroke masked to the
   OUTSIDE is the glow the light casts past the edge. Stacked, the steps
   read as a soft falloff at any size, with no filter to paint.

   The ship is four disjoint shapes, so each one catches its own rim — which
   is what a real light would do to a mast standing clear of a sail.

   The paths are the favicon's (app/icon.svg), imported from the Wordmark so
   there is one copy. The whole drawing is decorative.
   ========================================================================== */

import { SHIP_PARTS } from "@/components/brand/Wordmark";

/** Every shape in one `d`, for the fills, clips and masks that want the lot. */
const SHIP = SHIP_PARTS.join(" ");

/** Rim steps, inside the edge: [stroke width, opacity]. Widths are doubled by clipping. */
const RIM: [number, number][] = [
  [7, 0.06],
  [3.6, 0.14],
  [1.8, 0.36],
  [0.8, 0.95],
];

const MARIGOLD = { stopColor: "var(--color-marigold)" };
const MARIGOLD_HI = { stopColor: "var(--color-marigold-hi)" };

export function RimMonogram({ className = "" }: { className?: string }) {
  return (
    // Cropped to the mark, which spans x 6-58, y 8-57. The spill is a circle
    // that fades to nothing at its own radius, and the SVG does not clip, so
    // the light runs out into the frame with no edge.
    <svg
      aria-hidden
      viewBox="2 4 60 57"
      overflow="visible"
      className={`block h-auto w-full ${className}`}
    >
      <defs>
        {/* The spill on the ground behind the mark, strongest up and right. */}
        <radialGradient id="nf-spill">
          <stop offset="0" style={{ ...MARIGOLD, stopOpacity: 0.2 }} />
          <stop offset="0.45" style={{ ...MARIGOLD, stopOpacity: 0.06 }} />
          <stop offset="1" style={{ ...MARIGOLD, stopOpacity: 0 }} />
        </radialGradient>
        {/* The face: a panel step lit from the top right, falling to black. */}
        <linearGradient id="nf-face" x1="0.9" y1="0" x2="0.15" y2="1">
          <stop offset="0" style={{ stopColor: "var(--color-surface-700)" }} />
          <stop offset="0.55" style={{ stopColor: "var(--color-surface-900)" }} />
          <stop offset="1" style={{ stopColor: "var(--color-ink)" }} />
        </linearGradient>
        {/* The rim's paint: full at the lit corner, gone by the far one. */}
        <linearGradient id="nf-rim" x1="1" y1="0" x2="0.1" y2="0.9">
          <stop offset="0" style={{ ...MARIGOLD_HI, stopOpacity: 1 }} />
          <stop offset="0.4" style={{ ...MARIGOLD, stopOpacity: 0.85 }} />
          <stop offset="0.75" style={{ ...MARIGOLD, stopOpacity: 0.12 }} />
          <stop offset="1" style={{ ...MARIGOLD, stopOpacity: 0 }} />
        </linearGradient>
        <clipPath id="nf-inside">
          <path d={SHIP} />
        </clipPath>
        <mask id="nf-outside" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <rect width="64" height="64" fill="white" />
          <path d={SHIP} fill="black" />
        </mask>
      </defs>

      <circle cx="40" cy="26" r="34" fill="url(#nf-spill)" />

      <path d={SHIP} fill="url(#nf-face)" />

      <g fill="none" stroke="url(#nf-rim)" strokeLinejoin="round">
        <path d={SHIP} strokeWidth="3" opacity="0.1" mask="url(#nf-outside)" />
        <g clipPath="url(#nf-inside)">
          {RIM.map(([width, opacity]) => (
            <path key={width} d={SHIP} strokeWidth={width} opacity={opacity} />
          ))}
        </g>
      </g>

    </svg>
  );
}
