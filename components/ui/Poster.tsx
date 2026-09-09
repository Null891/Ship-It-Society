"use client";

import { useEffect, useRef, useState } from "react";
import { useAnimationFrame, useScroll, useVelocity } from "motion/react";
import { usePrefersReducedMotion, useRunWhenVisible } from "@/lib/hooks";

/* ==========================================================================
   The annotation layer.

   Swiss / technical-poster vocabulary: numbered indices, spec-sheet
   marginalia, hairline rules, barcodes, registration marks, schematic dials.
   Structure rather than ornament — each of these labels or measures
   something real on the page.

   House rules for everything in this file:

     · Content is visible by default. Nothing here gates legibility on an
       animation, an observer, or JavaScript running at all.
     · prefers-reduced-motion pins every loop to its resting state.
     · Continuous motion runs only while on screen and the tab is visible
       (useRunWhenVisible), because members open this on Chromebooks.
     · Decorative marks carry aria-hidden. A screen reader should hear the
       page, not the furniture.
   ========================================================================== */

/** Deterministic 0-1 from a string. Same seed, same mark, every render —
 *  so nothing shifts between server and client. */
function hash(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

/* -------------------------------------------------------------------------
   Annotation — mono marginalia. The smallest unit of the language.
   ------------------------------------------------------------------------- */

export function Annotation({
  children,
  className = "",
  tone = "muted",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "muted" | "accent" | "current";
}) {
  const color =
    tone === "accent"
      ? "text-marigold-ink"
      : tone === "current"
        ? ""
        : "text-[var(--stage-muted)]";
  return <span className={`mono-label ${color} ${className}`}>{children}</span>;
}

/* -------------------------------------------------------------------------
   Barcode — a real EAN-ish bar pattern derived from the seed, not noise.
   Animates its bars in on reveal via the shared [data-reveal] system.
   ------------------------------------------------------------------------- */

export function Barcode({
  seed = "ship-it-society",
  bars = 42,
  className = "",
  height = 34,
}: {
  seed?: string;
  bars?: number;
  className?: string;
  height?: number;
}) {
  const rnd = hash(seed);
  let x = 0;
  const rects: { x: number; w: number }[] = [];
  for (let i = 0; i < bars; i++) {
    const w = 1 + Math.round(rnd() * 3);
    rects.push({ x, w });
    x += w + 1 + Math.round(rnd() * 2);
  }
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${x} ${height}`}
      preserveAspectRatio="none"
      className={`h-[34px] w-auto ${className}`}
      style={{ maxWidth: "100%" }}
    >
      {rects.map((r, i) => (
        <rect
          key={i}
          x={r.x}
          y={0}
          width={r.w}
          height={height}
          fill="currentColor"
          className="barcode-bar"
          style={{ "--bar-i": i } as React.CSSProperties}
        />
      ))}
    </svg>
  );
}

/* -------------------------------------------------------------------------
   Registration mark — the crosshair a printer aligns plates to.
   ------------------------------------------------------------------------- */

export function RegMark({
  size = 18,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="1" />
      <path d="M12 0v8M12 16v8M0 12h8M16 12h8" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/* -------------------------------------------------------------------------
   Dial — concentric rings with a tick ring, rotating slowly. Straight from
   the turntable poster. Rotation is driven by scroll VELOCITY, so it reacts
   to how fast you are moving rather than spinning at a constant rate.
   ------------------------------------------------------------------------- */

export function Dial({
  size = 132,
  className = "",
  ticks = 60,
}: {
  size?: number;
  className?: string;
  ticks?: number;
}) {
  const { ref, running } = useRunWhenVisible<HTMLDivElement>();
  const spinRef = useRef<SVGGElement>(null);
  const angle = useRef(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);

  useAnimationFrame((_, delta) => {
    if (!running || !spinRef.current) return;
    // A slow idle drift, plus a nudge proportional to scroll speed.
    const v = velocity.get();
    angle.current += (delta / 1000) * (6 + Math.min(Math.abs(v) / 90, 40));
    spinRef.current.style.transform = `rotate(${angle.current % 360}deg)`;
  });

  const r = 50;
  return (
    <div ref={ref} aria-hidden className={className} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} fill="none">
        <circle cx="60" cy="60" r={r} stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
        <circle cx="60" cy="60" r={r - 12} stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
        <g ref={spinRef} style={{ transformOrigin: "60px 60px" }}>
          {Array.from({ length: ticks }, (_, i) => {
            const a = (i / ticks) * Math.PI * 2;
            const inner = i % 5 === 0 ? r - 10 : r - 5;
            return (
              <line
                key={i}
                x1={60 + Math.cos(a) * inner}
                y1={60 + Math.sin(a) * inner}
                x2={60 + Math.cos(a) * (r - 1)}
                y2={60 + Math.sin(a) * (r - 1)}
                stroke="currentColor"
                strokeWidth={i % 5 === 0 ? 1 : 0.5}
                opacity={i % 5 === 0 ? 0.85 : 0.4}
              />
            );
          })}
        </g>
        <circle cx="60" cy="60" r="7" fill="currentColor" />
        <circle cx="60" cy="60" r="2" className="fill-[var(--page-bg)]" />
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------
   Scramble — text that resolves out of noise.

   Motion's own ScrambleText is a paid Motion+ feature and is not in this
   package, so this is hand-rolled: ~30 lines driven by the same imperative
   frame loop everything else here uses, writing textContent directly so
   React never re-renders during the effect.

   The real text is ALWAYS in the DOM first and is what a screen reader and
   a no-JS visitor get; the scramble only ever overwrites it briefly.
   ------------------------------------------------------------------------- */

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>*#";

export function Scramble({
  text,
  className = "",
  duration = 900,
  /** Re-run whenever this changes; used for hover. */
  active,
}: {
  text: string;
  className?: string;
  duration?: number;
  active?: boolean;
}) {
  const elRef = useRef<HTMLSpanElement>(null);
  const reduced = usePrefersReducedMotion();
  const { ref: gateRef, running } = useRunWhenVisible<HTMLSpanElement>();
  const introDone = useRef(false);

  /* One effect drives the whole thing. An earlier version kept a runId in
     state and bumped it from two other effects, which is setState-in-effect —
     an extra render pass per trigger for a value only this effect reads. The
     refs carry that state instead. */
  useEffect(() => {
    if (reduced || !running) return;
    // Run once on first appearance, and again on each hover activation.
    if (introDone.current && !active) return;
    introDone.current = true;

    const el = elRef.current;
    if (!el) return;
    const chars = [...text];
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const settled = Math.floor(p * chars.length);
      el.textContent = chars
        .map((c, i) =>
          i < settled || c === " "
            ? c
            : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        )
        .join("");
      if (p < 1) raf = requestAnimationFrame(tick);
      else el.textContent = text;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      if (el) el.textContent = text;
    };
  }, [running, active, text, duration, reduced]);

  return (
    <span ref={gateRef} className={className}>
      {/* aria-hidden on the animated copy; the accessible name comes from the
          sr-only twin, so assistive tech never reads scrambled glyphs. */}
      <span ref={elRef} aria-hidden>
        {text}
      </span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------
   Marquee — an infinite ticker whose speed and direction follow scroll.

   Driven by useAnimationFrame writing a transform, not by a CSS keyframe,
   so scroll velocity can steer it. The track is duplicated once and wrapped
   at half its width, which is the standard seamless-loop trick.
   ------------------------------------------------------------------------- */

export function Marquee({
  children,
  className = "",
  baseSpeed = 38,
  gap = 56,
}: {
  children: React.ReactNode;
  className?: string;
  /** Pixels per second at rest. */
  baseSpeed?: number;
  gap?: number;
}) {
  const { ref: gateRef, running } = useRunWhenVisible<HTMLDivElement>();
  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);

  useAnimationFrame((_, delta) => {
    const track = trackRef.current;
    if (!track || !running) return;
    const half = track.scrollWidth / 2;
    if (half <= 0) return;
    const v = velocity.get();
    // Scroll speed adds to the drift; direction follows scroll direction.
    const speed = baseSpeed + Math.min(Math.abs(v) / 5, 420) * Math.sign(v || 1);
    offset.current = (offset.current + (delta / 1000) * speed) % half;
    if (offset.current < 0) offset.current += half;
    track.style.transform = `translate3d(${-offset.current}px,0,0)`;
  });

  return (
    <div
      ref={gateRef}
      className={`relative overflow-hidden ${className}`}
      /* The list is duplicated for the loop, so the copy is hidden from
         assistive tech and the original is announced once. */
      role="presentation"
    >
      <div
        ref={trackRef}
        className="flex w-max will-change-transform"
        style={{ gap }}
      >
        <div className="flex shrink-0 items-center" style={{ gap }}>
          {children}
        </div>
        <div className="flex shrink-0 items-center" style={{ gap }} aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   IndexRail — the vertical 01..0N index from the poster, tracking which
   section is in view. Purely decorative: the real navigation is the nav.
   ------------------------------------------------------------------------- */

export function IndexRail({
  items,
  className = "",
}: {
  items: { id: string; label: string }[];
  className?: string;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((e): e is HTMLElement => !!e);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = els.indexOf(e.target as HTMLElement);
          if (i >= 0) setActive(i);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <div aria-hidden className={className}>
      <ul className="flex flex-col gap-2">
        {items.map((item, i) => (
          <li
            key={item.id}
            className="mono-label flex items-center gap-2 transition-opacity duration-[var(--dur-base)]"
            style={{ opacity: i === active ? 1 : 0.32 }}
          >
            <span
              className="block h-px transition-all duration-[var(--dur-base)] ease-[var(--ease-out-expo)]"
              style={{
                width: i === active ? 22 : 10,
                background: i === active ? "var(--color-marigold)" : "currentColor",
              }}
            />
            {String(i + 1).padStart(2, "0")}
          </li>
        ))}
      </ul>
    </div>
  );
}
