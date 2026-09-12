"use client";

import { useNow } from "@/lib/hooks";

/* ==========================================================================
   The instant a schedule view renders for.

   The server component that mounts a schedule view reads the time once and
   passes it down as `renderedAt`. Until the visitor's clock starts — on the
   server, and during hydration, where useNow() reports 0 — views render for
   that instant, so both sides print identical markup and a visitor without
   JavaScript still reads a real event, a real date and a real cycle day.

   Once mounted, the visitor's clock takes over. The page regenerates every
   six hours, so without this a deadline that passed an hour ago could still
   read "running"; with it, the status flips on the minute it happens.

   `live` is false until the clock has started. Anything that changes every
   second (the countdown digits) waits for it and prints dashes until then.
   ========================================================================== */

export function useScheduleNow(renderedAt: number): { now: number; live: boolean } {
  const tick = useNow();
  return tick === 0 ? { now: renderedAt, live: false } : { now: tick, live: true };
}
