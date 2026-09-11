import { faq } from "@/content/club";
import { Eyebrow } from "@/components/ui/Button";
import { RevealLines } from "@/components/motion/Reveal";

/** FAQ. A native details accordion — no script, so the answers stay
 *  reachable with JavaScript off, and find-in-page sees all of them. The
 *  marker is a plus that turns as a row opens; inline SVG per the
 *  no-icon-set rule. */
export function Faq() {
  return (
    <section className="pt-28 md:pt-40" aria-labelledby="faq-title">
      <div className="edge">
        <div className="grid12 items-start gap-y-10">
          <div className="col-span-4 md:col-span-5">
            <Eyebrow index={7}>{faq.eyebrow}</Eyebrow>
            <RevealLines
              lines={faq.headline}
              id="faq-title"
              className="optical mt-5 text-3xl font-semibold"
            />
            <p className="pretty mt-6 max-w-[40ch] text-base text-[var(--stage-muted)]">
              If a question is not covered here, ask it in the Discord — the
              invite is in the footer — or email the officers.
            </p>
          </div>

          <div className="col-span-4 md:col-span-6 md:col-start-7">
            {faq.items.map((item, i) => (
              <details
                key={item.q}
                open={i === 0}
                className="group border-b border-[var(--stage-line)] first:border-t"
              >
                <summary className="flex cursor-pointer list-none items-baseline justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-baseline gap-4">
                    <span
                      aria-hidden
                      className="mono-label tnum text-[var(--stage-muted)]"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-base font-medium md:text-lg">
                      {item.q}
                    </span>
                  </span>
                  <svg
                    aria-hidden
                    viewBox="0 0 12 12"
                    className="h-3 w-3 shrink-0 self-center transition-transform duration-[var(--dur-fast)] group-open:rotate-45"
                  >
                    <path
                      d="M6 1v10M1 6h10"
                      stroke="currentColor"
                      strokeWidth="1.4"
                    />
                  </svg>
                </summary>
                <p className="pretty pb-6 pl-9 pr-6 text-base text-[var(--stage-muted)]">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
