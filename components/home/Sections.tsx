import Link from "next/link";
import { premise, prizes, security, stats, join } from "@/content/club";
import { sponsors } from "@/content/sponsors";
import { Eyebrow } from "@/components/ui/Button";
import { Annotation, Marquee, RegMark } from "@/components/ui/Poster";
import { Grain } from "@/components/ui/Texture";
import {
  CountUp,
  Reveal,
  RevealLines,
  Stagger,
  StaggerItem,
} from "@/components/motion/Reveal";

/* ==========================================================================
   Home sections.

   Rhythm is deliberately varied: an offset editorial statement, a hairline
   strip, a dark inset panel, a numeric table, a wordmark row. No two
   consecutive card grids anywhere — see rule 5 in CLAUDE.md.
   ========================================================================== */

/** The opening statement. Headline and body sit on different columns so the
 *  block reads as composed rather than centred. */
export function Premise() {
  return (
    <section className="pt-28 md:pt-44" aria-labelledby="premise-title">
      <div className="edge">
        <div className="grid12">
          <div className="col-span-4 md:col-span-9">
            <Eyebrow index={1}>{premise.eyebrow}</Eyebrow>
            <RevealLines
              lines={[
                "Most clubs end in a slide deck.",
                "This one ends in a URL.",
              ]}
              id="premise-title"
              className="optical balance mt-5 text-4xl font-semibold"
            />
          </div>
          <div className="col-span-4 mt-10 space-y-5 md:col-span-6 md:col-start-6 md:mt-14">
            {premise.body.map((p) => (
              <p key={p.slice(0, 24)} className="pretty text-lg">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

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

/** The security step. A dark inset panel inside the light page — the one
 *  place a 12px radius appears, and where marigold is legal as text. */
export function Security() {
  return (
    <section className="pt-28 md:pt-40" aria-labelledby="security-title">
      <div className="edge">
        <div className="grid12 items-start">
          <div className="col-span-4 md:col-span-5">
            <Eyebrow index={4}>{security.eyebrow}</Eyebrow>
            <RevealLines
              lines={security.headline}
              id="security-title"
              className="optical mt-5 text-3xl font-semibold"
            />
            <div className="mt-6 space-y-5">
              {security.body.map((p) => (
                <p key={p.slice(0, 24)} className="pretty text-base text-[var(--stage-muted)]">
                  {p}
                </p>
              ))}
            </div>
          </div>

          <Reveal className="col-span-4 mt-10 md:col-span-6 md:col-start-7 md:mt-0">
            <div className="relative overflow-hidden rounded-card bg-ink p-7 text-paper md:p-9">
              <Grain />
              <div className="relative flex items-center justify-between border-b border-[var(--color-line-dark)] pb-4">
                <span className="mono-label text-[var(--color-muted)]">
                  Pre-launch review
                </span>
                <span className="mono-label text-marigold">Required</span>
              </div>
              <dl className="relative mt-2">
                {security.checks.map((c) => (
                  <div
                    key={c.term}
                    className="grid grid-cols-[92px_1fr] gap-x-5 border-b border-[var(--color-line-dark-soft)] py-4 last:border-b-0 md:grid-cols-[116px_1fr]"
                  >
                    <dt className="mono-label pt-1 text-marigold">{c.term}</dt>
                    <dd className="pretty text-sm text-[#c7c7cc]">{c.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

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
                    {/* marigold-ink, not marigold: this is text on a light
                        surface. See the marigold rule in CLAUDE.md. */}
                    <span className="tnum mono-label text-marigold-ink">
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

/** Sponsors, set as wordmarks rather than dropped into logo boxes. */
export function SponsorRow() {
  return (
    <section className="pt-28 md:pt-40" aria-labelledby="sponsors-title">
      <div className="edge">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="sponsors-title" className="mono-label text-[var(--stage-muted)]">
            Sponsored by
          </h2>
          <Link
            href="/sponsors"
            className="text-sm underline decoration-[var(--stage-line)] underline-offset-4 transition-colors hover:decoration-current"
          >
            Become a sponsor
          </Link>
        </div>

        <Stagger as="ul" stagger={0.08} className="mt-8">
          {sponsors.map((s, i) => (
            <StaggerItem
              index={i}
              as="li"
              key={s.name}
              className="rule-t grid grid-cols-1 gap-2 py-7 md:grid-cols-[minmax(0,300px)_1fr] md:items-baseline md:gap-10"
            >
              <span className="text-2xl font-semibold tracking-[-0.03em]">
                {s.name}
              </span>
              <span className="pretty max-w-[54ch] text-base text-[var(--stage-muted)]">
                {s.blurb}
              </span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      {/* The repeating top rail from the reference posters, running the full
          bleed. Speed and direction follow scroll velocity, so it reads as
          part of the page's movement rather than a detached loop. The names
          are already listed above, so this is presentational. */}
      <div className="rule-t rule-b mt-14 py-4">
        <Marquee className="text-[var(--stage-muted)]" baseSpeed={26} gap={40}>
          {[...sponsors, ...sponsors].map((s, i) => (
            <span key={`${s.name}-${i}`} className="flex items-center gap-4">
              <RegMark size={11} className="opacity-45" />
              <Annotation tone="current">{s.name}</Annotation>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

/** Closing call to action. Offset, not centred. */
export function JoinCta() {
  return (
    <section className="pt-28 md:pt-40" aria-labelledby="join-title">
      <div className="edge">
        <div className="grid12">
          <div className="col-span-4 md:col-span-8">
            <Eyebrow index={8}>{join.eyebrow}</Eyebrow>
            <RevealLines
              lines={["No experience required.", "Effort is."]}
              id="join-title"
              className="optical mt-5 text-4xl font-semibold"
            />
            <p className="pretty mt-6 max-w-[48ch] text-lg text-[var(--stage-muted)]">
              {join.standfirst}
            </p>
            <ul className="mt-8 space-y-3">
              {join.points.map((p) => (
                <li key={p} className="flex gap-3 text-base">
                  <span
                    aria-hidden
                    className="mt-[0.6em] h-[5px] w-[5px] shrink-0 bg-marigold"
                  />
                  {p}
                </li>
              ))}
            </ul>
            <Link
              href="/join"
              className="mt-10 inline-flex rounded-pill bg-marigold px-6 py-3 text-base font-medium text-ink transition-[background-color,transform] duration-[var(--dur-fast)] ease-[var(--ease-apple)] hover:bg-marigold-hi active:scale-[0.98]"
            >
              Apply to join
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
