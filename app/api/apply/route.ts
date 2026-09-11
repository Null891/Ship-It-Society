import { applicationRows, applicationSchema, toFieldErrors, type Application } from "@/lib/apply";
import {
  handleSubmission,
  methodNotAllowed,
  preflight,
  type FormDefinition,
} from "@/lib/forms/server";

/* ==========================================================================
   POST /api/apply — the membership application.

   The same pipeline as every other form (lib/forms/server.ts): same-origin,
   content type, size cap, rate limit, validation, honeypot, delivery. Only
   the schema and the email rows are the application's own.
   ========================================================================== */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const application: FormDefinition<Application> = {
  id: "apply",
  label: "membership application",
  schema: applicationSchema,
  toErrors: toFieldErrors,
  rows: applicationRows,
  who: (app) => app.name,
  replyTo: (app) => app.email,
};

export function POST(req: Request) {
  return handleSubmission(req, application);
}

export function OPTIONS() {
  return preflight();
}

export const GET = methodNotAllowed;
export const HEAD = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
