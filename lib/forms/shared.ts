import type { FormId } from "@/content/forms";

/* ==========================================================================
   Form plumbing shared by the browser and the server.

   Nothing here touches the network or the environment, so both the form
   components and the route handlers import it — which is how the status a
   route redirects to and the status a page renders stay the same words.
   ========================================================================== */

/** Every form the site accepts: the four built from content/forms.ts, plus
 *  the membership application, which has its own schema in lib/apply.ts. */
export type AnyFormId = FormId | "apply";

/* --- Honeypot ------------------------------------------------------------
   A field no person ever sees and a naive bot fills in.

   The name is deliberately meaningless. It used to be `company`, and a
   browser's autofill recognised that and filled it with the student's
   school — which the old schema then rejected ("Leave this field empty"),
   blocking a real application behind an error nobody could see. Autofill
   classifies fields by name, id and label; nothing here resembles a
   name, organisation, email, address, phone or URL, so it is left alone.
   A filled trap is answered with the normal success response and dropped,
   so a bot learns nothing.
   ------------------------------------------------------------------------ */
export const HONEYPOT = "sis_hp";

/** Largest request body any form endpoint reads. Every form's own limits
 *  add up to well under this, so only a tampered request ever reaches it. */
export const MAX_BODY_BYTES = 16 * 1024;

/* --- No-JavaScript round trip -------------------------------------------- */

export type Reason = "invalid" | "rate" | "unavailable" | "failed";
const REASONS: readonly Reason[] = ["invalid", "rate", "unavailable", "failed"];

export type Outcome =
  | { status: "received" }
  | { status: "error"; reason: Reason; fields?: string[] };

/**
 * The page each form lives on. A form posted without JavaScript is sent
 * back here with a status. These are fixed paths — the redirect target is
 * never read from the request, so the endpoint cannot be used as an open
 * redirect.
 */
export const FORM_HOME: Record<AnyFormId, string> = {
  apply: "/join",
  interest: "/get-involved",
  speaker: "/get-involved",
  gift: "/get-involved",
  question: "/",
};

/** The element id a status panel carries, so the redirect lands on it. */
export function outcomeAnchor(id: AnyFormId, outcome: Outcome): string {
  return outcome.status === "received"
    ? `${id}-received`
    : `${id}-error-${outcome.reason}`;
}

/**
 * Where a no-JavaScript submission is redirected. Only the form id, the
 * outcome, and — for invalid answers — the NAMES of the fields to check.
 * Never a value: nothing a person typed ever appears in a URL.
 */
export function outcomeHref(id: AnyFormId, outcome: Outcome): string {
  const q = new URLSearchParams({ form: id, status: outcome.status });
  if (outcome.status === "error") {
    q.set("reason", outcome.reason);
    if (outcome.fields?.length) q.set("fields", outcome.fields.join(","));
  }
  return `${FORM_HOME[id]}?${q.toString()}#${outcomeAnchor(id, outcome)}`;
}

type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/**
 * Read a page's search params back into an outcome for one form. Anything
 * unrecognised is ignored, and field names are kept only if the form really
 * has them, so a hand-edited URL cannot put arbitrary text on the page.
 */
export function readOutcome(
  params: SearchParams,
  id: AnyFormId,
  knownFields: readonly string[],
): Outcome | undefined {
  if (first(params.form) !== id) return undefined;
  const status = first(params.status);
  if (status === "received") return { status: "received" };
  if (status !== "error") return undefined;
  const reason = first(params.reason) as Reason | undefined;
  if (!reason || !REASONS.includes(reason)) return undefined;
  const fields = (first(params.fields) ?? "")
    .split(",")
    .filter((f) => knownFields.includes(f));
  return { status: "error", reason, fields };
}

/* --- Words ----------------------------------------------------------------
   One set of sentences for every failure, used by the JSON responses, the
   no-JavaScript status panels and the in-page failure panel alike.
   ------------------------------------------------------------------------- */

export const REASON_COPY: Record<Reason, { title: string; body: string }> = {
  invalid: {
    title: "Some answers need another look.",
    body: "Nothing was sent. Check the answers below and send it again.",
  },
  rate: {
    title: "Too many submissions from your network just now.",
    body: "Nothing was sent. Wait a minute, then send it again.",
  },
  unavailable: {
    title: "This form is not taking submissions right now.",
    body: "Nothing was sent. Email the officers instead and they will pick it up.",
  },
  failed: {
    title: "We could not record that.",
    body: "Nothing was sent. Try again in a moment, or email the officers directly.",
  },
};

/** The JSON body every form endpoint answers with. */
export type ApiResult =
  | { ok: true }
  | { ok: false; message: string; reason?: Reason; fields?: Record<string, string> };
