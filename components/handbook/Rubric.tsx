import { Eyebrow } from "@/components/ui/Button";
import { Readout } from "@/components/ui/Hud";
import { Annotation } from "@/components/ui/Poster";
import { RevealLines, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { prizes } from "@/content/club";
import { rubric, sections, weightTotal } from "@/content/handbook";

/* ==========================================================================
   04 — The rubric.

   The same four weights the home page draws as rings, drawn here as the
   sliders a judge actually moves. The fill is set to the weight in content
   and builds out to it on reveal through the shared fui-build class, with
   the knob riding the end of it; reduced motion skips straight to the
   finished position. The bars are aria-hidden — the percentage beside each
   criterion is the accessible value, and the total under them is added up
   rather than typed, so a weight that stops summing to 100 shows here.
   ========================================================================== */

const copy = sections.rubric;

/** Ten marks along the track: a 0-100 scale, so the fill can be read off it. */
const SCALE = Array.from({ length: 9 }, (_, i) => (i + 1) * 10);

export function Rubric() {
  return (
    <section className="pt-28 md:pt-40" aria-labelledby="rubric-title">
      <div className="edge">
        <div className="grid12 items-start">
          <div className="col-span-4 md:col-span-4">
            <Eyebrow index={4}>{copy.eyebrow}</Eyebrow>
            <RevealLines
              lines={copy.title}
              id="rubric-title"
              className="optical mt-5 text-3xl font-normal"
            />
            <p className="pretty mt-6 max-w-[34ch] text-base text-[var(--stage-muted)]">
              {copy.intro}
            </p>
            <p className="pretty mt-4 max-w-[34ch] text-base text-[var(--stage-muted)]">
              {prizes.rules[3]}
            </p>

            <div className="rule-t mt-8 flex items-end justify-between gap-6 pt-5">
              <Readout label={copy.totalLabel} valueClassName="text-2xl font-light">
                {weightTotal}%
              </Readout>
              <Annotation className="pb-1.5 text-[var(--stage-subtle)]">
                {rubric.length} criteria
              </Annotation>
            </div>
          </div>

          <Stagger
            as="dl"
            className="col-span-4 mt-10 md:col-span-7 md:col-start-6 md:mt-0"
          >
            {rubric.map((criterion, i) => (
              <StaggerItem index={i} key={criterion.term} className="rule-t py-6">
                <dt className="flex items-baseline justify-between gap-4">
                  <span className="text-lg font-medium tracking-[-0.018em]">
                    {criterion.term}
                  </span>
                  <span className="mono-label tnum text-marigold">
                    {criterion.weight}
                  </span>
                </dt>
                <dd>
                  <div aria-hidden className="relative mt-5 h-4">
                    <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[var(--stage-line-strong)]" />
                    {SCALE.map((mark) => (
                      <span
                        key={mark}
                        className="absolute top-1/2 h-1.5 w-px -translate-y-1/2 bg-[var(--stage-line)]"
                        style={{ left: `${mark}%` }}
                      />
                    ))}
                    <span
                      className="fui-build absolute left-0 top-1/2 h-0.5 -translate-y-1/2 bg-marigold"
                      style={{ width: `${criterion.percent}%` }}
                    >
                      <span className="absolute right-0 top-1/2 h-4 w-[3px] -translate-y-1/2 bg-marigold" />
                    </span>
                  </div>
                  <p className="pretty mt-4 max-w-[46ch] text-base text-[var(--stage-muted)]">
                    {criterion.detail}
                  </p>
                </dd>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
