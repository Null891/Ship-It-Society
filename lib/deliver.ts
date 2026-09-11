import "server-only";
import { Resend } from "resend";

/* ==========================================================================
   Delivery. Server only — never import this from a client component.

   Every form on the site (the application, and the four built-in forms that
   replaced the club's Google Forms) lands in the same two places:

     email   Resend -> APPLY_TO_EMAIL, so an officer knows immediately
     sheet   the club's Google Sheet via its Apps Script web app, so the
             board has a reviewable record

   Both are attempted together and judged separately, so one misconfigured
   channel never costs a submission. The response to the visitor never says
   which channels exist or which of them worked.

   Environment (names are a contract with SETUP.md — do not rename):
     RESEND_API_KEY, APPLY_TO_EMAIL, APPLY_FROM_EMAIL,
     GOOGLE_SHEETS_WEBHOOK_URL, GOOGLE_SHEETS_SECRET
   ========================================================================== */

/** One labelled answer. `long` answers print as a block in the email. */
export type Row = { key: string; label: string; value: string | string[] | undefined; long?: boolean };

export type Submission = {
  /** Form id, sent to the sheet so the Apps Script can route it. */
  form: string;
  /** What it is called in the inbox: "New <label> — <name>". */
  label: string;
  /** Name if given, else email — the second half of the subject. */
  who: string;
  /** Where "Reply" in the officer's mail client goes. */
  replyTo?: string;
  rows: Row[];
};

export type DeliveryOutcome =
  /** At least one configured channel took it. */
  | "delivered"
  /** Channels are configured and every one of them failed. */
  | "failed"
  /** Production, and nothing is configured to receive it. */
  | "unavailable"
  /** Development or preview with nothing configured: accepted, not stored. */
  | "unstored";

const flat = (v: Row["value"]) => (Array.isArray(v) ? v.join(", ") : (v ?? ""));

/** Strip anything that could end a header line. Resend takes JSON, but a
 *  name with a newline in it has no business in a subject either way. */
const headerSafe = (s: string) => s.replace(/[\r\n\u0000-\u001f\u007f]+/g, " ").trim();

function plainText(sub: Submission, receivedAt: Date) {
  const short = sub.rows.filter((r) => !r.long);
  const long = sub.rows.filter((r) => r.long);
  const pad = Math.max(...short.map((r) => r.label.length), 0) + 2;
  const title = `New ${sub.label}`;
  return [
    title,
    "=".repeat(title.length),
    "",
    ...short.map((r) => `${`${r.label}:`.padEnd(pad)}${flat(r.value) || "—"}`),
    ...long.flatMap((r) => ["", r.label, "-".repeat(r.label.length), flat(r.value) || "—"]),
    "",
    `Received ${receivedAt.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      dateStyle: "medium",
      timeStyle: "short",
    })} Pacific.`,
  ].join("\n");
}

function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.APPLY_TO_EMAIL);
}

function sheetConfigured() {
  return Boolean(process.env.GOOGLE_SHEETS_WEBHOOK_URL);
}

async function sendEmail(sub: Submission, receivedAt: Date): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    // Resend's shared sender works with no domain set up. Swap it for an
    // address on your own domain once you have one verified.
    from: process.env.APPLY_FROM_EMAIL || "Ship It Society <onboarding@resend.dev>",
    to: (process.env.APPLY_TO_EMAIL ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    ...(sub.replyTo ? { replyTo: sub.replyTo } : {}),
    subject: headerSafe(`New ${sub.label} — ${sub.who}`),
    text: plainText(sub, receivedAt),
  });
  if (error) throw new Error(`Resend: ${error.message}`);
}

async function appendToSheet(sub: Submission, receivedAt: Date): Promise<void> {
  const secret = process.env.GOOGLE_SHEETS_SECRET ?? "";
  if (!secret) {
    console.warn("[forms] GOOGLE_SHEETS_SECRET is not set; the sheet will refuse this row if its script expects one.");
  }
  const res = await fetch(process.env.GOOGLE_SHEETS_WEBHOOK_URL as string, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret,
      form: sub.form,
      submittedAt: receivedAt.toISOString(),
      fields: Object.fromEntries(sub.rows.map((r) => [r.key, flat(r.value)])),
    }),
    // Apps Script is slow to cold start; do not hang the request forever.
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  /* A wrong secret still comes back 200 — the script answers "forbidden"
     in the body. Only the literal "ok" counts as stored. */
  const body = (await res.text()).trim();
  if (!res.ok || body !== "ok") {
    throw new Error(`Sheets webhook answered ${res.status} "${body.slice(0, 40)}"`);
  }
}

/** Production means the real site: Vercel's production environment, or a
 *  plain `next start` anywhere else. Preview deployments are not. */
function isProduction() {
  const vercel = process.env.VERCEL_ENV;
  return vercel ? vercel === "production" : process.env.NODE_ENV === "production";
}

/**
 * Deliver a validated submission to every configured channel.
 * Never throws; the route turns the outcome into a status code.
 */
export async function deliver(sub: Submission): Promise<DeliveryOutcome> {
  const receivedAt = new Date();
  const channels: { name: string; run: () => Promise<void> }[] = [];
  if (emailConfigured()) channels.push({ name: "email", run: () => sendEmail(sub, receivedAt) });
  if (sheetConfigured()) channels.push({ name: "sheet", run: () => appendToSheet(sub, receivedAt) });

  if (channels.length === 0) {
    if (isProduction()) {
      console.error(
        `[forms] NO DELIVERY CONFIGURED IN PRODUCTION. A ${sub.label} was refused with 503 ` +
          "because there is nowhere to send it. Set RESEND_API_KEY + APPLY_TO_EMAIL and/or " +
          "GOOGLE_SHEETS_WEBHOOK_URL + GOOGLE_SHEETS_SECRET. See SETUP.md.",
      );
      return "unavailable";
    }
    console.warn(
      `[forms] No delivery configured. A ${sub.label} was accepted but NOT stored ` +
        "(development/preview only — production refuses it). See SETUP.md.",
    );
    return "unstored";
  }

  const results = await Promise.allSettled(channels.map((c) => c.run()));
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[forms] ${channels[i].name} delivery failed for a ${sub.label}:`, r.reason);
    }
  });

  return results.some((r) => r.status === "fulfilled") ? "delivered" : "failed";
}
