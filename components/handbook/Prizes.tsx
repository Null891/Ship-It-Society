import { Eyebrow } from "@/components/ui/Button";
import { Readout, Tag } from "@/components/ui/Hud";
import { Annotation, Barcode } from "@/components/ui/Poster";
import { Reveal, RevealLines, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { prizes } from "@/content/club";
import { prizePool, prizeTiers, sections } from "@/content/handbook";

/* ==========================================================================
   05 — Prizes and eligibility.

   A ranked list on the left, the rules as a chamfered terminal list on the
   right. The pool is added up from the tiers rather than typed, so removing
   a tier changes the total with it.
   ========================================================================== */

const copy = sections.prizes;

export function Prizes() {
  return (
    <section className="pt-28 md:pt-40" aria-labelledby="prizes-title">
      <div className="edge">
        <div className="grid12 items-start">
          <div className="col-span-4 md:col-span-7">
            <Eyebrow index={5}>{copy.eyebrow}</Eyebrow>
            <RevealLines
              lines={copy.title}
              id="prizes-title"
              className="optical mt-5 text-3xl font-normal"
            />
            <p className="pretty mt-6 max-w-[46ch] text-base text-[var(--stage-muted)]">
              {copy.intro}
            </p>

            <Stagger as="ul" className="mt-10">
              {prizeTiers.map((tier, i) => (
                <StaggerItem
                  as="li"
                  index={i}
                  key={tier.place}
                  className="rule-t grid grid-cols-[auto_1fr_auto] items-baseline gap-x-5 py-6"
                >
                  <span className="mono-label tnum text-marigold">{tier.place}</span>
                  <span>
                    <span className="block text-2xl font-light tracking-[-0.03em]">
                      {tier.title}
                    </span>
                    <Tag className="mt-3">{tier.note}</Tag>
                  </span>
                  <span className="tnum text-3xl font-light tracking-[-0.03em]">
                    {tier.money}
                  </span>
                </StaggerItem>
              ))}
            </Stagger>

            <div className="rule-t flex items-end justify-between gap-6 pt-5">
              <Readout label={copy.poolLabel} valueClassName="text-2xl font-light">
                {prizePool}
              </Readout>
              <Annotation className="pb-1.5 text-[var(--stage-subtle)]">
                {prizes.currency}, paid in cash
              </Annotation>
            </div>
          </div>

          <Reveal className="col-span-4 mt-10 md:col-span-4 md:col-start-9 md:mt-0">
            <div className="chamfer-line p-6 [--fill:var(--stage-panel)] md:p-7">
              <Annotation className="text-[var(--stage-subtle)]">
                {copy.rulesTitle}
              </Annotation>
              <ul className="mt-5 space-y-4">
                {prizes.rules.map((rule) => (
                  <li key={rule} className="flex gap-3">
                    <span aria-hidden className="mono-label pt-1.5 text-marigold">
                      &gt;
                    </span>
                    <span className="pretty text-sm text-[var(--stage-muted)]">
                      {rule}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-7 border-t border-[var(--stage-line)] pt-4 text-[var(--stage-line-strong)]">
                <Barcode seed="handbook-prizes" bars={22} height={16} />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
