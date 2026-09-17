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
         to stop being clipped.

         pt-24 — a real, confirmed bug this fixes: with `justify-center`
         centering the headline+paragraph block as a whole, a viewport
         short enough (or a block tall enough) that the block's own top
         edge lands above the fixed header's own height (73px, measured
         live) rendered the headline's top few px UNDER the header,
         confirmed live via getBoundingClientRect (67px vs. the header's
         73px). Padding-top on a flex container sets a real floor here —
         `justify-center` centers within the space AFTER padding, so the
         block's top edge can never sit above pt-24 (96px) regardless of
         how little slack centering leaves, comfortably clearing the
         header with margin to spare. */}
      <div className="sticky top-0 flex min-h-[100svh] w-full flex-col items-center justify-center overflow-x-hidden bg-cream px-6 pt-24 pb-12 text-center">
        <motion.h2
          style={{ scale }}
          // clamp(), not a bare text-[12vw] — 12vw alone runs away to an
          // absurd size on an ultra-wide monitor and undersizes on the
          // narrowest phones. Same defensive pattern Hero.tsx's own
          // subtext already uses. leading-none is deliberate here too —
          // it's the tightest option, so it's already minimizing this
          // headline's own contribution to the total stacked height
          // above, not something loosened further.
          //
          // font-normal, tracking-[0] (was font-black, tracking-tighter)
          // — the project's own BOOWIE typography mandate (see
          // CLAUDE.md/AGENTS.md) is strict and unqualified about
          // headings, and this headline's own heavy-weight/tight-tracking
          // exception no longer holds, same reasoning as the homepage's
          // "Built To Read You" headline earlier this session.
          className="signal-mask-gradient text-balance bg-clip-text text-[clamp(3rem,12vw,13rem)] leading-none font-normal tracking-[0] text-transparent uppercase"
        >
          Built For One Focus:
          <br />
          Stress
        </motion.h2>
        {/* Lead statement — a direct "divide the [copy]" request: the new
           copy reads as a short punchy opener followed by a longer
           explanation, so it's split into two visual tiers rather than
           one run-on paragraph. Plain solid color (not the headline's
           own gradient-mask effect) at a size between the two — reads
           as a bridge from the giant headline down to the smaller body
           copy below it, not a second full headline. */}
        <motion.p
          style={{ opacity: subtextOpacity, y: subtextY }}
          className="mx-auto mt-8 max-w-3xl text-balance text-2xl text-[#1B2430] sm:text-3xl"
        >
          Because stress rarely stays in one part of your life.
        </motion.p>
        <motion.p
          style={{ opacity: subtextOpacity, y: subtextY }}
          // text-[#1B2430]/80 (was /70) — a touch more contrast per the
          // client's own re-pass on this section, still the headline's
          // exact literal color rather than an unrelated grey-blue
          // token, just less faded than before.
          // Was uncapped entirely (matching the heading's own width, which
          // has no max-w of its own beyond this section's px-6 padding) —
          // a direct "same width as the heading, fewer lines" request that
          // did cut it from six lines down to three, but only at ONE
          // specific viewport width. Uncapped, the paragraph's own width
          // (and so its own line count) tracks the viewport directly:
          // confirmed live via a sweep from 1024–2560px, it actually
          // wrapped to 4 lines below 1440px and dropped to 2 lines past
          // 2000px — "three lines" was a coincidence of one test width,
          // not a stable target. max-w-[1800px] is the widest this
          // paragraph can be while still reliably wrapping to exactly
          // three lines at every desktop width that's wide enough to
          // reach the cap at all (1440px and up, confirmed the same way);
          // text-balance (not text-pretty) is what keeps those three
          // lines reading evenly rather than a greedy fill with a short
          // last line. Below 1440px the paragraph is narrower than the
          // cap regardless, so it still uses the same full available
          // width as the heading there — it just needs a fourth line at
          // that point, the same way any wrapped text needs more lines
          // in a narrower column; that's expected reflow, not a bug this
          // is trying to prevent.
          className="mx-auto mt-6 max-w-[1800px] text-center text-balance text-lg text-[#1B2430]/80"
        >
          It follows you into your sleep, your focus, your decisions and
          the moments that matter most. Left unchecked, that pressure can
          build into exhaustion and burnout. The goal isn&rsquo;t to tell
          you how active you were today. NeuroAtlas was built to
          understand that bigger picture — with stress at the
          centre&nbsp;of&nbsp;it.
        </motion.p>
      </div>
    </div>
  );
}
