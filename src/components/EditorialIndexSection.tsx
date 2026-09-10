"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

// Placeholder research AREAS, not fabricated citations — real papers
// aren't sourced yet, so these stay at the honest level of "which
// field this maps to", echoing the same three pillars section 2
// covers rather than inventing specific studies/authors. Kept
// unchanged when this component's own heading/body were repurposed
// from "Peer-Reviewed, Not Promised" to "Guided By Experts" (the
// client's final copy for /the-science's section 6) — the cards
// still read as the expert/research backing that heading refers to.
const RESEARCH_CARDS = [
  {
    index: "01",
    field: "Autonomic Regulation",
    note: "Peer-reviewed literature on vagal tone and stress recovery.",
  },
  {
    index: "02",
    field: "Prefrontal-Limbic Control",
    note: "Research on cognitive reappraisal and executive control under pressure.",
  },
  {
    index: "03",
    field: "Neuroplastic Conditioning",
    note: "Studies on repetition-driven habit formation and skill consolidation.",
  },
];

// Fixed "fanned deck" offsets — not scroll-driven, just how each card
// sits once revealed, so even at full rest they read as a physical
// stack rather than three cards perfectly aligned on top of each other.
const FAN_ROTATE = [-4, 2, 0];
const FAN_X = [-14, 8, 0];

// Per-card hold-then-reveal windows, evenly split into thirds — index 0
// (the base card) has none: it's simply always settled, never fading in
// from hidden, which is what actually lets progress start at exactly 0
// (see this file's own useScroll comment) without a blank first frame.
// Index 1 holds through [0, 0.33] — genuinely nothing moves, so a
// reader who stops anywhere in that window sees card 01 alone and fully
// readable — then reveals over the next third, [0.33, 0.66]. Index 2
// holds through [0, 0.66] (i.e. through card 01's whole read AND card
// 02's own reveal) and takes the final third, [0.66, 1], to slide in
// and settle exactly as the track ends.
const CARD_WINDOWS: ReadonlyArray<{ start: number; end: number } | null> = [
  null,
  { start: 0.33, end: 0.66 },
  { start: 0.66, end: 1 },
];

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function StackedResearchCard({
  progress,
  index,
  reduceMotion,
  card,
}: {
  progress: MotionValue<number>;
  index: number;
  reduceMotion: boolean;
  card: (typeof RESEARCH_CARDS)[number];
}) {
  const revealWindow = CARD_WINDOWS[index];
  // No window (index 0) — always fully settled, nothing to hold or ease.
  const eased = (p: number) =>
    reduceMotion || !revealWindow
      ? 1
      : clamp01((p - revealWindow.start) / (revealWindow.end - revealWindow.start));
  const opacity = useTransform(progress, (p) => eased(p));
  const y = useTransform(progress, (p) => (reduceMotion ? 0 : 60 * (1 - eased(p))));

  return (
    <motion.div
      style={{
        opacity,
        y,
        rotate: FAN_ROTATE[index] ?? 0,
        x: FAN_X[index] ?? 0,
        zIndex: index + 1,
      }}
      className="absolute inset-0 flex flex-col justify-center rounded-3xl border border-navy/10 bg-white/50 p-8 shadow-[0_20px_45px_-25px_rgba(11,16,22,0.35)] backdrop-blur-md"
    >
      <span className="text-xs font-medium tracking-[-0.04em] text-gold-deep uppercase">
        {card.index}
      </span>
      <h3 className="mt-3 text-balance font-serif font-normal uppercase tracking-normal text-xl text-navy">{card.field}</h3>
      <p className="mt-3 text-pretty text-sm text-mist">{card.note}</p>
    </motion.div>
  );
}

/**
 * "The Editorial Index" — a Swiss-style minimal split: plain text on
 * the left, a sticky stack of glassmorphic research cards on the
 * right, card 01 already settled and readable as soon as the section
 * pins, card 02 and 03 each holding out of view for their own reading
 * beat before sliding in over the one before it — as the reader scrolls
 * through this section's own h-[300vh] pinned track — the same "outer
 * tall wrapper + inner sticky viewport" pattern used throughout this
 * codebase for a scroll-driven reveal (see MethodScrollCards,
 * OneSignalSection).
 *
 * Deliberately has NO outer <section> of its own and no min-height
 * background wrapper beyond its own internal sticky div — this
 * component is used as the `curtain` half of a CurtainReveal (see that
 * component and the page it's used on), which supplies its own wrapping
 * element and measures THIS component's actual rendered height
 * (including its h-[300vh] track) to compute the reveal's stacking
 * math. Rendering an extra outer section here would just be redundant
 * nesting, not incorrect, but there's no reason to.
 */
export function EditorialIndexSection() {
  const reduceMotion = useSafeReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  // offset ["start start", "end end"] — was ["start end", "end end"], a
  // real, confirmed bug this replaces: "start end" starts counting
  // progress the MOMENT any sliver of this wrapper enters the viewport
  // from below, long before the sticky div actually pins in its
  // readable, centered position (which only happens once the wrapper's
  // own top edge reaches the viewport's top — "start start"). With a
  // 180vh-tall wrapper and a ~100vh viewport, that's a real ~100vh
  // stretch of progress already elapsed (over half the 0-1 range)
  // before the section was even fully in view — confirmed live via
  // screenshot: card 02 was already sliding over card 01 the instant
  // the section appeared. "start start" fixes that by only counting
  // progress once the section is genuinely pinned, but on its own it
  // has its OWN documented failure mode (see FeatureSplitSection.tsx's
  // own comment on this exact pair of offsets): progress sits clamped
  // at exactly 0 for the whole time the wrapper is still scrolling up
  // into view but hasn't reached the pin point yet, which is a real
  // problem for content whose own entrance animation depends on
  // progress leaving 0 to become visible at all. That's why card 01
  // (index 0) no longer HAS an entrance window below (see CARD_WINDOWS)
  // — it's simply always rendered settled, so there's nothing left that
  // needs progress to move before it's visible.
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  return (
    // 260vh -> 300vh — a further "give it more deliberate room" pass on
    // top of the earlier 180vh->260vh one: with "start start"/"end end"
    // mapping the full 0-1 progress range across (wrapper height -
    // viewport height) of real scroll, 300vh gives ~200vh of actual
    // pinned scroll distance across the 3-card sequence, comfortably
    // more per hold-or-reveal third than 260vh's ~160vh did.
    <div ref={wrapperRef} className={cn("relative", !reduceMotion && "h-[300vh]")}>
      {/* min-h-[100svh], not h-screen — h-screen (100vh) assumes the
         browser's own toolbar chrome is fully hidden, which isn't true
         on a real phone; the established fix throughout this codebase
         (see MethodScrollCards/BuiltToReadYouSection's own comments) is
         h-[100svh]/min-h-[100svh], the small/guaranteed-visible size,
         specifically to avoid clipping this pinned section's own bottom
         edge against a shorter real viewport. min- (a floor, not a
         fixed cap) rather than a bare h- so taller content on a narrow
         phone still never gets clipped either. py-16 md:py-24 (was a
         flat py-24) — same progressive step the homepage's own
         sections already use (see page.tsx). */}
      <div className="sticky top-0 flex min-h-[100svh] items-center bg-cream px-6 py-16 md:py-24 lg:px-10">
        <div className="mx-auto grid w-full max-w-6xl gap-16 lg:grid-cols-2 lg:items-center">
          <Reveal y={20}>
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight text-navy lg:text-4xl">
              Guided By Experts
            </h2>
            <p className="mt-6 max-w-md text-pretty text-lg text-mist">
              NeuroAtlas brings scientific thinking into the everyday
              experience of understanding and managing stress.
            </p>
          </Reveal>

          <div className="relative h-[320px] sm:h-[360px]">
            {RESEARCH_CARDS.map((card, i) => (
              <StackedResearchCard
                key={card.field}
                progress={scrollYProgress}
                index={i}
                reduceMotion={reduceMotion}
                card={card}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
