import Link from "next/link";
import { club } from "@/content/club";

/* ==========================================================================
   What happens to what you just typed.

   Every form on this site is filled in by a high-school student, and the
   application asks for a grade, which is an age. Collecting that from minors
   without saying where it goes is not defensible, so the answer sits at the
   point of collection rather than buried in a policy nobody opens.

   Kept to one sentence and a link. A wall of legal text at the submit button
   reads as a warning; this is meant to read as an answer.
   ========================================================================== */

export function PrivacyNote({ className = "" }: { className?: string }) {
  return (
    <p className={`pretty max-w-[52ch] text-sm text-[var(--stage-subtle)] ${className}`}>
      This goes to club officers by email. It is not shared, sold, or used for
      anything else, and you can{" "}
      <a
        href={`mailto:${club.email}?subject=Delete%20my%20details`}
        className="underline decoration-[var(--stage-line-strong)] underline-offset-4 transition-colors duration-[var(--dur-fast)] hover:text-[var(--stage-fg)] hover:decoration-marigold"
      >
        ask us to delete it
      </a>{" "}
      at any time.{" "}
      <Link
        href="/privacy"
        className="underline decoration-[var(--stage-line-strong)] underline-offset-4 transition-colors duration-[var(--dur-fast)] hover:text-[var(--stage-fg)] hover:decoration-marigold"
      >
        What we keep
      </Link>
      .
    </p>
  );
}
