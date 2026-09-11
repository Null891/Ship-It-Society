import { security } from "@/content/club";
import { Eyebrow } from "@/components/ui/Button";
import { EuclidPlate } from "@/components/ui/Plates";
import { Grain } from "@/components/ui/Texture";
import { Reveal, RevealLines } from "@/components/motion/Reveal";

/** The security step. A dark inset panel inside the light page — the one
 *  place a 12px radius appears, and where marigold is legal as text. */
export function Security() {
  return (
    <section className="pt-28 md:pt-40" aria-labelledby="security-title">
      <div className="edge">
        <div className="grid12 items-start">
          <div className="col-span-4 md:col-span-5">
            <Eyebrow index={4}>{security.eyebrow}</Eyebrow>
            <RevealLines
              lines={security.headline}
              id="security-title"
              className="optical mt-5 text-3xl font-semibold"
            />
            <div className="mt-6 space-y-5">
              {security.body.map((p) => (
                <p key={p.slice(0, 24)} className="pretty text-base text-[var(--stage-muted)]">
                  {p}
                </p>
              ))}
            </div>

          </div>

          <Reveal className="col-span-4 mt-10 md:col-span-6 md:col-start-7 md:mt-0">
            <div className="relative overflow-hidden rounded-card bg-ink p-7 text-paper md:p-9">
              <Grain />
              <div className="relative flex items-center justify-between border-b border-[var(--color-line-dark)] pb-4">
                <span className="mono-label text-[var(--color-muted)]">
                  Pre-launch review
                </span>
                <span className="mono-label text-marigold">Required</span>
              </div>
              <dl className="relative mt-2">
                {security.checks.map((c) => (
                  <div
                    key={c.term}
                    className="grid grid-cols-[92px_1fr] gap-x-5 border-b border-[var(--color-line-dark-soft)] py-4 last:border-b-0 md:grid-cols-[116px_1fr]"
                  >
                    <dt className="mono-label pt-1 text-marigold">{c.term}</dt>
                    <dd className="pretty text-sm text-[var(--color-paper-muted)]">{c.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>

        {/* The review plate, full width under both columns. It draws its
            diagonal as it scrolls in and the two marks turn into place. */}
        <EuclidPlate className="mt-16 md:mt-24" />
      </div>
    </section>
  );
}
