import { Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Figma file Ok6qYziHfAl50GRs0YRC6O, node 15312:18742 — the HRV detail
 * screen (header reading, range graph, insight callout, 24-hour trend
 * chart, highest/lowest/average stats). Everything below "About this
 * metric" is dropped per explicit instruction; that section itself is
 * excluded entirely.
 *
 * Token reuse (do not re-declare):
 *   - Card base (#1C1D23) is an exact match for --color-navy-soft.
 *   - Insight box border (#E5DAC2) and section labels ("Range Graph",
 *     "24-Hour Trend") are exact matches for --color-gold-soft /
 *     --color-gold.
 *   - Trend tooltip's border (#6D644F) and value text (#C4B38E) are
 *     exact matches for --color-bronze / --color-gold-deep.
 * The range-bar's seven-stop rainbow gradient, the danger red
 * (#DD416B), the safe-range green band, and the chart's neutral greys
 * are the app's own local palette (not this brand's tokens) and stay
 * literal hex — same treatment as VitalsDashboard.tsx.
 *
 * Static: this is a read-only detail screen in the source design (no
 * interaction affordances), so unlike VitalsDashboard's refresh
 * buttons, nothing here is wired up to change on click.
 */
export function HrvDetailCard({ className }: { className?: string }) {
  return (
    <div className={cn("flex w-full max-w-sm flex-col gap-4 text-left", className)}>
      <div className="flex items-start justify-between">
        <div className="flex items-end gap-1.5 text-[#f2f2f2]">
          <span className="font-serif text-4xl leading-none">45</span>
          <span className="text-base text-[#f2f2f2]/30">ms</span>
        </div>
        <p className="max-w-[140px] text-right text-[11px] leading-tight text-[#dd416b]">
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
          <span className="absolute top-1/2 left-[18%] size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-white shadow-[0_0_4px_rgba(0,0,0,0.4)]" />
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

        <div className="relative h-[165px] w-full overflow-hidden rounded-2xl bg-navy-soft">
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
