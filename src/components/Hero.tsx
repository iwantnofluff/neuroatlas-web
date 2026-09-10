"use client";

import { Fragment } from "react";
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
  /** A literal "\n" forces a line break at that exact word boundary
   *  (see the word-wrap comment further down for why plain
   *  text-balance/pretty can't do this job here) — omit it and the
   *  headline just wraps normally, responsive to viewport width like
   *  any other text. Use it when a specific split reads noticeably
   *  more balanced than whatever the natural flex-wrap happens to
   *  produce at common viewport widths, e.g. `headline={"Most Apps
   *  Stop\nAt Telling You"}` (3+2 words, near-equal line width) rather
   *  than letting "Most Apps Stop At" / "Telling You" (4+2 words, a
   *  visibly lopsided 17-vs-11-character split) wrap on its own —
   *  reported live on /how-it-works at a common desktop width. */
  headline?: string;
  /** Which word in `headline` gets the gold emphasis treatment. Pass a
   *  word that isn't present (or omit entirely) to skip it. */
  emphasisWord?: string;
  /** Same "\n"-forces-a-break convention as `headline` above, rendered
   *  as a literal `<br className="hidden sm:block" />` between segments
   *  — hidden below `sm` specifically so a manual break tuned for a
   *  wide line doesn't ALSO force an awkward extra stack on top of
   *  mobile's own natural wrapping (which already handles a narrow
   *  viewport fine on its own). Omit it and the subhead just wraps
   *  normally inside max-w-xl, exactly as before this existed — this
   *  codebase has multiple other Hero subheads (the homepage's own,
   *  /the-science's) that are already confirmed safe wrapping that
   *  way (see max-w-xl's own comment just below), so forcing them onto
   *  this same manual-break path isn't warranted. A forced break DOES
   *  drop max-w-xl for that render specifically, in favor of the
   *  parent's own max-w-3xl — once a break point is chosen manually,
   *  each resulting segment is short enough that the 576px cap was
   *  only ever going to wrap it AGAIN unnecessarily, undoing the exact
   *  break just inserted. */
  subhead?: string;
  /** Optional short line rendered between the subhead and the CTAs —
   *  e.g. /how-it-works' own "Measure → Intervene → Measure Again".
   *  Omit entirely for the default (no tagline at all); every other
   *  Hero caller is unaffected. */
  tagline?: string;
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
  tagline,
  ctas = DEFAULT_CTAS,
}: HeroProps = {}) {
  // One entry per forced line (see the `headline` prop's own doc
  // comment) — [headline] with no split at all when there's no "\n",
  // so every other page's existing single-string headline renders
  // byte-for-byte the same as before this existed.
  const lines = headline.split("\n").map((line) => line.split(" "));
  // Same convention, applied to the subhead below — see that prop's own
  // doc comment for why a forced break also drops max-w-xl.
  const subheadSegments = subhead.split("\n");
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

        {/* No text-balance here — a real, confirmed no-op this note
           replaces a silent one with: this h1's line-wrapping is driven
           by `flex flex-wrap` (each word is its own flex item, for the
           per-word stagger below), not by the browser's ordinary
           text-wrapping algorithm. text-wrap:balance/pretty only affects
           an element's OWN inline text content wrapping — it has no
           defined effect on flex-item wrapping, so adding it here would
           do nothing (confirmed: flex-wrap governs this, not text-wrap)
           while looking like it had been handled. A headline with an
           explicit "\n" (see that prop's own doc comment) instead gets
           one nested flex-wrap row PER forced line — each row is its
           own flex-wrap context, so words can still only wrap within
           the line they were assigned to, never drift across the
           forced break. */}
        <motion.h1
          initial="hidden"
          animate="visible"
          variants={wordContainer}
          // 4 distinct steps (text-4xl/5xl/6xl/7xl), one per breakpoint,
          // not the previous 3 (5xl/6xl/7xl) spread across 4 — that left
          // the 640–1023px range (foldables through tablets) plateaued at
          // one size the whole way, then jumping straight to 7xl at lg.
          // Reported live: the tablet-width (768px) render of this
          // word-by-word flex-wrap headline (see the no-text-balance note
          // above) wrapped awkwardly at that plateaued size. Giving md
          // its own dedicated tier means every named breakpoint genuinely
          // grows the text a step, rather than some breakpoints being a
          // no-op carried over from the one before.
          className="mt-6 flex flex-col items-center gap-y-1 font-serif font-normal uppercase tracking-normal text-4xl leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {lines.map((words, li) => (
            <span
              key={li}
              className="flex flex-wrap justify-center gap-x-[0.28em] gap-y-1"
            >
              {words.map((word, i) => (
                <motion.span
                  key={`${word}-${i}`}
                  variants={wordItem}
                  className={cn(word === emphasisWord && "text-gold")}
                >
                  {word}
                </motion.span>
              ))}
            </span>
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
          // Dropped only when the subhead has a manual break (see that
          // prop's own doc comment) — the parent's own max-w-3xl is
          // still there as a real ceiling, this isn't unbounded.
          className={cn(
            "mx-auto mt-6 text-pretty text-[clamp(0.7rem,2.6vw,1.125rem)] text-cream/75",
            subheadSegments.length === 1 && "max-w-xl"
          )}
        >
          {subheadSegments.map((segment, i) => (
            <Fragment key={i}>
              {/* A real, confirmed bug this space fixes: the "\n" in
                 the source string is consumed entirely by split(), so
                 with nothing here the ONLY separator between segments
                 was the <br/> itself — invisible below `sm` where it's
                 hidden, collapsing "changed," and "it" together into
                 "changed,it" with no space at all, confirmed live via
                 screenshot. A literal space before every segment but
                 the first is harmless at `sm:` and up too (trailing
                 whitespace right before a visible line break is not
                 rendered as a gap). */}
              {i > 0 && <br className="hidden sm:block" />}
              {i > 0 && " "}
              {segment}
            </Fragment>
          ))}
        </motion.p>

        {tagline && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.58 }}
            // Reuses the same small-caps/gold treatment as the eyebrow
            // above the headline (`.eyebrow`, see globals.css) rather
            // than a bespoke style — this tagline reads as the same
            // KIND of short label, just positioned lower.
            className="eyebrow mt-6"
          >
            {tagline}
          </motion.p>
        )}

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
        className="relative mb-8 flex justify-center"
      >
        {/* A real, confirmed fidelity bug this replaces: a bare icon at
           text-cream/50 with no container at all read as faded/washed
           out rather than a deliberate, premium scroll cue — reported
           live. Solid border-cream/40 (not the literal border-white/40
           this was specced with — --color-cream is this site's own
           near-white brand token, used everywhere else a crisp light
           accent is needed, rather than introducing a one-off raw
           white), no blur anywhere, and the chevron itself now plain
           text-cream (fully opaque, was /50) inside the circle rather
           than faded on its own. hover: proves it reads as interactive
           even though it's still purely decorative (aria-hidden,
           no onClick) — a visual affordance, not new behavior. */}
        <div className="flex size-11 items-center justify-center rounded-full border border-cream/40 text-cream transition-all duration-300 hover:border-cream hover:bg-cream/5">
          <ChevronDown className="size-5" />
        </div>
      </motion.div>
    </section>
  );
}
