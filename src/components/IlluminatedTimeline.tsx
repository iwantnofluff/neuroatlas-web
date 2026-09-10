"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

type Step = { label: string; body: string };

// Four steps, not the previous three — the old third paragraph sitting
// below the step grid ("Your team gets a guided rollout, manager
// resources, and a dedicated point of contact throughout.") was really
// describing its OWN pilot stage, not a closing remark about the other
// three, so it becomes "Onboard" here rather than staying a stray
// trailing sentence.
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
  // -translate-y-1 (Tailwind's own 4px step) as the settled lift, not a
  // literal Tailwind utility toggled by class — the lift needs to be
  // driven continuously by scroll progress, so it's expressed as the
  // equivalent px value on a motion value instead.
  const y = useTransform(progress, (p) => (reduceMotion ? 0 : 4 * (1 - eased(p))));
  const dotScale = useTransform(progress, (p) => (reduceMotion ? 1 : 0.6 + 0.4 * eased(p)));
  const dotGlow = useTransform(progress, (p) => (reduceMotion ? 1 : eased(p)));

  return (
    <div className="relative flex gap-6 pb-14 last:pb-0">
      <div className="relative flex w-8 shrink-0 flex-col items-center">
        <motion.span
          style={{ scale: dotScale, opacity: dotGlow }}
          className="relative z-10 mt-1 size-4 rounded-full bg-gold shadow-[0_0_16px_2px_rgba(218,199,158,0.55)]"
        />
      </div>
      <motion.div style={{ opacity, y }}>
        <span className="eyebrow">{`0${index + 1}`}</span>
        <h3 className="mt-3 text-balance font-serif font-normal uppercase tracking-normal text-xl text-navy">
          {step.label}
        </h3>
        <p className="mt-3 max-w-md text-pretty text-base text-mist">{step.body}</p>
      </motion.div>
    </div>
  );
}

/**
 * "The Pilot Protocol" — a vertical illuminated timeline: a dim base
 * track behind the step nodes, and a glowing gold overlay that fills
 * downward as the reader scrolls, each step's own node lighting up and
 * lifting into full opacity as the fill reaches it.
 *
 * NOT a pinned/scroll-jacked section like MethodScrollCards or
 * EditorialIndexSection — this timeline scrolls past normally, reading
 * its own progress off its natural (untouched) height via
 * `offset: ["start end", "end start"]`, the standard framer-motion
 * "map this element's own pass through the viewport to 0→1" pattern,
 * rather than pinning it in place — a plain vertical list reads fine
 * scrolling by at its own pace; pinning it would just add scroll
 * distance for no clearer effect.
 */
export function IlluminatedTimeline() {
  const reduceMotion = useSafeReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Always a MotionValue, never a raw number swapped in when reduceMotion
  // is true — matching FeatureSplitSection's own established discipline
  // (see that file's doc comment): keeping the prop's SHAPE identical
  // across renders avoids a real bug class where a style value can get
  // stuck mid-transition if what's passed to it changes type.
  const fillScale = useTransform(scrollYProgress, (p) => (reduceMotion ? 1 : p));

  return (
    <div ref={ref} className="relative mx-auto max-w-xl md:mx-0 md:max-w-none">
      <div
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-4 w-px bg-navy/10"
      />
      <motion.div
        aria-hidden="true"
        style={{ scaleY: fillScale, transformOrigin: "top" }}
        className="absolute top-2 bottom-2 left-4 w-px bg-gold shadow-[0_0_8px_1px_rgba(218,199,158,0.6)]"
      />
      <div className="relative">
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
  );
}
