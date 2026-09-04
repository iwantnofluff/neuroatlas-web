"use client";

import { useEffect, useState, type ReactNode, type RefObject } from "react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { cn } from "@/lib/utils";

// Overlap (how far the reveal's document position is pulled up into the
// curtain's tail — i.e. the lift transition's own duration) and hold
// (how long the reveal stays fully visible and interactive before
// releasing into whatever comes after it) are both a fraction of the
// viewport height.
const OVERLAP_RATIO = 0.5;
const HOLD_RATIO = 0.3;

/**
 * The generic "curtain reveal" mechanism, extracted from
 * ClosingCurtainSection.tsx (originally built for /band's closing CTA)
 * so a second page can reuse the same, already-debugged stacking
 * physics against entirely different content rather than re-deriving
 * it — and risking the same two bugs again.
 *
 * `curtain` scrolls normally, in front (z-10, and needs to be opaque
 * itself via `curtainClassName` — this component doesn't force a
 * background, since callers want different ones). `reveal` sits behind
 * it (default z-index, i.e. z-0 relative to the curtain) and stays
 * pinned to the viewport for a held stretch of scroll, so as the
 * curtain scrolls up and off, it looks like it's physically lifting
 * away to reveal what's underneath, rather than the two just scrolling
 * past each other at the same rate.
 *
 * The stacking trick, worked out by hand against the actual sticky-
 * positioning spec (through two real bugs, each caught live via
 * Playwright building the original /band version, not assumed):
 *
 * Bug #1 — `position: sticky; bottom: 0` (the natural first guess) is
 * the wrong tool for a page that only ever scrolls downward: `bottom`
 * sticky only holds an element in place while scrolling UP (it resists
 * escaping downward through the bottom edge — the right tool for
 * something like a reversed list's toolbar). For an element entering
 * from below and needing to hold in place while scrolling DOWN, `top`
 * sticky is correct (it resists escaping upward through the top edge)
 * — confirmed live: with `bottom-0` the panel just rendered at its
 * plain static position the entire time, never once clamping to the
 * viewport edge. Since the reveal's own height is exactly one
 * viewport, `top: 0` and "flush with the viewport's bottom edge" land
 * on the exact same box position, so this costs nothing visually.
 *
 * Bug #2 — a sticky element only stays clamped for as long as its OWN
 * containing block still has room left past it — one that's simply
 * the last thing in its parent has none (the parent ends exactly where
 * the sticky element's own static box ends, so "finished holding" and
 * "hit the end" are always the same instant). So the reveal is wrapped
 * in a plain `<div>` deliberately taller than the reveal itself, with a
 * negative top margin pulling that wrapper's document position up into
 * the curtain's tail (so the two genuinely overlap, rather than the
 * reveal simply appearing after the curtain with no overlap at all).
 * The wrapper's required extra height is MEASURED, not guessed — an
 * earlier fixed/guessed value under-provisioned it and whatever
 * followed on the page visibly intruded before the curtain had even
 * finished lifting. It depends on the curtain's actual rendered height
 * (which varies with viewport width and with whatever content the
 * caller passes in), plus how long the lift itself takes, plus the
 * desired hold:
 *
 *   extraHeight = curtainHeight + overlap + hold
 *
 * (derived from the sticky spec: the wrapper's bottom must not be
 * reached until the curtain has fully departed AND the hold has
 * played out, or whatever comes next starts showing through the gap
 * early).
 *
 * reduceMotion skips the whole mechanism (no inline margin/height —
 * the two blocks just stack in normal sequence) rather than trying to
 * disable only the "motion" inside an otherwise-unchanged layout,
 * matching this codebase's established convention of collapsing a
 * scroll-rigged wrapper back to auto height.
 *
 * `curtainRef` is owned by the CALLER, not created internally — a
 * caller with its own scroll-linked content inside `curtain` (e.g. a
 * parallax subtext) needs that exact same DOM node as ITS OWN
 * `useScroll` target, and two separate refs can't both resolve to one
 * element. Passing the ref in once and using it for both jobs avoids
 * that conflict entirely.
 */
export function CurtainReveal({
  curtainRef,
  curtain,
  reveal,
  curtainClassName,
  revealClassName,
}: {
  curtainRef: RefObject<HTMLDivElement | null>;
  curtain: ReactNode;
  reveal: ReactNode;
  curtainClassName?: string;
  revealClassName?: string;
}) {
  const reduceMotion = useSafeReducedMotion();
  const [metrics, setMetrics] = useState<{ overlap: number; height: number } | null>(null);

  useEffect(() => {
    const curtainEl = curtainRef.current;
    if (!curtainEl) return;

    function recompute() {
      const curtainHeight = curtainEl!.getBoundingClientRect().height;
      const viewportHeight = window.innerHeight;
      const overlap = viewportHeight * OVERLAP_RATIO;
      const hold = viewportHeight * HOLD_RATIO;
      const extra = curtainHeight + overlap + hold;
      setMetrics({ overlap, height: viewportHeight + extra });
    }

    recompute();
    const ro = new ResizeObserver(recompute);
    ro.observe(curtainEl);
    window.addEventListener("resize", recompute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recompute);
    };
  }, [curtainRef]);

  // Undefined (no inline style at all) until measured, or when reduced
  // motion is preferred — the wrapper then simply renders at its
  // natural height with zero margin, i.e. plain sequential stacking.
  const wrapperStyle =
    !reduceMotion && metrics ? { marginTop: -metrics.overlap, height: metrics.height } : undefined;

  return (
    <>
      <div ref={curtainRef} className={cn("relative z-10", curtainClassName)}>
        {curtain}
      </div>
      <div style={wrapperStyle} className="relative">
        <div className={cn("sticky top-0 h-[100svh] w-full overflow-hidden", revealClassName)}>
          {reveal}
        </div>
      </div>
    </>
  );
}
