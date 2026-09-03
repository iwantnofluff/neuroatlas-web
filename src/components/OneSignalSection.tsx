"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/**
 * "One Signal, Just Stress" — "Noise to Focus": the screen opens on a
 * scatter of abstract shapes standing in for generic fitness-app clutter
 * (step-count pills, a notification bubble, a soft graph line), which
 * dissolve — fading AND blurring further out of focus — as the user
 * scrolls through this section's own h-[250vh] pinned track, while the
 * headline and subtext sharpen into view at the center. A small gold dot
 * pulses beside the headline once settled, standing in for the one
 * signal (HRV) that's left once the noise is gone.
 *
 * Every noise shape gets its own independent opacity/blur transform
 * (function-transformer form of useTransform throughout — this
 * codebase's established defensive pattern, since the array-range form
 * has a confirmed bug once a second scroll-linked transform exists on
 * the same element, which IS the case here: opacity AND filter on the
 * same motion.div). Each shape's fade window is slightly staggered so
 * they dissolve organically rather than in lockstep. reduceMotion
 * resolves straight to the settled end state (noise fully gone,
 * headline/subtext fully visible) rather than swapping which props/
 * shapes get passed — the other confirmed failure mode, from
 * Reveal.tsx's own history.
 *
 * The pulsing dot is plain CSS (see .signal-pulse-dot in globals.css),
 * gated by prefers-reduced-motion the same way .hero-ambient-a/b and
 * .signal-mask-gradient already are — not React state, so it needs no
 * reduceMotion handling here at all.
 */
type NoiseShape = {
  className: string;
  range: readonly [number, number];
};

const NOISE_SHAPES: NoiseShape[] = [
  // Step-count pill, upper-left.
  { className: "left-[8%] top-[20%] h-10 w-40 rounded-full bg-mist/25 blur-sm md:left-[12%]", range: [0, 0.35] },
  // Notification bubble, upper-right.
  { className: "right-[10%] top-[16%] h-20 w-20 rounded-full bg-navy/10 blur-sm md:right-[14%]", range: [0.05, 0.4] },
  // Sleep-score pill, lower-right.
  { className: "right-[12%] bottom-[18%] h-9 w-32 rounded-full bg-gold-muted/25 blur-sm md:right-[16%]", range: [0.1, 0.45] },
  // Soft graph-line card, lower-left.
  { className: "left-[9%] bottom-[22%] h-16 w-44 rounded-2xl bg-mist/15 blur-[2px] md:left-[13%]", range: [0.08, 0.42] },
];

function useNoiseFade(progress: MotionValue<number>, range: readonly [number, number], reduceMotion: boolean) {
  const [start, end] = range;
  const eased = (p: number) => (p <= start ? 0 : p >= end ? 1 : (p - start) / (end - start));
  const opacity = useTransform(progress, (p) => (reduceMotion ? 0 : 1 - eased(p)));
  const filter = useTransform(progress, (p) => `blur(${reduceMotion ? 24 : 4 + 20 * eased(p)}px)`);
  return { opacity, filter };
}

function NoiseElement({
  shape,
  progress,
  reduceMotion,
}: {
  shape: NoiseShape;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const { opacity, filter } = useNoiseFade(progress, shape.range, reduceMotion);
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity, filter }}
      className={cn("pointer-events-none absolute", shape.className)}
    />
  );
}

/** Headline + subtext sharpen into view as the noise dissolves — the
 *  inverse timing of the noise shapes above, overlapping slightly for a
 *  smooth crossfade rather than a hard cut once the noise clears. */
function useFocusReveal(progress: MotionValue<number>, reduceMotion: boolean) {
  const eased = (p: number) => (reduceMotion ? 1 : p <= 0.25 ? 0 : p >= 0.65 ? 1 : (p - 0.25) / 0.4);
  const opacity = useTransform(progress, (p) => eased(p));
  const y = useTransform(progress, (p) => (reduceMotion ? 0 : 20 * (1 - eased(p))));
  const blur = useTransform(progress, (p) => `blur(${reduceMotion ? 0 : 8 * (1 - eased(p))}px)`);
  return { opacity, y, blur };
}

export function OneSignalSection() {
  const reduceMotion = useSafeReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const focus = useFocusReveal(scrollYProgress, reduceMotion);

  return (
    <div ref={wrapperRef} className={cn(!reduceMotion && "h-[250vh]")}>
      <div className="sticky top-0 flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-cream px-6 text-center">
        {NOISE_SHAPES.map((shape, i) => (
          <NoiseElement
            key={i}
            shape={shape}
            progress={scrollYProgress}
            reduceMotion={reduceMotion}
          />
        ))}

        <motion.div style={{ opacity: focus.opacity, y: focus.y, filter: focus.blur }}>
          <div className="mb-4 flex items-center justify-center gap-2.5">
            <span className="signal-pulse-dot size-2.5 rounded-full bg-gold" aria-hidden="true" />
            <span className="eyebrow text-navy/50">HRV, and nothing else</span>
          </div>
          <h2 className="font-serif text-4xl leading-tight text-navy sm:text-5xl lg:text-6xl">
            One Signal, Just Stress
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
            No step counts. No notifications. No sleep tracking. Just stress,
            read precisely, because that&rsquo;s the one signal that actually
            helps you.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
