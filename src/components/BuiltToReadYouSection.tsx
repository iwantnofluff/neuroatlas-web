"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { useIsMobile } from "@/lib/useIsMobile";
import { ShimmerLink } from "@/components/ui/shimmer-button";

// Replaces the previous "the-band" section (a plain two-column image+text
// block) with a cinematic, sticky-scroll WebGL moment — same headline/
// subtext copy, same /band destination for "Learn More", dramatically
// different presentation. Genuinely lazy: @react-three/fiber's Canvas is
// only pulled in client-side, never touched during the server render (the
// same split this codebase already uses for BandScrollScene/BandSignal).
const BuiltToReadYouScene = dynamic(
  () => import("@/components/BuiltToReadYouScene").then((m) => m.BuiltToReadYouScene),
  { ssr: false }
);

/** Headline opacity/scale, both driven by the SAME 0.3–0.6 scroll window —
 *  the function-transformer form of useTransform, not the array-range
 *  form. This codebase hit a confirmed framer-motion bug where the array
 *  form hands scroll-linked transforms off to a native
 *  `animation-timeline: scroll()` optimization that computes wrong
 *  values once a *second* scroll-linked transform exists on the same
 *  element — exactly this case (opacity AND scale on one element).
 *  reduceMotion resolves straight to the settled end-state rather than
 *  toggling which props are passed, since swapping prop shapes between
 *  renders is the OTHER documented failure mode here (an element can get
 *  permanently stuck mid-transition — see Reveal.tsx's own history). */
function useHeadlineMotion(progress: MotionValue<number>, reduceMotion: boolean) {
  const eased = (p: number) => (p <= 0.3 ? 0 : p >= 0.6 ? 1 : (p - 0.3) / 0.3);
  const opacity = useTransform(progress, (p) => (reduceMotion ? 1 : eased(p)));
  const scale = useTransform(progress, (p) => (reduceMotion ? 1 : 1.1 - 0.1 * eased(p)));
  return { opacity, scale };
}

/** Same reasoning as useHeadlineMotion, for the subtext + button's
 *  opacity/y over the 0.6–0.8 window. Holds fully visible for the rest
 *  of the scroll range past 0.8, matching this site's established
 *  "reveal, don't cross-fade back out" convention. */
function useSubtextMotion(progress: MotionValue<number>, reduceMotion: boolean) {
  const eased = (p: number) => (p <= 0.6 ? 0 : p >= 0.8 ? 1 : (p - 0.6) / 0.2);
  const opacity = useTransform(progress, (p) => (reduceMotion ? 1 : eased(p)));
  const y = useTransform(progress, (p) => (reduceMotion ? 0 : 20 * (1 - eased(p))));
  return { opacity, y };
}

export function BuiltToReadYouSection() {
  const reduceMotion = useSafeReducedMotion();
  const isMobile = useIsMobile();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const headline = useHeadlineMotion(scrollYProgress, reduceMotion);
  const subtext = useSubtextMotion(scrollYProgress, reduceMotion);

  return (
    <div
      id="the-band"
      ref={wrapperRef}
      className={cn(!reduceMotion && "h-[300vh]")}
    >
      {/* h-[100svh], not h-screen — see MethodScrollCards.tsx for the full
         explanation: `vh` assumes the browser's toolbar chrome is fully
         hidden, so a real phone's actual visible area can be shorter than
         100vh, clipping this pinned section's bottom against its own
         overflow-hidden. `svh` is the small/guaranteed-visible size. */}
      <div className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden bg-navy">
        {/* Behind the canvas (z-index -1) — still paints in front of the
            section's own bg-navy background (a negative z-index only
            drops a child below its NORMAL-flow/z-0+ siblings, not below
            its parent's own background). */}
        <motion.div
          style={{ opacity: headline.opacity, scale: headline.scale }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[-1] flex items-center justify-center px-6 text-center"
        >
          {/* Was text-6xl straight to sm:text-8xl — a 60px→96px jump right
             at the 640px breakpoint with no step between. Smoothed with
             an sm/md pair, and the mobile base itself trimmed slightly
             (was 6xl) to leave more room around the now-smaller (see
             Band.tsx's isMobile scale) module. */}
          <span className="font-sans text-5xl leading-[0.95] font-black tracking-tight text-cream uppercase sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem]">
            Built To
            <br />
            Read You
          </span>
        </motion.div>

        <BuiltToReadYouScene
          reduceMotion={reduceMotion}
          progress={scrollYProgress}
          isMobile={isMobile}
        />

        {/* In front of the canvas (z-index 10). */}
        <motion.div
          style={{ opacity: subtext.opacity, y: subtext.y }}
          className="absolute inset-x-0 bottom-14 z-10 mx-auto max-w-md px-6 text-center sm:bottom-20"
        >
          <p className="text-lg text-cream/80">
            A screenless band designed to read your stress, quietly and
            precisely, throughout your day.
          </p>
          <div className="mt-6 flex justify-center">
            <ShimmerLink
              href="/band"
              background="color-mix(in oklab, var(--color-cream) 30%, transparent)"
              shimmerColor="var(--color-cream)"
              className="px-6 py-3 text-sm tracking-wide text-cream"
            >
              Learn More
            </ShimmerLink>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
