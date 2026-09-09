import { CountUp } from "./CountUp";

/* ==========================================================================
   The reveal primitives the whole site uses.

   These are SERVER components. They emit plain markup plus a data attribute;
   all the motion lives in CSS (globals.css) and is driven by the single
   observer in RevealRoot. That means:

     · the SSR payload contains no opacity:0 — content is visible by default
     · no per-element client component, so less JS on every page
     · no hydration mismatch, because nothing is decided at render time

   The old version used Motion's whileInView with initial="hidden", which
   shipped opacity:0 from the server and left the hero permanently blank if
   the observer never fired. See globals.css for the full explanation.
   ========================================================================== */

export { CountUp };

/** A quiet rise. For supporting content only, never for body paragraphs. */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  /** Stagger index, in 60ms steps. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  return (
    <Tag
      data-reveal=""
      className={className}
      style={delay ? ({ "--reveal-i": delay } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}

/**
 * Display type rising out of its own mask, one line at a time.
 * Lines are explicit rather than measured, so the break never lands
 * somewhere embarrassing at an arbitrary width.
 */
export function RevealLines({
  lines,
  className = "",
  delay = 0,
  as: Tag = "h2",
  id,
}: {
  lines: string | string[];
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p";
  id?: string;
}) {
  const list = Array.isArray(lines) ? lines : [lines];
  return (
    <Tag id={id} data-reveal-lines="" className={className}>
      {list.map((line, i) => (
        <span key={line} className="block overflow-hidden pb-[0.08em]">
          <span
            className="reveal-line"
            style={{ "--reveal-i": i + delay } as React.CSSProperties}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}

/**
 * A group whose children rise in sequence. The parent is the observed
 * element, so the whole group reveals together with per-child delays —
 * children are never observed individually.
 */
export function Stagger({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Accepted for call-site compatibility; spacing comes from --reveal-i. */
  stagger?: number;
  delay?: number;
  as?: "div" | "ul" | "dl";
}) {
  return (
    <Tag data-stagger="" className={className}>
      {children}
    </Tag>
  );
}

export function StaggerItem({
  children,
  className = "",
  index = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Position in the group. Drives the 60ms-per-step delay. */
  index?: number;
  as?: "div" | "li" | "dd" | "article";
}) {
  return (
    <Tag
      data-reveal=""
      className={className}
      style={{ "--reveal-i": index } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
