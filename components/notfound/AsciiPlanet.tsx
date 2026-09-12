import { PLANET_DEFAULTS, renderPlanet } from "@/lib/ascii/planet";

/* ==========================================================================
   The ASCII planet, set as text.

   Rendered on the server from lib/ascii/planet.ts; it ships as characters
   in a <pre>, with no script. The type size is derived, not chosen: the
   wrapper is a size container, and the text is sized so the widest line
   fills it exactly — a monospace glyph is `cellAspect` em wide and lines
   are set solid, so `columns × cellAspect` em is the block's width.

   Decorative (aria-hidden). The legend beside it states only true things:
   the ramp that shaded it and the size of the grid.
   ========================================================================== */

const LINES = renderPlanet();
const COLUMNS = Math.max(...LINES.map((line) => line.length));
const TEXT = LINES.join("\n");

export const PLANET_GRID = { columns: COLUMNS, rows: LINES.length };

export function AsciiPlanet({ className = "" }: { className?: string }) {
  return (
    <div className={`@container ${className}`}>
      <pre
        aria-hidden
        className="m-0 overflow-hidden font-mono leading-none text-[var(--stage-muted)] select-none"
        style={{ fontSize: `calc(100cqi / ${COLUMNS * PLANET_DEFAULTS.cellAspect})` }}
      >
        {TEXT}
      </pre>
    </div>
  );
}
