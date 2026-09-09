"use client";

import { useEffect } from "react";

/* ==========================================================================
   One observer for every reveal on the page.

   Mounted once in the root layout. Previously each reveal carried its own
   Motion `whileInView`, which meant one IntersectionObserver per element and
   a client component for every heading. This is a single observer plus a
   MutationObserver for nodes that arrive later (route changes, conditional
   sections), which is both cheaper and easier to reason about.

   The hiding itself is CSS (see globals.css). This only ever ADDS `.is-in`,
   so if this component fails to run for any reason the page is still fully
   visible — the failure mode is "no animation", never "no content".
   ========================================================================== */

const SELECTOR = "[data-reveal],[data-reveal-lines]";

export function RevealRoot() {
  useEffect(() => {
    const root = document.documentElement;

    // If the pre-paint script decided not to animate — background tab,
    // reduced motion, no IntersectionObserver — there is nothing to reveal
    // because nothing was ever hidden.
    if (!root.classList.contains("anim")) return;

    // Report in, so the boot script's dead-man's switch does not disarm the
    // animation three seconds from now. If this line never runs, the page
    // falls back to fully visible rather than staying blank.
    root.dataset.revealReady = "1";

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
    );

    const observe = (el: Element) => {
      if (el.classList.contains("is-in")) return;
      io.observe(el);
    };

    document.querySelectorAll(SELECTOR).forEach(observe);

    // Sections that mount later still need observing.
    const mo = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches(SELECTOR)) observe(node);
          node.querySelectorAll?.(SELECTOR).forEach(observe);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    /* Last-resort guarantee. If the tab is hidden the observer may never
       fire; when the user comes back, reveal anything already on screen
       rather than leaving them looking at gaps. Cheap, and only runs on an
       actual visibility change. */
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      document.querySelectorAll(SELECTOR).forEach((el) => {
        if (el.classList.contains("is-in")) return;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          el.classList.add("is-in");
          io.unobserve(el);
        }
      });
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
