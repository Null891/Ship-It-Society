"use client";

import { motion } from "motion/react";
import { EASE_OUT_EXPO } from "@/lib/motion";
import { usePrefersReducedMotion } from "@/lib/hooks";

/* ==========================================================================
   Rolling digits.

   Each column holds 0-9 stacked vertically and translates to the digit it
   should show. Only the columns whose digit actually changed move, so the
   seconds tick while the days sit still — which is what makes it read as a
   mechanism rather than a text swap.

   Placeholder characters (the dashes shown before the clock starts) render
   as static text; there is nothing to roll to.
   ========================================================================== */

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

function Column({ digit, reduced }: { digit: number; reduced: boolean }) {
  return (
    <span
      className="relative inline-block overflow-hidden align-baseline"
      style={{ height: "1em", width: "0.62em" }}
      aria-hidden
    >
      <motion.span
        className="absolute inset-x-0 top-0 flex flex-col items-center"
        animate={{ y: `${-digit}em` }}
        transition={
          reduced
            ? { duration: 0 }
            : { duration: 0.55, ease: EASE_OUT_EXPO }
        }
      >
        {DIGITS.map((d) => (
          <span key={d} className="block leading-[1em]" style={{ height: "1em" }}>
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export function Odometer({
  value,
  className = "",
}: {
  /** Already formatted and padded, e.g. "07" or "--". */
  value: string;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <span className={`tnum inline-flex leading-[1em] ${className}`}>
      {/* The real value, for assistive tech and for copy-paste. */}
      <span className="sr-only">{value}</span>
      {value.split("").map((ch, i) =>
        /[0-9]/.test(ch) ? (
          <Column key={i} digit={Number(ch)} reduced={reduced} />
        ) : (
          <span
            key={i}
            aria-hidden
            className="inline-block text-center"
            style={{ width: "0.62em" }}
          >
            {ch}
          </span>
        ),
      )}
    </span>
  );
}
