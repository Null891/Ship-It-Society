import { stats } from "@/content/club";
import { CountUp, Stagger, StaggerItem } from "@/components/motion/Reveal";

/** Hairline strip. No cards, no boxes — the rules do the separating. */
export function Stats() {
  return (
    <section className="pt-20 md:pt-28" aria-label="By the numbers">
      <div className="edge">
        <Stagger
          as="dl"
          stagger={0.07}
          className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4"
        >
          {stats.map((s, i) => (
            <StaggerItem index={i} key={s.label} className="rule-t pt-5">
              <dd className="text-3xl font-semibold tracking-[-0.03em]">
                <CountUp value={s.value} suffix={s.suffix} />
              </dd>
              <dt className="mt-3 text-base font-medium">{s.label}</dt>
              <p className="mt-1 text-sm text-[var(--stage-muted)]">{s.detail}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
