import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/PageHeader";
import { CopyEmail } from "@/components/ui/CopyEmail";
import { Eyebrow } from "@/components/ui/Button";
import { club } from "@/content/club";
import { privacy } from "@/content/privacy";
import { OG_IMAGE, shareTitle } from "@/lib/metadata";

const TITLE = "Privacy";

export const metadata: Metadata = {
  title: TITLE,
  description: privacy.standfirst,
  alternates: { canonical: "/privacy" },
  openGraph: {
    url: "/privacy",
    title: shareTitle(TITLE),
    description: privacy.standfirst,
    siteName: club.name,
    type: "website",
    locale: "en_US",
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle(TITLE),
    description: privacy.standfirst,
    images: [{ url: OG_IMAGE.url, alt: OG_IMAGE.alt }],
  },
};

/* ==========================================================================
   /privacy — what the club keeps, in plain language.

   Everyone who fills in a form here is a high-school student, and the
   application asks for a grade. That is data about minors, so the answer
   needs to be short enough to actually be read. Sections are a numbered
   list of questions, each with one honest paragraph.
   ========================================================================== */

/** "Anti-spam" -> "anti-spam". The rail and the section agree by construction. */
const sectionId = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow={privacy.eyebrow}
        title={privacy.title}
        standfirst={privacy.standfirst}
        meta={[
          { label: "Applies to", value: "Every form on this site" },
          { label: "Held by", value: `${club.name} officers` },
          { label: "Last reviewed", value: privacy.reviewed },
        ]}
      />

      <div className="edge pb-8 pt-16 md:pt-24">
        <div className="grid12 items-start">
          {/* The section index, pinned where there is margin for it — the
              same rail /get-involved uses, so a long page has a spine. */}
          <nav aria-label="On this page" className="sticky top-28 hidden lg:col-span-3 lg:block">
            <p className="mono-label text-[var(--stage-subtle)]">On this page</p>
            <ol className="mt-4 border-l border-[var(--stage-line)]">
              {privacy.sections.map((s, i) => (
                <li key={s.q}>
                  <a
                    href={`#${sectionId(s.label)}`}
                    className="group -ml-px flex min-h-10 items-center gap-3 border-l border-transparent pl-4 transition-colors duration-[var(--dur-fast)] hover:border-marigold"
                  >
                    <span className="mono-label tnum text-marigold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm text-[var(--stage-muted)] transition-colors duration-[var(--dur-fast)] group-hover:text-[var(--stage-fg)]">
                      {s.label}
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="col-span-4 md:col-span-12 lg:col-span-8 lg:col-start-4">
            {privacy.sections.map((s, i) => (
              <section
                key={s.q}
                id={sectionId(s.label)}
                className="scroll-mt-28 border-t border-[var(--stage-line)] py-10 first:border-t-0 first:pt-0 md:py-12"
              >
                <Eyebrow index={i + 1}>{s.label}</Eyebrow>
                <h2 className="balance mt-4 text-2xl font-normal md:text-3xl">{s.q}</h2>
                {s.a.map((para) => (
                  <p
                    key={para}
                    className="pretty mt-5 max-w-[62ch] text-base text-[var(--stage-muted)]"
                  >
                    {para}
                  </p>
                ))}
                {s.list ? (
                  <ul className="mt-6 max-w-[62ch]">
                    {s.list.map((item) => (
                      <li
                        key={item.term}
                        className="grid grid-cols-1 gap-x-6 border-t border-[var(--stage-line)] py-4 md:grid-cols-[180px_1fr]"
                      >
                        <span className="mono-label pt-1 text-marigold">{item.term}</span>
                        <span className="pretty mt-1.5 text-base text-[var(--stage-muted)] md:mt-0">
                          {item.detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <div className="chamfer-line mt-4 px-6 py-8 [--fill:var(--color-surface-900)] [--ground:var(--color-surface-900)] [--line:var(--stage-line-strong)] md:px-8">
              <p className="mono-label text-[var(--stage-subtle)]">Ask us anything about this</p>
              <CopyEmail email={club.email} className="mt-3 text-base" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
