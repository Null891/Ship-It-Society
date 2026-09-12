import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { StatusDot } from "@/components/ui/Hud";
import { LocalClock } from "@/components/footer/LocalClock";
import { club, footer, meetingLine, season, short } from "@/content/club";
import { projects } from "@/content/projects";

/* ==========================================================================
   The footer, as a system panel.

   Every readout is real: the build it was deployed from, the club's local
   time, when it meets, and a dot matrix of the season — one square per day,
   filled for the days that have passed, marigold for today. The matrix is
   computed when the page is rendered, and the root layout revalidates every
   six hours, so it stays current without anyone redeploying.

   The archive only appears once there is something in it.
   ========================================================================== */

const COLUMNS = [
  {
    title: "Club",
    links: [
      { href: "/hackathons", label: "The format" },
      { href: "/handbook", label: "Handbook" },
      ...(projects.length > 0 ? [{ href: "/projects", label: "Projects" }] : []),
      { href: "/about", label: "About" },
    ],
  },
  {
    title: "Get involved",
    links: [
      { href: "/join", label: "Apply to join" },
      { href: "/get-involved#speak", label: "Speak at a meeting" },
      { href: "/get-involved#give", label: "Donate a prize" },
      { href: "/sponsors", label: "Sponsors" },
    ],
  },
];

/** One entry per day of the season, marked against today. */
function seasonDays(now: Date) {
  const first = season[0];
  const last = season[season.length - 1];
  if (!first || !last) return { days: [], label: "" };

  const start = Date.parse(`${first.start}T12:00:00Z`);
  const end = Date.parse(`${last.end}T12:00:00Z`);
  const today = Date.parse(`${now.toISOString().slice(0, 10)}T12:00:00Z`);
  const total = Math.max(1, Math.round((end - start) / 86_400_000) + 1);

  const days = Array.from({ length: total }, (_, i) => {
    const at = start + i * 86_400_000;
    if (at === today) return "today" as const;
    return at < today ? ("past" as const) : ("ahead" as const);
  });
  return { days, label: `${short(first.start)} – ${short(last.end)}` };
}

export function Footer() {
  const now = new Date();
  const { days, label: seasonLabel } = seasonDays(now);
  const elapsed = days.filter((d) => d !== "ahead").length;

  const social = [
    club.instagram && { href: club.instagram, label: "Instagram" },
    club.discord && { href: club.discord, label: "Discord" },
    club.github && { href: club.github, label: "GitHub" },
  ].filter(Boolean) as { href: string; label: string }[];

  // Vercel exposes the commit it built from; locally there is none.
  const build = (process.env.VERCEL_GIT_COMMIT_SHA ?? "").slice(0, 7) || "local";

  return (
    <footer className="mt-32 border-t border-[var(--stage-line)] pb-12 pt-16">
      <div className="edge">
        {/* ---- System panel ---------------------------------------------- */}
        <div className="chamfer-line [--cut:16px] p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-6">
            <div>
              <Link href="/" className="inline-flex text-xl">
                <Wordmark />
              </Link>
              <p className="pretty mt-4 max-w-[38ch] text-sm text-[var(--stage-muted)]">
                {footer.note}
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-x-10 gap-y-5 sm:grid-cols-4">
              <div>
                <dt className="mono-label text-[var(--stage-subtle)]">Build</dt>
                <dd className="mono-label mt-1.5 text-[var(--stage-fg)]">{build}</dd>
              </div>
              <div>
                <dt className="mono-label text-[var(--stage-subtle)]">Local time</dt>
                <dd className="mono-label mt-1.5 text-[var(--stage-fg)]">
                  <LocalClock />
                </dd>
              </div>
              <div>
                <dt className="mono-label text-[var(--stage-subtle)]">Season</dt>
                <dd className="mono-label mt-1.5 text-[var(--stage-fg)]">{seasonLabel}</dd>
              </div>
              <div>
                <dt className="mono-label text-[var(--stage-subtle)]">Status</dt>
                <dd className="mono-label mt-1.5 inline-flex items-center gap-2 text-[var(--stage-fg)]">
                  <StatusDot tone="ok" blink />
                  Open
                </dd>
              </div>
            </dl>
          </div>

          {/* The season, one square per day. */}
          <div className="mt-8 border-t border-[var(--stage-line)] pt-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <span className="mono-label text-[var(--stage-subtle)]">Season progress</span>
              <span className="mono-label tnum text-[var(--stage-muted)]">
                Day {elapsed} / {days.length}
              </span>
            </div>
            <div aria-hidden className="mt-3 flex flex-wrap gap-[3px]">
              {days.map((d, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 ${
                    d === "today"
                      ? "bg-marigold"
                      : d === "past"
                        ? "bg-[var(--stage-line-strong)]"
                        : "bg-[var(--stage-line)]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ---- Links ------------------------------------------------------ */}
        <div className="grid12 mt-12 gap-y-10">
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title} className="col-span-2 md:col-span-3">
              <h2 className="mono-label mb-4 text-[var(--stage-subtle)]">{col.title}</h2>
              <ul className="space-y-1">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-flex min-h-6 items-center py-0.5 text-sm text-[var(--stage-muted)] transition-colors duration-[var(--dur-fast)] hover:text-[var(--stage-fg)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-4 md:col-span-3">
            <h2 className="mono-label mb-4 text-[var(--stage-subtle)]">Contact</h2>
            <CopyEmail email={club.email} className="text-sm" />
            {social.length > 0 && (
              <ul className="mt-4 space-y-1">
                {social.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex min-h-6 items-center py-0.5 text-sm text-[var(--stage-muted)] transition-colors duration-[var(--dur-fast)] hover:text-[var(--stage-fg)]"
                    >
                      {s.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="col-span-4 md:col-span-3">
            <h2 className="mono-label mb-4 text-[var(--stage-subtle)]">Meets</h2>
            <p className="text-sm text-[var(--stage-muted)]">{meetingLine}</p>
            <p className="mt-4 text-sm text-[var(--stage-muted)]">{club.location}</p>
          </div>
        </div>

        {/* ---- Rule ------------------------------------------------------- */}
        <div className="mt-14 border-t border-[var(--stage-line)] pt-5">
          <div aria-hidden className="flex items-end justify-between">
            {Array.from({ length: 40 }, (_, i) => (
              <span
                key={i}
                className={`w-px bg-[var(--stage-line)] ${i % 5 === 0 ? "h-2.5" : "h-1.5"}`}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2 text-[var(--stage-subtle)] sm:flex-row sm:items-center sm:justify-between">
            <p className="mono-label">
              &copy; {now.getFullYear()} {club.name}
            </p>
            <p className="mono-label">{club.school}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
