"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

type CountUpProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  /** Decimal places to keep — 0 for a plain integer count. */
  decimals?: number;
  duration?: number;
  className?: string;
};

/**
 * "Count-Up Kinetics" — animates a number from 0 up to `value` once it
 * scrolls into view, for /for-organisations' "Cost Of Burnout" stat row.
 *
 * Drives a plain `useState` string via framer-motion's standalone
 * `animate()`, not a `useMotionValue` rendered as a child — the display
 * text needs real number formatting (locale thousands separators, a
 * fixed decimal count) wrapped in a prefix/suffix, which is simpler to
 * produce in a plain `onUpdate` callback than to template through a
 * MotionValue. `animate()` stops calling `onUpdate` on its own once the
 * tween completes, so this is one state update per frame for ~1.6s, not
 * a runaway interval.
 *
 * `useInView(ref, { once: true, amount: 0.4 })` — a higher `amount` than
 * Reveal.tsx's own 0.15 (see that file's comment on why 0.15 is right
 * for a fade-in): a count-up reads as a distinct, attention-grabbing
 * moment, so it should fire once the stat is genuinely centred in the
 * viewport, not the instant its first sliver appears from the bottom
 * edge.
 *
 * reduceMotion skips straight to the settled formatted value rather than
 * animating — the initial `useState` value is always the ZERO-formatted
 * string regardless (matching every other reduceMotion-aware component
 * in this codebase, e.g. useSafeReducedMotion's own doc comment: it
 * always resolves `false` on the very first client render, so branching
 * the INITIAL state on it would either mismatch the server render or
 * still show 0 anyway until the effect below corrects it a tick later).
 */
export function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.6,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduceMotion = useSafeReducedMotion();
  const [display, setDisplay] = useState(() => formatValue(0, decimals));

  useEffect(() => {
    if (!inView) return;
    // duration: 0 for reduceMotion rather than a direct setState call
    // here in the effect body — animate() still calls onUpdate (once,
    // with the settled value), which keeps the actual state write
    // inside that callback in every case, not duplicated as a separate
    // synchronous setState branch (the React Compiler's
    // react-hooks/set-state-in-effect rule flags exactly that pattern).
    const controls = animate(0, value, {
      duration: reduceMotion ? 0 : duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(formatValue(latest, decimals)),
    });
    return () => controls.stop();
  }, [inView, reduceMotion, value, decimals, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

function formatValue(value: number, decimals: number) {
  return value.toLocaleString("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
