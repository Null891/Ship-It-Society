import { Resend } from "resend";
import { EXPERIENCE, type Application } from "@/lib/apply";

/* ==========================================================================
   Delivery. Server only — never import this from a client component.

   Two independent sinks: an email so an officer knows immediately, and a
   spreadsheet row so the board has a reviewable record. They are attempted
   together and reported separately, so one being misconfigured never costs
   you an application.
   ========================================================================== */

export type DeliveryResult = {
  email: "sent" | "skipped" | "failed";
  sheet: "sent" | "skipped" | "failed";
};

const experienceLabel = (v: Application["experience"]) =>
  EXPERIENCE.find((e) => e.value === v)?.label ?? v;

function plainText(app: Application) {
  return [
    `Name:       ${app.name}`,
    `Email:      ${app.email}`,
    `Grade:      ${app.grade}`,
    `Experience: ${experienceLabel(app.experience)}`,
    "",
    "Why they want to join",
    "---------------------",
    app.why,
    ...(app.idea
      ? ["", "Something they want to build", "---------------------", app.idea]
      : []),
    "",
    `Received ${new Date().toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
    })} PT`,
  ].join("\n");
}

async function sendEmail(app: Application): Promise<"sent" | "skipped"> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.APPLY_TO_EMAIL;
  if (!key || !to) return "skipped";

  const resend = new Resend(key);
  const { error } = await resend.emails.send({
    // Resend's shared sender works with no domain set up. Swap it for an
    // address on your own domain once you have one verified.
    from: process.env.APPLY_FROM_EMAIL ?? "Ship It Society <onboarding@resend.dev>",
    to: to.split(",").map((s) => s.trim()),
    replyTo: app.email,
    subject: `New application — ${app.name} (grade ${app.grade})`,
    text: plainText(app),
  });

  if (error) throw new Error(error.message);
  return "sent";
}

async function appendToSheet(app: Application): Promise<"sent" | "skipped"> {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  if (!url) return "skipped";

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      receivedAt: new Date().toISOString(),
      name: app.name,
      email: app.email,
      grade: app.grade,
      experience: experienceLabel(app.experience),
      why: app.why,
      idea: app.idea ?? "",
      secret: process.env.GOOGLE_SHEETS_SECRET ?? "",
    }),
    // Apps Script is slow to cold start; do not hang the request forever.
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`Sheets webhook returned ${res.status}`);
  return "sent";
}

/**
 * Attempt both sinks. Resolves as long as at least one succeeded or was
 * deliberately skipped; throws only when everything configured has failed.
 */
export async function deliver(app: Application): Promise<DeliveryResult> {
  const [email, sheet] = await Promise.allSettled([
    sendEmail(app),
    appendToSheet(app),
  ]);

  const result: DeliveryResult = {
    email: email.status === "fulfilled" ? email.value : "failed",
    sheet: sheet.status === "fulfilled" ? sheet.value : "failed",
  };

  if (email.status === "rejected") {
    console.error("[apply] email delivery failed:", email.reason);
  }
  if (sheet.status === "rejected") {
    console.error("[apply] sheet delivery failed:", sheet.reason);
  }

  const anyConfigured = result.email !== "skipped" || result.sheet !== "skipped";
  const anySucceeded = result.email === "sent" || result.sheet === "sent";

  // Nothing configured at all: accept in development so the form is testable,
  // but make the gap loud in the log rather than silently dropping people.
  if (!anyConfigured) {
    console.warn(
      `[apply] No delivery configured. Application from ${app.email} was NOT stored.\n` +
        "Set RESEND_API_KEY + APPLY_TO_EMAIL and/or GOOGLE_SHEETS_WEBHOOK_URL. See SETUP.md.",
    );
    return result;
  }

  if (!anySucceeded) throw new Error("All configured delivery methods failed");
  return result;
}

/* --- Rate limiting --------------------------------------------------------
   Best effort. Serverless instances do not share memory, so this throttles a
   naive flood rather than a determined attacker; the honeypot and the schema
   do the rest. Good enough for a club application form.
   ------------------------------------------------------------------------- */

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 4;
const hits = new Map<string, number[]>();

export function rateLimit(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }

  return recent.length <= MAX_PER_WINDOW;
}
