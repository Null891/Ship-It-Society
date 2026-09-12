import { stats } from "@/content/club";
import { TickBar } from "@/components/ui/Hud";
import { Annotation } from "@/components/ui/Poster";
import { CountUp, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { CYCLE_DAYS } from "@/components/home/fx/cycle";

/* ==========================================================================
   By the numbers — a hairline strip. No cards, no boxes; the rules separate.

   Each figure gets a tick meter only where an honest one exists:

     · a percentage is a meter of twenty ticks, filled to the percentage
     · the cycle length is a meter of one tick per day of that cycle

   A count of two, or of zero, has no meaningful bar behind it, so those
   figures are left as figures. An empty meter beside "0 slide decks" would
   read as a broken control rather than as a fact.

   The list is a real definition list: the term is the label, the figure and
   its note are its definitions. The figure is ordered above the label in
   CSS, which keeps the markup in dt-then-dd order without lying about it.
   ========================================================================== */

type Meter = { total: number; filled: number };

function meterFor(stat: (typeof stats)[number]): Meter | null {
  if (stat.suffix === "%") {
    const ticks = 20;
    return { total: ticks, filled: Math.round((stat.value / 100) * ticks) };
  }
  if (stat.value === CYCLE_DAYS) {
    return { total: CYCLE_DAYS, filled: CYCLE_DAYS };
  }
  return null;
}

export function Stats() {
  return (
    <section
      data-shot="stats"
      className="pt-20 md:pt-32"
      aria-label="By the numbers"
    >
      <div className="edge">
        <Stagger
          as="dl"
          className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-8"
        >
          {stats.map((s, i) => {
            const meter = meterFor(s);
            /* A dl grouping may contain only dt and dd, and the dt has to
               come first. The figure is lifted above the label with CSS
               order, so the reading order stays honest. */
            return (
              <StaggerItem index={i} key={s.label} className="rule-t flex flex-col pt-4">
                <dt className="order-3 mt-4 text-base font-medium">{s.label}</dt>
                <dd className="order-1">
                  <Annotation tone="current" className="block text-[var(--stage-subtle)]">
                    {String(i + 1).padStart(2, "0")}
                  </Annotation>
                  <span className="mt-4 block text-4xl font-light tracking-[-0.035em]">
                    <CountUp value={s.value} suffix={s.suffix} />
                  </span>
                </dd>
                <dd className="order-4 mt-1 text-sm text-[var(--stage-muted)]">
                  {s.detail}
                </dd>
                {meter && (
                  <dd className="order-5 mt-5">
                    <TickBar total={meter.total} filled={meter.filled} height={16} />
                  </dd>
                )}
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
