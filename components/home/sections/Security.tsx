import { security } from "@/content/club";
import { Eyebrow } from "@/components/ui/Button";
import { EuclidPlate } from "@/components/ui/Plates";
import { HudFrame, StatusDot } from "@/components/ui/Hud";
import { Annotation } from "@/components/ui/Poster";
import { ScanGrid } from "@/components/home/fx/ScanGrid";
import { Reveal, RevealLines, Stagger, StaggerItem } from "@/components/motion/Reveal";

/* ==========================================================================
   The security step.

   The scan grid on the right is the section's argument in one picture: a
   surface with findings on it, swept clean before anything ships. The list
   underneath is the actual checklist, numbered, each item marked required.
   ========================================================================== */

export function Security() {
  return (
    <section className="pt-28 md:pt-40" aria-labelledby="security-title">
      <div className="edge">
        <div className="grid12 items-start gap-y-12">
          <div className="col-span-4 md:col-span-5">
            <Eyebrow index={3}>{security.eyebrow}</Eyebrow>
            <RevealLines
              lines={security.headline}
              id="security-title"
              className="optical mt-5 text-3xl font-light"
            />
            <div className="mt-7 space-y-5">
              {security.body.map((p) => (
                <p key={p.slice(0, 24)} className="pretty text-base text-[var(--stage-muted)]">
                  {p}
                </p>
              ))}
            </div>

            <div className="mt-9 flex items-center gap-3">
              <StatusDot tone="ok" blink />
              <Annotation className="text-[var(--stage-muted)]">
                {security.checks.length} checks · all required
              </Annotation>
            </div>
          </div>

          <Reveal className="col-span-4 md:col-span-6 md:col-start-7">
            <HudFrame size={12} className="chamfer-line [--cut:16px] p-6 md:p-8">
              <ScanGrid />
            </HudFrame>
          </Reveal>
        </div>

        {/* The checklist itself, as a numbered HUD list. */}
        <Stagger as="dl" className="mt-16 grid grid-cols-1 gap-x-10 md:mt-20 md:grid-cols-2">
          {security.checks.map((c, i) => (
            <StaggerItem
              index={i}
              key={c.term}
              className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-5 border-t border-[var(--stage-line)] py-5"
            >
              <span aria-hidden className="mono-label text-[var(--stage-subtle)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <dt className="text-lg font-normal">{c.term}</dt>
                <dd className="pretty mt-1.5 text-base text-[var(--stage-muted)]">{c.detail}</dd>
              </div>
              <span className="mono-label text-marigold">Required</span>
            </StaggerItem>
          ))}
        </Stagger>

        {/* The review plate, full width under both columns. It draws its
            diagonal as it scrolls in and the two marks turn into place. */}
        <EuclidPlate className="mt-16 md:mt-24" />
      </div>
    </section>
  );
}
