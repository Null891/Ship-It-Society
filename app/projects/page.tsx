import type { Metadata } from "next";
import { routeMetadata } from "@/lib/metadata";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { projects, projectsPage } from "@/content/projects";
import { CoverPlate } from "@/components/ui/Texture";
import { Morph } from "@/components/ui/Morph";
import { ArchivePlate } from "@/components/ui/Plates";

export const metadata: Metadata = routeMetadata.projects;

const COVER: Record<string, string> = {
  ink: "bg-ink",
  surface: "bg-surface-900",
  marigold: "bg-marigold",
};

export default function ProjectsPage() {
  return (
    <>
      <PageHeader
        eyebrow={projectsPage.eyebrow}
        title={projectsPage.title}
        standfirst={projectsPage.standfirst}
      />

      {/* The archive's own plate: the word in pixel type on a marigold
          ground, resolving column by column behind a scan bar. Decorative —
          the page heading already says it. */}
      <section className="pt-12 md:pt-16">
        <div className="edge">
          <ArchivePlate />
        </div>
      </section>

      <section className="pt-16 md:pt-24">
        <div className="edge">
          {projects.length === 0 ? (
            /* A designed state, not a gap. The archive is empty because the
               first cycle has not finished — say so, and give the reader the
               next thing to do instead of a dead end. */
            <div className="rule-t grid12 pt-8">
              <div className="col-span-4 md:col-span-2">
                <span
                  aria-hidden
                  className="mono-label block text-[var(--stage-muted)]"
                >
                  {projectsPage.empty.index}
                </span>
                <span className="mono-label mt-2 block text-marigold">
                  {projectsPage.empty.label}
                </span>
              </div>

              <div className="col-span-4 mt-6 md:col-span-7 md:col-start-4 md:mt-0">
                <h2 className="optical text-2xl font-semibold tracking-[-0.028em]">
                  {projectsPage.empty.headline}
                </h2>
                <p className="pretty mt-5 max-w-[52ch] text-lg text-[var(--stage-muted)]">
                  {projectsPage.empty.body}
                </p>
                <Link
                  href={projectsPage.empty.cta.href}
                  className="mono-label group mt-8 inline-flex items-center gap-2 border-b border-[var(--stage-line)] pb-1 transition-colors duration-[var(--dur-fast)] hover:border-[currentColor]"
                >
                  {projectsPage.empty.cta.label}
                  <span
                    aria-hidden
                    className="transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-1"
                  >
                    →
                  </span>
                </Link>
              </div>
            </div>
          ) : (
            <Stagger
              as="ul"
              stagger={0.08}
              className="grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2"
            >
              {projects.map((p, i) => (
                <StaggerItem index={i} as="li" key={p.slug}>
                  <Link href={`/projects/${p.slug}`} className="group block">
                    <Morph name={`cover-${p.slug}`}>
                      <div
                        className={`relative aspect-[4/3] overflow-hidden rounded-card ${
                          COVER[p.cover] ?? "bg-ink"
                        }`}
                      >
                        {/* No screenshot yet, so the plate is generated from
                            the slug: every project reads differently, and none
                            of them read as a missing image. */}
                        <CoverPlate
                          seed={p.slug}
                          tone={p.cover}
                          className="absolute inset-0 h-full w-full transition-transform duration-[600ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-x-0 bottom-0 flex items-end p-7">
                          <span
                            className={`mono-label ${
                              p.cover === "marigold"
                                ? "text-ink"
                                : "text-[var(--color-muted)]"
                            }`}
                          >
                            {p.stack.join(" · ")}
                          </span>
                        </div>
                        <div
                          aria-hidden
                          className="absolute right-7 top-7 h-2.5 w-2.5 bg-marigold transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out-expo)] group-hover:scale-[2.6]"
                        />
                      </div>
                    </Morph>

                    <div className="mt-5 flex items-baseline justify-between gap-4">
                      <h2 className="text-xl font-semibold tracking-[-0.022em]">
                        {p.title}
                      </h2>
                      <span className="mono-label shrink-0 text-[var(--stage-muted)]">
                        {p.hackathon}
                      </span>
                    </div>
                    <p className="pretty mt-2 max-w-[46ch] text-base text-[var(--stage-muted)]">
                      {p.tagline}
                    </p>
                  </Link>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>
    </>
  );
}
