"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/**
 * "Designed To Blend In" — "Expand & Snap": a cinematic container starts
 * as a thin horizontal letterbox slit at the center of the screen and
 * expands outward across this section's own h-[300vh] pinned track
 * until it fills the entire viewport, acting as a full-bleed cinematic
 * billboard behind the headline (which stays static and in front the
 * whole time, simply last in DOM so it paints on top — no z-index
 * needed). A premium glassmorphic/gradient fill stands in for the real
 * lifestyle photo until one is dropped in.
 *
 * clip-path is built as a SINGLE function-transformer useTransform that
 * returns the COMPLETE template string directly (inset(...% ...% ...%
 * ...% round ...px)), computed from plain lerp() math over four inset
 * values and a radius — rather than handing framer-motion two literal
 * clip-path strings and relying on its own generic string-interpolation
 * to mix between them. That generic path isn't a reliable fit for a
 * value packing several differently-unit-ed numbers (percentages AND a
 * trailing round-radius in px) into one template, so this sidesteps it
 * entirely: one MotionValue<string>, computed by us, every frame — the
 * same "compute the real value ourselves" defensiveness this codebase
 * already applies to its numeric scroll-linked transforms.
 *
 * reduceMotion resolves straight to the fully-expanded end state (a
 * full-bleed panel is a complete, meaningful composition on its own;
 * freezing on the thin starting slit would just look like a broken,
 * unfinished layout) rather than the array-range form or a prop-shape
 * swap — the two confirmed failure modes elsewhere in this codebase.
 */
const START_INSET = { top: 45, right: 10, bottom: 45, left: 10, radius: 24 };
const END_INSET = { top: 0, right: 0, bottom: 0, left: 0, radius: 0 };

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function DesignedToBlendInSection() {
  const reduceMotion = useSafeReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const clipPath = useTransform(scrollYProgress, (p) => {
    const t = reduceMotion ? 1 : Math.min(1, Math.max(0, p));
    const top = lerp(START_INSET.top, END_INSET.top, t);
    const right = lerp(START_INSET.right, END_INSET.right, t);
    const bottom = lerp(START_INSET.bottom, END_INSET.bottom, t);
    const left = lerp(START_INSET.left, END_INSET.left, t);
    const radius = lerp(START_INSET.radius, END_INSET.radius, t);
    return `inset(${top}% ${right}% ${bottom}% ${left}% round ${radius}px)`;
  });

  return (
    <div ref={wrapperRef} className={cn(!reduceMotion && "h-[300vh]")}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-navy">
        {/* The cinematic slit — glassmorphic + a deep gradient fill
           standing in for the real lifestyle photo ("for now until we
           drop a real image in"). Gradient direction/tones (navy-soft
           to navy, a faint gold sheen through the middle) are what read
           as "premium" rather than a flat placeholder box. */}
        <motion.div
          aria-hidden="true"
          style={{ clipPath }}
          className="absolute inset-0 border border-white/10 bg-gradient-to-br from-navy-soft via-navy to-navy-deep backdrop-blur-md"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,color-mix(in_oklab,var(--color-gold)_14%,transparent),transparent_70%)]"
          />
        </motion.div>

        {/* Headline — simply last in source order (no z-index needed
           to sit "on top of" the slit above it), perfectly centered. */}
        <div className="relative flex h-full flex-col items-center justify-center px-6 text-center">
          <h2 className="font-serif text-3xl leading-tight text-cream lg:text-4xl">
            Designed To Blend In
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-cream/75">
            Lightweight, screenless, and made to disappear into your day.
            Charges quickly, when it needs it.
          </p>
        </div>
      </div>
    </div>
  );
}
