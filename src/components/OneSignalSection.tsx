"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/**
 * "One Signal, Just Stress" — "Expand & Snap": the headline renders
 * enormous with a slow-shifting Champagne Gold / deep grey / pure white
 * gradient masked INSIDE its own glyphs (bg-clip-text text-transparent
 * over .signal-mask-gradient, see globals.css) — the gradient reads as
 * fluid liquid/light moving through the letters rather than a static
 * fill. Scrolling through this section's own h-[200vh] pinned track
 * scales the headline down from 1.5x to its resting size as it locks
 * into the center, with the supporting line fading in cleanly beneath
 * it once mostly settled.
 *
 * The gradient shift itself is plain CSS (background-position
 * keyframes, gated by prefers-reduced-motion the same way Hero.tsx's
 * own ambient placeholder is) — not React/framer-motion state, so this
 * component's reduceMotion handling never touches it at all.
 *
 * The scale/opacity VALUES below do need that handling: function-
 * transformer form of useTransform throughout (this codebase's
 * established defensive pattern, since the array-range form has a
 * confirmed bug once a second scroll-linked transform exists on the
 * same element), and reduceMotion is baked into what each value
 * COMPUTES (settling immediately at the resting scale / fully-visible
 * subtext) rather than swapping which props/shapes get passed to
 * motion.h2/p — the OTHER confirmed failure mode, from Reveal.tsx's
 * own history, where an element can get permanently stuck mid-
 * transition if its style prop's shape changes across renders.
 */
export function OneSignalSection() {
  const reduceMotion = useSafeReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // 1.5 -> 1.0 across the first ~55% of the pinned track, then holds —
  // "scales down... locking into the center".
  const scale = useTransform(scrollYProgress, (p) => {
    if (reduceMotion) return 1;
    const eased = p >= 0.55 ? 1 : p / 0.55;
    return 1.5 - 0.5 * eased;
  });

  // Subtext fades in once the headline is mostly settled (0.35-0.7),
  // then holds — matches this codebase's established "reveal, don't
  // cross-fade back out" convention (see MethodScrollCards' own
  // useCardReveal).
  const subtextEased = (p: number) =>
    reduceMotion ? 1 : p <= 0.35 ? 0 : p >= 0.7 ? 1 : (p - 0.35) / 0.35;
  const subtextOpacity = useTransform(scrollYProgress, (p) => subtextEased(p));
  const subtextY = useTransform(scrollYProgress, (p) => (reduceMotion ? 0 : 16 * (1 - subtextEased(p))));

  return (
    <div ref={wrapperRef} className={cn(!reduceMotion && "h-[200vh]")}>
      <div className="sticky top-0 flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-cream px-6 text-center">
        <motion.h2
          style={{ scale }}
          // clamp(), not a bare text-[12vw] — 12vw alone runs away to an
          // absurd size on an ultra-wide monitor and undersizes on the
          // narrowest phones. Same defensive pattern Hero.tsx's own
          // subtext already uses.
          className="signal-mask-gradient bg-clip-text text-[clamp(3rem,12vw,13rem)] leading-none font-black tracking-tighter text-transparent uppercase"
        >
          One Signal,
          <br />
          Just Stress
        </motion.h2>
        <motion.p
          style={{ opacity: subtextOpacity, y: subtextY }}
          className="mx-auto mt-8 max-w-xl text-lg text-mist"
        >
          No step counts. No notifications. No sleep tracking. Just stress,
          read precisely, because that&rsquo;s the one signal that actually
          helps you.
        </motion.p>
      </div>
    </div>
  );
}
