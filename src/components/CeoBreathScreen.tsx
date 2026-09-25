"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Wifi, BatteryFull } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/**
 * Figma file Ok6qYziHfAl50GRs0YRC6O, node 13293:14091 ("PPP02") — a
 * full "CEO Breath" exercise screen: status bar, back arrow, a
 * 5-segment step progress row, title/subtitle, the breathing card
 * (Authoritative Mode / "5 0 5" / ring / countdown / phase word), and
 * a bottom "Next" button. This is the SAME ring design as
 * BreathingCard.tsx (built for the homepage's "Inside the App" tile),
 * redrawn here rather than reused directly — that component was
 * deliberately stripped down to just the ring + phase line per an
 * earlier request, and this screen needs the full card intact.
 *
 * Token reuse (do not re-declare):
 *   - Middle ring is --gradient-masterclass (exact hex match, same as
 *     BreathingCard.tsx).
 *   - Inner stroke ring is --color-gold-deep / --color-bronze (exact
 *     match, same as BreathingCard.tsx).
 *   - "Next" button fill (#E5DAC2) and countdown/label tan tones are
 *     exact matches for --color-gold-soft / --color-gold.
 * The background (#080911), the segment-progress gradient, and the
 * outer ring's conic gradient are the app's own local palette and stay
 * literal hex, consistent with BreathingCard.tsx/VitalsDashboard.tsx.
 *
 * Live interactive: the countdown genuinely ticks (4 -> 3 -> 2 -> 1 ->
 * cycles Inhale -> Hold -> Exhale -> Inhale), driven by a real
 * interval — not a static screenshot. Frozen on its resting frame
 * under prefers-reduced-motion, same convention as every other
 * animated piece in this codebase (NeuroWaveVisual, Hero, Reveal).
 */
const PHASES = [
  { label: "Inhale", body: "Breathe in through your nose for 5 counts" },
  { label: "Hold", body: "Hold gently, keep your shoulders soft" },
  { label: "Exhale", body: "Breathe out slowly through your mouth" },
] as const;

export function CeoBreathScreen({ className }: { className?: string }) {
  const reduceMotion = useSafeReducedMotion();
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(4);

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev > 1) return prev - 1;
        setPhaseIndex((p) => (p + 1) % PHASES.length);
        return 4;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [reduceMotion]);

  const phase = PHASES[phaseIndex];

  return (
    <div
      className={cn("relative flex size-full flex-col overflow-hidden", className)}
      style={{ backgroundColor: "#080911" }}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between px-6 pt-3 text-[#f2f2f2]">
        <span className="text-sm font-semibold tracking-tight">9:41</span>
        <div className="flex items-center gap-1.5">
          <Wifi className="size-3.5" />
          <BatteryFull className="size-4" />
        </div>
      </div>

      {/* Back arrow + step progress */}
      <div className="relative mt-6 flex items-center justify-center px-6">
        <button
          type="button"
          aria-label="Back"
          className="absolute left-6 text-gold-soft"
        >
          <ChevronLeft className="size-6" />
        </button>
        <div className="flex items-center gap-3">
          <span
            className="h-1 w-6 rounded-full"
            style={{ background: "linear-gradient(90deg, #998b6f, var(--color-gold))" }}
          />
          <span
            className="h-1 w-6 rounded-full"
            style={{ background: "linear-gradient(90deg, #998b6f, var(--color-gold))" }}
          />
          <span className="h-1 w-6 rounded-full border border-black/20 bg-[#f2f2f2]/10" />
          <span className="h-1 w-6 rounded-full border border-black/20 bg-[#f2f2f2]/10" />
          <span className="h-1 w-6 rounded-full border border-black/20 bg-[#f2f2f2]/10" />
        </div>
      </div>
      <div className="mt-4 border-b border-white/10" />

      {/* Title */}
      <div className="mt-8 flex flex-col items-center gap-1 px-6 text-center">
        <p className="text-2xl text-gold-soft">CEO Breath</p>
        <p className="text-base font-light text-[#c6c7c9]">
          Stabilise heart rate, tone, and presence.
        </p>
      </div>

      {/* Breathing card */}
      <div className="mx-6 mt-8 flex flex-col items-center gap-4 rounded-3xl bg-gold/10 px-3 pt-4 pb-2.5">
        <p className="text-xs text-[#c6c7c9]">Authoritative Mode</p>
        <div className="h-px w-full bg-white/15" />

        <div className="flex flex-col items-center gap-0.5">
          <p className="font-serif text-2xl tracking-[0.3em] text-gold-soft">505</p>
          <p className="text-[10px] font-light text-[#c6c7c9]">Inhale • Hold • Exhale</p>
        </div>

        <div className="relative my-1 flex aspect-square w-[48%] items-center justify-center">
          <div
            className="absolute inset-0 rounded-full"
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
          <div
            className="absolute inset-[11%] rounded-full"
            style={{
              background: "var(--gradient-masterclass)",
              opacity: 0.9,
              WebkitMaskImage:
                "radial-gradient(closest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))",
              maskImage:
                "radial-gradient(closest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))",
            }}
          />
          <div
            className="absolute inset-[24%] rounded-full blur-[3px]"
            style={{
              background:
                "radial-gradient(circle, rgba(75,118,158,0.55) 0%, rgba(18,16,14,0.55) 70%, rgba(18,16,14,0) 100%)",
            }}
          />
          <div
            className="absolute inset-[24%] rounded-full"
            style={{
              background: "linear-gradient(180deg, var(--color-gold-deep), var(--color-bronze))",
              opacity: 0.25,
              WebkitMaskImage:
                "radial-gradient(closest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))",
              maskImage:
                "radial-gradient(closest-side, transparent calc(100% - 1.5px), #000 calc(100% - 1.5px))",
            }}
          />
          <div className="absolute inset-[24%] flex flex-col items-center justify-center">
            <span className="font-serif text-sm leading-none text-[#f2f2f2] tabular-nums">
              {secondsLeft}
            </span>
            <span className="mt-0.5 text-[0.5rem] leading-none text-[#9b9c9d]">sec</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-2.5 pb-1">
          <div className="flex flex-col items-center">
            <p className="text-base font-light text-[#f2f2f2]">{phase.label}</p>
            <p className="max-w-[220px] text-center text-xs text-[#5e6165]">{phase.body}</p>
          </div>
          <div className="flex items-center gap-1">
            {PHASES.map((p, i) => (
              <span
                key={p.label}
                className={cn(
                  "size-[7px] rounded-full transition-colors duration-300",
                  i === phaseIndex ? "bg-[#f2f2f2]" : "bg-[#f2f2f2]/20",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1" />

      {/* Next button */}
      <div className="px-6 pb-8">
        <button
          type="button"
          className="w-full rounded-xl bg-gold-soft py-3 text-sm text-[#161410]"
        >
          Next
        </button>
      </div>
    </div>
  );
}
