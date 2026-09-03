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

// Shared by both halves of the sandwich below — was one two-line <span>
// (see the "Split the Typography" note further down) with a single
// className; splitting it into two separate elements just means this
// needs to live in one place instead of being copy-pasted twice.
const HEADLINE_TEXT_CLASSNAME =
  "font-sans text-5xl leading-[0.95] font-black tracking-tight text-cream uppercase sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem]";

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
            its parent's own background).

            "Sandwich" layout: a full-bleed flex-col split into three EQUAL
            rows (flex-1 each, so every row is exactly ⅓ of the viewport
            regardless of screen size) rather than one two-line block
            centered as a single unit — the previous version put "Built
            To"/"Read You" together at dead-center, which left the entire
            top third empty and crammed both lines plus the model into
            the middle/lower-middle (confirmed live). Splitting them into
            their own rows pushes "Built To" up into the top third and
            "Read You" down into the bottom third, opening up the middle
            row as genuine empty space — which is exactly where the
            <Canvas> already renders the model (it's `!absolute inset-0`
            with its camera aimed at world origin, so it was always
            structurally dead-center; it just had no visual room to read
            that way before). The middle row itself renders nothing —
            it's pure spacing math, reserving that ⅓ so the two text rows
            land in the outer thirds instead of drifting back toward
            center. Both text rows share the SAME opacity/scale motion
            values (still one scroll-driven fade+scale, just applied to
            two elements instead of one) rather than each computing its
            own — reusing an already-computed motion value across
            multiple elements is safe; it's a SECOND independent
            useTransform call on the SAME element that this codebase's
            array-transform bug actually depends on. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[-1] flex flex-col"
        >
          <motion.div
            style={{ opacity: headline.opacity, scale: headline.scale }}
            className="flex flex-1 items-center justify-center px-6 text-center"
          >
            <span className={HEADLINE_TEXT_CLASSNAME}>Built To</span>
          </motion.div>
          {/* The middle spacer is intentionally NOT an equal flex-1 third
             — it only exists to keep "Built To"/"Read You" from drifting
             back toward the middle of the screen; the model itself is
             rendered by the <Canvas> below (full-bleed absolute, camera
             fixed at world origin), so it's already pinned to the exact
             viewport center regardless of what happens to this div. That
             decoupling is what leaves room to shrink this spacer (and
             grow the row below) without moving the model at all: an
             even 1/3 split left "Read You" (top-aligned in its own equal
             third) ending only 148px above the true bottom edge — 6px
             short of the independent subtext+button block's own ~154px
             footprint even at zero bottom offset, confirmed live as a
             direct overlap. Shrinking this middle share and handing the
             difference to the row below buys "Read You" enough headroom
             to clear the subtext with real breathing space. */}
          <div className="flex-[0.6]" />
          {/* items-start, not items-center — the independent subtext+
             button block (absolute bottom-14/20, below) needs real room
             beneath "Read You" before the true bottom edge; centering it
             within this row left the two directly overlapping (confirmed
             live). Top-aligning within this now-larger row is what
             reserves that gap. */}
          <motion.div
            style={{ opacity: headline.opacity, scale: headline.scale }}
            className="flex flex-[1.4] items-start justify-center px-6 text-center"
          >
            <span className={HEADLINE_TEXT_CLASSNAME}>Read You</span>
          </motion.div>
        </div>

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
