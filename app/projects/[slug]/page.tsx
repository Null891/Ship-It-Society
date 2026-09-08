import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects } from "@/content/projects";
import { Eyebrow } from "@/components/ui/Button";
import { CoverPlate } from "@/components/ui/Texture";
import { Morph } from "@/components/ui/Morph";
import { RevealLines } from "@/components/motion/Reveal";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

/* The full set of projects is known at build time from content/projects.ts,
   so an unknown slug is a broken link, not a page to render on demand.
   Returning 404 for those is both more correct and keeps the whole route
   static rather than leaving a serverless function behind. */
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Project not found" };
  return { title: project.title, description: project.tagline };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <article>
      <header className="pt-32 md:pt-44">
        <div className="edge">
          <Link
            href="/projects"
            className="mono-label inline-block text-[var(--stage-muted)] transition-opacity hover:opacity-60"
          >
            &larr; All projects
          </Link>

          <div className="grid12 mt-8">
            <div className="col-span-4 md:col-span-8">
              <Eyebrow>{project.sample ? "Sample entry" : project.hackathon}</Eyebrow>
              <RevealLines
                as="h1"
                lines={project.title}
                className="optical mt-4 text-4xl font-semibold"
              />
              <p className="pretty mt-5 max-w-[48ch] text-lg text-[var(--stage-muted)]">
                {project.tagline}
              </p>
            </div>
          </div>

          {project.sample && (
            <p className="rule-t mt-10 max-w-[62ch] pt-5 text-sm text-[var(--stage-muted)]">
              This is a placeholder showing how a finished case study reads. It
              is not a real project.
            </p>
          )}
        </div>
      </header>

      {/* The plate the grid card morphs into. */}
      <section className="pt-12 md:pt-16">
        <div className="edge">
          <Morph name={`cover-${project.slug}`}>
            <div className="relative aspect-[16/9] overflow-hidden rounded-card md:aspect-[21/9]">
              <CoverPlate
                seed={project.slug}
                tone={project.cover}
                className="absolute inset-0 h-full w-full"
              />
            </div>
          </Morph>
        </div>
      </section>

      {/* Spec table */}
      <section className="pt-14 md:pt-20">
        <div className="edge">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
            <div className="rule-t pt-4">
              <dt className="mono-label text-[var(--stage-muted)]">Team</dt>
              <dd className="mt-2 text-base">{project.team.join(", ")}</dd>
            </div>
            <div className="rule-t pt-4">
              <dt className="mono-label text-[var(--stage-muted)]">Stack</dt>
              <dd className="mt-2 text-base">{project.stack.join(", ")}</dd>
            </div>
            <div className="rule-t pt-4">
              <dt className="mono-label text-[var(--stage-muted)]">
                Open findings
              </dt>
              <dd className="tnum mt-2 text-base">
                {project.findings}
                {project.findings === 0 && (
                  <span className="ml-2 text-[var(--stage-muted)]">Clean</span>
                )}
              </dd>
            </div>
            <div className="rule-t pt-4">
              <dt className="mono-label text-[var(--stage-muted)]">Live</dt>
              <dd className="mt-2 text-base">
                {project.url ? (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline decoration-[var(--stage-line)] underline-offset-4 transition-colors hover:decoration-current"
                  >
                    Visit
                  </a>
                ) : (
                  <span className="text-[var(--stage-muted)]">Not deployed</span>
                )}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* The story */}
      <section className="pt-20 md:pt-28">
        <div className="edge">
          <div className="grid12">
            <div className="col-span-4 space-y-6 md:col-span-7 md:col-start-4">
              {project.story.map((p) => (
                <p key={p.slice(0, 24)} className="pretty text-lg">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="pt-20 md:pt-28">
        <div className="edge">
          <div className="rule-t flex flex-wrap items-baseline justify-between gap-4 pt-6">
            <p className="text-base text-[var(--stage-muted)]">
              Want to build the next one?
            </p>
            <Link
              href="/join"
              className="rounded-pill bg-marigold px-6 py-3 text-base font-medium text-ink transition-[background-color,transform] duration-[var(--dur-fast)] ease-[var(--ease-apple)] hover:bg-marigold-hi active:scale-[0.98]"
            >
              Apply to join
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
