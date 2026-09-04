import { LivingSignalHero } from "@/components/LivingSignalHero";
import { NeuralAccordion } from "@/components/NeuralAccordion";
import { HRVSignalSection } from "@/components/HRVSignalSection";
import { ScienceClosingSection } from "@/components/ScienceClosingSection";

export const metadata = { title: "The science — NeuroAtlas" };

// Complete Awwwards-tier overhaul of the original (static, text-only)
// /the-science page — replaced wholesale with the client's own 5-section
// spec below, not incrementally amended. That spec names exactly five
// sections; the previous build's fourth section ("Most Wearables Miss
// The Point") isn't one of them, so it's gone, not merged in somewhere.
//
// 1. The Hero ("The Living Signal") — see LivingSignalHero.tsx.
// 2. Three Systems ("The Neural Accordion") — see NeuralAccordion.tsx.
// 3. The HRV Signal ("Signal vs. Noise") — see HRVSignalSection.tsx.
// 4+5. Peer-Reviewed ("The Editorial Index") lifting away like a
//    curtain to reveal The Finale's closing CTA behind it — see
//    ScienceClosingSection.tsx (which composes EditorialIndexSection.tsx
//    as the curtain and CurtainReveal.tsx for the shared stacking
//    mechanics, reused from /band's own closing pair).

export default function TheSciencePage() {
  return (
    <main>
      <LivingSignalHero />
      <NeuralAccordion />
      <HRVSignalSection />
      <ScienceClosingSection />
    </main>
  );
}
