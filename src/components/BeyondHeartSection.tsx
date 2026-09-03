"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

// Asymmetric bento grid, replacing the previous pinned-scroll concentric-
// rings design entirely — that version (a 300vh scroll-jacked section, a
// sticky h-screen pin, three dashed SVG rings plus a traveling "signal"
// ring, and briefly a Web Audio heartbeat toggle) took up far more
// vertical space than the content justified and had accumulated more
// moving pieces than the section needed. This is a plain, compact,
// normal-flow section: one full-width hero cell (heading + subtitle + a
// gentle gold wave along its bottom edge) and three glass metric cards
// beneath it, each fading up once on scroll into view via the site's
// standard <Reveal>, matching every other card grid on the site rather
// than a bespoke scroll-driven reveal.
const metricCards = [
  {
    name: "Stress Age",
    body: "How your body is responding to stress over time.",
  },
  {
    name: "Cognitive Load",
    body: "How much your mind is juggling before your focus starts to slip.",
  },
  {
    name: "Emotional Regulation",
    body: "How well you stay balanced under pressure, so your response matches the moment.",
  },
];

// Two phase-shifted versions of the same multi-crest wave — identical
// command structure (four cubic-bezier segments each), only the crest/
// trough y-values swap, so Framer Motion can interpolate between them
// point-for-point instead of snapping. A calm, gentle undulation (like a
// slow neural/heart-rate oscillation) rather than a literal EKG spike-
// and-flatline trace, which reads more clinical than calming.
const WAVE_A =
  "M0,30 C50,10 100,10 150,30 C200,50 250,50 300,30 C350,10 400,10 450,30 C500,50 550,50 600,30";
const WAVE_B =
  "M0,30 C50,50 100,50 150,30 C200,10 250,10 300,30 C350,50 400,50 450,30 C500,10 550,10 600,30";

/** The hero cell's signature: a thin gold line rippling gently along the
 *  card's bottom edge. `preserveAspectRatio="none"` lets the 600×60
 *  viewBox stretch to whatever width the card actually renders at
 *  (non-uniform scaling is exactly what's wanted here — always full
 *  width, always this thin) rather than letterboxing. Collapses to a
 *  single static frame (WAVE_A, no animate/transition) under reduced
 *  motion. Purely decorative — aria-hidden, clipped to the card's own
 *  rounded corners by the parent's overflow-hidden. */
function NeuralWave({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <svg
      viewBox="0 0 600 60"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-14 w-full sm:h-16"
    >
      <motion.path
        // Bare `d` + a separate `animate.d` array don't mix — framer-motion
        // needs `d` declared through its own initial/animate value system
        // to track and interpolate it, not as a plain SVG attribute read
        // alongside that; passing both produced an intermittent
        // `d="undefined"` DOM attribute (a real console error, not a
        // cosmetic one) as the two fought over which value owned the
        // element. `animate` always gets a value (never undefined) — for
        // reduced motion it's just WAVE_A with an instant transition,
        // rather than omitting animate entirely.
        initial={{ d: WAVE_A }}
        animate={{ d: reduceMotion ? WAVE_A : [WAVE_A, WAVE_B, WAVE_A] }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 6, repeat: Infinity, ease: "easeInOut" }
        }
        fill="none"
        stroke="var(--color-gold)"
        strokeOpacity={0.55}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BeyondHeartSection() {
  const reduceMotion = useSafeReducedMotion();

  return (
    <section id="beyond-heart-rate" className="dark-glow bg-navy-soft text-cream">
      <div className="mx-auto max-w-6xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Hero cell — full width, heading + subtitle, wave along the
              bottom edge. overflow-hidden so the wave clips cleanly to
              the card's own rounded corners rather than bleeding past
              them. */}
          <Reveal
            y={20}
            className="bento-glass relative overflow-hidden px-6 pt-10 pb-16 text-center sm:px-10 sm:pt-12 sm:pb-20 md:col-span-3 lg:px-16 lg:pt-16 lg:pb-24"
          >
            <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
              Beyond Heart Rate
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-cream/75">
              Beyond heart rate, NeuroAtlas tracks three things most other
              tools miss.
            </p>
            <NeuralWave reduceMotion={reduceMotion} />
          </Reveal>

          {/* Metric cells — three equal glass cards. */}
          {metricCards.map((family, i) => (
            <Reveal
              key={family.name}
              delay={i * 0.1}
              y={20}
              className="bento-glass p-6 text-center sm:p-8"
            >
              <span className="eyebrow">{`0${i + 1}`}</span>
              <h3 className="mt-3 font-serif text-xl text-cream">{family.name}</h3>
              <p className="mt-3 text-sm text-cream/70 sm:text-base">{family.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
