"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { useIsMobile } from "@/lib/useIsMobile";
import { ShimmerLink } from "@/components/ui/shimmer-button";

// Genuinely lazy — @react-three/fiber's Canvas is only pulled in once this
// resolves client-side, never touched during the server render. This file
// is already "use client", so ssr:false is allowed here (the constraint is
// specifically that it can't be called from a Server Component).
const BandScrollScene = dynamic(
  () => import("@/components/BandScrollScene").then((m) => m.BandScrollScene),
  { ssr: false }
);

// Doubles as both the page's hero (headline/supporting line/CTA) and the
// "What It Reads" section from the copy doc (the three signals) — but
// unlike the previous carousel-style version, all three eventually appear
// TOGETHER and stay, each pinned to a fixed spot scattered around the
// model rather than swapping in and out of one shared position. `position`
// is a real spot in the composition (see POSITION_CLASSNAMES), not a
// left/right side relative to the model.
const signals = [
  {
    label: "Heart Rate Variability",
    body: "Shows how your body is handling pressure, before you'd notice yourself.",
    range: [0, 0.34] as const,
    position: "top-left" as const,
  },
  {
    label: "Breathing",
    body: "Small shifts that reveal tension building.",
    range: [0.33, 0.67] as const,
    position: "bottom-right" as const,
  },
  {
    label: "Stress Load",
    body: "How pressure adds up across your day.",
    range: [0.66, 1] as const,
    position: "mid-left" as const,
  },
];

/** A signal's reveal — sits at 0 before `start`, animates across [start,
 *  end], then holds at 1 forever after, matching this codebase's
 *  established "reveal, don't cross-fade back out" convention (see
 *  MethodScrollCards' own useCardReveal) rather than the previous
 *  fade-in/fade-out-per-signal carousel behavior — once a signal has
 *  appeared it's part of the permanent composition, not a slide that
 *  gets swapped out for the next one. Function-transformer form of
 *  useTransform throughout, not the array-range form — this codebase hit
 *  a confirmed bug where the array form computes wrong values once a
 *  second scroll-linked transform exists on the same element (here:
 *  opacity AND y on the same motion.div). */
function useSignalReveal(
  progress: MotionValue<number>,
  range: readonly [number, number],
  reduceMotion: boolean
) {
  const [start, end] = range;
  const eased = (p: number) =>
    reduceMotion ? 1 : p <= start ? 0 : p >= end ? 1 : (p - start) / (end - start);
  const opacity = useTransform(progress, (p) => eased(p));
  const y = useTransform(progress, (p) => (reduceMotion ? 0 : 16 * (1 - eased(p))));
  return { opacity, y };
}

/** xl+ only — a real fixed spot in the composition, scattered around
 *  where the model sits at center, not relative to the model's own
 *  edges (there's no single "model edge" left to point at now that it
 *  tumbles continuously through multiple axes — see Band.tsx's
 *  SHOWCASE_POSE_KEYFRAMES). Insets are generous enough to clear both
 *  the centered headline and the bottom-anchored subtext/CTA strip. */
const POSITION_CLASSNAMES: Record<(typeof signals)[number]["position"], string> = {
  "top-left": "top-24 left-6 items-start text-left xl:left-12 2xl:left-20",
  "bottom-right": "bottom-28 right-6 items-end text-right xl:right-12 2xl:right-20",
  "mid-left": "top-1/2 left-6 -translate-y-1/2 items-start text-left xl:left-12 2xl:left-20",
};

function OrganicSignalCallout({
  signal,
  index,
  progress,
  reduceMotion,
}: {
  signal: (typeof signals)[number];
  index: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const { opacity, y } = useSignalReveal(progress, signal.range, reduceMotion);
  return (
    <motion.div
      style={{ opacity, y }}
      className={cn(
        "pointer-events-none absolute z-10 hidden w-64 flex-col gap-1 xl:flex",
        POSITION_CLASSNAMES[signal.position]
      )}
    >
      <span className="eyebrow">{`0${index + 1} / 0${signals.length}`}</span>
      <p className="font-serif text-2xl leading-snug text-cream">{signal.label}</p>
      <p className="text-sm text-cream/70">{signal.body}</p>
    </motion.div>
  );
}

/** Below xl there's no room for scattered corners — a compact, still-
 *  persistent (not swapping) stacked list instead, sitting between the
 *  (smaller) headline and the bottom CTA. */
function MobileSignalRow({
  signal,
  index,
  progress,
  reduceMotion,
}: {
  signal: (typeof signals)[number];
  index: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const { opacity, y } = useSignalReveal(progress, signal.range, reduceMotion);
  return (
    <motion.div style={{ opacity, y }} className="flex items-start gap-3 text-left">
      <span className="eyebrow mt-0.5 shrink-0">{`0${index + 1}`}</span>
      <div>
        <p className="font-serif text-base leading-snug text-cream">{signal.label}</p>
        <p className="mt-0.5 text-xs text-cream/70">{signal.body}</p>
      </div>
    </motion.div>
  );
}

export function BandScrollShowcase() {
  const reduceMotion = useSafeReducedMotion();
  const isMobile = useIsMobile();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={wrapperRef} className={cn(!reduceMotion && "h-[520vh]")}>
      {/* h-[100svh], not h-screen — see MethodScrollCards.tsx for the full
         explanation: `vh` assumes the browser's toolbar chrome is fully
         hidden, so a real phone's actual visible area can be shorter than
         100vh, clipping this pinned section's bottom against its own
         overflow-hidden. `svh` is the small/guaranteed-visible size. */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-navy">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_50%_45%,color-mix(in_oklab,var(--color-gold)_16%,transparent),transparent_70%)]"
        />

        {/* Centered text — z-[-1], BEHIND the model (see BandScrollScene's
           own z-0 canvas). This is the "grid-breaking centerpiece": the
           headline sits at the exact center of the pinned viewport, and
           the model (scaled way up, see BandScrollScene.tsx) is meant to
           physically overlap and obscure parts of it, the same
           text-behind/model-in-front layering BuiltToReadYouSection
           already established — not a bug to fix, the whole point. */}
        <div className="pointer-events-none absolute inset-0 z-[-1] flex flex-col items-center justify-center px-6 text-center">
          <p className="eyebrow">The NA·01 band</p>
          <h1 className="mt-6 font-serif text-6xl leading-[0.95] font-bold tracking-tight text-gold-soft sm:text-7xl md:text-8xl lg:text-9xl">
            The <em className="italic text-gold">First</em> Band
            <br />
            For Stress
          </h1>
        </div>

        <BandScrollScene
          reduceMotion={reduceMotion}
          progress={scrollYProgress}
          isMobile={isMobile}
        />

        {/* xl+: scattered around the model. Below xl: stacked list — see
           each component's own doc comment. */}
        {signals.map((s, i) => (
          <OrganicSignalCallout
            key={s.label}
            signal={s}
            index={i}
            progress={scrollYProgress}
            reduceMotion={reduceMotion}
          />
        ))}
        <div className="pointer-events-none absolute inset-x-6 bottom-40 z-10 flex flex-col gap-3 xl:hidden">
          {signals.map((s, i) => (
            <MobileSignalRow
              key={s.label}
              signal={s}
              index={i}
              progress={scrollYProgress}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>

        {/* Subtext + CTA — z-10, IN FRONT of the model, anchored to the
           true bottom edge and kept deliberately separate from the
           centered headline block above (not stacked directly beneath
           it in the same flow) — same reasoning as BuiltToReadYouSection:
           if this lived inside the z-[-1] centered block, the model
           overlapping that block could end up visually covering (and
           since a WebGL canvas isn't naturally click-through, potentially
           intercepting clicks on) the CTA button. Kept static — not tied
           to scroll progress — matching this hero's original always-
           visible-on-load treatment; only the signals and the model's
           own rotation are scroll-driven. */}
        <div className="absolute inset-x-0 bottom-8 z-10 mx-auto max-w-md px-6 text-center sm:bottom-10">
          <p className="text-base text-cream/75 sm:text-lg">
            Because knowing your stress is the first step to managing it.
          </p>
          <div className="mt-4 flex justify-center sm:mt-6">
            <ShimmerLink
              href="/request-access"
              background="color-mix(in oklab, var(--color-cream) 30%, transparent)"
              shimmerColor="var(--color-cream)"
              className="px-6 py-3 text-sm tracking-wide text-cream"
            >
              Request Access
            </ShimmerLink>
          </div>
        </div>
      </div>
    </div>
  );
}
