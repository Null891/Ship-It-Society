import { format } from "@/content/club";
import { Eyebrow } from "@/components/ui/Button";
import { RevealLines } from "@/components/motion/Reveal";
import { WeekRow } from "@/components/home/WeekRow";

/* ==========================================================================
   The two-week format.

   The section header is server-rendered; each week is a client component
   because its pinned card tracks scroll progress through its own days.
   ========================================================================== */

export function Format() {
  return (
    <section id="format" className="pt-28 md:pt-40">
      <div className="edge">
        <div className="grid12">
          <div className="col-span-4 md:col-span-7">
            <Eyebrow>{format.eyebrow}</Eyebrow>
            <RevealLines
              lines={format.headline}
              className="optical mt-5 text-3xl font-semibold"
            />
            <p className="pretty mt-6 max-w-[52ch] text-lg text-[var(--stage-muted)]">
              {format.standfirst}
            </p>
          </div>
        </div>

        {format.weeks.map((week) => (
          <WeekRow
            key={week.id}
            label={week.label}
            title={week.title}
            summary={week.summary}
            days={week.days}
          />
        ))}
      </div>
    </section>
  );
}
