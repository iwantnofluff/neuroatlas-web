"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { DotPattern } from "@/components/ui/dot-pattern";
import { ShimmerLink } from "@/components/ui/shimmer-button";
import { HeroMedia } from "@/components/HeroMedia";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

const HEADLINE = "The First Stress Management Band";
const EMPHASIS_WORD = "First";
const SUBHEAD = "Know when pressure is building, and reset before it takes over.";

const DEFAULT_CTAS: HeroCta[] = [
  { label: "Enquire Now", href: "/request-access" },
  { label: "Book A Pilot", href: "/for-organisations" },
];

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

type HeroCta = { label: string; href: string };

type HeroProps = {
  eyebrow?: string;
  headline?: string;
  /** Which word in `headline` gets the italic-gold emphasis treatment.
   *  Pass a word that isn't present (or omit entirely) to skip it. */
  emphasisWord?: string;
  subhead?: string;
  /** Defaults to the homepage's own two buttons — pass `[]` to render
   *  none (e.g. a page with its own closing CTA already doing that job,
   *  see /how-it-works). */
  ctas?: HeroCta[];
};

/**
 * Shared full-bleed cinematic banner — used as-is (all defaults) on the
 * homepage, and with page-specific copy elsewhere (see /how-it-works,
 * which swaps in its own headline/subhead and drops the CTAs). The visual
 * chrome (video/placeholder background, static lighting, dot pattern,
 * scroll chevron) is what's actually "global" here; the words on top of
 * it are just props.
 */
export function Hero({
  eyebrow = "NeuroAtlas",
  headline = HEADLINE,
  emphasisWord = EMPHASIS_WORD,
  subhead = SUBHEAD,
  ctas = DEFAULT_CTAS,
}: HeroProps = {}) {
  const words = headline.split(" ");
  const reduceMotion = useSafeReducedMotion();

  return (
    <section
      id="hero"
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

      {/* Static "studio lighting" — replaces a previous cursor-tracking
          glow (real interactivity, removed per client direction: this is
          meant to read as premium ambient light, not a gimmick). Two
          layered radial gradients, both fixed in place, no JS/motion
          involved: a soft key light offset toward the top-left of center,
          and a smaller, fainter fill light further toward the corner —
          the same "light source up and to one side" cue real studio
          photography uses. Kept deliberately faint (16%/10% mixes, down
          from the old glow's 25%) so it stays in the background rather
          than competing with the headline. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 32% 0%, color-mix(in oklab, var(--color-gold) 16%, transparent), transparent 70%), " +
            "radial-gradient(ellipse 40% 35% at 12% 12%, color-mix(in oklab, var(--color-cream) 10%, transparent), transparent 75%)",
        }}
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
          {eyebrow}
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
              className={cn(word === emphasisWord && "italic text-gold")}
            >
              {word}
            </motion.span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          // No whitespace-nowrap (this used to force one line) — its
          // clamp() floor (0.7rem) is a fixed minimum font size with no
          // further room to shrink, so any subhead longer than the
          // homepage's own (the one this was originally tuned against)
          // simply overflowed off the edge of a narrow viewport instead
          // of shrinking further. Confirmed live on /the-science and
          // /how-it-works, both genuinely longer than the homepage's:
          // real clipped text, not hypothetical. max-w-xl + wrapping is
          // what every other subtext on this site already does safely.
          className="mx-auto mt-6 max-w-xl text-[clamp(0.7rem,2.6vw,1.125rem)] text-cream/75"
        >
          {subhead}
        </motion.p>

        {ctas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            {ctas.map((cta) => (
              <ShimmerLink
                key={cta.href}
                href={cta.href}
                background="color-mix(in oklab, var(--color-cream) 30%, transparent)"
                shimmerColor="var(--color-cream)"
                className="px-6 py-3 text-sm tracking-wide text-cream"
              >
                {cta.label}
              </ShimmerLink>
            ))}
          </motion.div>
        )}
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
