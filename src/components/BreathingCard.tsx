"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Figma file Ok6qYziHfAl50GRs0YRC6O, node 8799:7572 ("A") — the
 * breathing-exercise timer card. Three things differ from the raw
 * export, per explicit instruction:
 *
 * 1. All text was outlined vector paths (invisible to screen readers,
 *    and the countdown/phase label can't animate as a path). Every one
 *    is real text/HTML below instead.
 * 2. The outer ring and inner glow were conic gradients Figma can only
 *    export as `<foreignObject>` + a CSS `conic-gradient` marked
 *    `data-figma-skip-parse`, with just a hairline stroke as the SVG
 *    fallback if the foreignObject fails to render. Reimplemented here
 *    as real CSS `conic-gradient()` on plain `<div>`s, sitting as
 *    ordinary DOM siblings rather than embedded in the SVG at all — so
 *    there's no foreignObject/HTML-in-SVG rendering path to fail.
 * 3. The body copy was #5E6165 (~3:1 on our near-black card background,
 *    below AA — it was designed against cream). Swapped for
 *    `text-cream/70`, this codebase's own established "body copy on a
 *    dark section" pairing (BandScrollShowcase, MethodScrollCards,
 *    NeuralAccordion, TheSpecs all use it), which clears 4.5:1 here.
 *
 * Token reuse (do not re-declare):
 *   - Middle ring (#998B6F -> #08243F) is an exact match for
 *     --gradient-masterclass, reused via its two component colors
 *     (--color-gold-muted / --color-navy-abyss).
 *   - Inner stroke ring (#C4B38E -> #6D644F) exactly matches the
 *     "Stroke Linear For Cards" pairing already tokenized as
 *     --color-gold-deep / --color-bronze.
 *
 * All four rings (outer conic, middle gradient, inner glow, inner
 * stroke) are plain CSS circles sized as a % of the component's own
 * width, not SVG paths — the source SVG's viewBox is 345x400, and this
 * component's box is whatever aspect the caller gives it, so any
 * circle drawn via that viewBox with `preserveAspectRatio="none"`
 * comes out as a mismatched ellipse the moment the container isn't
 * 345:400. Keeping every ring on the same "% of width, aspect-square"
 * basis is what keeps them genuinely concentric.
 *
 * The frame-crop background path (rounded top corners, square bottom —
 * an artifact of Figma's own canvas crop) is dropped entirely; the
 * parent `.card-glass` tile already supplies the real rounded-2xl
 * radius via `overflow-hidden` on this component's own root, so only a
 * plain full-bleed rect carries the gold top-fade tint.
 *
 * `useId()`-scoped gradient ids, same convention as BodySilhouette.tsx.
 *
 * Static: the ring conic-gradients and the countdown/phase text are not
 * animated. That is a deliberate follow-up, not an oversight.
 */
export function BreathingCard({ className }: { className?: string }) {
  const uid = useId();
  const id = (name: string) => `${name}-${uid}`;

  return (
    <div className={cn("relative h-full w-full overflow-hidden rounded-2xl", className)}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 345 400"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={id("paint0")}
            x1="172.5"
            y1="400"
            x2="172.5"
            y2="31.9702"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0.3" stopOpacity="0" />
            <stop offset="1" stopColor="var(--color-gold)" />
          </linearGradient>
        </defs>

        <rect
          width="345"
          height="400"
          fill={`url(#${id("paint0")})`}
          fillOpacity="0.1"
        />
      </svg>

      {/* Outer ring — real CSS conic-gradient (Figma's own computed stop
          angles/colors, copied verbatim from its foreignObject output),
          masked down to the hairline ring the fallback stroke only
          hinted at. Ordinary DOM element, not SVG-embedded. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[58%] left-1/2 aspect-square w-[62%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "conic-gradient(from 90deg, rgba(78,74,64,1) 0deg, rgba(229,218,194,1) 110.769deg, rgba(22,20,16,1) 318.462deg, rgba(78,74,64,1) 360deg)",
          opacity: 0.55,
          WebkitMaskImage:
            "radial-gradient(closest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
          maskImage:
            "radial-gradient(closest-side, transparent calc(100% - 2px), #000 calc(100% - 2px))",
        }}
      />

      {/* Middle ring — --gradient-masterclass, masked to a thin stroke. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[58%] left-1/2 aspect-square w-[47%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: "var(--gradient-masterclass)",
          opacity: 0.9,
          WebkitMaskImage:
            "radial-gradient(closest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))",
          maskImage:
            "radial-gradient(closest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))",
        }}
      />

      {/* Inner glow — full circle (the source design has no ring mask
          on this one, just a soft radial-ish conic blend). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[58%] left-1/2 aspect-square w-[24%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[4px]"
        style={{
          background:
            "conic-gradient(from 90deg, rgba(18,16,14,0) 0deg, rgba(75,118,158,1) 180deg, rgba(18,16,14,0) 295.396deg, rgba(18,16,14,0) 360deg)",
          opacity: 0.5,
        }}
      />

      {/* Inner stroke ring — the gold-deep/bronze pairing, masked the
          same way as the middle ring, sitting just inside the glow. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[58%] left-1/2 aspect-square w-[24%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "linear-gradient(180deg, var(--color-gold-deep), var(--color-bronze))",
          opacity: 0.25,
          WebkitMaskImage:
            "radial-gradient(closest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))",
          maskImage:
            "radial-gradient(closest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))",
        }}
      />

      <span className="absolute top-[8%] left-1/2 w-[85%] -translate-x-1/2 text-center text-sm leading-tight text-cream/60">
        Inhale · Hold · Exhale
      </span>

      <div className="absolute top-[58%] left-1/2 aspect-square w-[47%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
        <span className="font-serif text-4xl leading-none text-cream">5</span>
        <span className="mt-1 text-xs tracking-wide text-cream/40 uppercase">
          sec
        </span>
      </div>
    </div>
  );
}
