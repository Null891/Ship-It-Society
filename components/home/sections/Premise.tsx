import { premise } from "@/content/club";
import { Eyebrow } from "@/components/ui/Button";
import { RevealLines } from "@/components/motion/Reveal";

/** The opening statement. Headline and body sit on different columns so the
 *  block reads as composed rather than centred. */
export function Premise() {
  return (
    <section className="pt-28 md:pt-44" aria-labelledby="premise-title">
      <div className="edge">
        <div className="grid12">
          <div className="col-span-4 md:col-span-9">
            <Eyebrow index={1}>{premise.eyebrow}</Eyebrow>
            <RevealLines
              lines={[
                "Most clubs end in a slide deck.",
                "This one ends in a URL.",
              ]}
              id="premise-title"
              className="optical balance mt-5 text-4xl font-semibold"
            />
          </div>
          <div className="col-span-4 mt-10 space-y-5 md:col-span-6 md:col-start-6 md:mt-14">
            {premise.body.map((p) => (
              <p key={p.slice(0, 24)} className="pretty text-lg">
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
