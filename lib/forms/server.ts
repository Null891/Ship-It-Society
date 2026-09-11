import "server-only";
import { club } from "@/content/club";
import type { FormSpec } from "@/content/forms";
import { deliver, type Row } from "@/lib/deliver";
import { fallbacksFor, schemaFor, toFieldErrors, type FieldErrors } from "./schema";
import { clientIp, rateLimit } from "./rate-limit";
import {
  HONEYPOT,
  MAX_BODY_BYTES,
  REASON_COPY,
  outcomeHref,
  type AnyFormId,
  type ApiResult,
  type Reason,
} from "./shared";
import type { z } from "./zod";

/* ==========================================================================
   The request pipeline every form endpoint runs, in this order:

     method -> same-origin -> content type -> size -> rate limit
            -> parse -> validate -> honeypot -> deliver

   Cheap refusals first. The limiter sits before the body is read, because
   the cheapest request to send is one that fails later — an audit once
   caught twelve malformed requests in a row and not one 429, when the
   limiter sat below parsing.

   Two response styles, chosen by the request's content type:
     application/json                   fetch from the page: JSON + status
     application/x-www-form-urlencoded  a plain form post, no JavaScript:
                                        303 back to the form's own page

   Every error body is a sentence a person can act on. None of them says
   which delivery channels exist or which of them worked.
   ========================================================================== */

export type FormDefinition<T> = {
  id: AnyFormId;
  /** What it is called in the inbox. */
  label: string;
  schema: z.ZodType<T>;
  toErrors: (error: z.ZodError) => FieldErrors;
  rows: (data: T) => Row[];
  /** Name if given, else email. */
  who: (data: T) => string;
  replyTo: (data: T) => string | undefined;
};

const ALLOW = "POST, OPTIONS";
const NO_STORE = { "Cache-Control": "no-store" };

type Kind = "json" | "form";

function json(body: ApiResult, status: number, headers?: Record<string, string>) {
  return Response.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

/* --- Refusals that never redirect ------------------------------------------
   These are not our own forms misbehaving, so there is no page to send
   anyone back to. They answer plainly.
   ------------------------------------------------------------------------- */

export function methodNotAllowed(req?: Request) {
  if (req?.method === "HEAD") {
    return new Response(null, { status: 405, headers: { Allow: ALLOW, ...NO_STORE } });
  }
  return json({ ok: false, message: "This address only accepts form submissions." }, 405, {
    Allow: ALLOW,
  });
}

export function preflight() {
  return new Response(null, { status: 204, headers: { Allow: ALLOW, ...NO_STORE } });
}

export function unknownForm() {
  return json({ ok: false, message: "There is no form at this address." }, 404);
}

/* --- Checks ---------------------------------------------------------------- */

/**
 * Browsers say where a request came from, and cannot be made to lie about
 * it. Refuse anything a browser marks as cross-site, and any Origin whose
 * host is not this one. A request with neither header (curl, a server) is
 * let through — it is not a browser riding on a visitor's session, and
 * the remaining checks apply to it all the same.
 */
function isSameOrigin(req: Request): boolean {
  const site = req.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return false;

  const origin = req.headers.get("origin");
  if (!origin) return true;
  let from: string;
  try {
    from = new URL(origin).host.toLowerCase(); // "null" throws, and is refused
  } catch {
    return false;
  }
  const hosts = [req.headers.get("x-forwarded-host")?.split(",")[0], req.headers.get("host")]
    .filter((h): h is string => !!h)
    .map((h) => h.trim().toLowerCase());
  return hosts.includes(from);
}

function kindOf(req: Request): Kind | null {
  const type = (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (type === "application/json") return "json";
  if (type === "application/x-www-form-urlencoded") return "form";
  return null;
}

function declaredTooLarge(req: Request): boolean {
  const declared = Number(req.headers.get("content-length"));
  return Number.isFinite(declared) && declared > MAX_BODY_BYTES;
}

/** Read the body, stopping the moment it passes the cap — a missing or
 *  false Content-Length does not get a larger body read into memory. */
async function readCapped(req: Request): Promise<string | null> {
  if (!req.body) return "";
  const reader = req.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BODY_BYTES) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

function parse(text: string, kind: Kind): Record<string, unknown> | null {
  if (kind === "json") {
    try {
      const value: unknown = JSON.parse(text);
      return isPlainObject(value) ? value : null;
    } catch {
      return null;
    }
  }
  // Repeated keys (a checkbox group) collect into a list. Built through a
  // Map so a key named "__proto__" stays an ordinary own property.
  const map = new Map<string, string | string[]>();
  for (const [key, value] of new URLSearchParams(text)) {
    const prev = map.get(key);
    map.set(key, prev === undefined ? value : Array.isArray(prev) ? [...prev, value] : [prev, value]);
  }
  return Object.fromEntries(map);
}

function trapFilled(v: unknown): boolean {
  if (v === undefined || v === null) return false;
  if (typeof v === "string") return v.trim() !== "";
  return true;
}

/* --- Answers ---------------------------------------------------------------- */

const MESSAGE: Record<Reason, string> = {
  invalid: REASON_COPY.invalid.title,
  rate: "Too many submissions from your network just now. Wait a minute and try again.",
  unavailable: `This form is not taking submissions right now. Email the officers at ${club.email} instead.`,
  failed: `We could not record that. Try again in a moment, or email the officers at ${club.email}.`,
};

function responder(id: AnyFormId, kind: Kind) {
  const back = (href: string, headers?: Record<string, string>) =>
    new Response(null, { status: 303, headers: { Location: href, ...NO_STORE, ...headers } });

  return {
    received: () =>
      kind === "json" ? json({ ok: true }, 200) : back(outcomeHref(id, { status: "received" })),

    invalid: (fields: FieldErrors) =>
      kind === "json"
        ? json({ ok: false, reason: "invalid", message: MESSAGE.invalid, fields }, 400)
        : back(outcomeHref(id, { status: "error", reason: "invalid", fields: Object.keys(fields) })),

    error: (reason: Exclude<Reason, "invalid">, status: number, headers?: Record<string, string>) =>
      kind === "json"
        ? json({ ok: false, reason, message: MESSAGE[reason] }, status, headers)
        : back(outcomeHref(id, { status: "error", reason }), headers),

    tooLarge: () =>
      kind === "json"
        ? json(
            { ok: false, reason: "invalid", message: "That is more than this form accepts. Shorten your answers and try again." },
            413,
          )
        : back(outcomeHref(id, { status: "error", reason: "invalid" })),

    unreadable: () =>
      kind === "json"
        ? json({ ok: false, reason: "invalid", message: "That request could not be read." }, 400)
        : back(outcomeHref(id, { status: "error", reason: "invalid" })),
  };
}

/* --- The pipeline ------------------------------------------------------------ */

export async function handleSubmission<T>(req: Request, def: FormDefinition<T>): Promise<Response> {
  // 1. Method. The routes export POST for this and methodNotAllowed for the
  //    rest; this is the backstop if one is ever wired up wrongly.
  if (req.method !== "POST") return methodNotAllowed(req);

  // 2. Same origin.
  if (!isSameOrigin(req)) {
    return json({ ok: false, message: "This form only accepts submissions from this site." }, 403);
  }

  // 3. Content type.
  const kind = kindOf(req);
  if (!kind) {
    return json({ ok: false, message: "This form accepts a form post or JSON, nothing else." }, 415);
  }
  const reply = responder(def.id, kind);

  // 4. Size, as declared. The actual bytes are capped again as they are read.
  if (declaredTooLarge(req)) return reply.tooLarge();

  // 5. Rate limit.
  const rate = rateLimit(clientIp(req));
  if (!rate.ok) return reply.error("rate", 429, { "Retry-After": String(rate.retryAfter) });

  // 6. Parse.
  const text = await readCapped(req);
  if (text === null) return reply.tooLarge();
  const raw = parse(text, kind);
  if (!raw) return reply.unreadable();

  // The trap is lifted out before validation, so it can never show up as a
  // field error — it is not part of any schema.
  const trap = raw[HONEYPOT];
  delete raw[HONEYPOT];

  // 7. Validate.
  const parsed = def.schema.safeParse(raw);
  if (!parsed.success) return reply.invalid(def.toErrors(parsed.error));

  // 8. Honeypot: the same success a person gets, and nothing delivered.
  if (trapFilled(trap)) return reply.received();

  // 9. Deliver.
  const data = parsed.data;
  const outcome = await deliver({
    form: def.id,
    label: def.label,
    who: def.who(data),
    replyTo: def.replyTo(data),
    rows: def.rows(data),
  });
  if (outcome === "unavailable") return reply.error("unavailable", 503);
  if (outcome === "failed") return reply.error("failed", 502);
  return reply.received();
}

/* --- Definitions for the specs in content/forms.ts ---------------------------- */

type SpecValues = Record<string, string | string[] | undefined>;

const str = (v: unknown) => (typeof v === "string" ? v : "");

export function specDefinition(spec: FormSpec): FormDefinition<SpecValues> {
  const fallback = fallbacksFor(spec);
  return {
    id: spec.id,
    label: spec.label,
    schema: schemaFor(spec) as unknown as z.ZodType<SpecValues>,
    toErrors: (error) => toFieldErrors(error, fallback),
    rows: (data) =>
      spec.fields.map((f) => ({
        key: f.name,
        label: f.label,
        value: data[f.name],
        long: f.kind === "textarea",
      })),
    who: (data) => str(data.name) || str(data.email) || "no name given",
    replyTo: (data) => str(data.email) || undefined,
  };
}
