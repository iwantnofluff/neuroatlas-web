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
 * reveal simply appearing after the curtain with no overlap at all):
 *
 *   extraHeight = overlap + hold
 *
 * Bug #3 — a real, confirmed bug this replaces: extraHeight used to
 * ALSO add the curtain's own full rendered height on top of overlap +
 * hold. That's a genuine double-count, not just an oversized value —
 * work through the actual scroll position where the sticky reveal
 * releases (bottom of this wrapper minus the sticky child's own
 * viewport-height, in absolute page coordinates counting from the
 * curtain's own start) and it comes out to `2×curtainHeight + hold`,
 * not the intended `curtainHeight + hold` (curtain fully scrolled past,
 * plus a hold). The extra, erroneous `+curtainHeight` went unnoticed
 * while every caller's curtain was roughly one viewport tall (~900px) —
 * a barely-noticeable extra viewport of dead pinned scroll — but once
 * /the-science reused this component with a curtain that has its OWN
 * long internal scroll-jacked track (EditorialIndexSection, several
 * viewports tall), the same bug added that entire height a second time
 * as pure dead scroll on the CTA behind it, confirmed live: this pair
 * of sections alone was eating roughly 60% of the whole page's total
 * scroll length, reported as the footer being unreachable — not
 * literally impossible to reach (a direct scrollTo() proved it
 * technically still could), but long enough that a real person
 * scrolling normally reasonably gave up and called it stuck. Dropping
 * curtainHeight from the formula entirely fixes both callers at once:
 * /band's curtain (~1 viewport) loses one viewport of unnecessary dead
 * scroll it never needed either; /the-science's now loses several.
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
    // No longer reads curtainEl's own height at all (see Bug #3 above) —
    // the metrics only depend on viewport height now, so a window
    // resize is the only thing that can actually change them. The
    // ResizeObserver on the curtain element is gone with it; nothing
    // here needs to know when the curtain itself resizes any more.
    function recompute() {
      const viewportHeight = window.innerHeight;
      const overlap = viewportHeight * OVERLAP_RATIO;
      const hold = viewportHeight * HOLD_RATIO;
      setMetrics({ overlap, height: viewportHeight + overlap + hold });
    }

    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, []);

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
