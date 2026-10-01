"use client";

import { useState, type ReactNode } from "react";
import { Pointer } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * "Click to interact" (touch: "Tap to interact") callout for every
 * interactive mockup, card and control on the site, drawn
 * outside the element it points at and joined to it by a thin leader line.
 *
 * `side` places it beside the element from `sideFrom` up (xl by default,
 * where every split layout has room on its outer side; md for a phone
 * centred in open space); below that, and whenever `side` is omitted, it
 * hangs centred underneath, and callers leave about 4rem clear below.
 * Decorative only: the element itself stays the interactive target, and
 * `hidden` fades the cue once it is in use.
 */
const SIDE_CLASSES = {
  xl: {
    right: "xl:top-[38%] xl:left-full xl:translate-x-0 xl:flex-row",
    left: "xl:top-[38%] xl:right-full xl:left-auto xl:translate-x-0 xl:flex-row-reverse",
    line: "xl:h-px xl:w-9",
  },
  md: {
    right: "md:top-[38%] md:left-full md:translate-x-0 md:flex-row",
    left: "md:top-[38%] md:right-full md:left-auto md:translate-x-0 md:flex-row-reverse",
    line: "md:h-px md:w-9",
  },
} as const;

export function ExploreCue({
  side,
  sideFrom = "xl",
  hidden = false,
}: {
  side?: "left" | "right";
  sideFrom?: "md" | "xl";
  hidden?: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      data-explore-cue
      className={cn(
        "pointer-events-none absolute top-full left-1/2 z-20 flex -translate-x-1/2 flex-col items-center transition-opacity duration-300",
        side && SIDE_CLASSES[sideFrom][side],
        hidden ? "opacity-0" : "opacity-100"
      )}
    >
      <span className={cn("block h-5 w-px bg-gold-deep/70", side && SIDE_CLASSES[sideFrom].line)} />
      <span className="flex items-center gap-2.5 rounded-full border border-gold/50 bg-navy/90 py-1.5 pr-4 pl-1.5 text-xs tracking-wide whitespace-nowrap text-cream shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <span className="relative flex size-7 items-center justify-center rounded-full bg-gold/20">
          <span className="mockup-cue-dot absolute inset-0 rounded-full" />
          <Pointer className="size-4 text-gold" />
        </span>
        <span className="[@media(hover:hover)]:hidden">Tap to interact</span>
        <span className="hidden [@media(hover:hover)]:inline">Click to interact</span>
      </span>
    </div>
  );
}

/** Wraps an interactive card or control (not a phone) with an ExploreCue
 *  that fades after the visitor's first press inside it. */
export function Explorable({
  children,
  className,
  side,
  sideFrom,
}: {
  children: ReactNode;
  className?: string;
  side?: "left" | "right";
  sideFrom?: "md" | "xl";
}) {
  const [used, setUsed] = useState(false);
  return (
    <div className={cn("relative", className)} onPointerDownCapture={() => setUsed(true)}>
      {children}
      <ExploreCue side={side} sideFrom={sideFrom} hidden={used} />
    </div>
  );
}
