"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/**
 * "Built With Neuroscience" media panel — the client-supplied reference
 * photo (a glowing line-art wrist/band illustration with a printed,
 * static ECG trace above the arm) as the background, with a real,
 * animated heartbeat waveform layered on top of where that printed
 * trace sits, rather than trying to animate the raster image itself.
 *
 * The photo's own top third (where its static wave is printed) is
 * dimmed under a scrim so the live trace above reads as THE wave,
 * not a second one competing with it — the arm/hand/band underneath
 * stays fully visible.
 *
 * The waveform is a single heartbeat-blip path tiled twice back to
 * back inside a wrapper twice as wide as its container, looping via a
 * CSS `translateX(0 → -50%)` animation — the standard seamless-scroll
 * trick (duplicate the content once, animate exactly half its total
 * width) rather than a JS-driven redraw. Respects prefers-reduced-motion
 * (this codebase's `useSafeReducedMotion`) by freezing the scroll and
 * falling back to a `stroke-dasharray` reveal only, same "still
 * functions, just instant/static" convention as Reveal.tsx/HeroMedia.tsx.
 */
export function NeuroWaveVisual({ className }: { className?: string }) {
  const reduceMotion = useSafeReducedMotion();

  return (
    <div className={cn("relative size-full overflow-hidden", className)}>
      <Image
        src="/photos/neuroscience-wrist.png"
        alt="A hand touching the NeuroAtlas band on a wrist, with a heartbeat waveform above"
        fill
        sizes="(min-width: 1024px) 40vw, 90vw"
        className="object-cover"
      />

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[38%] bg-gradient-to-b from-navy/90 via-navy/50 to-transparent"
      />

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-[10%] h-[18%] overflow-hidden"
        style={{ filter: "drop-shadow(0 0 6px var(--color-gold)) drop-shadow(0 0 14px color-mix(in oklab, var(--color-gold) 60%, transparent))" }}
      >
        <div
          className={cn("flex h-full w-[200%]", !reduceMotion && "animate-ecg-scroll")}
        >
          <EcgStrip />
          <EcgStrip />
        </div>
      </div>
    </div>
  );
}

function EcgStrip() {
  return (
    <svg
      viewBox="0 0 800 100"
      preserveAspectRatio="none"
      className="h-full w-1/2 shrink-0"
      fill="none"
    >
      <path
        d="M0 50 H60 L80 50 L92 20 L104 80 L116 50 L136 50 H260 L280 50 L292 20 L304 80 L316 50 L336 50 H460 L480 50 L492 20 L504 80 L516 50 L536 50 H660 L680 50 L692 20 L704 80 L716 50 L736 50 H800"
        stroke="var(--color-gold)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
