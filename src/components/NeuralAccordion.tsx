"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

const SYSTEMS = [
  {
    label: "Autonomic Regulation",
    body: "How your body's automatic stress response gets trained to calm faster.",
  },
  {
    label: "Prefrontal-Limbic Control",
    body: "How your thinking brain regains control from your reactive brain, under pressure.",
  },
  {
    label: "Neuroplastic Conditioning",
    body: "How repetition makes composure a habit, not a one-time fix.",
  },
];

// Matches the `duration-500` on each panel's own flex-grow transition
// below — the text only starts fading in once that transition has
// actually finished, not the instant the panel starts expanding.
const EXPAND_MS = 500;

function AccordionPanel({
  index,
  isActive,
  isSettled,
  onActivate,
  reduceMotion,
}: {
  index: number;
  isActive: boolean;
  isSettled: boolean;
  onActivate: (index: number) => void;
  reduceMotion: boolean;
}) {
  const system = SYSTEMS[index];

  return (
    <motion.div
      layout
      onHoverStart={() => onActivate(index)}
      onFocus={() => onActivate(index)}
      onClick={() => onActivate(index)}
      tabIndex={0}
      role="button"
      aria-pressed={isActive}
      transition={{ layout: { duration: reduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] } }}
      className={cn(
        "relative flex min-w-0 cursor-pointer flex-col justify-end overflow-hidden rounded-2xl border p-8 transition-[flex-grow,background-color,border-color] duration-500 ease-out",
        isActive
          ? "flex-[3] border-gold/30 bg-white/[0.07]"
          : "flex-1 border-white/10 bg-white/5"
      )}
    >
      <span className="eyebrow">{`0${index + 1}`}</span>
      <h3 className="mt-3 font-serif text-xl whitespace-normal text-cream sm:text-2xl">
        {system.label}
      </h3>
      <AnimatePresence>
        {isActive && isSettled && (
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.35 }}
            className="mt-4 max-w-sm text-base text-cream/70"
          >
            {system.body}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * "The Neural Accordion" — a full-width horizontal flex row of three
 * panels; whichever one is active grows to flex-[3] while the other two
 * shrink to flex-1, via a plain CSS transition on flex-grow (framer's
 * `animate` doesn't officially support arbitrary CSS properties like
 * flex-grow as a first-class animatable value the way it does
 * transform/opacity/color, so this drives the actual grow/shrink with
 * Tailwind's own conditional classes + `transition-[flex-grow]`, and
 * uses framer-motion's `layout` prop — the part of the brief this
 * genuinely calls for — to smooth out the CHILDREN's reflow as each
 * panel's box changes size, which `layout` handles automatically
 * without any manual position math).
 *
 * `settled` (which panel index has actually finished its CSS
 * transition) is tracked once, here, rather than per-panel — the only
 * state write happens inside a setTimeout callback keyed off `active`,
 * never synchronously in the effect body itself (React's own
 * react-hooks/set-state-in-effect rule flags a direct/unconditional
 * setState call inside an effect; wrapping the ONE state update in a
 * timer, and folding the reduceMotion case into the timer's OWN delay
 * — 0ms instead of EXPAND_MS — rather than a separate synchronous
 * branch, satisfies that cleanly with no separate reset path needed:
 * `settled` simply won't match a newly-active index until its own
 * timer fires). The detail paragraph only fades in once its panel is
 * both active AND settled — reading as "revealed once fully open"
 * rather than racing the layout animation.
 *
 * Always exactly one panel active (defaults to the first) — there's no
 * "all three collapsed" state, matching how a real accordion like this
 * reads: something is always open.
 */
export function NeuralAccordion() {
  const reduceMotion = useSafeReducedMotion();
  const [active, setActive] = useState(0);
  const [settled, setSettled] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(active), reduceMotion ? 0 : EXPAND_MS);
    return () => clearTimeout(timer);
  }, [active, reduceMotion]);

  return (
    <section className="dark-glow bg-navy-soft text-cream">
      <div className="mx-auto max-w-6xl px-6 py-24 lg:px-10 lg:py-32">
        <Reveal y={20} className="text-center">
          <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
            Three Systems, One Method
          </h2>
        </Reveal>
        <div className="mt-16 flex h-[420px] flex-col gap-4 sm:flex-row">
          {SYSTEMS.map((system, i) => (
            <AccordionPanel
              key={system.label}
              index={i}
              isActive={i === active}
              isSettled={i === settled}
              onActivate={setActive}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
