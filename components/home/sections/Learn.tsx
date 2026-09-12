import { learn } from "@/content/club";
import { Eyebrow } from "@/components/ui/Button";
import { RevealLines, Stagger, StaggerItem } from "@/components/motion/Reveal";

/** What members come away with. The same term/detail table the judging
 *  criteria use — the tools are stated as plainly as the rules. */
export function Learn() {
  return (
    <section className="pt-28 md:pt-40" aria-labelledby="learn-title">
      <div className="edge">
        <div className="grid12">
          <div className="col-span-4 md:col-span-5">
            <Eyebrow index={5}>{learn.eyebrow}</Eyebrow>
            <RevealLines
              lines={learn.headline}
              id="learn-title"
              className="optical mt-5 text-3xl font-light"
            />
            <p className="pretty mt-6 max-w-[44ch] text-lg text-[var(--stage-muted)]">
              {learn.standfirst}
            </p>
          </div>

          <Stagger
            as="dl"
            className="col-span-4 mt-12 md:col-span-6 md:col-start-7 md:mt-0"
          >
            {learn.items.map((item, i) => (
              <StaggerItem index={i} key={item.term} className="rule-t py-5">
                <dt className="text-lg font-medium">{item.term}</dt>
                <dd className="pretty mt-1.5 text-base text-[var(--stage-muted)]">
                  {item.detail}
                </dd>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
