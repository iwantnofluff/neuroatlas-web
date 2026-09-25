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
 *   - Middle ring stroke (`paint3`, #998B6F -> #08243F) is an exact
 *     match for --gradient-masterclass, reused via its two component
 *     colors (--color-gold-muted / --color-navy-abyss).
 *   - Inner ring's plain stroke (`paint5`, #C4B38E -> #6D644F) exactly
 *     matches the "Stroke Linear For Cards" pairing already tokenized
 *     as --color-gold-deep / --color-bronze.
 *   - "505" and the divider's mid-stop and pagination dots use three of
 *     the file's five "warm sand" colors: #E5DAC2 -> --color-gold-soft,
 *     #DAC79E -> --color-gold both map exactly. #ECE3D1 (pagination
 *     dots) and #C8B68F (divider mid-stop) do NOT match any existing
 *     token and are left as literal hex — flagged to the user rather
 *     than inventing new tokens for them.
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
          <linearGradient
            id={id("paint1")}
            x1="10"
            y1="50.5"
            x2="335"
            y2="50.5"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#12100E" stopOpacity="0" />
            <stop offset="0.5" stopColor="#C8B68F" stopOpacity="0.6" />
            <stop offset="1" stopColor="#12100E" stopOpacity="0" />
          </linearGradient>
          <linearGradient
            id={id("paint3")}
            x1="172"
            y1="150"
            x2="172"
            y2="289"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="var(--color-gold-muted)" />
            <stop offset="1" stopColor="var(--color-navy-abyss)" />
          </linearGradient>
          <linearGradient
            id={id("paint5")}
            x1="172.5"
            y1="184"
            x2="172.5"
            y2="255"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="var(--color-gold-deep)" />
            <stop offset="1" stopColor="var(--color-bronze)" />
          </linearGradient>
        </defs>

        <rect
          width="345"
          height="400"
          fill={`url(#${id("paint0")})`}
          fillOpacity="0.1"
        />
        <line
          x1="10"
          y1="49.5"
          x2="335"
          y2="49.5"
          stroke={`url(#${id("paint1")})`}
          strokeOpacity="0.5"
        />
        <path
          opacity="0.9"
          d="M172 150.5C209.828 150.5 240.5 181.389 240.5 219.5C240.5 257.611 209.828 288.5 172 288.5C134.172 288.5 103.5 257.611 103.5 219.5C103.5 181.389 134.172 150.5 172 150.5Z"
          stroke={`url(#${id("paint3")})`}
        />
        <circle
          cx="172.5"
          cy="219.5"
          r="35"
          stroke={`url(#${id("paint5")})`}
          strokeOpacity="0.25"
        />
        <circle cx="164" cy="384.5" r="5.5" fill="#ECE3D1" />
        <circle opacity="0.3" cx="181" cy="384.5" r="5.5" fill="#ECE3D1" />
      </svg>

      {/* Outer ring — real CSS conic-gradient (Figma's own computed stop
          angles/colors, copied verbatim from its foreignObject output),
          masked down to the hairline ring the fallback stroke only
          hinted at. Ordinary DOM element, not SVG-embedded. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[54.9%] left-1/2 aspect-square w-[52.5%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "conic-gradient(from 90deg, rgba(78,74,64,1) 0deg, rgba(229,218,194,1) 110.769deg, rgba(22,20,16,1) 318.462deg, rgba(78,74,64,1) 360deg)",
          opacity: 0.55,
          WebkitMaskImage:
            "radial-gradient(closest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))",
          maskImage:
            "radial-gradient(closest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))",
        }}
      />

      {/* Inner glow — same technique, full circle (the source design has
          no ring mask on this one, just a soft radial-ish conic blend). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[54.9%] left-1/2 aspect-square w-[20.6%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[3px]"
        style={{
          background:
            "conic-gradient(from 90deg, rgba(18,16,14,0) 0deg, rgba(75,118,158,1) 180deg, rgba(18,16,14,0) 295.396deg, rgba(18,16,14,0) 360deg)",
          opacity: 0.5,
        }}
      />

      <span className="absolute top-[3%] left-1/2 w-[85%] -translate-x-1/2 text-center text-xs leading-tight font-medium tracking-[0.05em] text-cream/50 uppercase">
        Authoritative Mode
      </span>
      <span className="absolute top-[21%] left-1/2 -translate-x-1/2 font-serif text-base leading-none text-gold-soft">
        505
      </span>
      <span className="absolute top-[31%] left-1/2 w-[85%] -translate-x-1/2 text-center text-[0.55rem] leading-tight text-cream/60">
        Inhale · Hold · Exhale
      </span>

      <div className="absolute top-[54.9%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <span className="font-serif text-3xl text-cream">5</span>
        <span className="text-[0.6rem] tracking-wide text-cream/40 uppercase">
          sec
        </span>
      </div>

      <span className="absolute top-[75%] left-1/2 -translate-x-1/2 text-xs font-medium tracking-[0.05em] text-cream uppercase">
        Inhale
      </span>

      <p className="absolute top-[83%] left-1/2 w-[88%] -translate-x-1/2 text-center text-[0.55rem] leading-snug text-cream/70">
        Breathe in through your nose for 5 counts
      </p>
    </div>
  );
}
