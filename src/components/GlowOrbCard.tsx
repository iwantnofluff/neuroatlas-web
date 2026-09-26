"use client";

import { cn } from "@/lib/utils";

/**
 * Figma file Ok6qYziHfAl50GRs0YRC6O, node 8315:9468 ("Frame 1998") — two
 * concentric rings around a small glowing orb.
 *
 * Token reuse (do not re-declare):
 *   - Outer ring is the same angular gradient (#4E4A40 -> #E5DAC2 ->
 *     #16140F, conic from 90deg, 0.55 opacity) as BreathingCard's outer
 *     ring — reimplemented the same way, as a masked CSS
 *     `conic-gradient()` on a real element rather than Figma's
 *     foreignObject export.
 *   - Inner ring stroke (#998B6F -> #08243F) is an exact match for
 *     --gradient-masterclass, reused rather than hardcoded.
 *   - The orb's core gradient runs --color-gold -> #F3CB6D ->
 *     --color-gold-soft. The middle stop (#F3CB6D, a warm yellow) has
 *     no existing token match and is left as literal hex — flagged to
 *     the user rather than inventing one.
 *
 * The source frame is a perfect square (185x185) and every element in
 * it is concentric, so this component is just `aspect-square` sized by
 * height and centered by the caller, same convention as
 * BodySilhouette.tsx — no distortion risk the way the breathing card's
 * non-square rings had.
 *
 * Static: no pulse/breathe animation on the orb. Deliberate, not an
 * oversight.
 */
export function GlowOrbCard({ className }: { className?: string }) {
  return (
    <div className={cn("relative aspect-square", className)}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-auto aspect-square w-[98%] rounded-full"
        style={{
          background:
            "conic-gradient(from 90deg, rgba(78,74,64,1) 0deg, rgba(229,218,194,1) 110.769deg, rgba(22,20,16,1) 318.462deg, rgba(78,74,64,1) 360deg)",
          opacity: 0.4,
          WebkitMaskImage:
            "radial-gradient(closest-side, transparent calc(100% - 1px), #000 calc(100% - 1px))",
          maskImage:
            "radial-gradient(closest-side, transparent calc(100% - 1px), #000 calc(100% - 1px))",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-auto aspect-square w-[75%] rounded-full"
        style={{
          background: "var(--gradient-masterclass)",
          opacity: 0.7,
          WebkitMaskImage:
            "radial-gradient(closest-side, transparent calc(100% - 1px), #000 calc(100% - 1px))",
          maskImage:
            "radial-gradient(closest-side, transparent calc(100% - 1px), #000 calc(100% - 1px))",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-auto aspect-square w-[36%] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(243,203,109,0.55) 0%, rgba(218,199,158,0.3) 45%, rgba(218,199,158,0) 75%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 m-auto aspect-square w-[17%] rounded-full"
        style={{
          background:
            "linear-gradient(90deg, var(--color-gold), #F3CB6D, var(--color-gold-soft))",
        }}
      />
    </div>
  );
}
