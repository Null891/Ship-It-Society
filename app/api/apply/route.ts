import { NextResponse } from "next/server";
import { applicationSchema, toFieldErrors } from "@/lib/apply";
import { deliver, rateLimit } from "@/lib/deliver";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  /* Rate limit FIRST, before parsing or validating.

     This used to sit below the schema check, which meant a malformed body
     returned 400 and never reached the limiter — so an attacker could hammer
     this endpoint indefinitely as long as the payload stayed invalid. An
     audit caught exactly that: twelve 400s in a row and not one 429. The
     limiter has to be the first thing that runs, because the cheapest
     request to send is the one that fails validation. */
  if (!rateLimit(clientIp(req))) {
    return NextResponse.json(
      { ok: false, message: "That is a lot of applications. Try again shortly." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "That request could not be read." },
      { status: 400 },
    );
  }

  const parsed = applicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: "Some fields need another look.",
        fields: toFieldErrors(parsed.error),
      },
      { status: 400 },
    );
  }

  // Honeypot: a real person never sees this field. Return success so a bot
  // gets no signal that it was caught.
  if (parsed.data.company) {
    return NextResponse.json({ ok: true });
  }

  try {
    const result = await deliver(parsed.data);
    return NextResponse.json({ ok: true, delivery: result });
  } catch (err) {
    console.error("[apply] delivery failed entirely:", err);
    return NextResponse.json(
      {
        ok: false,
        message:
          "We could not record that. Please email us directly and we will pick it up.",
      },
      { status: 502 },
    );
  }
}
