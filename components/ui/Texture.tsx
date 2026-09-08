/* ==========================================================================
   Surface texture.

   Large flat blacks band badly on 8-bit displays, and they read as flat
   digital emptiness. A very low-amplitude noise field breaks the banding and
   gives the dark sections the faint tooth that photographed product pages
   have. It is inline SVG turbulence rendered by the compositor — no image
   request, no layout cost.

   Kept at 3.5% opacity. If you can consciously see it, it is too strong.
   ========================================================================== */

const NOISE = `<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'>
<filter id='n'>
<feTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/>
<feColorMatrix type='saturate' values='0'/>
</filter>
<rect width='140' height='140' filter='url(%23n)'/>
</svg>`.replace(/\n/g, "");

export function Grain({ opacity = 0.035 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml,${NOISE}")`,
        backgroundRepeat: "repeat",
        // Screen keeps the grain additive on black rather than muddying it.
        mixBlendMode: "screen",
      }}
    />
  );
}

/* ==========================================================================
   Generative cover plate.

   Each project gets a plate derived deterministically from its slug, so no
   two projects look alike and none of them look like a grey placeholder box.
   The forms echo the hero sequence: a field of code-like bars resolving into
   an interface. Pure SVG, so it scales, prints, and costs nothing.
   ========================================================================== */

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function CoverPlate({
  seed,
  tone = "ink",
  className = "",
}: {
  seed: string;
  tone?: "ink" | "surface" | "marigold";
  className?: string;
}) {
  const rand = rng(hash(seed));
  const dark = tone !== "marigold";
  const fg = tone === "marigold" ? "#000000" : "#ffffff";
  const accent = tone === "marigold" ? "#000000" : "#ff9f0a";

  // Left half: code-like bars. Right half: a resolved interface panel.
  const bars: { x: number; y: number; w: number; h: number; a: number }[] = [];
  for (let row = 0; row < 9; row++) {
    const indent = Math.floor(rand() * 3) * 14;
    let x = 26 + indent;
    const count = 1 + Math.floor(rand() * 3);
    for (let i = 0; i < count; i++) {
      const w = 16 + Math.floor(rand() * 54);
      if (x + w > 190) break;
      bars.push({ x, y: 30 + row * 22, w, h: 7, a: 0.18 + rand() * 0.55 });
      x += w + 8;
    }
  }

  const rows = 4 + Math.floor(rand() * 2);
  const accentRow = Math.floor(rand() * rows);

  return (
    <svg
      viewBox="0 0 400 300"
      role="img"
      aria-label=""
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect
        width="400"
        height="300"
        fill={tone === "marigold" ? "#ff9f0a" : tone === "surface" ? "#1d1d1f" : "#000000"}
      />

      {/* Code field */}
      <g>
        {bars.map((b, i) => (
          <rect
            key={i}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx="2"
            fill={fg}
            opacity={b.a * (dark ? 1 : 0.75)}
          />
        ))}
      </g>

      {/* Resolved panel */}
      <g transform="translate(216, 26)">
        <rect
          width="158"
          height="248"
          rx="9"
          fill={fg}
          fillOpacity="0.045"
          stroke={fg}
          strokeOpacity="0.2"
        />
        <line x1="0" y1="27" x2="158" y2="27" stroke={fg} strokeOpacity="0.16" />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={16 + i * 13} cy="13.5" r="3.2" fill={fg} opacity="0.45" />
        ))}
        {Array.from({ length: rows }).map((_, i) => (
          <g key={i} transform={`translate(16, ${46 + i * 40})`}>
            <rect
              width={i === accentRow ? 66 : 40 + Math.floor(rand() * 46)}
              height="7"
              rx="2"
              fill={i === accentRow ? accent : fg}
              opacity={i === accentRow ? 0.95 : 0.6}
            />
            <rect
              width={92 + Math.floor(rand() * 30)}
              height="5"
              y="14"
              rx="2"
              fill={fg}
              opacity="0.24"
            />
          </g>
        ))}
        <rect x="16" y="212" width="58" height="20" rx="10" fill={accent} opacity="0.9" />
      </g>
    </svg>
  );
}
