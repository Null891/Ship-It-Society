"use client";

import { useEffect, useRef, useState } from "react";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { club } from "@/content/club";
import { polar } from "@/lib/geometry";
import { HONEYPOT, REASON_COPY } from "@/lib/forms/shared";
import type { Errors, Failure } from "./useSubmission";
import styles from "./forms.module.css";

/* ==========================================================================
   Form furniture shared by the application and the built-in forms.

   Underline-only fields with mono labels above, choices as chamfered tiles
   over real native radios and checkboxes, counters on long answers, and
   the panels a submission can end in. Every control carries aria-invalid
   and aria-describedby, so its help, its limit and its error are read with
   it, and colour never carries an error alone: each one has an icon and a
   sentence.
   ========================================================================== */

export const ids = (base: string, name: string) => ({
  control: `${base}-${name}`,
  help: `${base}-${name}-help`,
  error: `${base}-${name}-error`,
  limit: `${base}-${name}-limit`,
});

const describedBy = (...parts: (string | false | undefined)[]) =>
  parts.filter(Boolean).join(" ") || undefined;

/* --- Labels, help, errors -------------------------------------------------- */

function Optional() {
  return <span className="mono-label text-[var(--stage-subtle)]">Optional</span>;
}

/** A small alert glyph, so an error is never signalled by colour alone. */
export function AlertGlyph({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 12 12" className={`h-3 w-3 shrink-0 ${className}`} fill="none">
      <path d="M6 1l5 9.5H1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M6 4.6v2.8M6 8.6v.9" stroke="currentColor" strokeWidth="1.1" />
    </svg>
  );
}

export function FieldError({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-2.5 flex items-start gap-2 text-sm text-alert">
      <AlertGlyph className="mt-[0.3em]" />
      <span>{children}</span>
    </p>
  );
}

function Help({ id, children }: { id: string; children?: string }) {
  if (!children) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-[var(--stage-muted)]">
      {children}
    </p>
  );
}

function LabelRow({
  htmlFor,
  children,
  optional,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <label htmlFor={htmlFor} className="mono-label text-[var(--stage-muted)]">
        {children}
      </label>
      {optional && <Optional />}
    </div>
  );
}

/* --- Single-line fields --------------------------------------------------- */

const LINE =
  "block w-full border-0 border-b bg-transparent px-0 pb-2.5 pt-2 text-[var(--stage-fg)] transition-[border-color] duration-[var(--dur-fast)]";

const lineTone = (invalid: boolean) =>
  invalid
    ? "border-alert"
    : "border-[var(--stage-line-strong)] hover:border-[var(--stage-muted)]";

export function TextField({
  base,
  name,
  label,
  type = "text",
  required,
  max,
  min,
  autoComplete,
  help,
  error,
}: {
  base: string;
  name: string;
  label: string;
  type?: "text" | "email" | "url";
  required: boolean;
  max: number;
  min?: number;
  autoComplete?: string;
  help?: string;
  error?: string;
}) {
  const id = ids(base, name);
  return (
    <div>
      <LabelRow htmlFor={id.control} optional={!required}>
        {label}
      </LabelRow>
      <Help id={id.help}>{help}</Help>
      <div className={`${styles.control} relative mt-1`}>
        <input
          id={id.control}
          name={name}
          type={type}
          inputMode={type === "email" ? "email" : type === "url" ? "url" : undefined}
          autoComplete={autoComplete ?? "off"}
          autoCapitalize={type === "text" ? undefined : "none"}
          spellCheck={type === "text" ? undefined : false}
          required={required}
          maxLength={max}
          minLength={min}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(help && id.help, error && id.error)}
          className={`${styles.input} ${LINE} text-base md:text-lg ${lineTone(!!error)}`}
        />
        <span aria-hidden className={styles.line} />
      </div>
      <FieldError id={id.error}>{error}</FieldError>
    </div>
  );
}

/* --- Long answers ----------------------------------------------------------
   The counter is visible to everyone and silent to assistive tech while
   there is plenty of room. Inside the last fifty characters it starts to
   speak, politely and only once typing pauses, so a screen reader hears
   "32 characters left" rather than a number per keystroke.
   ------------------------------------------------------------------------- */

const ANNOUNCE_WITHIN = 50;

export function TextAreaField({
  base,
  name,
  label,
  required,
  max,
  min,
  rows = 4,
  help,
  error,
}: {
  base: string;
  name: string;
  label: string;
  required: boolean;
  max: number;
  min?: number;
  rows?: number;
  help?: string;
  error?: string;
}) {
  const id = ids(base, name);
  const [length, setLength] = useState(0);
  const [spoken, setSpoken] = useState("");
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const n = e.currentTarget.value.length;
    setLength(n);
    window.clearTimeout(timer.current);
    const left = max - n;
    if (left > ANNOUNCE_WITHIN) {
      setSpoken("");
      return;
    }
    timer.current = window.setTimeout(
      () => setSpoken(left === 0 ? "No characters left." : `${left} characters left.`),
      700,
    );
  };

  const near = max - length <= ANNOUNCE_WITHIN;

  return (
    <div>
      <LabelRow htmlFor={id.control} optional={!required}>
        {label}
      </LabelRow>
      <Help id={id.help}>{help}</Help>
      <div className={`${styles.control} relative mt-1`}>
        <textarea
          id={id.control}
          name={name}
          rows={rows}
          required={required}
          maxLength={max}
          minLength={min}
          onInput={onInput}
          data-lenis-prevent
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(help && id.help, id.limit, error && id.error)}
          className={`${styles.input} ${styles.ruled} ${LINE} min-h-28 resize-y text-base ${lineTone(!!error)}`}
        />
        <span aria-hidden className={styles.line} />
      </div>
      <div className="mt-2 flex items-start justify-between gap-4">
        <FieldError id={id.error}>{error}</FieldError>
        <p
          aria-hidden
          className={`mono-label tnum ml-auto mt-2.5 shrink-0 ${near ? "text-marigold" : "text-[var(--stage-subtle)]"}`}
        >
          {length} / {max}
        </p>
      </div>
      <span id={id.limit} className="sr-only">
        {min ? `Between ${min} and ${max} characters.` : `Up to ${max} characters.`}
      </span>
      <span role="status" aria-live="polite" className="sr-only">
        {spoken}
      </span>
    </div>
  );
}

/* --- Choices ----------------------------------------------------------------
   Real radios and checkboxes, visually hidden but focusable, inside tiles
   that are their labels. Arrow keys, Space, form posts and autofill all
   behave natively; the tile only draws the state. The focus ring is drawn
   on the tile, because the input itself is not visible.
   ------------------------------------------------------------------------- */

export type Option = { value: string; label: string; hint?: string };

export function ChoiceField({
  base,
  name,
  label,
  options,
  multiple = false,
  required,
  help,
  error,
  layout = "wrap",
}: {
  base: string;
  name: string;
  label: string;
  options: readonly Option[];
  multiple?: boolean;
  required: boolean;
  help?: string;
  error?: string;
  /** "row" keeps short options in one segmented row; "stack" suits hints. */
  layout?: "row" | "wrap" | "stack";
}) {
  const id = ids(base, name);
  const grid =
    layout === "row"
      ? "grid-cols-[repeat(auto-fit,minmax(3.25rem,1fr))]"
      : layout === "stack"
        ? "grid-cols-1 sm:grid-cols-3"
        : "grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-3";

  return (
    <fieldset className="m-0 min-w-0 border-0 p-0">
      <legend className="mb-0 w-full p-0">
        <span className="flex items-baseline justify-between gap-4">
          <span className="mono-label text-[var(--stage-muted)]">{label}</span>
          {!required && <Optional />}
        </span>
      </legend>
      <Help id={id.help}>{help}</Help>
      <div className={`mt-3 grid gap-2 ${grid}`}>
        {options.map((o, i) => (
          <label
            key={o.value}
            className={`chamfer-line relative flex min-h-11 cursor-pointer items-center gap-3 px-3.5 py-2.5 [--cut:var(--cut-sm)] [--fill:var(--ground,var(--page-bg))] has-[:checked]:[--fill:var(--color-surface-800)] has-[:checked]:[--line:var(--color-marigold)] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-marigold ${
              error
                ? "[--line:var(--color-alert)]"
                : "[--line:var(--stage-line-strong)] hover:[--line:var(--color-muted)]"
            } ${layout === "row" ? "justify-center px-2" : ""}`}
          >
            <input
              type={multiple ? "checkbox" : "radio"}
              name={name}
              value={o.value}
              required={!multiple && required ? true : undefined}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy(help && id.help, error && id.error)}
              id={i === 0 ? id.control : undefined}
              className="peer sr-only"
            />
            {/* The mark: a diamond that fills (one of) or a square that
                ticks (any of), so the two kinds of group read differently. */}
            <span
              aria-hidden
              className={`relative grid shrink-0 place-items-center border border-[var(--stage-line-strong)] transition-colors duration-[var(--dur-fast)] peer-checked:border-marigold ${
                multiple ? "h-3 w-3 peer-checked:bg-marigold" : "h-2.5 w-2.5 rotate-45 peer-checked:[&>span]:bg-marigold"
              } ${layout === "row" ? "hidden" : ""}`}
            >
              {multiple ? (
                <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-ink" fill="none">
                  <path d="M2.5 6.2l2.3 2.3 4.7-5" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              ) : (
                <span className="block h-1.5 w-1.5 bg-transparent" />
              )}
            </span>
            <span className="min-w-0">
              <span className={`block text-base leading-snug ${layout === "row" ? "tnum text-center" : ""}`}>
                {o.label}
              </span>
              {o.hint && (
                <span className="mt-0.5 block text-sm text-[var(--stage-muted)]">{o.hint}</span>
              )}
            </span>
          </label>
        ))}
      </div>
      <FieldError id={id.error}>{error}</FieldError>
    </fieldset>
  );
}

/* --- The trap ----------------------------------------------------------------
   Off-screen, out of the tab order, hidden from assistive tech with its
   label, and named so autofill has no reason to touch it. See HONEYPOT. */

export function Honeypot({ base }: { base: string }) {
  return (
    <div aria-hidden="true" className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden">
      <label htmlFor={`${base}-${HONEYPOT}`}>Leave this empty</label>
      <input
        id={`${base}-${HONEYPOT}`}
        name={HONEYPOT}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}

/* --- Sending ---------------------------------------------------------------- */

/** Eight ticks; the bright one steps round while a submission is in flight. */
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={`h-3.5 w-3.5 ${styles.spinner} ${className}`}>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const [x1, y1] = polar(8, 8, 3.2, a);
        const [x2, y2] = polar(8, 8, 7, a);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="currentColor"
            strokeWidth="1.6"
            opacity={i === 0 ? 1 : 0.18 + i * 0.06}
          />
        );
      })}
    </svg>
  );
}

/* --- Summaries and panels ----------------------------------------------------- */

/** Every field that needs attention, each a link to its control. It shakes
 *  once when a refused attempt produces it (re-keyed per attempt). */
export function ErrorSummary({
  base,
  errors,
  order,
  labels,
}: {
  base: string;
  errors: Errors;
  order: readonly string[];
  labels: Record<string, string>;
}) {
  const names = order.filter((n) => errors[n]);
  if (names.length === 0) return null;

  const jump = (e: React.MouseEvent<HTMLAnchorElement>, name: string) => {
    const form = e.currentTarget.closest("form");
    const item = form?.elements.namedItem(name);
    const el = item instanceof RadioNodeList ? (item[0] as HTMLElement | undefined) : (item as HTMLElement | null);
    if (!el) return;
    e.preventDefault();
    el.focus();
    el.scrollIntoView({ block: "center" });
  };

  return (
    <div
      role="alert"
      className="fui-crash chamfer-line mb-10 px-5 py-4 [--fill:var(--color-surface-900)] [--line:var(--color-alert)]"
    >
      <p className="flex items-center gap-2.5 text-base text-[var(--stage-fg)]">
        <AlertGlyph className="text-alert" />
        {REASON_COPY.invalid.title}
      </p>
      <ul className="mt-2.5 space-y-1.5 pl-[1.375rem]">
        {names.map((n) => (
          <li key={n} className="text-sm text-[var(--stage-muted)]">
            <a
              href={`#${ids(base, n).control}`}
              onClick={(e) => jump(e, n)}
              className="underline decoration-[var(--stage-line-strong)] underline-offset-4 hover:text-[var(--stage-fg)] hover:decoration-marigold"
            >
              {labels[n] ?? n}
            </a>
            <span className="text-[var(--stage-subtle)]"> · </span>
            {errors[n]}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A submission the server refused for a reason other than the answers. */
export function FailurePanel({
  failure,
  id,
  live = true,
  email = true,
  className = "",
}: {
  failure: Failure;
  /** Set for a panel a no-JavaScript redirect lands on. */
  id?: string;
  /** In-page failures announce themselves and shake once; a panel that is
   *  part of a page load does neither. */
  live?: boolean;
  /** Offer the club email as the way round it. Not needed when the fix is
   *  simply to correct an answer. */
  email?: boolean;
  className?: string;
}) {
  return (
    <div
      id={id}
      role={live ? "alert" : undefined}
      tabIndex={id ? -1 : undefined}
      className={`${live ? "fui-crash" : ""} chamfer-line mb-10 scroll-mt-28 px-5 py-4 [--fill:var(--color-surface-900)] [--line:var(--color-alert)] ${className}`}
    >
      <p className="flex items-center gap-2.5 text-base text-[var(--stage-fg)]">
        <AlertGlyph className="text-alert" />
        {failure.title}
      </p>
      <p className="pretty mt-1.5 pl-[1.375rem] text-sm text-[var(--stage-muted)]">{failure.body}</p>
      {email && (
        <div className="mt-3 pl-[1.375rem] text-sm">
          <CopyEmail email={club.email} />
        </div>
      )}
    </div>
  );
}

/** Focus a panel once it mounts, so a person lands on the result. */
export function useFocusOnMount<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (enabled) ref.current?.focus({ preventScroll: false });
  }, [enabled]);
  return ref;
}
