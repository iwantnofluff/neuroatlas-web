"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

// Placeholder research AREAS, not fabricated citations — real papers
// aren't sourced yet (see the page's own "Citations added as the
// research is published" line), so these stay at the honest level of
// "which field this maps to", echoing the same three pillars section 2
// covers rather than inventing specific studies/authors.
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

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function StackedResearchCard({
  progress,
  index,
  total,
  reduceMotion,
  card,
}: {
  progress: MotionValue<number>;
  index: number;
  total: number;
  reduceMotion: boolean;
  card: (typeof RESEARCH_CARDS)[number];
}) {
  const start = index / total;
  const end = (index + 0.7) / total;
  const eased = (p: number) => (reduceMotion ? 1 : clamp01((p - start) / (end - start)));
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
      <span className="text-xs font-medium tracking-[0.2em] text-gold-deep uppercase">
        {card.index}
      </span>
      <h3 className="mt-3 font-serif text-xl text-navy">{card.field}</h3>
      <p className="mt-3 text-sm text-mist">{card.note}</p>
    </motion.div>
  );
}

/**
 * "The Editorial Index" — a Swiss-style minimal split: plain text on
 * the left, a sticky stack of glassmorphic research cards on the
 * right, revealing one at a time (fading and sliding up into its
 * fanned resting position) as the reader scrolls through this
 * section's own h-[300vh] pinned track — the same "outer tall wrapper
 * + inner sticky viewport" pattern used throughout this codebase for a
 * scroll-driven reveal (see MethodScrollCards, OneSignalSection).
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
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={wrapperRef} className={cn("relative", !reduceMotion && "h-[300vh]")}>
      <div className="sticky top-0 flex min-h-[100svh] items-center bg-cream px-6 py-24 lg:px-10">
        <div className="mx-auto grid w-full max-w-6xl gap-16 lg:grid-cols-2 lg:items-center">
          <Reveal y={20}>
            <h2 className="font-serif text-3xl leading-tight text-navy lg:text-4xl">
              Peer-Reviewed, Not Promised
            </h2>
            <p className="mt-6 max-w-md text-lg text-mist">
              Every protocol maps to peer-reviewed research on autonomic
              regulation and nervous system training, not a single
              in-house study.
            </p>
            <p className="mt-4 max-w-md text-base italic text-mist/80">
              Citations added as the research is published.
            </p>
          </Reveal>

          <div className="relative h-[320px] sm:h-[360px]">
            {RESEARCH_CARDS.map((card, i) => (
              <StackedResearchCard
                key={card.field}
                progress={scrollYProgress}
                index={i}
                total={RESEARCH_CARDS.length}
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
