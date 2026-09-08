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

// Shared by the desktop sandwich AND the mobile stacked headline below —
// one className, both markups. leading-none + tracking-tighter (was
// leading-[0.95]/tracking-tight) — an editorial "monolithic, heavy"
// headline reads as one continuous mass of type, not two lines with
// visible internal breathing room; tighter tracking and a true 1-to-1
// line-height are what actually sell that at this size and weight.
//
// text-gold-soft, not text-cream — pure cream read as too stark/harsh
// against the Deep Navy at this size and weight per client feedback.
// gold-soft (#e5dac2) is an existing token in this site's own palette
// (see globals.css), a warmer champagne tint one step down from the
// gold hardware color itself — reusing it here (rather than a bespoke
// one-off hex) is what actually "echoes the gold hardware" the client
// asked for, and keeps this in the same token system as the rest of
// the site instead of introducing a color nothing else uses.
// xl:text-[10rem] is a FLAT cap — fine up through a normal laptop
// screen, but on anything wider (a real, confirmed complaint: a ~2000px
// viewport left visibly too much whitespace at both sides) the text
// just stops growing forever past that one fixed size, while the
// viewport itself keeps getting wider. 2xl: (1536px+) switches to a
// vw-based clamp so it keeps scaling with the viewport instead of
// flatlining — clamp's own floor (10rem) matches xl's own value almost
// exactly at the 1536px breakpoint itself (11vw ≈ 10.56rem there), so
// there's no visible jump at the breakpoint edge, just a smooth
// continuation; the 16rem ceiling is a sanity cap for genuinely
// ultra-wide displays, not a reintroduction of the same flat-cap bug.
const HEADLINE_TEXT_CLASSNAME =
  "font-sans text-5xl leading-none font-black tracking-tighter text-gold-soft uppercase sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] 2xl:text-[clamp(10rem,17vw,22rem)]";

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
        {/* Two structurally DIFFERENT layouts below md vs. at/above it —
           not the same markup nudged with a transform. A previous pass
           tried shifting the desktop "sandwich" up as one rigid unit on
           mobile (so the model still bridged both text halves), but the
           client called it out as still too compressed: with the model
           and both text halves squeezed toward the same center point,
           the space above the whole cluster still read as a big gap
           under the header. Splitting into two real layouts instead:
           mobile gets an ordinary top-anchored two-line headline (no
           split, no overlap, ordinary reading order) with the model
           free to occupy the untouched middle of the screen on its own,
           and subtext at the bottom; desktop keeps the split-open
           "sandwich" sandwich exactly as the client separately confirmed
           is "absolutely perfect", completely unmodified below other
           than gaining a `hidden md:flex`/`md:hidden` toggle against its
           mobile sibling. */}

        {/* MOBILE ONLY (< md) — ordinary stacked two-line headline,
           top-anchored below the fixed header (which measures ~73px;
           top-28 = 112px clears it with real breathing room), behind the
           canvas (z-[-1]) same as the desktop version, but with no split
           and no intentional model overlap — the model has the entire
           middle of the screen to itself here. */}
        <motion.div
          style={{ opacity: headline.opacity, scale: headline.scale }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-28 z-[-1] px-6 text-center md:hidden"
        >
          <span className={HEADLINE_TEXT_CLASSNAME}>Built To</span>
          <br />
          <span className={HEADLINE_TEXT_CLASSNAME}>Read You</span>
        </motion.div>

        {/* DESKTOP ONLY (>= md) — unchanged "sandwich": a flex-1 top half
           with the text pinned to ITS bottom edge (items-end) and a
           flex-1 bottom half pinned to ITS top edge (items-start). Both
           edges land on the exact same seam — the viewport's vertical
           center — so "Built To"/"Read You" sit back-to-back with no
           programmatic gap, reading as one monolithic headline that the
           model (see Band.tsx's MODEL_SCALE_DESKTOP) physically splits
           open by overlapping into both inner edges. Both rows share the
           SAME opacity/scale motion values (one scroll-driven fade+scale
           applied to two elements) rather than each computing its own —
           reusing an already-computed motion value across multiple
           elements is safe; it's a SECOND independent useTransform call
           on the SAME element that this codebase's array-transform bug
           actually depends on. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[-1] hidden flex-col md:flex"
        >
          <motion.div
            style={{ opacity: headline.opacity, scale: headline.scale }}
            className="flex flex-1 items-end justify-center px-6 text-center"
          >
            <span className={HEADLINE_TEXT_CLASSNAME}>Built To</span>
          </motion.div>
          <motion.div
            style={{ opacity: headline.opacity, scale: headline.scale }}
            className="flex flex-1 items-start justify-center px-6 text-center"
          >
            <span className={HEADLINE_TEXT_CLASSNAME}>Read You</span>
          </motion.div>
        </div>

        <BuiltToReadYouScene
          reduceMotion={reduceMotion}
          progress={scrollYProgress}
          isMobile={isMobile}
        />

        {/* In front of the canvas (z-index 10). text-gold-soft/70, not
            text-cream/80 — same softened tint as the headline above,
            but at a visibly lower opacity than its (fully solid)
            gold-soft so the subtext recedes a step behind the
            headline, a deliberate hierarchy rather than both reading
            at the same visual weight. */}
        <motion.div
          style={{ opacity: subtext.opacity, y: subtext.y }}
          className="absolute inset-x-0 bottom-14 z-10 mx-auto max-w-2xl px-6 text-center sm:bottom-20"
        >
          {/* max-w-md (448px) wrapped this to 3 lines, the last one just
             "day." on its own — an orphan, not a deliberate 2-line
             break. Widened close to the headline's own span (max-w-2xl,
             not full-bleed — text this size needs SOME line length cap
             to stay readable) and added text-balance so the browser
             distributes the words evenly across however many lines it
             takes, rather than greedily filling each line until the
             next word doesn't fit; at this width that's reliably 2
             even lines, never a dangling one.

             Deliberately text-balance, not text-pretty (the site-wide
             convention this typography pass otherwise uses for body
             copy) — this is a short, 2-line block much closer in
             length to a headline than a running paragraph, and
             text-balance's "even out every line" algorithm was already
             tested and confirmed to fix this exact orphan; switching it
             to text-pretty's lighter "just avoid a lone final word"
             heuristic for category-consistency alone risked undoing a
             verified fix for an unverified one. */}
          <p className="text-lg text-balance text-gold-soft/70">
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
