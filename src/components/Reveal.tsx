"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

type RevealProps = {
  children?: ReactNode;
  className?: string;
  /** Stagger offset in seconds — pass i * 0.08 when mapping over a list. */
  delay?: number;
  /** Starting vertical offset in px. */
  y?: number;
  /** Root element — "li" when used inside a <ul>/<ol>. */
  as?: "div" | "li";
};

/**
 * Fade-and-rise-in wrapper, triggered once when scrolled into view.
 * Respects prefers-reduced-motion (content just appears, no motion).
 *
 * `initial`/`whileInView` are ALWAYS the same shape here — never toggled
 * to `false`/`undefined` based on reduceMotion, only their VALUES change
 * (via the transition duration below). `useSafeReducedMotion()` is
 * deliberately `false` on the very first client render and only flips to
 * the real value after mount (see its own comment — an SSR-hydration-
 * mismatch workaround). For content below the fold, that first render
 * commits `initial={{ opacity: 0, y }}` to the DOM immediately (initial
 * values apply on mount regardless of viewport visibility), and
 * `whileInView` hasn't fired yet since it's off-screen. If reduceMotion
 * then flips true before that element ever scrolls into view, an
 * earlier version of this toggled `initial` to `false` and `whileInView`
 * to `undefined` on the re-render — neither of which does anything
 * retroactively, so the element was left permanently stuck at opacity 0
 * with nothing left to ever animate it back (confirmed live: a section
 * far down the page rendered completely blank under reduced motion,
 * verified via getBoundingClientRect + getComputedStyle, not just a
 * screenshot). Keeping the props' shape constant and only zeroing the
 * transition's duration/delay avoids the whole bug class — reduced-
 * motion users still get an instant pop-in once scrolled into view
 * rather than a gradual fade, never a permanently invisible element.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = "div",
}: RevealProps) {
  const reduceMotion = useSafeReducedMotion();
  const MotionTag = as === "li" ? motion.li : motion.div;

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: reduceMotion ? 0 : 0.6,
        delay: reduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}
