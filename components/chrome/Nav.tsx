"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useLenis } from "lenis/react";
import { Wordmark } from "@/components/brand/Wordmark";
import { DUR, EASE_OUT_EXPO } from "@/lib/motion";

const LINKS = [
  { href: "/hackathons", label: "Format" },
  { href: "/projects", label: "Projects" },
  { href: "/team", label: "Team" },
  { href: "/sponsors", label: "Sponsors" },
];

export function Nav() {
  const pathname = usePathname();
  const [stuck, setStuck] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const lenis = useLenis();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  /* Set when the menu is dismissed by the user (Escape or the toggle) rather
     than by navigating. Only then should focus go back to the trigger — on a
     route change the new page owns focus. */
  const restoreFocus = useRef(false);

  const closeMenu = () => {
    restoreFocus.current = true;
    setOpen(false);
  };

  // Imperative: the nav state is a boolean, so only flip React state when the
  // boolean actually changes rather than on every scroll frame.
  useMotionValueEvent(scrollY, "change", (y) => {
    const next = y > 24;
    setStuck((prev) => (prev === next ? prev : next));
  });

  // Close the menu on navigation. Adjusting during render is React's own
  // pattern for resetting state when an input changes — an effect here would
  // paint the open menu for a frame on the new route first.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  // Lock scrolling behind the mobile menu, and let Escape close it.
  useEffect(() => {
    if (!open) return;
    lenis?.stop();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        restoreFocus.current = true;
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    // Move focus into the panel so the keyboard path is not left behind.
    panelRef.current?.focus();
    return () => {
      lenis?.start();
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, lenis]);

  /* Send focus back to the trigger after a user-initiated close. Without
     this, dismissing with Escape left focus on a panel that no longer
     exists, and the keyboard user was dropped back to the top of the
     document with no idea where they were. */
  useEffect(() => {
    if (open || !restoreFocus.current) return;
    restoreFocus.current = false;
    triggerRef.current?.focus();
  }, [open]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-[6px] focus:bg-marigold focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink"
      >
        Skip to content
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-[var(--dur-base)] ease-[var(--ease-apple)] ${
          stuck || open
            ? "border-b border-[var(--stage-line)] bg-[color-mix(in_srgb,var(--nav-bg)_88%,transparent)] backdrop-blur-xl backdrop-saturate-150"
            : "border-b border-transparent"
        }`}
      >
        {/* Read position. Only meaningful once the page has moved, so it
            fades in with the rest of the stuck chrome. */}
        <motion.div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px origin-left bg-marigold transition-opacity duration-[var(--dur-base)]"
          style={{ scaleX: scrollYProgress, opacity: stuck ? 1 : 0 }}
        />
        <nav
          aria-label="Primary"
          className="edge flex items-center justify-between"
          style={{ color: "var(--nav-fg)" }}
        >
          <Link
            href="/"
            aria-label="Ship It Society, home"
            className={`-ml-1 rounded-[4px] px-1 transition-[height] duration-[var(--dur-base)] ${
              stuck ? "h-14" : "h-16 sm:h-[72px]"
            } flex items-center text-[17px]`}
          >
            <Wordmark />
          </Link>

          {/* Desktop */}
          <div className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => {
              const active = pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className="relative rounded-[6px] px-3 py-2 text-sm transition-opacity duration-[var(--dur-fast)] hover:opacity-100"
                  style={{ opacity: active ? 1 : 0.62 }}
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3 -bottom-px h-px bg-marigold"
                      transition={{ duration: DUR.base, ease: EASE_OUT_EXPO }}
                    />
                  )}
                </Link>
              );
            })}
            <Link
              href="/join"
              className="ml-3 rounded-pill bg-marigold px-4 py-2 text-sm font-medium text-ink transition-[transform,background-color] duration-[var(--dur-fast)] ease-[var(--ease-apple)] hover:bg-marigold-hi active:scale-[0.97]"
            >
              Apply
            </Link>
          </div>

          {/* Mobile trigger */}
          <button
            ref={triggerRef}
            type="button"
            className="-mr-2 flex h-11 w-11 items-center justify-center md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => (open ? closeMenu() : setOpen(true))}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span className="relative block h-[10px] w-[18px]">
              <motion.span
                className="absolute left-0 block h-[1.5px] w-full bg-current"
                animate={open ? { top: 4, rotate: 45 } : { top: 0, rotate: 0 }}
                transition={{ duration: DUR.base, ease: EASE_OUT_EXPO }}
              />
              <motion.span
                className="absolute left-0 block h-[1.5px] w-full bg-current"
                animate={open ? { top: 4, rotate: -45 } : { top: 8, rotate: 0 }}
                transition={{ duration: DUR.base, ease: EASE_OUT_EXPO }}
              />
            </span>
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            /* `inert` while closing removes the whole subtree from hit
               testing, the tab order and the accessibility tree in one go. */
            inert={!open}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.base, ease: EASE_OUT_EXPO }}
            className="fixed inset-0 z-40 md:hidden"
            style={{
              background: "var(--nav-bg)",
              color: "var(--nav-fg)",
              /* Never let a dismissed overlay eat taps. AnimatePresence keeps
                 this node mounted for the exit animation, and if that
                 animation stalls — a throttled tab, an iframe, a dropped
                 frame — the panel used to sit invisibly over the whole page
                 with pointer-events:auto, swallowing every tap and sending
                 anyone who touched the hero to /join. Keying this off `open`
                 rather than the animation means a stalled exit can no longer
                 break the page. */
              pointerEvents: open ? "auto" : "none",
            }}
          >
            <div className="edge flex h-full flex-col pt-24 pb-10">
              <ul className="flex flex-col">
                {[...LINKS, { href: "/join", label: "Apply" }].map((l, i) => (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: DUR.slow,
                      ease: EASE_OUT_EXPO,
                      delay: 0.04 + i * 0.045,
                    }}
                    className="border-b border-[var(--stage-line)]"
                  >
                    <Link
                      href={l.href}
                      className="flex items-baseline justify-between py-5 text-2xl tracking-[-0.025em]"
                    >
                      {l.label}
                      <span className="mono-label opacity-40">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-auto">
                <span className="mono-label opacity-40">Fremont High School</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
