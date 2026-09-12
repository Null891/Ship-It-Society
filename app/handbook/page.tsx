import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { Loop } from "@/components/handbook/Loop";
import { Weeks } from "@/components/handbook/Weeks";
import { Rules } from "@/components/handbook/Rules";
import { Rubric } from "@/components/handbook/Rubric";
import { Prizes } from "@/components/handbook/Prizes";
import { Checklist } from "@/components/handbook/Checklist";
import { Close } from "@/components/handbook/Close";
import { club } from "@/content/club";
import { handbookPage } from "@/content/handbook";

/* ==========================================================================
   /handbook — how a cycle actually runs.

   Seven sections, in the order a member meets them: the loop of stages, the
   four weeks those stages sit in, the rules that do not move, how a demo is
   scored, what it pays, the review before launch, and where to go next.

   No fact is typed here. content/handbook.ts derives every one of them from
   content/club.ts and content/sponsors.ts, so the handbook cannot contradict
   the format page, the rubric on the home page or the sponsor list.
   ========================================================================== */

const share = `${handbookPage.meta.title} — ${club.name}`;

export const metadata: Metadata = {
  title: handbookPage.meta.title,
  description: handbookPage.meta.description,
  alternates: { canonical: "/handbook" },
  openGraph: {
    url: "/handbook",
    title: share,
    description: handbookPage.meta.description,
    siteName: club.name,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: share,
    description: handbookPage.meta.description,
  },
};

export default function HandbookPage() {
  return (
    <>
      <PageHeader
        index={2}
        eyebrow={handbookPage.eyebrow}
        title={handbookPage.title}
        standfirst={handbookPage.standfirst}
        meta={handbookPage.panelRows}
      />

      <Loop />
      <Weeks />
      <Rules />
      <Rubric />
      <Prizes />
      <Checklist />
      <Close />
    </>
  );
}
