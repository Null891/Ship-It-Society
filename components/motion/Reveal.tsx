"use client";

import { useEffect, useRef, useState } from "react";
import {
  animate,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "motion/react";
import {
  DUR,
  EASE_OUT_EXPO,
  VIEWPORT,
  maskedLine,
  riseIn,
  staggerParent,
} from "@/lib/motion";

/* ==========================================================================
   The four reveal primitives the whole site uses. Nothing else animates on
   entry — see the motion budget in CLAUDE.md.
   ========================================================================== */

/** A quiet rise. For supporting content only, never for body paragraphs. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={riseIn}
      transition={{ delay }}
    >
      {children}
    </Comp>
  );
}

/**
 * Display type rising out of its own mask, one line at a time.
 * Lines are explicit rather than measured, so the break never lands
 * somewhere embarrassing at an arbitrary width.
 */
export function RevealLines({
  lines,
  className = "",
  delay = 0,
  as: Tag = "h2",
  id,
}: {
  lines: string | string[];
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p";
  id?: string;
}) {
  const list = Array.isArray(lines) ? lines : [lines];
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <Tag id={id} className={className}>
        {list.map((l) => (
          <span key={l} className="block">
            {l}
          </span>
        ))}
      </Tag>
    );
  }

  // The viewport observer MUST sit on the heading, never on the masked line
  // itself. A masked line starts translated 110% down, which puts it entirely
  // outside its overflow:hidden parent — and IntersectionObserver clips
  // intersection by ancestor overflow, so such an element never reports as
  // in view. Observing the child deadlocks: it stays hidden forever because
  // it is hidden. The heading is always in flow, so it always resolves.
  const MotionTag = motion[Tag];

  return (
    <MotionTag
      id={id}
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={staggerParent(0.08, delay)}
    >
      {list.map((line) => (
        <span key={line} className="block overflow-hidden pb-[0.08em]">
          <motion.span className="block" variants={maskedLine}>
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

export function Stagger({
  children,
  className = "",
  stagger = 0.06,
  delay = 0,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  as?: "div" | "ul" | "dl";
}) {
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      variants={staggerParent(stagger, delay) as Variants}
    >
      {children}
    </Comp>
  );
}

export function StaggerItem({
  children,
  className = "",
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "dd" | "article";
}) {
  const Comp = motion[as];
  return (
    <Comp className={className} variants={riseIn}>
      {children}
    </Comp>
  );
}

/**
 * A number that counts to its value once, when it comes into view.
 * Reduced motion, and the no-JS server render, both show the final value —
 * the number is never withheld from anyone.
 */
export function CountUp({
  value,
  suffix = "",
  className = "",
  duration = 1.1,
}: {
  value: number;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || reduced || started.current || value === 0) return;
    started.current = true;
    setDisplay(0);
    const controls = animate(0, value, {
      duration,
      ease: EASE_OUT_EXPO,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, reduced, value, duration]);

  return (
    <span ref={ref} className={`tnum ${className}`}>
      {display}
      {suffix}
    </span>
  );
}

/** Fades and lifts a block on hover. Used only on genuinely clickable cards. */
export const cardHover = {
  transition: { duration: DUR.base, ease: EASE_OUT_EXPO },
};
