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
import { STEP_COUNT } from "@/lib/howToGetStartedProgress";

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
  const { start, end } = windowFor(index, STEPS.length);
  const eased = (p: number) => (reduceMotion ? 1 : clamp01((p - start) / (end - start)));
  const opacity = useTransform(progress, (p) => 0.35 + 0.65 * eased(p));
  const y = useTransform(progress, (p) => (reduceMotion ? 0 : 16 * (1 - eased(p))));

  return (
    <motion.div style={{ opacity, y }} className="py-16 first:pt-0 last:pb-0 md:py-32">
      <span className="eyebrow">{`0${index + 1}`}</span>
      <h3 className="mt-3 text-balance font-serif font-normal uppercase tracking-normal text-2xl text-navy lg:text-3xl">
        {step.label}
      </h3>
      <p className="mt-4 max-w-md text-pretty text-lg text-mist">{step.body}</p>
    </motion.div>
  );
}

/**
 * "How To Get Started" — full rebuild, not an iteration on the previous
 * sticky-canvas attempt (wrong in approach: it rotated the model, which
 * on a 1.6mm-thick strap only ever produces an edge-on sliver).
 *
 * Layout: heading + body centred, full width, ABOVE the two-column
 * split entirely — not inside either column. Below that: left column is
 * `sticky top-0 h-screen`, holding a static orthographic view of the
 * strap with the module traveling down it; right column is the four
 * steps in normal document flow with generous vertical spacing,
 * scrolling past at their own pace underneath the sticky left column.
 *
 * scrollYProgress is read off the shared two-column grid (offset
 * "start start" -> "end end") and is the ONLY source driving both the
 * step reveal windows above and the module's travel target in
 * HowToGetStartedScene.tsx (via the shared `activeStepIndex` in
 * howToGetStartedProgress.ts) — one MotionValue, one active-step
 * formula, so the highlighted step and the module's position can't
 * drift apart the way two independently-computed sources could.
 * Framer-motion's own scroll progress is clamped to [0,1] (confirmed
 * directly in its installed source, not assumed), so the module
 * naturally rests at its first stop before the section is reached and
 * holds at its last stop after the reader scrolls past — no special
 * boundary-case code needed, it falls out of that clamping plus
 * `activeStepIndex`'s own `Math.min` ceiling.
 *
 * `md:` and up only — below that, a plain stacked list with no sticky
 * visual and no 3D canvas, matching every other Band-model section on
 * this page's own mobile fallback.
 */
export function HowToGetStartedSection() {
  const isMobile = useIsMobile();
  const reduceMotion = useSafeReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
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
      {/* py-24/lg:py-32 lives HERE, on a wrapper OUTSIDE gridRef — not on
         the grid itself. That's the actual fix for the step-1 timing
         bug: useScroll's "start start"/"end end" measures the TRACKED
         element's own border box, padding included. With the padding on
         the grid itself, progress=0 fired the instant the grid's outer
         box (padding and all) touched the viewport top — a full lg:py-32
         (128px) BEFORE the sticky child's own natural top reached that
         same point, since the child sits 128px lower inside that padded
         box. Confirmed directly (getBoundingClientRect measurements):
         that 128px is ~17.5% of the real pinned-scroll range, which is
         almost exactly step 1's own reveal window (0 to 0.175) — step 1
         was finishing its reveal at almost exactly the moment the
         sticky visual actually engaged, matching the reported bug
         exactly. Moving the padding outside gridRef means the grid's
         own top/bottom edges now coincide exactly with where the
         sticky child naturally starts and its containing row naturally
         ends, so progress 0 -> 1 now spans exactly the pinned-and-
         visible range, no more and no less. */}
      <div className="py-24 lg:py-32">
        {/* Left column fixed at 300px, not an even md:grid-cols-2 split.
           The strap's own on-screen width is set entirely by the ortho
           camera's zoom fitting CAMERA_TARGET_HEIGHT to the CANVAS'S
           PIXEL HEIGHT (HowToGetStartedScene.tsx's FitOrthographicCamera)
           — it never depended on how wide this column was, so a wide
           50/50 column just added empty margin around a strap that
           stayed the same ~50-75px wide regardless (viewport-height
           dependent: strap world-width * RIG_SCALE / CAMERA_TARGET_HEIGHT
           * canvas pixel height), reading as adrift in leftover space.
           300px is close to that width plus a comfortable margin, not a
           crop — the camera still fits the strap's full height exactly
           as before, this only changes how much unused horizontal
           whitespace surrounds it. The recovered width goes straight to
           the step column via 1fr. */}
        <div
          ref={gridRef}
          className="mx-auto grid max-w-6xl gap-16 md:grid-cols-[300px_1fr]"
        >
          <div className="sticky top-0 h-screen">
            <div className="relative h-full w-full">
              <HowToGetStartedScene progress={scrollYProgress} reduceMotion={reduceMotion} />
            </div>
          </div>
          <div>
            {/* A spacer OUTSIDE the divide-y list, not padding on step
               1 itself — placing it inside the divided list would give
               it its own divider border between spacer and step 1,
               which isn't wanted. Shifts where step 1 sits on screen at
               progress~0 without adding to gridRef's own tracked height
               in a way that would skew the scroll-progress mapping for
               steps 2-4. Sized so step 1 clears the fixed 73px header
               (confirmed live: without this, "Scope" rendered clipped
               directly behind the nav bar at progress 0) and lands
               roughly centred in the remaining viewport height, not
               just technically visible below the header. */}
            <div aria-hidden="true" className="h-[280px] lg:h-[340px]" />
            <div className="divide-y divide-navy/10">
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
        </div>
      </div>
    </section>
  );
}
