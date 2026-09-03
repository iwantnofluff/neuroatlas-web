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
// "What It Reads" section from the copy doc (the three signals) — all
// three eventually appear TOGETHER and stay, each pinned to a fixed spot
// floating around the model rather than swapping in and out of one shared
// position. `position` is a real spot in the composition (see
// POSITION_CLASSNAMES), not a left/right side relative to the model.
const signals = [
  {
    label: "Heart Rate Variability",
    body: "Shows how your body is handling pressure, before you'd notice yourself.",
    range: [0, 0.34] as const,
    position: "upper-left" as const,
  },
  {
    label: "Breathing",
    body: "Small shifts that reveal tension building.",
    range: [0.33, 0.67] as const,
    position: "lower-right" as const,
  },
  {
    label: "Stress Load",
    body: "How pressure adds up across your day.",
    range: [0.66, 1] as const,
    position: "lower-left" as const,
  },
];

/** A signal's reveal — sits at 0 before `start`, animates across [start,
 *  end], then holds at 1 forever after, matching this codebase's
 *  established "reveal, don't cross-fade back out" convention (see
 *  MethodScrollCards' own useCardReveal) rather than a fade-in/fade-out
 *  carousel — once a signal has appeared it's part of the permanent
 *  composition. Function-transformer form of useTransform throughout,
 *  not the array-range form — this codebase hit a confirmed bug where
 *  the array form computes wrong values once a second scroll-linked
 *  transform exists on the same element (here: opacity AND y). */
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

/** xl+ only — floating glass cards positioned within the center/bottom
 *  band where the model itself lives (the canvas is confined to the
 *  bottom ~72% of the viewport — see BandScrollScene.tsx), not shoved to
 *  the extreme screen margins the way the previous version's callouts
 *  were. Percentage-based insets (not fixed left-6/right-6 edge values)
 *  are what actually reads as "floating around the model" rather than
 *  "pinned to the corners of the viewport". */
const POSITION_CLASSNAMES: Record<(typeof signals)[number]["position"], string> = {
  "upper-left": "left-[6%] top-[30%]",
  "lower-right": "right-[6%] bottom-[16%] text-right",
  "lower-left": "left-[6%] bottom-[30%]",
};

/** Premium floating UI card — glassmorphic (bg-white/5, backdrop-blur,
 *  a delicate border), no step-number eyebrow (removed per client
 *  feedback: "remove the step numbers entirely"). */
function OrganicSignalCallout({
  signal,
  progress,
  reduceMotion,
}: {
  signal: (typeof signals)[number];
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const { opacity, y } = useSignalReveal(progress, signal.range, reduceMotion);
  return (
    <motion.div
      style={{ opacity, y }}
      className={cn(
        "absolute z-10 hidden w-64 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md xl:block",
        POSITION_CLASSNAMES[signal.position]
      )}
    >
      <p className="font-serif text-2xl leading-snug text-cream">{signal.label}</p>
      <p className="mt-1 text-sm text-cream/70">{signal.body}</p>
    </motion.div>
  );
}

/** Below xl there's no room for floating cards — a compact, still-
 *  persistent (not swapping) stacked list instead, sitting above the
 *  bottom-left subtext/CTA. Same glass-card treatment, no step numbers,
 *  just a tighter footprint. */
function MobileSignalCard({
  signal,
  progress,
  reduceMotion,
}: {
  signal: (typeof signals)[number];
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const { opacity, y } = useSignalReveal(progress, signal.range, reduceMotion);
  return (
    <motion.div
      style={{ opacity, y }}
      className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-md"
    >
      <p className="font-serif text-base leading-snug text-cream">{signal.label}</p>
      <p className="mt-0.5 text-xs text-cream/70">{signal.body}</p>
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

        {/* Headline — top-anchored (was dead-center, which the model's
           deliberate overlap made illegible per client feedback), z-[-1]
           still (BEHIND the model — see BandScrollScene's z-0 canvas),
           so the model dominating the center/bottom band below can just
           graze its very bottom edge without ever covering the words
           themselves. top-16/xl:top-20 is a guaranteed floor under the
           fixed header, the same reasoning BandScrollShowcase's own
           original hero used before this redesign. */}
        <div className="pointer-events-none absolute inset-x-0 top-16 z-[-1] px-6 text-center xl:top-20">
          <p className="eyebrow">The NA·01 band</p>
          <h1 className="mt-4 font-serif text-5xl leading-[0.95] font-bold tracking-tight text-gold-soft sm:text-6xl md:text-7xl lg:text-8xl">
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

        {/* xl+: floating glass cards around the model. Below xl: a
           stacked list — see each component's own doc comment. */}
        {signals.map((s) => (
          <OrganicSignalCallout
            key={s.label}
            signal={s}
            progress={scrollYProgress}
            reduceMotion={reduceMotion}
          />
        ))}
        <div className="pointer-events-none absolute inset-x-6 bottom-44 z-10 flex flex-col gap-3 xl:hidden">
          {signals.map((s) => (
            <MobileSignalCard
              key={s.label}
              signal={s}
              progress={scrollYProgress}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>

        {/* Subtext + CTA — editorial bottom-LEFT placement (was
           dead-center), z-10, IN FRONT of the model. Kept as its own
           element rather than folded into the top headline block — if
           it lived there, the model's own overlap into that block could
           end up visually covering (and since a WebGL canvas isn't
           naturally click-through, potentially intercepting clicks on)
           the CTA button. Kept static, not tied to scroll progress —
           matching this hero's original always-visible-on-load
           treatment; only the signals and the model's own rotation are
           scroll-driven. */}
        <div className="absolute bottom-8 left-6 z-10 max-w-xs text-left sm:bottom-10 xl:left-10">
          <p className="text-base text-cream/75 sm:text-lg">
            Because knowing your stress is the first step to managing it.
          </p>
          <div className="mt-4 sm:mt-6">
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
