"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { RESEARCH_CARDS } from "@/lib/researchCitations";

// Real citations, not placeholders — a direct client update replacing
// the previous honest-but-generic "which field this maps to" copy
// (see this file's own git history) with actual backing research per
// card. The data itself lives in lib/researchCitations.ts, not here —
// this file is "use client", and /the-science's page.tsx (a plain
// Server Component) needs the same data for its own "References" list;
// a Server Component can't import a plain value out of a "use client"
// module (only component references cross that boundary), so the data
// has to live in a plain module both sides can import. `citation` (the
// full bibliographic reference) renders in that page-level References
// list, not repeated inside each card here — these three cards are
// already tightly height-constrained (see StackedResearchCard's own
// fixed-position stacking below), and a full citation string is much
// longer than the short "Backed by" line meant to be read at a glance
// while scrolling.

// Fixed "fanned deck" offsets — not scroll-driven, just how each card
// sits once revealed, so even at full rest they read as a physical
// stack rather than three cards perfectly aligned on top of each other.
const FAN_ROTATE = [-4, 2, 0];
const FAN_X = [-14, 8, 0];

// Per-card hold-then-reveal windows — was an even split into thirds
// with no gap between one card's own reveal ending and the next
// card's reveal starting immediately after (confirmed: index 2's own
// reveal began at exactly 0.66, the same instant index 1's reveal
// ended). A direct "the next card shouldn't come immediately, keep
// one extra scroll of delay per card" report: each now-revealed card
// gets its own genuine SETTLED hold (nothing moving, fully visible,
// readable) before the next one begins, rather than reveals running
// back-to-back. Card 1 alone: [0, 0.18]. Card 2 reveal: [0.18, 0.32].
// Card 2 settled hold: [0.32, 0.58] — the actual "extra scroll" pause.
// Card 3 reveal: [0.58, 0.72]. Card 3 settled hold: [0.72, 1].
const CARD_WINDOWS: ReadonlyArray<{ start: number; end: number } | null> = [
  null,
  { start: 0.18, end: 0.32 },
  { start: 0.58, end: 0.72 },
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
  // Hard cut, not a gradual fade — a direct "don't fade, one card's
  // text shows through the other while it's translucent" report: with
  // opacity tracking `eased` directly (0 -> 1 smoothly across the
  // whole reveal window), a card mid-reveal was partially transparent
  // for a real stretch of scroll, and since it's stacked ON TOP of the
  // previous card (z-index), that partial transparency let both
  // cards' own text show through each other at once. Snapping opacity
  // to a binary 0/1 the INSTANT `eased` leaves 0 removes every
  // partially-transparent frame entirely — the card is either fully
  // invisible (still off in its own `y` offset, nothing to see through
  // regardless) or a fully opaque solid card physically sliding into
  // place, never both softened into each other. The `y` slide itself
  // still eases smoothly — only opacity is a step function.
  const opacity = useTransform(progress, (p) => (eased(p) > 0 ? 1 : 0));
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
      {/* "Backed by" — the short, at-a-glance citation. The full
         bibliographic reference lives in a shared "References" list
         on the page itself (see page.tsx), not repeated here — this
         card is already tightly height-constrained. */}
      <p className="mt-3 border-t border-navy/10 pt-3 text-xs text-navy/60">
        Backed by: {card.backedBy}
      </p>
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
    // 300vh -> 380vh — the CARD_WINDOWS change above adds two genuine
    // settled-hold phases (0.32-0.58 and 0.72-1) that didn't exist
    // before; keeping the same 300vh total would have squeezed those
    // new pauses out of the SAME distance the reveals themselves need,
    // undercutting the very pacing fix those windows are for. 380vh
    // gives ~280vh of real pinned scroll distance across the full
    // sequence — still a hold-reveal-hold-reveal-hold shape, just with
    // real room for each phase rather than a compressed one.
    <div ref={wrapperRef} className={cn("relative", !reduceMotion && "h-[380vh]")}>
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

          {/* h-[380px] sm:h-[420px], not the previous h-[320px]/h-[360px]
             — each card gained a new "Backed by" line (see
             StackedResearchCard above); this container is what each
             card's own `absolute inset-0` sizes itself against, so it
             needs the same increase or the new line would overflow the
             card's own box rather than the container growing to fit it. */}
          <div className="relative h-[380px] sm:h-[420px]">
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
