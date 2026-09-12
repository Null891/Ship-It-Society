import { premise } from "@/content/club";
import { Eyebrow } from "@/components/ui/Button";
import { HudFrame } from "@/components/ui/Hud";
import { Annotation } from "@/components/ui/Poster";
import { Reveal } from "@/components/motion/Reveal";
import { WordReveal } from "@/components/home/premise/WordReveal";
import { CursorMeet } from "@/components/home/premise/CursorMeet";

/* ==========================================================================
   The opening statement — home, section 01.

   The headline brightens word by word as the section crosses the screen and
   the figure beside it closes two pointers on each other. Both read the
   same scroll, both rest in their finished state without JavaScript.

   Every word of copy here comes from content/club premise; nothing is
   retyped in this file.
   ========================================================================== */

export function Premise() {
  return (
    <section
      data-shot="premise"
      className="pt-28 md:pt-44"
      aria-labelledby="premise-title"
    >
      <div className="edge">
        <div className="grid12 gap-y-10 md:gap-y-14">
          <div className="col-span-4 md:col-span-7">
            <Eyebrow index={1}>{premise.eyebrow}</Eyebrow>
            <WordReveal
              text={premise.headline}
              id="premise-title"
              className="optical balance mt-5 text-4xl font-normal"
            />
          </div>

          {/* The figure spans both rows on wide screens, so the body copy
              sits beside it rather than under a band of empty column. */}
          <Reveal className="col-span-4 md:col-span-4 md:col-start-9 md:row-span-2 md:self-center">
            <figure className="m-0">
              <HudFrame className="hud-dots aspect-square w-full" size={14} inset={6}>
                <CursorMeet className="absolute inset-0" />
              </HudFrame>
              {/* The graphic is decorative; this caption is what names its
                  two halves, so the meaning is in text either way. */}
              <figcaption className="mt-3 flex items-center gap-3">
                <Annotation tone="current" className="text-[var(--stage-subtle)]">
                  Machine
                </Annotation>
                <span aria-hidden className="h-px flex-1 bg-[var(--stage-line)]" />
                <Annotation tone="accent">Contact</Annotation>
                <span aria-hidden className="h-px flex-1 bg-[var(--stage-line)]" />
                <Annotation tone="current" className="text-[var(--stage-subtle)]">
                  Human
                </Annotation>
              </figcaption>
            </figure>
          </Reveal>

          <div className="col-span-4 md:col-span-7 md:col-start-1">
            <div className="grid gap-x-10 gap-y-6 md:grid-cols-2">
              {premise.body.map((p, i) => (
                <div key={p.slice(0, 24)} className="rule-t pt-5">
                  <Annotation tone="current" className="text-[var(--stage-subtle)]">
                    {String(i + 1).padStart(2, "0")}
                  </Annotation>
                  <p className="pretty mt-3 text-base text-[var(--stage-muted)]">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
