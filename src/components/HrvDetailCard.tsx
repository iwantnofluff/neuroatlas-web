import { Sparkle, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Figma file Ok6qYziHfAl50GRs0YRC6O, node 15312:18742 (plus its parent
 * frame 15312:18741, "Card — Heart Rate (reference)", for the modal
 * header + scroll indicator that live as that frame's OTHER children,
 * not inside 18742 itself — easy to miss on a first pass since
 * get_design_context on 18742 alone never surfaces them). Header
 * reading, range graph, insight callout, 24-hour trend chart,
 * highest/lowest/average stats. Everything below "About this metric"
 * is dropped per explicit instruction; that section itself is excluded
 * entirely.
 *
 * Token reuse (do not re-declare):
 *   - Card base (#1C1D23) is an exact match for --color-navy-soft.
 *   - Insight box border (#E5DAC2) and section labels ("Range Graph",
 *     "24-Hour Trend") are exact matches for --color-gold-soft /
 *     --color-gold.
 *   - Trend tooltip's border (#6D644F) and value text (#C4B38E) are
 *     exact matches for --color-bronze / --color-gold-deep.
 * The range-bar's seven-stop rainbow gradient, the danger red
 * (#DD416B), the safe-range green band, the range-bar's frosted "zone"
 * highlight and marker stroke, and the chart's neutral greys are the
 * app's own local palette (not this brand's tokens) and stay literal
 * hex — same treatment as VitalsDashboard.tsx.
 *
 * Static: this is a read-only detail screen in the source design (no
 * interaction affordances) — the close button renders for visual
 * fidelity only and isn't wired to anything, same as
 * VitalsDashboard.tsx's non-interactive elements.
 */
export function HrvDetailCard({ className }: { className?: string }) {
  return (
    <div className={cn("relative flex w-full flex-col", className)}>
      <div className="relative -mx-4 mb-6 flex items-center justify-center border-b border-white/10 px-4 pb-4 backdrop-blur-[2px]">
        <button
          type="button"
          aria-label="Close"
          className="absolute left-0 flex size-9 items-center justify-center rounded-full bg-black/40"
        >
          <X className="size-4 text-[#f2f2f2]" />
        </button>
        <p className="text-[15px] text-[#f2f2f2]">HRV</p>
      </div>

      {/* Decorative scroll-position indicator, matching the source
          screen's own right-edge scrollbar — not a real scrollable
          element here since nothing below it is clipped. */}
      <span className="absolute top-14 right-0 h-24 w-1 rounded-full bg-[#f2f2f2]/25" />

      <div className="flex flex-col gap-6">
        <div className="flex items-start justify-between">
          <div className="flex items-end gap-1.5 text-[#f2f2f2]">
            <span className="font-serif text-5xl leading-none">45</span>
            <span className="text-lg text-[#f2f2f2]/30">ms</span>
          </div>
          <p className="max-w-[150px] text-right text-xs leading-tight text-[#dd416b]">
            BELOW AVERAGE FOR AGE 32
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-gold">Range Graph</p>
          <div
            className="relative h-[9px] w-full rounded-[3px]"
            style={{
              background:
                "linear-gradient(90deg, rgb(215,69,78) 0%, rgb(239,125,63) 10.1%, rgb(208,143,52) 20.2%, rgb(55,210,124) 51.4%, rgb(132,176,88) 76.9%, rgb(170,160,70) 88%, rgb(215,69,78) 100%)",
            }}
          >
            <span className="absolute inset-y-0 left-[37%] w-[52%] rounded-full bg-[#f2f2f2]/25 backdrop-blur-[2px]" />
            <span className="absolute top-1/2 left-[18%] size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#c3d1de] bg-[#f2f2f2]" />
          </div>
          <div className="flex justify-between text-sm text-[#5e6165]">
            <span>10ms</span>
            <span>110ms</span>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-gold-soft/30 bg-gold/10 px-4 py-3">
          <Sparkle className="mt-0.5 size-5 shrink-0 fill-gold text-gold" />
          <p className="text-sm leading-relaxed text-[#c6c7c9]">
            Your HRV is 45 ms. Below average for a 32-year-old male is 67 to 90
            ms.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm text-gold">24-Hour Trend</p>

          <div className="relative h-[220px] w-full overflow-hidden rounded-2xl bg-navy-soft">
            <div className="absolute top-[24%] left-[11%] flex h-[62%] w-[85%] flex-col justify-between text-right text-[9px] text-[#5e6165]">
              <span>110</span>
              <span>90</span>
              <span>70</span>
              <span>20</span>
            </div>

            <div className="absolute top-[24%] left-[13%] h-[62%] w-[82%]">
              <div className="absolute inset-x-0 top-0 h-px bg-white/8" />
              <div className="absolute inset-x-0 top-1/3 h-px bg-white/8" />
              <div className="absolute inset-x-0 top-2/3 h-px bg-white/8" />
              <div className="absolute inset-x-0 bottom-0 h-px bg-white/8" />

              <div className="absolute inset-x-0 top-[18%] h-[38%] border-y border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.08)]" />

              <svg
                viewBox="0 0 301 108"
                preserveAspectRatio="none"
                className="absolute inset-0 size-full overflow-visible"
                fill="none"
              >
                <path
                  d="M0 88 C 40 90, 60 78, 75 68 C 95 54, 110 30, 150 22 C 175 18, 190 24, 210 34 C 235 46, 255 60, 301 66"
                  stroke="var(--color-gold)"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <line
                  x1="188"
                  y1="0"
                  x2="188"
                  y2="108"
                  stroke="#f2f2f2"
                  strokeOpacity="0.4"
                  strokeDasharray="2 3"
                />
                <circle cx="188" cy="27" r="3.5" fill="var(--color-gold)" />
              </svg>

              <div className="absolute top-0 left-[62%] flex -translate-x-1/2 -translate-y-[115%] items-center gap-1 rounded-xl border border-bronze bg-[rgba(22,20,16,0.5)] px-3 py-1 text-[9.5px] whitespace-nowrap backdrop-blur-sm">
                <span className="text-[#c6c7c9]">3:00 PM</span>
                <span className="text-gold-deep">58ms</span>
              </div>
            </div>

            <div className="absolute bottom-[8%] left-[11%] flex w-[85%] justify-between text-[10px] text-[#5e6165]">
              <span>12am</span>
              <span>6am</span>
              <span>12pm</span>
              <span>6pm</span>
              <span>12am</span>
            </div>
          </div>

          <div className="flex w-full items-center justify-between rounded-2xl bg-navy-soft px-6 py-4">
            <StatCell label="HIGHEST" value="58" />
            <div className="h-10 w-px bg-white/8" />
            <StatCell label="LOWEST" value="28" />
            <div className="h-10 w-px bg-white/8" />
            <StatCell label="AVERAGE" value="40" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="text-[10.5px] text-[#5e6165]">{label}</p>
      <div className="flex items-center gap-1">
        <span className="text-lg text-[#f2f2f2]">{value}</span>
        <span className="text-[10.5px] text-[#5e6165]">ms</span>
      </div>
    </div>
  );
}
