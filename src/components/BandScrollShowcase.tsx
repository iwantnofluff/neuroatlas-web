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
import { ShimmerLink } from "@/components/ui/shimmer-button";

// Genuinely lazy — @react-three/fiber's Canvas is only pulled in once this
// resolves client-side, never touched during the server render. This file
// is already "use client", so ssr:false is allowed here (the constraint is
// specifically that it can't be called from a Server Component).
const BandScrollScene = dynamic(
  () => import("@/components/BandScrollScene").then((m) => m.BandScrollScene),
  { ssr: false }
);

// Doubles as both the page's hero (headline/supporting line/CTA, static
// above) and the "What It Reads" section from the copy doc (the three
// signals that cycle in as you scroll, each pointing out from the centered
// model with a thin leader line, alternating sides). `side` drives which
// edge of the model each signal's callout renders on.
const signals = [
  {
    label: "Heart Rate Variability",
    body: "Shows how your body is handling pressure, before you'd notice yourself.",
    range: [0, 0.34] as const,
    side: "left" as const,
  },
  {
    label: "Breathing",
    body: "Small shifts that reveal tension building.",
    range: [0.33, 0.67] as const,
    side: "right" as const,
  },
  {
    label: "Stress Load",
    body: "How pressure adds up across your day.",
    range: [0.66, 1] as const,
    side: "left" as const,
  },
];

/** Shared fade-in/out curve for a signal's active window — one value drives
 *  both the callout's opacity and its leader line's length. */
function useSignalFade(progress: MotionValue<number>, range: readonly [number, number]) {
  const [start, end] = range;
  const mid = (start + end) / 2;
  const fadeIn = Math.max(start, mid - 0.08);
  const fadeOut = Math.min(end, mid + 0.08);
  return useTransform(progress, [start, fadeIn, fadeOut, end], [0, 1, 1, 0]);
}

/** Desktop-only (xl+): a thin line pointing out from the centered model's
 *  edge to the signal's label, on whichever side it's assigned. Positioned
 *  absolutely relative to the model's own wrapper so "right-full"/"left-full"
 *  land exactly at the model's edges regardless of container width. */
function SignalCallout({
  signal,
  index,
  progress,
}: {
  signal: (typeof signals)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const fade = useSignalFade(progress, signal.range);
  const isLeft = signal.side === "left";

  const text = (
    <div className={isLeft ? "text-right" : "text-left"}>
      <span className="eyebrow">{`0${index + 1} / 0${signals.length}`}</span>
      <p className="mt-2 font-serif text-2xl leading-snug text-cream">
        {signal.label}
      </p>
      <p className="mt-1 text-sm text-cream/70">{signal.body}</p>
    </div>
  );
  const line = (
    <motion.span
      style={{ scaleX: fade }}
      className={cn(
        "h-px w-12 shrink-0 bg-gold/70",
        isLeft ? "origin-right" : "origin-left"
      )}
    />
  );

  return (
    <motion.div
      style={{ opacity: fade }}
      className={cn(
        "pointer-events-none absolute top-1/2 hidden w-48 -translate-y-1/2 items-center gap-3 xl:flex",
        isLeft ? "right-full" : "left-full"
      )}
    >
      {isLeft ? (
        <>
          {text}
          {line}
        </>
      ) : (
        <>
          {line}
          {text}
        </>
      )}
    </motion.div>
  );
}

/** Below xl, there's no room for side callouts — the active signal's text
 *  appears in a simple stacked panel under the model instead. */
function SignalMobilePanel({
  signal,
  index,
  progress,
}: {
  signal: (typeof signals)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const fade = useSignalFade(progress, signal.range);
  const [start, end] = signal.range;
  const mid = (start + end) / 2;
  const fadeIn = Math.max(start, mid - 0.08);
  const y = useTransform(progress, [start, fadeIn], [12, 0]);

  return (
    <motion.div
      style={{ opacity: fade, y }}
      className="absolute inset-0 flex flex-col items-center text-center"
    >
      <span className="eyebrow">{`0${index + 1} / 0${signals.length}`}</span>
      <p className="mt-2 font-serif text-xl leading-snug text-cream">
        {signal.label}
      </p>
      <p className="mt-1 max-w-xs text-sm text-cream/70">{signal.body}</p>
    </motion.div>
  );
}

function ProgressDot({
  range,
  progress,
}: {
  range: readonly [number, number];
  progress: MotionValue<number>;
}) {
  const [start, end] = range;
  const opacity = useTransform(
    progress,
    [start, (start + end) / 2, end],
    [0.25, 1, 0.25]
  );
  return (
    <motion.span
      style={{ opacity }}
      className="h-1 w-8 rounded-full bg-gold"
    />
  );
}

function ProgressDots({ progress }: { progress: MotionValue<number> }) {
  return (
    <div className="flex gap-2">
      {signals.map((s) => (
        <ProgressDot key={s.label} range={s.range} progress={progress} />
      ))}
    </div>
  );
}

export function BandScrollShowcase() {
  const reduceMotion = useSafeReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  return (
    <div
      ref={wrapperRef}
      className={cn(!reduceMotion && "h-[520vh]")}
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-navy">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_50%_45%,color-mix(in_oklab,var(--color-gold)_16%,transparent),transparent_70%)]"
        />
        {/* pt-28/pt-24 is a guaranteed floor under the fixed header, not
            just a rough average from vertical centering — the eyebrow/
            headline previously sat close enough to the header's own
            "NeuroAtlas" wordmark to read as duplicated/overlapping. */}
        {/* One tree, not two — a second mounted BandScrollScene would mean
            a second live WebGL context running behind the scenes just to
            sit CSS-hidden, so only the TEXT differs by breakpoint (cheap to
            duplicate); the model, its callouts, and the progress dots are
            each a single instance whose position/size responds via
            Tailwind breakpoints instead of being remounted. */}
        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-6 pt-28 pb-10 lg:px-10 lg:pt-24">
          {/* Below xl: simple stacked hero. */}
          <div className="text-center xl:hidden">
            <p className="eyebrow">The NA·01 band</p>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-cream lg:text-5xl">
              The <em className="italic text-gold">First</em> Band For Stress
            </h1>
            <p className="mx-auto mt-4 max-w-md text-lg text-cream/75">
              Because knowing your stress is the first step to managing it.
            </p>
            <div className="mt-6 flex justify-center">
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

          {/* xl+: one composed scene instead of stacked rows — headline and
              CTA anchored into the empty corners around the ring (a circle
              inscribed in a square naturally leaves its corners clear)
              instead of sitting in their own row above the model.
              Absolutely positioned elements are placed relative to their
              containing block's padding box, which ignores that block's
              own pt-28/pb-10 — so these use explicit top-28/bottom-10
              offsets (matching that padding's intent) rather than small
              values that assumed the padding would apply and landed the
              headline back under the fixed header. */}
          <div className="absolute top-28 left-6 hidden max-w-[300px] xl:block">
            <p className="eyebrow">The NA·01 band</p>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-cream 2xl:text-5xl">
              The <em className="italic text-gold">First</em> Band For Stress
            </h1>
          </div>
          <div className="absolute bottom-10 left-6 hidden max-w-[280px] xl:block">
            <p className="text-lg text-cream/75">
              Because knowing your stress is the first step to managing it.
            </p>
            <div className="mt-6">
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

          {/* The model — normal flow (centered under the text) below xl,
              absolutely centered over the whole scene at xl+. xl:max-w-none
              clears the below-xl max-w cap, which otherwise still applies
              at xl+ (max-width always wins over an explicit width) and was
              clamping this to 280px wide despite xl:w-[440px]. xl:m-auto
              alone (no xl:mt-0) resets margin-top away from mt-10/lg:mt-12
              AND centers the fixed-height box within inset-0 — adding
              xl:mt-0 here previously set margin-top:0 explicitly, which
              beat margin-top:auto and pinned the model to the very top. */}
          <div className="relative mx-auto mt-10 aspect-square w-full max-w-[280px] sm:max-w-xs lg:mt-12 lg:max-w-sm xl:absolute xl:inset-0 xl:m-auto xl:h-[440px] xl:w-[440px] xl:max-w-none 2xl:h-[520px] 2xl:w-[520px]">
            <BandScrollScene
              reduceMotion={reduceMotion}
              progress={scrollYProgress}
            />
            {signals.map((s, i) => (
              <SignalCallout
                key={s.label}
                signal={s}
                index={i}
                progress={scrollYProgress}
              />
            ))}
          </div>

          {/* Below xl only: the active signal's text, stacked under the
              model (there's no room for side callouts at these widths). */}
          <div className="relative mx-auto mt-6 h-24 w-full max-w-xs xl:hidden">
            {signals.map((s, i) => (
              <SignalMobilePanel
                key={s.label}
                signal={s}
                index={i}
                progress={scrollYProgress}
              />
            ))}
          </div>

          <div className="mt-8 flex justify-center xl:absolute xl:inset-x-0 xl:bottom-6 xl:mt-0">
            <ProgressDots progress={scrollYProgress} />
          </div>
        </div>
      </div>
    </div>
  );
}
