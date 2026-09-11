import { z } from "@/lib/forms/zod";
import { multiLine, oneLine, scalar, tooLong, toFieldErrors as mapErrors } from "@/lib/forms/schema";

/* ==========================================================================
   The membership application.

   Defined once and imported by both the form and the route handler, so
   client and server validation can never drift apart. Messages are written
   to be read by a student, not a developer.

   There is no honeypot key in this schema. The trap field is read and
   removed by the route before validation (lib/forms/server.ts), so a filled
   trap can never surface as a validation error — which is exactly how the
   old `company` field locked real applicants out.
   ========================================================================== */

export const GRADES = ["9", "10", "11", "12"] as const;

export const EXPERIENCE = [
  { value: "none", label: "None yet", hint: "Never written code" },
  { value: "some", label: "A little", hint: "A class, or a tutorial or two" },
  { value: "lots", label: "Comfortable", hint: "I have built things on my own" },
] as const;

/** Labels and limits the form renders and the email prints. */
export const APPLY_FIELDS = {
  name: { label: "Name", max: 80 },
  email: { label: "Email", max: 120 },
  grade: { label: "Grade" },
  experience: { label: "Coding experience" },
  why: { label: "Why do you want to join?", min: 20, max: 1200 },
  idea: { label: "Something you would want to build", max: 600 },
} as const;

export type ApplyField = keyof typeof APPLY_FIELDS;

/** Field names in the order they appear, for focusing the first error. */
export const APPLY_ORDER = Object.keys(APPLY_FIELDS) as ApplyField[];

const MESSAGES: Record<ApplyField, string> = {
  name: "Please enter your name.",
  email: "Please enter an email we can reply to.",
  grade: "Pick your grade.",
  experience: "Pick the closest one.",
  why: "A sentence or two is enough — just not blank.",
  idea: tooLong(APPLY_FIELDS.idea.max),
};

const { name, email, why, idea } = APPLY_FIELDS;

/* The `error` argument on the type constructor matters as much as the one on
   .min(). Without it, a field that is missing entirely fails the TYPE check
   first and Zod's own wording escapes to the client — an audit caught
   "Invalid input: expected string, received undefined" being returned for a
   missing name. Every string below therefore carries a human message at both
   levels, and the preprocess step turns a missing field into "" first. */
export const applicationSchema = z.object({
  name: z.preprocess(
    scalar(oneLine),
    z
      .string({ error: MESSAGES.name })
      .trim()
      .min(2, MESSAGES.name)
      .max(name.max, "That name is too long."),
  ),
  email: z.preprocess(
    scalar(oneLine),
    z
      .string({ error: MESSAGES.email })
      .trim()
      .min(1, MESSAGES.email)
      .max(email.max, "That email address is too long.")
      .pipe(z.email("That email address does not look complete.")),
  ),
  grade: z.preprocess(scalar(oneLine), z.enum(GRADES, MESSAGES.grade)),
  experience: z.preprocess(
    scalar(oneLine),
    z.enum(["none", "some", "lots"], MESSAGES.experience),
  ),
  why: z.preprocess(
    scalar(multiLine),
    z
      .string({ error: MESSAGES.why })
      .trim()
      .min(1, MESSAGES.why)
      .min(why.min, `A sentence or two is enough — at least ${why.min} characters.`)
      .max(why.max, tooLong(why.max)),
  ),
  idea: z.preprocess(
    scalar(multiLine),
    z.string({ error: MESSAGES.idea }).trim().max(idea.max, tooLong(idea.max)),
  ),
});

export type Application = z.output<typeof applicationSchema>;

/** Field-keyed errors, the shape the form renders directly. */
export type FieldErrors = Partial<Record<ApplyField, string>>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  return mapErrors(error, MESSAGES) as FieldErrors;
}

export const experienceLabel = (v: string) =>
  EXPERIENCE.find((e) => e.value === v)?.label ?? v;

/** The application as labelled lines, for the email and the sheet. */
export function applicationRows(app: Application) {
  return [
    { key: "name", label: name.label, value: app.name },
    { key: "email", label: email.label, value: app.email },
    { key: "grade", label: APPLY_FIELDS.grade.label, value: app.grade },
    { key: "experience", label: APPLY_FIELDS.experience.label, value: experienceLabel(app.experience) },
    { key: "why", label: why.label, value: app.why, long: true },
    { key: "idea", label: idea.label, value: app.idea, long: true },
  ];
}
