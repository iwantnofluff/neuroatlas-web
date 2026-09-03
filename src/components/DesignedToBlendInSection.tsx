"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/**
 * "Designed To Blend In" — "Mix-Blend Parallax": three tall glass panels
 * slide upward behind the pinned, centered headline at different speeds
 * (a classic parallax stagger) across this section's own h-[250vh]
 * pinned track, while the text itself carries `mix-blend-difference` +
 * white, so it dynamically inverts color depending on whichever panel
 * (or the flat navy background between them) happens to be passing
 * behind it at any given scroll moment.
 *
 * Stacking, not Framer Motion, is the actual risk here: mix-blend-mode
 * only blends against whatever is painted BEFORE it within the SAME
 * stacking context — an intermediate wrapper with its own z-index (a
 * new, but not necessarily isolated, stacking context) is exactly the
 * kind of thing that can make this unreliable across browsers. So the
 * three panels and the text block are kept as plain DOM SIBLINGS with
 * no z-index at all — the text is simply last in source order, which is
 * what puts it on top, and nothing between it and the panels creates an
 * isolation boundary.
 *
 * Each panel's own vertical parallax offset is a SEPARATE useTransform
 * (function-transformer form throughout — this codebase's established
 * defensive pattern, since the array-range form has a confirmed bug
 * once a second scroll-linked transform exists on the same element).
 * reduceMotion resolves each panel straight to y:0 (its settled,
 * centered position) rather than swapping prop shapes across renders —
 * the other confirmed failure mode, from Reveal.tsx's own history.
 */
type Panel = {
  className: string;
  /** Total vertical travel (px) across the full scroll range — varied
   *  per panel for the parallax stagger; sign controls direction. */
  speed: number;
};

const PANELS: Panel[] = [
  { className: "left-[10%] w-[20%]", speed: -140 },
  { className: "left-1/2 w-[24%] -translate-x-1/2", speed: -260 },
  { className: "right-[10%] w-[20%]", speed: -380 },
];

function useParallaxY(progress: MotionValue<number>, speed: number, reduceMotion: boolean) {
  return useTransform(progress, (p) => (reduceMotion ? 0 : speed * p));
}

function ParallaxPanel({
  panel,
  progress,
  reduceMotion,
}: {
  panel: Panel;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const y = useParallaxY(progress, panel.speed, reduceMotion);
  return (
    <motion.div
      aria-hidden="true"
      style={{ y }}
      className={cn(
        // h-[160%] + top-[-30%] — taller than the viewport and centered
        // with slack on both ends, so the parallax travel above never
        // exposes an empty gap at the top or bottom of the pinned frame.
        "absolute top-[-30%] h-[160%] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-md",
        panel.className
      )}
    />
  );
}

export function DesignedToBlendInSection() {
  const reduceMotion = useSafeReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={wrapperRef} className={cn(!reduceMotion && "h-[250vh]")}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-navy">
        {PANELS.map((panel, i) => (
          <ParallaxPanel
            key={i}
            panel={panel}
            progress={scrollYProgress}
            reduceMotion={reduceMotion}
          />
        ))}

        {/* No z-index, no wrapping wrapper with its own stacking context
           — see the component doc comment above for why that matters
           here specifically. mix-blend-difference + text-white via
           Tailwind utilities (not an inline style) is what actually
           lets this invert against whichever panel is currently behind
           it. */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center mix-blend-difference">
          <h2 className="font-serif text-3xl leading-tight text-white lg:text-4xl">
            Designed To Blend In
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white">
            Lightweight, screenless, and made to disappear into your day.
            Charges quickly, when it needs it.
          </p>
        </div>
      </div>
    </div>
  );
}
