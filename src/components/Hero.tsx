"use client";

import type { PointerEvent } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { DotPattern } from "@/components/ui/dot-pattern";
import { ShimmerLink } from "@/components/ui/shimmer-button";
import { HeroMedia } from "@/components/HeroMedia";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

const HEADLINE = "The First Stress Management Band";
const EMPHASIS_WORD = "First";

// Real footage isn't in yet — see HeroMedia.tsx. Set this to e.g.
// "/video/hero-band.mp4" once it lands; everything else is already built
// around it.
const HERO_VIDEO_SRC: string | undefined = undefined;

const wordContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const wordItem = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export function Hero() {
  const words = HEADLINE.split(" ");
  const reduceMotion = useSafeReducedMotion();

  // Subtle cursor-parallax on the glow layered over the video — a quiet
  // "alive" touch, not a gimmick: small amplitude, spring-smoothed, and
  // skipped entirely for prefers-reduced-motion.
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const springX = useSpring(glowX, { stiffness: 60, damping: 20 });
  const springY = useSpring(glowY, { stiffness: 60, damping: 20 });

  function handlePointerMove(e: PointerEvent<HTMLElement>) {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    glowX.set(relX * 40);
    glowY.set(relY * 40);
  }

  return (
    <section
      id="hero"
      onPointerMove={handlePointerMove}
      className="relative flex min-h-[100svh] flex-col items-center overflow-hidden bg-navy text-cream"
    >
      {/* Full-bleed background: real footage once HERO_VIDEO_SRC is set,
          an ambient placeholder until then (see HeroMedia.tsx). */}
      <HeroMedia src={HERO_VIDEO_SRC} poster="/photos/hero-band.jpg" />

      {/* Scrim over the video/placeholder — keeps the headline legible
          regardless of what's playing underneath. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-navy/45"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-navy/70 via-transparent to-navy/85"
      />

      <motion.div
        aria-hidden="true"
        style={{ x: springX, y: springY }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,color-mix(in_oklab,var(--color-gold)_25%,transparent),transparent_70%)]"
      />
      <DotPattern
        glow={false}
        width={28}
        height={28}
        className="text-gold/10 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_35%,black,transparent)]"
      />

      <div className="relative mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 pt-28 pb-16 text-center lg:pt-24">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="eyebrow"
        >
          NeuroAtlas
        </motion.p>

        <motion.h1
          initial="hidden"
          animate="visible"
          variants={wordContainer}
          className="mt-6 flex flex-wrap justify-center gap-x-[0.28em] gap-y-1 font-serif text-5xl leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl"
        >
          {words.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              variants={wordItem}
              className={cn(word === EMPHASIS_WORD && "italic text-gold")}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mx-auto mt-6 whitespace-nowrap text-[clamp(0.7rem,2.6vw,1.125rem)] text-cream/75"
        >
          Know when pressure is building, and reset before it takes over.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <ShimmerLink
            href="/request-access"
            background="color-mix(in oklab, var(--color-cream) 30%, transparent)"
            shimmerColor="var(--color-cream)"
            className="px-6 py-3 text-sm tracking-wide text-cream"
          >
            Enquire Now
          </ShimmerLink>
          <ShimmerLink
            href="/for-organisations"
            background="color-mix(in oklab, var(--color-cream) 30%, transparent)"
            shimmerColor="var(--color-cream)"
            className="px-6 py-3 text-sm tracking-wide text-cream"
          >
            Book A Pilot
          </ShimmerLink>
        </motion.div>
      </div>

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: reduceMotion ? 0 : [0, 6, 0] }}
        transition={
          reduceMotion
            ? { duration: 0.5, delay: 1 }
            : { opacity: { delay: 1, duration: 0.5 }, y: { repeat: Infinity, duration: 1.8, ease: "easeInOut" } }
        }
        className="relative mb-8 flex justify-center text-cream/50"
      >
        <ChevronDown className="size-5" />
      </motion.div>
    </section>
  );
}
