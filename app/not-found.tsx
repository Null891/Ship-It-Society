import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[70svh] items-center pt-32">
      <div className="edge">
        <p className="mono-label text-[var(--stage-muted)]">Error 404</p>
        <h1 className="optical mt-5 max-w-[14ch] text-4xl font-semibold">
          That page did not ship.
        </h1>
        <p className="pretty mt-5 max-w-[44ch] text-lg text-[var(--stage-muted)]">
          The link is broken or the page has moved. Everything the club has
          published is one level up.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-pill bg-marigold px-6 py-3 text-base font-medium text-ink transition-[background-color,transform] duration-[var(--dur-fast)] ease-[var(--ease-apple)] hover:bg-marigold-hi active:scale-[0.98]"
          >
            Back to home
          </Link>
          <Link
            href="/projects"
            className="rounded-pill border border-[var(--stage-line)] px-6 py-3 text-base transition-colors duration-[var(--dur-fast)] hover:border-[var(--stage-fg)]"
          >
            See the projects
          </Link>
        </div>
      </div>
    </section>
  );
}
