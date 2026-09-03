import { BandScrollShowcase } from "@/components/BandScrollShowcase";
import { HeroBoundary } from "@/components/HeroBoundary";
import { TheSpecs } from "@/components/TheSpecs";
import { OneSignalSection } from "@/components/OneSignalSection";
import { DesignedToBlendInSection } from "@/components/DesignedToBlendInSection";
import { SignalVsNoiseSection } from "@/components/SignalVsNoiseSection";
import { ClosingCurtainSection } from "@/components/ClosingCurtainSection";

export const metadata = { title: "The NA·01 band — NeuroAtlas" };

// Copy: client's full pass over the /band page content doc. BandScrollShowcase
// covers sections 1 ("Hero") and 2 ("What It Reads") together — see the
// comment in that file for why. Sections 3–9 follow below in order.

export default function BandPage() {
  return (
    <main>
      <BandScrollShowcase />
      <HeroBoundary />

      {/* 3. What it deliberately does not do — "Expand & Snap": a massive
          gradient-masked headline scales down and locks into center, own
          h-[200vh] pinned track. See OneSignalSection.tsx. */}
      <OneSignalSection />

      {/* 4. Design and build — "Expand & Snap": a cinematic letterbox
          slit expands to fill the screen behind the headline, own
          h-[300vh] pinned track. See DesignedToBlendInSection.tsx. */}
      <DesignedToBlendInSection />

      {/* 5+6. Accuracy/validation + how the band and app work together —
          "Signal vs. Noise": scrapped the static 2-photo grid and the two
          separate plain text blocks ("Precision, Not Guesswork" / "The
          App Reads You") in favor of one unified cinematic sequence, own
          h-[400vh] pinned track. See SignalVsNoiseSection.tsx. */}
      <SignalVsNoiseSection />

      {/* 7. Technical specifications — the Interactive X-Ray: a real 3D
          <Band> model dead center that physically rotates to a
          category-specific angle when one of five reticles flanking it
          is clicked, with a fixed-anchor glass panel showing that
          category's data. Own min-h-screen section, not scroll-jacked —
          no extra page length. Replaced the editorial hover showcase
          (and, before that, a bento grid, and before that a scroll-spy
          stack — all scrapped per direct feedback). Every value is
          still a placeholder pending the real spec doc; already in the
          right shape to swap in real values with no restructuring. See
          TheSpecs.tsx. */}
      <TheSpecs />

      {/* 8+9. Common concerns + closing CTA — a cinematic curtain reveal:
          the off-white "concerns" section scrolls normally in front; the
          navy CTA sits pinned to the viewport's bottom edge behind it
          for a held stretch of scroll, so it looks like the curtain
          physically lifts away to reveal the CTA underneath. Replaced
          two standard centered-text blocks (client feedback: "feels too
          much like a standard template"). See ClosingCurtainSection.tsx
          for the exact stacking mechanics. */}
      <ClosingCurtainSection />
    </main>
  );
}
