import { polar } from "@/lib/geometry";

/* ==========================================================================
   The burst: eight hairline rays from one point, the four on the axes long
   and the four between them short. Each ray draws outward from the centre
   when the mark is revealed, using the shared draw-path system, and rests
   fully drawn when nothing animates. Decorative only.
   ========================================================================== */

const RAYS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
  const long = i % 2 === 0;
  const [x1, y1] = polar(100, 100, long ? 10 : 16, angle);
  const [x2, y2] = polar(100, 100, long ? 99 : 62, angle);
  return { x1, y1, x2, y2, long };
});

export function Burst({ className = "" }: { className?: string }) {
  return (
    <div data-reveal className={className}>
      <svg aria-hidden viewBox="0 0 200 200" fill="none" className="h-full w-full overflow-visible">
        {RAYS.map((r, i) => (
          <line
            key={i}
            {...{ x1: r.x1, y1: r.y1, x2: r.x2, y2: r.y2 }}
            pathLength={1}
            stroke={r.long ? "var(--stage-muted)" : "var(--stage-line-strong)"}
            strokeWidth={r.long ? 0.6 : 0.8}
            className="draw-path"
            style={{ "--draw-i": i } as React.CSSProperties}
          />
        ))}
        <circle cx="100" cy="100" r="30" stroke="var(--stage-line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <rect x="97.5" y="97.5" width="5" height="5" fill="var(--color-marigold)" />
      </svg>
    </div>
  );
}
