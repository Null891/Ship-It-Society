import { CountdownPanel } from "@/components/countdown/CountdownPanel";

/* ==========================================================================
   Countdown — home, section 07.

   A server component that reads the time once and hands it to the panel.
   The panel renders for that instant until the visitor's clock starts, so
   the server HTML already names the real next event, its date and the cycle
   day; only the ticking digits wait for the browser and print dashes until
   then. Because the instant travels as a prop, the hydrating client renders
   exactly the markup the server sent.

   Reading the clock in a server component is safe: it is never hydrated,
   and the root layout regenerates the page every six hours.
   ========================================================================== */

export function Countdown() {
  // A server component renders once per regeneration and never re-renders
  // or hydrates, so the purity rule's concern (a value that changes between
  // renders of the same tree) cannot arise here.
  // eslint-disable-next-line react-hooks/purity
  return <CountdownPanel renderedAt={Date.now()} />;
}
