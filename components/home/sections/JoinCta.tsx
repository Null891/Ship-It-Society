import Link from "next/link";
import { club, join } from "@/content/club";
import { Eyebrow } from "@/components/ui/Button";
import { RevealLines } from "@/components/motion/Reveal";

/** Closing call to action. Offset, not centred. */
export function JoinCta() {
  return (
    <section className="pt-28 md:pt-40" aria-labelledby="join-title">
      <div className="edge">
        <div className="grid12">
          <div className="col-span-4 md:col-span-8">
            <Eyebrow index={8}>{join.eyebrow}</Eyebrow>
            <RevealLines
              lines={["No experience required.", "Effort is."]}
              id="join-title"
              className="optical mt-5 text-4xl font-semibold"
            />
            <p className="pretty mt-6 max-w-[48ch] text-lg text-[var(--stage-muted)]">
              {join.standfirst}
            </p>
            <ul className="mt-8 space-y-3">
              {join.points.map((p) => (
                <li key={p} className="flex gap-3 text-base">
                  <span
                    aria-hidden
                    className="mt-[0.6em] h-[5px] w-[5px] shrink-0 bg-marigold"
                  />
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/join"
                className="inline-flex rounded-pill bg-marigold px-6 py-3 text-base font-medium text-ink transition-[background-color,transform] duration-[var(--dur-fast)] ease-[var(--ease-apple)] hover:bg-marigold-hi active:scale-[0.98]"
              >
                Apply to join
              </Link>
              {club.discord && (
                <a
                  href={club.discord}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-base underline decoration-[var(--stage-line)] underline-offset-4 transition-colors hover:decoration-current"
                >
                  Join the Discord
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
