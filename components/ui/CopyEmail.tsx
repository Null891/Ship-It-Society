"use client";

import { useEffect, useRef, useState } from "react";

/* ==========================================================================
   The club email, with a copy control beside it.

   The address stays a real mailto link, so it works with no JavaScript and
   on devices with a mail client. The copy button is the convenience for the
   much more common case of a school Chromebook with no mail app configured,
   where a mailto link does nothing at all.

   The confirmation is announced through a polite live region, and the
   button's own label changes, so both sighted and screen-reader users hear
   that it worked. If the Clipboard API is unavailable (an insecure context,
   or a browser that blocks it), the button says so instead of pretending.
   ========================================================================== */

type State = "idle" | "copied" | "failed";

export function CopyEmail({
  email,
  className = "",
  linkClassName = "",
}: {
  email: string;
  className?: string;
  linkClassName?: string;
}) {
  const [state, setState] = useState<State>("idle");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    window.clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("failed");
    }
    timer.current = window.setTimeout(() => setState("idle"), 2400);
  };

  const label = state === "copied" ? "Copied" : state === "failed" ? "Copy blocked" : "Copy";

  return (
    <span className={`inline-flex flex-wrap items-center gap-x-3 gap-y-1 ${className}`}>
      <a
        href={`mailto:${email}`}
        className={`inline-flex min-h-6 items-center break-all underline decoration-[var(--stage-line-strong)] underline-offset-4 transition-[text-decoration-color] duration-[var(--dur-fast)] hover:decoration-marigold ${linkClassName}`}
      >
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        className={`mono-label inline-flex h-6 items-center border px-2 transition-colors duration-[var(--dur-fast)] ${
          state === "copied"
            ? "fui-flash border-marigold text-marigold"
            : state === "failed"
              ? "border-alert text-alert"
              : "border-[var(--stage-line-strong)] text-[var(--stage-muted)] hover:border-marigold hover:text-[var(--stage-fg)]"
        }`}
      >
        {label}
        <span className="sr-only"> email address</span>
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {state === "copied" ? "Email address copied." : state === "failed" ? "Your browser blocked copying. Select the address to copy it." : ""}
      </span>
    </span>
  );
}
