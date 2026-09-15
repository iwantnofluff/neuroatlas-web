"use client";

import { motion } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { cn } from "@/lib/utils";

/**
 * A small "this is actively happening" indicator — a solid dot with an
 * outward-expanding ring pulsing behind it, the same visual grammar as
 * a live-broadcast/status indicator. Used next to the India pilot
 * mention in the status section: momentum, not a claim about literal
 * real-time data.
 *
 * Same reduceMotion convention as Hero.tsx's own scroll chevron (a
 * looping `animate` with `repeat: Infinity`) — reduced motion collapses
 * straight to a plain static dot, no ring, rather than disabling just
 * the loop and leaving an odd half-animated state.
 */
export function LivePulseDot({ className }: { className?: string }) {
  const reduceMotion = useSafeReducedMotion();

  return (
    <span className={cn("relative inline-flex size-2.5", className)} aria-hidden="true">
      {!reduceMotion && (
        <motion.span
          className="absolute inset-0 rounded-full bg-gold"
          initial={{ opacity: 0.6, scale: 1 }}
          animate={{ opacity: 0, scale: 2.2 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span className="relative size-2.5 rounded-full bg-gold" />
    </span>
  );
}
