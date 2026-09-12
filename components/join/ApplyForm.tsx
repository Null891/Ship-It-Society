"use client";

import { useCallback, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  ChoiceField,
  ErrorSummary,
  FailurePanel,
  Honeypot,
  Spinner,
  TextAreaField,
  TextField,
} from "@/components/forms/Fields";
import { useSubmission, type Errors, type Values } from "@/components/forms/useSubmission";
import {
  APPLY_FIELDS,
  APPLY_ORDER,
  EXPERIENCE,
  GRADES,
  applicationSchema,
  isOptional,
  toFieldErrors,
} from "@/lib/apply";
import { REASON_COPY, outcomeAnchor, type Outcome } from "@/lib/forms/shared";
import { BoardingPass } from "./BoardingPass";

/* ==========================================================================
   The membership application.

   Validation runs against the same schema the route handler uses
   (lib/apply.ts). Errors are inline and specific — never a toast, which
   vanishes before a student has read it and is unreachable to a screen
   reader afterwards. The submit loop, the fields and the panels are the
   same ones every other form on the site uses (components/forms).

   A real <form method="post" action="/api/apply">: without JavaScript the
   browser posts it, the route redirects back to /join, and the page renders
   the outcome — the pass, or what went wrong — on the server.
   ========================================================================== */

const BASE = "apply";
const LABELS: Record<string, string> = Object.fromEntries(
  APPLY_ORDER.map((k) => [k, APPLY_FIELDS[k].label]),
);
const NO_JS_FIELD = "Check this answer, then send it again.";

/** The first word of the name as typed, for the pass. Held in this tab only. */
const firstName = (v: Values["name"]) =>
  (Array.isArray(v) ? v[0] : (v ?? "")).trim().split(/\s+/)[0]?.slice(0, 24) ?? "";

export function ApplyForm({ outcome }: { outcome?: Outcome }) {
  const [name, setName] = useState("");

  const validate = useCallback((values: Values): Errors => {
    const parsed = applicationSchema.safeParse(values);
    return parsed.success ? {} : (toFieldErrors(parsed.error) as Errors);
  }, []);

  const initialErrors = useMemo(() => {
    if (outcome?.status !== "error" || outcome.reason !== "invalid") return undefined;
    return Object.fromEntries((outcome.fields ?? []).map((f) => [f, NO_JS_FIELD]));
  }, [outcome]);

  const onSent = useCallback((values: Values) => setName(firstName(values.name)), []);

  const { formRef, status, errors, failure, attempt, onSubmit, onBlur, onChange } = useSubmission({
    endpoint: "/api/apply",
    order: APPLY_ORDER,
    validate,
    initialErrors,
    onSent,
  });

  if (status === "done") return <BoardingPass name={name || undefined} focus />;
  if (outcome?.status === "received") return <BoardingPass id={outcomeAnchor("apply", outcome)} />;

  const sending = status === "sending";
  const serverError = outcome?.status === "error" && attempt === 0 ? outcome : undefined;

  return (
    <form
      ref={formRef}
      action="/api/apply"
      method="post"
      onSubmit={onSubmit}
      onBlur={onBlur}
      onChange={onChange}
      aria-busy={sending || undefined}
      className="relative"
    >
      {serverError && (
        <FailurePanel
          id={outcomeAnchor("apply", serverError)}
          failure={REASON_COPY[serverError.reason]}
          email={serverError.reason !== "invalid"}
          live={false}
        />
      )}
      {failure && <FailurePanel key={`f${attempt}`} failure={failure} />}
      {attempt > 0 && (
        <ErrorSummary key={`e${attempt}`} base={BASE} errors={errors} order={APPLY_ORDER} labels={LABELS} />
      )}

      <Honeypot base={BASE} />

      <div className="grid grid-cols-1 gap-x-8 gap-y-9 sm:grid-cols-2">
        <TextField
          base={BASE}
          name="name"
          label={APPLY_FIELDS.name.label}
          required
          min={2}
          max={APPLY_FIELDS.name.max}
          autoComplete="name"
          error={errors.name}
        />
        <TextField
          base={BASE}
          name="email"
          type="email"
          label={APPLY_FIELDS.email.label}
          required
          max={APPLY_FIELDS.email.max}
          autoComplete="email"
          error={errors.email}
        />

        <div className="sm:col-span-2">
          <ChoiceField
            base={BASE}
            name="grade"
            label={APPLY_FIELDS.grade.label}
            options={GRADES.map((g) => ({ value: g, label: g }))}
            required
            layout="row"
            error={errors.grade}
          />
        </div>

        <div className="sm:col-span-2">
          <ChoiceField
            base={BASE}
            name="experience"
            label={APPLY_FIELDS.experience.label}
            options={EXPERIENCE}
            required
            layout="stack"
            error={errors.experience}
          />
        </div>

        <div className="sm:col-span-2">
          <TextAreaField
            base={BASE}
            name="why"
            label={APPLY_FIELDS.why.label}
            required
            min={APPLY_FIELDS.why.min}
            max={APPLY_FIELDS.why.max}
            rows={4}
            help="A sentence or two is plenty."
            error={errors.why}
          />
        </div>

        <div className="sm:col-span-2">
          <TextAreaField
            base={BASE}
            name="idea"
            label={APPLY_FIELDS.idea.label}
            required={!isOptional("idea")}
            max={APPLY_FIELDS.idea.max}
            rows={3}
            help="Anything. It does not have to be good yet."
            error={errors.idea}
          />
        </div>
      </div>

      <div className="mt-11 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Button type="submit" size="lg" arrow={!sending} aria-disabled={sending || undefined}>
          {sending ? (
            <span className="inline-flex items-center gap-2.5">
              <Spinner />
              Sending
            </span>
          ) : (
            "Send application"
          )}
        </Button>
        <p role="status" className="sr-only">
          {sending ? "Sending your application." : ""}
        </p>
      </div>
    </form>
  );
}
