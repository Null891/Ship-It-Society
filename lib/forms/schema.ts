import { z } from "./zod";
import type { FieldSpec, FormSpec } from "@/content/forms";

/* ==========================================================================
   Schemas built from content/forms.ts.

   One builder, used by the form in the browser and by the route handler,
   so a limit changed in the content file changes both. Every message is a
   sentence written for a person; Zod's own wording never reaches the page
   (see toFieldErrors below for the guarantee).
   ========================================================================== */

export type FieldErrors = Record<string, string>;
export type FormValues = Record<string, string | string[] | undefined>;

/* --- Normalisers ----------------------------------------------------------
   Run before validation, so the limits are measured on what is stored.
   A form posted without JavaScript sends newlines as CRLF; the browser's
   own maxlength counts each as one character, so the server must too.
   ------------------------------------------------------------------------- */

/** Single-line fields: no control characters (they end up in an email subject). */
export const oneLine = (s: string) => s.replace(/[\u0000-\u001f\u007f]+/g, " ");

/** Multi-line fields: LF newlines, tabs kept, other control characters dropped. */
export const multiLine = (s: string) =>
  s.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");

/** A form field's raw value as one string: first of a repeated key, "" if absent. */
export function scalar(normalise: (s: string) => string) {
  return (v: unknown) => {
    const x = Array.isArray(v) ? v[0] : v;
    if (x === undefined || x === null) return "";
    return typeof x === "string" ? normalise(x) : x;
  };
}

/** A checkbox group's raw value as a de-duplicated list of strings. */
function list(v: unknown) {
  if (v === undefined || v === null || v === "" || v === false) return [];
  const arr = Array.isArray(v) ? v : [v];
  return [...new Set(arr.filter((x): x is string => typeof x === "string"))];
}

/** A bare "mysite.org" is what people type. Give it a scheme before checking. */
function withScheme(v: unknown) {
  const s = scalar(oneLine)(v);
  if (typeof s !== "string") return s;
  const t = s.trim();
  return t && !/^[a-z][a-z0-9+.-]*:/i.test(t) ? `https://${t}` : t;
}

export const tooLong = (max: number) => `Keep it under ${max} characters.`;
const EMAIL_MESSAGE = "That email address does not look complete.";
const URL_MESSAGE = "That link does not look complete. Try the full address.";

/** The message for a required field left empty. */
export const requiredMessage = (f: FieldSpec) => f.error ?? `Please answer “${f.label}”.`;

function fieldSchema(f: FieldSpec) {
  const required = requiredMessage(f);

  if (f.kind === "choice" || f.kind === "multi") {
    const options = f.options as [string, ...string[]];
    if (f.kind === "choice") {
      const choice = z.enum(options, required);
      return f.required
        ? z.preprocess(scalar(oneLine), choice)
        : z.preprocess((v) => scalar(oneLine)(v) || undefined, choice.optional());
    }
    const picks = z
      .array(z.enum(options, "Pick from the options shown."), { error: required })
      .max(options.length, "Pick from the options shown.");
    return z.preprocess(list, f.required ? picks.min(1, required) : picks);
  }

  const normalise = f.kind === "textarea" ? multiLine : oneLine;
  // Every non-choice field carries a max; the union just cannot prove it here.
  const max = "max" in f ? f.max : 0;
  const base = z.string({ error: required }).trim().max(max, tooLong(max));

  if (f.kind === "email") {
    return z.preprocess(
      scalar(normalise),
      f.required
        ? base.min(1, required).pipe(z.email(EMAIL_MESSAGE))
        : base.pipe(z.union([z.literal(""), z.email(EMAIL_MESSAGE)])),
    );
  }

  if (f.kind === "url") {
    return z.preprocess(
      withScheme,
      f.required
        ? base.min(1, required).pipe(z.httpUrl(URL_MESSAGE))
        : base.pipe(z.union([z.literal(""), z.httpUrl(URL_MESSAGE)])),
    );
  }

  return z.preprocess(scalar(normalise), f.required ? base.min(1, required) : base);
}

export type FormSchema = z.ZodObject<Record<string, z.ZodType>>;

const cache = new WeakMap<FormSpec, FormSchema>();

/** The schema for a form spec. Built once per spec and reused. */
export function schemaFor(spec: FormSpec): FormSchema {
  let schema = cache.get(spec);
  if (!schema) {
    schema = z.object(Object.fromEntries(spec.fields.map((f) => [f.name, fieldSchema(f)])));
    cache.set(spec, schema);
  }
  return schema;
}

/* --- Errors ---------------------------------------------------------------- */

/* Anything that reads like library output rather than something we wrote.
   Zod's defaults all take one of these shapes. */
const LOOKS_INTERNAL = /^Invalid (input|option|string|email|url)|^Expected |received |^Too (small|big)|ZodError/i;

/**
 * Field-keyed errors, the shape the form renders directly: one message per
 * field, the first that applies. `fallback` supplies the sentence to use if
 * a library message ever slips through, so none can reach a person.
 */
export function toFieldErrors(error: z.ZodError, fallback: Record<string, string>): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.length ? String(issue.path[0]) : "";
    if (!key || out[key]) continue;
    out[key] = LOOKS_INTERNAL.test(issue.message)
      ? (fallback[key] ?? "Please check this answer.")
      : issue.message;
  }
  return out;
}

/** Fallback sentences for a spec, keyed by field name. */
export function fallbacksFor(spec: FormSpec): Record<string, string> {
  return Object.fromEntries(spec.fields.map((f) => [f.name, requiredMessage(f)]));
}
