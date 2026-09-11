import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { schedule } from "@/content/club";

/* ==========================================================================
   The season calendar: one row per hackathon.

   Extracted from the /hackathons page so the date logic has one home. The
   page decides where the calendar sits; this component decides what each
   row says about its cycle.
   ========================================================================== */

const STATUS_LABEL: Record<string, string> = {
  upcoming: "Next up",
  planned: "Planned",
};

export function Calendar({ className = "" }: { className?: string }) {
  return (
    <Stagger as="ul" className={className}>
      {schedule.season.map((s, i) => (
        <StaggerItem
          index={i}
          as="li"
          key={s.name}
          className="rule-t grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-6 md:grid-cols-[minmax(0,260px)_1fr_auto]"
        >
          <span className="text-lg font-medium">{s.name}</span>
          <span className="order-3 col-span-2 text-base text-[var(--stage-muted)] md:order-none md:col-span-1">
            {s.window}
          </span>
          <span
            className={`mono-label ${
              s.status === "upcoming" ? "text-marigold" : "text-[var(--stage-muted)]"
            }`}
          >
            {STATUS_LABEL[s.status] ?? s.status}
          </span>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
