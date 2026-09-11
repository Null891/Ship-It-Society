import { forms, type FormId } from "@/content/forms";
import {
  handleSubmission,
  methodNotAllowed,
  preflight,
  specDefinition,
  unknownForm,
} from "@/lib/forms/server";

/* ==========================================================================
   POST /api/forms/<id> — the built-in forms that replaced the club's Google
   Forms: interest, speaker, question, gift.

   Each form's schema, limits and email labels come from its spec in
   content/forms.ts, so there is nothing per-form to maintain here. An id
   that is not in that file is a 404 whatever the method.
   ========================================================================== */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ form: string }> };

async function specFor(ctx: Ctx) {
  const { form } = await ctx.params;
  return Object.hasOwn(forms, form) ? forms[form as FormId] : null;
}

export async function POST(req: Request, ctx: Ctx) {
  const spec = await specFor(ctx);
  if (!spec) return unknownForm();
  return handleSubmission(req, specDefinition(spec));
}

export async function OPTIONS(_req: Request, ctx: Ctx) {
  return (await specFor(ctx)) ? preflight() : unknownForm();
}

async function refuse(req: Request, ctx: Ctx) {
  return (await specFor(ctx)) ? methodNotAllowed(req) : unknownForm();
}

export const GET = refuse;
export const HEAD = refuse;
export const PUT = refuse;
export const PATCH = refuse;
export const DELETE = refuse;
