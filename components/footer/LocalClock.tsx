"use client";

import { useNow } from "@/lib/hooks";

/* ==========================================================================
   The club's local time.

   The server has no idea what time it is in California — and even if it did,
   a server-rendered clock is wrong the moment it is cached. So the server
   renders placeholder digits and the client fills them in, which also keeps
   the markup identical on both sides.

   It ticks in a <time> element with no live region: a clock that announced
   itself every second would make a screen reader unusable.
   ========================================================================== */

const PLACEHOLDER = "--:--:--";

export function LocalClock({ timeZone = "America/Los_Angeles" }: { timeZone?: string }) {
  const now = useNow();
  const label = now
    ? new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(now))
    : PLACEHOLDER;

  return (
    <time className="tnum" suppressHydrationWarning>
      {label}
    </time>
  );
}
