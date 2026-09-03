"use client";

import { ReactLenis } from "lenis/react";
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
 */
export function SmoothScroll() {
  const reduceMotion = useReducedMotion();

  return (
    <ReactLenis
      root
      options={{
        lerp: reduceMotion ? 1 : 0.11,
        wheelMultiplier: 0.7,
        touchMultiplier: 0.9,
        smoothWheel: !reduceMotion,
      }}
    />
  );
}
