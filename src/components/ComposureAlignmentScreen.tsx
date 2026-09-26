"use client";

import { useState } from "react";
import { ArrowLeft, Wifi, BatteryFull } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Figma file Ok6qYziHfAl50GRs0YRC6O, node 5329:5286 ("NL&I 09") —
 * "Integration & Reflection", the closing review screen of Boardroom
 * Mode's post-session flow, for /inside-the-app's "Composure On
 * Demand" media. Life-size inside IPhoneMockup, same cqw/cqh
 * convention as this session's other in-app screens (EmotionalWheelScreen,
 * SleepDetailCard, DashboardDetailCard).
 *
 * The three concentric rings (Presence Projection/blue outer, Message
 * Clarity/red middle, Physiological Coherence/green inner) are the
 * source's own downloaded gradient-stroke SVGs (public/composure/ring-*.svg)
 * — their blurred, hand-tuned linear-gradient strokes aren't something a
 * flat CSS border or conic-gradient reproduces faithfully. The center
 * glow is CSS instead of the source's own raster asset: it's the same
 * "mega glow" effect (gold core, two-layer blurred drop-shadow) this
 * codebase already reproduces via box-shadow everywhere else (buttons,
 * ShimmerButton's own glow), so a PNG here would be a one-off exception
 * to that pattern rather than a shape CSS can't otherwise achieve.
 *
 * Interactive: tapping a legend chip OR its matching score card below
 * sets that metric "active" — the chip deepens to its own color, the
 * card's border/glow switches from the shared rest gold to that metric's
 * color, and its ring brightens. Ties the three representations
 * (ring/chip/card) of the same three metrics together, rather than
 * three static, disconnected lists.
 */

type MetricId = "coherence" | "clarity" | "presence";

const METRICS: Array<{
  id: MetricId;
  label: string;
  color: string;
  gradientFrom: string;
  score: number;
  caption: string;
  ringSrc: string;
  ringSizeCqw: number;
  ringAspect: number;
}> = [
  {
    id: "presence",
    label: "Presence Projection",
    color: "#3467d7",
    gradientFrom: "#2d4372",
    score: 2,
    caption: "Breath rhythm, heart rate steadiness, grounded posture",
    ringSrc: "/composure/ring-middle.svg",
    ringSizeCqw: 58.78,
    ringAspect: 1,
  },
  {
    id: "clarity",
    label: "Message Clarity",
    color: "#ae4040",
    gradientFrom: "#773636",
    score: 4,
    caption: "Logic, empathy, structural precision",
    ringSrc: "/composure/ring-outer.svg",
    ringSizeCqw: 47.58,
    ringAspect: 219 / 220.348,
  },
  {
    id: "coherence",
    label: "Physiological Coherence",
    color: "#42b885",
    gradientFrom: "#459773",
    score: 3,
    caption: "Eye contact, pacing, vocal tone control",
    ringSrc: "/composure/ring-inner.svg",
    ringSizeCqw: 35.37,
    ringAspect: 1,
  },
];

export function ComposureAlignmentScreen({ className }: { className?: string }) {
  const [active, setActive] = useState<MetricId | null>(null);

  function toggle(id: MetricId) {
    setActive((current) => (current === id ? null : id));
  }

  return (
    <div
      className={cn("relative flex size-full flex-col overflow-hidden bg-[#080911]", className)}
      style={{ containerType: "size" }}
    >
      {/* Fixed chrome — status bar, step dots, back arrow, heading — stays
         put while the review content below scrolls, matching how a real
         app screen taller than one viewport behaves (only the CONTENT
         scrolls, not the app's own header furniture). A real, confirmed
         bug this replaces: with everything in one flow, the header plus
         rings plus all 3 chips plus all 3 score cards plus the Next
         button added up to roughly 1.3x this phone frame's own height —
         IPhoneMockup's overflow-hidden screen silently clipped the last
         card and the Next button entirely rather than visibly overflowing,
         confirmed live via screenshot before this split. */}
      <div className="relative shrink-0">
        <div className="relative flex items-center justify-between px-[6.11cqw] pt-[3cqw] text-[#f2f2f2]">
          <span className="text-[3.56cqw] font-semibold tracking-tight">9:41</span>
          <div className="flex items-center gap-[1.5cqw]">
            <Wifi className="size-[3.56cqw]" />
            <BatteryFull className="size-[4.07cqw]" />
          </div>
        </div>

        <div className="mt-[4.58cqw] flex items-center justify-center gap-[3.05cqw] px-[6.11cqw]">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="h-[1.02cqw] w-[6.11cqw] rounded-full"
              style={{ background: "linear-gradient(90deg, #998b6f, #dac79e)" }}
            />
          ))}
          <span className="relative h-[1.02cqw] w-[6.11cqw] overflow-hidden rounded-full bg-white/10">
            <span
              className="absolute inset-y-0 right-0 w-[2.8cqw] rounded-full bg-gold"
              style={{ boxShadow: "0 0 8px 1px #f3cb6d, 0 0 14px 2px #dac79e" }}
            />
          </span>
        </div>

        <button
          type="button"
          aria-label="Back"
          className="absolute top-[38%] left-[6.11%] text-cream/70 transition-colors hover:text-cream"
        >
          <ArrowLeft className="size-[6.11cqw]" />
        </button>

        <div className="mt-[8.65cqw] px-[6.11cqw] text-center">
          <p className="text-[6.11cqw] leading-tight text-gold-soft">Integration &amp; Reflection</p>
          <p className="mx-auto mt-[1.02cqw] max-w-[65cqw] text-[4.07cqw] leading-snug font-light text-[#c6c7c9]">
            Measure your alignment — from physiology to presence
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="relative mx-auto mt-[9.67cqw] flex aspect-square w-[58.78cqw] items-center justify-center">
        {METRICS.map((metric) => (
          <img
            key={metric.id}
            alt=""
            src={metric.ringSrc}
            className={cn(
              "absolute block max-w-none transition-[filter,opacity] duration-300",
              active !== null && active !== metric.id && "opacity-40"
            )}
            style={{
              width: `${metric.ringSizeCqw}cqw`,
              height: `${metric.ringSizeCqw / metric.ringAspect}cqw`,
              filter: active === metric.id ? `drop-shadow(0 0 10px ${metric.color})` : undefined,
            }}
          />
        ))}
        <div
          aria-hidden="true"
          className="absolute size-[8.4cqw] rounded-full"
          style={{
            background: "radial-gradient(circle, #f3cb6d 0%, #dac79e 65%, transparent 100%)",
            boxShadow: "0 0 22.5px 6px #f3cb6d, 0 0 45px 10px #dac79e",
          }}
        />
      </div>

      <p className="mt-[4.83cqw] px-[6.11cqw] text-center text-[3.56cqw] text-[#909396]">
        Review your composure alignment
      </p>

      <div className="mx-auto mt-[5.34cqw] flex w-[55.5cqw] flex-col gap-[3.05cqw]">
        {METRICS.map((metric) => (
          <button
            key={metric.id}
            type="button"
            onClick={() => toggle(metric.id)}
            className={cn(
              "flex h-[12.21cqw] items-center justify-center gap-[2.5cqw] rounded-[3.05cqw] border px-[2.5cqw] text-[3.1cqw] whitespace-nowrap transition-colors duration-300",
              active === metric.id
                ? "border-transparent text-[#f2f2f2]"
                : "border-white/10 bg-gold-soft/10 text-[#f2f2f2]"
            )}
            style={
              active === metric.id
                ? { backgroundColor: `${metric.color}33`, borderColor: metric.color }
                : undefined
            }
          >
            <span
              className="size-[4.58cqw] shrink-0 rounded-full border-2"
              style={{ borderColor: metric.color, backgroundColor: `${metric.color}33` }}
            />
            {metric.label}
          </button>
        ))}
      </div>

      <div className="mt-[10.43cqw] flex flex-col gap-[4.07cqw] px-[5.85cqw]">
        {METRICS.slice()
          .sort((a, b) => METRICS.indexOf(a) - METRICS.indexOf(b))
          .map((metric) => (
            <button
              key={metric.id}
              type="button"
              onClick={() => toggle(metric.id)}
              className={cn(
                "flex flex-col gap-[3.05cqw] rounded-[4.07cqw] border bg-navy px-[4.07cqw] py-[5.09cqw] text-left transition-[border-color,box-shadow] duration-300",
                active === metric.id ? "" : "border-gold-deep/60"
              )}
              style={
                active === metric.id
                  ? { borderColor: metric.color, boxShadow: `0 0 16px -4px ${metric.color}` }
                  : undefined
              }
            >
              <div className="flex w-full items-center justify-between text-[4.07cqw] font-light whitespace-nowrap">
                <span className="text-[#c6c7c9]">{metric.label}</span>
                <span className="text-[#f2f2f2]">{metric.score}/5</span>
              </div>
              <div className="h-[2.04cqw] w-full rounded-full border border-white/10 bg-white/10">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(metric.score / 5) * 100}%`,
                    background: `linear-gradient(90deg, ${metric.gradientFrom}, ${metric.color})`,
                    boxShadow: `0 0 12px 0 ${metric.color}`,
                  }}
                />
              </div>
              <p className="text-[3.05cqw] leading-snug text-[#5e6165]">{metric.caption}</p>
            </button>
          ))}
      </div>

      <div className="mt-[6.1cqw] mb-[8.14cqw] flex justify-center px-[5.85cqw]">
        <button
          type="button"
          className="w-full rounded-[3.05cqw] bg-gold-soft px-[4.07cqw] py-[2.55cqw] text-[3.56cqw] font-medium text-[#161410]"
        >
          Next
        </button>
      </div>
      </div>
    </div>
  );
}
