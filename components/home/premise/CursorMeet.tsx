"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { polar, r3 } from "@/lib/geometry";

/* ==========================================================================
   Human x machine.

   Two pointers close on each other along the diagonal: one drawn as a
   wireframe mesh — a grid clipped to the cursor's own silhouette — and one
   drawn solid. Where they touch, a marigold starburst.

   Rebuilt from the moodboard's wireframe-hand-meets-real-hand idea as
   original geometry: the arrow is an authored path, the mesh is generated
   lines clipped to it, and the burst is computed with polar() so the server
   and the browser serialise identical coordinates.

   Contract notes:

     · The SERVER renders the contact state. A visitor with no JavaScript,
       or one who asked for reduced motion, sees the two pointers touching
       and the burst lit — the finished picture, never an empty frame.
     · Scroll drives it imperatively from one subscription. Three transform
       writes per frame, no React state, no re-render.
   ========================================================================== */

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** An arrow pointer, tip at the origin, body falling to the lower right. */
const ARROW = "M0 0 L0 37 L9.2 28.6 L14.6 41 L21.4 38.1 L16 26 L28 25.2 Z";
const ARROW_W = 28;
const ARROW_H = 41;
const MESH_STEP = 3;

/** How far apart the two pointers start, in user units. */
const REACH = 104;
/** How close they are at contact. */
const TOUCH = 7;

const CX = 150;
const CY = 150;

/* The burst: thin rays of two lengths, so it reads as a spark rather than
   as a sun. Computed once at module load — the same numbers every render. */
const RAYS = Array.from({ length: 22 }, (_, i) => {
  const a = (i / 22) * Math.PI * 2;
  const long = i % 2 === 0;
  const [x1, y1] = polar(CX, CY, long ? 13 : 11, a);
  const [x2, y2] = polar(CX, CY, long ? 44 : 25, a);
  return { x1, y1, x2, y2, w: long ? 1.5 : 0.8, o: long ? 1 : 0.55 };
});

const MESH_V = Array.from(
  { length: Math.floor(ARROW_W / MESH_STEP) + 1 },
  (_, i) => r3(i * MESH_STEP),
);
const MESH_H = Array.from(
  { length: Math.floor(ARROW_H / MESH_STEP) + 1 },
  (_, i) => r3(i * MESH_STEP),
);

export function CursorMeet({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const wireRef = useRef<SVGGElement>(null);
  const solidRef = useRef<SVGGElement>(null);
  const burstRef = useRef<SVGGElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: hostRef,
    offset: ["start 92%", "end 58%"],
  });

  const paint = (p: number) => {
    const t = clamp01(p);
    // Ease out, so the last stretch before contact slows down.
    const e = 1 - Math.pow(1 - t, 3);
    const gap = REACH - (REACH - TOUCH) * e;

    if (wireRef.current) {
      wireRef.current.style.transform = `translate(${(-gap).toFixed(2)}px, ${(-gap).toFixed(2)}px)`;
    }
    if (solidRef.current) {
      solidRef.current.style.transform = `translate(${gap.toFixed(2)}px, ${gap.toFixed(2)}px)`;
    }
    if (burstRef.current) {
      // The spark only exists in the last stretch, and it arrives fast.
      const k = clamp01((t - 0.68) / 0.32);
      burstRef.current.style.opacity = k.toFixed(3);
      burstRef.current.style.transform = `scale(${(0.3 + 0.7 * k).toFixed(3)})`;
    }
  };

  useEffect(() => {
    if (reduced) return;
    paint(scrollYProgress.get());
    // paint only reads refs; the effect is keyed on what decides whether it
    // should run at all.
     
  }, [reduced, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduced) return;
    paint(p);
  });

  return (
    <div ref={hostRef} className={className}>
      <svg
        viewBox="0 0 300 300"
        className="h-full w-full text-[var(--stage-fg)]"
        aria-hidden
        fill="none"
      >
        <defs>
          <clipPath id="premise-cursor-mesh">
            <path d={ARROW} />
          </clipPath>
        </defs>

        {/* construction rules through the contact point */}
        <g opacity="0.22">
          <path d={`M0 ${CY} H300`} stroke="currentColor" strokeWidth="0.6" strokeDasharray="1 6" />
          <path d={`M${CX} 0 V300`} stroke="currentColor" strokeWidth="0.6" strokeDasharray="1 6" />
        </g>

        {/* the spark, under both pointers so the tips stay crisp */}
        <g
          ref={burstRef}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
          className="text-marigold"
        >
          {RAYS.map((r, i) => (
            <line
              key={i}
              x1={r.x1}
              y1={r.y1}
              x2={r.x2}
              y2={r.y2}
              stroke="currentColor"
              strokeWidth={r.w}
              opacity={r.o}
            />
          ))}
          <circle cx={CX} cy={CY} r="4.5" fill="currentColor" />
          <circle cx={CX} cy={CY} r="54" stroke="currentColor" strokeWidth="0.7" opacity="0.35" />
        </g>

        {/* --- the machine: a mesh clipped to the pointer's silhouette --- */}
        <g transform={`translate(${CX} ${CY})`}>
          {/* The server renders the touching state: the transform attribute
              is the finished picture, and CSS overrides it once scroll takes
              over. Nothing is ever hidden or off-screen in the SSR markup. */}
          <g ref={wireRef} transform={`translate(${-TOUCH} ${-TOUCH})`}>
            <g transform="rotate(180) scale(1.9)" className="text-[var(--stage-muted)]">
              <g clipPath="url(#premise-cursor-mesh)" opacity="0.85">
                {MESH_V.map((x) => (
                  <line key={`v${x}`} x1={x} y1={0} x2={x} y2={ARROW_H} stroke="currentColor" strokeWidth="0.45" />
                ))}
                {MESH_H.map((y) => (
                  <line key={`h${y}`} x1={0} y1={y} x2={ARROW_W} y2={y} stroke="currentColor" strokeWidth="0.45" />
                ))}
              </g>
              <path d={ARROW} stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
            </g>
          </g>
        </g>

        {/* --- the human: the same pointer, solid ------------------------ */}
        <g transform={`translate(${CX} ${CY})`}>
          <g ref={solidRef} transform={`translate(${TOUCH} ${TOUCH})`}>
            <g transform="scale(1.9)">
              <path d={ARROW} fill="currentColor" />
              <path
                d={ARROW}
                stroke="var(--color-ink)"
                strokeWidth="1.2"
                strokeLinejoin="round"
                fill="none"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
