"use client";

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
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/motion/Magnetic";
import { Viewfinder, type ViewfinderHandle } from "@/components/home/hero/Viewfinder";
import { CYCLE_WEEK_TITLES } from "@/components/home/fx/cycle";
import styles from "@/components/home/hero/hero.module.css";

/* ==========================================================================
   The hero.

   A tall section containing a sticky viewport. Scroll progress across the
   section drives the canvas directly through a MotionValue subscription —
   no React state, so nothing re-renders while scrubbing.

   Pinning is CSS position: sticky, not a JS pin. It survives resize, it does
   not mutate the DOM, and it cannot desynchronise from the scrollbar.

   The type's entrance is plain CSS keyframes (hero.module.css), NOT the
   site-wide [data-reveal] system. Reveals stay hidden until an
   IntersectionObserver fires after hydration, which put the largest text on
   the page — the LCP element — behind the JavaScript bundle. These start
   with the stylesheet instead: no observer, no hydration, no html.anim.
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
  const viewfinderRef = useRef<ViewfinderHandle>(null);
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

  /** Fade the headline out, lift it slightly, and update the HUD. */
  const paintChrome = useCallback((p: number) => {
    const title = titleRef.current;
    if (title) {
      const o = 1 - clamp01((p - 0.1) / 0.06);
      title.style.opacity = String(o);
      title.style.transform = `translateY(${-40 * clamp01(p / 0.16)}px)`;
      // Once invisible it must also stop catching clicks.
      title.style.pointerEvents = o < 0.02 ? "none" : "";
    }
    viewfinderRef.current?.paint(p);
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
    // Reduced motion rests on the finished frame, and the HUD has to agree
    // with it: the overlay reports the state the picture is actually in.
    if (reduced) viewfinderRef.current?.paint(STATIC_FRAME);
    else paintChrome(progressRef.current);

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

  /* Coalesce redraws to one per frame.

     Lenis emits several scroll updates inside a single frame, and this
     handler previously ran a full drawFrame for every one of them — the
     canvas was being painted two or three times for a picture the user sees
     once. Measured on a 4x-throttled CPU (Chromebook class) that was the
     entire frame budget: with the canvas neutered the same scrub ran at
     17.9ms median with zero long frames, with it on, 21ms and thirty frames
     over 50ms.

     So changes now only record the latest progress and request a frame. The
     draw happens once, in the frame, with whatever the newest value is.
     Nothing is dropped — the last write before paint always wins. */
  const frameRef = useRef(0);
  const lastDrawn = useRef(-1);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduced) return;
    progressRef.current = p;
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0;
      const next = progressRef.current;
      // Sub-pixel movement cannot change the frame; skip the work.
      if (Math.abs(next - lastDrawn.current) < 0.0004) return;
      lastDrawn.current = next;
      render(next);
      paintChrome(next);
    });
  });

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

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

        {/* The recording frame: corner brackets, construction geometry and
            the live readouts. Every field on it is real — see Viewfinder. */}
        <Viewfinder ref={viewfinderRef} cue={reduced ? null : hero.scrollCue} />

        {/* The padding is clearance for the viewfinder: the HUD owns the top
            corners and the status bar owns the foot, so the type centres in
            what is left rather than in the whole stage. */}
        <div
          ref={titleRef}
          className="edge relative z-20 flex h-full flex-col justify-center pb-[132px] pt-[168px] md:pb-[104px] md:pt-[186px]"
        >
          <div className="md:max-w-[68%] lg:max-w-[74%] xl:max-w-[80%]">
            <p
              className={`mono-label mb-6 flex items-center gap-3 text-[var(--stage-muted)] ${styles.rise}`}
              style={{ ["--in" as string]: "60ms" }}
            >
              {hero.eyebrow}
              {/* The cycle's four stages, named by the format itself. */}
              <span aria-hidden className="hidden text-[var(--stage-subtle)] sm:inline">
                {CYCLE_WEEK_TITLES.join(" · ")}
              </span>
            </p>

            <h1 id="hero-title" className="optical text-5xl font-normal text-paper">
              {hero.headline.map((line, i) => (
                <span key={line} className={styles.mask}>
                  <span
                    className={styles.line}
                    style={{ ["--in" as string]: `${i * 90}ms` }}
                  >
                    {line}
                  </span>
                </span>
              ))}
            </h1>

            <p
              className={`pretty mt-7 max-w-[46ch] text-lg text-[var(--stage-muted)] ${styles.rise}`}
              style={{ ["--in" as string]: "300ms" }}
            >
              {hero.standfirst}
            </p>

            <div
              className={`mt-10 flex flex-wrap items-center gap-3 ${styles.rise}`}
              style={{ ["--in" as string]: "400ms" }}
            >
              <Magnetic>
                <Button href={hero.primaryCta.href} size="lg" arrow>
                  {hero.primaryCta.label}
                </Button>
              </Magnetic>
              <Button href={hero.secondaryCta.href} variant="ghost" size="lg">
                {hero.secondaryCta.label}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
