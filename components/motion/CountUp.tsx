"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { EASE_OUT_EXPO } from "@/lib/motion";

/**
 * A number that counts to its value once, when it comes into view.
 *
 * The final value is what renders on the server and what reduced-motion
 * users see, so the number is never withheld from anyone — the count is
 * decoration on top of content that is already correct.
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
