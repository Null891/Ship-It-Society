"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import { useLenis } from "lenis/react";
import { Wordmark } from "@/components/brand/Wordmark";
import { Button } from "@/components/ui/Button";
import { StatusDot } from "@/components/ui/Hud";
import { club } from "@/content/club";
import { projects } from "@/content/projects";
import { DUR, EASE_OUT_EXPO } from "@/lib/motion";

/* The archive only earns a place in the nav once it has something in it —
   an empty page one click from every screen reads as unfinished. */
const LINKS = [
  { href: "/hackathons", label: "Format" },
  { href: "/handbook", label: "Handbook" },
  ...(projects.length > 0 ? [{ href: "/projects", label: "Projects" }] : []),
  { href: "/about", label: "About" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/get-involved", label: "Get involved" },
];

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/* ==========================================================================
   Navigation — a quiet row, not a bar.

   The mobile menu is a real modal dialog, and every piece of that is load-
   bearing. It used to be conditionally mounted inside AnimatePresence, and
   its `inert` / `pointer-events` guards were written INSIDE the `open &&`
   branch — so they could only ever evaluate to the open values. During the
   exit animation, or forever if that animation stalled, an invisible full-
   screen panel swallowed every tap. Now the panel is always mounted and
   closed-ness is plain CSS keyed off `open`: inert, hidden from assistive
   tech, and invisible once the fade finishes. No animation can hold it open.

   Also fixed here: the only close control used to sit outside the dialog,
   unreachable under aria-modal; there was no focus trap; the menu stayed
   open (with scrolling locked) after rotating to a wide layout; and tapping
   the link for the page you were already on did nothing.
   ========================================================================== */

export function Nav() {
  const pathname = usePathname();
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const lenis = useLenis();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  /* Set when the user dismisses the menu (Escape, the close button, a link to
     the current page). Only then does focus return to the trigger — on a real
     navigation the new page owns focus. */
  const restoreFocus = useRef(false);

  const close = useCallback((restore: boolean) => {
    restoreFocus.current = restore;
    setOpen(false);
  }, []);

  // Only flip React state when the boolean actually changes.
  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > 24;
    setStuck((prev) => (prev === next ? prev : next));
  });

  // Close on navigation, during render rather than in an effect, so the open
  // menu never paints for a frame on the new route.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  // While open: lock scroll, trap focus, close on Escape and on widening.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(true);
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      const items = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    // The panel and trigger are lg:hidden. Without this, rotating a tablet to
    // landscape left an invisible open menu holding the scroll lock.
    const wide = window.matchMedia("(min-width: 1024px)");
    const onWide = (e: MediaQueryListEvent) => {
      if (e.matches) close(false);
    };

    window.addEventListener("keydown", onKey);
    wide.addEventListener("change", onWide);

    /* Focus moves into the dialog two frames later, not now. The panel's
       visibility is transitioning from hidden, and at progress 0 a discrete
       visibility transition still resolves to `hidden` — so focusing in the
       same frame is silently refused and focus stays on the trigger behind
       the modal. Measured: it did, before this. */
    let raf = requestAnimationFrame(() => {
      raf = requestAnimationFrame(() => closeRef.current?.focus());
    });

    return () => {
      cancelAnimationFrame(raf);
      lenis?.start();
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      wide.removeEventListener("change", onWide);
    };
  }, [open, lenis, close]);

  // Send focus back to the trigger after a user-initiated close.
  useEffect(() => {
    if (open || !restoreFocus.current) return;
    restoreFocus.current = false;
    triggerRef.current?.focus();
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="chamfer sr-only z-[70] bg-marigold px-4 py-2 text-sm font-medium text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-[var(--dur-base)] ease-[var(--ease-apple)] ${
          stuck
            ? "border-[var(--stage-line)] bg-[color-mix(in_srgb,var(--color-ink)_78%,transparent)] backdrop-blur-xl backdrop-saturate-150"
            : "border-transparent"
        }`}
      >
        {/* Read position: a hairline that builds across the bar. */}
        <motion.div
          aria-hidden
          className="absolute inset-x-0 bottom-[-1px] h-px origin-left bg-marigold transition-opacity duration-[var(--dur-base)]"
          style={{ scaleX: scrollYProgress, opacity: stuck ? 1 : 0 }}
        />

        <nav
          aria-label="Primary"
          className={`edge flex items-center justify-between transition-[height] duration-[var(--dur-base)] ${
            stuck ? "h-14" : "h-16 sm:h-[72px]"
          }`}
        >
          <Link
            href="/"
            aria-label={`${club.name}, home`}
            className="fui-glitch-hover -ml-1 flex items-center px-1 text-base"
          >
            <span className="fui-glitch-target inline-flex">
              <Wordmark />
            </span>
          </Link>

          {/* Desktop */}
          <div className="hidden items-center lg:flex">
            <ul className="flex items-center">
              {LINKS.map((l, i) => {
                const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={`group relative flex h-9 items-center gap-1.5 px-3 font-mono text-[length:var(--text-xs)] uppercase tracking-[0.08em] transition-colors duration-[var(--dur-fast)] ${
                        active
                          ? "text-[var(--stage-fg)]"
                          : "text-[var(--stage-muted)] hover:text-[var(--stage-fg)]"
                      }`}
                    >
                      <span
                        aria-hidden
                        className={`transition-colors duration-[var(--dur-fast)] ${
                          active ? "text-marigold" : "text-[var(--stage-subtle)] group-hover:text-marigold"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {l.label}
                      {active && (
                        <motion.span
                          layoutId="nav-active"
                          aria-hidden
                          className="absolute inset-x-3 -bottom-px h-px bg-marigold"
                          transition={{ duration: DUR.base, ease: EASE_OUT_EXPO }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <span className="mono-label ml-5 hidden items-center gap-2 text-[var(--stage-subtle)] xl:inline-flex">
              <StatusDot tone="ok" blink />
              Applications open
            </span>

            <Button href="/join" size="sm" className="ml-5">
              Apply
            </Button>
          </div>

          {/* Mobile trigger */}
          <button
            ref={triggerRef}
            type="button"
            className="-mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-haspopup="dialog"
            onClick={() => setOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <span aria-hidden className="flex flex-col items-end gap-[5px]">
              <span className="block h-px w-5 bg-current" />
              <span className="block h-px w-3.5 bg-marigold" />
            </span>
          </button>
        </nav>
      </header>

      {/* The dialog. Always mounted; closed means inert + aria-hidden +
          invisible once the fade completes, independent of any animation. */}
      <div
        id="mobile-menu"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        aria-hidden={!open}
        inert={!open}
        className={`fixed inset-0 z-[60] bg-ink transition-[opacity,visibility] duration-[var(--dur-base)] ease-[var(--ease-out-expo)] lg:hidden ${
          open ? "visible opacity-100" : "pointer-events-none invisible opacity-0"
        }`}
      >
        <div className="hud-dots pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="edge relative flex h-full flex-col">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="-ml-1 px-1 text-base" onClick={() => close(pathname === "/")}>
              <Wordmark />
            </Link>
            <button
              ref={closeRef}
              type="button"
              className="-mr-2 flex h-11 w-11 items-center justify-center"
              onClick={() => close(true)}
            >
              <span className="sr-only">Close menu</span>
              <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </button>
          </div>

          <ul className="mt-6 flex flex-col">
            {[...LINKS, { href: "/join", label: "Apply" }].map((l, i) => {
              const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <li
                  key={l.href}
                  className={`border-b border-[var(--stage-line)] transition-[opacity,transform] duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] ${
                    open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                  }`}
                  style={{ transitionDelay: open ? `${40 + i * 45}ms` : "0ms" }}
                >
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    onClick={() => {
                      // A link to the current page changes nothing, so close
                      // explicitly; other links close on the route change.
                      if (active) close(true);
                    }}
                    className="group flex min-h-16 items-center justify-between gap-4 py-4"
                  >
                    <span className="flex items-baseline gap-4">
                      <span
                        aria-hidden
                        className={`mono-label ${active ? "text-marigold" : "text-[var(--stage-subtle)]"}`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-2xl font-light tracking-[-0.03em]">{l.label}</span>
                    </span>
                    <svg
                      aria-hidden
                      viewBox="0 0 12 12"
                      className="h-3 w-3 text-[var(--stage-subtle)] transition-transform duration-[var(--dur-base)] group-hover:translate-x-1 group-hover:text-marigold"
                      fill="none"
                    >
                      <path d="M1.5 6h8M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" />
                    </svg>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-auto flex items-center justify-between pb-8 pt-6">
            <span className="mono-label inline-flex items-center gap-2 text-[var(--stage-muted)]">
              <StatusDot tone="ok" blink />
              Applications open
            </span>
            <span className="mono-label text-[var(--stage-muted)]">{club.school}</span>
          </div>
        </div>
      </div>
    </>
  );
}
