import { Eyebrow } from "@/components/ui/Button";
import { StatusDot } from "@/components/ui/Hud";
import { Annotation } from "@/components/ui/Poster";
import { Reveal, RevealLines } from "@/components/motion/Reveal";
import { security } from "@/content/club";
import { sections, shipRule } from "@/content/handbook";

/* ==========================================================================
   06 — The security checklist.

   A transfer panel: one cell per check, split by hairlines, each one
   numbered and marked required, and a last cell that states the rule the
   whole review exists to enforce. The checks and the rule both come from
   content, so this grid and the security section on the home page can never
   list different things.
   ========================================================================== */

const copy = sections.checklist;

export function Checklist() {
  return (
    <section className="pt-28 md:pt-40" aria-labelledby="checklist-title">
      <div className="edge">
        <div className="grid12 items-end gap-y-6">
          <div className="col-span-4 md:col-span-6">
            <Eyebrow index={6}>{copy.eyebrow}</Eyebrow>
            <RevealLines
              lines={copy.title}
              id="checklist-title"
              className="optical mt-5 text-3xl font-normal"
            />
          </div>
          <div className="col-span-4 md:col-span-5 md:col-start-8">
            <p className="pretty text-base text-[var(--stage-muted)]">{copy.intro}</p>
          </div>
        </div>

        <Reveal className="mt-12 border border-[var(--stage-line)] md:mt-14">
          <div className="grid gap-px bg-[var(--stage-line)] sm:grid-cols-2 lg:grid-cols-3">
            {security.checks.map((check, i) => (
              <div
                key={check.term}
                className="flex flex-col bg-[var(--stage-panel)] p-6 md:p-7"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <Annotation className="tnum text-[var(--stage-subtle)]">
                    {copy.cellLabel} {String(i + 1).padStart(2, "0")}
                  </Annotation>
                  <span className="mono-label inline-flex items-center gap-2 text-[var(--stage-muted)]">
                    <StatusDot tone="accent" />
                    {copy.requiredLabel}
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-medium tracking-[-0.018em]">
                  {check.term}
                </h3>
                <p className="pretty mt-2 text-sm text-[var(--stage-muted)]">
                  {check.detail}
                </p>
              </div>
            ))}

            {/* The rule the checks add up to. */}
            <div className="flex flex-col bg-[var(--color-surface-800)] p-6 md:p-7">
              <div className="flex items-baseline justify-between gap-4">
                <Annotation className="text-marigold">{copy.gateLabel}</Annotation>
                <span className="mono-label inline-flex items-center gap-2 text-[var(--stage-muted)]">
                  <StatusDot tone="ok" />
                  {copy.gateState}
                </span>
              </div>
              <p className="pretty mt-6 text-base text-[var(--stage-fg)]">{shipRule}</p>
              <p className="pretty mt-3 text-sm text-[var(--stage-muted)]">
                {security.body[1]}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
