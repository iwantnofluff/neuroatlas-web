"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { useIsMobile } from "@/lib/useIsMobile";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { STEP_COUNT, moduleStopScreenFraction } from "@/lib/howToGetStartedProgress";

// Genuinely lazy — @react-three/fiber's Canvas is only pulled in once this
// resolves client-side, never touched during the server render.
const HowToGetStartedScene = dynamic(
  () => import("@/components/HowToGetStartedScene").then((m) => m.HowToGetStartedScene),
  { ssr: false }
);

type Step = { label: string; body: string };

const STEPS: Step[] = [
  { label: "Scope", body: "Agree the team, the size, and the timeline together." },
  {
    label: "Onboard",
    body: "Your team gets a guided rollout, manager resources, and a dedicated point of contact throughout.",
  },
  {
    label: "Measure",
    body: "The group uses NeuroAtlas through the pilot period, with a baseline reading at the start.",
  },
  { label: "Review", body: "An outcome report shows the shift, and where to take it next." },
];

if (STEPS.length !== STEP_COUNT) {
  throw new Error(
    "STEPS.length must match STEP_COUNT (howToGetStartedProgress.ts) — the module's travel stops and the step text windows are both built against that one shared constant."
  );
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

/** Each step's own reveal window covers 70% of its even quarter-share of
 *  the track (leaving a 30% gap before the next step's window opens) —
 *  the "comes into focus, previous recedes" behavior, built on the same
 *  quarter boundaries `activeStepIndex` uses for the module, so the
 *  module arrives at a step's stop at the same moment that step's text
 *  begins revealing. */
function windowFor(index: number, total: number) {
  const start = index / total;
  const end = start + (1 / total) * 0.7;
  return { start, end };
}

/** The opacity/y reveal used by every step, on both the desktop
 *  alternating layout and the mobile stacked fallback — kept as one hook
 *  so the two presentations can't quietly diverge in how a step comes
 *  into focus. */
function useStepReveal(progress: MotionValue<number>, index: number, reduceMotion: boolean) {
  const { start, end } = windowFor(index, STEPS.length);
  const eased = (p: number) => (reduceMotion ? 1 : clamp01((p - start) / (end - start)));
  const opacity = useTransform(progress, (p) => 0.35 + 0.65 * eased(p));
  const y = useTransform(progress, (p) => (reduceMotion ? 0 : 16 * (1 - eased(p))));
  return { opacity, y };
}

function StepContent({ index, step, side }: { index: number; step: Step; side?: "left" | "right" }) {
  return (
    <div
      className={
        side === "left"
          ? "ml-auto max-w-md text-right"
          : side === "right"
            ? "max-w-md text-left"
            : undefined
      }
    >
      <span className="eyebrow">{`0${index + 1}`}</span>
      <h3 className="mt-3 text-balance font-serif font-normal uppercase tracking-normal text-2xl text-navy lg:text-3xl">
        {step.label}
      </h3>
      <p className="mt-4 text-pretty text-lg text-mist">{step.body}</p>
    </div>
  );
}

/** Mobile / plain-stacked fallback only — normal document flow, each
 *  step spaced by its own vertical padding as it scrolls past. */
function TimelineStep({
  progress,
  index,
  step,
  reduceMotion,
}: {
  progress: MotionValue<number>;
  index: number;
  step: Step;
  reduceMotion: boolean;
}) {
  const { opacity, y } = useStepReveal(progress, index, reduceMotion);
  return (
    <motion.div style={{ opacity, y }} className="py-16 first:pt-0 last:pb-0 md:py-32">
      <StepContent index={index} step={step} />
    </motion.div>
  );
}

/** Desktop only — one step, fixed at the exact screen height its stop
 *  puts the module at (moduleStopScreenFraction, the same shared
 *  geometry HowToGetStartedScene.tsx's camera framing is built against),
 *  flanking the centred spine on alternating sides. The static
 *  centring transform (-translate-y-1/2) lives on this plain outer div;
 *  the reveal's own opacity/y motion values live on the inner
 *  motion.div — kept on two separate elements because framer-motion
 *  composes x/y/scale into ONE transform itself and doesn't merge in a
 *  separately-authored `transform` string, so a static translateY(-50%)
 *  and an animated y can't safely share one motion.div. */
function AlternatingStep({
  progress,
  index,
  step,
  side,
  reduceMotion,
}: {
  progress: MotionValue<number>;
  index: number;
  step: Step;
  side: "left" | "right";
  reduceMotion: boolean;
}) {
  const { opacity, y } = useStepReveal(progress, index, reduceMotion);
  const topPercent = moduleStopScreenFraction(index) * 100;

  return (
    <div className="absolute inset-x-0 -translate-y-1/2" style={{ top: `${topPercent}%` }}>
      <motion.div style={{ opacity, y }}>
        <StepContent index={index} step={step} side={side} />
      </motion.div>
    </div>
  );
}

// How much scroll distance the pinned view holds for. Not derived from
// content height (there IS no scrolling content anymore — every step is
// fixed-position, see AlternatingStep) — this is a synthetic scroll
// track, sized for a comfortable ~100vh of dwell time per step.
const SCROLL_TRACK_VH = 400;

/**
 * "How To Get Started" — centred-spine timeline, not an iteration on the
 * previous two-column layout (rail beside a text column). Reframed
 * deliberately: see HowToGetStartedScene.tsx's own "FRAMING" note for
 * why the strap now bleeds off the top/bottom of the viewport instead
 * of showing both tips — that choice belongs to this layout, not a
 * regression of the full-visibility constraint the earlier version had.
 *
 * Layout: heading + body centred, full width, ABOVE the pinned view.
 * Below that, ONE `sticky top-0 h-screen` view holding a 3-column grid
 * — left steps / centred canvas / right steps — inside a tall
 * (SCROLL_TRACK_VH) scroll track that gives it something to stay pinned
 * against. Steps 1 and 3 sit in the left column, 2 and 4 in the right,
 * each fixed at the exact screen height (`moduleStopScreenFraction`,
 * shared with HowToGetStartedScene.tsx) its own stop puts the module at
 * — not flowing document content any more, since a step flanking a
 * fixed-position spine has to hold a fixed position itself for the two
 * to stay aligned as the reader scrolls.
 *
 * scrollYProgress is read off the scroll track (offset "start start" ->
 * "end end") and is the ONLY source driving both the step opacity
 * windows (useStepReveal) and the module's travel target in
 * HowToGetStartedScene.tsx (via the shared `activeStepIndex` in
 * howToGetStartedProgress.ts) — one MotionValue, one active-step
 * formula, so the highlighted step and the module's position can't
 * drift apart the way two independently-computed sources could.
 * Framer-motion's own scroll progress is clamped to [0,1] (confirmed
 * directly in its installed source, not assumed), so the module
 * naturally rests at its first stop before the section is reached and
 * holds at its last stop after the reader scrolls past.
 *
 * `md:` and up only — below that, a plain stacked list with no sticky
 * visual, no 3D canvas, and no left/right alternation (see the mobile
 * branch below).
 */
export function HowToGetStartedSection() {
  const isMobile = useIsMobile();
  const reduceMotion = useSafeReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  const heading = (
    <Reveal y={20} className="mx-auto max-w-2xl text-center">
      <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight text-navy lg:text-4xl">
        How To Get Started
      </h2>
      <p className="mt-4 text-pretty text-lg text-mist">
        A NeuroAtlas pilot gives your organization a structured way to
        introduce the platform, measure the experience, and review the
        results.
      </p>
    </Reveal>
  );

  if (isMobile) {
    // Plain stacked list, left-aligned throughout — the alternating
    // left/right treatment is a desktop-only reading of "flanking a
    // centred spine," and there's no spine here to flank (no canvas on
    // mobile at all, matching every other Band-model section's own
    // mobile fallback). Reusing TimelineStep unchanged rather than
    // AlternatingStep means there's no `side` prop anywhere in this
    // branch, so it can't accidentally zigzag in a narrow column.
    return (
      <section>
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-24 lg:px-10 lg:py-32">
          {heading}
          <div className="mx-auto mt-16 max-w-xl divide-y divide-navy/10">
            {STEPS.map((step, i) => (
              <TimelineStep
                key={step.label}
                progress={scrollYProgress}
                index={i}
                step={step}
                reduceMotion={reduceMotion}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-cream px-6 lg:px-10">
      <div className="mx-auto max-w-6xl pt-24 lg:pt-32">{heading}</div>
      {/* my-16/lg:my-24 is MARGIN, not padding — deliberately, per the
         step-1 timing bug this section already fixed once: useScroll's
         "start start"/"end end" measures the TRACKED element's own
         border box, and PADDING on that box shifts where progress 0/1
         actually land relative to where the sticky child engages/
         releases. Margin lives outside the border box, so it can't
         cause that — it only moves where the whole tracked box sits on
         the page, not the relationship between the box's own edges and
         its sticky child. trackRef below carries zero padding as a
         result; all breathing room around it is margin. */}
      <div
        ref={trackRef}
        className="relative my-16 lg:my-24"
        style={{ height: `${SCROLL_TRACK_VH}vh` }}
      >
        <div className="sticky top-0 h-screen">
          {/* Centre column fixed at 240px — comfortably wider than the
             strap's ~99px on-screen width (see HowToGetStartedScene.tsx's
             FRAMING note) without being wide enough to read as its own
             column; left/right get the rest via 1fr each, symmetric so
             the alternating steps stay visually balanced either side of
             the spine. */}
          <div className="relative mx-auto grid h-full max-w-6xl grid-cols-[1fr_240px_1fr] gap-x-6 lg:gap-x-10">
            <div className="relative">
              {STEPS.map((step, i) =>
                i % 2 === 0 ? (
                  <AlternatingStep
                    key={step.label}
                    progress={scrollYProgress}
                    index={i}
                    step={step}
                    side="left"
                    reduceMotion={reduceMotion}
                  />
                ) : null
              )}
            </div>
            <div className="relative h-full">
              <HowToGetStartedScene progress={scrollYProgress} reduceMotion={reduceMotion} />
            </div>
            <div className="relative">
              {STEPS.map((step, i) =>
                i % 2 === 1 ? (
                  <AlternatingStep
                    key={step.label}
                    progress={scrollYProgress}
                    index={i}
                    step={step}
                    side="right"
                    reduceMotion={reduceMotion}
                  />
                ) : null
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
