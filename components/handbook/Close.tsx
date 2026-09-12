import { Button, Eyebrow } from "@/components/ui/Button";
import { Readout } from "@/components/ui/Hud";
import { Annotation } from "@/components/ui/Poster";
import { Magnetic } from "@/components/motion/Magnetic";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { RevealLines } from "@/components/motion/Reveal";
import { club, meetingLine, schedule } from "@/content/club";
import { closeActions, sections } from "@/content/handbook";

/* ==========================================================================
   07 — Close.

   The two places to go next, and the facts a visitor needs to act on them.
   Everything in the panel is read from content: when the club meets, which
   cycle is next and when it runs, and the address an officer answers.
   ========================================================================== */

const copy = sections.close;
const next = schedule.season[0];

export function Close() {
  return (
    <section className="pb-32 pt-28 md:pb-44 md:pt-40" aria-labelledby="close-title">
      <div className="edge">
        <div className="chamfer-line p-7 [--fill:var(--stage-panel)] md:p-12">
          <div className="grid12 items-end gap-y-10">
            <div className="col-span-4 md:col-span-6">
              <Eyebrow index={7}>{copy.eyebrow}</Eyebrow>
              <RevealLines
                lines={copy.title}
                id="close-title"
                className="optical mt-5 text-3xl font-normal"
              />
              <p className="pretty mt-6 max-w-[40ch] text-base text-[var(--stage-muted)]">
                {copy.body}
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Magnetic>
                  <Button href={closeActions.primary.href} size="lg" arrow>
                    {closeActions.primary.label}
                  </Button>
                </Magnetic>
                <Button
                  href={closeActions.secondary.href}
                  variant="ghost"
                  size="lg"
                  arrow
                >
                  {closeActions.secondary.label}
                </Button>
              </div>
            </div>

            <div className="col-span-4 md:col-span-5 md:col-start-8">
              <div className="grid grid-cols-2 gap-x-6 gap-y-7">
                <Readout label="Meets" className="col-span-2" valueClassName="text-base">
                  {meetingLine}
                </Readout>
                <Readout label="Next cycle" valueClassName="text-base">
                  {next.name}
                </Readout>
                <Readout label="Window" valueClassName="text-base">
                  {next.window}
                </Readout>
              </div>
              <div className="rule-t mt-8 pt-5">
                <Annotation className="block text-[var(--stage-subtle)]">
                  {copy.contactLabel}
                </Annotation>
                <CopyEmail email={club.email} className="mt-3 text-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
