import { faq } from "@/content/club";
import { forms } from "@/content/forms";
import { Button, Eyebrow } from "@/components/ui/Button";
import { RevealLines } from "@/components/motion/Reveal";
import { Form } from "@/components/forms/Form";
import styles from "./Faq.module.css";

/* ==========================================================================
   FAQ, then a form for anything it does not answer.

   The rows are native <details>, so every answer is reachable with
   JavaScript off and find-in-page opens the row it matches. Each row is a
   HUD line: a mono index, the question, and a plus that turns to a minus.

   The home page is static, so the question form cannot read a query string.
   A question posted without JavaScript is redirected back to a #fragment,
   and the form shows the matching status panel with :target.
   ========================================================================== */

const pad = (n: number) => String(n).padStart(2, "0");

export function Faq() {
  const ask = forms.question;
  return (
    <section className="pt-28 md:pt-40" aria-labelledby="faq-title">
      <div className="edge">
        <div className="grid12 items-start gap-y-12">
          <div className="col-span-4 md:sticky md:top-28 md:col-span-4">
            <Eyebrow index={8}>{faq.eyebrow}</Eyebrow>
            <RevealLines lines={faq.headline} id="faq-title" className="optical mt-5 text-3xl font-normal" />
            <p className="mono-label tnum mt-8 text-[var(--stage-subtle)]">
              {pad(faq.items.length)} answers
            </p>
            <a
              href="#ask"
              className="mt-3 inline-flex min-h-6 items-center text-base underline decoration-[var(--stage-line-strong)] underline-offset-4 transition-[text-decoration-color] duration-[var(--dur-fast)] hover:decoration-marigold"
            >
              {ask.title.replace(/\.$/, "")}
            </a>
          </div>

          <div className="col-span-4 md:col-span-8 md:col-start-5 lg:col-span-7 lg:col-start-6">
            {faq.items.map((item, i) => (
              <details key={item.q} open={i === 0} className={`${styles.row} group/faq`}>
                <summary
                  className={`${styles.summary} grid grid-cols-[2rem_minmax(0,1fr)_auto] items-baseline gap-x-4 px-3 py-5 sm:grid-cols-[2.75rem_minmax(0,1fr)_auto] sm:px-5`}
                >
                  <span aria-hidden className="mono-label tnum text-[var(--stage-subtle)] group-open/faq:text-marigold">
                    {pad(i + 1)}
                  </span>
                  <span className="text-base font-medium md:text-lg">{item.q}</span>
                  <svg aria-hidden viewBox="0 0 12 12" className="h-3 w-3 self-center text-[var(--stage-muted)] group-open/faq:text-marigold">
                    <path d="M1 6h10" stroke="currentColor" strokeWidth="1.3" />
                    <path className={styles.bar} d="M6 1v10" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                </summary>
                <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4 px-3 pb-7 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:px-5">
                  <div className="col-start-2 pr-2 sm:pr-8">
                    <p className="pretty max-w-[60ch] text-base text-[var(--stage-muted)]">{item.a}</p>
                    {item.link && (
                      <div className="mt-4">
                        <Button href={item.link.href} variant="quiet" arrow>
                          {item.link.label}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Ask a question */}
        <div
          id="ask"
          className="chamfer-line mt-20 scroll-mt-28 px-5 py-8 [--fill:var(--color-surface-900)] [--ground:var(--color-surface-900)] [--line:var(--stage-line-strong)] sm:px-8 md:mt-28 md:px-10 md:py-12"
        >
          <div className="grid12 gap-y-10">
            <div className="col-span-4 md:col-span-4">
              <p className="mono-label text-[var(--stage-muted)]">{ask.eyebrow}</p>
              <h3 id="ask-title" className="mt-4 text-2xl font-normal">
                {ask.title}
              </h3>
              <p className="pretty mt-3 max-w-[40ch] text-base text-[var(--stage-muted)]">{ask.intro}</p>
            </div>
            <div className="col-span-4 md:col-span-7 md:col-start-6">
              <Form spec={ask} statusByTarget headingLevel={4} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
