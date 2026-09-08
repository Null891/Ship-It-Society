import { Eyebrow } from "@/components/ui/Button";
import { RevealLines } from "@/components/motion/Reveal";

/* ==========================================================================
   The masthead every sub-page opens with. Sitting on columns 1-8 rather than
   centred keeps the sub-pages in the same compositional language as home.
   ========================================================================== */

export function PageHeader({
  eyebrow,
  title,
  standfirst,
  children,
}: {
  eyebrow: string;
  /** Pass an array to control exactly where the lines break. */
  title: string | string[];
  standfirst?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="pt-32 md:pt-44">
      <div className="edge">
        <div className="grid12">
          <div className="col-span-4 md:col-span-8">
            <Eyebrow>{eyebrow}</Eyebrow>
            <RevealLines
              as="h1"
              lines={title}
              className="optical balance mt-5 text-4xl font-semibold"
            />
            {standfirst && (
              <p className="pretty mt-6 max-w-[54ch] text-lg text-[var(--stage-muted)]">
                {standfirst}
              </p>
            )}
            {children}
          </div>
        </div>
      </div>
    </header>
  );
}
