"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { HRVSignalSection } from "@/components/HRVSignalSection";
import { LimitsOfWearablesSection } from "@/components/LimitsOfWearablesSection";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

// A true transpose of HRVSignalSection's own former horizontal wave
// ("M0,150 C100,150 100,50 200,50 C300,50 300,150 400,150 C500,150
// 500,30 600,30 C700,30 700,120 800,100", viewBox 800×200) — every
// x/y coordinate pair swapped, turning a left-to-right wave into a
// top-to-bottom one of the identical shape/character, per an explicit
// "just flip the previous design vertical" request, in a taller
// 200×800 viewBox to match.
const VERTICAL_WAVE_PATH =
  "M150,0 C150,100 50,100 50,200 C50,300 150,300 150,400 C150,500 30,500 30,600 C30,700 120,700 100,800";

/**
 * "The Signal That Does Not Lie" + "The Limits Of Wearables" — a
 * direct "I wanted the previous [drawing] design back, just flipped
 * vertical, and moving from 'Your Body Keeps Receipts' down to the
 * end of 'The Limits Of Wearables'" request: the Champagne Gold line
 * graph, drawn in via `pathLength` (not translated — see
 * HRVSignalSection.tsx's own git history for the vertical-translate
 * version this replaces) as the reader scrolls, now spans BOTH
 * sections as one continuous vertical draw rather than one section's
 * own short horizontal one. That means the two sections have to
 * render as siblings inside one shared wrapper (this component) so a
 * single `useScroll` target can cover both — LimitsOfWearablesSection
 * itself is untouched, just composed here instead of standing alone
 * in page.tsx.
 *
 * offset ["start end", "end start"] is this codebase's standard local-
 * scroll-progress mapping (see HRVSignalSection's own git history for
 * the full mechanics) — 0 the instant this wrapper's top reaches the
 * viewport's bottom, 1 the instant its bottom reaches the viewport's
 * top, so the line finishes drawing exactly as "The Limits Of
 * Wearables" finishes scrolling past, not before.
 *
 * reduceMotion sets pathLength to a constant 1 — the line already
 * fully drawn, a complete state, rather than a permanently-blank one.
 */
export function HRVAndLimitsSection() {
  const reduceMotion = useSafeReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start end", "end start"],
  });
  const pathLength = useTransform(scrollYProgress, (p) =>
    reduceMotion ? 1 : Math.min(1, Math.max(0, p * 1.15))
  );

  return (
    <div ref={wrapperRef} className="relative overflow-hidden bg-cream">
      <svg
        aria-hidden="true"
        viewBox="0 0 200 800"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-y-0 left-1/2 h-full w-40 -translate-x-1/2 text-gold sm:w-56"
      >
        <motion.path
          d={VERTICAL_WAVE_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ pathLength }}
        />
      </svg>

      <HRVSignalSection />
      <LimitsOfWearablesSection />
    </div>
  );
}
