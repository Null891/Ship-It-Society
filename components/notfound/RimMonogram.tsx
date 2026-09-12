/* ==========================================================================
   The club mark as a dark object with a light behind it.

   The S is filled near-black, so it is read by its edge rather than its
   face. The light sits up and to the right: a radial spill on the ground
   behind the mark, and a rim along the edges that face it.

   The rim is built from strokes, not blur or shadow (CLAUDE.md §1): the S
   outline stroked four times at falling opacity and rising width, painted
   with a gradient that fades out away from the light. The strokes are
   clipped to the inside of the letter, so the light wraps just inside the
   edge the way a rim light does; one wide, faint stroke masked to the
   OUTSIDE is the glow the light casts past the edge. Stacked, the steps
   read as a soft falloff at any size, with no filter to paint.

   The path and the marigold square are the favicon's (app/icon.svg). The
   whole drawing is decorative.
   ========================================================================== */

/** The S from app/icon.svg, in its 64-unit box. */
const S =
  "M12.95 23.35c0-4.49 3.88-7.6 10.23-7.6 5.27 0 9.3 2.02 11.78 5.58l-6.35 4.19c-1.39-1.86-3.26-2.79-5.42-2.79-2.17 0-3.41.78-3.41 2.02 0 1.4 1.4 2.02 5.27 3.1l2.48.62c6.82 1.86 10.23 4.96 10.23 10.39 0 5.43-4.65 9.15-11.47 9.15-6.2 0-10.85-2.48-13.33-6.82l6.51-4.03c1.55 2.48 3.88 3.72 6.82 3.72 2.33 0 3.72-.77 3.72-2.17 0-1.39-1.08-2.01-4.81-3.1l-2.63-.77c-6.66-1.86-9.61-4.96-9.61-11.47Z";

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
    // Cropped to the mark (the S and its square span x 13-48, y 16-48). The
    // spill is a circle that fades to nothing at its own radius, and the SVG
    // does not clip, so the light runs out into the frame with no edge.
    <svg
      aria-hidden
      viewBox="7 9 48 46"
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
          <path d={S} />
        </clipPath>
        <mask id="nf-outside" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <rect width="64" height="64" fill="white" />
          <path d={S} fill="black" />
        </mask>
      </defs>

      <circle cx="37" cy="28" r="30" fill="url(#nf-spill)" />

      <path d={S} fill="url(#nf-face)" />

      <g fill="none" stroke="url(#nf-rim)" strokeLinejoin="round">
        <path d={S} strokeWidth="3" opacity="0.1" mask="url(#nf-outside)" />
        <g clipPath="url(#nf-inside)">
          {RIM.map(([width, opacity]) => (
            <path key={width} d={S} strokeWidth={width} opacity={opacity} />
          ))}
        </g>
      </g>

      {/* The full stop: the one lit surface. */}
      <rect x="40" y="40" width="8" height="8" fill="var(--color-marigold)" />
    </svg>
  );
}
