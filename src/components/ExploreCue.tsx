"use client";

import { useState, type ReactNode } from "react";
import { Pointer } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * "Tap to explore" callout for interactive mockups and cards, drawn
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
      <span className="flex items-center gap-2 rounded-full border border-gold-soft/35 bg-navy/85 py-1.5 pr-3.5 pl-1.5 text-[11px] tracking-wide whitespace-nowrap text-cream shadow-[0_8px_24px_-8px_rgba(0,0,0,0.5)] backdrop-blur-md">
        <span className="relative flex size-6 items-center justify-center rounded-full bg-gold/15">
          <span className="mockup-cue-dot absolute inset-0 rounded-full" />
          <Pointer className="size-3.5 text-gold-soft" />
        </span>
        <span className="[@media(hover:hover)]:hidden">Tap to explore</span>
        <span className="hidden [@media(hover:hover)]:inline">Click to explore</span>
      </span>
    </div>
  );
}

/** Wraps an interactive card (not a phone) with an ExploreCue that fades
 *  after the visitor's first press inside it. */
export function Explorable({ children, className }: { children: ReactNode; className?: string }) {
  const [used, setUsed] = useState(false);
  return (
    <div className={cn("relative", className)} onPointerDownCapture={() => setUsed(true)}>
      {children}
      <ExploreCue hidden={used} />
    </div>
  );
}
