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

export const applicationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(80, "That name is too long."),
  email: z.email("Please enter an email we can reply to."),
  grade: z.enum(GRADES, "Pick your grade."),
  experience: z.enum(["none", "some", "lots"], "Pick one."),
  why: z
    .string()
    .trim()
    .min(20, "A sentence or two is enough — just not blank.")
    .max(1200, "Keep it under 1200 characters."),
  idea: z.string().trim().max(600, "Keep it under 600 characters.").optional(),
  /** Honeypot. Real people never see this field, so it must stay empty. */
  company: z.string().max(0).optional(),
});

export type Application = z.infer<typeof applicationSchema>;

/** Field-keyed errors, the shape the form renders directly. */
export type FieldErrors = Partial<Record<keyof Application, string>>;

export function toFieldErrors(error: z.ZodError<Application>): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof Application | undefined;
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}
