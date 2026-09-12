import { Eyebrow } from "@/components/ui/Button";
import { HudFrame, StatusDot, Tag } from "@/components/ui/Hud";
import { Annotation, RegMark } from "@/components/ui/Poster";
import { Reveal } from "@/components/motion/Reveal";
import { format, meeting, prizes, teams } from "@/content/club";
import { r3 } from "@/lib/geometry";

/* ==========================================================================
   One hackathon, as a spec sheet.

   A product spec is the right shape for this: a single headline number, then
   label/value rows grouped under small headings, then a line drawing of the
   thing itself. Every row is derived — the milestones are the last day of
   each week in the format, the weights are the judging criteria, the team
   rule is the team rule.
   ========================================================================== */

/** The cycle length, read off the last day of the last week. */
const lastDay = format.weeks.at(-1)?.days.at(-1)?.day ?? "";
const CYCLE_DAYS = Number(lastDay.match(/(\d+)\s*$/)?.[1] ?? 0);

/** The closing day of each week: the milestone the week builds toward. */
const MILESTONES = format.weeks.map((w) => {
  const day = w.days.at(-1);
  return { week: w.label, day: day?.day ?? "", title: day?.title ?? "" };
});

/* --- The drawing ----------------------------------------------------------
   An isometric box: what the month produces, standing on its own ground with
   a live indicator. Projected at the usual 2:1, so every face is drawn from
   the same three vectors and nothing is traced.
   ------------------------------------------------------------------------- */

const COS = Math.cos(Math.PI / 6);
const SIN = Math.sin(Math.PI / 6);
const ORIGIN = { x: 250, y: 190 };

function iso(x: number, y: number, z: number): [number, number] {
  return [
    r3(ORIGIN.x + (x - y) * COS),
    r3(ORIGIN.y + (x + y) * SIN - z),
  ];
}

/** A flat quad at height z, as an SVG points string. */
function top(w: number, d: number, z: number) {
  return [iso(0, 0, z), iso(w, 0, z), iso(w, d, z), iso(0, d, z)]
    .map(([x, y]) => `${x},${y}`)
    .join(" ");
}

function face(side: "left" | "right", w: number, d: number, z: number, h: number) {
  const pts =
    side === "left"
      ? [iso(0, d, z), iso(w, d, z), iso(w, d, z - h), iso(0, d, z - h)]
      : [iso(w, 0, z), iso(w, d, z), iso(w, d, z - h), iso(w, 0, z - h)];
  return pts.map(([x, y]) => `${x},${y}`).join(" ");
}

function IsoBox() {
  const W = 150;
  const D = 110;
  const H = 46;
  const Z = 70;

  return (
    <svg viewBox="0 0 500 320" className="h-full w-full" aria-hidden fill="none">
      {/* The ground it stands on. */}
      <polygon
        points={top(W + 60, D + 60, 0)}
        transform="translate(-30, -30)"
        fill="var(--color-surface-900)"
        stroke="var(--stage-line)"
        strokeWidth="1"
      />
      {/* Drop lines from the box to the ground. */}
      <g stroke="var(--stage-line-strong)" strokeWidth="1" strokeDasharray="3 5">
        {[[0, 0], [W, 0], [W, D], [0, D]].map(([x, y], i) => {
          const [sx, sy] = iso(x, y, Z - H);
          const [gx, gy] = iso(x, y, 0);
          return <line key={i} x1={sx} y1={sy} x2={gx} y2={gy} />;
        })}
      </g>

      {/* The box. */}
      <polygon points={face("left", W, D, Z, H)} fill="var(--color-ink)" stroke="var(--color-paper)" strokeWidth="1" strokeOpacity="0.55" />
      <polygon points={face("right", W, D, Z, H)} fill="var(--color-ink-soft)" stroke="var(--color-paper)" strokeWidth="1" strokeOpacity="0.55" />
      <polygon points={top(W, D, Z)} fill="var(--color-surface-800)" stroke="var(--color-paper)" strokeWidth="1" strokeOpacity="0.75" />

      {/* Vents on the front face, and a live indicator. */}
      <g stroke="var(--color-paper)" strokeOpacity="0.35" strokeWidth="1">
        {[0, 1, 2, 3].map((i) => {
          const [ax, ay] = iso(18, D, Z - 12 - i * 8);
          const [bx, by] = iso(W - 52, D, Z - 12 - i * 8);
          return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} />;
        })}
      </g>
      {(() => {
        const [lx, ly] = iso(W - 30, D, Z - 22);
        return (
          <>
            <circle cx={lx} cy={ly} r="5" fill="var(--color-marigold)" />
            <circle cx={lx} cy={ly} r="11" stroke="var(--color-marigold)" strokeWidth="1" opacity="0.5" />
          </>
        );
      })()}

      {/* Leader lines out to the three things a finished project must have. */}
      {[
        { label: "Live URL", x: W, y: 0, z: Z, dx: 150, dy: -40 },
        { label: "Clean scan", x: W / 2, y: 0, z: Z, dx: 120, dy: -92 },
        { label: "Five-minute demo", x: 0, y: D / 2, z: Z - H, dx: -128, dy: 66 },
      ].map((l) => {
        const [px, py] = iso(l.x, l.y, l.z);
        const ex = r3(px + l.dx);
        const ey = r3(py + l.dy);
        const anchor = l.dx < 0 ? "end" : "start";
        return (
          <g key={l.label}>
            <path
              d={`M${px} ${py} L${r3(px + l.dx * 0.45)} ${ey} L${ex} ${ey}`}
              stroke="var(--color-marigold)"
              strokeWidth="1"
              className="draw-path"
              pathLength={1}
            />
            <circle cx={px} cy={py} r="2.5" fill="var(--color-marigold)" />
            <text
              x={anchor === "end" ? ex - 8 : ex + 8}
              y={ey + 4}
              textAnchor={anchor}
              className="font-mono"
              fill="var(--color-muted)"
              fontSize="12"
              style={{ letterSpacing: "0.09em" }}
            >
              {l.label.toUpperCase()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* --- The sheet ------------------------------------------------------------ */

function Rows({
  title,
  rows,
}: {
  title: string;
  rows: { term: string; value: string }[];
}) {
  return (
    <div>
      <h3 className="mono-label border-b border-[var(--stage-line)] pb-3 text-[var(--stage-subtle)]">
        {title}
      </h3>
      <dl className="mt-1">
        {rows.map((r) => (
          <div
            key={r.term}
            className="flex items-baseline justify-between gap-4 border-b border-[var(--stage-line)] py-3"
          >
            <dt className="text-sm text-[var(--stage-muted)]">{r.term}</dt>
            <dd className="tnum text-right text-sm text-[var(--stage-fg)]">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function SpecSheet({ index }: { index: number }) {
  return (
    <section className="pt-20 md:pt-28" aria-labelledby="spec-title">
      <div className="edge">
        <div className="grid12 items-start gap-y-12">
          {/* The number. */}
          <div className="col-span-4 md:col-span-4">
            <Eyebrow index={index}>The spec</Eyebrow>
            <h2 id="spec-title" className="optical mt-5 flex items-baseline gap-3">
              <span className="text-5xl font-light leading-[0.85]">{CYCLE_DAYS}</span>
              <span className="text-xl font-light text-[var(--stage-muted)]">days</span>
            </h2>
            <p className="pretty mt-6 max-w-[34ch] text-base text-[var(--stage-muted)]">
              {format.standfirst}
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <Tag>
                {teams.min}–{teams.max} per team
              </Tag>
              <Tag>{meeting.cadence}</Tag>
            </div>
            <div className="mt-8 flex items-center gap-2.5">
              <RegMark size={13} className="text-marigold" />
              <Annotation className="text-[var(--stage-subtle)]">
                Cycle {String(CYCLE_DAYS).padStart(2, "0")} / spec sheet
              </Annotation>
            </div>
          </div>

          {/* The tables. */}
          <div className="col-span-4 grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-2 md:col-span-8 md:col-start-5">
            <Rows
              title="Milestones"
              rows={MILESTONES.map((m) => ({ term: m.title, value: m.day }))}
            />
            <Rows
              title="Requirements"
              rows={[
                { term: "Deployed to a live URL", value: "Required" },
                { term: "Security review cleared", value: "Required" },
                { term: "Open findings at the deadline", value: "None" },
                { term: "Slide deck", value: "Not required" },
              ]}
            />
            <Rows
              title="Judging"
              rows={prizes.criteria.map((c) => ({ term: c.term, value: c.weight }))}
            />
            <Rows
              title="Prizes"
              rows={prizes.tiers.map((t) => ({
                term: t.title,
                value: prizes.currency === "USD" ? `$${t.amount}` : `${t.amount} ${prizes.currency}`,
              }))}
            />
          </div>

          {/* The drawing. */}
          <Reveal className="col-span-4 md:col-span-12">
            <HudFrame size={12} className="mt-4 p-6 md:p-8">
              <div className="grid12 items-center gap-y-8">
                <div className="col-span-4 md:col-span-5">
                  <h3 className="text-2xl font-light">What a finished month looks like.</h3>
                  <p className="pretty mt-4 max-w-[38ch] text-base text-[var(--stage-muted)]">
                    A product on the internet, reviewed before it got there, and
                    five minutes in front of the room to show it works.
                  </p>
                  <span className="mono-label mt-6 inline-flex items-center gap-2 text-[var(--stage-muted)]">
                    <StatusDot tone="ok" blink />
                    Deployed
                  </span>
                </div>
                <div className="col-span-4 md:col-span-6 md:col-start-7">
                  <IsoBox />
                </div>
              </div>
            </HudFrame>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
