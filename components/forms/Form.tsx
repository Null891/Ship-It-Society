"use client";

import { useCallback, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { StatusDot } from "@/components/ui/Hud";
import type { FieldSpec, FormSpec } from "@/content/forms";
import { fallbacksFor, schemaFor, toFieldErrors } from "@/lib/forms/schema";
import {
  REASON_COPY,
  outcomeAnchor,
  type Outcome,
  type Reason,
} from "@/lib/forms/shared";
import {
  ChoiceField,
  ErrorSummary,
  FailurePanel,
  Honeypot,
  Spinner,
  TextAreaField,
  TextField,
  useFocusOnMount,
} from "./Fields";
import { useSubmission, type Errors, type Values } from "./useSubmission";
import styles from "./forms.module.css";

/* ==========================================================================
   A built-in form, rendered from its spec in content/forms.ts.

   The same spec builds the schema this validates against and the schema the
   route handler validates against, so the two cannot disagree. The form is
   a real <form method="post"> aimed at its endpoint: with JavaScript it
   submits as JSON and answers in place; without it the browser posts, the
   route redirects back, and the page renders the outcome on the server.

   Outcomes without JavaScript arrive one of two ways:
     outcome         the page read ?form=&status= itself (a dynamic page)
     statusByTarget  the page is static, so every panel is rendered hidden
                     and the redirect's #fragment shows the right one
   ========================================================================== */

const SHORT = new Set<FieldSpec["kind"]>(["text", "email", "url"]);

/** Short fields pair up two to a row; a short field with no partner, and
 *  every long or choice field, takes the full width. */
function spans(fields: FieldSpec[]): boolean[] {
  const half: boolean[] = fields.map(() => false);
  let run: number[] = [];
  const flush = () => {
    const paired = run.length - (run.length % 2);
    for (let i = 0; i < paired; i++) half[run[i]] = true;
    run = [];
  };
  fields.forEach((f, i) => (SHORT.has(f.kind) ? run.push(i) : flush()));
  flush();
  return half;
}

const NO_JS_FIELD = "Check this answer, then send it again.";

type Level = 2 | 3 | 4;

export function ReceivedPanel({
  title,
  body,
  id,
  focus = false,
  enter = false,
  headingLevel = 3,
  className = "",
}: {
  title: string;
  body: string;
  id?: string;
  /** Move focus here on mount: the in-page success after a submission. */
  focus?: boolean;
  enter?: boolean;
  headingLevel?: Level;
  className?: string;
}) {
  const ref = useFocusOnMount<HTMLDivElement>(focus);
  const Heading = (["h2", "h3", "h4"] as const)[headingLevel - 2];
  return (
    <div
      ref={ref}
      id={id}
      tabIndex={-1}
      className={`chamfer-line scroll-mt-28 px-6 py-7 [--fill:var(--color-surface-900)] [--line:var(--color-marigold)] md:px-8 md:py-9 ${enter ? styles.enter : ""} ${className}`}
    >
      <p className="mono-label flex items-center gap-2.5 text-[var(--stage-muted)]">
        <StatusDot tone="ok" />
        Received
      </p>
      <Heading className="mt-5 text-2xl font-normal">{title}</Heading>
      <p className="pretty mt-3 max-w-[48ch] text-base text-[var(--stage-muted)]">{body}</p>
    </div>
  );
}

export function Form({
  spec,
  outcome,
  statusByTarget = false,
  headingLevel = 3,
  className = "",
}: {
  spec: FormSpec;
  /** The outcome of a no-JavaScript post, read by the page from its URL. */
  outcome?: Outcome;
  /** For static pages: render every outcome panel, shown by :target. */
  statusByTarget?: boolean;
  /** The level of the success panel's heading. */
  headingLevel?: Level;
  className?: string;
}) {
  const base = `form-${spec.id}`;
  const order = useMemo(() => spec.fields.map((f) => f.name), [spec]);
  const labels = useMemo(() => Object.fromEntries(spec.fields.map((f) => [f.name, f.label])), [spec]);
  const half = useMemo(() => spans(spec.fields), [spec]);

  const validate = useCallback(
    (values: Values): Errors => {
      const parsed = schemaFor(spec).safeParse(values);
      return parsed.success ? {} : toFieldErrors(parsed.error, fallbacksFor(spec));
    },
    [spec],
  );

  const initialErrors = useMemo(() => {
    if (outcome?.status !== "error" || outcome.reason !== "invalid") return undefined;
    return Object.fromEntries((outcome.fields ?? []).map((f) => [f, NO_JS_FIELD]));
  }, [outcome]);

  const { formRef, status, errors, failure, attempt, onSubmit, onBlur, onChange } = useSubmission({
    endpoint: `/api/forms/${spec.id}`,
    order,
    validate,
    initialErrors,
  });

  const sending = status === "sending";

  if (status === "done" || outcome?.status === "received") {
    return (
      <div className={className}>
        <ReceivedPanel
          id={outcome?.status === "received" ? outcomeAnchor(spec.id, outcome) : undefined}
          title={spec.success.title}
          body={spec.success.body}
          focus={status === "done"}
          enter={status === "done"}
          headingLevel={headingLevel}
        />
      </div>
    );
  }

  const serverError = outcome?.status === "error" && attempt === 0 ? outcome : undefined;

  return (
    <div className={className}>
      {statusByTarget && <TargetPanels spec={spec} headingLevel={headingLevel} />}

      <form
        ref={formRef}
        action={`/api/forms/${spec.id}`}
        method="post"
        onSubmit={onSubmit}
        onBlur={onBlur}
        onChange={onChange}
        aria-busy={sending || undefined}
        className="relative"
      >
        {serverError && (
          <FailurePanel
            id={outcomeAnchor(spec.id, serverError)}
            failure={REASON_COPY[serverError.reason]}
            email={serverError.reason !== "invalid"}
            live={false}
          />
        )}
        {failure && <FailurePanel key={`f${attempt}`} failure={failure} />}
        {attempt > 0 && (
          <ErrorSummary key={`e${attempt}`} base={base} errors={errors} order={order} labels={labels} />
        )}

        <Honeypot base={base} />

        <div className="grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2">
          {spec.fields.map((f, i) => (
            <div key={f.name} className={half[i] ? "" : "sm:col-span-2"}>
              <SpecField base={base} field={f} error={errors[f.name]} />
            </div>
          ))}
        </div>

        <div className="mt-11 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Button type="submit" size="lg" aria-disabled={sending || undefined}>
            {sending ? (
              <span className="inline-flex items-center gap-2.5">
                <Spinner />
                Sending
              </span>
            ) : (
              spec.submit
            )}
          </Button>
          <p role="status" className="sr-only">
            {sending ? "Sending." : ""}
          </p>
        </div>
      </form>
    </div>
  );
}

type ChoiceSpec = Extract<FieldSpec, { options: string[] }>;
const isChoice = (f: FieldSpec): f is ChoiceSpec => f.kind === "choice" || f.kind === "multi";

function SpecField({ base, field: f, error }: { base: string; field: FieldSpec; error?: string }) {
  if (isChoice(f)) {
    const short = f.options.every((o) => o.length <= 3);
    return (
      <ChoiceField
        base={base}
        name={f.name}
        label={f.label}
        options={f.options.map((o) => ({ value: o, label: o }))}
        multiple={f.kind === "multi"}
        required={f.required}
        help={f.help}
        error={error}
        layout={short ? "row" : "wrap"}
      />
    );
  }
  if (f.kind === "textarea") {
    return (
      <TextAreaField
        base={base}
        name={f.name}
        label={f.label}
        required={f.required}
        max={f.max}
        help={f.help}
        error={error}
      />
    );
  }
  return (
    <TextField
      base={base}
      name={f.name}
      label={f.label}
      type={f.kind}
      required={f.required}
      max={f.max}
      autoComplete={f.autoComplete}
      help={f.help}
      error={error}
    />
  );
}

const REASONS: Reason[] = ["invalid", "rate", "unavailable", "failed"];

/** Every outcome, hidden until the URL fragment names it. */
function TargetPanels({ spec, headingLevel }: { spec: FormSpec; headingLevel: Level }) {
  return (
    <>
      <div id={outcomeAnchor(spec.id, { status: "received" })} className={`${styles.targetOnly} mb-10 scroll-mt-28`}>
        <ReceivedPanel title={spec.success.title} body={spec.success.body} headingLevel={headingLevel} />
      </div>
      {REASONS.map((reason) => (
        <FailurePanel
          key={reason}
          id={outcomeAnchor(spec.id, { status: "error", reason })}
          failure={REASON_COPY[reason]}
          email={reason !== "invalid"}
          live={false}
          className={styles.targetOnly}
        />
      ))}
    </>
  );
}
