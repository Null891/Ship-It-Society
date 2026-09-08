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

const VARS = ["--page-bg", "--stage-fg", "--stage-muted", "--stage-line"] as const;

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

  // Paint the starting values immediately, and hand the stage back on unmount.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--page-bg", bg.get());
    root.style.setProperty("--stage-fg", fg.get());
    root.style.setProperty("--stage-muted", muted.get());
    root.style.setProperty("--stage-line", line.get());
    return () => {
      for (const v of VARS) root.style.removeProperty(v);
    };
  }, [bg, fg, muted, line]);

  return <div ref={ref} aria-hidden className="h-px w-full" />;
}
