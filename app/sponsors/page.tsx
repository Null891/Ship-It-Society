import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Grain } from "@/components/ui/Texture";
import { Eyebrow } from "@/components/ui/Button";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { sponsors, sponsorPage } from "@/content/sponsors";
import { club, prizes } from "@/content/club";

export const metadata: Metadata = {
  title: "Sponsors",
  description: sponsorPage.standfirst,
};

export default function SponsorsPage() {
  return (
    <>
      <PageHeader
        eyebrow={sponsorPage.eyebrow}
        title={sponsorPage.headline}
        standfirst={sponsorPage.standfirst}
      />

      <section className="pt-16 md:pt-24">
        <div className="edge">
          <Stagger as="ul" stagger={0.08}>
            {sponsors.map((s) => (
              <StaggerItem as="li" key={s.name} className="rule-t py-10 md:py-12">
                <div className="grid12 items-start gap-y-5">
                  <div className="col-span-4 md:col-span-4">
                    <span className="text-2xl font-semibold tracking-[-0.03em]">
                      {s.name}
                    </span>
                    <p className="mono-label mt-3 text-[var(--stage-muted)]">
                      {s.tier === "founding" ? "Founding sponsor" : "Supporting"}
                    </p>
                  </div>
                  <div className="col-span-4 md:col-span-5">
                    <p className="pretty text-lg">{s.blurb}</p>
                    <p className="pretty mt-3 text-base text-[var(--stage-muted)]">
                      {s.contribution}
                    </p>
                  </div>
                  <div className="col-span-4 md:col-span-2 md:col-start-11 md:text-right">
                    {s.url ? (
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-base underline decoration-[var(--stage-line)] underline-offset-4 transition-colors hover:decoration-current"
                      >
                        Visit
                      </a>
                    ) : (
                      <span className="mono-label text-[var(--stage-muted)]">
                        Link to come
                      </span>
                    )}
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* The pitch — dark full-bleed band, this page's grid break */}
      <section
        className="relative overflow-hidden mt-24 bg-ink py-20 text-paper md:mt-32 md:py-28"
        aria-labelledby="pitch-title"
      >
        <Grain />
        <div className="edge relative">
          <div className="grid12 items-start">
            <div className="col-span-4 md:col-span-5">
              <p className="mono-label text-[var(--color-muted)]">
                {sponsorPage.pitch.eyebrow}
              </p>
              <h2
                id="pitch-title"
                className="optical mt-4 text-3xl font-semibold"
              >
                {sponsorPage.pitch.headline}
              </h2>
              <p className="pretty mt-6 max-w-[44ch] text-base text-[#c7c7cc]">
                {sponsorPage.pitch.standfirst}
              </p>
              <a
                href={`mailto:${club.email}`}
                className="mt-8 inline-flex rounded-pill bg-marigold px-6 py-3 text-base font-medium text-ink transition-[background-color,transform] duration-[var(--dur-fast)] ease-[var(--ease-apple)] hover:bg-marigold-hi active:scale-[0.98]"
              >
                {sponsorPage.pitch.cta.label}
              </a>
            </div>

            <dl className="col-span-4 mt-12 md:col-span-6 md:col-start-7 md:mt-0">
              {sponsorPage.pitch.offers.map((o) => (
                <div
                  key={o.term}
                  className="grid grid-cols-1 gap-x-6 border-t border-[var(--color-line-dark)] py-5 md:grid-cols-[148px_1fr]"
                >
                  <dt className="mono-label pt-1 text-marigold">{o.term}</dt>
                  <dd className="pretty mt-1.5 text-base text-[#c7c7cc] md:mt-0">
                    {o.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Where the money goes */}
      <section className="pt-24 md:pt-32">
        <div className="edge">
          <Eyebrow>Where it goes</Eyebrow>
          <h2 className="optical mt-4 max-w-[18ch] text-3xl font-semibold">
            Prizes and tooling. Nothing else.
          </h2>
          <dl className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-3">
            {prizes.criteria.slice(0, 3).map((c) => (
              <div key={c.term} className="rule-t pt-5">
                <dt className="text-lg font-medium">{c.term}</dt>
                <dd className="pretty mt-2 text-base text-[var(--stage-muted)]">
                  {c.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
