/* ==========================================================================
   Built-in forms.

   These replace the club's Google Forms. Each one posts to the site's own
   API, which delivers to the club email and/or the club's Google Sheet (see
   SETUP.md), so submissions land where the officers already look — with no
   redirect to a third-party page and no Google branding.

   This file is the copy and the field list. Validation lives in lib/forms,
   and it reads the limits from here, so the two cannot drift apart.

   The membership application is separate (components/join/ApplyForm.tsx),
   because it is the one form with its own page and its own success ticket.

   Facts (meeting time, room, team size) are never typed here — components
   render them from content/club.ts next to the form.
   ========================================================================== */

export type FieldSpec =
  | {
      name: string;
      label: string;
      kind: "text" | "email" | "url";
      required: boolean;
      max: number;
      help?: string;
      autoComplete?: string;
    }
  | {
      name: string;
      label: string;
      kind: "textarea";
      required: boolean;
      max: number;
      help?: string;
    }
  | {
      name: string;
      label: string;
      kind: "choice" | "multi";
      required: boolean;
      options: string[];
      help?: string;
    };

export type FormId = "interest" | "speaker" | "question" | "gift";

export type FormSpec = {
  id: FormId;
  eyebrow: string;
  title: string;
  intro: string;
  fields: FieldSpec[];
  submit: string;
  success: { title: string; body: string };
};

export const forms: Record<FormId, FormSpec> = {
  interest: {
    id: "interest",
    eyebrow: "Stay in the loop",
    title: "Not ready to apply?",
    intro:
      "Get meeting reminders and hackathon dates by email. No commitment, and you can still apply any time.",
    fields: [
      { name: "name", label: "Name", kind: "text", required: true, max: 80, autoComplete: "name" },
      { name: "email", label: "Email", kind: "email", required: true, max: 120, autoComplete: "email" },
      { name: "grade", label: "Grade", kind: "choice", required: true, options: ["9", "10", "11", "12"] },
      {
        name: "interests",
        label: "What interests you",
        kind: "multi",
        required: false,
        options: ["Building apps", "AI-assisted coding", "Security", "Design", "Just curious"],
      },
    ],
    submit: "Keep me posted",
    success: {
      title: "You are on the list.",
      body: "An officer adds you to the club's update list. Reply to any update to come off it.",
    },
  },

  speaker: {
    id: "speaker",
    eyebrow: "Speakers",
    title: "Talk to the club.",
    intro:
      "Give a short talk or run a workshop at a meeting. Engineers, founders, designers and researchers are all welcome.",
    fields: [
      { name: "name", label: "Name", kind: "text", required: true, max: 80, autoComplete: "name" },
      { name: "email", label: "Email", kind: "email", required: true, max: 120, autoComplete: "email" },
      {
        name: "role",
        label: "Role and organization",
        kind: "text",
        required: false,
        max: 120,
        autoComplete: "organization-title",
      },
      {
        name: "format",
        label: "Format",
        kind: "choice",
        required: true,
        options: ["Talk", "Workshop", "Live demo", "Q&A"],
      },
      {
        name: "topic",
        label: "What you would cover",
        kind: "textarea",
        required: true,
        max: 600,
        help: "A few sentences is plenty.",
      },
      { name: "dates", label: "Dates that work", kind: "text", required: false, max: 120 },
      { name: "link", label: "A link about you", kind: "url", required: false, max: 200 },
    ],
    submit: "Offer a session",
    success: {
      title: "Thank you.",
      body: "An officer will reply by email to find a date.",
    },
  },

  question: {
    id: "question",
    eyebrow: "Ask",
    title: "Ask a question.",
    intro:
      "Not answered above? Ask the officers directly. We reply by email, and questions that come up often get added here.",
    fields: [
      { name: "email", label: "Email", kind: "email", required: true, max: 120, autoComplete: "email" },
      { name: "question", label: "Your question", kind: "textarea", required: true, max: 600 },
      { name: "name", label: "Name", kind: "text", required: false, max: 80, autoComplete: "name" },
    ],
    submit: "Send question",
    success: {
      title: "Sent.",
      body: "An officer will reply by email.",
    },
  },

  gift: {
    id: "gift",
    eyebrow: "Give",
    title: "Donate a prize or a gift.",
    intro:
      "Prize money, food for demo day, hardware, software credits. Tell us what you would like to give and an officer will reply to arrange it. Nothing is charged on this site.",
    fields: [
      { name: "name", label: "Name", kind: "text", required: true, max: 80, autoComplete: "name" },
      { name: "email", label: "Email", kind: "email", required: true, max: 120, autoComplete: "email" },
      {
        name: "organization",
        label: "Organization, if any",
        kind: "text",
        required: false,
        max: 120,
        autoComplete: "organization",
      },
      {
        name: "gift",
        label: "What you would like to give",
        kind: "multi",
        required: true,
        options: ["Prize money", "Food for demo day", "Hardware or gear", "Software or credits", "Something else"],
      },
      { name: "note", label: "Anything we should know", kind: "textarea", required: false, max: 600 },
    ],
    submit: "Offer a gift",
    success: {
      title: "Thank you.",
      body: "An officer will reply by email to arrange it.",
    },
  },
};

/** The page that gathers every way in that is not a membership application. */
export const getInvolvedPage = {
  eyebrow: "Get involved",
  title: ["Speak, give,", "or stay in the loop."],
  standfirst:
    "Members apply to join. Everyone else can still be part of it: give a talk, donate a prize, or get the dates by email.",
};
