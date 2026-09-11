"use client";

import { useEffect, useId, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useRunWhenVisible, usePrefersReducedMotion } from "@/lib/hooks";
import { Barcode, RegMark } from "@/components/ui/Poster";
import { Grain } from "@/components/ui/Texture";
import { r3 } from "@/lib/geometry";
import { meeting, schedule, security } from "@/content/club";
import { projects } from "@/content/projects";

/* ==========================================================================
   Poster plates.

   Each plate is a technical-poster composition drawn as native SVG and set
   on its OWN ground — ink, stone or marigold — inside printer's crop marks.
   An earlier version drew them as thin low-opacity line art straight onto
   the page, and on the light pages they read as faint clip-art in a lot of
   empty space. A plate needs a ground to read as an object.

   Every plate carries real data rather than decoration: the orbit rings are
   this season's hackathons with their dates, the archive counts actual
   deployments, the signal plate prints the real meeting room.

   And each animates by a different mechanism, so the site never repeats a
   gesture:

     CyclePlate    rotation + arc draw + stepped index   (home/CyclePlate)
     EuclidPlate   scroll-drawn diagonal + marks turning into place
     OrbitPlate    a marker travelling real ellipse geometry
     ArchivePlate  pixel type resolving column by column behind a scan bar
     GatePlate     shards driven by scroll VELOCITY, plus a signal pulse

   House rules, same as the rest of the poster layer: the finished
   composition is what the server renders, so nothing is ever hidden unless
   the reveal system is running; reduced motion pins everything to that
   finished state; continuous loops run only on screen with the tab visible.
   ========================================================================== */

type Ground = "ink" | "stone" | "marigold";

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/* -------------------------------------------------------------------------
   The frame every plate shares.
   ------------------------------------------------------------------------- */

/** Printer's crop marks, just outside each corner. They mark the plate as a
 *  printed object without adding a border that competes with the art. */
function CropMarks() {
  const corners = [
    "-left-3.5 -top-3.5",
    "-right-3.5 -top-3.5 rotate-90",
    "-right-3.5 -bottom-3.5 rotate-180",
    "-left-3.5 -bottom-3.5 -rotate-90",
  ];
  return (
    <>
      {corners.map((c) => (
        <svg
          key={c}
          viewBox="0 0 14 14"
          fill="none"
          className={`absolute h-3.5 w-3.5 text-[var(--stage-muted)] ${c}`}
        >
          <path d="M0 13.5H10M13.5 0V10" stroke="currentColor" strokeWidth="1" />
        </svg>
      ))}
    </>
  );
}

/** Maximum tilt toward the pointer, in degrees. Enough to read as physical,
 *  not enough to distort the composition. */
const TILT = 3;

export function PlateFrame({
  ground,
  index,
  title,
  meta,
  footer,
  footerFromSm = false,
  aspectClass,
  label,
  running = false,
  interactive = true,
  children,
}: {
  ground: Ground;
  index: string;
  title: string;
  /** Right-hand spec text on the top rail. Hidden on phones. */
  meta?: string;
  /** Bottom-left readout. Keep it short enough for a 340px plate. */
  footer?: string;
  /** Hide the footer chip on phones, for compositions whose phone crop
   *  puts art where the chip would sit. */
  footerFromSm?: boolean;
  /** Tailwind aspect-ratio classes, responsive if needed. */
  aspectClass: string;
  /** Accessible name. Without one the plate is decorative and hidden. */
  label?: string;
  /** Drives CSS play-state for the plate's looping marks. */
  running?: boolean;
  /** Reticle and tilt on hover. Mouse only; off under reduced motion. */
  interactive?: boolean;
  children: React.ReactNode;
}) {
  const reduced = usePrefersReducedMotion();
  const figureRef = useRef<HTMLElement>(null);
  const reticleRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  /* The reticle follows the pointer on a stiff spring, so it trails by a
     frame or two like an instrument settling, and the plate leans a few
     degrees toward it on a softer one. Every write goes to a MotionValue or
     straight to the DOM — no React state changes while the pointer moves. */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const nx = useMotionValue(0.5);
  const ny = useMotionValue(0.5);
  const sx = useSpring(px, { stiffness: 520, damping: 44, mass: 0.35 });
  const sy = useSpring(py, { stiffness: 520, damping: 44, mass: 0.35 });
  const rotateX = useSpring(useTransform(ny, [0, 1], [TILT, -TILT]), {
    stiffness: 170,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(nx, [0, 1], [-TILT, TILT]), {
    stiffness: 170,
    damping: 20,
  });

  const track = (e: React.PointerEvent, enter: boolean) => {
    if (!interactive || reduced || e.pointerType !== "mouse") return;
    const fig = figureRef.current;
    if (!fig) return;
    // Measure the figure, not the tilted plate: the figure's box is never
    // transformed by the tilt, so the coordinates stay exact.
    const r = fig.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const fx = r.width ? x / r.width : 0.5;
    const fy = r.height ? y / r.height : 0.5;
    if (enter) {
      sx.jump(x);
      sy.jump(y);
    }
    px.set(x);
    py.set(y);
    nx.set(fx);
    ny.set(fy);

    const reticle = reticleRef.current;
    if (reticle) reticle.style.opacity = "1";
    const readout = readoutRef.current;
    if (readout) {
      // A true readout: where the pointer sits on the plate, 0 to 1.
      readout.textContent = "X " + fx.toFixed(2) + " · Y " + fy.toFixed(2);
      // Flip to the other side near the right and bottom edges.
      const flipX = fx > 0.66 ? "calc(-100% - 36px)" : "0px";
      const flipY = fy > 0.78 ? "calc(-100% - 36px)" : "0px";
      readout.style.transform = "translate(" + flipX + ", " + flipY + ")";
    }
  };

  const release = () => {
    nx.set(0.5);
    ny.set(0.5);
    if (reticleRef.current) reticleRef.current.style.opacity = "0";
  };

  const a11y = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);

  return (
    <figure
      ref={figureRef}
      data-reveal
      className="relative m-0 [perspective:1400px]"
      {...a11y}
    >
      {/* Crop marks sit outside the tilt, so they stay put while the plate
          leans — the registration reads against the movement. */}
      <CropMarks />
      <motion.div
        className="relative"
        style={{ rotateX, rotateY }}
        onPointerEnter={(e) => track(e, true)}
        onPointerMove={(e) => track(e, false)}
        onPointerLeave={release}
      >
        <div
          className={`plate plate-${ground} ${aspectClass}`}
          data-running={running ? "true" : "false"}
        >
          <div className="absolute inset-0 z-[1]">{children}</div>

          {/* Grain sits over the art, like tooth on a print. */}
          <div className="pointer-events-none absolute inset-0 z-[1]">
            <Grain
              opacity={ground === "ink" ? 0.06 : 0.1}
              blend={ground === "ink" ? "screen" : "multiply"}
            />
          </div>

          {/* The reticle: a full-bleed crosshair, a target box and a readout. */}
          {interactive && (
            <div
              ref={reticleRef}
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[3] opacity-0 transition-opacity duration-[var(--dur-fast)]"
            >
              <motion.span
                className="absolute inset-x-0 top-0 block h-px bg-[var(--plate-reticle)] opacity-55"
                style={{ y: sy }}
              />
              <motion.span
                className="absolute inset-y-0 left-0 block w-px bg-[var(--plate-reticle)] opacity-55"
                style={{ x: sx }}
              />
              <motion.span className="absolute left-0 top-0 block" style={{ x: sx, y: sy }}>
                <span className="absolute -left-3 -top-3 block h-6 w-6 border border-[var(--plate-reticle)]" />
                <span className="absolute -left-px -top-px block h-0.5 w-0.5 bg-[var(--plate-reticle)]" />
                <span
                  ref={readoutRef}
                  className="mono-label absolute left-[18px] top-[18px] block whitespace-nowrap rounded-pill bg-[var(--plate-chip-bg)] px-2 py-0.5 text-[var(--plate-chip-fg)]"
                />
              </motion.span>
            </div>
          )}

          {/* Rails. Labels are chips so they stay legible over whatever art
              happens to sit under them. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex items-start justify-between gap-4 p-3 md:p-4">
            <span className="mono-label inline-flex items-center gap-1.5 rounded-pill bg-[var(--plate-chip-bg)] py-1 pl-1.5 pr-2.5 text-[var(--plate-chip-fg)]">
              <RegMark size={11} className="text-marigold" />
              {index} / {title}
            </span>
            {meta && (
              <span className="mono-label hidden pt-1 text-right text-[var(--plate-muted)] sm:block">
                {meta}
              </span>
            )}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between gap-4 p-3 md:p-4">
            {footer ? (
              <span
                className={`mono-label rounded-pill bg-[var(--plate-chip-bg)] px-2.5 py-1 text-[var(--plate-chip-fg)] ${footerFromSm ? "hidden sm:inline-flex" : "inline-flex"}`}
              >
                {footer}
              </span>
            ) : (
              <span />
            )}
            <Barcode
              seed={`${index}-${title}`}
              bars={18}
              height={16}
              className="hidden shrink-0 opacity-80 sm:block"
            />
          </div>
        </div>
      </motion.div>
    </figure>
  );
}

/* -------------------------------------------------------------------------
   EuclidPlate — the review plate. Stone ground.

   An ink field with fine hatching, rounded slabs crossing into the stone,
   a marigold diagonal, a cut-corner frame, a ring cluster and an X pair.
   The diagonal DRAWS itself along its own length as the plate scrolls in,
   and the two marks turn from a plus into an X — the review closing. They
   come to rest as X marks; the server renders that finished state.
   ------------------------------------------------------------------------- */

const X = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy - r}L${cx + r} ${cy + r}M${cx + r} ${cy - r}L${cx - r} ${cy + r}`;

export function EuclidPlate({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<SVGPathElement>(null);
  const xaRef = useRef<SVGGElement>(null);
  const xbRef = useRef<SVGGElement>(null);
  const reduced = usePrefersReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  // Keep START/END in step with the offset strings below.
  const START = 0.95;
  const END = 0.4;
  const { scrollYProgress } = useScroll({
    target: hostRef,
    offset: ["start 95%", "start 40%"],
  });

  useEffect(() => {
    const host = hostRef.current;
    const band = bandRef.current;
    const xa = xaRef.current;
    const xb = xbRef.current;
    if (!host || !band || !xa || !xb) return;

    const paint = (p: number) => {
      const e = easeOut(clamp01(p));
      band.style.strokeDashoffset = String(1 - e);
      xa.style.transform = `rotate(${(1 - e) * 45}deg)`;
      xb.style.transform = `rotate(${(e - 1) * 45}deg)`;
    };

    if (reduced) {
      paint(1);
      return;
    }

    // First paint from the element's real position, so a plate already on
    // screen at load (restored scroll, deep link) lands where it should
    // instead of snapping from the server's finished state on first scroll.
    const top = host.getBoundingClientRect().top;
    const vh = window.innerHeight;
    paint((START * vh - top) / ((START - END) * vh));

    return scrollYProgress.on("change", paint);
  }, [reduced, scrollYProgress]);

  return (
    <div ref={hostRef} className={className}>
      <PlateFrame
        ground="stone"
        index="P.02"
        title="Review plate"
        meta={`ArgosX · ${security.checks.length} checks`}
        footer="Ships at 0 findings"
        footerFromSm
        aspectClass="aspect-[16/10] md:aspect-[12/5]"
      >
        <svg
          viewBox="0 0 960 400"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full"
        >
          <defs>
            <pattern
              id={`${uid}-hatch`}
              width="9"
              height="9"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(-30)"
            >
              <line x1="0" y1="0" x2="0" y2="9" stroke="var(--color-paper)" strokeWidth="1.1" opacity="0.16" />
            </pattern>
          </defs>

          {/* The ink field, hatched. */}
          <path d="M0 0H600L0 330Z" fill="var(--color-ink)" />
          <path d="M0 0H600L0 330Z" fill={`url(#${uid}-hatch)`} />

          {/* The marigold diagonal. Drawn as one thick stroke so it can draw
              itself along its own length; the ends sit outside the viewBox,
              so the plate edge crops it square. */}
          <path
            ref={bandRef}
            d="M700 -30.25L-60 387.75"
            fill="none"
            stroke="var(--color-marigold)"
            strokeWidth="44"
            pathLength={1}
            strokeDasharray="1"
            strokeDashoffset="0"
          />
          {/* A construction line parallel to it, on the stone side. */}
          <path
            d="M760 0L0 418"
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="1"
            opacity="0.55"
            className="draw-path"
            pathLength={1}
            style={{ ["--draw-i" as string]: 1 }}
          />

          {/* Rounded slabs, crossing from ink into stone. */}
          <rect x="-44" y="44" width="480" height="88" rx="44" fill="var(--color-stone-hi)" />
          <line x1="40" y1="88" x2="392" y2="88" stroke="var(--color-ink)" strokeWidth="5" strokeLinecap="round" />
          <rect x="132" y="156" width="480" height="88" rx="44" fill="var(--color-stone-hi)" />
          <line x1="196" y1="200" x2="556" y2="200" stroke="var(--color-marigold)" strokeWidth="5" strokeLinecap="round" />

          {/* Cut-corner frame. */}
          <path
            d="M628 58H792L840 106V270H676L628 222Z"
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="1.4"
            className="draw-path"
            pathLength={1}
            style={{ ["--draw-i" as string]: 2 }}
          />
          <path d="M848 70l14 14l-14 14" fill="none" stroke="var(--color-ink)" strokeWidth="1.6" />

          {/* Ring cluster. */}
          {[10, 22, 34, 46, 58].map((r, i) => (
            <circle
              key={r}
              cx="760"
              cy="296"
              r={r}
              fill="none"
              stroke="var(--color-ink)"
              strokeWidth="1.1"
              opacity={0.85 - i * 0.14}
              className="draw-path"
              pathLength={1}
              style={{ ["--draw-i" as string]: 3 + i }}
            />
          ))}
          <circle cx="760" cy="296" r="6" fill="var(--color-marigold)" />

          {/* Spec lines at the right edge. */}
          {Array.from({ length: 11 }, (_, i) => (
            <line
              key={i}
              x1="880"
              x2="960"
              y1={168 + i * 9}
              y2={168 + i * 9}
              stroke="var(--color-ink)"
              strokeWidth={i % 3 === 0 ? 2.2 : 0.8}
            />
          ))}

          {/* Registration crosses. */}
          <g stroke="var(--color-ink)" strokeWidth="1">
            <path d="M516 22v16M508 30h16" />
            <path d="M902 342v16M894 350h16" />
          </g>

          {/* The X pair: outlined, then solid with a marigold slash. */}
          <g ref={xaRef} style={{ transformOrigin: "440px 304px" }}>
            <path d={X(440, 304, 42)} fill="none" stroke="var(--color-ink)" strokeWidth="30" strokeLinecap="round" />
            <path d={X(440, 304, 42)} fill="none" stroke="var(--color-stone)" strokeWidth="17" strokeLinecap="round" />
          </g>
          <g ref={xbRef} style={{ transformOrigin: "566px 304px" }}>
            <path d={X(566, 304, 42)} fill="none" stroke="var(--color-ink)" strokeWidth="30" strokeLinecap="round" />
          </g>
          <line x1="522" y1="350" x2="612" y2="260" stroke="var(--color-marigold)" strokeWidth="4" />
        </svg>
      </PlateFrame>
    </div>
  );
}

/* -------------------------------------------------------------------------
   OrbitPlate — the season plate. Ink ground.

   Three orbits, one per hackathon this season, labelled with their real
   windows from content/club.ts. A marker travels the first — the upcoming
   cycle. Position is computed analytically on the same ellipse the ring is
   drawn with, in the same SVG coordinate space, so it tracks the ring
   exactly at any size. (An earlier version rode a CSS offset-path in pixel
   space over a scaled SVG, and drifted off the ring whenever the box was
   not exactly 320px.)
   ------------------------------------------------------------------------- */

const ORBIT = { cx: 560, cy: 480 };
const RINGS = [150, 255, 360].map((rx) => ({ rx, ry: rx * 0.9 }));
const LABEL_ANGLE = (-118 * Math.PI) / 180;
const MARKER_START = (-40 * Math.PI) / 180;

function onRing(i: number, theta: number): [number, number] {
  const { rx, ry } = RINGS[i];
  return [r3(ORBIT.cx + rx * Math.cos(theta)), r3(ORBIT.cy + ry * Math.sin(theta))];
}

function seasonSpan() {
  const first = schedule.season[0]?.deadline.slice(0, 4) ?? "";
  const last = schedule.season.at(-1)?.deadline.slice(0, 4) ?? first;
  return first === last ? first : `${first}–${last.slice(2)}`;
}

export function OrbitPlate({ className = "" }: { className?: string }) {
  const { ref: runRef, running } = useRunWhenVisible<HTMLDivElement>();
  const markerRef = useRef<SVGGElement>(null);
  const theta = useRef(MARKER_START);

  useAnimationFrame((_, delta) => {
    const marker = markerRef.current;
    if (!running || !marker) return;
    theta.current = (theta.current + (delta / 16000) * Math.PI * 2) % (Math.PI * 2);
    const [x, y] = onRing(0, theta.current);
    marker.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
  });

  const [mx, my] = onRing(0, MARKER_START);
  const cycles = schedule.season.slice(0, RINGS.length);

  return (
    <div ref={runRef} className={className}>
      <PlateFrame
        ground="ink"
        index="P.03"
        title="Season plate"
        meta={`Season ${seasonSpan()}`}
        footer={`${cycles.length} cycles`}
        aspectClass="aspect-[4/3]"
        running={running}
      >
        <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          {/* Construction lines. */}
          <g stroke="var(--color-paper)" fill="none">
            <path d="M0 540L800 70" strokeWidth="1" opacity="0.2" className="draw-path" pathLength={1} />
            <path d="M330 0L800 320" strokeWidth="1" opacity="0.16" className="draw-path" pathLength={1} style={{ ["--draw-i" as string]: 1 }} />
            <path d="M150 0V600" strokeWidth="0.8" opacity="0.18" />
          </g>

          {/* The bar, rising off the bottom edge. */}
          <path d="M64 600V176a23 23 0 0 1 46 0V600Z" fill="var(--color-marigold)" />

          {/* One orbit per hackathon. The first — the upcoming one — is marigold. */}
          {RINGS.map((r, i) => (
            <ellipse
              key={r.rx}
              cx={ORBIT.cx}
              cy={ORBIT.cy}
              rx={r.rx}
              ry={r.ry}
              fill="none"
              stroke={i === 0 ? "var(--color-marigold)" : "var(--color-paper)"}
              strokeWidth={i === 0 ? 1.8 : 1}
              opacity={i === 0 ? 1 : 0.34 - i * 0.04}
              strokeDasharray={i === 2 ? "4 7" : undefined}
              className={i === 2 ? undefined : "draw-path"}
              pathLength={i === 2 ? undefined : 1}
              style={{ ["--draw-i" as string]: 2 + i }}
            />
          ))}

          {/* The planet, with fine rings like a pressed disc. */}
          <circle cx={ORBIT.cx} cy={ORBIT.cy} r="70" fill="var(--color-marigold)" />
          {[18, 34, 50].map((r) => (
            <circle key={r} cx={ORBIT.cx} cy={ORBIT.cy} r={r} fill="none" stroke="var(--color-ink)" strokeWidth="1" opacity="0.28" />
          ))}

          {/* Ring labels: real windows, straight from the season. */}
          <g className="font-mono" style={{ letterSpacing: "0.08em" }}>
            {cycles.map((c, i) => {
              const [px, py] = onRing(i, LABEL_ANGLE);
              const accent = i === 0;
              return (
                <g key={c.name}>
                  <circle cx={px} cy={py} r="4.5" fill={accent ? "var(--color-marigold)" : "var(--color-paper)"} />
                  <line x1={px - 8} y1={py} x2={px - 26} y2={py} stroke="var(--color-paper)" strokeWidth="1" opacity="0.5" />
                  <text
                    x={px - 32}
                    y={py + 5}
                    textAnchor="end"
                    fontSize="15"
                    fontWeight="500"
                    fill={accent ? "var(--color-marigold)" : "var(--color-paper)"}
                    opacity={accent ? 1 : 0.78}
                  >
                    {String(i + 1).padStart(2, "0")}  {c.window.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </g>

          {/* The travelling marker. */}
          <g ref={markerRef} transform={`translate(${mx.toFixed(2)} ${my.toFixed(2)})`}>
            <circle r="15" fill="none" stroke="var(--color-marigold)" strokeWidth="1.4" />
            <circle r="7.5" fill="var(--color-paper)" />
          </g>
        </svg>
      </PlateFrame>
    </div>
  );
}

/* -------------------------------------------------------------------------
   ArchivePlate — the archive plate. Marigold ground.

   The word set in pixel type on a visible grid, with a ruler above it and a
   terminal cursor after it. When the plate is revealed a scan bar crosses
   and the pixels resolve column by column behind it.

   This replaces a mosaic that dissolved with scroll POSITION. The word sits
   near the top of /projects, so at its natural resting position the dissolve
   was only part-way done and the page loaded reading "SH!PPED". A one-shot
   reveal cannot rest half-finished.
   ------------------------------------------------------------------------- */

const GLYPHS: Record<string, string[]> = {
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
};

const WORD = "SHIPPED";
const PITCH = 26;
const SQUARE = 23;
const COLS = WORD.length * 6 - 1;
const ROWS = 7;
const WORD_W = COLS * PITCH - (PITCH - SQUARE);
const X0 = 68;
const Y0 = 140;

const PIXELS = [...WORD].flatMap((ch, k) =>
  GLYPHS[ch].flatMap((row, r) =>
    [...row].flatMap((cell, c) =>
      cell === "#" ? [{ col: k * 6 + c, row: r }] : [],
    ),
  ),
);

/** How far the pointer's light reaches across the pixel grid, in viewBox units. */
const GLOW_RADIUS = 96;

export function ArchivePlate({ className = "" }: { className?: string }) {
  const { ref: runRef, running } = useRunWhenVisible<HTMLDivElement>();
  const shipped = String(projects.length).padStart(3, "0");
  const reduced = usePrefersReducedMotion();

  /* Pointer proximity, as on a node canvas: the pixels nearest the cursor
     light up in paper and fall off with distance. A separate glow layer
     sits over the word so these writes never fight the reveal's per-column
     transition delays. Painting is coalesced to one frame per pointer burst,
     and nothing runs for touch or reduced motion. */
  const hostRef = useRef<HTMLDivElement>(null);
  const glowRefs = useRef<(SVGRectElement | null)[]>([]);
  const target = useRef<{ x: number; y: number } | null>(null);
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const paintGlow = () => {
    frame.current = 0;
    const t = target.current;
    PIXELS.forEach((px, i) => {
      const el = glowRefs.current[i];
      if (!el) return;
      if (!t) {
        el.style.opacity = "0";
        return;
      }
      const cx = X0 + px.col * PITCH + SQUARE / 2;
      const cy = Y0 + px.row * PITCH + SQUARE / 2;
      const k = Math.max(0, 1 - Math.hypot(cx - t.x, cy - t.y) / GLOW_RADIUS);
      el.style.opacity = String(Math.round(k * k * 100) / 100);
    });
  };

  const schedule = () => {
    if (!frame.current) frame.current = requestAnimationFrame(paintGlow);
  };

  const onGlowMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== "mouse" || !hostRef.current) return;
    const r = hostRef.current.getBoundingClientRect();
    // The SVG uses "meet": uniform scale, centred with letterbox margins.
    const scale = Math.min(r.width / 1200, r.height / 440) || 1;
    const offX = (r.width - 1200 * scale) / 2;
    const offY = (r.height - 440 * scale) / 2;
    target.current = {
      x: (e.clientX - r.left - offX) / scale,
      y: (e.clientY - r.top - offY) / scale,
    };
    schedule();
  };

  const onGlowLeave = () => {
    target.current = null;
    schedule();
  };

  return (
    <div ref={runRef} className={className}>
      <PlateFrame
        ground="marigold"
        index="P.04"
        title="Archive plate"
        meta={`${COLS} × ${String(ROWS).padStart(2, "0")} grid`}
        footer={`${shipped} deployments on record`}
        aspectClass="aspect-[16/10] sm:aspect-[30/11]"
        running={running}
      >
        <div
          ref={hostRef}
          className="h-full w-full"
          onPointerMove={onGlowMove}
          onPointerLeave={onGlowLeave}
        >
        <svg viewBox="0 0 1200 440" preserveAspectRatio="xMidYMid meet" className="h-full w-full">
          {/* Ruler: a tick per column, numbered every ten. */}
          <g stroke="var(--color-ink)">
            {Array.from({ length: COLS + 1 }, (_, c) => (
              <line
                key={c}
                x1={X0 + c * PITCH - 1.5}
                x2={X0 + c * PITCH - 1.5}
                y1={Y0 - 20}
                y2={Y0 - (c % 5 === 0 ? 34 : 26)}
                strokeWidth={c % 5 === 0 ? 1.4 : 0.8}
                opacity={c % 5 === 0 ? 0.8 : 0.45}
              />
            ))}
          </g>
          <g className="font-mono" fontSize="14" fill="var(--color-ink)" opacity="0.72">
            {[0, 10, 20, 30, 40].map((c) => (
              <text key={c} x={X0 + c * PITCH - 1.5} y={Y0 - 42} textAnchor="middle">
                {String(c).padStart(2, "0")}
              </text>
            ))}
          </g>

          {/* The empty grid the word is set on. */}
          <g fill="var(--color-ink)" opacity="0.07">
            {Array.from({ length: COLS * ROWS }, (_, i) => (
              <rect
                key={i}
                x={X0 + (i % COLS) * PITCH}
                y={Y0 + Math.floor(i / COLS) * PITCH}
                width={SQUARE}
                height={SQUARE}
              />
            ))}
          </g>

          {/* The word. */}
          <g fill="var(--color-ink)">
            {PIXELS.map((p) => (
              <rect
                key={`${p.col}-${p.row}`}
                className="px"
                x={X0 + p.col * PITCH}
                y={Y0 + p.row * PITCH}
                width={SQUARE}
                height={SQUARE}
                style={{ ["--px-col" as string]: p.col, ["--px-row" as string]: p.row }}
              />
            ))}
          </g>

          {/* The pointer's light over the word. Invisible at rest. */}
          <g fill="var(--color-paper)" aria-hidden>
            {PIXELS.map((p, i) => (
              <rect
                key={`g-${p.col}-${p.row}`}
                ref={(el) => {
                  glowRefs.current[i] = el;
                }}
                x={X0 + p.col * PITCH}
                y={Y0 + p.row * PITCH}
                width={SQUARE}
                height={SQUARE}
                className="transition-opacity duration-[var(--dur-fast)]"
                style={{ opacity: 0 }}
              />
            ))}
          </g>

          {/* Cursor. */}
          <rect
            className="px-cursor"
            x={X0 + WORD_W + 12}
            y={Y0 + 5 * PITCH}
            width={SQUARE}
            height={PITCH + SQUARE}
            fill="var(--color-ink)"
          />

          {/* Baseline rule with registration crosses. */}
          <line
            x1={X0}
            x2={X0 + WORD_W}
            y1={Y0 + ROWS * PITCH + 20}
            y2={Y0 + ROWS * PITCH + 20}
            stroke="var(--color-ink)"
            strokeWidth="1.2"
            className="draw-path"
            pathLength={1}
          />
          <g stroke="var(--color-ink)" strokeWidth="1">
            <path d={`M${X0 - 26} ${Y0 + ROWS * PITCH + 12}v16M${X0 - 34} ${Y0 + ROWS * PITCH + 20}h16`} />
            <path d={`M${X0 + WORD_W + 26} ${Y0 + ROWS * PITCH + 12}v16M${X0 + WORD_W + 18} ${Y0 + ROWS * PITCH + 20}h16`} />
          </g>

          {/* The scan bar that leads the pixels across. */}
          <rect
            className="scanline"
            x={X0 - 14}
            y={Y0 - 12}
            width="5"
            height={ROWS * PITCH + 20}
            fill="var(--color-paper)"
            style={{ ["--scan-dist" as string]: `${WORD_W + 28}px` }}
          />
        </svg>
        </div>
      </PlateFrame>
    </div>
  );
}

/* -------------------------------------------------------------------------
   GatePlate — the signal plate. Ink ground, portrait.

   A wireframe mast standing on a marigold floor, thin beams converging on
   it, shards thrown off it, a signal pulsing from its tip, and the name set
   vertically in outline along the right edge, cropped by the plate.

   The shards are the one thing on the site driven by scroll SPEED rather
   than position: they reach out as you move and settle when you stop.
   ------------------------------------------------------------------------- */

const MAST = { x: 250, top: 110, base: 500, halfTop: 18, halfBase: 54 };
const LEVELS = [110, 170, 240, 320, 410, 500];
const legX = (y: number) =>
  MAST.halfTop + ((y - MAST.top) / (MAST.base - MAST.top)) * (MAST.halfBase - MAST.halfTop);

const SHARDS = [
  "M250 300L472 206L250 306Z",
  "M250 300L484 352L250 308Z",
  "M250 300L378 474L250 310Z",
  "M250 300L36 226L250 304Z",
  "M250 300L92 424L250 310Z",
];
const SHARD_REST = 0.55;

export function GatePlate({ className = "" }: { className?: string }) {
  const { ref: runRef, running } = useRunWhenVisible<HTMLDivElement>();
  const shardRefs = useRef<(SVGPathElement | null)[]>([]);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const eased = useRef(0);

  useAnimationFrame(() => {
    if (!running) return;
    const target = Math.min(1, Math.abs(velocity.get()) / 2400);
    // Ease towards the target so the shards settle rather than jitter.
    eased.current += (target - eased.current) * 0.08;
    shardRefs.current.forEach((el, i) => {
      if (!el) return;
      const k = SHARD_REST + eased.current * (0.55 + i * 0.08);
      el.style.transform = `scale(${k.toFixed(3)})`;
    });
  });

  return (
    <div ref={runRef} className={className}>
      <PlateFrame
        ground="ink"
        index="P.05"
        title="Signal plate"
        meta="Open · every grade"
        footer={`${meeting.room} · ${meeting.time}`.toUpperCase()}
        aspectClass="aspect-[25/32]"
        running={running}
      >
        <svg viewBox="0 0 500 640" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
          {/* The exposed grid. */}
          <g stroke="var(--color-paper)" strokeWidth="1" opacity="0.07">
            {Array.from({ length: 12 }, (_, i) => (
              <line key={`v${i}`} x1={i * 44 + 8} x2={i * 44 + 8} y1="0" y2="640" />
            ))}
            {Array.from({ length: 15 }, (_, i) => (
              <line key={`h${i}`} y1={i * 44 + 12} y2={i * 44 + 12} x1="0" x2="500" />
            ))}
          </g>

          {/* The name, vertical, in outline, cropped by the right edge. */}
          <text
            transform="translate(528 616) rotate(-90)"
            fontSize="132"
            fontWeight="700"
            fill="none"
            stroke="var(--color-paper)"
            strokeWidth="1.1"
            opacity="0.34"
            style={{ fontFamily: "var(--font-sans)", letterSpacing: "-0.02em" }}
          >
            SHIP IT
          </text>

          {/* Beams converging on the mast. */}
          <g stroke="var(--color-marigold)" fill="none">
            <path d="M118 0L250 300" strokeWidth="1.6" className="draw-path" pathLength={1} />
            <path d="M0 96L250 300" strokeWidth="1" opacity="0.8" className="draw-path" pathLength={1} style={{ ["--draw-i" as string]: 1 }} />
            <path d="M500 48L250 300" strokeWidth="0.8" opacity="0.6" className="draw-path" pathLength={1} style={{ ["--draw-i" as string]: 2 }} />
          </g>

          {/* The mast. */}
          <g stroke="var(--color-paper)" fill="none" strokeLinecap="round">
            <path d={`M${MAST.x} 40V${MAST.base}`} strokeWidth="1.2" opacity="0.7" />
            <path
              d={`M${MAST.x - MAST.halfTop} ${MAST.top}L${MAST.x - MAST.halfBase} ${MAST.base}M${MAST.x + MAST.halfTop} ${MAST.top}L${MAST.x + MAST.halfBase} ${MAST.base}`}
              strokeWidth="1.4"
              opacity="0.85"
            />
            {LEVELS.map((y) => (
              <path key={y} d={`M${MAST.x - legX(y)} ${y}H${MAST.x + legX(y)}`} strokeWidth="1" opacity="0.7" />
            ))}
            {/* X-bracing between levels. */}
            {LEVELS.slice(0, -1).map((y, i) => {
              const y2 = LEVELS[i + 1];
              return (
                <path
                  key={`b${y}`}
                  d={`M${MAST.x - legX(y)} ${y}L${MAST.x + legX(y2)} ${y2}M${MAST.x + legX(y)} ${y}L${MAST.x - legX(y2)} ${y2}`}
                  strokeWidth="0.7"
                  opacity="0.42"
                />
              );
            })}
            {/* Platforms. */}
            <ellipse cx={MAST.x} cy="170" rx="46" ry="9" strokeWidth="1.1" opacity="0.75" />
            <ellipse cx={MAST.x} cy="320" rx="66" ry="12" strokeWidth="1.1" opacity="0.75" />
            {/* Antenna. */}
            <path d={`M${MAST.x - 10} 58H${MAST.x + 10}M${MAST.x - 6} 76H${MAST.x + 6}M${MAST.x} 40V20`} strokeWidth="1" opacity="0.75" />
            {/* Circuit arms. */}
            <path d={`M${MAST.x - legX(240)} 240H150V228M${MAST.x + legX(240)} 240H352V228`} strokeWidth="0.9" opacity="0.55" />
            <path d={`M118 392H${MAST.x - legX(392)}M${MAST.x + legX(392)} 392H392`} strokeWidth="0.9" opacity="0.45" />
          </g>
          <g fill="var(--color-paper)" opacity="0.8">
            <circle cx="150" cy="226" r="3" />
            <circle cx="352" cy="226" r="3" />
            <circle cx="118" cy="392" r="3" />
            <circle cx="392" cy="392" r="3" />
            <circle cx={MAST.x} cy="20" r="3" />
          </g>

          {/* Signal off the tip. */}
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              className="signal-ring"
              cx={MAST.x}
              cy="20"
              r="10"
              fill="none"
              stroke="var(--color-marigold)"
              strokeWidth="1.3"
              style={{ ["--sig-i" as string]: i }}
            />
          ))}

          {/* The floor. */}
          <path d="M0 522L500 468V640H0Z" fill="var(--color-marigold)" />
          <g stroke="var(--color-ink)" fill="none">
            <path d="M204 558L252 532H392L426 558L392 584H252Z" strokeWidth="1.3" />
            <path d="M272 558H372" strokeWidth="1" opacity="0.7" />
            {Array.from({ length: 24 }, (_, i) => {
              const x = 14 + i * 20;
              const y = 522 - (x * 54) / 500;
              return <path key={i} d={`M${x} ${y + 7}V${y + (i % 4 === 0 ? 19 : 13)}`} strokeWidth="1" />;
            })}
          </g>

          {/* The shards, off the mast. */}
          {SHARDS.map((d, i) => (
            <path
              key={d}
              ref={(el) => {
                shardRefs.current[i] = el;
              }}
              d={d}
              fill="var(--color-marigold)"
              opacity={0.92 - i * 0.06}
              style={{ transformOrigin: "250px 300px", transform: `scale(${SHARD_REST})` }}
            />
          ))}
          <circle cx="250" cy="300" r="14" fill="none" stroke="var(--color-marigold)" strokeWidth="1.3" />
          <circle cx="250" cy="300" r="6.5" fill="var(--color-marigold)" />
        </svg>
      </PlateFrame>
    </div>
  );
}
