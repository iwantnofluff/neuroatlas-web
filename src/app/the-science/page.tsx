import { LivingSignalHero } from "@/components/LivingSignalHero";
import { NeuralAccordion } from "@/components/NeuralAccordion";
import { HRVSignalSection } from "@/components/HRVSignalSection";
import { LimitsOfWearablesSection } from "@/components/LimitsOfWearablesSection";
import { BuiltOnNeuroscienceSection } from "@/components/BuiltOnNeuroscienceSection";
import { ScienceClosingSection } from "@/components/ScienceClosingSection";

export const metadata = { title: "The science — NeuroAtlas" };

// The client's final copy pass for /the-science names seven sections —
// up from the five-section spec this page was originally built
// against (see this file's own git history for that earlier note,
// which explicitly dropped a "Most Wearables Miss The Point" section
// for not being one of the five at the time). Two of the new ones
// (4, 5) are genuinely new components; the other two slot into
// components that already existed, just with new heading/body text.
//
// 1. The Hero ("The Evidence Behind It") — see LivingSignalHero.tsx.
// 2. Three Systems, One Method — see NeuralAccordion.tsx.
// 3. The Signal That Does Not Lie — see HRVSignalSection.tsx.
// 4. The Limits Of Wearables — see LimitsOfWearablesSection.tsx (new).
// 5. Built On Neuroscience — see BuiltOnNeuroscienceSection.tsx (new).
// 6. Guided By Experts ("The Editorial Index", repurposed from its
//    previous "Peer-Reviewed, Not Promised" copy — same research-card
//    visual, new heading/body) lifting away like a curtain to reveal
//    section 7's closing CTA behind it — see ScienceClosingSection.tsx
//    (which composes EditorialIndexSection.tsx as the curtain and
//    CurtainReveal.tsx for the shared stacking mechanics, reused from
//    /band's own closing pair). Sections 6 and 7 have to stay back-to-
//    back in that exact order — CurtainReveal's own mechanics require
//    the curtain to directly precede the panel it reveals — which is
//    why 6 isn't positioned between 4 and 5 in the DOM despite being
//    numbered after them; the doc's own numbering doesn't dictate
//    physical position, and this ordering was chosen so the two new
//    plain-text sections (4, 5) still alternate cream/navy-soft
//    cleanly into 6's own fixed cream background.
// 7. The closing CTA itself — no new copy given for it, so it's
//    unchanged (still inside ScienceClosingSection.tsx).

export default function TheSciencePage() {
  return (
    <main>
      <LivingSignalHero />
      <NeuralAccordion />
      <HRVSignalSection />
      <LimitsOfWearablesSection />
      <BuiltOnNeuroscienceSection />
      <ScienceClosingSection />
    </main>
  );
}
