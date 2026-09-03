"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

// Pinned scroll reveal, per the client's own sketch: scroll into the
// section, the first card appears; scroll again, the second card joins it;
// scroll again, the third. Unlike BandScrollShowcase's signals (which
// cross-fade — only one visible at a time), these *accumulate* — once a
// card is in, it stays, matching "then another scroll the next card will
// come" (an addition, not a replacement). Once all three are in, further
// scroll releases the pin and moves on to the next section normally.
const methodSteps = [
  {
    label: "Measure",
    body: "Reads what's happening in your body, from emotional regulation to stress age, to build a clear picture beneath the surface.",
    range: [0.06, 0.24] as const,
  },
  {
    label: "Intervene",
    body: "A short, simple reset, right where you are.",
    range: [0.38, 0.56] as const,
  },
  {
    label: "Measure",
    body: "A second reading proves the shift, not just the feeling.",
    range: [0.7, 0.88] as const,
  },
];

/** A card's reveal, not a cross-fade: sits at 0 before `start`, animates
 *  across [start, end], then holds at 1 forever after — never fades back
 *  out. Deliberately the function-transformer form of useTransform, not
 *  the array-range form (`useTransform(progress, [start, end], [0, 1])`)
 *  — the array form hands scroll-linked transforms off to a native
 *  `animation-timeline: scroll()` optimization in this framer-motion
 *  version, and that path was computing the wrong values entirely once a
 *  second scroll-linked transform (the `y` below) existed on the same
 *  element — confirmed via the raw motion value being correct (.get()
 *  returned 1) while the actual rendered opacity did not. The function
 *  form always runs in plain JS, sidestepping that optimization.
 *
 *  `reduceMotion` is baked in here rather than swapping the *whole* style
 *  prop between this and `undefined` at the call site — framer-motion
 *  writes motion-value-driven styles straight to the DOM node outside
 *  React's own reconciliation, and toggling the style prop's shape
 *  between "an object of motion values" and "undefined" across renders
 *  doesn't reliably tear down that direct write. Concretely: this hook's
 *  very first render (before useSafeReducedMotion's mount check resolves)
 *  always computes with reduceMotion still false, writing opacity 0 to
 *  the DOM directly; flipping the style prop to undefined on the next
 *  render left that 0 permanently stuck, since nothing was updating it
 *  any more. Keeping the same {opacity, y} shape always, and only
 *  changing what they *compute*, avoids that teardown gap entirely. */
function useCardReveal(
  progress: MotionValue<number>,
  range: readonly [number, number],
  reduceMotion: boolean
) {
  const [start, end] = range;
  const eased = (p: number) =>
    reduceMotion ? 1 : p <= start ? 0 : p >= end ? 1 : (p - start) / (end - start);
  const opacity = useTransform(progress, (p) => eased(p));
  const y = useTransform(progress, (p) => (reduceMotion ? 0 : 24 * (1 - eased(p))));
  return { opacity, y };
}

function MethodCard({
  step,
  index,
  progress,
  reduceMotion,
}: {
  step: (typeof methodSteps)[number];
  index: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const { opacity, y } = useCardReveal(progress, step.range, reduceMotion);
  return (
    <motion.div
      style={{ opacity, y }}
      // .card-glass's own tinted fill read as a flat white/grey glow across
      // the whole card rather than glass — these three specifically drop
      // the fill (bg-transparent, a utility, wins over .card-glass's own
      // `background` regardless of source order under Tailwind's cascade
      // layers) and keep only its border and inset-highlight glow, so the
      // "glow" reads as a thin line around the edges, not a filled panel.
      className="card-glass bg-transparent p-4 text-center sm:p-8 sm:text-left"
    >
      <span className="eyebrow">{`0${index + 1}`}</span>
      <h3 className="mt-3 font-serif text-xl text-cream">{step.label}</h3>
      <p className="mt-3 text-base text-cream/70">{step.body}</p>
    </motion.div>
  );
}

export function MethodScrollCards() {
  const reduceMotion = useSafeReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  return (
    <div id="the-method" ref={wrapperRef} className={cn(!reduceMotion && "h-[300vh]")}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden bg-navy-soft text-cream">
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
          <Reveal y={20}>
            <h2 className="text-center font-serif text-3xl leading-tight lg:text-4xl">
              Measure. Intervene. Measure.
            </h2>
          </Reveal>
          {/* On short mobile viewports (iPhone SE/common Android heights),
             the heading + three full-padding cards overflowed this
             pinned h-screen section and got clipped at the top by its
             own overflow-hidden — confirmed live (content height 744px
             vs a 667px viewport). Tighter mt/gap/card-padding on mobile
             claws back ~136px, comfortably clearing that overflow. */}
          <div className="mt-6 grid gap-3 sm:mt-16 sm:grid-cols-3 sm:gap-8">
            {methodSteps.map((step, i) => (
              <MethodCard
                key={`${step.label}-${i}`}
                step={step}
                index={i}
                progress={scrollYProgress}
                reduceMotion={reduceMotion}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
