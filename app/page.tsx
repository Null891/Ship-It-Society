import { routeMetadata } from "@/lib/metadata";
import { HeroSequence } from "@/components/home/HeroSequence";
import { Countdown } from "@/components/home/Countdown";
import { Format } from "@/components/home/Format";
import { CyclePlate } from "@/components/home/CyclePlate";
import { IndexRail } from "@/components/ui/Poster";
import {
  Faq,
  JoinCta,
  Learn,
  Premise,
  Prizes,
  Security,
  SponsorRow,
  Stats,
} from "@/components/home/Sections";

export const metadata = routeMetadata.home;

/* The rail's entries mirror the numbered eyebrows on each section. Ids point
   at the headings those sections are already labelled by, so nothing extra
   has to be added to the markup. */
const RAIL = [
  { id: "premise-title", label: "Premise" },
  { id: "format-title", label: "Format" },
  { id: "security-title", label: "Security" },
  { id: "prizes-title", label: "Prizes" },
  { id: "learn-title", label: "Learn" },
  { id: "sponsors-title", label: "Sponsors" },
  { id: "countdown-title", label: "Schedule" },
  { id: "faq-title", label: "FAQ" },
  { id: "join-title", label: "Join" },
];

export default function HomePage() {
  return (
    <>
      <HeroSequence />

      {/* The vertical index from the reference posters, pinned to the left
          margin on wide screens only — below 1280px there is no margin to
          spare and it would crowd the content. Decorative and aria-hidden:
          the real navigation is the nav, and every section it points at is
          reachable by scrolling. */}
      <IndexRail
        items={RAIL}
        className="pointer-events-none fixed left-5 top-1/2 z-30 hidden -translate-y-1/2 text-[var(--stage-fg)] xl:block"
      />

      <Premise />
      <Stats />
      <Format />
      <CyclePlate />
      <Security />
      <Prizes />
      <Learn />
      <SponsorRow />
      <Countdown />
      <Faq />
      <JoinCta />
    </>
  );
}
