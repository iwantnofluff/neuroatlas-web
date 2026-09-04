"use client";

import { motion } from "framer-motion";
import { HeroBoundary } from "@/components/HeroBoundary";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/**
 * /the-science's own hero — "The Living Signal". Same deep-navy, massive-
 * headline shape as the shared <Hero> component (used verbatim by / and
 * /how-it-works), but NOT that component: this page's brief specifically
 * wants a bespoke animated background layer behind the text (a slow-
 * moving signal wave), and <Hero> is a shared component used on three
 * routes with no slot for one page's own decoration — adding it there
 * risks the other two, for a visual only this page asked for. A bespoke
 * section matching the same visual shape costs nothing and keeps the
 * shared component untouched.
 *
 * The wave: two SVG layers, each rendered TWICE back-to-back inside one
 * wide (`w-[200%]`) motion.svg and translated exactly -50% of its own
 * width — the same seamless-loop trick already used for the footer's
 * marquee (two identical copies, so the instant the second slides into
 * the first's old position the seam is invisible). Two layers at
 * different speeds/opacities read as parallax depth rather than one
 * flat moving line. Genuinely framer-motion (`animate` + `repeat:
 * Infinity`), not the plain-CSS-keyframe convention this codebase uses
 * for ITS OTHER ambient loops (hero-drift-a/b, the footer marquee) —
 * the brief asked specifically for Framer Motion here, and a simple
 * infinite transform loop has none of the sticky-positioning/layout
 * bug classes this codebase has actually hit elsewhere, so there's no
 * reason to reach for CSS instead just for consistency's own sake.
 *
 * reduceMotion drops the animate prop entirely (the wave sits static,
 * a single visible copy — not a moving one frozen mid-frame).
 */
function SignalWaveLayer({
  reduceMotion,
  duration,
  className,
  path,
}: {
  reduceMotion: boolean;
  duration: number;
  className: string;
  path: string;
}) {
  return (
    <motion.svg
      aria-hidden="true"
      viewBox="0 0 800 200"
      preserveAspectRatio="none"
      className={className}
      animate={reduceMotion ? undefined : { x: ["0%", "-50%"] }}
      transition={reduceMotion ? undefined : { duration, repeat: Infinity, ease: "linear" }}
    >
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" transform="translate(800, 0)" />
    </motion.svg>
  );
}

const WAVE_PATH_A =
  "M0,100 C 50,20 150,180 200,100 C 250,20 350,180 400,100 C 450,20 550,180 600,100 C 650,20 750,180 800,100";
const WAVE_PATH_B =
  "M0,100 C 40,160 110,40 160,100 C 210,160 280,40 330,100 C 380,160 450,40 500,100 C 550,160 620,40 670,100 C 720,160 790,40 800,100";

export function LivingSignalHero() {
  const reduceMotion = useSafeReducedMotion();

  return (
    <>
      <section
        id="hero"
        className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-navy px-6 text-center text-cream"
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <SignalWaveLayer
            reduceMotion={reduceMotion}
            duration={22}
            path={WAVE_PATH_A}
            className="absolute top-[38%] left-0 h-32 w-[200%] text-gold/[0.14]"
          />
          <SignalWaveLayer
            reduceMotion={reduceMotion}
            duration={30}
            path={WAVE_PATH_B}
            className="absolute top-[58%] left-0 h-24 w-[200%] text-gold/[0.08]"
          />
        </div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,color-mix(in_oklab,var(--color-navy)_55%,transparent),transparent_75%)]"
        />

        <div className="relative z-10 mx-auto max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow"
          >
            The Science
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-6 font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
          >
            The Evidence Behind The Loop
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mx-auto mt-6 max-w-xl text-lg text-cream/75"
          >
            Every protocol maps to established neuroscience, not a wellness
            trend.
          </motion.p>
        </div>
      </section>
      <HeroBoundary />
    </>
  );
}
