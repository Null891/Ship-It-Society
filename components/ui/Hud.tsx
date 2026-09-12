/* ==========================================================================
   HUD primitives.

   The small, reusable pieces of the interface layer: corner-bracket frames,
   status lights, tags, readouts and tick meters. Server components — none of
   them need JavaScript to render, and the ones that move do it in CSS.

   Rule of use: each one must frame, label or measure something real. A tick
   meter shows an actual quantity; a status light reports an actual state. If
   there is nothing true to show, leave the primitive out.
   ========================================================================== */

type Tone = "line" | "accent";

/** Corner brackets around a region, as on a viewfinder. */
export function HudFrame({
  children,
  className = "",
  tone = "line",
  size = 12,
  inset = 0,
}: {
  children?: React.ReactNode;
  className?: string;
  tone?: Tone;
  /** Bracket arm length in px. */
  size?: number;
  /** Push the brackets outward (negative) or inward (positive), in px. */
  inset?: number;
}) {
  const color = tone === "accent" ? "border-marigold" : "border-[var(--stage-line-strong)]";
  const arm = { width: size, height: size };
  const corner = (pos: string) => `pointer-events-none absolute ${color} ${pos}`;
  return (
    <div className={`relative ${className}`}>
      <span aria-hidden className={corner("border-l border-t")} style={{ ...arm, left: inset, top: inset }} />
      <span aria-hidden className={corner("border-r border-t")} style={{ ...arm, right: inset, top: inset }} />
      <span aria-hidden className={corner("border-b border-l")} style={{ ...arm, left: inset, bottom: inset }} />
      <span aria-hidden className={corner("border-b border-r")} style={{ ...arm, right: inset, bottom: inset }} />
      {children}
    </div>
  );
}

/** A status light. Pair it with a visible label — colour alone never carries meaning. */
export function StatusDot({
  tone = "ok",
  blink = false,
  className = "",
  ref,
}: {
  tone?: "ok" | "accent" | "muted" | "alert";
  blink?: boolean;
  className?: string;
  /** For callers that drive the light imperatively, e.g. the hero's phase. */
  ref?: React.Ref<HTMLSpanElement>;
}) {
  const bg =
    tone === "ok"
      ? "bg-ok"
      : tone === "accent"
        ? "bg-marigold"
        : tone === "alert"
          ? "bg-alert"
          : "bg-[var(--stage-subtle)]";
  return (
    <span
      ref={ref}
      aria-hidden
      className={`inline-block h-1.5 w-1.5 shrink-0 ${bg} ${blink ? "fui-blink" : ""} ${className}`}
    />
  );
}

/** A mono tag. */
export function Tag({
  children,
  tone = "line",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "line" | "accent" | "solid";
  className?: string;
}) {
  const style =
    tone === "accent"
      ? "border-marigold text-marigold"
      : tone === "solid"
        ? "border-marigold bg-marigold text-ink"
        : "border-[var(--stage-line-strong)] text-[var(--stage-muted)]";
  return (
    <span
      className={`mono-label inline-flex h-6 items-center gap-1.5 rounded-pill border px-2.5 ${style} ${className}`}
    >
      {children}
    </span>
  );
}

/** A labelled value: mono caption above, value below. */
export function Readout({
  label,
  children,
  className = "",
  valueClassName = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  valueClassName?: string;
}) {
  return (
    <div className={className}>
      <div className="mono-label text-[var(--stage-subtle)]">{label}</div>
      <div className={`tnum mt-1.5 text-[var(--stage-fg)] ${valueClassName}`}>{children}</div>
    </div>
  );
}

/**
 * A tick meter: `total` ticks, the first `filled` of them lit.
 * Decorative by default — put the real number in text next to it.
 * The lit ticks build on left to right when an enclosing reveal plays.
 */
export function TickBar({
  total,
  filled,
  className = "",
  height = 18,
}: {
  total: number;
  filled: number;
  className?: string;
  height?: number;
}) {
  const n = Math.max(1, Math.round(total));
  const lit = Math.max(0, Math.min(n, Math.round(filled)));
  const pitch = 4;
  const width = n * pitch - 2;
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={`block w-full ${className}`}
      style={{ height }}
    >
      {Array.from({ length: n }, (_, i) => (
        <rect
          key={i}
          x={i * pitch}
          y={i < lit ? 0 : height * 0.45}
          width={2}
          height={i < lit ? height : height * 0.55}
          fill={i < lit ? "var(--color-marigold)" : "var(--stage-line-strong)"}
          className={i < lit ? "barcode-bar" : undefined}
          style={i < lit ? ({ "--bar-i": i } as React.CSSProperties) : undefined}
        />
      ))}
    </svg>
  );
}
