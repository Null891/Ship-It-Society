"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/* ==========================================================================
   External-store hooks.

   The media query and the clock are both things React does not own, so they
   are read through useSyncExternalStore rather than mirrored into state
   inside an effect. That keeps the server snapshot explicit, avoids the
   cascading render that setState-in-effect causes, and gives the correct
   value on the very first client render.
   ========================================================================== */

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia(REDUCED_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const getReducedMotion = () => window.matchMedia(REDUCED_QUERY).matches;
/** The server cannot know, so it assumes full motion — the common case. */
const getReducedMotionServer = () => false;

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotion,
    getReducedMotionServer,
  );
}

/* --- Clock ---------------------------------------------------------------
   getSnapshot has to return a cached value; returning Date.now() directly
   would give React a new value on every call and spin forever. The cache is
   advanced by the interval instead.
   ------------------------------------------------------------------------ */

let cachedNow = 0;
const clockListeners = new Set<() => void>();
let clockTimer: ReturnType<typeof setInterval> | null = null;

function subscribeClock(onChange: () => void) {
  clockListeners.add(onChange);
  if (clockTimer === null) {
    cachedNow = Date.now();
    clockTimer = setInterval(() => {
      cachedNow = Date.now();
      for (const listener of clockListeners) listener();
    }, 1000);
  }
  return () => {
    clockListeners.delete(onChange);
    if (clockListeners.size === 0 && clockTimer !== null) {
      clearInterval(clockTimer);
      clockTimer = null;
    }
  };
}

const getClock = () => cachedNow;
/** Zero means "no clock yet". Consumers render placeholders for it, so the
 *  server and the hydrating client always agree. */
const getClockServer = () => 0;

export function useNow(): number {
  return useSyncExternalStore(subscribeClock, getClock, getClockServer);
}

/* --- Run gate -------------------------------------------------------------
   Every continuous animation on the site (the marquee, the dials, the grain)
   goes through this. It returns true only while the element is on screen AND
   the tab is visible.

   Members open this on school Chromebooks. A ticker that keeps running in a
   background tab, or three dials spinning far below the fold, is battery
   spent on something nobody is looking at. Reduced motion pins it to false,
   which is also the server value — so nothing loops before hydration.
   ------------------------------------------------------------------------ */

export function useRunWhenVisible<T extends Element>() {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();
  const [onScreen, setOnScreen] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => setOnScreen(e.isIntersecting),
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState === "visible");
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return { ref, running: !reduced && onScreen && tabVisible };
}
