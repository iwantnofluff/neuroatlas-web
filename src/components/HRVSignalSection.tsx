"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

const WAVE_PATH =
  "M0,150 C100,150 100,50 200,50 C300,50 300,150 400,150 C500,150 500,30 600,30 C700,30 700,120 800,100";

/**
 * "The Signal That Does Not Lie" — a Champagne Gold line graph drifting
 * vertically across the section's background, tied to the reader's own
 * local scroll progress through the section (NOT a pinned/scroll-jacked
 * track — this scrolls normally) via useScroll + useTransform driving a
 * plain `y` translate on the whole SVG.
 *
 * A vertical drift, not the previous `pathLength` left-to-right draw —
 * a direct "the lines are moving horizontally, make them move
 * vertically instead" correction: `pathLength` reads as the curve
 * drawing itself in from the left edge, which is a horizontal motion
 * regardless of the wave's own shape. Translating the fully-drawn line
 * up as the reader scrolls down is what actually reads as vertical
 * movement.
 *
 * offset ["start end", "end start"] is this codebase's standard "local
 * scroll progress" mapping: 0 the instant the section's top reaches
 * the viewport's bottom (first pixel in view), 1 the instant its
 * bottom reaches the viewport's top (last pixel about to leave) — a
 * full traversal of the section, matching "as they scroll through the
 * section" literally rather than only some inner portion of it.
 *
 * reduceMotion holds y at 0 — the line sits at its own resting middle
 * position, a complete/settled state, rather than stuck at either
 * extreme of the drift.
 */
export function HRVSignalSection() {
  const reduceMotion = useSafeReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, (p) =>
    reduceMotion ? 0 : 64 * (Math.min(1, Math.max(0, p)) - 0.5)
  );

  return (
    <section
      ref={sectionRef}
      // py-16 md:py-24 lg:py-32 (was a flat py-24) — same progressive
      // step the homepage's own sections already use (see page.tsx).
      className="relative overflow-hidden bg-cream px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32"
    >
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
        style={{ y }}
        className="pointer-events-none absolute inset-x-0 top-1/2 h-40 w-full -translate-y-1/2 text-gold sm:h-56"
      >
        <path
          d={WAVE_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </motion.svg>

      <Reveal y={20} className="relative mx-auto max-w-3xl">
        <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight text-navy lg:text-4xl">
          Your Body Keeps Receipts.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-mist">
          You can tell yourself you&rsquo;re fine. Your nervous system may
          have other ideas. HRV is one of the quieter clues your body
          gives you. Viewed against your own baseline, it can reveal when
          your system is carrying more strain, or when it&rsquo;s
          finally getting the recovery it needs.
        </p>
      </Reveal>
    </section>
  );
}
