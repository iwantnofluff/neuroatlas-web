"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Figma file Ok6qYziHfAl50GRs0YRC6O, node 9235:7987 ("A") — a "0% Sync"
 * progress indicator: a rounded heptagon outline, a faint inner ring,
 * two blue tick marks (top/bottom), a white progress dot, and a
 * "0% / Sync" label at center.
 *
 * The Figma export's heptagon stroke is the exact hex of --color-gold
 * (#DAC79E) — reused rather than hardcoded. Everything else here
 * (the ring, ticks, dot) is a local/unnamed fill in the source file,
 * not a shared style, so it stays literal hex.
 *
 * The root frame's own gradient background/padding/radius from Figma
 * is dropped — this sits inside a `.card-glass` tile that already
 * supplies its own background and radius, same as BreathingCard.tsx.
 * The source file's hand-cursor illustration (a drag affordance for an
 * interactive prototype) is also dropped: this is a static marketing
 * tile, not an interactive control.
 *
 * The heptagon is drawn from Figma's own path data at its native
 * 249x288 aspect ratio, and this component's own root keeps that exact
 * aspect (`aspect-[249/288]`) rather than stretching to fill an
 * arbitrary container — the same reasoning as BodySilhouette.tsx: a
 * non-matching container aspect would otherwise skew the heptagon and
 * rings into distorted, non-concentric shapes.
 *
 * `useId()`-scoped filter id, same convention as the other Figma
 * components in this codebase.
 *
 * Static: the "0%" value and the progress dot are not animated. That
 * is a deliberate follow-up, not an oversight.
 */
export function SyncRingCard({ className }: { className?: string }) {
  const uid = useId();
  const id = (name: string) => `${name}-${uid}`;

  const heptagonPath =
    "M103.103 7.67945C114.675 2.10685 128.154 2.10685 139.726 7.67945L200.441 36.9184C212.013 42.491 220.417 53.0297 223.275 65.5512L238.271 131.251C241.128 143.772 238.129 156.914 230.121 166.955L188.105 219.642C180.097 229.683 167.953 235.532 155.109 235.532H87.7201C74.8765 235.532 62.732 229.683 54.7242 219.642L12.7079 166.955C4.70005 156.914 1.70059 143.772 4.55854 131.251L19.554 65.5512C22.4119 53.0297 30.8163 42.491 42.3879 36.9184L103.103 7.67945Z";

  return (
    <div className={cn("relative aspect-[249/288]", className)}>
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 249 288"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <filter id={id("heptagon-blur")}>
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>
        <g transform="translate(3, 23)" opacity="0.6" filter={`url(#${id("heptagon-blur")})`}>
          <path d={heptagonPath} stroke="var(--color-gold)" strokeWidth="9" />
        </g>
        <g transform="translate(3, 23)">
          <path d={heptagonPath} stroke="var(--color-gold)" strokeWidth="6" />
        </g>
        <circle
          cx="125"
          cy="145.74"
          r="68.77"
          stroke="#F2F2F2"
          strokeOpacity="0.1"
          strokeWidth="7"
        />
      </svg>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[6%] left-1/2 h-[15%] w-[3.4%] -translate-x-1/2 rounded-full"
        style={{
          background: "linear-gradient(180deg, #4b769e, transparent)",
          boxShadow: "0 0 12px 2px rgba(75,118,158,0.6)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[92%] left-1/2 h-[15%] w-[3.4%] -translate-x-1/2 -translate-y-full rounded-full"
        style={{
          background: "linear-gradient(0deg, #4b769e, transparent)",
          boxShadow: "0 0 12px 2px rgba(75,118,158,0.6)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-[57%] left-[96.6%] size-[8%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F2F2F2]"
        style={{ boxShadow: "0 0 10px 2px rgba(242,242,242,0.5)" }}
      />

      <div className="absolute top-[53%] left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center opacity-40">
        <span className="font-serif text-3xl text-cream">0%</span>
        <span className="text-xs text-cream/70">Sync</span>
      </div>
    </div>
  );
}
