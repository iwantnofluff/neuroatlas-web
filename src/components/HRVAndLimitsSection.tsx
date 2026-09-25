"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { HRVSignalSection } from "@/components/HRVSignalSection";
import { LimitsOfWearablesSection } from "@/components/LimitsOfWearablesSection";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

// Three vertical S-curves, not one — a direct "not just one line, have
// some more in some more places, give it a nice design" request.
// PRIMARY is the true transpose of HRVSignalSection's own former
// horizontal wave (every x/y coordinate pair swapped, turning a
// left-to-right wave into a top-to-bottom one of the identical
// shape/character). SECONDARY and TERTIARY are new companion curves —
// a wider, offset phase and a subtle close wiggle respectively — same
// "two layers at different weights read as parallax depth" principle
// LivingSignalHero's own dual wave layers already use for this site's
// signal-wave motif, adapted here as three still (not looping) layers
// since this one draws in via scroll rather than animating forever.
const PRIMARY_WAVE_PATH =
  "M150,0 C150,100 50,100 50,200 C50,300 150,300 150,400 C150,500 30,500 30,600 C30,700 120,700 100,800";
const SECONDARY_WAVE_PATH =
  "M120,0 C170,60 170,140 120,200 C70,260 70,340 120,400 C170,460 170,540 120,600 C70,660 70,740 120,800";
const TERTIARY_WAVE_PATH =
  "M100,0 C112,100 88,100 100,200 C112,300 88,300 100,400 C112,500 88,500 100,600 C112,700 88,700 100,800";

/**
 * "The Signal That Does Not Lie" + "The Limits Of Wearables" — the
 * Champagne Gold line graph, drawn in via `pathLength` as the reader
 * scrolls, spans BOTH sections as one continuous vertical draw. That
 * means the two sections have to render as siblings inside one shared
 * wrapper (this component) so a single `useScroll` target can cover
 * both — LimitsOfWearablesSection itself is untouched, just composed
 * here instead of standing alone in page.tsx.
 *
 * offset ["start 85%", "end start"], not ["start end", "end start"] —
 * a real, confirmed bug the former produced: "start end" reaches
 * progress 0 the instant this (very tall, two-section-long) wrapper's
 * top is merely peeking at the very bottom edge of the viewport, long
 * before the heading is anywhere near readable. By the time "Your Body
 * Keeps Receipts." actually scrolls into a comfortable reading
 * position, a third or more of the total scroll range had already
 * elapsed, so the visible drawn segment sat well down in the gap
 * between the two sections instead of starting at the heading itself —
 * confirmed live via screenshot. "start 0.85" keeps that same
 * "coming into view" quality (progress is still 0, the line still
 * undrawn, while the wrapper is mostly off-screen below) but starts
 * counting once its top is 85% down the viewport — i.e. just as it
 * begins entering from the bottom — so the drawn line's own leading
 * edge stays right at the heading instead of racing ahead of it.
 * "end start" is unchanged — already correct, finishing the draw
 * exactly as "The Limits Of Wearables" finishes scrolling past.
 *
 * reduceMotion sets every pathLength to a constant 1 — the lines
 * already fully drawn, a complete state, rather than a permanently-
 * blank one.
 */
export function HRVAndLimitsSection() {
  const reduceMotion = useSafeReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start 85%", "end start"],
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
          d={TERTIARY_WAVE_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className="opacity-30"
          style={{ pathLength }}
        />
        <motion.path
          d={SECONDARY_WAVE_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-50"
          style={{ pathLength }}
        />
        <motion.path
          d={PRIMARY_WAVE_PATH}
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
