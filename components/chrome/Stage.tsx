"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useMotionValueEvent, useScroll, useTransform } from "motion/react";

/* ==========================================================================
   The stage: the page's colour temperature.

   Two pieces.

   StageRoot keeps data-stage on <html> in sync with the route, so every page
   but the home page is light. The matching no-flash script lives in the root
   layout and runs before first paint.

   StageShift is a sentinel dropped into the home page at the point where the
   cinematic hero gives way to the editorial body. As it crosses the viewport
   it interpolates the stage variables from black to off-white. It writes
   INLINE properties on <html>, which outrank the data-stage rule, and
   removes them on unmount so leaving the page falls back cleanly.

   All of it is written imperatively from a MotionValue subscription. React
   never re-renders during the scroll.
   ========================================================================== */

const VARS = [
  "--page-bg",
  "--stage-fg",
  "--stage-muted",
  "--stage-line",
  "--nav-bg",
  "--nav-fg",
] as const;

export function StageRoot() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.dataset.stage = pathname === "/" ? "dark" : "light";
  }, [pathname]);

  return null;
}

export function StageShift() {
  const ref = useRef<HTMLDivElement>(null);

  // The band over which the temperature changes. The sentinel enters from the
  // bottom of the viewport and the shift completes as it reaches the top
  // third, so the change happens in the gap between sections rather than
  // underneath a block of text.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 95%", "start 25%"],
  });

  // Held dark, then opened up late. A linear ramp spends too long in a flat
  // mid-grey, which reads as a mistake rather than a transition.
  const bg = useTransform(
    scrollYProgress,
    [0, 0.55, 1],
    ["#000000", "#131315", "#f5f5f7"],
  );
  const fg = useTransform(
    scrollYProgress,
    [0, 0.55, 1],
    ["#f5f5f7", "#e8e8ed", "#1d1d1f"],
  );
  const muted = useTransform(
    scrollYProgress,
    [0, 1],
    ["#86868b", "#6e6e73"],
  );
  const line = useTransform(
    scrollYProgress,
    [0, 1],
    ["rgba(255,255,255,0.14)", "#d2d2d7"],
  );

  /* Nav chrome steps; it does not ramp.
     The page above ramps smoothly through mid-grey, and a mid-grey surface
     cannot carry light OR dark text at 4.5:1 — measured, the nav bottomed out
     at 1.71:1 around 3200px of scroll, with near-black links on a near-black
     bar. Flipping both nav colours together across a 2%-wide band means the
     nav is only ever light-on-dark or dark-on-light. The band is narrow
     enough to read as instant, and it is placed at 0.74 so the flip lands
     while the hero is still behind the bar rather than during the handover. */
  const STEP = [0, 0.73, 0.75, 1];
  const navBg = useTransform(scrollYProgress, STEP, [
    "#000000",
    "#000000",
    "#f5f5f7",
    "#f5f5f7",
  ]);
  const navFg = useTransform(scrollYProgress, STEP, [
    "#f5f5f7",
    "#f5f5f7",
    "#1d1d1f",
    "#1d1d1f",
  ]);

  useMotionValueEvent(bg, "change", (v) =>
    document.documentElement.style.setProperty("--page-bg", v),
  );
  useMotionValueEvent(fg, "change", (v) =>
    document.documentElement.style.setProperty("--stage-fg", v),
  );
  useMotionValueEvent(muted, "change", (v) =>
    document.documentElement.style.setProperty("--stage-muted", v),
  );
  useMotionValueEvent(line, "change", (v) =>
    document.documentElement.style.setProperty("--stage-line", v),
  );
  useMotionValueEvent(navBg, "change", (v) =>
    document.documentElement.style.setProperty("--nav-bg", v),
  );
  useMotionValueEvent(navFg, "change", (v) =>
    document.documentElement.style.setProperty("--nav-fg", v),
  );

  // Paint the starting values immediately, and hand the stage back on unmount.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--page-bg", bg.get());
    root.style.setProperty("--stage-fg", fg.get());
    root.style.setProperty("--stage-muted", muted.get());
    root.style.setProperty("--stage-line", line.get());
    root.style.setProperty("--nav-bg", navBg.get());
    root.style.setProperty("--nav-fg", navFg.get());
    return () => {
      for (const v of VARS) root.style.removeProperty(v);
    };
  }, [bg, fg, muted, line, navBg, navFg]);

  return <div ref={ref} aria-hidden className="h-px w-full" />;
}
