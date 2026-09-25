"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { useIsMobile } from "@/lib/useIsMobile";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { cn } from "@/lib/utils";

// Genuinely lazy — @react-three/fiber's Canvas is only pulled in once this
// resolves client-side, never touched during the server render. This file
// is already "use client", so ssr:false is allowed here, same as
// BandScrollShowcase.tsx's own identical inline dynamic() call.
const HowToGetStartedScene = dynamic(
  () => import("@/components/HowToGetStartedScene").then((m) => m.HowToGetStartedScene),
  { ssr: false }
);

type Step = { label: string; body: string; rotation: { x: number; y: number } };

// Four steps, each with its own target rotation for the 3D model — a
// distinct pose per step (not a continuous spin) is what makes the model
// itself read as "illustrating this specific step" rather than just
// spinning in the background for its own sake. Values picked for visual
// variety across the sequence, same "tuned by actually looking at it, not
// guessed" standard as every other rotation constant in Band.tsx/
// TheSpecs.tsx.
const STEPS: Step[] = [
  {
    label: "Scope",
    body: "Agree the team, the size, and the timeline together.",
    rotation: { x: 0.3, y: 0 },
  },
  {
    label: "Onboard",
    body: "Your team gets a guided rollout, manager resources, and a dedicated point of contact throughout.",
    rotation: { x: 0.25, y: 1.3 },
  },
  {
    label: "Measure",
    body: "The group uses NeuroAtlas through the pilot period, with a baseline reading at the start.",
    rotation: { x: 0.9, y: -0.8 },
  },
  {
    label: "Review",
    body: "An outcome report shows the shift, and where to take it next.",
    rotation: { x: 0.3, y: 2.6 },
  },
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
 * "How To Get Started" — a pinned, scroll-locked sequence (same
 * `h-[Nvh]` wrapper + `sticky` inner panel + `useScroll` "start start" ->
 * "end end" pattern LeadershipDashboardSection.tsx already established on
 * this exact page): the section holds the reader in place until they've
 * scrolled through all four steps, only releasing to the next section
 * once the track is exhausted — a direct, explicit request, not the
 * previous "plain vertical list, no pin" design this component used to
 * document as deliberate. The illuminated dot-and-line rail that used to
 * be the section's visual anchor is replaced with the real 3D `<Band>`
 * model (see HowToGetStartedScene.tsx), rotating to a distinct pose per
 * step instead of a static glowing track.
 *
 * `md:` and up only — below that, the same four steps render as a plain
 * in-flow stack (no pin, no 3D canvas), matching
 * LeadershipDashboardSection's own `isMobile` split on this same page:
 * a phone-width pin has no real room for a two-column "text beside a
 * rotating model" layout to read as anything but cramped, and a 3D
 * canvas is real GPU cost not worth paying on a viewport this narrow.
 */
export function HowToGetStartedSection() {
  const isMobile = useIsMobile();
  const reduceMotion = useSafeReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const [activeStep, setActiveStep] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const index = Math.min(STEPS.length - 1, Math.floor(p * STEPS.length));
    setActiveStep((current) => (current === index ? current : index));
  });

  if (isMobile) {
    return (
      <section>
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-24 lg:px-10 lg:py-32">
          <div className="text-center">{heading}</div>
          <div className="relative mx-auto mt-16 max-w-xl">
            <div aria-hidden="true" className="absolute top-2 bottom-2 left-4 w-px bg-navy/10" />
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
        </div>
      </section>
    );
  }

  return (
    // h-[280vh] — same proportion LeadershipDashboardSection uses for its
    // own four-row sequence on this page, for a comfortable ~180vh of
    // real pinned scroll distance once the "start start"/"end end" offset
    // is accounted for.
    <div ref={wrapperRef} className={cn("relative", !reduceMotion && "h-[280vh]")}>
      <div className="sticky top-0 flex min-h-[100svh] items-center bg-cream px-6 py-16 md:py-24 lg:px-10">
        <div className="mx-auto grid w-full max-w-6xl gap-16 md:grid-cols-2 md:items-center">
          <div>
            {heading}
            <div className="relative mt-16">
              <div aria-hidden="true" className="absolute top-2 bottom-2 left-4 w-px bg-navy/10" />
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
          </div>
          <div className="relative h-[420px] lg:h-[520px]">
            <HowToGetStartedScene
              reduceMotion={reduceMotion}
              targetRotation={STEPS[activeStep].rotation}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
