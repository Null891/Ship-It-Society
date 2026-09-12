import type { Metadata } from "next";
import { routeMetadata } from "@/lib/metadata";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button, Eyebrow } from "@/components/ui/Button";
import { HudFrame, Readout, StatusDot, Tag } from "@/components/ui/Hud";
import { Annotation, Barcode, RegMark } from "@/components/ui/Poster";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { SponsorGraph } from "@/components/sponsors/SponsorGraph";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { sponsors, sponsorPage } from "@/content/sponsors";
import { club, prizes } from "@/content/club";

export const metadata: Metadata = routeMetadata.sponsors;

/** "$100" — prizes are whole amounts, paid in cash. */
const money = (amount: number) =>
  prizes.currency === "USD" ? `$${amount}` : `${amount} ${prizes.currency}`;

const pool = prizes.tiers.reduce((sum, t) => sum + (t.amount ?? 0), 0);

export default function SponsorsPage() {
  return (
    <>
      <PageHeader
        index={4}
        eyebrow={sponsorPage.eyebrow}
        title={sponsorPage.headline}
        standfirst={sponsorPage.standfirst}
        meta={[
          { label: "Sponsors", value: `${sponsors.length} · ${sponsors.filter((s) => s.tier === "founding").length} founding` },
          { label: "Prize pool", value: `${money(pool)} per hackathon` },
          { label: "Judged on", value: `${prizes.criteria.length} criteria` },
        ]}
      />

      {/* ---- The graph: who funds what ------------------------------------ */}
      <section className="pt-20 md:pt-28" aria-labelledby="who-title">
        <div className="edge">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow index={1}>The backers</Eyebrow>
              <h2 id="who-title" className="optical mt-4 text-3xl font-light">
                Three names, three jobs.
              </h2>
            </div>
            <Annotation className="text-[var(--stage-subtle)]">
              Tooling · scans · prizes
            </Annotation>
          </div>

          <Reveal>
            <SponsorGraph className="mt-10 w-full" />
          </Reveal>

          {/* The dossier cards — the graph's content as real, readable text. */}
          <Stagger
            as="ul"
            className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3"
          >
            {sponsors.map((s, i) => (
              <StaggerItem index={i} as="li" key={s.name}>
                <HudFrame size={10} className="chamfer-line flex h-full flex-col p-6 [--cut:14px]">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-light tracking-[-0.03em]">{s.name}</h3>
                    <span aria-hidden className="mono-label text-[var(--stage-subtle)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <Tag tone={s.tier === "founding" ? "accent" : "line"} className="mt-4 self-start">
                    {s.tier === "founding" ? "Founding sponsor" : "Supporting sponsor"}
                  </Tag>

                  <p className="pretty mt-5 text-base text-[var(--stage-fg)]">{s.blurb}</p>

                  <div className="mt-6 border-t border-[var(--stage-line)] pt-5">
                    <Readout label="Gives" valueClassName="text-sm text-[var(--stage-muted)]">
                      {s.contribution}
                    </Readout>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-4 pt-7">
                    {s.url ? (
                      <Button href={s.url} variant="ghost" size="sm">
                        Visit {s.name}
                      </Button>
                    ) : (
                      /* A sponsor with no URL renders no link. Printing a
                         promise of one advertises an unfinished page. */
                      <span className="mono-label text-[var(--stage-subtle)]">{club.school}</span>
                    )}
                    <Barcode seed={s.name} bars={12} height={13} className="opacity-40" />
                  </div>
                </HudFrame>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ---- Where it goes ------------------------------------------------ */}
      <section className="pt-24 md:pt-32" aria-labelledby="funds-title">
        <div className="edge">
          <div className="grid12 items-start gap-y-10">
            <div className="col-span-4 md:col-span-5">
              <Eyebrow index={2}>Where it goes</Eyebrow>
              <h2 id="funds-title" className="optical mt-4 max-w-[16ch] text-3xl font-light">
                Prizes and tooling. Nothing else.
              </h2>
              <p className="pretty mt-6 max-w-[42ch] text-base text-[var(--stage-muted)]">
                {prizes.standfirst}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                {prizes.tiers.map((t) => (
                  <Tag key={t.place} tone={t.place === "01" ? "solid" : "line"}>
                    {t.title} {money(t.amount)}
                  </Tag>
                ))}
              </div>
            </div>

            <Stagger as="dl" className="col-span-4 md:col-span-6 md:col-start-7">
              {sponsorPage.funds.map((f, i) => (
                <StaggerItem
                  index={i}
                  key={f.term}
                  className="rule-t grid grid-cols-[auto_1fr] gap-x-5 py-6"
                >
                  <dt className="mono-label pt-1 text-marigold">
                    {String(i + 1).padStart(2, "0")} {f.term}
                  </dt>
                  <dd className="pretty text-base text-[var(--stage-muted)]">{f.detail}</dd>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* ---- Become a sponsor — the page's grid break -------------------- */}
      <section
        className="relative mt-24 overflow-hidden border-y border-[var(--stage-line)] bg-surface-900 py-20 md:mt-32 md:py-28"
        aria-labelledby="pitch-title"
      >
        <div className="hud-columns pointer-events-none absolute inset-0 opacity-30" aria-hidden />
        <div className="edge relative">
          <div className="grid12 items-start gap-y-10">
            <div className="col-span-4 md:col-span-5">
              <p className="mono-label flex items-center gap-2.5 text-[var(--stage-muted)]">
                <RegMark size={12} className="text-marigold" />
                {sponsorPage.pitch.eyebrow}
              </p>
              <h2 id="pitch-title" className="optical mt-4 text-3xl font-light">
                {sponsorPage.pitch.headline}
              </h2>
              <p className="pretty mt-6 max-w-[44ch] text-base text-[var(--color-paper-muted)]">
                {sponsorPage.pitch.standfirst}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/get-involved#give" size="md" arrow>
                  Donate a prize or gift
                </Button>
                <Button href={`mailto:${club.email}`} variant="ghost" size="md">
                  {sponsorPage.pitch.cta.label}
                </Button>
              </div>

              <div className="mt-8">
                <div className="mono-label text-[var(--stage-subtle)]">Direct</div>
                <CopyEmail email={club.email} className="mt-2.5 text-base" />
              </div>
            </div>

            <dl className="col-span-4 md:col-span-6 md:col-start-7">
              {sponsorPage.pitch.offers.map((o, i) => (
                <div
                  key={o.term}
                  className="grid grid-cols-1 gap-x-6 border-t border-[var(--stage-line)] py-5 md:grid-cols-[168px_1fr]"
                >
                  <dt className="mono-label pt-1 text-marigold">
                    {String(i + 1).padStart(2, "0")} {o.term}
                  </dt>
                  <dd className="pretty mt-1.5 text-base text-[var(--color-paper-muted)] md:mt-0">
                    {o.detail}
                  </dd>
                </div>
              ))}
              <div className="mt-7 flex items-center justify-between gap-4 border-t border-[var(--stage-line)] pt-5">
                <span className="mono-label inline-flex items-center gap-2 text-[var(--stage-muted)]">
                  <StatusDot tone="ok" blink />
                  Taking sponsors for this season
                </span>
                <Barcode seed="become-a-sponsor" bars={16} height={13} className="opacity-40" />
              </div>
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
