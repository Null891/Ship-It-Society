import { CalendarBoard } from "./CalendarBoard";

/* ==========================================================================
   The season calendar on /hackathons.

   A server component: it reads the time once, so the HTML already carries
   every row's real status, the running cycle's day and the moon for it —
   no JavaScript needed to read the calendar. The board then follows the
   visitor's own clock, so a status that changes between regenerations
   (the page is rebuilt every six hours) is still correct on screen.
   ========================================================================== */

export function Calendar({ className = "" }: { className?: string }) {
  // Rendered once per regeneration and never hydrated; see home/Countdown.
  // eslint-disable-next-line react-hooks/purity
  return <CalendarBoard renderedAt={Date.now()} className={className} />;
}
