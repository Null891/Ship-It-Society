import type { Metadata } from "next";
import { routeMetadata } from "@/lib/metadata";
import { ApplyForm } from "@/components/join/ApplyForm";
import { Burst } from "@/components/join/Burst";
import { PageHeader } from "@/components/ui/PageHeader";
import { GatePlate } from "@/components/ui/Plates";
import { Button, Eyebrow } from "@/components/ui/Button";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { club, join, meeting, teams } from "@/content/club";
import { forms, getInvolvedPage } from "@/content/forms";
import { APPLY_ORDER, isOptional } from "@/lib/apply";
import { readOutcome } from "@/lib/forms/shared";

export const metadata: Metadata = routeMetadata.join;

/* ==========================================================================
   /join — the application, and everything a student wants to know first.

   Split: the form on columns 1-7, the facts on 9-12 under a burst mark
   whose crosshair hairlines run past the grid to the edges of the window
   (the page's one grid break). Below, what happens after sending, then a
   way in for anyone not ready to apply.

   The page reads its query string for one reason: a form posted without
   JavaScript is redirected here with ?form=apply&status=..., and the outcome
   is rendered on the server.
   ========================================================================== */

const optionalCount = APPLY_ORDER.filter(isOptional).length;

const MEETING_FACTS = [
  { term: "Cadence", detail: meeting.cadence },
  { term: "Time", detail: meeting.time },
  ...(meeting.room ? [{ term: "Room", detail: meeting.room }] : []),
];

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const outcome = readOutcome(await searchParams, "apply", APPLY_ORDER);

  return (
    <>
      <PageHeader eyebrow={join.eyebrow} title={join.title} standfirst={join.standfirst} />

      <section aria-labelledby="apply-title" className="overflow-x-clip pt-16 md:pt-24">
        <div className="edge">
          <div className="grid12 items-start gap-y-20">
            {/* The form */}
            <div className="col-span-4 md:col-span-7">
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b border-[var(--stage-line)] pb-5">
                <div>
                  <Eyebrow index={1}>Apply</Eyebrow>
                  <h2 id="apply-title" className="mt-4 text-2xl font-normal">
                    The application
                  </h2>
                </div>
                <p className="mono-label tnum text-[var(--stage-subtle)]">
                  {APPLY_ORDER.length} questions · {optionalCount} optional
                </p>
              </div>
              <div className="mt-10">
                <ApplyForm outcome={outcome} />
              </div>
            </div>

            {/* The facts */}
            <aside
              aria-label="Club facts"
              className="col-span-4 md:col-span-4 md:col-start-9"
            >
              {/* Burst and crosshair. The hairlines are wider than the page on
                  purpose; the section clips them at the window edge. */}
              <div aria-hidden className="relative aspect-square w-full max-w-56 md:max-w-80">
                <span className="pointer-events-none absolute left-0 top-1/2 h-px w-[100vw] bg-[var(--color-line-dark-soft)]" />
                <span className="pointer-events-none absolute left-1/2 top-[-3rem] h-[calc(100%+3rem)] w-px bg-[var(--color-line-dark-soft)]" />
                <Burst className="relative h-full w-full" />
              </div>

              <div className="mt-12">
                <h2 className="mono-label text-[var(--stage-muted)]">When we meet</h2>
                <dl className="mt-4 border-t border-[var(--stage-line)]">
                  {MEETING_FACTS.map((f) => (
                    <div
                      key={f.term}
                      className="flex items-baseline justify-between gap-6 border-b border-[var(--stage-line)] py-3"
                    >
                      <dt className="mono-label text-[var(--stage-subtle)]">{f.term}</dt>
                      <dd className="tnum text-right text-base text-[var(--stage-fg)]">{f.detail}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="mt-10">
                <h2 className="mono-label text-[var(--stage-muted)]">Teams</h2>
                <p className="pretty mt-3 text-base text-[var(--stage-fg)]">{teams.summary}</p>
              </div>

              <div className="chamfer-line mt-10 px-5 py-5 [--fill:var(--color-surface-900)] [--line:var(--stage-line-strong)]">
                <h2 className="mono-label text-[var(--stage-muted)]">Before you apply</h2>
                <ul className="mt-4 space-y-2.5">
                  {join.points.map((p) => (
                    <li key={p} className="flex gap-3 text-sm leading-relaxed text-[var(--stage-fg)]">
                      <span aria-hidden className="font-mono text-marigold">
                        {">"}
                      </span>
                      <span className="pretty">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* The one plate driven by scroll SPEED rather than position:
                  the shards extend as you move and settle when you stop. */}
              <GatePlate className="mt-10" />

              <div className="mt-10 border-t border-[var(--stage-line)] pt-5">
                <h2 className="mono-label text-[var(--stage-muted)]">Questions</h2>
                <CopyEmail email={club.email} className="mt-3 text-base" />
                {club.discord && (
                  <p className="mt-3 text-base">
                    <a
                      href={club.discord}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="underline decoration-[var(--stage-line-strong)] underline-offset-4 transition-[text-decoration-color] duration-[var(--dur-fast)] hover:decoration-marigold"
                    >
                      Ask in the Discord
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* After you apply */}
      <section aria-labelledby="after-title" className="pt-28 md:pt-40">
        <div className="edge">
          <div className="grid12">
            <div className="col-span-4 md:col-span-6">
              <Eyebrow index={2}>After you apply</Eyebrow>
              <h2 id="after-title" className="optical balance mt-5 text-3xl font-normal">
                What happens after you apply
              </h2>
            </div>
          </div>

          <ol className="mt-12 grid grid-cols-1 md:mt-16 md:grid-cols-5 md:gap-6">
            {join.after.map((s, i) => (
              <li
                key={s.step}
                className="relative border-l border-[var(--stage-line)] pb-9 pl-7 last:pb-0 md:border-l-0 md:border-t md:pb-0 md:pl-0 md:pt-7"
              >
                <span
                  aria-hidden
                  className={`absolute -left-[3.5px] top-1 h-[7px] w-[7px] md:-top-[3.5px] md:left-0 ${
                    i === 0 ? "bg-marigold" : "border border-[var(--stage-line-strong)] bg-[var(--page-bg)]"
                  }`}
                />
                <p className="mono-label tnum text-marigold">{s.step}</p>
                <h3 className="mt-2 text-lg font-medium">{s.title}</h3>
                <p className="pretty mt-2 text-base text-[var(--stage-muted)]">{s.detail}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Not ready */}
      <section aria-labelledby="not-ready-title" className="pb-8 pt-28 md:pt-40">
        <div className="edge">
          <div className="grid12 items-end gap-y-8 border-t border-[var(--stage-line)] pt-10">
            <div className="col-span-4 md:col-span-6 md:col-start-6">
              <h2 id="not-ready-title" className="text-2xl font-normal">
                {forms.interest.title}
              </h2>
              <p className="pretty mt-3 max-w-[52ch] text-base text-[var(--stage-muted)]">
                {getInvolvedPage.standfirst}
              </p>
              <div className="mt-7">
                <Button href="/get-involved" variant="ghost" arrow>
                  {getInvolvedPage.eyebrow}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
