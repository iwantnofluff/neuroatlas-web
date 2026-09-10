"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/**
 * "Built For One Focus: Stress" (client's final copy — was "One
 * Signal, Just Stress"; same section, same mechanics, new words) —
 * "Expand & Snap": the headline renders enormous with a slow-shifting
 * exact #1B2430 fade masked INSIDE its own glyphs (bg-clip-text
 * text-transparent over .signal-mask-gradient, see globals.css) — the
 * gradient reads as fluid light moving through the letters rather than
 * a static fill. Scrolling through this section's own h-[200vh] pinned
 * track
 * scales the headline down from 1.5x to its resting size as it locks
 * into the center, with the supporting line fading in cleanly beneath
 * it once mostly settled.
 *
 * The gradient shift itself is plain CSS (background-position
 * keyframes, gated by prefers-reduced-motion the same way Hero.tsx's
 * own ambient placeholder is) — not React/framer-motion state, so this
 * component's reduceMotion handling never touches it at all.
 *
 * The scale/opacity VALUES below do need that handling: function-
 * transformer form of useTransform throughout (this codebase's
 * established defensive pattern, since the array-range form has a
 * confirmed bug once a second scroll-linked transform exists on the
 * same element), and reduceMotion is baked into what each value
 * COMPUTES (settling immediately at the resting scale / fully-visible
 * subtext) rather than swapping which props/shapes get passed to
 * motion.h2/p — the OTHER confirmed failure mode, from Reveal.tsx's
 * own history, where an element can get permanently stuck mid-
 * transition if its style prop's shape changes across renders.
 */
export function OneSignalSection() {
  const reduceMotion = useSafeReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  // offset ["start end", "end end"] — see FeatureSplitSection.tsx's own
  // comment for the full mechanics: "start start" leaves scrollYProgress
  // clamped at exactly 0 for the whole approach window while this
  // taller-than-viewport wrapper is still scrolling up from below (its
  // content already on screen).
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start end", "end end"],
  });

  // 1.5 -> 1.0 across the first ~55% of the pinned track, then holds —
  // "scales down... locking into the center".
  const scale = useTransform(scrollYProgress, (p) => {
    if (reduceMotion) return 1;
    const eased = p >= 0.55 ? 1 : p / 0.55;
    return 1.5 - 0.5 * eased;
  });

  // Subtext fades in alongside the tail of the headline's own settle
  // (0.15-0.6), then holds — matches this codebase's established
  // "reveal, don't cross-fade back out" convention (see
  // MethodScrollCards' own useCardReveal). Hold shrunk from 0.35 to
  // 0.15 — a real, confirmed bug this replaces: a user who stopped
  // scrolling anywhere before 35% progress saw the headline but no
  // subtext at all, a partial-blank rather than a deliberate stagger.
  const subtextEased = (p: number) =>
    reduceMotion ? 1 : p <= 0.15 ? 0 : p >= 0.6 ? 1 : (p - 0.15) / 0.45;
  const subtextOpacity = useTransform(scrollYProgress, (p) => subtextEased(p));
  const subtextY = useTransform(scrollYProgress, (p) => (reduceMotion ? 0 : 16 * (1 - subtextEased(p))));

  return (
    // 200vh -> 130vh — per an explicit "too much scrolling to reveal"
    // pass: the headline scale (0-0.55) and subtext (0.35-0.7) windows
    // still get real scroll distance at this height — 200vh was excess
    // dead scroll beyond what either beat needed.
    <div ref={wrapperRef} className={cn(!reduceMotion && "h-[130vh]")}>
      {/* min-h-[100svh], not the previous fixed h-[100svh] — a real,
         confirmed bug this replaces: the giant headline (up to 3 lines
         at a clamp()-ed size approaching 13rem) plus the six-sentence
         paragraph below it, both centered together via justify-center,
         could add up to more height than a real (often shorter-than-
         1440×900) viewport actually has — confirmed live, the
         paragraph's own last line sat clipped against the bottom edge.
         A hard h-[100svh] cap had nowhere for that excess to go; min-h
         is a floor, not a cap, so this section simply grows past 100svh
         (and its `sticky` naturally releases a touch earlier) on a
         viewport too short to fit both, rather than truncating either
         one. pb-12 adds real breathing room under the paragraph on top
         of that.

         overflow-x-hidden, not a bare overflow-hidden (which would also
         re-clip vertically and reintroduce the exact bug above) — but
         NOT dropped entirely either: the headline's own scroll-driven
         `scale` (see this component's top comment) intentionally
         renders it at 1.5x before shrinking to its resting 1x size, and
         at 1.5x it is genuinely wider than the viewport by design
         (confirmed: 1313px at rest vs. ~2000px+ mid-animation at 1440px
         wide — both measured live). That transient overflow needs
         clipping on the X axis only; the Y axis is what actually needed
         to stop being clipped. */}
      <div className="sticky top-0 flex min-h-[100svh] w-full flex-col items-center justify-center overflow-x-hidden bg-cream px-6 pb-12 text-center">
        <motion.h2
          style={{ scale }}
          // clamp(), not a bare text-[12vw] — 12vw alone runs away to an
          // absurd size on an ultra-wide monitor and undersizes on the
          // narrowest phones. Same defensive pattern Hero.tsx's own
          // subtext already uses. leading-none is deliberate here too —
          // it's the tightest option, so it's already minimizing this
          // headline's own contribution to the total stacked height
          // above, not something loosened further.
          className="signal-mask-gradient text-balance bg-clip-text text-[clamp(3rem,12vw,13rem)] leading-none font-black tracking-tighter text-transparent uppercase"
        >
          Built For One Focus:
          <br />
          Stress
        </motion.h2>
        <motion.p
          style={{ opacity: subtextOpacity, y: subtextY }}
          // text-[#1B2430]/80 (was /70) — a touch more contrast per the
          // client's own re-pass on this section, still the headline's
          // exact literal color rather than an unrelated grey-blue
          // token, just less faded than before.
          // max-w-3xl (was max-w-2xl) and an explicit text-center (this
          // section's own outer div already centers everything, but the
          // client asked for it stated directly on the paragraph too) —
          // reads as one curated editorial block rather than a pasted-
          // in wall of text.
          className="mx-auto mt-8 max-w-3xl text-center text-pretty text-lg text-[#1B2430]/80"
        >
          NA·01 looks at more than individual health signals. It connects
          them to help you understand how stress is affecting you. Your
          sleep might be affecting your focus. Your heart&rsquo;s patterns
          might reveal rising pressure. The goal isn&rsquo;t to tell you how
          active you were today. It&rsquo;s to help you understand
          what&rsquo;s shaping how you feel, think, and respond. Because
          understanding stress means seeing the whole picture, not just your
          heart&nbsp;rate.
        </motion.p>
      </div>
    </div>
  );
}
