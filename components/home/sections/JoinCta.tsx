import { club, hero, join, meetingLine, schedule, teams } from "@/content/club";
import { Button, Eyebrow } from "@/components/ui/Button";
import { StatusDot } from "@/components/ui/Hud";
import { Magnetic } from "@/components/motion/Magnetic";
import { DotField } from "@/components/home/fx/DotField";
import { WireCube } from "@/components/home/fx/WireCube";
import { RevealLines } from "@/components/motion/Reveal";

/* ==========================================================================
   The closing call to action.

   A wireframe cube turns over the word the whole site is about, on a dot
   field that bulges around the pointer. Offset rather than centred, so the
   page ends the way it ran.
   ========================================================================== */

export function JoinCta() {
  return (
    <section className="relative pt-28 md:pt-40" aria-labelledby="join-title">
      {/* The field sits behind the whole block and clips to it. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-10 overflow-hidden">
        <DotField className="h-full w-full opacity-70" />
      </div>

      <div className="edge relative">
        <div className="grid12 items-center gap-y-14">
          <div className="col-span-4 md:col-span-6">
            <Eyebrow index={9}>{join.eyebrow}</Eyebrow>
            <RevealLines
              lines={join.title}
              id="join-title"
              className="optical balance mt-5 text-4xl font-light"
            />
            <p className="pretty mt-7 max-w-[44ch] text-lg text-[var(--stage-muted)]">
              {join.standfirst}
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Magnetic>
                <Button href={hero.primaryCta.href} size="lg" arrow>
                  {hero.primaryCta.label}
                </Button>
              </Magnetic>
              <Button href="/get-involved" variant="ghost" size="lg">
                Other ways in
              </Button>
            </div>

            <dl className="mt-12 grid grid-cols-1 gap-x-10 gap-y-4 sm:grid-cols-3">
              <div>
                <dt className="mono-label text-[var(--stage-subtle)]">Next cycle</dt>
                <dd className="tnum mt-1.5 text-sm text-[var(--stage-fg)]">
                  {schedule.nextHackathonName}
                </dd>
              </div>
              <div>
                <dt className="mono-label text-[var(--stage-subtle)]">Teams</dt>
                <dd className="tnum mt-1.5 text-sm text-[var(--stage-fg)]">
                  {teams.min}–{teams.max} people
                </dd>
              </div>
              <div>
                <dt className="mono-label text-[var(--stage-subtle)]">Meets</dt>
                <dd className="mt-1.5 text-sm text-[var(--stage-fg)]">{meetingLine}</dd>
              </div>
            </dl>

            <p className="mono-label mt-10 inline-flex items-center gap-2 text-[var(--stage-muted)]">
              <StatusDot tone="ok" blink />
              Applications open · {club.school}
            </p>
          </div>

          {/* The cube, over the word. */}
          <div className="relative col-span-4 md:col-span-5 md:col-start-8">
            <span
              aria-hidden
              className="text-outline pointer-events-none absolute inset-0 flex select-none items-center justify-center text-[clamp(84px,11vw,168px)] font-light leading-none tracking-[-0.05em] [--outline:var(--color-marigold)] opacity-55"
            >
              SHIP
            </span>
            <WireCube className="relative h-[280px] w-full md:h-[340px]" size={190} />
          </div>
        </div>
      </div>
    </section>
  );
}
