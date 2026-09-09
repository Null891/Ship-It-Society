import { z } from "zod";

/* ==========================================================================
   The application schema.

   Defined once and imported by both the form and the route handler, so
   client and server validation can never drift apart. Messages are written
   to be read by a student, not a developer.
   ========================================================================== */

export const GRADES = ["9", "10", "11", "12"] as const;

export const EXPERIENCE = [
  { value: "none", label: "None yet", hint: "Never written code" },
  { value: "some", label: "A little", hint: "A class, or a tutorial or two" },
  { value: "lots", label: "Comfortable", hint: "I have built things on my own" },
] as const;

/* The `error` argument on the type constructor matters as much as the one on
   .min(). Without it, a field that is missing entirely fails the TYPE check
   first and Zod's own wording escapes to the client — an audit caught
   "Invalid input: expected string, received undefined" being returned for a
   missing name. Every string below therefore carries a human message at both
   levels. */
export const applicationSchema = z.object({
  name: z
    .string({ error: "Please enter your name." })
    .trim()
    .min(2, "Please enter your name.")
    .max(80, "That name is too long."),
  email: z.email("Please enter an email we can reply to."),
  grade: z.enum(GRADES, "Pick your grade."),
  experience: z.enum(["none", "some", "lots"], "Pick one."),
  why: z
    .string({ error: "A sentence or two is enough — just not blank." })
    .trim()
    .min(20, "A sentence or two is enough — just not blank.")
    .max(1200, "Keep it under 1200 characters."),
  idea: z
    .string({ error: "Keep it under 600 characters." })
    .trim()
    .max(600, "Keep it under 600 characters.")
    .optional(),
  /** Honeypot. Real people never see this field, so it must stay empty. */
  company: z.string().max(0).optional(),
});

export type Application = z.infer<typeof applicationSchema>;

/** Field-keyed errors, the shape the form renders directly. */
export type FieldErrors = Partial<Record<keyof Application, string>>;

/** Last line of defence per field, if a message ever slips through unmapped. */
const FALLBACK: Record<string, string> = {
  name: "Please enter your name.",
  email: "Please enter an email we can reply to.",
  grade: "Pick your grade.",
  experience: "Pick one.",
  why: "A sentence or two is enough — just not blank.",
  idea: "Keep it under 600 characters.",
  company: "Leave this field empty.",
};

/* Anything that reads like library output rather than something we wrote.
   Zod's defaults all take this shape. */
const LOOKS_INTERNAL = /^Invalid input|^Expected |received |^Too (small|big):|ZodError/i;

export function toFieldErrors(error: z.ZodError<Application>): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof Application | undefined;
    if (!key || out[key]) continue;
    /* Never let Zod's own wording reach a student. The schema should already
       supply a human message for every case; this guarantees it even if
       someone adds a field later and forgets. */
    out[key] = LOOKS_INTERNAL.test(issue.message)
      ? (FALLBACK[key] ?? "Please check this field.")
      : issue.message;
  }
  return out;
}
