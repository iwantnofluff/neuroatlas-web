"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { TextLink } from "@/components/TextLink";

/**
 * "Signal vs. Noise" — replaces three separate, plainer pieces (the
 * static 2-photo grid, "Precision, Not Guesswork", "The App Reads You")
 * with one unified cinematic sequence across a single h-[400vh] pinned
 * track, in four beats:
 *
 * 1. NOISE (0–0.42): "Precision, Not Guesswork" sits locked, dead
 *    center, over navy — static from the very first frame, nothing to
 *    reveal here. Behind it, abstract chaotic lines + blurred orbs
 *    (standing in for bad data — caffeine, workouts) drift past at
 *    independent parallax speeds, each fading out on its own slightly
 *    staggered window within this range.
 * 2. FILTER (0.30–0.45): a sharp Champagne Gold line scaleX's in below
 *    the text as the noise finishes dissolving — the "true, filtered
 *    baseline" the copy describes.
 * 3. WIPE (0.48–0.76): that line scaleY's up from a thin bar into a
 *    full-viewport-covering wipe, holds there briefly, then fades out —
 *    a real transition, not just a decoration. The OLD scene (navy +
 *    "Precision…" + noise) and NEW scene (cream + "The App Reads You")
 *    swap opacity in a narrow window fully contained inside the moment
 *    the gold is opaque and covering everything, so the swap itself is
 *    invisible; the section's own background color swaps the same way.
 * 4. APP REVEAL (0.78–0.95): a premium app-UI placeholder glides up
 *    into its resting position behind the new copy, holding there
 *    through the rest of the scroll.
 *
 * Every value below is computed via the function-transformer form of
 * useTransform (this codebase's established defensive pattern — the
 * array-range form has a confirmed bug once a second scroll-linked
 * transform exists on the same element, which is the case throughout
 * this component: opacity AND y/scale share elements everywhere here).
 * reduceMotion resolves every single value straight to its Beat 4
 * settled state (cream background, "The App Reads You" in place, app
 * card resting, gold/noise fully gone) rather than swapping which
 * props/shapes get passed — the OTHER confirmed failure mode, from
 * Reveal.tsx's own history, where an element can get permanently stuck
 * mid-transition if its style prop's shape changes across renders.
 */

// --- Beat timing (all as fractions of the full 0-1 scroll range) -----
const NOISE_FADE_START = 0.22;
const NOISE_FADE_END = 0.42;
const GOLD_LINE_SCALEX_START = 0.3;
const GOLD_LINE_SCALEX_END = 0.45;
const WIPE_GROW_START = 0.48;
const WIPE_GROW_END = 0.6;
const SCENE_SWAP_START = 0.59;
const SCENE_SWAP_END = 0.61;
const WIPE_FADE_START = 0.66;
const WIPE_FADE_END = 0.76;
const APP_CARD_START = 0.78;
const APP_CARD_END = 0.95;

function clamp01(p: number) {
  return Math.min(1, Math.max(0, p));
}

function easeWindow(p: number, start: number, end: number) {
  return p <= start ? 0 : p >= end ? 1 : (p - start) / (end - start);
}

type NoiseShape = {
  kind: "line" | "orb";
  className: string;
  /** Parallax speed (px of total travel across the noise window) and a
   *  slight per-element stagger on the fade-out window, so the noise
   *  dissolves organically rather than in lockstep. */
  speed: number;
  fadeOffset: number;
};

const NOISE_SHAPES: NoiseShape[] = [
  { kind: "line", className: "left-[12%] top-[22%] w-40 rotate-[18deg] bg-cream/25", speed: 60, fadeOffset: 0 },
  { kind: "line", className: "right-[16%] top-[30%] w-56 -rotate-[12deg] bg-cream/15", speed: -90, fadeOffset: 0.03 },
  { kind: "line", className: "left-[20%] bottom-[26%] w-32 rotate-[6deg] bg-gold/25", speed: 50, fadeOffset: 0.05 },
  { kind: "line", className: "right-[10%] bottom-[18%] w-48 -rotate-[20deg] bg-cream/20", speed: -70, fadeOffset: 0.02 },
  { kind: "orb", className: "left-[6%] top-[15%] size-72 bg-gold/20", speed: 40, fadeOffset: 0 },
  { kind: "orb", className: "right-[8%] top-[45%] size-80 bg-cream/10", speed: -55, fadeOffset: 0.04 },
  { kind: "orb", className: "left-[18%] bottom-[10%] size-64 bg-mist/20", speed: 65, fadeOffset: 0.06 },
];

function useNoiseTransform(
  progress: MotionValue<number>,
  shape: NoiseShape,
  reduceMotion: boolean
) {
  const fadeStart = NOISE_FADE_START + shape.fadeOffset;
  const fadeEnd = Math.min(NOISE_FADE_END + shape.fadeOffset, 0.5);
  const opacity = useTransform(progress, (p) => (reduceMotion ? 0 : 1 - easeWindow(p, fadeStart, fadeEnd)));
  const y = useTransform(progress, (p) => (reduceMotion ? 0 : -shape.speed * clamp01(p / NOISE_FADE_END)));
  return { opacity, y };
}

function NoiseElement({
  shape,
  progress,
  reduceMotion,
}: {
  shape: NoiseShape;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const { opacity, y } = useNoiseTransform(progress, shape, reduceMotion);
  return (
    <motion.div
      aria-hidden="true"
      style={{ opacity, y }}
      className={cn(
        "pointer-events-none absolute",
        shape.kind === "line" ? "h-px" : "rounded-full blur-3xl",
        shape.className
      )}
    />
  );
}

export function SignalVsNoiseSection() {
  const reduceMotion = useSafeReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // Beat 2 — the filtered-baseline line growing in horizontally.
  const goldScaleX = useTransform(scrollYProgress, (p) =>
    reduceMotion ? 1 : easeWindow(p, GOLD_LINE_SCALEX_START, GOLD_LINE_SCALEX_END)
  );

  // Beat 3 — that same line growing vertically into a full-screen wipe,
  // then fading out once the scene underneath has swapped. The scaleY
  // target is computed from the real viewport height at call time (this
  // only ever runs client-side, after scroll starts) rather than a
  // guessed constant, so the bar reliably over-covers any screen size —
  // a thin h-1 (4px) bar needs roughly (viewport height / 4) scaleY to
  // fully cover it, with a safety margin on top.
  const goldScaleY = useTransform(scrollYProgress, (p) => {
    if (reduceMotion) return 1;
    const grow = easeWindow(p, WIPE_GROW_START, WIPE_GROW_END);
    const maxScale = typeof window !== "undefined" ? (window.innerHeight / 4) * 1.5 : 400;
    return 1 + (maxScale - 1) * grow;
  });
  const goldOpacity = useTransform(scrollYProgress, (p) =>
    reduceMotion ? 0 : 1 - easeWindow(p, WIPE_FADE_START, WIPE_FADE_END)
  );

  // Beat 3 — the old/new scene swap, timed to sit fully inside the
  // window where the gold wipe is opaque and covering the whole screen
  // (WIPE_GROW_END through WIPE_FADE_START), so the swap itself is
  // never actually visible.
  const oldSceneOpacity = useTransform(scrollYProgress, (p) =>
    reduceMotion ? 0 : 1 - easeWindow(p, SCENE_SWAP_START, SCENE_SWAP_END)
  );
  const newSceneOpacity = useTransform(scrollYProgress, (p) =>
    reduceMotion ? 1 : easeWindow(p, SCENE_SWAP_START, SCENE_SWAP_END)
  );
  const backgroundColor = useTransform(scrollYProgress, (p) => {
    const swapped = reduceMotion || p >= (SCENE_SWAP_START + SCENE_SWAP_END) / 2;
    return swapped ? "#f4f0e9" : "#0b1016";
  });

  // Beat 4 — the app-UI placeholder gliding up into its resting spot.
  const appEased = (p: number) => (reduceMotion ? 1 : easeWindow(p, APP_CARD_START, APP_CARD_END));
  const appOpacity = useTransform(scrollYProgress, (p) => appEased(p));
  const appY = useTransform(scrollYProgress, (p) => (reduceMotion ? 0 : 120 * (1 - appEased(p))));

  return (
    <div ref={wrapperRef} className={cn(!reduceMotion && "h-[400vh]")}>
      <motion.div
        style={{ backgroundColor }}
        className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden px-6 text-center"
      >
        {/* OLD scene — Beat 1/2: "Precision, Not Guesswork" locked dead
           center over navy, with the chaotic noise drifting behind it. */}
        <motion.div
          style={{ opacity: oldSceneOpacity }}
          className="pointer-events-none absolute inset-0"
        >
          {NOISE_SHAPES.map((shape, i) => (
            <NoiseElement key={i} shape={shape} progress={scrollYProgress} reduceMotion={reduceMotion} />
          ))}
          <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
            <h2 className="font-serif text-3xl leading-tight text-cream lg:text-4xl">
              Precision, Not Guesswork
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-cream/75">
              Every reading is checked against your own resting baseline, not
              a general average, then filtered to separate real stress from
              caffeine, a workout, or the cold. What shows up on your
              dashboard is your signal, not noise.
            </p>
          </div>
        </motion.div>

        {/* NEW scene — Beat 3/4: "The App Reads You" over cream, with
           the app-UI placeholder resting behind/below it. */}
        <motion.div
          style={{ opacity: newSceneOpacity }}
          // pt-20, not just centering slack — a guaranteed floor under
          // the fixed header, same convention BandScrollShowcase's own
          // hero uses. Without it, this stack's combined height (text +
          // gap + app card) centered via justify-center alone left only
          // ~53px of slack against a 73px header on a 1440x900 desktop
          // viewport — confirmed live, the heading rendered ~20px behind
          // the header. gap-6 (was gap-8) and the app card's own trimmed
          // sizes below reclaim the rest of that budget.
          className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 pt-20 text-center"
        >
          <div>
            <h2 className="font-serif text-3xl leading-tight text-navy lg:text-4xl">
              The App Reads You
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
              The band reads your signals. The app turns them into something
              you can act on.
            </p>
            <div className="flex justify-center">
              <TextLink href="/inside-the-app">Learn More</TextLink>
            </div>
          </div>

          {/* Beat 4 — premium app-UI placeholder. */}
          <motion.div
            style={{ opacity: appOpacity, y: appY }}
            className="h-[260px] w-[164px] rounded-[32px] border border-black/5 bg-white shadow-2xl sm:h-[340px] sm:w-[216px] lg:h-[480px] lg:w-[256px] lg:rounded-[40px]"
          >
            <div className="mx-auto mt-3 h-1.5 w-24 rounded-full bg-black/10 lg:mt-4" />
          </motion.div>
        </motion.div>

        {/* Beats 2 & 3 — ONE single bar, not two: base width is already
           w-full (full viewport width) — Beat 2's scaleX 0->1 reads as
           the line drawing itself across the screen edge to edge
           ("directly below the text"), rather than a short underline,
           which conveniently means it's ALREADY full-width by the time
           Beat 3 needs it to be (scaling X further would be redundant —
           only scaleY needs to grow from here to cover the full
           viewport). Its vertical anchor (top-[70%], just past where
           the centered headline/subtext block's own visual bottom edge
           naturally sits) is a deliberate compromise between "reads as
           below the text" for Beat 2 and "a stable origin to scale up
           from" for Beat 3 — transform-origin stays fixed at that 58%
           point as scaleY grows, so it's not perfectly symmetric around
           the true 50% viewport center, but goldScaleY's own generous
           overshoot margin (1.5x the minimum needed) makes that slight
           offset imperceptible once it's covering the full screen
           regardless. z-10 keeps it above both scenes while it's doing
           its job. */}
        <motion.div
          aria-hidden="true"
          style={{ scaleX: goldScaleX, scaleY: goldScaleY, opacity: goldOpacity }}
          className="pointer-events-none absolute inset-x-0 top-[70%] z-10 h-1 w-full origin-center bg-gold"
        />
      </motion.div>
    </div>
  );
}
