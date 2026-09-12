import { layout } from "@/lib/ascii/font5x7";

/* ==========================================================================
   Text set in the 5 × 7 dot-matrix alphabet, as SVG squares.

   Every cell of every glyph is drawn: lit dots in the foreground colour,
   dark dots as faint squares, so the word reads as a panel of LEDs rather
   than as pixel type floating on the page. Lit dots carry the `.px` class,
   so when the enclosing [data-reveal] enters they resolve column by column
   (globals.css). With no animation, or reduced motion, they are simply lit.

   Decorative: the caller puts the same words in real text beside it.
   ========================================================================== */

/** Side of one dot, as a fraction of its cell. The rest is the gap. */
const DOT = 0.76;
const INSET = (1 - DOT) / 2;

export function DotMatrix({
  lines,
  className = "",
}: {
  lines: readonly string[];
  className?: string;
}) {
  const { dots, width, height } = layout(lines);
  return (
    <svg
      aria-hidden
      data-reveal
      viewBox={`0 0 ${width} ${height}`}
      className={`block h-auto w-full ${className}`}
      shapeRendering="crispEdges"
    >
      <g fill="var(--color-line-dark-soft)">
        {dots
          .filter((d) => !d.lit)
          .map((d) => (
            <rect key={`${d.x}.${d.y}`} x={d.x + INSET} y={d.y + INSET} width={DOT} height={DOT} />
          ))}
      </g>
      <g fill="var(--stage-fg)">
        {dots
          .filter((d) => d.lit)
          .map((d) => (
            <rect
              key={`${d.x}.${d.y}`}
              className="px"
              style={{ "--px-col": d.x, "--px-row": d.y % 9 } as React.CSSProperties}
              x={d.x + INSET}
              y={d.y + INSET}
              width={DOT}
              height={DOT}
            />
          ))}
      </g>
    </svg>
  );
}
