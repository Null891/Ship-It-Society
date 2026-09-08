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
      <path
        d="M23.4 21.6c0-2.9 2.5-4.9 6.6-4.9 3.4 0 6 1.3 7.6 3.6l-4.1 2.7c-.9-1.2-2.1-1.8-3.5-1.8-1.4 0-2.2.5-2.2 1.3 0 .9.9 1.3 3.4 2l1.6.4c4.4 1.2 6.6 3.2 6.6 6.7 0 3.5-3 5.9-7.4 5.9-4 0-7-1.6-8.6-4.4l4.2-2.6c1 1.6 2.5 2.4 4.4 2.4 1.5 0 2.4-.5 2.4-1.4 0-.9-.7-1.3-3.1-2l-1.7-.5c-4.3-1.2-6.2-3.2-6.2-7.4Z"
        fill="#ffffff"
      />
      <rect x="41" y="32.4" width="5.4" height="5.4" fill="#ff9f0a" />
    </svg>
  );
}
