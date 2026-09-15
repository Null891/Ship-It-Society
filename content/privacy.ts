import { APPLY_FIELDS } from "@/lib/apply";
import { club } from "./club";

/* ==========================================================================
   What the club keeps.

   Everyone filling in a form here is a high-school student, and the
   application asks for a grade, which is an age. That is data about minors,
   so this page exists and is written to be read rather than to be defensible.

   The field list is DERIVED from lib/apply.ts. If a field is added to the
   application, it appears here automatically and cannot be forgotten.
   ========================================================================== */

/** "Name, Email, Grade, Coding experience, ..." — straight from the schema. */
const applyFieldList = Object.values(APPLY_FIELDS)
  .map((f) => f.label.replace(/\?$/, ""))
  .join(" · ");

export const privacy = {
  eyebrow: "Privacy",
  title: ["What we keep,", "and what we don't."],
  standfirst:
    "The club runs its own forms so student details never pass through a third party. This is everything those forms collect and everywhere it goes.",
  /** Update by hand when the page changes. Never auto-generated. */
  reviewed: "September 14, 2026",

  sections: [
    {
      label: "Collected",
      q: "What the forms ask for.",
      a: [
        "The membership application asks for the fields below. Nothing else is collected, and none of it is optional-by-stealth — the only field you can skip is the project idea.",
        "The other forms — updates, speaking, mentoring, questions — ask for a name, an email, and whatever you choose to write in the message.",
      ],
      list: [
        { term: "Application", detail: applyFieldList },
        {
          term: "Anti-spam",
          detail:
            "The server briefly remembers the network address a form was sent from, in memory only, for one minute. It is never written down and never leaves the server.",
        },
      ],
    },
    {
      label: "Purpose",
      q: "Why we ask for it.",
      a: [
        "Grade and coding experience are used to build balanced teams and to check you are a student at the school. The written answers are used to reply to you. That is the whole of it.",
        "Nothing here is used for advertising, and nothing is sold. This site carries no ads, no affiliate links, and no third-party tracking scripts.",
      ],
    },
    {
      label: "Storage",
      q: "Where it goes.",
      a: [
        "Submissions are emailed to the club's officers, and may also be recorded in a private spreadsheet only officers can open. This website stores nothing itself — there is no database behind it.",
        "Officer inboxes are ordinary email accounts. Treat anything you send here as readable by the students who run the club, because it is.",
      ],
    },
    {
      label: "Retention",
      q: "How long it is kept.",
      a: [
        "Applications are kept for the school year they were sent in, so officers can look back at who joined and when. After that they are deleted.",
        "If you ask for your details to be removed sooner, they are removed — there is no waiting period and no process to go through.",
      ],
    },
    {
      label: "Control",
      q: "Getting it deleted.",
      a: [
        `Email ${club.email} and say what you sent and when. An officer deletes it and replies to confirm. You do not have to give a reason.`,
        "You can ask for a copy of what the club holds on you the same way.",
      ],
    },
    {
      label: "Measurement",
      q: "Analytics and cookies.",
      a: [
        "This site sets no cookies. It uses Vercel Analytics and Speed Insights, which count page views and load times in aggregate without cookies and without building a profile of you.",
        "There is no Google Analytics, no advertising pixel, and no social embed anywhere on the site.",
      ],
    },
    {
      label: "Age",
      q: "If you are under 13.",
      a: [
        "Please do not send a form. The club is for students at the school, who are 13 or older. If something arrives from a younger student it is deleted rather than answered.",
      ],
    },
  ],
};
