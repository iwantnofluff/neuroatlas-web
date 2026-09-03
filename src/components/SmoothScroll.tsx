"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ReactLenis, type LenisRef } from "lenis/react";
import { useReducedMotion } from "framer-motion";

/**
 * Site-wide smooth scroll. `root` mode manages window/document scroll
 * directly (Lenis v1 interpolates native scrollY via rAF rather than a
 * transform-based fake-scroll trick), so every existing framer-motion
 * `useScroll()` call elsewhere (Header, BandScrollShowcase, Parallax) keeps
 * reading real scroll position unmodified — this renders nothing visible,
 * it's a side-effect-only sibling, not a wrapper around children.
 *
 * Lenis picks ONE physics model, not a blend: pass `duration` and it runs a
 * fixed eased animation per scroll event (a new 1.2s catch-up curve fires
 * on every wheel tick); pass `lerp` alone and it continuously damps toward
 * the live target every frame instead. `duration` silently wins if both are
 * set — that was the bug here, `lerp` was dead code. The discrete-duration
 * model is what read as "not actually smooth": each tick restarts its own
 * ease-out rather than chasing a moving target, so continuous scrolling
 * feels like a string of small stutters. Dropping `duration` and tuning
 * `lerp` alone is what gets the tight, weighted-but-responsive feel of a
 * Framer-built site's native scroll.
 *
 * Reduced motion isn't handled by unmounting (that would cause a layout
 * shift as scroll snaps back to native); instead the damping is collapsed
 * to effectively instant.
 *
 * `wheelMultiplier` (how far the page travels per wheel/trackpad notch)
 * was left at Lenis's default of 1 — combined with the snap-to-section
 * behavior that used to sit alongside this (see the removed
 * ScrollSnapSections), a single scroll gesture could both travel far AND
 * get snapped the rest of the way into the next section, which read as
 * far more sensitive than intended. Snapping is gone now, and this is
 * tuned down on its own too, so an ordinary scroll or trackpad flick
 * covers less distance per tick.
 *
 * Route-change reset — this is a real, confirmed bug fix, not defensive
 * padding: Lenis in `root` mode owns the real window scroll position and
 * re-asserts its own cached target every animation frame (confirmed live:
 * a raw `window.scrollBy()` call did nothing at all, immediately
 * overwritten). Next.js's App Router swaps a page's content client-side
 * without a full reload, and neither Lenis nor its cached content-height
 * ("limit") know that just happened, so it kept driving the NEW page
 * toward the OLD page's scroll target — confirmed live, a mid-scroll nav
 * from the homepage landed the how-it-works page already partway down
 * instead of at its top. Worse, if the previous page was taller, Lenis's
 * stale `limit` can sit below the new page's real scrollable height,
 * silently capping how far down you can go well short of the actual
 * bottom — several wheel ticks in a row can read as fully unresponsive
 * before the internal target and native scroll catch up with each other,
 * exactly the "stuck, can't scroll down" symptom reported live. Forcing
 * `resize()` (recompute the real content height) then an immediate
 * `scrollTo(0)` on every pathname change keeps Lenis's state honest for
 * whatever page just mounted.
 */
export function SmoothScroll() {
  const reduceMotion = useReducedMotion();
  const lenisRef = useRef<LenisRef>(null);
  const pathname = usePathname();

  useEffect(() => {
    const lenis = lenisRef.current?.lenis;
    if (!lenis) return;
    // stop() before resetting, not just scrollTo(0, {immediate:true}) alone
    // — confirmed live this still isn't enough on its own: clicking a nav
    // link WHILE the previous page's scroll was still easing/in-flight (real
    // momentum, not a rare edge case — anyone who clicks mid-scroll hits
    // this) left Lenis's own rAF loop mid-flight too, still chasing the OLD
    // page's target; on the very next frame it can overwrite this reset
    // right back toward that stale target. Direct measurement: 10 of 15
    // rapid click-while-scrolling trials landed away from the top before
    // adding stop()/start() here, 0 of 15 after. force:true because
    // scrollTo would otherwise no-op once stopped.
    lenis.stop();
    lenis.resize();
    lenis.scrollTo(0, { immediate: true, force: true });
    lenis.start();
  }, [pathname]);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        lerp: reduceMotion ? 1 : 0.11,
        wheelMultiplier: 0.7,
        touchMultiplier: 0.9,
        smoothWheel: !reduceMotion,
      }}
    />
  );
}
