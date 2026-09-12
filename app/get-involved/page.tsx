import type { Metadata } from "next";
import { Form } from "@/components/forms/Form";
import { Eyebrow } from "@/components/ui/Button";
import { HudFrame } from "@/components/ui/Hud";
import { PageHeader } from "@/components/ui/PageHeader";
import { club, meetingLine } from "@/content/club";
import { forms, getInvolvedPage, type FormSpec } from "@/content/forms";
import { readOutcome } from "@/lib/forms/shared";
import { OG_IMAGE, shareTitle } from "@/lib/metadata";

const TITLE = "Get involved";
const DESCRIPTION = getInvolvedPage.standfirst;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/get-involved" },
  openGraph: {
    url: "/get-involved",
    title: shareTitle(TITLE),
    description: DESCRIPTION,
    siteName: club.name,
    type: "website",
    locale: "en_US",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle(TITLE),
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE.url, alt: OG_IMAGE.alt }],
  },
};

/* ==========================================================================
   /get-involved — every way in that is not a membership application.

   Three forms, each in its own panel, with a small index pinned beside
   them on wide screens. The page reads its query string only to render the
   outcome of a form posted without JavaScript.
   ========================================================================== */

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const SECTIONS = [
  { id: "updates", spec: forms.interest },
  { id: "speak", spec: forms.speaker },
  { id: "give", spec: forms.gift },
] as const;

const names = (spec: FormSpec) => spec.fields.map((f) => f.name);

/** Let a " · " list wrap only between its parts, never inside "12:15 PM". */
const unbroken = (line: string) =>
  line
    .split(" · ")
    .map((part) => part.replace(/ /g, " "))
    .join(" · ");

function Intro({ id, index, spec }: { id: string; index: number; spec: FormSpec }) {
  return (
    <div>
      <Eyebrow index={index}>{spec.eyebrow}</Eyebrow>
      <h2 id={`${id}-title`} className="balance mt-4 text-3xl font-normal">
        {spec.title}
      </h2>
      <p className="pretty mt-4 max-w-[46ch] text-base text-[var(--stage-muted)]">{spec.intro}</p>
    </div>
  );
}

export default async function GetInvolvedPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const outcome = (spec: FormSpec) => readOutcome(params, spec.id, names(spec));

  return (
    <>
      <PageHeader
        index={5}
        eyebrow={getInvolvedPage.eyebrow}
        title={getInvolvedPage.title}
        standfirst={getInvolvedPage.standfirst}
      />

      <div className="edge pb-8 pt-16 md:pt-24">
        <div className="grid12 items-start">
          {/* Index, pinned beside the forms where there is room for it. */}
          <nav aria-label="On this page" className="sticky top-28 hidden lg:col-span-3 lg:block">
            <p className="mono-label text-[var(--stage-subtle)]">On this page</p>
            <ol className="mt-4 border-l border-[var(--stage-line)]">
              {SECTIONS.map(({ id, spec }, i) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="group -ml-px flex min-h-10 items-center gap-3 border-l border-transparent pl-4 transition-colors duration-[var(--dur-fast)] hover:border-marigold"
                  >
                    <span className="mono-label tnum text-marigold">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm text-[var(--stage-muted)] transition-colors duration-[var(--dur-fast)] group-hover:text-[var(--stage-fg)]">
                      {spec.eyebrow}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="col-span-4 space-y-24 md:col-span-12 md:space-y-32 lg:col-span-9 lg:col-start-4">
            {/* 01 — the update list: intro beside the form, in a filled panel. */}
            <section id="updates" aria-labelledby="updates-title" className="scroll-mt-28">
              <div className="chamfer-line px-5 py-8 [--fill:var(--color-surface-900)] [--ground:var(--color-surface-900)] [--line:var(--stage-line-strong)] sm:px-8 md:px-10 md:py-10">
                <div className="grid grid-cols-1 gap-x-12 gap-y-10 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                  <Intro id="updates" index={1} spec={forms.interest} />
                  <Form spec={forms.interest} outcome={outcome(forms.interest)} />
                </div>
              </div>
            </section>

            {/* 02 — speakers: an open frame, the meeting time beside the title. */}
            <section id="speak" aria-labelledby="speak-title" className="scroll-mt-28">
              <HudFrame size={14} className="px-5 py-8 sm:px-8 md:px-10 md:py-10">
                <div className="flex flex-col gap-8 border-b border-[var(--stage-line)] pb-8 md:flex-row md:items-end md:justify-between">
                  <Intro id="speak" index={2} spec={forms.speaker} />
                  <div className="shrink-0 md:max-w-[16rem] md:text-right">
                    <p className="mono-label text-[var(--stage-subtle)]">The club meets</p>
                    <p className="tnum mt-1.5 text-base text-[var(--stage-fg)]">{unbroken(meetingLine)}</p>
                  </div>
                </div>
                <div className="mt-10">
                  <Form spec={forms.speaker} outcome={outcome(forms.speaker)} />
                </div>
              </HudFrame>
            </section>

            {/* 03 — gifts: a filled panel again, closing the page. */}
            <section id="give" aria-labelledby="give-title" className="scroll-mt-28">
              <div className="chamfer-line px-5 py-8 [--fill:var(--color-surface-900)] [--ground:var(--color-surface-900)] [--line:var(--stage-line-strong)] sm:px-8 md:px-10 md:py-10">
                <div className="grid grid-cols-1 gap-x-12 gap-y-10 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                  <Intro id="give" index={3} spec={forms.gift} />
                  <Form spec={forms.gift} outcome={outcome(forms.gift)} />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
