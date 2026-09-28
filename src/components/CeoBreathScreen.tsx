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
      className={cn("relative flex size-full flex-col overflow-hidden [container-type:size]", className)}
      style={{ backgroundColor: "#080911" }}
    >
      {/* Status bar */}
      <div className="flex items-center justify-between px-[9cqw] pt-[4.5cqw] text-[#f2f2f2]">
        <span className="text-[5.2cqw] font-semibold tracking-tight">9:41</span>
        <div className="flex items-center gap-[2cqw]">
          <Wifi className="size-[5.2cqw]" />
          <BatteryFull className="size-[6cqw]" />
        </div>
      </div>

      {/* Back arrow + step progress — a 3-column grid (not absolute
          positioning over a centered flex row) so the back button and
          the progress segments sit in separate tracks and can never
          visually overlap, however narrow the phone renders. */}
      <div className="mt-[6cqw] grid grid-cols-[1fr_auto_1fr] items-center px-[9cqw]">
        <button type="button" aria-label="Back" className="justify-self-start text-gold-soft">
          <ChevronLeft className="size-[7.5cqw]" />
        </button>
        <div className="flex items-center gap-[3cqw] justify-self-center">
          <span
            className="h-[1.5cqw] w-[7.5cqw] rounded-full"
            style={{ background: "linear-gradient(90deg, #998b6f, var(--color-gold))" }}
          />
          <span
            className="h-[1.5cqw] w-[7.5cqw] rounded-full"
            style={{ background: "linear-gradient(90deg, #998b6f, var(--color-gold))" }}
          />
          <span className="h-[1.5cqw] w-[7.5cqw] rounded-full border border-black/20 bg-[#f2f2f2]/10" />
          <span className="h-[1.5cqw] w-[7.5cqw] rounded-full border border-black/20 bg-[#f2f2f2]/10" />
          <span className="h-[1.5cqw] w-[7.5cqw] rounded-full border border-black/20 bg-[#f2f2f2]/10" />
        </div>
        <div />
      </div>
      <div className="mt-[4.5cqw] border-b border-white/10" />

      {/* Title */}
      <div className="mt-[7cqw] flex flex-col items-center gap-[1cqw] px-[9cqw] text-center">
        <p className="text-[9cqw] leading-tight text-gold-soft">CEO Breath</p>
        <p className="text-[5.8cqw] leading-snug font-light text-[#c6c7c9]">
          Stabilise heart rate, tone, and presence.
        </p>
      </div>

      {/* Breathing card */}
      <div className="mx-[9cqw] mt-[6cqw] flex flex-col items-center gap-[4cqw] rounded-[9cqw] bg-gold/10 px-[4cqw] pt-[5cqw] pb-[4cqw]">
        <p className="text-[4.5cqw] text-[#c6c7c9]">Authoritative Mode</p>
        <div className="h-px w-full bg-white/15" />

        <div className="flex flex-col items-center gap-[0.5cqw]">
          <p className="font-serif text-[9cqw] leading-tight tracking-[0.3em] text-gold-soft">505</p>
          <p className="text-[3.8cqw] font-light text-[#c6c7c9]">Inhale • Hold • Exhale</p>
        </div>

        <div className="relative flex aspect-square w-[42%] items-center justify-center">
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
            <span className="font-serif text-[5.2cqw] leading-none text-[#f2f2f2] tabular-nums">
              {secondsLeft}
            </span>
            <span className="mt-[0.5cqw] text-[3cqw] leading-none text-[#9b9c9d]">sec</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-[3cqw]">
          <div className="flex flex-col items-center">
            <p className="text-[5.8cqw] leading-snug font-light text-[#f2f2f2]">{phase.label}</p>
            <p className="max-w-[80cqw] text-center text-[4.5cqw] leading-snug text-[#5e6165]">{phase.body}</p>
          </div>
          <div className="flex items-center gap-[1.5cqw]">
            {PHASES.map((p, i) => (
              <span
                key={p.label}
                className={cn(
                  "size-[2.6cqw] rounded-full transition-colors duration-300",
                  i === phaseIndex ? "bg-[#f2f2f2]" : "bg-[#f2f2f2]/20",
                )}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1" />

      {/* Next button */}
      <div className="px-[9cqw] pt-[4cqw] pb-[9cqw]">
        <button
          type="button"
          className="w-full rounded-[4.5cqw] bg-gold-soft py-[4cqw] text-[5.2cqw] text-[#161410]"
        >
          Next
        </button>
      </div>
    </div>
  );
}
