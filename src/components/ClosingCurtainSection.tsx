"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { Reveal } from "@/components/Reveal";
import { ShimmerLink } from "@/components/ui/shimmer-button";

// Overlap (how far the reveal's document position is pulled up into the
// curtain's tail — i.e. the lift transition's own duration) and hold
// (how long the CTA stays fully revealed and interactive before
// releasing into the site's global Footer underneath) are both a
// fraction of the viewport height.
const OVERLAP_RATIO = 0.5;
const HOLD_RATIO = 0.3;

/**
 * The final two sections, replacing two standard centered-text blocks
 * with a cinematic "curtain reveal": the off-white "curtain" section
 * scrolls normally, in front (z-10, opaque); the navy CTA "reveal"
 * section sits behind it (z-0) and stays pinned to the viewport's
 * bottom edge for a held stretch of scroll — so as the curtain scrolls
 * up and off, it looks like a physical curtain lifting away to reveal
 * the CTA underneath, rather than the two just scrolling past at the
 * same rate the way two ordinary stacked sections would.
 *
 * The stacking trick, worked out by hand against the actual sticky-
 * positioning spec (through two real bugs, each caught live via
 * Playwright, not assumed):
 *
 * Bug #1 — `position: sticky; bottom: 0` (what the brief itself
 * suggested) turns out to be the wrong tool for a page that only ever
 * scrolls downward: `bottom` sticky only holds an element in place
 * while scrolling UP (it resists escaping downward through the bottom
 * edge — the right tool for something like a reversed list's toolbar).
 * For an element entering from below and needing to hold in place
 * while scrolling DOWN, `top` sticky is the correct property (it
 * resists escaping upward through the top edge) — confirmed live: with
 * `bottom-0` the panel just rendered at its plain static position the
 * entire time, never once clamping to the viewport edge. Since the
 * panel's own height is exactly one viewport, `top: 0` and "flush with
 * the viewport's bottom edge" land on the exact same box position, so
 * swapping the property costs nothing visually.
 *
 * Bug #2 — a sticky element only stays clamped for as long as its OWN
 * containing block still has room left past it — one that's simply
 * the last thing in its parent has none (the parent ends exactly where
 * the sticky element's own static box ends, so "finished holding" and
 * "hit the end" are always the same instant). So the reveal is wrapped
 * in a plain `<div>` that's deliberately taller than the reveal itself,
 * with a negative top margin pulling that wrapper's document position
 * up into the curtain's tail (so the two genuinely overlap, rather
 * than the reveal simply appearing after the curtain with no overlap
 * at all). The wrapper's required extra height is measured, not
 * guessed — an earlier fixed/guessed value under-provisioned it and
 * the site's real global Footer visibly intruded before the curtain
 * had even finished lifting. It depends on the curtain's actual
 * rendered height (which varies with viewport width as the massive
 * headline wraps to more or fewer lines), plus how long the lift
 * itself takes, plus the desired hold:
 *
 *   extraHeight = curtainHeight + overlap + hold
 *
 * (derived from the sticky spec: the wrapper's bottom must not be
 * reached until the curtain has fully departed AND the hold has
 * played out, or the Footer starts showing through the gap early).
 *
 * reduceMotion skips the whole mechanism (no inline margin/height —
 * the two sections just stack in normal sequence) rather than trying
 * to disable only the "motion" inside an otherwise-unchanged layout,
 * matching this codebase's established convention of collapsing a
 * scroll-rigged wrapper back to auto height (see BandScrollShowcase's
 * own `cn(!reduceMotion && "h-[520vh]")`).
 */
export function ClosingCurtainSection() {
  const reduceMotion = useSafeReducedMotion();
  const curtainRef = useRef<HTMLElement>(null);
  const [metrics, setMetrics] = useState<{ overlap: number; height: number } | null>(null);

  useEffect(() => {
    const curtain = curtainRef.current;
    if (!curtain) return;

    function recompute() {
      const curtainHeight = curtain!.getBoundingClientRect().height;
      const viewportHeight = window.innerHeight;
      const overlap = viewportHeight * OVERLAP_RATIO;
      const hold = viewportHeight * HOLD_RATIO;
      const extra = curtainHeight + overlap + hold;
      setMetrics({ overlap, height: viewportHeight + extra });
    }

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(curtain);
    window.addEventListener("resize", recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, []);

  // Local scroll progress across the curtain's own time in the viewport
  // (NOT a pinned/scroll-jacked track — this is a plain in-flow
  // section), driving a subtle upward drift on the subtext only, per
  // spec. Function-transformer form of useTransform, this codebase's
  // standing defensive convention.
  const { scrollYProgress } = useScroll({
    target: curtainRef,
    offset: ["start end", "end start"],
  });
  const subtextY = useTransform(scrollYProgress, (p) => (reduceMotion ? 0 : 60 - p * 120));

  // Undefined (no inline style at all) until measured, or when reduced
  // motion is preferred — the wrapper then simply renders at its
  // natural height with zero margin, i.e. plain sequential stacking.
  const wrapperStyle =
    !reduceMotion && metrics ? { marginTop: -metrics.overlap, height: metrics.height } : undefined;

  return (
    <>
      {/* The curtain — off-white, in front. */}
      <section
        ref={curtainRef}
        className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center bg-cream px-6 py-24 text-center"
      >
        <Reveal y={20} className="mx-auto max-w-4xl">
          <h2 className="font-serif text-[clamp(2.75rem,7vw,6rem)] leading-[0.95] tracking-tight text-navy">
            Another Device To Charge And Wear?
          </h2>
        </Reveal>
        <motion.p
          style={{ y: subtextY }}
          className="mx-auto mt-8 max-w-xl text-lg text-mist"
        >
          This isn&rsquo;t about tracking steps or workouts. It&rsquo;s about
          catching the moments pressure builds quietly, in a meeting, before
          a call, mid-afternoon, before they show up in a decision you
          regret.
        </motion.p>
      </section>

      {/* The reveal — deep navy, behind. See the component doc comment
         above for exactly why the wrapper's height/margin are computed
         this way rather than fixed. */}
      <div style={wrapperStyle} className="relative">
        <div className="sticky top-0 flex h-[100svh] w-full flex-col items-center justify-center overflow-hidden bg-navy px-6 text-center text-cream">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_50%_50%,color-mix(in_oklab,var(--color-gold)_20%,transparent),transparent_70%)]"
          />
          <div className="relative">
            <h2 className="font-serif text-4xl leading-tight text-gold-soft lg:text-5xl">
              Join The London Pilot Program
            </h2>
            <motion.div
              whileHover={{ scale: reduceMotion ? 1 : 1.05 }}
              whileTap={{ scale: reduceMotion ? 1 : 0.97 }}
              transition={{ duration: 0.2 }}
              className="mt-10 inline-block"
            >
              <ShimmerLink
                href="/request-access"
                background="color-mix(in oklab, var(--color-gold) 35%, transparent)"
                shimmerColor="var(--color-gold-soft)"
                className="px-8 py-4 text-sm tracking-wide text-cream"
              >
                Request Access
              </ShimmerLink>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
