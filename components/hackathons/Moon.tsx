import type { CycleStatus, SeasonState } from "@/lib/schedule";
import type { SeasonEntry } from "@/content/club";
import {
  deadlineAt,
  illumination,
  moonPhase,
  phaseName,
  shortDate,
  two,
  wallClock,
  kickoffAt,
} from "@/lib/schedule";
import { polar, r3 } from "@/lib/geometry";

/* ==========================================================================
   The cycle as a moon.

   One hackathon is drawn as one lunar month: new on day 1, full at the
   middle of the window, new again on the last day. The disc, the craters
   and the strip of small phases below it are generated here, in SVG, from
   the cycle's real day and length. Nothing is traced or embedded.

   Between cycles, before the season and after it, no window is open, so the
   moon is new and the labels say why. Nothing pretends a cycle is running.

   Hydration: every coordinate is rounded through r3/polar, and the craters
   come from a fixed-seed integer generator, so the server and the browser
   print identical attributes.
   ========================================================================== */

const SIZE = 200;
const CX = 100;
const CY = 100;
const R = 70;

/** Fixed-seed integer PRNG (mulberry32). Same sequence on every engine. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Crater = { x: number; y: number; r: number };

/* Craters: sampled from the fixed seed, largest first, rejecting any that
   would overlap one already placed, so they read as terrain, not a cluster. */
const CRATERS: Crater[] = (() => {
  const rnd = seeded(0x51_71_7e);
  const out: Crater[] = [];
  for (let attempt = 0; attempt < 120 && out.length < 16; attempt++) {
    const r = r3(12 - Math.min(9.5, out.length * 0.75 + rnd() * 2));
    const dist = Math.min(R - r - 3, R * 0.92 * Math.sqrt(rnd()));
    const [x, y] = polar(CX, CY, dist, rnd() * Math.PI * 2);
    if (out.every((c) => Math.hypot(c.x - x, c.y - y) > c.r + r + 2)) out.push({ x, y, r });
  }
  return out;
})();

/**
 * The lit part of a disc for a phase, as a path: the limb on the lit side,
 * then the terminator — a half-ellipse whose width is |cos| of the phase
 * angle — back to the top. Waxing is lit on the right, as seen from the
 * northern hemisphere. Null at new moon.
 */
export function litPath(cx: number, cy: number, radius: number, phase: number): string | null {
  const lit = illumination(phase);
  if (lit < 0.002) return null;
  const top = `${r3(cx)} ${r3(cy - radius)}`;
  const bottom = `${r3(cx)} ${r3(cy + radius)}`;
  const rr = r3(radius);
  if (lit > 0.998) {
    return `M ${top} A ${rr} ${rr} 0 1 1 ${bottom} A ${rr} ${rr} 0 1 1 ${top} Z`;
  }
  const waxing = phase < 0.5;
  const k = Math.cos(phase * 2 * Math.PI);
  const rx = r3(radius * Math.abs(k));
  const crescent = k > 0;
  const limbSweep = waxing ? 1 : 0;
  const termSweep = waxing ? (crescent ? 0 : 1) : crescent ? 1 : 0;
  return `M ${top} A ${rr} ${rr} 0 0 ${limbSweep} ${bottom} A ${rx} ${rr} 0 0 ${termSweep} ${top} Z`;
}

/** The same phase nudged toward full, for the soft terminator bands. */
function brighter(phase: number, by: number): number {
  return phase < 0.5 ? Math.min(0.5, phase + by) : Math.max(0.5, phase - by);
}

/* Band j of N reaches `by` past the terminator with opacity 1/(N+2-j), so
   the area covered by the first j bands is lit j/(N+1): a linear ramp. */
const BAND_STEP = 0.004;
const BAND_COUNT = 10;
const TERMINATOR_BANDS = Array.from({ length: BAND_COUNT }, (_, i) => ({
  by: r3((BAND_COUNT - i) * BAND_STEP),
  alpha: r3(1 / (BAND_COUNT + 1 - i)),
}));

type MoonProps = {
  /** The cycle in focus: running, else next, else the last one. */
  cycle: SeasonEntry | null;
  status: CycleStatus | null;
  day: number;
  total: number;
  state: SeasonState;
  complete: number;
  cycles: number;
  className?: string;
};

function longDate(at: Date): string {
  const w = wallClock(at);
  return `${w.month} ${w.day}`;
}

export function Moon({ cycle, status, day, total, state, complete, cycles, className = "" }: MoonProps) {
  const running = status === "running";
  // Only a running window has a day; every other state is drawn new.
  const phase = running ? moonPhase(day, total) : 0;
  const lit = running ? illumination(phase) : 0;
  const name = phaseName(phase, total > 1 ? 1 / (total - 1) : undefined);
  const main = litPath(CX, CY, R, phase);

  const title = running
    ? "Cycle phase"
    : state === "before"
      ? "Before the season"
      : state === "between"
        ? "Between cycles"
        : "Season complete";

  const label = !cycle
    ? "No hackathons are scheduled."
    : running
      ? `${cycle.name} as a moon phase: day ${day} of ${total}, ${name.toLowerCase()}, ${Math.round(lit * 100)}% lit. It closes ${longDate(deadlineAt(cycle))}.`
      : status === "planned"
        ? `${cycle.name} has not started, so the moon is new. It opens ${longDate(kickoffAt(cycle))}.`
        : `The season is complete, so the moon is new. All ${cycles} hackathons have closed.`;

  const today = running ? day - 1 : -1;
  const pitch = 10;

  return (
    <div className={`chamfer-line [--fill:var(--color-surface-900)] ${className}`}>
      <div className="flex items-center justify-between gap-4 border-b border-[var(--stage-line)] px-5 py-3.5">
        <p className="mono-label text-[var(--stage-fg)]">{title}</p>
        {cycle && <p className="mono-label text-[var(--stage-subtle)]">{cycle.name}</p>}
      </div>

      <div className="px-5 pb-6 pt-7">
        <svg
          role="img"
          aria-label={label}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="mx-auto block w-full max-w-[240px]"
          fill="none"
        >
          <defs>
            {main && (
              <clipPath id="cycle-moon-lit">
                <path d={main} />
              </clipPath>
            )}
          </defs>

          {/* Reticle: a dotted orbit and four crosshair ticks. */}
          <circle cx={CX} cy={CY} r={R + 18} stroke="var(--stage-line-strong)" strokeWidth={0.75} strokeDasharray="0.75 5" />
          {[0, 1, 2, 3].map((q) => {
            const a = (q * Math.PI) / 2;
            const [x1, y1] = polar(CX, CY, R + 9, a);
            const [x2, y2] = polar(CX, CY, R + 27, a);
            return <line key={q} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--stage-subtle)" strokeWidth={0.75} />;
          })}

          {/* The dark disc, its limb and the craters in shadow. */}
          <circle cx={CX} cy={CY} r={R} fill="var(--color-surface-800)" stroke="var(--stage-line-strong)" strokeWidth={0.75} />
          {CRATERS.map((c, i) => (
            <circle key={i} cx={c.x} cy={c.y} r={c.r} stroke="var(--stage-line)" strokeWidth={0.75} />
          ))}

          {main && (
            <>
              {/* Soft terminator, without blur: bands just past the edge whose
                  opacities (1/11, 1/10 … 1/2) stack to an even ramp. */}
              {TERMINATOR_BANDS.map((band) => {
                const d = litPath(CX, CY, R, brighter(phase, band.by));
                return d ? <path key={band.by} d={d} fill="var(--color-paper-muted)" fillOpacity={band.alpha} /> : null;
              })}
              <path d={main} fill="var(--color-paper-muted)" />
              <g clipPath="url(#cycle-moon-lit)">
                {CRATERS.map((c, i) => (
                  <circle
                    key={i}
                    cx={c.x}
                    cy={c.y}
                    r={c.r}
                    fill="var(--color-muted-dim)"
                    fillOpacity={0.38}
                    stroke="var(--color-muted-dim)"
                    strokeOpacity={0.55}
                    strokeWidth={0.75}
                  />
                ))}
              </g>
            </>
          )}
        </svg>

        {total > 0 && (
          <svg
            aria-hidden
            viewBox={`0 0 ${total * pitch} 16`}
            className="mt-7 block w-full"
            fill="none"
          >
            {Array.from({ length: total }, (_, i) => {
              const cx = i * pitch + pitch / 2;
              const d = litPath(cx, 8, 3.2, moonPhase(i + 1, total));
              const isToday = i === today;
              const past = running && i < today;
              return (
                <g key={i}>
                  <circle cx={cx} cy={8} r={3.2} fill="var(--color-surface-700)" />
                  {d && (
                    <path
                      d={d}
                      fill={
                        isToday
                          ? "var(--color-marigold)"
                          : past || status === "complete"
                            ? "var(--color-muted)"
                            : "var(--stage-line-strong)"
                      }
                    />
                  )}
                  {isToday && <circle cx={cx} cy={8} r={5.6} stroke="var(--color-marigold)" strokeWidth={1} />}
                </g>
              );
            })}
          </svg>
        )}

        {cycle && (
          <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-[var(--stage-line)] pt-5">
            {running ? (
              <>
                <Fact term="Day">
                  {two(day)} / {total}
                </Fact>
                <Fact term="Lit">{Math.round(lit * 100)}%</Fact>
                <Fact term="Phase">{name}</Fact>
                <Fact term="Closes">{shortDate(cycle.end)}</Fact>
              </>
            ) : status === "planned" ? (
              <>
                <Fact term="Opens">{shortDate(cycle.start)}</Fact>
                <Fact term="Closes">{shortDate(cycle.end)}</Fact>
                <Fact term="Length">{total} days</Fact>
                <Fact term="Phase">{name}</Fact>
              </>
            ) : (
              <>
                <Fact term="Closed">
                  {complete} of {cycles}
                </Fact>
                <Fact term="Last closed">{shortDate(cycle.end)}</Fact>
                <Fact term="Days">
                  {total} / {total}
                </Fact>
                <Fact term="Phase">{name}</Fact>
              </>
            )}
          </dl>
        )}
      </div>
    </div>
  );
}

function Fact({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="mono-label text-[var(--stage-subtle)]">{term}</dt>
      <dd className="tnum mt-1.5 text-base text-[var(--stage-fg)]">{children}</dd>
    </div>
  );
}
