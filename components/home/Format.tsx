import { format } from "@/content/club";
import { Eyebrow } from "@/components/ui/Button";
import { Readout, Tag } from "@/components/ui/Hud";
import { RevealLines } from "@/components/motion/Reveal";
import { WeekRow } from "@/components/home/WeekRow";
import { CYCLE_DAY_COUNT, CYCLE_DAYS, CYCLE_WEEKS } from "@/components/home/fx/cycle";

/* ==========================================================================
   The one-month format — home, section 02.

   The section header is server-rendered; each week is a client component
   because its pinned card tracks scroll progress through its own days.

   Every number in the header is read back out of the format itself: the
   cycle's length, how many weeks it runs and how many dated entries it
   contains. Nothing is typed twice.
   ========================================================================== */

export function Format() {
  return (
    <section
      id="format"
      data-shot="format"
      className="pt-28 md:pt-40"
      aria-labelledby="format-title"
    >
      <div className="edge">
        <div className="grid12 items-end gap-y-8">
          <div className="col-span-4 md:col-span-7">
            <Eyebrow index={2}>{format.eyebrow}</Eyebrow>
            <RevealLines
              lines={format.headline}
              id="format-title"
              className="optical mt-5 text-3xl font-normal"
            />
            <p className="pretty mt-6 max-w-[52ch] text-lg text-[var(--stage-muted)]">
              {format.standfirst}
            </p>
          </div>

          {/* The header's own spec block, so the right half of the row is
              carrying something rather than sitting empty. */}
          <div className="col-span-4 md:col-span-4 md:col-start-9">
            <div className="rule-t flex flex-wrap gap-x-10 gap-y-5 pt-5">
              <Readout label="Length">
                <span className="text-2xl font-light">{CYCLE_DAYS}</span>
                <span className="mono-label ml-1.5 text-[var(--stage-muted)]">days</span>
              </Readout>
              <Readout label="Weeks">
                <span className="text-2xl font-light">{CYCLE_WEEKS.length}</span>
                <span className="mono-label ml-1.5 text-[var(--stage-muted)]">stages</span>
              </Readout>
              <Readout label="Milestones">
                <span className="text-2xl font-light">{CYCLE_DAY_COUNT}</span>
                <span className="mono-label ml-1.5 text-[var(--stage-muted)]">dated</span>
              </Readout>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {CYCLE_WEEKS.map((w) => (
                <Tag key={w.id}>{w.title}</Tag>
              ))}
            </div>
          </div>
        </div>

        {CYCLE_WEEKS.map((week, i) => (
          <WeekRow
            key={week.id}
            week={week}
            index={i}
            total={CYCLE_WEEKS.length}
          />
        ))}
      </div>
    </section>
  );
}
