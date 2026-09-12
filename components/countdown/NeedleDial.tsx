import { polar, r3 } from "@/lib/geometry";

/* ==========================================================================
   Needle dial — a half-circle gauge with quarter ticks, a lit arc and a
   needle, for one real fraction. Decorative (aria-hidden): the caller
   prints the same number as text beside it.

   Everything is computed in render, so every coordinate goes through
   r3/polar and the server and the browser serialise the same strings.
   ========================================================================== */

const CX = 50;
const CY = 50;
const R = 40;

export function NeedleDial({
  value,
  className = "",
}: {
  /** 0..1. */
  value: number;
  className?: string;
}) {
  const v = value < 0 ? 0 : value > 1 ? 1 : value;
  const angle = Math.PI + v * Math.PI;
  const [ax, ay] = polar(CX, CY, R, angle);
  const [nx, ny] = polar(CX, CY, R - 8, angle);

  return (
    <svg aria-hidden viewBox="0 0 100 56" className={`block ${className}`} fill="none">
      <path
        d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
        stroke="var(--stage-line-strong)"
        strokeWidth={1}
      />
      {v > 0 && (
        <path
          d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${ax} ${ay}`}
          stroke="var(--color-marigold)"
          strokeWidth={2.5}
        />
      )}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const a = Math.PI + t * Math.PI;
        const [x1, y1] = polar(CX, CY, R + 3, a);
        const [x2, y2] = polar(CX, CY, R + (t === 0.5 ? 9 : 6), a);
        return (
          <line key={t} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--stage-subtle)" strokeWidth={1} />
        );
      })}
      <line x1={CX} y1={CY} x2={nx} y2={ny} stroke="var(--stage-fg)" strokeWidth={1.25} />
      <circle cx={CX} cy={CY} r={r3(2.5)} fill="var(--stage-fg)" />
    </svg>
  );
}
