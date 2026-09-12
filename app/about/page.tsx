import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import { Eyebrow, Button } from "@/components/ui/Button";
import { HudFrame, Readout, StatusDot, Tag } from "@/components/ui/Hud";
import { Annotation, Barcode, RegMark } from "@/components/ui/Poster";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { CopyEmail } from "@/components/ui/CopyEmail";
import {
  about,
  club,
  format,
  meeting,
  meetingLine,
  officers,
  schedule,
  stats,
  teams,
} from "@/content/club";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: about.standfirst,
  alternates: { canonical: "/about" },
  openGraph: {
    url: "/about",
    title: `About — ${club.name}`,
    description: about.standfirst,
    siteName: club.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `About — ${club.name}`,
    description: about.standfirst,
  },
};

/** Initials for the tile shown until an officer sends a photo. */
function initials(name: string) {
  return (
    name
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "—"
  );
}

/* The cycle length, read off the last day in the format rather than typed. */
const lastDay = format.weeks.at(-1)?.days.at(-1)?.day ?? "";
const cycleDays = Number(lastDay.match(/(\d+)\s*$/)?.[1] ?? 0);

export default function AboutPage() {
  return (
    <>
      <PageHeader
        index={3}
        eyebrow={about.eyebrow}
        title={about.title}
        standfirst={about.standfirst}
        meta={about.facts.map((f) => ({ label: f.term, value: f.detail }))}
      />

      {/* ---- Officers ----------------------------------------------------
          Portrait tiles frame a monogram until a photo arrives. On a fine
          pointer each tile picks up tracking boxes and a leader line, like a
          vision system locking on — decoration only: every fact beside it is
          already text. */}
      <section className="pt-20 md:pt-28" aria-labelledby="officers-title">
        <div className="edge">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <Eyebrow index={1}>Officers</Eyebrow>
              <h2 id="officers-title" className="optical mt-4 text-3xl font-light">
                {officers.length} students run it.
              </h2>
            </div>
            <Annotation className="text-[var(--stage-subtle)]">
              {officers.length} of {officers.length} positions filled
            </Annotation>
          </div>

          <Stagger
            as="ul"
            className="mt-12 grid grid-cols-1 gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-4"
          >
            {officers.map((o, i) => {
              const id = String(i + 1).padStart(2, "0");
              return (
                <StaggerItem index={i} as="li" key={`${o.name}-${i}`} className="group">
                  <figure className="relative m-0">
                    {/* The offset frame behind the tile. */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -left-2 -top-2 h-full w-full border border-[var(--stage-line)]"
                    />
                    <div className="scanlines relative aspect-[4/5] overflow-hidden bg-surface-900">
                      {o.image ? (
                        <Image
                          src={o.image}
                          alt={o.name}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="hud-dots relative flex h-full items-center justify-center">
                          <span className="text-5xl font-light tracking-[-0.05em] text-[var(--stage-muted)]">
                            {initials(o.name)}
                          </span>
                          <span aria-hidden className="absolute bottom-4 right-4 h-2.5 w-2.5 bg-marigold" />
                          <Barcode
                            seed={o.name}
                            bars={12}
                            height={12}
                            className="absolute bottom-4 left-4 opacity-40"
                          />
                        </div>
                      )}

                      {/* Tracking overlay. */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-[11%] border border-marigold opacity-0 transition-opacity duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover:opacity-90"
                      />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute left-[22%] top-[26%] h-7 w-7 border border-marigold opacity-0 transition-[opacity,transform] delay-75 duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover:opacity-70 motion-safe:group-hover:translate-x-1"
                      />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute right-[11%] top-[26%] h-px w-[18%] origin-right scale-x-0 bg-marigold transition-transform delay-100 duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover:scale-x-100"
                      />
                      <span
                        aria-hidden
                        className="mono-label pointer-events-none absolute right-[11%] top-[26%] -translate-y-full pb-1 text-marigold opacity-0 transition-opacity delay-150 duration-[var(--dur-base)] group-hover:opacity-100"
                      >
                        Officer {id}
                      </span>
                    </div>
                  </figure>

                  <div className="mt-5 flex items-baseline justify-between gap-3">
                    <h3 className="text-xl font-normal tracking-[-0.022em]">{o.name}</h3>
                    <span aria-hidden className="mono-label text-[var(--stage-subtle)]">
                      {id}
                    </span>
                  </div>
                  <p className="mono-label mt-2 text-[var(--stage-muted)]">{o.role}</p>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* ---- How it runs -------------------------------------------------- */}
      <section className="pt-24 md:pt-32" aria-labelledby="runs-title">
        <div className="edge">
          <div className="grid12 items-start gap-y-10">
            <div className="col-span-4 md:col-span-5">
              <Eyebrow index={2}>How it runs</Eyebrow>
              <h2 id="runs-title" className="optical mt-4 text-3xl font-light">
                One cycle, start to finish.
              </h2>
              <p className="pretty mt-6 max-w-[44ch] text-base text-[var(--stage-muted)]">
                {teams.summary} The schedule is fixed, so the scope flexes — that
                constraint is the point.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button href="/hackathons" variant="ghost" size="sm" arrow>
                  The format
                </Button>
                <Button href="/handbook" variant="ghost" size="sm" arrow>
                  The handbook
                </Button>
              </div>
            </div>

            <Reveal className="col-span-4 md:col-span-6 md:col-start-7">
              <HudFrame size={12} className="chamfer-line [--cut:14px] p-6 md:p-8">
                <div className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3">
                  <Readout label="Cycle" valueClassName="text-2xl font-light">
                    {cycleDays}
                    <span className="ml-1.5 text-base text-[var(--stage-muted)]">days</span>
                  </Readout>
                  <Readout label="Team size" valueClassName="text-2xl font-light">
                    {teams.min}
                    <span className="mx-1 text-[var(--stage-muted)]">–</span>
                    {teams.max}
                  </Readout>
                  <Readout label="Reviewed" valueClassName="text-2xl font-light">
                    {stats[2]?.value}
                    <span className="text-base text-[var(--stage-muted)]">{stats[2]?.suffix}</span>
                  </Readout>
                  <Readout label="Room" valueClassName="text-base">
                    {meeting.room}
                  </Readout>
                  <Readout label="Meets" valueClassName="text-base" className="col-span-2 sm:col-span-1">
                    {meeting.cadence}
                  </Readout>
                  <Readout label="Next cycle" valueClassName="text-base" className="col-span-2 sm:col-span-3">
                    {schedule.nextHackathonName} · {schedule.season[0].window}
                  </Readout>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--stage-line)] pt-5">
                  <span className="mono-label inline-flex items-center gap-2 text-[var(--stage-muted)]">
                    <StatusDot tone="ok" blink />
                    Applications open
                  </span>
                  <Annotation className="text-[var(--stage-subtle)]">{meetingLine}</Annotation>
                </div>
              </HudFrame>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- Contact ------------------------------------------------------ */}
      <section className="pt-24 md:pt-32" aria-labelledby="contact-title">
        <div className="edge">
          <div className="rule-t grid12 items-start gap-y-8 pt-10">
            <div className="col-span-4 md:col-span-5">
              <Eyebrow index={3}>Contact</Eyebrow>
              <h2 id="contact-title" className="optical mt-4 text-2xl font-light">
                Officer positions open each year.
              </h2>
              <p className="pretty mt-4 max-w-[42ch] text-base text-[var(--stage-muted)]">
                Come to a meeting and say you are interested. Anyone can help run
                a hackathon before they run the club.
              </p>
            </div>
            <div className="col-span-4 md:col-span-4 md:col-start-7">
              <div className="mono-label text-[var(--stage-subtle)]">Email</div>
              <CopyEmail email={club.email} className="mt-3 text-base" />
              <div className="mt-7 flex flex-wrap gap-2">
                <Tag>{club.school}</Tag>
                <Tag>{club.location}</Tag>
              </div>
            </div>
            <div className="col-span-4 md:col-span-2 md:col-start-11 md:justify-self-end">
              <RegMark size={18} className="text-marigold" />
              <a
                href={SITE_URL}
                className="mono-label mt-4 block break-all text-[var(--stage-subtle)]"
              >
                {SITE_URL.replace(/^https?:\/\//, "")}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
