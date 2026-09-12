import { prizes } from "@/content/club";
import { Eyebrow } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Hud";
import { Annotation } from "@/components/ui/Poster";
import { RevealLines, Stagger, StaggerItem } from "@/components/motion/Reveal";

/* ==========================================================================
   Prizes and judging.

   The weights are rings: the arc is the weight, so the four of them read as
   one pie taken apart. Each arc draws itself in when the section is
   revealed — the dash pattern is set inline so the shared .draw-path rule
   animates the offset without overwriting the fraction.
   ========================================================================== */

/** "$100" — prizes are whole amounts, paid in cash. */
const money = (amount: number) =>
  prizes.currency === "USD" ? `$${amount}` : `${amount} ${prizes.currency}`;

const pool = prizes.tiers.reduce((sum, t) => sum + (t.amount ?? 0), 0);

function WeightRing({ weight, index }: { weight: string; index: number }) {
  const pct = Math.max(0, Math.min(100, parseFloat(weight))) / 100;
  return (
    <svg viewBox="0 0 100 100" className="h-[68px] w-[68px] shrink-0" aria-hidden>
      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--stage-line)" strokeWidth="5" />
      <circle
        className="draw-path"
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="var(--color-marigold)"
        strokeWidth="5"
        pathLength={1}
        transform="rotate(-90 50 50)"
        style={{
          strokeDasharray: `${pct} 1`,
          ["--draw-i" as string]: index,
        }}
      />
      <text
        x="50"
        y="55"
        textAnchor="middle"
        className="font-mono"
        fill="var(--color-fg)"
        fontSize="20"
        style={{ letterSpacing: "-0.02em" }}
      >
        {Math.round(pct * 100)}
      </text>
    </svg>
  );
}

export function Prizes() {
  return (
    <section className="pt-28 md:pt-40" aria-labelledby="prizes-title">
      <div className="edge">
        <div className="grid12 items-start gap-y-12">
          <div className="col-span-4 md:col-span-5">
            <Eyebrow index={4}>{prizes.eyebrow}</Eyebrow>
            <RevealLines
              /* Break the headline at its sentences rather than hard-coding
                 the two lines, so editing the copy still sets correctly. */
              lines={prizes.headline.split(/(?<=\.)\s+/)}
              id="prizes-title"
              className="optical mt-5 text-3xl font-light"
            />
            <p className="pretty mt-6 max-w-[44ch] text-lg text-[var(--stage-muted)]">
              {prizes.standfirst}
            </p>

            {/* The tiers, with what each one pays. */}
            <Stagger as="dl" className="mt-10">
              {prizes.tiers.map((t, i) => (
                <StaggerItem
                  index={i}
                  key={t.place}
                  className="flex items-baseline justify-between gap-6 border-t border-[var(--stage-line)] py-4"
                >
                  <dt className="flex items-baseline gap-4">
                    <span aria-hidden className="mono-label text-[var(--stage-subtle)]">
                      {t.place}
                    </span>
                    <span className="text-lg font-normal">{t.title}</span>
                    <span className="hidden text-sm text-[var(--stage-muted)] sm:inline">
                      {t.note}
                    </span>
                  </dt>
                  <dd className="tnum text-lg font-normal text-marigold">{money(t.amount)}</dd>
                </StaggerItem>
              ))}
              <div className="flex items-baseline justify-between gap-6 border-t border-[var(--stage-line)] py-4">
                <dt className="mono-label text-[var(--stage-subtle)]">Pool per hackathon</dt>
                <dd className="tnum mono-label text-[var(--stage-fg)]">{money(pool)}</dd>
              </div>
            </Stagger>

            {/* The rules that come with the money. */}
            <ul className="mt-8 space-y-2.5">
              {prizes.rules.map((r) => (
                <li key={r.slice(0, 28)} className="flex gap-3 text-sm text-[var(--stage-muted)]">
                  <span aria-hidden className="font-mono text-marigold">
                    {">"}
                  </span>
                  <span className="pretty">{r}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-4 md:col-span-6 md:col-start-7">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="mono-label text-[var(--stage-subtle)]">How it is judged</h3>
              <Annotation className="text-[var(--stage-subtle)]">
                {prizes.criteria.length} criteria · 100%
              </Annotation>
            </div>

            <Stagger as="dl" className="mt-6">
              {prizes.criteria.map((c, i) => (
                <StaggerItem
                  index={i}
                  key={c.term}
                  className="flex items-center gap-6 border-t border-[var(--stage-line)] py-5"
                >
                  <WeightRing weight={c.weight} index={i} />
                  <div>
                    <dt className="text-lg font-normal">{c.term}</dt>
                    <dd className="pretty mt-1 text-base text-[var(--stage-muted)]">{c.detail}</dd>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-[var(--stage-line)] pt-6">
              <Tag tone="accent">Working deployment first</Tag>
              <Tag>Judges use the product</Tag>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
