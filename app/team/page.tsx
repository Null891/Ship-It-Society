import type { Metadata } from "next";
import Image from "next/image";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { meetingLine, officers, teamPage } from "@/content/club";

export const metadata: Metadata = {
  title: "Team",
  description:
    "The officers who run Ship It Society, and who run every hackathon end to end.",
};

/** Initials for the monogram tile shown when an officer has no photo. */
function initials(name: string) {
  if (!name) return "—";
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function TeamPage() {
  return (
    <>
      <PageHeader
        eyebrow={teamPage.eyebrow}
        title={teamPage.title}
        standfirst={teamPage.standfirst}
      />

      <section className="pt-16 md:pt-24">
        <div className="edge">
          <Stagger
            as="ul"
            stagger={0.08}
            className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3"
          >
            {officers.map((o, i) => (
              <StaggerItem index={i} as="li" key={`${o.name}-${i}`}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-card bg-surface-100">
                  {o.image ? (
                    <Image
                      src={o.image}
                      alt={o.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    // Designed empty state: a monogram tile, not a grey box.
                    <div className="flex h-full items-center justify-center bg-ink">
                      <span className="text-4xl font-semibold tracking-[-0.04em] text-[var(--color-muted)]">
                        {initials(o.name)}
                      </span>
                      <span
                        aria-hidden
                        className="absolute bottom-6 right-6 h-2.5 w-2.5 bg-marigold"
                      />
                    </div>
                  )}
                </div>

                <div className="mt-5">
                  <h2 className="text-xl font-semibold tracking-[-0.022em]">
                    {o.name}
                  </h2>
                  <p className="mono-label mt-2 text-[var(--stage-muted)]">
                    {o.role}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <div className="rule-t mt-20 flex flex-wrap items-baseline justify-between gap-4 pt-6">
            <p className="max-w-[46ch] text-base text-[var(--stage-muted)]">
              Officer positions open each year. Come to a meeting and say you
              are interested.
            </p>
            <p className="mono-label text-[var(--stage-muted)]">
              {meetingLine}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
