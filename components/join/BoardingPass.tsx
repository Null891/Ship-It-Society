"use client";

import { useEffect, useRef } from "react";
import { StatusDot } from "@/components/ui/Hud";
import { Barcode } from "@/components/ui/Poster";
import { club, join, meetingLine, schedule } from "@/content/club";
import styles from "./join.module.css";

/* ==========================================================================
   The application-received pass.

   A boarding pass rather than a thank-you box, and everything printed on it
   is true: the applicant's first name, the cycle they are applying into,
   and when the club next meets. The name is only ever the one they just
   typed, held in this tab — it is not stored, sent or remembered anywhere
   the form did not already send it.

   Without JavaScript the page renders the same pass from the redirect, and
   it simply has no name on it.
   ========================================================================== */

/** Let a " · " list wrap only between its parts, never inside "12:15 PM". */
const unbroken = (line: string) =>
  line
    .split(" · ")
    .map((part) => part.replace(/ /g, " "))
    .join(" · ");

export function BoardingPass({
  name,
  id,
  focus = false,
}: {
  /** First name, from the form just sent. Omitted without JavaScript. */
  name?: string;
  id?: string;
  /** Move focus to the pass on mount (the in-page success). */
  focus?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const titleId = `${id ?? "pass"}-title`;

  useEffect(() => {
    if (focus) ref.current?.focus();
  }, [focus]);

  return (
    <section
      ref={ref}
      id={id}
      tabIndex={-1}
      aria-labelledby={titleId}
      className={`scroll-mt-28 ${focus ? styles.issue : ""}`}
    >
      <div className={styles.ticket}>
        {/* Body */}
        <div className="min-w-0 border-t border-marigold px-5 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-6">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
            <span className="mono-label text-[var(--stage-muted)]">{club.name}</span>
            <span className="mono-label flex items-center gap-2 text-[var(--stage-fg)]">
              <StatusDot tone="ok" />
              Received
            </span>
          </div>

          <dl className="mt-7 grid grid-cols-1 gap-x-8 gap-y-5 min-[480px]:grid-cols-2">
            {name && (
              <div className="min-w-0 min-[480px]:col-span-2">
                <dt className="mono-label text-[var(--stage-subtle)]">Applicant</dt>
                <dd className="mt-1.5 break-words font-mono text-3xl uppercase leading-none text-[var(--stage-fg)]">
                  {name}
                </dd>
              </div>
            )}
            {/* Without a name, the cycle takes the large slot instead. */}
            <div className={`min-w-0 ${name ? "" : "min-[480px]:col-span-2"}`}>
              <dt className="mono-label text-[var(--stage-subtle)]">Cycle</dt>
              <dd
                className={`tnum mt-1.5 font-mono uppercase text-marigold ${name ? "text-xl leading-tight" : "text-3xl leading-none"}`}
              >
                {schedule.nextHackathonName}
              </dd>
            </div>
            <div className={`min-w-0 ${name ? "" : "min-[480px]:col-span-2"}`}>
              <dt className="mono-label text-[var(--stage-subtle)]">Next meeting</dt>
              <dd className="tnum mt-1.5 text-base leading-snug text-[var(--stage-fg)]">{unbroken(meetingLine)}</dd>
            </div>
          </dl>

          <div className="mt-7 border-t border-[var(--stage-line)] pt-5">
            <h3 id={titleId} className="text-2xl font-normal">
              {join.success.title}
            </h3>
            <p className="pretty mt-2 max-w-[46ch] text-base text-[var(--stage-muted)]">
              {join.success.body}
            </p>
          </div>
        </div>

        {/* Stub */}
        <div
          aria-hidden
          className={`${styles.stub} flex flex-col items-center justify-between gap-6 border-t border-[var(--stage-line-strong)] py-6`}
        >
          <p className={`mono-label ${styles.vertical} whitespace-nowrap text-[var(--stage-muted)]`}>
            {club.shortName} <span className="text-[var(--stage-subtle)]">{"//"}</span>{" "}
            {schedule.nextHackathonName}
          </p>
          <div className="relative h-24 w-7 sm:h-28 sm:w-9">
            <div className="absolute left-1/2 top-1/2 w-24 -translate-x-1/2 -translate-y-1/2 rotate-90 sm:w-28">
              <Barcode seed={schedule.nextHackathonName} bars={34} height={28} className="text-[var(--stage-fg)]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
