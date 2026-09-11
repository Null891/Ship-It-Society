import Link from "next/link";

/* ==========================================================================
   Buttons.

   The HUD cut: actions are chamfered, not rounded. Three variants:

     primary  marigold fill, ink text. The one filled action per view.
     ghost    a 1px chamfered outline that lights marigold on hover.
     quiet    text with a trailing arrow, for tertiary links.

   Every label rolls on hover — the text slides up and an identical copy
   slides in beneath it. The copy is aria-hidden, so assistive tech reads
   the label once. It is pure CSS, and reduced motion (which collapses all
   transition durations globally) makes it an instant swap.

   External links open in a new tab and SAY so, in visually hidden text,
   so nobody is surprised by a context change they were not told about.
   ========================================================================== */

type Variant = "primary" | "ghost" | "quiet";
type Size = "sm" | "md" | "lg";

const SIZE: Record<Size, string> = {
  sm: "h-9 px-4 text-sm [--cut:var(--cut-sm)]",
  md: "h-11 px-5 text-base",
  lg: "h-[52px] px-7 text-base",
};

const VARIANT: Record<Variant, string> = {
  primary:
    "chamfer bg-marigold font-medium text-ink hover:bg-marigold-hi active:translate-y-px",
  ghost:
    "chamfer-line font-medium text-[var(--stage-fg)] [--line:var(--stage-line-strong)] hover:[--line:var(--color-marigold)] active:translate-y-px",
  quiet:
    "px-0 font-medium text-[var(--stage-fg)] underline decoration-[var(--stage-line-strong)] underline-offset-[6px] hover:decoration-marigold",
};

const BASE =
  "group relative inline-flex select-none items-center justify-center gap-2.5 whitespace-nowrap transition-[background-color,color,transform,text-decoration-color] duration-[var(--dur-fast)] ease-[var(--ease-apple)] disabled:pointer-events-none disabled:opacity-45";

/** The rolling label. The visible copy is the one announced. */
export function Roll({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-flex overflow-hidden">
      <span className="block transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover:-translate-y-full group-focus-visible:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute inset-0 block translate-y-full transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-focus-visible:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}

function Arrow({ external }: { external: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className="h-3 w-3 shrink-0 transition-transform duration-[var(--dur-base)] ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
      fill="none"
    >
      {external ? (
        <path d="M3.5 8.5l5-5M4.5 3.5h4v4" stroke="currentColor" strokeWidth="1.3" />
      ) : (
        <path d="M1.5 6h8M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.3" />
      )}
    </svg>
  );
}

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  arrow = false,
  className = "",
  type = "button",
  disabled,
  ...rest
}: {
  href?: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  /** Trailing arrow. External links get the diagonal one automatically. */
  arrow?: boolean;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
} & Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type">) {
  const cls = `${BASE} ${variant === "quiet" ? "" : SIZE[size]} ${VARIANT[variant]} ${className}`;
  const external = !!href && /^https?:/.test(href);
  const label = (
    <>
      <Roll>{children}</Roll>
      {(arrow || external) && <Arrow external={external} />}
    </>
  );

  if (href) {
    if (external) {
      return (
        <a href={href} className={cls} target="_blank" rel="noreferrer noopener">
          {label}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      );
    }
    if (href.startsWith("mailto:")) {
      return (
        <a href={href} className={cls}>
          {label}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {label}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} disabled={disabled} {...rest}>
      {label}
    </button>
  );
}

/**
 * The section eyebrow: a numbered index, a double-slash, and the label.
 * The number slides in and blinks twice when the section enters.
 */
export function Eyebrow({
  children,
  className = "",
  index,
}: {
  children: React.ReactNode;
  className?: string;
  /** Section number, rendered as the poster's "01 //" index. */
  index?: number;
}) {
  return (
    <p
      data-reveal
      className={`mono-label flex items-center gap-2.5 text-[var(--stage-muted)] ${className}`}
    >
      {index !== undefined && (
        <>
          {/* Decorative: the label beside it already names the section. */}
          <span aria-hidden className="fui-slide-blink text-marigold">
            {String(index).padStart(2, "0")}
          </span>
          <span aria-hidden className="text-[var(--stage-subtle)]">
            {"//"}
          </span>
        </>
      )}
      {children}
    </p>
  );
}
