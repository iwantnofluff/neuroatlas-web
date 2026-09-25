"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { TimelineBandSpine } from "@/components/TimelineBandSpine";
import { useIsMobile } from "@/lib/useIsMobile";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { cn } from "@/lib/utils";

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
  const y = useTransform(progress, (p) => (reduceMotion ? 0 : 4 * (1 - eased(p))));

  return (
    <motion.div style={{ opacity, y }} className="pb-4 last:pb-0">
      <span className="eyebrow">{`0${index + 1}`}</span>
      <h3 className="mt-3 text-balance font-serif font-normal uppercase tracking-normal text-xl text-navy">
        {step.label}
      </h3>
      <p className="mt-3 max-w-md text-pretty text-base text-mist">{step.body}</p>
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
 * "How To Get Started" — a pinned, scroll-locked sequence (same
 * `h-[Nvh]` wrapper + `sticky` inner panel + `useScroll` "start start" ->
 * "end end" pattern LeadershipDashboardSection.tsx already established on
 * this exact page): the section holds the reader in place until they've
 * scrolled through all four steps, only releasing to the next section
 * once the track is exhausted.
 *
 * The visual rail beside the steps is the real 3D strap mesh from the
 * product's own GLB (see TimelineBandSpine.tsx) — not the module/device
 * model (that lived in a separate right-hand canvas in an earlier pass
 * of this section; removed entirely per direct feedback, along with the
 * flat SVG line + gold dot markers it replaced). The strap is already
 * long on its own vertical axis in the raw file, so it stands in
 * naturally as the timeline's spine with no rotation trick needed.
 *
 * pb-8 between steps (was pb-14) and `items-start` with generous
 * top/bottom padding on the sticky panel itself (was `items-center`,
 * no explicit padding budget) — a real, confirmed clipping bug the
 * previous version had: `items-center` on a `min-h-[100svh]` sticky
 * panel vertically centers ALL FOUR steps + heading as one block, and
 * their combined height was taller than the viewport on ordinary
 * laptop screens, clipping "Review" off the bottom with no way to
 * scroll to see it (the panel is sticky/pinned, not scrollable itself).
 * Tightening the inter-step gap is what actually fixes it — no amount
 * of container padding helps when the CONTENT itself doesn't fit; the
 * generous top/bottom padding on top of that is what was actually
 * asked for once the content fits with real room to spare.
 *
 * `md:` and up only — below that, the same four steps render as a plain
 * in-flow stack (no pin, no 3D canvas), matching
 * LeadershipDashboardSection's own `isMobile` split on this same page.
 */
export function HowToGetStartedSection() {
  const isMobile = useIsMobile();
  const reduceMotion = useSafeReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  if (isMobile) {
    return (
      <section>
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-24 lg:px-10 lg:py-32">
          <div className="text-center">{heading}</div>
          <div className="mx-auto mt-16 max-w-xl">
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
    <div ref={wrapperRef} className={cn("relative", !reduceMotion && "h-[280vh]")}>
      {/* pt-24 - clears the fixed 73px-tall Header (confirmed via
         measurement) with margin; items-start rather than items-center,
         which drifted this content's top edge under the header once the
         content got short enough for centering to matter (confirmed
         live at a 800px viewport height). */}
      <div className="sticky top-0 flex min-h-[100svh] items-start bg-cream px-6 pt-20 pb-10 lg:px-10">
        <div className="mx-auto w-full max-w-4xl">
          <div className="text-center">{heading}</div>
          <div className="mx-auto mt-6 flex max-w-xl gap-6">
            <div className="relative w-10 shrink-0">
              <TimelineBandSpine progress={scrollYProgress} />
            </div>
            <div className="min-w-0 flex-1">
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
    </div>
  );
}
