import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { club, footer, schedule } from "@/content/club";

const COLUMNS = [
  {
    title: "Club",
    links: [
      { href: "/hackathons", label: "The format" },
      { href: "/projects", label: "Projects" },
      { href: "/team", label: "Team" },
    ],
  },
  {
    title: "Get involved",
    links: [
      { href: "/join", label: "Apply to join" },
      { href: "/sponsors", label: "Sponsors" },
    ],
  },
];

export function Footer() {
  const social = [
    club.instagram && { href: club.instagram, label: "Instagram" },
    club.discord && { href: club.discord, label: "Discord" },
    club.github && { href: club.github, label: "GitHub" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <footer className="rule-t mt-32 pb-14 pt-16">
      <div className="edge">
        <div className="grid12 gap-y-12">
          <div className="col-span-4 md:col-span-5">
            <Link href="/" className="inline-flex text-xl">
              <Wordmark />
            </Link>
            <p className="pretty mt-5 max-w-[34ch] text-sm text-[var(--stage-muted)]">
              {footer.note}
            </p>
            <p className="mono-label mt-6 text-[var(--stage-muted)]">
              {schedule.cadence} &middot; {schedule.time}
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav
              key={col.title}
              aria-label={col.title}
              className="col-span-2 md:col-span-2 md:col-start-auto"
            >
              <h2 className="mono-label mb-4 text-[var(--stage-muted)]">
                {col.title}
              </h2>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm transition-opacity duration-[var(--dur-fast)] hover:opacity-60"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-4 md:col-span-3">
            <h2 className="mono-label mb-4 text-[var(--stage-muted)]">Contact</h2>
            <ul className="space-y-2.5">
              <li>
                <a
                  href={`mailto:${club.email}`}
                  className="text-sm transition-opacity duration-[var(--dur-fast)] hover:opacity-60"
                >
                  {club.email}
                </a>
              </li>
              {social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-sm transition-opacity duration-[var(--dur-fast)] hover:opacity-60"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rule-t mt-14 flex flex-col gap-2 pt-6 text-[var(--stage-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p className="mono-label">
            &copy; {new Date().getFullYear()} {club.name}
          </p>
          <p className="mono-label">{club.location}</p>
        </div>
      </div>
    </footer>
  );
}
