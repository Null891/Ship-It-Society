import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Grain } from "@/components/ui/Texture";
import { Format } from "@/components/home/Format";
import { Eyebrow } from "@/components/ui/Button";
import { OrbitPlate } from "@/components/ui/Plates";
import { Calendar } from "@/components/hackathons/Calendar";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { hackathonsPage, meetingLine, prizes, security } from "@/content/club";

export const metadata: Metadata = {
  title: "The format",
  description:
    "One month, idea to deployed. The schedule is fixed so the scope has to flex.",
};

export default function HackathonsPage() {
  return (
    <>
      <PageHeader
        eyebrow={hackathonsPage.eyebrow}
        title={hackathonsPage.title}
        standfirst={hackathonsPage.standfirst}
      />

      <Format />

      {/* Season plan */}
      <section className="pt-28 md:pt-40" aria-labelledby="season-title">
        <div className="edge">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div>
              <Eyebrow index={2}>This season</Eyebrow>
              <h2
                id="season-title"
                className="optical mt-4 text-2xl font-semibold tracking-[-0.028em]"
              >
                The calendar
              </h2>
            </div>
            <p className="mono-label text-[var(--stage-muted)]">
              {meetingLine}
            </p>
          </div>

          {/* The season, drawn as orbits: one ring per hackathon, labelled
              with its real window, and a marker travelling the next one. */}
          <div className="mt-12 grid12 items-center gap-y-10">
            <OrbitPlate className="col-span-4 md:col-span-7" />
            <div className="col-span-4 md:col-span-4 md:col-start-9">
              <p className="pretty max-w-[34ch] text-lg text-[var(--stage-muted)]">
                Three cycles a season. Each one starts the week the last one
                ships, so there is always something in the air.
              </p>
            </div>
          </div>

          <Calendar className="mt-10" />
        </div>
      </section>

      {/* Judging */}
      <section className="pt-28 md:pt-40" aria-labelledby="judging-title">
        <div className="edge">
          <div className="grid12 items-start">
            <div className="col-span-4 md:col-span-5">
              <Eyebrow index={3}>Judging</Eyebrow>
              <h2
                id="judging-title"
                className="optical mt-4 text-3xl font-semibold"
              >
                A working deployment beats everything else.
              </h2>
              <p className="pretty mt-6 max-w-[44ch] text-base text-[var(--stage-muted)]">
                {prizes.standfirst}
              </p>
              <Link
                href="/sponsors"
                className="mt-6 inline-block text-base underline decoration-[var(--stage-line)] underline-offset-4 transition-colors hover:decoration-current"
              >
                Who funds the prizes
              </Link>
            </div>

            <Stagger
              as="dl"
              className="col-span-4 mt-10 md:col-span-6 md:col-start-7 md:mt-0"
            >
              {prizes.criteria.map((c, i) => (
                <StaggerItem index={i} key={c.term} className="rule-t py-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <dt className="text-lg font-medium">{c.term}</dt>
                    <span className="tnum mono-label text-marigold">
                      {c.weight}
                    </span>
                  </div>
                  <dd className="pretty mt-1.5 text-base text-[var(--stage-muted)]">
                    {c.detail}
                  </dd>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* Security gate — dark full-bleed band, the page's grid break */}
      <section
        className="relative overflow-hidden mt-28 bg-ink py-20 text-paper md:mt-40 md:py-28"
        aria-labelledby="gate-title"
      >
        <Grain />
        <div className="edge relative">
          <div className="grid12 items-start">
            <div className="col-span-4 md:col-span-5">
              <p className="mono-label text-[var(--color-muted)]">
                {security.eyebrow}
              </p>
              <h2
                id="gate-title"
                className="optical mt-4 text-3xl font-semibold"
              >
                {security.headline}
              </h2>
              <p className="pretty mt-6 max-w-[44ch] text-base text-[#c7c7cc]">
                {security.body[0]}
              </p>
            </div>

            <dl className="col-span-4 mt-10 md:col-span-6 md:col-start-7 md:mt-0">
              {security.checks.map((c) => (
                <div
                  key={c.term}
                  className="grid grid-cols-[92px_1fr] gap-x-5 border-t border-[var(--color-line-dark)] py-5 md:grid-cols-[128px_1fr]"
                >
                  <dt className="mono-label pt-1 text-marigold">{c.term}</dt>
                  <dd className="pretty text-base text-[#c7c7cc]">{c.detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
