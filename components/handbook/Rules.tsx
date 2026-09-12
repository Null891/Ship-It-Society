import { Eyebrow } from "@/components/ui/Button";
import { Annotation, Barcode, RegMark } from "@/components/ui/Poster";
import { Reveal, RevealLines } from "@/components/motion/Reveal";
import { r3 } from "@/lib/geometry";
import { cycleDays, sections, spec, weekSpans } from "@/content/handbook";

/* ==========================================================================
   03 — Rules of the build.

   A spec sheet: the huge number and a line drawing on the left, the
   label/value table on the right. Every value is read out of content, so
   this table cannot disagree with the format, the teams rule or the rubric.

   The drawing is the cycle as a ruler. Its four segments are the real day
   windows each week covers (read off the first and last step in that week),
   its ticks are the real days, and the numbers under it are printed from
   the same source. It is aria-hidden; the table beside it states the same
   lengths in words.
   ========================================================================== */

const copy = sections.rules;

/* Ruler geometry. One unit per day across a 100-wide box, drawn with
   preserveAspectRatio="none" so it fits whatever column it lands in. */
const RULER_H = 26;
const pct = (day: number) => r3(((day - 1) / cycleDays) * 100);
const span = (start: number, end: number) => r3(((end - start + 1) / cycleDays) * 100);

export function Rules() {
  return (
    <section className="pt-28 md:pt-40" aria-labelledby="rules-title">
      <div className="edge">
        <div className="grid12 items-start">
          {/* Masthead, number and drawing. */}
          <div className="col-span-4 md:sticky md:top-28 md:col-span-4">
            <Eyebrow index={3}>{copy.eyebrow}</Eyebrow>
            <RevealLines
              lines={copy.title}
              id="rules-title"
              className="optical mt-5 text-3xl font-normal"
            />
            <p className="pretty mt-6 max-w-[34ch] text-base text-[var(--stage-muted)]">
              {copy.intro}
            </p>

            <Reveal className="mt-10 flex items-end gap-4">
              <span
                aria-hidden
                className="tnum text-outline select-none text-5xl font-light leading-[0.8]"
              >
                {cycleDays}
              </span>
              <Annotation className="pb-2 text-[var(--stage-subtle)]">
                {copy.numberLabel}
              </Annotation>
            </Reveal>

            <Reveal className="mt-8">
              <Annotation className="text-[var(--stage-subtle)]">
                {copy.rulerLabel}
              </Annotation>
              <svg
                aria-hidden
                viewBox={`0 0 100 ${RULER_H}`}
                preserveAspectRatio="none"
                className="mt-4 h-[26px] w-full"
                fill="none"
              >
                {/* One tick per day. */}
                {Array.from({ length: cycleDays }, (_, i) => (
                  <line
                    key={i}
                    x1={pct(i + 1)}
                    x2={pct(i + 1)}
                    y1={(i + 1) % 5 === 0 ? 0 : 5}
                    y2={RULER_H - 9}
                    stroke="var(--stage-line-strong)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {/* One bar per week, over its real day window. */}
                {weekSpans.map((week, i) => (
                  <rect
                    key={week.id}
                    x={pct(week.start)}
                    y={RULER_H - 6}
                    width={span(week.start, week.end)}
                    height="3"
                    fill={
                      i % 2 === 0
                        ? "var(--color-marigold)"
                        : "var(--color-marigold-hi)"
                    }
                    opacity={i % 2 === 0 ? 1 : 0.55}
                  />
                ))}
              </svg>
              {/* Each label is as wide as the window it names. */}
              <ul className="mt-3 flex">
                {weekSpans.map((week) => (
                  <li
                    key={week.id}
                    className="mono-label shrink-0 text-[var(--stage-subtle)]"
                    style={{ width: `${span(week.start, week.end)}%` }}
                  >
                    {`${week.start}–${week.end}`}
                  </li>
                ))}
              </ul>
            </Reveal>

            <div className="mt-9 flex items-end justify-between gap-4 text-[var(--stage-line-strong)]">
              <Barcode seed="handbook-spec" bars={18} height={20} />
              <RegMark size={16} />
            </div>
          </div>

          {/* The table. */}
          <div className="col-span-4 mt-12 md:col-span-7 md:col-start-6 md:mt-0">
            <div className="chamfer bg-[var(--stage-panel)] p-6 md:p-8">
              <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
                {spec.map((group, i) => (
                  <Reveal key={group.group} delay={i} className="rule-t pt-4">
                    <h3 className="mono-label text-marigold">{group.group}</h3>
                    <dl className="mt-2">
                      {group.rows.map((row) => (
                        <div
                          key={row.label}
                          className="grid grid-cols-[minmax(88px,auto)_1fr] items-baseline gap-x-4 border-t border-[var(--color-line-dark-soft)] py-2.5 first:border-t-0"
                        >
                          <dt className="mono-label text-[var(--stage-subtle)]">
                            {row.label}
                          </dt>
                          <dd className="tnum text-right text-sm text-[var(--stage-fg)]">
                            {row.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
