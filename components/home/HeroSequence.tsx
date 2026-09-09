"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "motion/react";
import { drawFrame, STATIC_FRAME, type Palette } from "@/lib/sequence";
import { hero } from "@/content/club";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { Grain } from "@/components/ui/Texture";
import { Annotation, Barcode, Dial, RegMark, Scramble } from "@/components/ui/Poster";

/* ==========================================================================
   The hero.

   A tall section containing a sticky viewport. Scroll progress across the
   section drives the canvas directly through a MotionValue subscription —
   no React state, so nothing re-renders while scrubbing.

   Pinning is CSS position: sticky, not a JS pin. It survives resize, it does
   not mutate the DOM, and it cannot desynchronise from the scrollbar.
   ========================================================================== */

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Canvas cannot read CSS custom properties, so resolve them once at mount
 *  and hand them to the pure draw function. Tokens stay the single source. */
function readPalette(): Palette {
  const s = getComputedStyle(document.documentElement);
  const get = (name: string, fallback: string) =>
    s.getPropertyValue(name).trim() || fallback;
  return {
    ink: get("--color-ink", "#000000"),
    paper: get("--color-paper", "#ffffff"),
    muted: get("--color-muted", "#86868b"),
    line: get("--color-line-dark", "rgba(255,255,255,0.14)"),
    marigold: get("--color-marigold", "#ff9f0a"),
    surface: get("--color-surface-900", "#1d1d1f"),
  };
}

export function HeroSequence() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const paletteRef = useRef<Palette | null>(null);
  const progressRef = useRef(0);
  const reduced = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // The headline hands the stage over to the sequence, then leaves.
  //
  // These are driven imperatively rather than through style={{ opacity: mv }}.
  // Motion promotes a scroll-linked MotionValue bound to style into a native
  // WAAPI ScrollTimeline animation, and that path mishandles keyframe offsets:
  // it plays the keyframes across the head of the timeline and then runs them
  // BACKWARDS over the remainder, so the headline faded out and then faded
  // straight back in on top of the canvas. Writing the styles ourselves from
  // the same subscription that drives the canvas keeps one source of truth
  // and cannot drift.
  const titleRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);

  // Cursor parallax. Eight pixels at the extremes — enough that the
  // composition feels like it occupies space, small enough that nobody
  // consciously notices it moving. Transform only, so the canvas is never
  // redrawn for it.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const driftX = useSpring(pointerX, { stiffness: 55, damping: 22, mass: 0.7 });
  const driftY = useSpring(pointerY, { stiffness: 55, damping: 22, mass: 0.7 });

  const handlePointer = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Coarse pointers have no hover position to track.
      if (e.pointerType !== "mouse" || reduced) return;
      const r = e.currentTarget.getBoundingClientRect();
      pointerX.set(((e.clientX - r.left) / r.width - 0.5) * 16);
      pointerY.set(((e.clientY - r.top) / r.height - 0.5) * 16);
    },
    [pointerX, pointerY, reduced],
  );

  const resetPointer = useCallback(() => {
    pointerX.set(0);
    pointerY.set(0);
  }, [pointerX, pointerY]);

  /** Fade the headline out, lift it slightly, and retire the scroll cue. */
  const paintChrome = useCallback((p: number) => {
    const title = titleRef.current;
    if (title) {
      const o = 1 - clamp01((p - 0.1) / 0.06);
      title.style.opacity = String(o);
      title.style.transform = `translateY(${-40 * clamp01(p / 0.16)}px)`;
      // Once invisible it must also stop catching clicks.
      title.style.pointerEvents = o < 0.02 ? "none" : "";
    }
    const cue = cueRef.current;
    if (cue) cue.style.opacity = String(1 - clamp01(p / 0.05));
  }, []);

  const render = useCallback((p: number) => {
    const canvas = canvasRef.current;
    const pal = paletteRef.current;
    if (!canvas || !pal) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    drawFrame(ctx, p, width, height, pal);
  }, []);

  // Size the backing store to the device pixel ratio, then redraw at whatever
  // progress we are currently at. Resizing mid-sequence must not jump.
  const resize = useCallback(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const { width, height } = stage.getBoundingClientRect();
    if (width === 0 || height === 0) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
    render(progressRef.current);
  }, [render]);

  useEffect(() => {
    paletteRef.current = readPalette();
    progressRef.current = reduced ? STATIC_FRAME : scrollYProgress.get();
    resize();
    if (!reduced) paintChrome(progressRef.current);

    const stage = stageRef.current;
    const ro = new ResizeObserver(resize);
    if (stage) ro.observe(stage);

    // Geist Mono is not available to canvas until it has loaded. Redraw once
    // it is, so the readout is not left in the fallback face.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) render(progressRef.current);
    });

    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [reduced, resize, render, paintChrome, scrollYProgress]);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduced) return;
    progressRef.current = p;
    render(p);
    paintChrome(p);
  });

  return (
    <section
      ref={sectionRef}
      className="hero-track relative"
      aria-labelledby="hero-title"
    >
      <div
        ref={stageRef}
        onPointerMove={handlePointer}
        onPointerLeave={resetPointer}
        className="sticky top-0 h-[100svh] w-full overflow-hidden bg-ink"
      >
        <motion.canvas
          ref={canvasRef}
          aria-hidden
          className="absolute inset-0 h-full w-full"
          style={reduced ? undefined : { x: driftX, y: driftY }}
        />

        <Grain opacity={0.04} />

        {/* A soft floor under the type so it never sits on a busy patch. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
          style={{
            background:
              "linear-gradient(to top, color-mix(in srgb, var(--color-ink) 88%, transparent), transparent)",
          }}
        />

        {/* --- Poster furniture ------------------------------------------
            Spec-sheet marginalia pinned to the corners of the stage. These
            label the sequence the way a technical poster labels a diagram:
            an index, a scale, a registration mark, a barcode. All decorative
            and aria-hidden — the page reads identically without them. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden text-[var(--color-muted)] md:block"
        >
          <div className="edge relative h-full">
            {/* top-left: the section index and a live spec line */}
            <div className="absolute left-[24px] top-[104px] flex items-start gap-4 md:left-[40px] xl:left-[56px]">
              <RegMark size={16} className="mt-[2px] text-marigold" />
              <div>
                <Annotation tone="current" className="block">
                  01 / Sequence
                </Annotation>
                {/* Resolves out of noise once, like a readout coming online.
                    The real string is in the DOM from the first byte and is
                    what assistive tech reads — the scramble only ever
                    overwrites it for a beat. */}
                <Annotation tone="current" className="mt-1 block opacity-60">
                  <Scramble text="30D · IDEA TO DEPLOYED" duration={1100} />
                </Annotation>
              </div>
            </div>

            {/* right: the dial, straight off the turntable poster */}
            <div className="absolute right-[24px] top-1/2 -translate-y-1/2 md:right-[40px] xl:right-[56px]">
              <Dial size={116} className="text-[var(--color-muted)] opacity-70" />
            </div>

            {/* bottom-left: barcode + build stamp */}
            <div className="absolute bottom-[92px] left-[24px] md:left-[40px] xl:left-[56px]">
              <Barcode seed="ship-it-society-01" bars={34} height={26} className="opacity-45" />
              <Annotation tone="current" className="mt-2 block opacity-55">
                FHS · SUNNYVALE CA
              </Annotation>
            </div>

            {/* bottom-right: the vertical set label */}
            <div className="absolute bottom-[92px] right-[24px] md:right-[40px] xl:right-[56px]">
              <Annotation
                tone="current"
                className="block opacity-55 [writing-mode:vertical-rl]"
              >
                BUILD · TEST · SHIP
              </Annotation>
            </div>
          </div>
        </div>

        <div
          ref={titleRef}
          className="edge relative flex h-full flex-col justify-center"
        >
          {/* These used Motion mount animations with initial={{opacity:0}},
              which shipped opacity:0 in the server HTML and then relied on
              requestAnimationFrame to bring it back. Browsers throttle rAF in
              background tabs, so opening this page in a background tab left
              the entire hero — eyebrow, headline, standfirst, both CTAs —
              invisible indefinitely. It is now the same CSS reveal the rest
              of the site uses: nothing is hidden unless html.anim is set, and
              the boot script only sets that for a visible tab. */}
          <div>
            <p
              data-reveal=""
              style={{ "--reveal-i": 1 } as React.CSSProperties}
              className="mono-label mb-6 text-[var(--color-muted)]"
            >
              {hero.eyebrow}
            </p>

            <h1
              id="hero-title"
              data-reveal-lines=""
              className="optical text-5xl font-semibold text-paper"
            >
              {hero.headline.map((line, i) => (
                <span key={line} className="block overflow-hidden pb-[0.06em]">
                  <span
                    className="reveal-line"
                    style={{ "--reveal-i": i + 1 } as React.CSSProperties}
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h1>

            <p
              data-reveal=""
              style={{ "--reveal-i": 4 } as React.CSSProperties}
              className="pretty mt-7 max-w-[46ch] text-lg text-[#c7c7cc]"
            >
              {hero.standfirst}
            </p>

            <div
              data-reveal=""
              style={{ "--reveal-i": 6 } as React.CSSProperties}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Link
                href={hero.primaryCta.href}
                className="rounded-pill bg-marigold px-6 py-3 text-base font-medium text-ink transition-[background-color,transform] duration-[var(--dur-fast)] ease-[var(--ease-apple)] hover:bg-marigold-hi active:scale-[0.98]"
              >
                {hero.primaryCta.label}
              </Link>
              <Link
                href={hero.secondaryCta.href}
                className="rounded-pill border border-[var(--color-line-dark)] px-6 py-3 text-base text-paper transition-colors duration-[var(--dur-fast)] hover:border-[rgba(255,255,255,0.34)]"
              >
                {hero.secondaryCta.label}
              </Link>
            </div>
          </div>
        </div>

        {!reduced && (
          <div
            ref={cueRef}
            className="pointer-events-none absolute inset-x-0 bottom-7 flex justify-center"
          >
            <span className="mono-label text-[var(--color-muted)]">
              {hero.scrollCue}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
