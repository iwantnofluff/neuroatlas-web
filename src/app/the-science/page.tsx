import { LivingSignalHero } from "@/components/LivingSignalHero";
import { NeuralAccordion } from "@/components/NeuralAccordion";
import { HRVAndLimitsSection } from "@/components/HRVAndLimitsSection";
import { BuiltOnNeuroscienceSection } from "@/components/BuiltOnNeuroscienceSection";
import { ScienceClosingSection } from "@/components/ScienceClosingSection";
import { DotGrid } from "@/components/ui/dot-grid";
import { RESEARCH_CARDS } from "@/lib/researchCitations";

export const metadata = { title: "The science - NeuroAtlas" };

// The client's final copy pass for /the-science names seven sections —
// up from the five-section spec this page was originally built
// against (see this file's own git history for that earlier note,
// which explicitly dropped a "Most Wearables Miss The Point" section
// for not being one of the five at the time). Two of the new ones
// (4, 5) are genuinely new components; the other two slot into
// components that already existed, just with new heading/body text.
//
// 1. The Hero ("The Evidence Behind It") - see LivingSignalHero.tsx.
// 2. Three Systems, One Method - see NeuralAccordion.tsx.
// 3. The Signal That Does Not Lie - see HRVSignalSection.tsx.
// 4. The Limits Of Wearables - see LimitsOfWearablesSection.tsx (new).
//    Sections 3 and 4 render together via HRVAndLimitsSection.tsx, not
//    as separate top-level entries here - a shared Champagne Gold wave
//    draws continuously from section 3's own heading down through the
//    end of section 4, which needs one scroll-linked wrapper spanning
//    both rather than two independent per-section animations.
// 5. Built On Neuroscience - see BuiltOnNeuroscienceSection.tsx (new).
// 6. Guided By Experts ("The Editorial Index", repurposed from its
//    previous "Peer-Reviewed, Not Promised" copy - same research-card
//    visual, new heading/body) lifting away like a curtain to reveal
//    section 7's closing CTA behind it - see ScienceClosingSection.tsx
//    (which composes EditorialIndexSection.tsx as the curtain and
//    CurtainReveal.tsx for the shared stacking mechanics, reused from
//    /band's own closing pair). Sections 6 and 7 have to stay back-to-
//    back in that exact order - CurtainReveal's own mechanics require
//    the curtain to directly precede the panel it reveals - which is
//    why 6 isn't positioned between 4 and 5 in the DOM despite being
//    numbered after them; the doc's own numbering doesn't dictate
//    physical position, and this ordering was chosen so the two new
//    plain-text sections (4, 5) still alternate cream/navy-soft
//    cleanly into 6's own fixed cream background.
// 7. The closing CTA itself - no new copy given for it, so it's
//    unchanged (still inside ScienceClosingSection.tsx).

export default function TheSciencePage() {
  return (
    <main>
      <LivingSignalHero />
      <NeuralAccordion />
      <HRVAndLimitsSection />
      <BuiltOnNeuroscienceSection />
      <ScienceClosingSection />
      {/* References - the full bibliographic citations for "Guided By
         Experts"'s own "Backed by" lines (see EditorialIndexSection.tsx,
         which exports RESEARCH_CARDS as the single source of truth for
         both). Safe to append here since CurtainReveal's stacking math
         depends only on viewport height, not on what comes after it
         (see that component's own doc comment).
         A direct "redesign this" request: the previous version was an
         unlabeled, undifferentiated wall of small print - three run-on
         citations with no visual structure connecting them back to the
         numbered fields ("01 Autonomic Regulation" etc.) a reader just
         scrolled past in "Guided By Experts". Each entry now repeats
         that same index + field as its own small gold label (the exact
         "01 — Autonomic Regulation" pairing, reusing RESEARCH_CARDS'
         own index/field fields rather than just its citation string),
         with a left rule threading them together like a real endnotes
         page, so the list reads as organized reference material rather
         than an anonymous block of text. */}
      <section className="relative overflow-hidden bg-navy px-6 py-16 text-left md:py-20 lg:px-10 lg:py-24">
        {/* DotGrid — the citation column only ever fills a narrow
           centered max-w-2xl, leaving the entire rest of this
           section's own width (its "either end", flanking that
           column) completely flat, unstyled navy — reported live as
           looking bare/unfinished right next to ScienceClosingSection's
           own now-textured panel directly above it. CSS-only DotGrid,
           not DotPattern's live motion-component cloud — see
           dot-grid.tsx's own doc comment for why. */}
        <DotGrid size={28} />
        <div className="relative mx-auto max-w-2xl">
          <p className="eyebrow text-center">References</p>
          <ol className="mt-10 space-y-8">
            {RESEARCH_CARDS.map((card) => (
              <li key={card.field} className="border-l border-gold/25 pl-5">
                <p className="text-xs tracking-[0.15em] text-gold-deep uppercase">
                  {card.index} &mdash; {card.field}
                </p>
                <p className="mt-2 text-pretty text-sm text-cream/55">{card.citation}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
