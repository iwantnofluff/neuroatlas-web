"use client";

import { useState } from "react";
import { Search, Check, ChevronRight, Plus, ArrowRight, Wifi, BatteryFull } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Figma file Ok6qYziHfAl50GRs0YRC6O, node 7081:5889 ("MJ") — the
 * Journal tab's own home screen, for /inside-the-app's "The Long
 * View" media. Built only through the three action tiles (New
 * Journal / Daily Check-In / My Entries) per an explicit "stop there"
 * instruction — the source design continues into a Recent Entries
 * list and a bottom tab bar, neither of which this build includes.
 *
 * Search/check/chevron/plus/arrow icons are lucide, not the source's
 * own downloaded SVGs — plain glyph shapes already used elsewhere in
 * this codebase, not bespoke illustration. The three chart lines
 * (Stress/Mood/Focus) ARE the source's own hand-tuned bezier paths
 * (public/journal/line-*.svg's own `d` data, inlined here rather than
 * left as separate files so each line's stroke-opacity can be toggled
 * per-metric) — a real wavy trend isn't something a generic chart
 * primitive reproduces faithfully. Each path keeps the source's own
 * `preserveAspectRatio="none"`, stretched to fill one shared chart
 * box exactly like the source does to align three differently-sized
 * paths in one area.
 *
 * Interactive: the week's log strip is real, clickable per-day state
 * (the source's own "3 of 7 days" caption and its checkmarks
 * disagreed on the actual count — 4 marked days against a "3 of 7"
 * claim — so the caption here is DERIVED from the actual checked
 * count instead of repeating a static, self-contradicting number);
 * the Stress/Mood/Focus legend pills toggle their own line's
 * visibility on the chart; the three action tiles get real press
 * feedback. No deeper navigation is wired up (New Journal, Daily
 * Check-In, My Entries) since nothing past this screen is in scope.
 */

const DAYS = ["M", "T", "W", "T", "F", "S", "S"] as const;

const LOG_HIGHLIGHT = [true, false, false, true, false, true, true];

const METRICS = [
  {
    id: "stress",
    label: "Stress",
    color: "#dd416b",
    viewBox: "0 0 305.227 39.5951",
    path: "M0.11786 37.6478L48.4296 25.9295C51.8896 25.0903 55.511 25.1899 58.9197 26.2181L98.7832 38.2425C105.749 40.3437 113.307 38.4961 118.517 33.418L146.471 6.17661C154.207 -1.36261 166.532 -1.39626 174.31 6.10059L199.383 30.2699C206.247 36.8858 216.825 37.738 224.659 32.3061L250.519 14.3755C252.641 12.9043 255.028 11.8578 257.547 11.2939L305.118 0.647776",
  },
  {
    id: "mood",
    label: "Mood",
    color: "#4b769e",
    viewBox: "0 0 305.582 69.3392",
    path: "M0.156584 45.9765L48.5497 61.9344C52.3637 63.192 56.4679 63.2724 60.3282 62.1649L102.581 50.0432C106.186 49.0092 110.008 49.0092 113.612 50.0432L154.759 61.8475C159.299 63.1501 164.154 62.8036 168.464 60.8694L201.619 45.9879C209.005 42.6729 217.661 44.1373 223.545 49.6974L238.019 63.3743C247.238 72.0857 262.134 70.125 268.785 59.3247L305.157 0.262181",
  },
  {
    id: "focus",
    label: "Focus",
    color: "#f3cb6d",
    viewBox: "0 0 303.714 55.3436",
    path: "M0.374261 0.331555L39.9918 45.0519C46.8806 52.828 58.5761 54.0352 66.908 47.8302L93.1118 28.3154C100.476 22.8309 110.629 23.0657 117.732 28.8849L143.89 50.3143C152.114 57.0523 164.173 56.1776 171.339 48.3233L202.738 13.9085C206.528 9.75502 211.89 7.38847 217.513 7.38847H248.746C253.787 7.38847 258.642 9.29183 262.339 12.7177L303.374 50.7381",
  },
] as const;

type MetricId = (typeof METRICS)[number]["id"];

const ACTIONS = [
  { label: ["New", "Journal"], icon: Plus },
  { label: ["Daily", "Check-In"], icon: Plus },
  { label: ["My", "Entries"], icon: ArrowRight },
] as const;

export function JournalScreen({ className }: { className?: string }) {
  const [loggedDays, setLoggedDays] = useState<boolean[]>(LOG_HIGHLIGHT);
  const [visibleMetrics, setVisibleMetrics] = useState<Record<MetricId, boolean>>({
    stress: true,
    mood: true,
    focus: true,
  });

  function toggleDay(index: number) {
    setLoggedDays((days) => days.map((logged, i) => (i === index ? !logged : logged)));
  }

  function toggleMetric(id: MetricId) {
    setVisibleMetrics((metrics) => ({ ...metrics, [id]: !metrics[id] }));
  }

  const loggedCount = loggedDays.filter(Boolean).length;

  return (
    <div
      className={cn("relative flex size-full flex-col overflow-hidden bg-[#080911]", className)}
      style={{ containerType: "size" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[15%] -left-[20%] size-[80%] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--color-gold-muted) 0%, transparent 70%)" }}
      />

      <div
        data-lenis-prevent
        className="min-h-0 flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="relative flex items-center justify-between px-[6.11cqw] pt-[3cqw] text-[#f2f2f2]">
          <span className="text-[3.56cqw] font-semibold tracking-tight">9:41</span>
          <div className="flex items-center gap-[1.5cqw]">
            <Wifi className="size-[3.56cqw]" />
            <BatteryFull className="size-[4.07cqw]" />
          </div>
        </div>

        <div className="relative flex items-start justify-between px-[6.11cqw] pt-[7cqw]">
          <div>
            <p className="text-[8.65cqw] leading-tight font-light text-gold">Journal</p>
            <p className="mt-[1.5cqw] text-[4.07cqw] text-gold-soft">Reflect. Track. Grow.</p>
          </div>
          <button type="button" aria-label="Search" className="mt-[2cqw] text-cream/70 transition-colors hover:text-cream">
            <Search className="size-[6.11cqw]" />
          </button>
        </div>

        <div className="mt-[7cqw] flex flex-col gap-[5.09cqw] rounded-[6.11cqw] border border-gold-deep px-[5.09cqw] py-[6.11cqw] mx-[6.11cqw]">
          <p className="text-[4.07cqw] font-light text-cream">This Week&rsquo;s Journaling</p>
          <div className="flex flex-col gap-[4.07cqw]">
            <div className="flex items-center justify-between">
              {DAYS.map((day, i) => (
                <button
                  key={i}
                  type="button"
                  aria-pressed={loggedDays[i]}
                  aria-label={`Toggle ${day} logged`}
                  onClick={() => toggleDay(i)}
                  className="flex flex-col items-center gap-[4.07cqw]"
                >
                  {loggedDays[i] ? (
                    <Check className="size-[6.11cqw] text-cream/80" />
                  ) : (
                    <span className="size-[5.34cqw] rounded-full border border-white/15" />
                  )}
                  <span className={cn("text-[3.56cqw]", loggedDays[i] ? "text-[#c6c7c9]" : "text-[#5e6165]")}>
                    {day}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[3.05cqw] text-gold-soft">
              You&rsquo;ve logged {loggedCount} of 7 days this week.
            </p>
          </div>
        </div>

        <div
          className="mt-[5.09cqw] flex flex-col gap-[5.09cqw] rounded-[6.11cqw] border border-gold-deep px-[5.09cqw] py-[6.11cqw] mx-[6.11cqw]"
          style={{
            backgroundImage:
              "linear-gradient(196deg, color-mix(in oklab, var(--color-gold-deep) 20%, transparent) 4%, rgba(16,17,23,0.04) 108%)",
            backgroundColor: "var(--color-navy)",
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[4.07cqw] font-light text-cream">Daily Check-In&rsquo;s</p>
              <p className="text-[3.05cqw] text-[#909396]">Your focus, stress, and mood.</p>
            </div>
            <ChevronRight className="size-[6.11cqw] shrink-0 text-cream/50" />
          </div>

          <div className="flex flex-col gap-[4.07cqw]">
            <div className="relative h-[20.36cqw] w-full">
              {METRICS.map((metric) => (
                <svg
                  key={metric.id}
                  viewBox={metric.viewBox}
                  preserveAspectRatio="none"
                  className="absolute inset-0 size-full transition-opacity duration-300"
                  style={{ opacity: visibleMetrics[metric.id] ? 1 : 0 }}
                >
                  <path d={metric.path} stroke={metric.color} strokeWidth="2" fill="none" />
                </svg>
              ))}
            </div>
            <div className="flex items-center justify-between text-[3.56cqw]">
              {DAYS.map((day, i) => (
                <span key={i} className={LOG_HIGHLIGHT[i] ? "text-[#c6c7c9]" : "text-[#5e6165]"}>
                  {day}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-[4.07cqw]">
            <div className="flex items-center gap-[3.05cqw]">
              {METRICS.map((metric) => {
                const active = visibleMetrics[metric.id];
                return (
                  <button
                    key={metric.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleMetric(metric.id)}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-[2.04cqw] rounded-full border px-[2.8cqw] py-[2.04cqw] text-[3.05cqw] transition-colors duration-300",
                      active ? "border-white/10" : "border-white/5 opacity-40"
                    )}
                  >
                    <span className="size-[4.07cqw] rounded-full" style={{ backgroundColor: metric.color }} />
                    <span style={{ color: metric.color }}>{metric.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-[5.09cqw] flex gap-[4.07cqw] px-[6.11cqw] pb-[8cqw]">
          {ACTIONS.map(({ label, icon: Icon }) => (
            <button
              key={label.join(" ")}
              type="button"
              className="flex flex-1 flex-col items-center justify-center gap-[4.07cqw] rounded-[3.05cqw] border border-[#6d644f] bg-[#0b1016] p-[4.07cqw] transition-transform duration-150 active:scale-95"
            >
              <span className="relative flex size-[13.23cqw] items-center justify-center rounded-full bg-gold-soft/10">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full opacity-50 blur-md"
                  style={{ background: "radial-gradient(circle, var(--color-gold-muted) 0%, transparent 70%)" }}
                />
                <Icon className="relative size-[6.11cqw] text-gold" />
              </span>
              <span className="text-center text-[3.56cqw] leading-tight text-gold">
                {label.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
