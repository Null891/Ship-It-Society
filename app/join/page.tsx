import type { Metadata } from "next";
import { ApplyForm } from "@/components/join/ApplyForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { GatePlate } from "@/components/ui/Plates";
import { club, join, schedule } from "@/content/club";

export const metadata: Metadata = {
  title: "Apply to join",
  description: join.standfirst,
};

export default function JoinPage() {
  return (
    <>
      <PageHeader
        eyebrow={join.eyebrow}
        title={join.title}
        standfirst={join.standfirst}
      />

      <section className="pt-16 md:pt-24">
        <div className="edge">
          <div className="grid12 items-start">
            <div className="col-span-4 md:col-span-7">
              <ApplyForm />
            </div>

            <aside className="col-span-4 mt-14 md:col-span-4 md:col-start-9 md:mt-0">
              <div className="rule-t pt-5">
                <h2 className="mono-label text-[var(--stage-muted)]">
                  When we meet
                </h2>
                <p className="mt-3 text-lg font-medium">{schedule.cadence}</p>
                <p className="text-base text-[var(--stage-muted)]">
                  {[schedule.time, schedule.room].filter(Boolean).join(" · ")}
                </p>
              </div>

              {/* The one plate driven by scroll SPEED rather than position:
                  the shards extend as you move and settle when you stop. */}
              <GatePlate className="mt-10" />

              <div className="rule-t mt-8 pt-5">
                <h2 className="mono-label text-[var(--stage-muted)]">
                  Before you apply
                </h2>
                <ul className="mt-4 space-y-3">
                  {join.points.map((p) => (
                    <li key={p} className="flex gap-3 text-base">
                      <span
                        aria-hidden
                        className="mt-[0.6em] h-[5px] w-[5px] shrink-0 bg-marigold"
                      />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rule-t mt-8 pt-5">
                <h2 className="mono-label text-[var(--stage-muted)]">
                  Questions
                </h2>
                <a
                  href={`mailto:${club.email}`}
                  className="mt-3 block text-base underline decoration-[var(--stage-line)] underline-offset-4 transition-colors hover:decoration-current"
                >
                  {club.email}
                </a>
                {club.discord && (
                  <a
                    href={club.discord}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-2 block text-base underline decoration-[var(--stage-line)] underline-offset-4 transition-colors hover:decoration-current"
                  >
                    Ask in the Discord
                  </a>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
