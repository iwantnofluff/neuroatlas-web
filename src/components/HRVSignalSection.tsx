"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

const WAVE_PATH =
  "M0,150 C100,150 100,50 200,50 C300,50 300,150 400,150 C500,150 500,30 600,30 C700,30 700,120 800,100";

/**
 * "The Signal That Does Not Lie" — a Champagne Gold line graph drawn
 * across the section's background, tied to the reader's own local
 * scroll progress through the section (NOT a pinned/scroll-jacked
 * track — this scrolls normally) via useScroll + useTransform driving
 * an SVG <motion.path>'s `pathLength`. Framer-motion handles the
 * underlying stroke-dasharray/dashoffset math for `pathLength` itself
 * (0 = invisible, 1 = fully drawn) — no manual dash-array arithmetic
 * needed.
 *
 * offset ["start end", "end start"] is this codebase's standard "local
 * scroll progress" mapping: 0 the instant the section's top reaches
 * the viewport's bottom (first pixel in view), 1 the instant its
 * bottom reaches the viewport's top (last pixel about to leave) — a
 * full traversal of the section, matching "as they scroll through the
 * section" literally rather than only some inner portion of it.
 *
 * reduceMotion sets pathLength to a constant 1 — the line already
 * fully drawn, a complete state, rather than a permanently-blank one.
 */
export function HRVSignalSection() {
  const reduceMotion = useSafeReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const pathLength = useTransform(scrollYProgress, (p) =>
    reduceMotion ? 1 : Math.min(1, Math.max(0, p * 1.15))
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-cream px-6 py-24 text-center lg:px-10 lg:py-32"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-0 top-1/2 h-40 w-full -translate-y-1/2 text-gold sm:h-56"
      >
        <motion.path
          d={WAVE_PATH}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ pathLength }}
        />
      </svg>

      <Reveal y={20} className="relative mx-auto max-w-3xl">
        <h2 className="font-serif text-3xl leading-tight text-navy lg:text-4xl">
          The Signal That Does Not Lie
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
          Heart rate variability shows how well your nervous system is
          coping with pressure, in a way you cannot fake or talk yourself
          out of.
        </p>
      </Reveal>
    </section>
  );
}
