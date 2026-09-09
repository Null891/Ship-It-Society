import Link from "next/link";

/* ==========================================================================
   Buttons. Pill radius only — the radius system in CLAUDE.md reserves
   980px for actions, 12px for cards, and 0 for editorial blocks.

   Marigold fill carries near-black text, which is the only legal way to use
   the accent on a light surface.
   ========================================================================== */

type Variant = "solid" | "outline" | "quiet";

const base =
  "inline-flex items-center justify-center gap-2 rounded-pill px-6 py-3 text-base font-medium transition-[background-color,border-color,transform,opacity] duration-[var(--dur-fast)] ease-[var(--ease-apple)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45";

const variants: Record<Variant, string> = {
  solid: "bg-marigold text-ink hover:bg-marigold-hi",
  outline:
    "border border-[var(--stage-line)] text-[var(--stage-fg)] hover:border-[var(--stage-fg)]",
  quiet: "text-[var(--stage-fg)] opacity-70 hover:opacity-100",
};

export function Button({
  href,
  children,
  variant = "solid",
  className = "",
  type = "button",
  disabled,
  ...rest
}: {
  href?: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = `${base} ${variants[variant]} ${className}`;

  if (href) {
    const external = href.startsWith("http") || href.startsWith("mailto:");
    if (external) {
      return (
        <a
          href={href}
          className={cls}
          {...(href.startsWith("http")
            ? { target: "_blank", rel: "noreferrer noopener" }
            : {})}
        >
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={cls} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}

/** A short uppercase mono label. The site's "technical layer". */
export function Eyebrow({
  children,
  className = "",
  index,
}: {
  children: React.ReactNode;
  className?: string;
  /** Section number. Renders the poster's "01 /" index before the label. */
  index?: number;
}) {
  return (
    <p
      className={`mono-label flex items-center gap-2.5 text-[var(--stage-muted)] ${className}`}
    >
      {index !== undefined && (
        <>
          {/* The numbered index from the reference posters. Decorative: the
              label beside it already says what the section is. */}
          <span aria-hidden className="text-marigold-ink">
            {String(index).padStart(2, "0")}
          </span>
          <span aria-hidden className="h-px w-6 bg-[var(--stage-line)]" />
        </>
      )}
      {children}
    </p>
  );
}
