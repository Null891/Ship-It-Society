import Link from "next/link";
import { sponsors } from "@/content/sponsors";
import { Annotation, Marquee, RegMark } from "@/components/ui/Poster";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";

/** Sponsors, set as wordmarks rather than dropped into logo boxes. */
export function SponsorRow() {
  return (
    <section className="pt-28 md:pt-40" aria-labelledby="sponsors-title">
      <div className="edge">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="sponsors-title" className="mono-label text-[var(--stage-muted)]">
            Sponsored by
          </h2>
          <Link
            href="/sponsors"
            className="text-sm underline decoration-[var(--stage-line)] underline-offset-4 transition-colors hover:decoration-current"
          >
            Become a sponsor
          </Link>
        </div>

        <Stagger as="ul" stagger={0.08} className="mt-8">
          {sponsors.map((s, i) => (
            <StaggerItem
              index={i}
              as="li"
              key={s.name}
              className="rule-t grid grid-cols-1 gap-2 py-7 md:grid-cols-[minmax(0,300px)_1fr] md:items-baseline md:gap-10"
            >
              <span className="text-2xl font-semibold tracking-[-0.03em]">
                {s.name}
              </span>
              <span className="pretty max-w-[54ch] text-base text-[var(--stage-muted)]">
                {s.blurb}
              </span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>

      {/* The repeating top rail from the reference posters, running the full
          bleed. Speed and direction follow scroll velocity, so it reads as
          part of the page's movement rather than a detached loop. The names
          are already listed above, so this is presentational. */}
      <div className="rule-t rule-b mt-14 py-4">
        <Marquee className="text-[var(--stage-muted)]" baseSpeed={26} gap={40}>
          {[...sponsors, ...sponsors].map((s, i) => (
            <span key={`${s.name}-${i}`} className="flex items-center gap-4">
              <RegMark size={11} className="opacity-45" />
              <Annotation tone="current">{s.name}</Annotation>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
