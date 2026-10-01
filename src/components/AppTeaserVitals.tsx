import type { CSSProperties, ReactNode } from "react";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

/**
 * The homepage "See It. Act On It." cluster: four vitals tiles from the
 * Figma app screens (Heart Rate 15332:15452, HRV 15332:15472, Stress
 * 15332:15527, Blood Pressure 15332:15539).
 *
 * Every tile is 167.5px wide in Figma. Each floating box is a size
 * container, and every measurement inside is that Figma pixel value
 * expressed in cqw (px / 167.5 * 100), so a tile scales as one unit with
 * its box and its content always fits exactly, at any viewport width.
 * Box aspect ratios are the Figma frame ratios for the same reason.
 */

const SUCCESS = "#4ade80";
const DANGER = "#dd416b";
const MUTED = "#909396";
const VALUE = "#f2f2f2";
const TRACK = "#5e6165";

const valueGlow: CSSProperties = { textShadow: "0 4.35cqw 14.92cqw rgba(200, 182, 143, 0.5)" };

function Tile({ children, row = false }: { children: ReactNode; row?: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative flex size-full items-start overflow-hidden rounded-[12.26cqw] border border-gold-soft/40 p-[8.17cqw] text-left",
        row ? "flex-row gap-[6.13cqw]" : "flex-col gap-[6.13cqw]"
      )}
      style={{
        backgroundImage:
          "linear-gradient(204deg, color-mix(in oklab, var(--color-gold-deep) 20%, transparent) 4.3%, rgba(16, 17, 23, 0.04) 63.8%), linear-gradient(var(--color-navy), var(--color-navy))",
        boxShadow: "0 0.51cqw 0.26cqw 0.03cqw rgba(29, 41, 61, 0.02)",
      }}
    >
      {children}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/figma/vitals/refresh.svg"
        alt=""
        width={14}
        height={14}
        className="absolute top-[8.96cqw] right-[8.66cqw] size-[8.36cqw]"
      />
    </div>
  );
}

function Label({ children }: { children: ReactNode }) {
  return (
    <p className="text-[6.57cqw] leading-[10.86cqw] whitespace-nowrap" style={{ color: MUTED }}>
      {children}
    </p>
  );
}

function Pill({ children, color }: { children: ReactNode; color: string }) {
  return (
    <span
      className="rounded-full border px-[5.37cqw] py-[2.39cqw] text-[6.27cqw] leading-[10.86cqw] whitespace-nowrap"
      style={{ color, borderColor: color, backgroundColor: `color-mix(in oklab, ${color} 10%, transparent)` }}
    >
      {children}
    </span>
  );
}

/** Bar heights in Figma px, out of the 20px sparkline height. */
function Sparkline({ bars, color }: { bars: number[]; color: string }) {
  return (
    <div className="flex h-[11.94cqw] w-[42.99cqw] items-end gap-[1.79cqw]">
      {bars.map((h, i) => (
        <span
          key={i}
          className="block w-[3.81cqw] shrink-0 rounded-[1.19cqw]"
          style={{ height: `${(h / 20) * 100}%`, backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function Reading({ value, unit, size }: { value: string; unit: string; size: "hr" | "hrv" }) {
  return (
    <div className="flex items-end gap-[2.39cqw] whitespace-nowrap" style={{ color: VALUE }}>
      <span
        className={size === "hr" ? "text-[14.33cqw] leading-[16.48cqw]" : "text-[13.13cqw] leading-[15.1cqw]"}
        style={valueGlow}
      >
        {value}
      </span>
      <span className="text-[8.96cqw] leading-[16.48cqw] font-light opacity-30">{unit}</span>
    </div>
  );
}

function HeartRateTile() {
  return (
    <Tile>
      <Label>Heart Rate</Label>
      <Reading value="75" unit="bpm" size="hr" />
      <Sparkline color="var(--color-gold)" bars={[8.571, 12.857, 7.143, 20, 11.429, 15.714, 10, 14.286]} />
      <Pill color={SUCCESS}>Normal</Pill>
    </Tile>
  );
}

function HrvTile() {
  return (
    <Tile>
      <Label>HRV</Label>
      <Reading value="45" unit="ms" size="hrv" />
      <Sparkline color={DANGER} bars={[20, 14, 18, 10, 12, 8, 10, 12]} />
      <Pill color={DANGER}>below avg</Pill>
    </Tile>
  );
}

function StressTile() {
  return (
    <Tile row>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/figma/vitals/stress-ring.svg" alt="" width={40} height={40} className="size-[23.88cqw] shrink-0" />
      <div className="flex flex-col gap-[1.79cqw] whitespace-nowrap">
        <Label>Stress</Label>
        <p className="text-[10.75cqw] leading-[12.36cqw]" style={{ color: VALUE, ...valueGlow }}>
          28/100
        </p>
      </div>
    </Tile>
  );
}

function PressureRow({ label, value, fill }: { label: string; value: string; fill: number }) {
  return (
    <div className="flex h-[5.97cqw] w-full items-center gap-[4.78cqw]">
      <span className="w-[17.91cqw] shrink-0 text-[6.27cqw] leading-[10.86cqw]" style={{ color: MUTED }}>
        {label}
      </span>
      <span className="relative h-[2.99cqw] min-w-px flex-1 overflow-hidden rounded-full" style={{ backgroundColor: TRACK }}>
        <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${fill}%`, backgroundColor: SUCCESS }} />
      </span>
      <span className="shrink-0 text-[6.27cqw] leading-[10.86cqw]" style={{ color: MUTED }}>
        {value}
      </span>
    </div>
  );
}

function BloodPressureTile() {
  return (
    <Tile>
      <div className="flex flex-col gap-[2.39cqw] whitespace-nowrap">
        <Label>Blood Pressure</Label>
        <p className="text-[11.34cqw] leading-[13.04cqw]" style={{ color: VALUE, ...valueGlow }}>
          114/76
        </p>
      </div>
      <div className="flex w-full flex-col gap-[2.99cqw]">
        <PressureRow label="SYS" value="114" fill={78.8} />
        <PressureRow label="DIA" value="76" fill={59.9} />
      </div>
      <Pill color={SUCCESS}>Optimal</Pill>
    </Tile>
  );
}

/** Figma frame ratios (width / height) keep each box its tile's shape; Heart
 *  Rate and HRV get 3px more height for the site font's taller line boxes. */
const TILES = [
  { Tile: HeartRateTile, className: "top-[2%] left-0 w-[44%] aspect-[167.5/155] -rotate-5" },
  { Tile: HrvTile, className: "top-[10%] right-0 w-[44%] aspect-[167.5/155] rotate-4" },
  { Tile: BloodPressureTile, className: "bottom-[6%] left-[6%] w-[42%] aspect-[167.5/150] rotate-3" },
  { Tile: StressTile, className: "right-[2%] bottom-[20%] w-[46%] aspect-[167.5/71] -rotate-3" },
] as const;

export function AppTeaserVitals() {
  return (
    <>
      {TILES.map(({ Tile: TileContent, className }, i) => (
        <Reveal
          key={i}
          delay={i * 0.1}
          y={16}
          className={cn(
            "@container absolute transition-[translate,filter] duration-300 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:brightness-110",
            className
          )}
        >
          <TileContent />
        </Reveal>
      ))}
    </>
  );
}
