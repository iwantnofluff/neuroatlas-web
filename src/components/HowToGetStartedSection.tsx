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

// Genuinely lazy — @react-three/fiber's Canvas is only pulled in once this
// resolves client-side, never touched during the server render. This file
// is already "use client", so ssr:false is allowed here, same as every
// other Band scene's own identical inline dynamic() call.
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

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

/** Each step's own reveal window covers 70% of its even quarter-share of
 *  the track (leaving a 30% gap before the next step's window opens) —
 *  a real hold rather than every step blending continuously into the
 *  next, matching the client's own "sequentially lift" language. */
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

const heading = (
  <Reveal y={20}>
    <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight text-navy lg:text-4xl">
      How To Get Started
    </h2>
    <p className="mt-4 max-w-md text-pretty text-lg text-mist">
      A NeuroAtlas pilot gives your organization a structured way to
      introduce the platform, measure the experience, and review the
      results.
    </p>
  </Reveal>
);

/**
 * "How To Get Started" — a premium split-screen scroll showcase, replacing
 * the previous single-column pinned layout entirely per direct feedback
 * (the flat vertical strap spine read as a 2D rectangle, not a real
 * object). Left column: the four steps in normal document flow, generous
 * vertical spacing, scrolling past at their own natural pace — NOT pinned
 * this time. Right column: `sticky top-0 h-screen`, holding the real 3D
 * <Band> module + strap assembly (see HowToGetStartedScene.tsx), which
 * stays in view for as long as the left column's own content is taller
 * than the viewport, then releases naturally once the reader scrolls past
 * it — plain CSS sticky behavior, no `h-[Nvh]` wrapper trick needed the
 * way a true scroll-LOCK section requires, since nothing here is meant to
 * hold the reader in place anymore.
 *
 * scrollYProgress is read off the shared two-column grid itself (offset
 * "start start" -> "end end", the same pairing LeadershipDashboardSection
 * uses on this exact page) and drives both the step reveal timing AND the
 * model's continuous scroll-tied spin — one progress value, two
 * consumers, so the model visibly keeps turning for exactly as long as
 * the steps are still revealing, never longer or shorter.
 *
 * `md:` and up only — below that, a plain stacked list with no sticky
 * visual and no 3D canvas, matching every other Band-model section on
 * this page's own mobile fallback: no room for a real two-column split on
 * a phone-width viewport, and a WebGL canvas isn't worth the GPU cost
 * there.
 */
export function HowToGetStartedSection() {
  const isMobile = useIsMobile();
  const reduceMotion = useSafeReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: gridRef,
    offset: ["start start", "end end"],
  });

  if (isMobile) {
    return (
      <section>
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-24 lg:px-10 lg:py-32">
          <div className="text-center">{heading}</div>
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
      <div
        ref={gridRef}
        className="mx-auto grid max-w-6xl gap-16 py-24 md:grid-cols-2 lg:py-32"
      >
        <div>
          {heading}
          <div className="mt-16 divide-y divide-navy/10">
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
        <div className="sticky top-0 h-screen">
          <div className="relative h-full w-full">
            <HowToGetStartedScene progress={scrollYProgress} reduceMotion={reduceMotion} />
          </div>
        </div>
      </div>
    </section>
  );
}
