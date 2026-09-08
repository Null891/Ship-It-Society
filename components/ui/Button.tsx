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
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`mono-label text-[var(--stage-muted)] ${className}`}>
      {children}
    </p>
  );
}
