"use client";

import { useRef } from "react";
import { useAnimationFrame } from "motion/react";
import { useRunWhenVisible } from "@/lib/hooks";
import { polar } from "@/lib/geometry";

/* ==========================================================================
   Radial tick spinner — the data-transfer panel's ring, measuring a real
   quantity.

   The outer ring is `ticks` segments read clockwise from twelve o'clock; the
   first round(progress × ticks) are lit. The inner ring carries one notch
   that sweeps once a minute, locked to the wall clock's seconds, so the only
   thing that moves is a true second hand.

   The sweep is written straight to the DOM from a frame loop, never through
   React state, and only runs while the ring is on screen, the tab is
   visible and reduced motion is off. Otherwise it rests at twelve.
   ========================================================================== */

const C = 60;

export function TickSpinner({
  progress,
  ticks = 24,
  className = "",
  children,
}: {
  /** 0..1. */
  progress: number;
  ticks?: number;
  className?: string;
  /** The readout printed in the middle of the ring. */
  children?: React.ReactNode;
}) {
  const { ref, running } = useRunWhenVisible<HTMLDivElement>();
  const sweep = useRef<SVGGElement>(null);

  useAnimationFrame(() => {
    if (!running || !sweep.current) return;
    const deg = ((Date.now() % 60_000) / 60_000) * 360;
    sweep.current.style.transform = `rotate(${deg.toFixed(2)}deg)`;
  });

  const p = progress < 0 ? 0 : progress > 1 ? 1 : progress;
  const lit = Math.round(p * ticks);

  return (
    <div ref={ref} className={`relative aspect-square ${className}`}>
      <svg aria-hidden viewBox="0 0 120 120" className="absolute inset-0 h-full w-full" fill="none">
        {Array.from({ length: ticks }, (_, i) => {
          const a = -Math.PI / 2 + (i / ticks) * Math.PI * 2;
          const [x1, y1] = polar(C, C, 47, a);
          const [x2, y2] = polar(C, C, 57, a);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              strokeWidth={3.2}
              stroke={i < lit ? "var(--color-marigold)" : "var(--stage-line-strong)"}
            />
          );
        })}
        <circle cx={C} cy={C} r={40} stroke="var(--stage-line)" strokeWidth={0.75} />
        <g ref={sweep} style={{ transformOrigin: `${C}px ${C}px` }}>
          <line x1={C} y1={16} x2={C} y2={24} stroke="var(--color-marigold)" strokeWidth={1.5} />
          <circle cx={C} cy={20} r={1.4} fill="var(--color-marigold)" />
        </g>
      </svg>
      {children && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {children}
        </div>
      )}
    </div>
  );
}
