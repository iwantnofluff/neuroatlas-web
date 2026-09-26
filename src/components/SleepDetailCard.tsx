"use client";

import { Calendar, Sparkle, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Figma file Ok6qYziHfAl50GRs0YRC6O, node 15348:17273 ("Card — Sleep
 * (reference)") — the Sleep detail screen for /inside-the-app's "This
 * Is Where It Actually Happens" hero media, replacing AppScreenMock's
 * generic placeholder. Header (close/title/calendar), duration + status
 * badge, a Range Graph, a 24-hour hypnogram, the stage legend, an
 * insight callout, a 7-day Sleep Trend chart, and "About this metric" —
 * every section of the source frame, kept (unlike HrvDetailCard's own
 * "exclude About this metric" instruction, this request has no such
 * exclusion).
 *
 * Sizing is cqw/cqh (container-query units against this component's own
 * root, which sets `containerType: "size"`), not fixed rem/px — a real,
 * confirmed lesson from EmotionalWheelScreen.tsx: a "life size" iPhone
 * mockup still usually renders at LESS than the phone's true 393pt
 * width once bounded by a section's own available height, so fixed
 * text sizes tuned for exactly 393px come out oversized and wrap/
 * overflow at the mockup's actual rendered size. cqw makes every
 * size scale with however wide this component ACTUALLY renders.
 * Layout positions (the hypnogram's bars, the range bar's zone/marker)
 * use plain CSS % against their own immediate parent instead — % isn't
 * usable for font-size, but for width/left/height it's simpler than
 * recomputing a cqw fraction for every nested level, and needs no
 * container-type of its own.
 *
 * Token reuse (do not re-declare):
 *   - "NORMAL" status, range bar's safe-zone highlight, insight box
 *     border/background (#E5DAC2/rgba(218,199,158,0.1)), and every
 *     "Range Graph"/"Sleep Trend"/"About this metric" label
 *     (#DAC79E) are exact matches for --color-success / --color-gold-soft
 *     / --color-gold.
 *   - Chart Card background (#1C1D23) and the trend tooltip's border
 *     (#6D644F)/value text (#C4B38E) are exact matches for
 *     --color-navy-soft / --color-bronze / --color-gold-deep.
 * The hypnogram's own stage colors (light/deep/rem/awake — a distinct
 * palette from this brand's own tokens, matching the app's established
 * "local palette stays literal hex" convention already used in
 * VitalsDashboard.tsx/HrvDetailCard.tsx) and the range bar's rainbow
 * gradient stay literal hex.
 *
 * The hypnogram's ~21 individual "Glow" rectangles (a soft blurred
 * duplicate of each real stage segment, per the source file) are
 * reconstructed here as ONE shared blurred copy of the same stage-
 * segment data, not hand-transcribed as 21 separate bespoke rects —
 * visually equivalent (a soft color glow directly behind each real
 * segment) for a fraction of the markup. The source's thin white
 * "Riser" divider lines between segments are dropped entirely — a
 * genuinely decorative micro-detail (not a data-bearing element) that
 * doesn't survive the size-down this screen needs to stay clean at
 * phone width, consistent with this session's own "size everything
 * down if needed for a clean view" instruction.
 *
 * Static: this is a read-only detail screen in the source design (no
 * interaction affordances specified) — the close/calendar buttons
 * render for visual fidelity only, same as HrvDetailCard.tsx's own
 * non-interactive elements.
 */

type Stage = "light" | "deep" | "rem" | "awake";

const STAGE_COLOR: Record<Stage, string> = {
  light: "#b8e6c9",
  deep: "#1b4d3e",
  rem: "#34d399",
  awake: "#3188c5",
};

// Hypnogram segments — left/width as % of the chart's own 353-wide
// reference, top/height in px against its own 168-tall reference
// (converted to % of that same box below).
const HYPNOGRAM_SEGMENTS: { stage: Stage; left: number; width: number; top: number }[] = [
  { stage: "light", left: 0, width: 14.37, top: 70 },
  { stage: "deep", left: 14.37, width: 28.74, top: 105 },
  { stage: "light", left: 43.12, width: 8.98, top: 70 },
  { stage: "rem", left: 52.1, width: 10.78, top: 35 },
  { stage: "light", left: 62.88, width: 17.96, top: 70 },
  { stage: "deep", left: 80.84, width: 34.13, top: 105 },
  { stage: "light", left: 114.97, width: 7.19, top: 70 },
  { stage: "awake", left: 122.16, width: 3.59, top: 0 },
  { stage: "light", left: 125.75, width: 16.17, top: 70 },
  { stage: "rem", left: 141.92, width: 17.96, top: 35 },
  { stage: "light", left: 159.88, width: 14.37, top: 70 },
  { stage: "deep", left: 174.25, width: 23.35, top: 105 },
  { stage: "light", left: 197.61, width: 19.76, top: 70 },
  { stage: "rem", left: 217.37, width: 23.35, top: 35 },
  { stage: "awake", left: 240.72, width: 4.49, top: 0 },
  { stage: "light", left: 245.21, width: 17.96, top: 70 },
  { stage: "rem", left: 263.18, width: 26.95, top: 35 },
  { stage: "light", left: 290.13, width: 16.17, top: 70 },
  { stage: "awake", left: 306.29, width: 5.39, top: 0 },
  { stage: "rem", left: 311.68, width: 25.15, top: 35 },
  { stage: "light", left: 336.83, width: 16.17, top: 70 },
];
const HYPNOGRAM_STEP_HEIGHT = 33;
const HYPNOGRAM_WIDTH_REF = 353;
const HYPNOGRAM_HEIGHT_REF = 146; // chart area only, X-axis row sits below it

const STAGE_LEGEND: { stage: Stage; label: string }[] = [
  { stage: "deep", label: "Deep" },
  { stage: "light", label: "Light" },
  { stage: "rem", label: "REM" },
  { stage: "awake", label: "Awake" },
];

const X_AXIS_LABELS = ["12A", "6A", "12P", "6P", "12A"];

// Sleep Trend — 7 nights, each a stacked bar (top to bottom: awake,
// rem, light, deep), values are the source's own px heights out of a
// shared 78px-max scale, converted to % of that scale below so the
// whole chart is proportionally resizable.
const TREND_MAX = 78;
const TREND_DAYS: { date: string; awake: number; rem: number; light: number; deep: number }[] = [
  { date: "08/17", awake: 1.9, rem: 16.6, light: 42.5, deep: 11 },
  { date: "08/18", awake: 6, rem: 16.6, light: 15, deep: 11 },
  { date: "08/19", awake: 1.9, rem: 5, light: 5, deep: 31 },
  { date: "08/20", awake: 11, rem: 28, light: 7, deep: 22 },
  { date: "08/21", awake: 10, rem: 7, light: 10, deep: 16 },
  { date: "08/22", awake: 10, rem: 7, light: 4, deep: 21 },
  { date: "08/33", awake: 5, rem: 3, light: 42.5, deep: 6 },
];
// The 4th bar ("08/20", index 3) is this card's own tooltip target —
// matches the source's "Value Tooltip" callout, permanently shown
// rather than hover-triggered (this whole screen is a static detail
// view, not an interactive chart).
const TREND_TOOLTIP_INDEX = 3;

function HypnogramChart() {
  return (
    <div className="flex flex-col gap-[2.04cqw]">
      <div className="relative w-full" style={{ aspectRatio: `${HYPNOGRAM_WIDTH_REF} / ${HYPNOGRAM_HEIGHT_REF}` }}>
        {HYPNOGRAM_SEGMENTS.map((seg, i) => (
          <div
            key={`glow-${i}`}
            className="absolute rounded-[2px] blur-[4px]"
            style={{
              left: `${(seg.left / HYPNOGRAM_WIDTH_REF) * 100}%`,
              width: `${(seg.width / HYPNOGRAM_WIDTH_REF) * 100}%`,
              top: `${((seg.top - 5) / HYPNOGRAM_HEIGHT_REF) * 100}%`,
              height: `${((HYPNOGRAM_STEP_HEIGHT + 10) / HYPNOGRAM_HEIGHT_REF) * 100}%`,
              backgroundColor: STAGE_COLOR[seg.stage],
              opacity: 0.35,
            }}
          />
        ))}
        {HYPNOGRAM_SEGMENTS.map((seg, i) => (
          <div
            key={`step-${i}`}
            className="absolute rounded-[3px]"
            style={{
              left: `${(seg.left / HYPNOGRAM_WIDTH_REF) * 100}%`,
              width: `${(seg.width / HYPNOGRAM_WIDTH_REF) * 100}%`,
              top: `${(seg.top / HYPNOGRAM_HEIGHT_REF) * 100}%`,
              height: `${(HYPNOGRAM_STEP_HEIGHT / HYPNOGRAM_HEIGHT_REF) * 100}%`,
              backgroundColor: STAGE_COLOR[seg.stage],
            }}
          />
        ))}
      </div>
      <div className="flex items-start justify-between text-[2.29cqw] text-[#909396]">
        {X_AXIS_LABELS.map((label, i) => (
          <div key={i} className="flex flex-col items-center gap-[0.51cqw]">
            <span className="h-[1cqw] w-px bg-[#909396]/40" />
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-[4.07cqw]">
        {STAGE_LEGEND.map(({ stage, label }) => (
          <div key={stage} className="flex items-center gap-[1.53cqw]">
            <span
              className="block size-[1.78cqw] rounded-full"
              style={{ backgroundColor: STAGE_COLOR[stage] }}
            />
            <span className="text-[2.8cqw] text-[#909396]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SleepTrendChart() {
  return (
    <div className="relative w-full overflow-hidden rounded-[4.07cqw] bg-navy-soft px-[11.5cqw] pt-[9.4cqw] pb-[6.9cqw]">
      {/* Gridlines */}
      <div className="absolute inset-x-[11.5cqw] top-[9.4cqw] flex h-[18.3cqw] flex-col justify-between">
        <span className="h-px w-full bg-white/8" />
        <span className="h-px w-full bg-white/8" />
        <span className="h-px w-full bg-white/8" />
        <span className="h-px w-full bg-white/8" />
      </div>
      <div className="absolute top-[9.4cqw] left-[3.8cqw] flex h-[18.3cqw] flex-col justify-between text-right text-[2.29cqw] text-[#5e6165]">
        <span>10h</span>
        <span>7h</span>
        <span>3h</span>
        <span>0h</span>
      </div>

      <div className="relative flex h-[18.3cqw] items-end justify-between">
        {TREND_DAYS.map((day, i) => {
          const total = day.awake + day.rem + day.light + day.deep;
          return (
            <div key={day.date} className="relative flex h-full w-[6.6cqw] flex-col justify-end">
              {i === TREND_TOOLTIP_INDEX && (
                <div className="absolute -top-[8cqw] left-1/2 flex -translate-x-1/2 items-center justify-center rounded-[3.06cqw] border border-bronze bg-[rgba(22,20,16,0.5)] px-[1.53cqw] py-[1.27cqw] whitespace-nowrap backdrop-blur-sm">
                  <span className="text-[2.4cqw] text-gold-deep">7h 23m</span>
                </div>
              )}
              {/* Explicit height (this day's own share of TREND_MAX), not
                 h-full — each segment below then gets `flex-grow` set to
                 its own value with a 0 basis, so flexbox distributes
                 THIS box's real height proportionally. A real, confirmed
                 bug this replaces: giving each segment a plain
                 `height: X%` against an unsized (auto-height) flex
                 parent resolves to 0 (percentage heights need a parent
                 with a DEFINITE height), so every bar rendered invisible
                 except a hardcoded minHeight sliver — confirmed live via
                 screenshot, every bar flat at the 0h baseline. */}
              <div
                className="flex w-full flex-col gap-[0.5cqw]"
                style={{ height: `${(total / TREND_MAX) * 100}%` }}
              >
                <div
                  className="w-full rounded-t-[1cqw]"
                  style={{ flex: `${day.awake} 0 0%`, backgroundColor: STAGE_COLOR.awake }}
                />
                <div className="w-full" style={{ flex: `${day.rem} 0 0%`, backgroundColor: STAGE_COLOR.rem }} />
                <div className="w-full" style={{ flex: `${day.light} 0 0%`, backgroundColor: STAGE_COLOR.light }} />
                <div
                  className="w-full rounded-b-[0.5cqw]"
                  style={{ flex: `${day.deep} 0 0%`, backgroundColor: STAGE_COLOR.deep }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-[3.6cqw] flex justify-between text-[2.03cqw] text-[#5e6165]">
        {TREND_DAYS.map((day) => (
          <span key={day.date} className="w-[6.6cqw] text-center">
            {day.date}
          </span>
        ))}
      </div>
    </div>
  );
}

export function SleepDetailCard({ className }: { className?: string }) {
  return (
    <div
      className={cn("relative flex w-full flex-col", className)}
      style={{ containerType: "size" }}
    >
      <div className="relative -mx-[5.09cqw] mb-[6.6cqw] flex items-center justify-center border-b border-white/10 px-[5.09cqw] pb-[3cqw] backdrop-blur-[2px]">
        <button
          type="button"
          aria-label="Close"
          className="absolute left-0 flex size-[11.2cqw] items-center justify-center rounded-full bg-black/40"
        >
          <X className="size-[5.6cqw] text-[#f2f2f2]" />
        </button>
        <p className="text-[4.3cqw] text-[#f2f2f2]">Sleep</p>
        <button
          type="button"
          aria-label="Calendar"
          className="absolute right-0 flex size-[11.2cqw] items-center justify-center rounded-full bg-black/40"
        >
          <Calendar className="size-[5.6cqw] text-[#f2f2f2]" />
        </button>
      </div>

      <div className="flex flex-col gap-[6.6cqw]">
        <div className="flex items-start justify-between">
          <div className="flex items-end gap-[1.53cqw] text-[#f2f2f2]">
            <span className="text-[10.7cqw] leading-none">7h 23m</span>
            <span className="text-[4.6cqw] text-[#f2f2f2]/30">last night</span>
          </div>
          <p className="mt-[1.53cqw] text-[3cqw] whitespace-nowrap text-[#4ade80]">NORMAL</p>
        </div>

        <div className="flex flex-col gap-[3.56cqw]">
          <p className="text-[3.56cqw] text-gold">Range Graph</p>
          <div
            className="relative h-[2.29cqw] w-full rounded-[3px]"
            style={{
              background:
                "linear-gradient(90deg, rgb(215,69,78) 0%, rgb(239,125,63) 23.1%, rgb(208,143,52) 53.4%, rgb(55,210,124) 77.4%, rgb(190,208,52) 96.2%)",
            }}
          >
            <span className="absolute inset-y-0 left-[64%] w-[27.2%] rounded-full bg-[#f2f2f2]/25 backdrop-blur-[2px]" />
            <span className="absolute top-1/2 left-[78.2%] size-[3.56cqw] -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.5cqw] border-[#c3d1de] bg-[#f2f2f2]" />
          </div>
          <div className="flex justify-between text-[2.8cqw] text-[#5e6165]">
            <span>4 hrs</span>
            <span>10 hrs</span>
          </div>
        </div>

        <HypnogramChart />

        <div className="flex items-start gap-[4.07cqw] rounded-[4.07cqw] border border-gold-soft/30 bg-gold/10 px-[4.07cqw] py-[5.09cqw]">
          <Sparkle className="mt-[0.5cqw] size-[8.5cqw] shrink-0 fill-gold text-gold" />
          <p className="text-[3.56cqw] leading-relaxed text-[#c6c7c9]">
            You slept 7h 23m. Normal for your age is 7 to 9 hours. You are
            right in that range.
          </p>
        </div>

        <div className="flex flex-col gap-[5.09cqw]">
          <p className="text-[3.56cqw] text-gold">Sleep Trend</p>
          <SleepTrendChart />
        </div>

        <div className="flex flex-col gap-[2.04cqw]">
          <p className="text-[3.56cqw] text-gold">About this metric</p>
          <p className="text-pretty text-[3.56cqw] leading-relaxed text-[#909396]">
            Sleep duration is the total time you spent asleep. Your body
            uses sleep each night to repair and recharge.
          </p>
        </div>
      </div>
    </div>
  );
}
