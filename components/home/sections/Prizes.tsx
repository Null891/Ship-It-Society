import { prizes } from "@/content/club";
import { Eyebrow } from "@/components/ui/Button";
import { RevealLines, Stagger, StaggerItem } from "@/components/motion/Reveal";

/** Prizes. Numeric, tabular, no decoration. */
export function Prizes() {
  return (
    <section className="pt-28 md:pt-40" aria-labelledby="prizes-title">
      <div className="edge">
        <div className="grid12">
          <div className="col-span-4 md:col-span-6">
            <Eyebrow index={5}>{prizes.eyebrow}</Eyebrow>
            <RevealLines
              lines={["Sponsor-funded.", "Paid in cash."]}
              id="prizes-title"
              className="optical mt-5 text-3xl font-semibold"
            />
            <p className="pretty mt-6 max-w-[46ch] text-lg text-[var(--stage-muted)]">
              {prizes.standfirst}
            </p>

            <Stagger as="dl" className="mt-10">
              {prizes.tiers.map((t, i) => (
                <StaggerItem
                  index={i}
                  key={t.place}
                  className="rule-t flex items-baseline justify-between gap-6 py-4"
                >
                  <span className="flex items-baseline gap-4">
                    <span className="mono-label text-[var(--stage-muted)]">
                      {t.place}
                    </span>
                    <span className="text-lg font-medium">{t.title}</span>
                  </span>
                  <span className="text-right text-base text-[var(--stage-muted)]">
                    {t.note}
                  </span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <div className="col-span-4 mt-12 md:col-span-5 md:col-start-8 md:mt-0">
            <h3 className="mono-label text-[var(--stage-muted)]">
              How it is judged
            </h3>
            <Stagger as="dl" className="mt-5">
              {prizes.criteria.map((c, i) => (
                <StaggerItem index={i} key={c.term} className="rule-t py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-base font-medium">{c.term}</dt>
                    
                    <span className="tnum mono-label text-marigold">
                      {c.weight}
                    </span>
                  </div>
                  <dd className="pretty mt-1 text-sm text-[var(--stage-muted)]">
                    {c.detail}
                  </dd>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}
