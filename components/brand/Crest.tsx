import { club } from "@/content/club";

/* ==========================================================================
   The club crest.

   The club's formal mark: a navy and gold seal, a cream shield, and a
   square-rigged ship whose mainsail carries `</>` over a sea written in
   angle brackets. It is the identity the club uses on school paperwork,
   slides and merch, and it is drawn here as SVG rather than shipped as an
   image so it stays sharp at any size, weighs nothing, and needs no image
   host (see CLAUDE.md §7 and the audit note in app/globals.css).

   It keeps its own navy and gold. That is deliberate and is the ONE place on
   this site where a colour other than marigold carries brand meaning: the
   crest is a seal, not a UI element, and recolouring a seal to match a
   website is how you end up with two logos. The interface around it stays
   black and marigold.

   Not the favicon. Two rings of text turn to mush below about 96px, so the
   small mark is the ship on its own — see `Monogram` in Wordmark.tsx. Render
   this at 120px or larger; below that use the Monogram.

   `uid` namespaces the internal ids so two crests can share a page.
   ========================================================================== */

const NAVY = "var(--color-crest-navy)";
const GOLD = "var(--color-crest-gold)";
const GOLD_DEEP = "var(--color-crest-gold-deep)";
const CREAM = "var(--color-crest-cream)";

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "Consolas, 'Courier New', monospace";

/** Leaf: [cx, cy, rx, ry, rotation]. Mirrored for the other side of the stem. */
const LEAVES: [number, number, number, number, number][] = [
  [-8, -4, 8, 4, -30],
  [-9, -16, 8.5, 4.2, -22],
  [-8, -28, 8, 4, -14],
  [-6, -39, 6.8, 3.5, -6],
  [10, -9, 7.5, 3.8, 30],
  [10, -21, 7.5, 3.8, 22],
  [9, -33, 6.5, 3.4, 14],
];

export function Crest({
  size = 240,
  uid = "crest",
  className = "",
}: {
  size?: number;
  uid?: string;
  className?: string;
}) {
  const arcTop = `${uid}-arc-top`;
  const arcBottom = `${uid}-arc-bottom`;
  const laurel = `${uid}-laurel`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      className={className}
      role="img"
      aria-label={`${club.name} crest — ${club.school}, established 2026`}
    >
      <defs>
        {/* Top text grows outward from its baseline, so that baseline sits at
            the inner edge of the band; bottom text grows inward, so its
            baseline sits at the outer edge. Sweep 0 keeps the bottom text the
            right way up instead of mirrored. */}
        <path id={arcTop} d="M 256 256 m -192 0 a 192 192 0 0 1 384 0" fill="none" />
        <path id={arcBottom} d="M 256 256 m -226 0 a 226 226 0 0 0 452 0" fill="none" />

        <g id={laurel}>
          <path
            d="M0 4 Q 7 -20 3 -48"
            stroke={GOLD}
            strokeWidth="3.4"
            fill="none"
            strokeLinecap="round"
          />
          <g fill={GOLD}>
            {LEAVES.map(([cx, cy, rx, ry, rot]) => (
              <ellipse
                key={`${cx},${cy}`}
                cx={cx}
                cy={cy}
                rx={rx}
                ry={ry}
                transform={`rotate(${rot} ${cx} ${cy})`}
              />
            ))}
          </g>
        </g>
      </defs>

      {/* Rings */}
      <circle cx="256" cy="256" r="252" fill={NAVY} />
      <circle cx="256" cy="256" r="252" fill="none" stroke={GOLD} strokeWidth="9" />
      <circle cx="256" cy="256" r="236" fill="none" stroke={GOLD} strokeWidth="2.5" />
      <circle cx="256" cy="256" r="180" fill="none" stroke={GOLD} strokeWidth="5" />
      <circle cx="256" cy="256" r="172" fill="none" stroke={GOLD} strokeWidth="2" />

      <g fill={CREAM} fontFamily={SERIF} fontWeight="700">
        <text fontSize="41" letterSpacing="3.5">
          <textPath href={`#${arcTop}`} startOffset="50%" textAnchor="middle">
            {club.name.toUpperCase()}
          </textPath>
        </text>
        <text fontSize="31" letterSpacing="3">
          <textPath href={`#${arcBottom}`} startOffset="50%" textAnchor="middle">
            {club.school.toUpperCase()}
          </textPath>
        </text>
      </g>

      <g fill={GOLD} fontFamily={SERIF} fontWeight="700" fontSize="22" letterSpacing="1" textAnchor="middle">
        <text x="48" y="264">FHS</text>
        <text x="464" y="264">FHS</text>
      </g>

      <path
        d="M140 144 Q256 118 372 144 L372 330 Q372 386 256 418 Q140 386 140 330 Z"
        fill={CREAM}
        stroke={GOLD}
        strokeWidth="7"
      />

      {/* The ship: square-rigged, prow to the right, code on the mainsail. */}
      <g stroke={NAVY} fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M254 156 L254 286" />
        <path d="M257 156 L295 167 L257 178" fill={NAVY} strokeLinejoin="miter" />
        <rect x="240" y="184" width="29" height="17" />
        <path d="M263 209 L332 228 L324 272 L263 272 Z" />
        <path d="M245 215 L194 236 L198 272 L245 272 Z" />
        <path d="M176 286 L348 279 L320 316 Q250 328 202 314 Z" />
      </g>
      <text
        x="297"
        y="254"
        fontFamily={MONO}
        fontSize="26"
        fontWeight="700"
        fill={NAVY}
        textAnchor="middle"
      >
        &lt;/&gt;
      </text>

      {/* The sea, written in angle brackets. */}
      <g stroke={NAVY} fill="none" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M198 320 L186 332 L198 344" />
        <path d="M314 320 L326 332 L314 344" />
        <path d="M301 318 L292 346" />
        <path d="M214 334 Q235 320 256 334 Q277 348 298 334" />
      </g>

      <use href={`#${laurel}`} transform="translate(180 400) rotate(20) scale(0.88)" />
      <use href={`#${laurel}`} transform="translate(332 400) rotate(-20) scale(-0.88 0.88)" />

      <text
        x="256"
        y="368"
        fontFamily={SANS}
        fontSize="21"
        fontWeight="700"
        letterSpacing="2.5"
        fill={NAVY}
        textAnchor="middle"
      >
        HACKATHONS
      </text>
      <text
        x="256"
        y="390"
        fontFamily={SANS}
        fontSize="18"
        fontWeight="600"
        fill={NAVY}
        textAnchor="middle"
      >
        {club.tagline}
      </text>

      {/* Ribbon, swallow-tailed, crossing the shield foot. */}
      <path d="M158 402 L190 408 L190 436 L158 442 L170 422 Z" fill={GOLD_DEEP} />
      <path d="M354 402 L322 408 L322 436 L354 442 L342 422 Z" fill={GOLD_DEEP} />
      <path d="M190 404 L322 404 L322 440 L190 440 Z" fill={GOLD} />
      <text
        x="256"
        y="429"
        fontFamily={SANS}
        fontSize="21"
        fontWeight="700"
        letterSpacing="2"
        fill={NAVY}
        textAnchor="middle"
      >
        EST. {club.founded}
      </text>
    </svg>
  );
}
