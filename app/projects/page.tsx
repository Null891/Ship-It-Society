import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { projects, projectsPage } from "@/content/projects";
import { CoverPlate } from "@/components/ui/Texture";
import { Morph } from "@/components/ui/Morph";

export const metadata: Metadata = {
  title: "Projects",
  description: projectsPage.standfirst,
};

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
        title={["Everything the club", "has shipped."]}
        standfirst={projectsPage.standfirst}
      />

      <section className="pt-16 md:pt-24">
        <div className="edge">
          {projects.length === 0 ? (
            <p className="rule-t max-w-[46ch] pt-8 text-lg text-[var(--stage-muted)]">
              {projectsPage.empty}
            </p>
          ) : (
            <Stagger
              as="ul"
              stagger={0.08}
              className="grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2"
            >
              {projects.map((p) => (
                <StaggerItem as="li" key={p.slug}>
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
                        {p.sample ? "Sample" : p.hackathon}
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

          {projects.some((p) => p.sample) && (
            <p className="rule-t mt-16 pt-5 text-sm text-[var(--stage-muted)]">
              Entries marked <span className="mono-label">Sample</span> are
              placeholders showing how a finished write-up reads. They are not
              real projects. Remove them from{" "}
              <span className="font-mono text-[13px]">content/projects.ts</span>{" "}
              once the first hackathon has run.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
