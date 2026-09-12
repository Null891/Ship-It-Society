import type { Metadata } from "next";
import { notFoundPage } from "@/content/club";
import { Button } from "@/components/ui/Button";
import { HudFrame, Readout, StatusDot } from "@/components/ui/Hud";
import { AsciiPlanet, PLANET_GRID } from "@/components/notfound/AsciiPlanet";
import { DotMatrix } from "@/components/notfound/DotMatrix";
import { RequestedPath } from "@/components/notfound/RequestedPath";
import { RimMonogram } from "@/components/notfound/RimMonogram";
import { PLANET_RAMP } from "@/lib/ascii/planet";

/* ==========================================================================
   404 — signal lost.

   Three pieces, all drawn here from code: the heading in the site's own
   dot-matrix alphabet, the club mark rim-lit on black, and a ringed planet
   ray-cast into text. The readouts are true: the status is the response's
   status, the path is the address the visitor asked for, and the legend
   under the planet is the ramp and grid it was actually rendered with.

   The planet bleeds past the right edge of the grid: this page's one
   deliberate grid break. The section clips it, so nothing scrolls sideways.

   Motion: the heading's dots resolve column by column on entry, and the
   status light blinks under 1Hz. Reduced motion rests both lit.

   Metadata: its own title, and `robots: { index: false }`. Next merges
   metadata shallowly, so this `robots` replaces the layout's instead of
   printing an "index, follow" beside the noindex.
   ========================================================================== */

export const metadata: Metadata = {
  title: notFoundPage.meta.title,
  description: notFoundPage.meta.description,
  robots: { index: false },
};

export default function NotFound() {
  const [home, ...others] = notFoundPage.actions;
  const ramp = PLANET_RAMP.trim();

  return (
    <section aria-labelledby="not-found-title" className="relative overflow-hidden pb-16 pt-28 md:pb-20 md:pt-36">
      <div className="edge">
        <div className="rule-b flex flex-wrap items-center justify-between gap-x-8 gap-y-3 pb-4">
          <p className="mono-label flex items-center gap-2.5 tracking-[0.14em] text-[var(--stage-muted)] md:tracking-[0.28em]">
            <StatusDot tone="alert" blink />
            {notFoundPage.subtitle}
          </p>
          <div className="mono-label flex min-w-0 items-baseline gap-3 text-[var(--stage-subtle)]">
            <span className="shrink-0">Requested</span>
            <span className="min-w-0 normal-case tracking-normal text-[var(--stage-fg)]">
              <RequestedPath />
            </span>
          </div>
        </div>

        <div className="grid12 mt-12 items-center gap-y-14 md:mt-16">
          <div className="col-span-4 md:col-span-7">
            <h1 id="not-found-title" className="max-w-[34rem]">
              <span className="sr-only">{notFoundPage.title.join(" ")}</span>
              <DotMatrix lines={notFoundPage.title} />
            </h1>
            <p className="pretty mt-10 max-w-[44ch] text-lg text-[var(--stage-muted)]">
              {notFoundPage.body}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href={home.href} arrow>
                {home.label}
              </Button>
              {others.map((action) => (
                <Button key={action.href} href={action.href} variant="ghost">
                  {action.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="col-span-4 md:col-span-4 md:col-start-9">
            <HudFrame size={16} className="mx-auto max-w-[15rem] p-6 md:max-w-[22rem] md:p-10">
              <RimMonogram />
            </HudFrame>
          </div>
        </div>

        <div className="grid12 mt-16 items-center gap-y-8 md:mt-6">
          <div className="order-2 col-span-4 grid grid-cols-2 gap-6 md:order-1 md:col-span-3 md:grid-cols-1">
            <Readout label="Status" valueClassName="font-mono text-sm">
              404 Not found
            </Readout>
            <Readout label="Shading ramp" valueClassName="font-mono text-sm">
              {ramp}
            </Readout>
            <Readout label="Grid" valueClassName="font-mono text-sm">
              {`${PLANET_GRID.columns} × ${PLANET_GRID.rows}`}
            </Readout>
          </div>
          <AsciiPlanet className="order-1 col-span-4 -mr-[18%] md:order-2 md:col-span-7 md:col-start-6 md:-mr-[12%]" />
        </div>
      </div>
    </section>
  );
}
