"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/**
 * "One Signal, Just Stress" — a cinematic text-mask moment. The headline
 * renders enormous with a slow-shifting gradient masked INSIDE its own
 * glyphs (bg-clip-text text-transparent over .signal-mask-gradient, see
 * globals.css), then eases down to a resting scale as the user scrolls
 * through this section's own h-[200vh] pinned track, with the supporting
 * line fading in beneath it once it's mostly settled.
 *
 * The gradient shift itself is plain CSS — background-position keyframes
 * gated by `prefers-reduced-motion`, the same convention Hero.tsx's own
 * ambient placeholder (.hero-ambient-a/b) already uses — not React/
 * framer-motion state, so none of this component's own reduceMotion
 * handling touches it at all; it's simply absent from the DOM's computed
 * style when the user has that preference set.
 *
 * The scale/opacity VALUES below do need that handling: function-
 * transformer form of useTransform throughout (this codebase's
 * established convention, since the array-range form has a confirmed
 * bug once a second scroll-linked transform exists on the same
 * element), and reduceMotion is baked into what each value COMPUTES
 * (settling immediately at the resting scale / fully-visible subtext)
 * rather than swapping which props/shapes get passed to motion.h2/p —
 * the OTHER confirmed failure mode, from Reveal.tsx's own history,
 * where an element can get permanently stuck mid-transition if its
 * style prop's shape changes across renders.
 */
export function OneSignalSection() {
  const reduceMotion = useSafeReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // 1.18 -> 1.0 across the first ~55% of the pinned track, then holds —
  // "scales down slightly to rest", not a dramatic zoom.
  const scale = useTransform(scrollYProgress, (p) => {
    if (reduceMotion) return 1;
    const eased = p >= 0.55 ? 1 : p / 0.55;
    return 1.18 - 0.18 * eased;
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
          // clamp(), not a bare text-[10vw] — 10vw alone runs away to an
          // absurd size on an ultra-wide monitor; a floor also keeps it
          // legible on the narrowest phones. Same defensive pattern
          // Hero.tsx's own subtext already uses.
          className="signal-mask-gradient bg-clip-text text-[clamp(2.75rem,10vw,11rem)] leading-none font-black tracking-tight text-transparent"
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
