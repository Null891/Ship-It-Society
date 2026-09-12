import { sponsors } from "@/content/sponsors";
import { Eyebrow, Button } from "@/components/ui/Button";
import { Marquee } from "@/components/ui/Poster";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";

/* ==========================================================================
   Sponsors.

   A ticker of the names, set as wordmarks and separated by a four-point
   mark, over a list that says what each one actually gives. The ticker's
   speed follows the scroll and its edges fade into the page; the duplicated
   half of the loop is hidden from assistive tech, and every fact in it is
   readable as text underneath.
   ========================================================================== */

function Star({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={`h-3 w-3 shrink-0 ${className}`} fill="none">
      <path
        d="M12 0c.6 6.2 5.2 10.8 12 12-6.8 1.2-11.4 5.8-12 12-.6-6.2-5.2-10.8-12-12C6.8 10.8 11.4 6.2 12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SponsorRow() {
  return (
    <section className="pt-28 md:pt-40" aria-labelledby="sponsors-title">
      <div className="edge">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <Eyebrow index={6}>Sponsored by</Eyebrow>
            <h2 id="sponsors-title" className="optical mt-4 text-3xl font-light">
              {sponsors.length} backers, no strings.
            </h2>
          </div>
          <Button href="/sponsors" variant="ghost" size="sm" arrow>
            Become a sponsor
          </Button>
        </div>
      </div>

      {/* The ticker runs the full width, and fades out at both edges. */}
      <div
        className="mt-10 border-y border-[var(--stage-line)] py-7"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <Marquee baseSpeed={26} gap={48}>
          {sponsors.map((s) => (
            <span key={s.name} className="flex items-center gap-12">
              <span className="whitespace-nowrap text-3xl font-light tracking-[-0.03em] text-[var(--stage-fg)]">
                {s.name}
              </span>
              <Star className="text-marigold" />
            </span>
          ))}
        </Marquee>
      </div>

      <div className="edge">
        <Stagger as="ul" className="mt-10">
          {sponsors.map((s, i) => (
            <StaggerItem
              index={i}
              as="li"
              key={s.name}
              className="grid grid-cols-1 gap-2 border-t border-[var(--stage-line)] py-6 md:grid-cols-[auto_minmax(0,220px)_1fr] md:items-baseline md:gap-10"
            >
              <span aria-hidden className="mono-label text-[var(--stage-subtle)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-lg font-normal">{s.name}</span>
              <span className="pretty max-w-[62ch] text-base text-[var(--stage-muted)]">
                {s.contribution}
              </span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
