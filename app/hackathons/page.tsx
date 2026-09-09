import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Grain } from "@/components/ui/Texture";
import { Format } from "@/components/home/Format";
import { Eyebrow } from "@/components/ui/Button";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { meetingLine, prizes, schedule, security } from "@/content/club";

export const metadata: Metadata = {
  title: "The format",
  description:
    "One month, idea to deployed. The schedule is fixed so the scope has to flex.",
};

const STATUS_LABEL: Record<string, string> = {
  upcoming: "Next up",
  planned: "Planned",
  complete: "Complete",
};

export default function HackathonsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Hackathons"
        title={["One month.", "Idea to shipped."]}
        standfirst="Every hackathon runs the same thirty days. Officers run each one end to end, and the deadline never moves."
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

          <Stagger as="ul" className="mt-10">
            {schedule.season.map((s, i) => (
              <StaggerItem
                index={i}
                as="li"
                key={s.name}
                className="rule-t grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-6 md:grid-cols-[minmax(0,260px)_1fr_auto]"
              >
                <span className="text-lg font-medium">{s.name}</span>
                <span className="order-3 col-span-2 text-base text-[var(--stage-muted)] md:order-none md:col-span-1">
                  {s.window}
                </span>
                <span
                  className={`mono-label ${
                    s.status === "upcoming"
                      ? "text-marigold-ink"
                      : "text-[var(--stage-muted)]"
                  }`}
                >
                  {STATUS_LABEL[s.status] ?? s.status}
                </span>
              </StaggerItem>
            ))}
          </Stagger>
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
                    <span className="tnum mono-label text-marigold-ink">
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
