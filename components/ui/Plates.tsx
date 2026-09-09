"use client";

import { useEffect, useRef } from "react";
import { useAnimationFrame, useMotionValueEvent, useScroll, useVelocity } from "motion/react";
import { usePrefersReducedMotion, useRunWhenVisible } from "@/lib/hooks";
import { Annotation, Barcode, RegMark } from "@/components/ui/Poster";

/* ==========================================================================
   Poster plates.

   Each plate is a technical-poster composition rebuilt as native SVG, and
   each one animates by a DIFFERENT mechanism so the site never repeats a
   gesture:

     CyclePlate    rotation + arc draw + stepped index   (see home/CyclePlate)
     EuclidPlate   clip-path wipe + counter-rotating marks
     OrbitPlate    an element travelling an SVG motion path
     MosaicPlate   per-character mosaic dissolve
     GatePlate     scroll-velocity-driven shards

   House rules, same as the annotation layer: visible by default, reduced
   motion pins everything to its finished state, and continuous loops run
   only while on screen with the tab visible.
   ========================================================================== */

/* -------------------------------------------------------------------------
   EuclidPlate — the counter-intelligence plate.

   Rounded slabs, an X pair, a diagonal accent, a ring cluster. The reveal is
   a clip-path wipe travelling along the diagonal, so the composition
   assembles along its own strongest line rather than fading in.
   ------------------------------------------------------------------------- */

export function EuclidPlate({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const wipeRef = useRef<SVGGElement>(null);
  const xaRef = useRef<SVGGElement>(null);
  const xbRef = useRef<SVGGElement>(null);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: hostRef,
    offset: ["start 92%", "start 45%"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const t = Math.min(1, Math.max(0, p));
    // The diagonal wipe: a clip rectangle sweeping across the plate.
    if (wipeRef.current) {
      wipeRef.current.style.clipPath = `polygon(0 0, ${t * 190}% 0, ${t * 120 - 40}% 100%, 0 100%)`;
    }
    // The two marks counter-rotate as it assembles.
    if (xaRef.current) xaRef.current.style.transform = `rotate(${t * 46}deg)`;
    if (xbRef.current) xbRef.current.style.transform = `rotate(${-t * 62}deg)`;
  });

  useEffect(() => {
    if (!reduced) return;
    // Reduced motion lands on the finished composition.
    if (wipeRef.current) wipeRef.current.style.clipPath = "none";
  }, [reduced]);

  const X = (cx: number, cy: number, r: number) =>
    `M${cx - r} ${cy - r} L${cx + r} ${cy + r} M${cx + r} ${cy - r} L${cx - r} ${cy + r}`;

  return (
    <div ref={hostRef} className={className} aria-hidden>
      <svg viewBox="0 0 400 300" className="h-full w-full">
        <g ref={wipeRef} style={{ clipPath: "polygon(0 0, 0 0, -40% 100%, 0 100%)" }}>
          {/* rounded slabs */}
          <rect x="14" y="26" width="196" height="58" rx="29" fill="currentColor" opacity="0.2" />
          <line x1="42" y1="55" x2="176" y2="55" stroke="currentColor" strokeWidth="2.4" opacity="0.5" />
          <rect x="58" y="106" width="210" height="58" rx="29" fill="currentColor" opacity="0.16" />
          <line x1="88" y1="135" x2="212" y2="135" stroke="var(--color-marigold)" strokeWidth="2.4" />

          {/* the diagonal accent slab */}
          <path d="M232 300 L318 26 L360 26 L274 300 Z" fill="var(--color-marigold)" opacity="0.9" />

          {/* ring cluster */}
          {[10, 17, 24, 31].map((r, i) => (
            <circle key={r} cx="330" cy="196" r={r} fill="none" stroke="currentColor"
                    strokeWidth="0.8" opacity={0.5 - i * 0.09} />
          ))}
          <circle cx="330" cy="196" r="5" fill="var(--color-marigold)" />

          {/* the X pair */}
          <g ref={xaRef} style={{ transformOrigin: "132px 226px" }}>
            <path d={X(132, 226, 22)} stroke="currentColor" strokeWidth="11" strokeLinecap="round" fill="none" opacity="0.85" />
          </g>
          <g ref={xbRef} style={{ transformOrigin: "196px 226px" }}>
            <path d={X(196, 226, 22)} stroke="var(--color-marigold)" strokeWidth="11" strokeLinecap="round" fill="none" />
          </g>

          {/* framing hairlines */}
          <rect x="248" y="46" width="76" height="96" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.4" />
          <path d="M356 60 l10 10 l-10 10" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------
   OrbitPlate — the season, drawn as orbits.

   Concentric orbit rings with a marker that TRAVELS one of them using a CSS
   motion path (offset-path / offset-distance). Different mechanism to every
   other plate: the marker follows real geometry rather than being rotated.
   ------------------------------------------------------------------------- */

export function OrbitPlate({
  className = "",
  rings = 4,
}: {
  className?: string;
  rings?: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const { ref: gateRef, running } = useRunWhenVisible<HTMLDivElement>();
  const t = useRef(0);

  useAnimationFrame((_, delta) => {
    if (!running || !markerRef.current) return;
    t.current = (t.current + delta / 9000) % 1;
    markerRef.current.style.offsetDistance = `${t.current * 100}%`;
  });

  return (
    <div ref={gateRef} className={className} aria-hidden>
      <div ref={hostRef} className="relative h-full w-full">
        <svg viewBox="0 0 320 320" className="h-full w-full">
          {Array.from({ length: rings }, (_, i) => {
            const r = 44 + i * 34;
            return (
              <ellipse
                key={i}
                cx="160" cy="160" rx={r} ry={r * 0.92}
                fill="none"
                stroke={i === 2 ? "var(--color-marigold)" : "currentColor"}
                strokeWidth={i === 2 ? 1.1 : 0.7}
                opacity={i === 2 ? 0.85 : 0.28}
                strokeDasharray={i === 1 ? "3 5" : undefined}
                className="draw-path"
                pathLength={1}
                style={{ ["--draw-i" as string]: i }}
              />
            );
          })}
          {/* diagonal sight lines, as on the reference */}
          <path d="M8 250 L312 74" stroke="currentColor" strokeWidth="0.6" opacity="0.3"
                className="draw-path" pathLength={1} style={{ ["--draw-i" as string]: 4 }} />
          <path d="M60 12 L60 308" stroke="currentColor" strokeWidth="0.6" opacity="0.22"
                className="draw-path" pathLength={1} style={{ ["--draw-i" as string]: 5 }} />
          <circle cx="160" cy="160" r="17" fill="var(--color-marigold)" />
          <circle cx="160" cy="160" r="17" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
        </svg>

        {/* The travelling marker. offset-path takes the same ellipse geometry
            as ring index 2, so it rides the orbit exactly. */}
        <div
          ref={markerRef}
          className="absolute left-0 top-0 h-2 w-2 rounded-full bg-marigold"
          style={{
            offsetPath:
              "path('M 160 48 a 112 103 0 1 1 -0.1 0')",
            offsetDistance: "0%",
            offsetRotate: "0deg",
            // The svg is 320 units wide and the box scales with it.
            scale: "1",
          }}
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   MosaicPlate — display type that resolves out of a pixel mosaic.

   The reference sets its headline half-pixelated. Here each character is
   drawn as a block grid that collapses into the letterform on reveal, so the
   word literally resolves. Uses text, not images, so it stays selectable and
   readable to assistive tech.
   ------------------------------------------------------------------------- */

export function MosaicPlate({
  word,
  className = "",
}: {
  word: string;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const cellsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: hostRef,
    offset: ["start 95%", "start 35%"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduced) return;
    const t = Math.min(1, Math.max(0, p));
    cellsRef.current.forEach((el, i) => {
      if (!el) return;
      // Each block clears at its own threshold, so the word dissolves in
      // from a mosaic rather than fading uniformly.
      const own = (i * 37) % 100 / 100;
      const on = t > own * 0.75;
      el.style.opacity = on ? "0" : "1";
      el.style.transform = on ? "scale(0.2)" : "scale(1)";
    });
  });

  const COLS = 14;
  const ROWS = 5;

  return (
    <div ref={hostRef} className={`relative ${className}`}>
      <span className="relative z-10 block">{word}</span>
      {/* the mosaic sitting over the word */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 grid"
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
      >
        {Array.from({ length: COLS * ROWS }, (_, i) => (
          <span
            key={i}
            ref={(el) => { cellsRef.current[i] = el; }}
            className="block bg-[var(--page-bg)] transition-[opacity,transform] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)]"
            style={{ transitionDelay: `${(i % COLS) * 12}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   GatePlate — a wireframe mast with shards that react to scroll speed.

   The reference throws hard diagonal shards across a wireframe structure.
   Here their length tracks scroll VELOCITY, so the plate reacts to how fast
   you are moving rather than where you are — the one plate driven by speed
   rather than position.
   ------------------------------------------------------------------------- */

export function GatePlate({ className = "" }: { className?: string }) {
  const { ref: gateRef, running } = useRunWhenVisible<HTMLDivElement>();
  const shardRefs = useRef<(SVGPathElement | null)[]>([]);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const eased = useRef(0);

  useAnimationFrame(() => {
    if (!running) return;
    const target = Math.min(1, Math.abs(velocity.get()) / 2600);
    // Ease towards the target so the shards settle rather than jitter.
    eased.current += (target - eased.current) * 0.09;
    shardRefs.current.forEach((el, i) => {
      if (!el) return;
      const k = 0.34 + eased.current * (0.9 + i * 0.16);
      el.style.transform = `scaleX(${k})`;
      el.style.opacity = String(0.4 + eased.current * 0.6);
    });
  });

  const SHARDS = [
    { d: "M150 150 L318 96 L150 152 Z", y: 0 },
    { d: "M150 150 L308 172 L150 154 Z", y: 0 },
    { d: "M150 150 L292 224 L150 156 Z", y: 0 },
    { d: "M150 150 L36 92 L150 148 Z", y: 0 },
  ];

  return (
    <div ref={gateRef} className={className} aria-hidden>
      <svg viewBox="0 0 320 300" className="h-full w-full">
        {/* wireframe mast */}
        <g stroke="currentColor" fill="none" opacity="0.4">
          <path d="M150 20 L150 288" strokeWidth="0.8" />
          <path d="M126 40 L174 40 M120 92 L180 92 M114 150 L186 150 M108 214 L192 214 M102 288 L198 288" strokeWidth="0.7" />
          <path d="M126 40 L102 288 M174 40 L198 288" strokeWidth="0.7" />
          {[60, 118, 178, 246].map((y) => (
            <path key={y} d={`M${150 - (y / 288) * 44} ${y} L${150 + (y / 288) * 44} ${y}`} strokeWidth="0.5" opacity="0.7" />
          ))}
        </g>
        {/* the shards */}
        {SHARDS.map((s, i) => (
          <path
            key={i}
            ref={(el) => { shardRefs.current[i] = el; }}
            d={s.d}
            fill="var(--color-marigold)"
            opacity="0.45"
            style={{ transformOrigin: "150px 150px", transform: "scaleX(0.34)" }}
          />
        ))}
        <circle cx="150" cy="150" r="4" fill="var(--color-marigold)" />
      </svg>
    </div>
  );
}

/* Small shared caption used beneath the plates. */
export function PlateCaption({
  index,
  label,
  className = "",
}: {
  index: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <RegMark size={12} className="text-marigold" />
      <Annotation tone="current">{index} / {label}</Annotation>
      <span aria-hidden className="h-px flex-1 bg-[var(--stage-line)]" />
      <Barcode seed={`${index}-${label}`} bars={14} height={13} className="opacity-35" />
    </div>
  );
}
