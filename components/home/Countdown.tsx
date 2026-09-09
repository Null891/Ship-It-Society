"use client";

import Link from "next/link";
import { meetingLine, schedule } from "@/content/club";
import { useNow } from "@/lib/hooks";
import { Odometer } from "@/components/ui/Odometer";
import { Grain } from "@/components/ui/Texture";

/* ==========================================================================
   Countdown.

   Reads the next meeting first, then the hackathon deadline. A date in the
   past is skipped rather than shown as a negative, so a stale content file
   degrades quietly instead of embarrassingly.

   The server cannot know the visitor's clock, so the digits render as
   placeholders until mount. That avoids a hydration mismatch without
   withholding anything meaningful — the label and date are server-rendered.
   ========================================================================== */

type Target = { label: string; iso: string; note: string };

/**
 * The next real date, or null once every date in the content file is past.
 *
 * Null does NOT mean "render nothing". This component used to return null in
 * that case, which silently deleted the entire band — headline, date and the
 * "Apply to join" call to action — the moment the last date elapsed. A
 * recruiting page quietly losing its recruiting button is the worst possible
 * failure, and it would have happened on a specific date with no warning.
 * See the between-cycles branch below.
 */
function pickTarget(now: number): Target | null {
  const candidates: Target[] = [
    {
      label: "Next meeting",
      iso: schedule.nextMeeting,
      note: meetingLine,
    },
    {
      label: schedule.nextHackathonName,
      iso: schedule.nextHackathonDeadline,
      note: "Deadline to ship",
    },
  ];
  return candidates.find((c) => new Date(c.iso).getTime() > now) ?? null;
}

function split(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

const PAD = (n: number) => String(n).padStart(2, "0");

/** Shared shell, so both states are visually identical apart from the clock. */
function Band({ children }: { children: React.ReactNode }) {
  return (
    // The deliberate grid break: a full-bleed dark band inside a light page.
    <section
      className="relative mt-28 overflow-hidden bg-ink py-20 text-paper md:mt-40 md:py-28"
      aria-labelledby="countdown-title"
    >
      <Grain />
      <div className="edge relative">{children}</div>
    </section>
  );
}

function ApplyCta() {
  return (
    <Link
      href="/join"
      className="mt-7 inline-flex rounded-pill bg-marigold px-6 py-3 text-base font-medium text-ink transition-[background-color,transform] duration-[var(--dur-fast)] ease-[var(--ease-apple)] hover:bg-marigold-hi active:scale-[0.98]"
    >
      Apply to join
    </Link>
  );
}

/**
 * Shown when every date in content/club.ts is in the past. Says so plainly
 * and keeps the call to action, rather than vanishing. Officers see this and
 * know to add the next season's dates.
 */
function BetweenCycles() {
  return (
    <Band>
      <div className="grid12 items-end gap-y-10">
        <div className="col-span-4 md:col-span-6">
          <p className="mono-label text-[var(--color-muted)]">
            Between hackathons
          </p>
          <h2
            id="countdown-title"
            className="optical mt-4 text-2xl font-semibold tracking-[-0.028em]"
          >
            Dates for the next cycle land soon.
          </h2>
          <p className="pretty mt-3 max-w-[42ch] text-base text-[var(--color-muted)]">
            Applications stay open between cycles. Apply now and you will be in
            the room for the next kickoff.
          </p>
          <ApplyCta />
        </div>
      </div>
    </Band>
  );
}

export function Countdown() {
  // 0 until the clock is running, which is what the server renders too.
  const now = useNow();

  // Both the server and the hydrating client evaluate this without a clock,
  // so they agree; it is only refined once the clock starts.
  const target = pickTarget(now);

  // Between cycles: every date in the content file has passed. Keep the band,
  // the headline and the CTA; only the clock goes away.
  if (!target) return <BetweenCycles />;

  const remaining =
    now === 0 ? null : split(new Date(target.iso).getTime() - now);

  const units: { value: string; label: string }[] =
    remaining === null
      ? [
          { value: "--", label: "Days" },
          { value: "--", label: "Hours" },
          { value: "--", label: "Min" },
          { value: "--", label: "Sec" },
        ]
      : [
          { value: String(remaining.days), label: "Days" },
          { value: PAD(remaining.hours), label: "Hours" },
          { value: PAD(remaining.minutes), label: "Min" },
          { value: PAD(remaining.seconds), label: "Sec" },
        ];

  const date = new Date(target.iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "America/Los_Angeles",
  });

  return (
    <Band>
        <div className="grid12 items-end gap-y-10">
          <div className="col-span-4 md:col-span-5">
            <p className="mono-label text-[var(--color-muted)]">{target.note}</p>
            <h2
              id="countdown-title"
              className="optical mt-4 text-2xl font-semibold tracking-[-0.028em]"
            >
              {target.label}
            </h2>
            <p className="mt-3 text-base text-[var(--color-muted)]">
              {[date, schedule.room].filter(Boolean).join(" · ")}
            </p>
            <ApplyCta />
          </div>

          <div
            className="col-span-4 md:col-span-6 md:col-start-7"
            role="timer"
            aria-live="off"
          >
            <dl className="grid grid-cols-4 gap-x-3">
              {units.map((u) => (
                <div key={u.label} className="border-t border-[var(--color-line-dark)] pt-4">
                  <dd className="text-3xl font-semibold tracking-[-0.03em]">
                    <Odometer value={u.value} />
                  </dd>
                  <dt className="mono-label mt-2 text-[var(--color-muted)]">
                    {u.label}
                  </dt>
                </div>
              ))}
            </dl>
            <p className="sr-only">
              Counting down to {target.label} on {date}.
            </p>
          </div>
        </div>
    </Band>
  );
}
