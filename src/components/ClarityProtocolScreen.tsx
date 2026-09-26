"use client";

import { useState } from "react";
import { ArrowLeft, Briefcase, Heart, Info, Lightbulb, Wifi, BatteryFull } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Figma file Ok6qYziHfAl50GRs0YRC6O, node 8767:8714 ("CEP 09") —
 * "Exclusive Clarity Protocol", Boardroom Mode's own setup screen
 * (goal, use cases, duration, components) for /inside-the-app's "A
 * Minute Before The Day Moves On" media. Life-size inside IPhoneMockup
 * (pro-max), same cqw/cqh convention as this session's other in-app
 * screens.
 *
 * Info/heart/briefcase/lightbulb icons are lucide, not the source's own
 * downloaded SVGs — plain, common glyph shapes already used elsewhere
 * in this codebase (RefreshCw, ChevronLeft, ArrowLeft, Wifi,
 * BatteryFull), not brand-specific illustrations like EmotionalWheelScreen's
 * own hand-drawn petals. The ambient top-right glow is CSS (a blurred
 * radial gradient), matching how ComposureAlignmentScreen's own center
 * glow replaces a raster asset with this codebase's existing box-shadow
 * glow convention rather than a one-off PNG.
 *
 * No separate "progress bar" element (the source draws its own thin
 * bar above the safe area) — IPhoneMockup already renders a real home
 * indicator on top of every screen's children, so a second bar in the
 * same spot would double up, not add fidelity.
 *
 * Interactive: Duration is a real 3/5/10-minute selector (the source's
 * own art shows one visually distinct "selected" pill, so this is the
 * one control the design itself implies is a picker, not a static
 * label) and the heart toggles a favorited state. Use-case chips stay
 * static — the source never shows them in any state but this one, so
 * inventing a selected/unselected pair here would be a guess the
 * design doesn't support.
 */

const USE_CASES = ["Pitching an idea", "Updating stakeholders", "Defending decisions", "Asking smart questions"];
const DURATIONS = ["3 Min", "5 Min", "10 Min"];

export function ClarityProtocolScreen({ className }: { className?: string }) {
  const [duration, setDuration] = useState("3 Min");
  const [favorited, setFavorited] = useState(false);

  return (
    <div
      className={cn("relative flex size-full flex-col overflow-hidden bg-[#080911]", className)}
      style={{ containerType: "size" }}
    >
      {/* Fixed header chrome — stays put while the goal/use-cases/duration
         content below scrolls, same split ComposureAlignmentScreen uses. */}
      <div className="relative shrink-0 border-b border-white/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-[35%] -right-[15%] size-[70%] rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, var(--color-gold-muted) 0%, transparent 70%)" }}
        />

        <div className="relative flex items-center justify-between px-[6.11cqw] pt-[3cqw] text-[#f2f2f2]">
          <span className="text-[3.56cqw] font-semibold tracking-tight">9:41</span>
          <div className="flex items-center gap-[1.5cqw]">
            <Wifi className="size-[3.56cqw]" />
            <BatteryFull className="size-[4.07cqw]" />
          </div>
        </div>

        <div className="relative mt-[6.11cqw] flex items-center justify-between px-[6.11cqw]">
          <button type="button" aria-label="Back" className="text-cream/70 transition-colors hover:text-cream">
            <ArrowLeft className="size-[6.11cqw]" />
          </button>
          <div className="flex items-center gap-[2.5cqw]">
            <button type="button" aria-label="Info" className="text-gold-soft/80 transition-colors hover:text-gold-soft">
              <Info className="size-[6.11cqw]" />
            </button>
            <button
              type="button"
              aria-label="Favorite"
              aria-pressed={favorited}
              onClick={() => setFavorited((f) => !f)}
              className={cn(
                "transition-colors",
                favorited ? "text-gold" : "text-gold-soft/80 hover:text-gold-soft"
              )}
            >
              <Heart className="size-[6.11cqw]" fill={favorited ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        <div className="mt-[8.14cqw] px-[6.11cqw] pb-[6.11cqw]">
          <div className="flex items-center gap-[1.27cqw] text-[#909396]">
            <Briefcase className="size-[4.58cqw]" />
            <span className="text-[3.05cqw]">Boardroom Mode</span>
          </div>
          <p className="mt-[2.04cqw] text-[5.09cqw] text-gold-soft">Exclusive Clarity Protocol</p>
        </div>
      </div>

      <div
        data-lenis-prevent
        className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="flex flex-col gap-[7.13cqw] px-[6.11cqw] pt-[7.63cqw] pb-[8cqw]">
          <div className="flex flex-col gap-[2.04cqw]">
            <p className="text-[3.56cqw] text-gold-deep">Goal</p>
            <p className="text-[4.07cqw] leading-relaxed font-light text-[#c6c7c9]">
              Walk into your meeting with sharp, structured, evidence-clear thinking.
            </p>
          </div>

          <div className="flex flex-col gap-[2.04cqw]">
            <p className="text-[3.56cqw] text-gold-deep">Use Cases</p>
            <div className="flex flex-wrap gap-[2.04cqw]">
              {USE_CASES.map((useCase) => (
                <span
                  key={useCase}
                  className="rounded-full border border-gold-deep bg-gold-soft/10 px-[4.07cqw] py-[3.05cqw] text-[3.05cqw] whitespace-nowrap text-[#c6c7c9]"
                >
                  {useCase}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-[2.04cqw]">
            <p className="text-[3.56cqw] text-gold-deep">Duration</p>
            <div className="flex gap-[3.05cqw]">
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  aria-pressed={duration === d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    "rounded-full border px-[4.07cqw] py-[2.55cqw] text-[3.56cqw] whitespace-nowrap transition-colors duration-300",
                    duration === d ? "border-gold-soft/60 text-gold-soft" : "border-white/10 text-[#9b9c9d] hover:border-white/20"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-[2.04cqw]">
            <p className="text-[3.56cqw] text-gold-deep">Components</p>
            <p className="text-[4.07cqw] leading-relaxed font-light text-[#c6c7c9]">
              Breath priming, rapid clarity prompts, structured mapping, rehearsal overlay.
            </p>
          </div>
        </div>
      </div>

      {/* Fixed footer — Next CTA + context tip, sitting above IPhoneMockup's
         own home indicator rather than duplicating it. */}
      <div
        className="relative flex shrink-0 flex-col gap-[5.09cqw] border-t border-gold-soft/30 px-[5.09cqw] pt-[6.11cqw] pb-[8cqw]"
        style={{
          backgroundImage:
            "linear-gradient(192.5deg, color-mix(in oklab, var(--color-gold-deep) 20%, transparent) 4%, rgba(16,17,23,0.04) 108%)",
          backgroundColor: "var(--color-navy)",
        }}
      >
        <button
          type="button"
          className="w-full rounded-[3.05cqw] bg-gold-soft py-[2.55cqw] text-[3.56cqw] font-medium text-[#161410]"
          style={{ boxShadow: "0 10px 24px -6px rgba(200,182,143,0.5)" }}
        >
          Next
        </button>
        <div className="flex items-center gap-[3.05cqw] rounded-full border border-gold-deep px-[4.07cqw] py-[3.05cqw]">
          <Lightbulb className="size-[6.11cqw] shrink-0 text-cream/70" />
          <p className="text-[3.05cqw] leading-snug text-[#c6c7c9]">
            Clarity isn&rsquo;t pressure — it&rsquo;s structure. This protocol sharpens thinking under time stress.
          </p>
        </div>
      </div>
    </div>
  );
}
