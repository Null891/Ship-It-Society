import { Eyebrow } from "@/components/ui/Button";
import { RevealLines, Reveal } from "@/components/motion/Reveal";
import { Barcode } from "@/components/ui/Poster";
import { HudFrame, StatusDot } from "@/components/ui/Hud";
import { club, meetingLine, schedule } from "@/content/club";

/* ==========================================================================
   The masthead every sub-page opens with.

   The title sits on columns 1-7; columns 9-12 carry a spec panel, so the
   right half of the screen is doing something instead of being empty. The
   panel's rows default to facts that are true on every page (the school,
   when the club meets, which cycle is next) and any page can pass its own.

   Behind it, an outlined echo of the first word runs off the right edge —
   the page's deliberate grid break — with registration crosses set on the
   margins. All of it is decoration over real structure: the echo and the
   crosses are aria-hidden, and the panel is a real description list.
   ========================================================================== */

export type HeaderMeta = { label: string; value: React.ReactNode }[];

/** A registration cross, as used to line up a print run. */
function Cross({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className={`pointer-events-none absolute h-4 w-4 text-[var(--stage-line-strong)] ${className}`}
      fill="none"
    >
      <path d="M8 0v16M0 8h16" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export function PageHeader({
  eyebrow,
  title,
  standfirst,
  index,
  meta,
  children,
}: {
  eyebrow: string;
  /** Pass an array to control exactly where the lines break. */
  title: string | string[];
  standfirst?: string;
  /** Position in the nav order, printed down the left margin. */
  index?: number;
  /** Spec rows. Defaults to facts that hold on every page. */
  meta?: HeaderMeta;
  children?: React.ReactNode;
}) {
  const lines = Array.isArray(title) ? title : [title];
  // The first word of the title, without its punctuation, set as the echo.
  const echo = (lines[0] ?? "").replace(/[.,:;!?]+$/, "").split(/\s+/)[0] ?? "";
  const rows: HeaderMeta =
    meta ??
    [
      { label: "School", value: club.school },
      { label: "Meets", value: meetingLine },
      {
        label: "Next cycle",
        value: `${schedule.nextHackathonName} · ${schedule.season[0].window}`,
      },
    ];

  return (
    <header className="relative overflow-hidden pt-32 md:pt-44">
      {/* The echo, cropped by the header's own edge. */}
      <span
        aria-hidden
        className="text-outline pointer-events-none absolute -right-[4%] top-28 hidden select-none text-[clamp(90px,13vw,220px)] font-light leading-none tracking-[-0.05em] opacity-[0.14] lg:block"
      >
        {echo}
      </span>

      <Cross className="left-[38%] top-28 hidden lg:block" />
      <Cross className="right-[7%] bottom-10 hidden lg:block" />

      {index !== undefined && (
        <span
          aria-hidden
          className="mono-label absolute left-3 top-44 hidden text-[var(--stage-subtle)] [writing-mode:vertical-rl] xl:block"
        >
          Page {String(index).padStart(2, "0")}
        </span>
      )}

      <div className="edge relative">
        <div className="grid12 items-start gap-y-10">
          <div className="col-span-4 md:col-span-7">
            <Eyebrow>{eyebrow}</Eyebrow>
            <RevealLines
              as="h1"
              lines={lines}
              className="optical balance mt-5 text-4xl font-light"
            />
            {standfirst && (
              <p className="pretty mt-7 max-w-[52ch] text-lg text-[var(--stage-muted)]">
                {standfirst}
              </p>
            )}
            {children}
          </div>

          <Reveal className="col-span-4 md:col-span-4 md:col-start-9">
            <HudFrame size={10} className="p-5 md:p-6">
              <dl className="space-y-5">
                {rows.map((row) => (
                  <div key={row.label}>
                    <dt className="mono-label text-[var(--stage-subtle)]">{row.label}</dt>
                    <dd className="tnum mt-1.5 text-base text-[var(--stage-fg)]">{row.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-7 flex items-center justify-between gap-3 border-t border-[var(--stage-line)] pt-4">
                <span className="mono-label inline-flex items-center gap-2 text-[var(--stage-muted)]">
                  <StatusDot tone="ok" blink />
                  Applications open
                </span>
                <Barcode seed={eyebrow} bars={14} height={13} className="opacity-60" />
              </div>
            </HudFrame>
          </Reveal>
        </div>
      </div>
    </header>
  );
}
