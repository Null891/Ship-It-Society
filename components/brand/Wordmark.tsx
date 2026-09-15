/* ==========================================================================
   The wordmark.

   Type plus one shape. The marigold block stands in for a full stop — a
   cursor, and the only piece of colour in the mark. It is a fill rather than
   coloured text, so it stays legal on light surfaces (see the marigold rule
   in CLAUDE.md).
   ========================================================================== */

export function Wordmark({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-baseline gap-[0.34em] font-semibold tracking-[-0.03em] ${className}`}
    >
      <span>
        Ship It
        {!compact && <span className="hidden sm:inline"> Society</span>}
      </span>
      <span
        aria-hidden
        className="inline-block h-[0.62em] w-[0.62em] shrink-0 translate-y-[0.01em] bg-marigold"
      />
    </span>
  );
}

/* ==========================================================================
   The small mark.

   The club's identity is the crest (components/brand/Crest.tsx): a navy and
   gold seal with a square-rigged ship carrying `</>` on its mainsail. A crest
   with two rings of text is illegible below about 96px, so it cannot be the
   favicon — this is the ship on its own, in the site's palette, drawn as four
   flat shapes with no stroke so it survives a 16px browser tab.

   Same ship, same idea, different register. Keep the paths in sync with
   app/icon.svg, which is the same drawing.
   ========================================================================== */

/** The ship, as four disjoint shapes: mast, mainsail, foresail, hull. */
export const SHIP_PARTS = [
  "M30.5 8h3.5v34h-3.5z",
  "M36 14l17 6-1 21H36z",
  "M28.5 20L14 27l1 14h13.5z",
  "M6 45h52l-8 12H14z",
];

/** Square mark for the favicon, the OG card, and empty portrait tiles. */
export function Monogram({
  size = 40,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      role="img"
      aria-label="Ship It Society"
    >
      <rect width="64" height="64" fill="#000000" />
      <g fill="#ff9f0a">
        {SHIP_PARTS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
