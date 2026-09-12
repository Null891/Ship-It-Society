"use client";

import { useEffect, useRef } from "react";
import { useScroll } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks";

/* ==========================================================================
   The scan, drawn as a grid.

   Cells stand for the surface a project exposes. A seeded handful start as
   findings; as the section scrolls, a scanner sweeps across and clears them,
   and the readout counts down to zero. That is the club's actual rule —
   nothing ships with open findings — rather than decoration.

   The finished state (everything clear, zero findings) is what the server
   renders, so no-JS and reduced-motion visitors see the truthful end state.
   The unscanned state is only ever set from a live scroll position, and the
   count is repeated in text beside the grid.
   ========================================================================== */

const COLS = 26;
const ROWS = 10;
const CELL = 18;
const GAP = 3;
const W = COLS * (CELL + GAP) - GAP;
const H = ROWS * (CELL + GAP) - GAP;

/** Deterministic: the same cells are findings on the server and the client. */
function findings(count: number) {
  let h = 2166136261;
  const picked = new Set<number>();
  while (picked.size < count) {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    picked.add(Math.abs(h) % (COLS * ROWS));
  }
  return [...picked].sort((a, b) => a - b);
}

const FOUND = findings(14);

export function ScanGrid({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<(SVGRectElement | null)[]>([]);
  const beamRef = useRef<SVGGElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: hostRef,
    offset: ["start 90%", "start 35%"],
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host || reduced) return;

    const paint = (raw: number) => {
      const p = raw < 0 ? 0 : raw > 1 ? 1 : raw;
      // The beam leads the cleared column slightly, so cells clear behind it.
      const front = p * (COLS + 2) - 1;
      let open = 0;
      FOUND.forEach((index, i) => {
        const col = index % COLS;
        const cleared = col < front;
        if (!cleared) open += 1;
        const el = cellRefs.current[i];
        if (el) el.setAttribute("fill", cleared ? "var(--stage-line-strong)" : "var(--color-marigold)");
      });
      if (beamRef.current) {
        const x = Math.max(0, Math.min(COLS, front)) * (CELL + GAP);
        beamRef.current.style.transform = `translateX(${x.toFixed(1)}px)`;
        beamRef.current.style.opacity = p > 0 && p < 1 ? "1" : "0";
      }
      if (countRef.current) countRef.current.textContent = String(open).padStart(2, "0");
    };

    // Start from where the section actually is, so a plate already on screen
    // is not yanked back to its unscanned state.
    const rect = host.getBoundingClientRect();
    paint((0.9 * window.innerHeight - rect.top) / (0.55 * window.innerHeight));
    return scrollYProgress.on("change", paint);
  }, [reduced, scrollYProgress]);

  return (
    <div ref={hostRef} className={className}>
      <div className="flex items-baseline justify-between gap-4">
        <span className="mono-label text-[var(--stage-subtle)]">Surface scan</span>
        <span className="mono-label tnum text-[var(--stage-muted)]">
          Findings <span ref={countRef} className="text-marigold">00</span> / {FOUND.length}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-4 w-full"
        aria-hidden
        preserveAspectRatio="none"
        style={{ height: H }}
      >
        {/* The surface. */}
        {Array.from({ length: COLS * ROWS }, (_, i) => (
          <rect
            key={i}
            x={(i % COLS) * (CELL + GAP)}
            y={Math.floor(i / COLS) * (CELL + GAP)}
            width={CELL}
            height={CELL}
            fill="var(--stage-line)"
          />
        ))}

        {/* Findings. The server draws them already cleared. */}
        {FOUND.map((index, i) => (
          <rect
            key={`f${index}`}
            ref={(el) => {
              cellRefs.current[i] = el;
            }}
            x={(index % COLS) * (CELL + GAP)}
            y={Math.floor(index / COLS) * (CELL + GAP)}
            width={CELL}
            height={CELL}
            fill="var(--stage-line-strong)"
            className="transition-[fill] duration-[var(--dur-fast)]"
          />
        ))}

        {/* The scanner. */}
        <g ref={beamRef} style={{ opacity: 0 }}>
          <rect x={-2} y={-6} width={3} height={H + 12} fill="var(--color-marigold)" />
          <rect x={-9} y={-6} width={5} height={5} fill="var(--color-marigold)" />
          <rect x={-9} y={H + 1} width={5} height={5} fill="var(--color-marigold)" />
        </g>
      </svg>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-[var(--stage-line)] pt-3">
        <span className="mono-label text-[var(--stage-subtle)]">
          {COLS} × {ROWS} surface
        </span>
        <span className="mono-label text-[var(--stage-subtle)]">Clean before launch</span>
      </div>
    </div>
  );
}
