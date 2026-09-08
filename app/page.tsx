import { HeroSequence } from "@/components/home/HeroSequence";
import { StageShift } from "@/components/chrome/Stage";
import { Countdown } from "@/components/home/Countdown";
import { Format } from "@/components/home/Format";
import {
  JoinCta,
  Premise,
  Prizes,
  Security,
  SponsorRow,
  Stats,
} from "@/components/home/Sections";

export default function HomePage() {
  return (
    <>
      <HeroSequence />

      {/* The temperature changes here, in the gap between the cinematic hero
          and the editorial body — never underneath a block of text. */}
      <StageShift />

      <Premise />
      <Stats />
      <Format />
      <Security />
      <Prizes />
      <SponsorRow />
      <Countdown />
      <JoinCta />
    </>
  );
}
