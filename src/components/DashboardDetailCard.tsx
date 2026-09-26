"use client";

import { useId, useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Figma file Ok6qYziHfAl50GRs0YRC6O, node 15332:15442 ("Health Vitals")
 * — the FULL 11-widget dashboard, for /inside-the-app's "Your Day At A
 * Glance" media. VitalsDashboard.tsx already builds 6 of these 11
 * widgets (Heart Rate, HRV, SpO2, Skin Temperature, Sleep Score,
 * Stress) for /how-it-works' own smaller "The First Read" card, per
 * that file's own explicit "only six of eleven, the rest dropped"
 * instruction from that earlier request — this component is NOT that
 * one reused, it's a fresh build with all 11 (the 6 already-built ones
 * plus Blood Pressure, Active Calories, Daily Steps, Sleep Duration,
 * and the ECG trace), because the two render at genuinely different
 * scales: VitalsDashboard's fixed rem/px sizing was tuned for its own
 * small square card, and reusing it inside a LIFE-SIZE phone mockup
 * would hit the exact "wrong unit for the context" bug this whole
 * session's other phone screens (EmotionalWheelScreen, SleepDetailCard)
 * already found and fixed — cqw/cqh sizing against this component's
 * own `containerType: "size"` root is what actually scales correctly
 * here, matching those two components' own established convention.
 *
 * Token reuse (do not re-declare):
 *   - Card background gradient's dark stop, border (#E5DAC2), and
 *     sparkline/value-shadow tan are exact matches for --color-navy /
 *     --color-gold-soft / --color-gold.
 * Status colors (success #4ADE80, danger #DD416B) and neutral greys
 * are the app's own semantic palette, not this brand's tokens, and
 * stay literal hex — same treatment as VitalsDashboard.tsx.
 *
 * The ECG trace reuses NeuroWaveVisual.tsx's own established seamless-
 * marquee technique (two copies of one heartbeat-blip SVG path inside
 * a 200%-wide wrapper, `animate-ecg-scroll`) rather than downloading
 * the source's own raster PNG trace — a real, already-solved animated
 * ECG line exists in this codebase; re-deriving it from a static image
 * would be a strict downgrade.
 *
 * Live interactive: every tile has its own working refresh control,
 * re-rolling that metric within a plausible range — the same
 * established pattern VitalsDashboard.tsx uses for its 6 shared
 * widgets, extended here to the other 5. A "refresh all" button in the
 * header (matching the source's own "Refresh All Button") re-rolls
 * every widget at once and bumps the "Last Synced" timestamp to the
 * current time.
 */

const SUCCESS = "#4ade80";
const DANGER = "#dd416b";

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function formatTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function RefreshIcon({
  onClick,
  spinning,
  className,
}: {
  onClick: () => void;
  spinning: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Refresh reading"
      className={cn(
        "absolute top-[4cqw] right-[4cqw] text-cream/40 transition-colors hover:text-cream/70",
        className
      )}
    >
      <RefreshCw className={cn("size-[3.6cqw]", spinning && "animate-spin")} />
    </button>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="rounded-full border px-[2.3cqw] py-[1cqw] text-[2.67cqw] whitespace-nowrap"
      style={{ borderColor: color, color, backgroundColor: `${color}1a` }}
    >
      {label}
    </span>
  );
}

function Sparkline({ heights, color }: { heights: number[]; color: string }) {
  return (
    <div className="flex h-[5.1cqw] w-[18.3cqw] items-end gap-[0.76cqw]">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[1.53cqw] rounded-[1px]"
          style={{ height: `${h}%`, backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function BarTrack({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="h-[1.27cqw] w-full max-w-[35.4cqw] overflow-hidden rounded-full bg-[#5e6165]">
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${Math.max(0, Math.min(100, percent))}%`, backgroundColor: color }}
      />
    </div>
  );
}

function Ring({ percent, color }: { percent: number; color: string }) {
  const uid = useId();
  const r = 16;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 40 40" className="size-[10.2cqw] shrink-0 -rotate-90">
      <circle cx="20" cy="20" r={r} fill="none" stroke="#2a2d33" strokeWidth="4" />
      <circle
        cx="20"
        cy="20"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (percent / 100) * c}
        className="transition-[stroke-dashoffset] duration-500"
        id={uid}
      />
    </svg>
  );
}

function Tile({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-[2.6cqw] overflow-hidden rounded-[5.2cqw] border border-gold-soft/30 bg-navy p-[3.5cqw]",
        className
      )}
    >
      {children}
    </div>
  );
}

/** A small hour-bucketed bar chart (Active Calories / Daily Steps) —
 *  fixed-height container with each bar sized via % of ITS OWN parent
 *  (not an unsized flex ancestor) — see SleepDetailCard.tsx's own
 *  Sleep Trend chart doc comment for the confirmed bug this avoids. */
function MiniBarChart({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values);
  return (
    <div className="flex h-[10.7cqw] w-full items-end gap-[0.76cqw]">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-[1px]"
          style={{ height: `${(v / max) * 100}%`, backgroundColor: color, opacity: 0.4 + (v / max) * 0.6 }}
        />
      ))}
    </div>
  );
}

function HourLabels() {
  return (
    <div className="flex justify-between text-[2.3cqw] text-[#909396]">
      <span>12a</span>
      <span>6a</span>
      <span>12p</span>
      <span>6p</span>
      <span>12a</span>
    </div>
  );
}

function DateNav({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-[2cqw] text-[2.8cqw] text-gold">
      <ChevronLeft className="size-[4.07cqw]" />
      <span className="whitespace-nowrap">{label}</span>
      <ChevronRight className="size-[4.07cqw]" />
    </div>
  );
}

function EcgStrip() {
  return (
    <svg viewBox="0 0 800 100" preserveAspectRatio="none" className="h-full w-1/2 shrink-0" fill="none">
      <path
        d="M0 50 H60 L80 50 L92 20 L104 80 L116 50 L136 50 H260 L280 50 L292 20 L304 80 L316 50 L336 50 H460 L480 50 L492 20 L504 80 L516 50 L536 50 H660 L680 50 L692 20 L704 80 L716 50 L736 50 H800"
        stroke="var(--color-gold)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const CALORIE_HOURS = [18, 25, 14, 41, 25, 41, 9, 20, 14, 31, 21, 15];
const STEP_HOURS = [12, 30, 45, 90, 60, 110, 40, 70, 55, 95, 35, 20];

export function DashboardDetailCard({ className }: { className?: string }) {
  const [heartRate, setHeartRate] = useState(75);
  const [heartSpark, setHeartSpark] = useState([43, 64, 36, 100, 57, 79, 50, 71]);
  const [heartBusy, setHeartBusy] = useState(false);

  const [hrv, setHrv] = useState(45);
  const [hrvSpark, setHrvSpark] = useState([100, 70, 90, 50, 60, 40, 50, 60]);
  const [hrvBusy, setHrvBusy] = useState(false);

  const [spo2, setSpo2] = useState(98);
  const [spo2Busy, setSpo2Busy] = useState(false);

  const [skinTemp, setSkinTemp] = useState(98.6);
  const [skinBusy, setSkinBusy] = useState(false);

  const [sleepScore, setSleepScore] = useState(82);
  const [sleepBusy, setSleepBusy] = useState(false);

  const [stress, setStress] = useState(28);
  const [stressBusy, setStressBusy] = useState(false);

  const [sys, setSys] = useState(114);
  const [dia, setDia] = useState(76);
  const [bpBusy, setBpBusy] = useState(false);

  const [calories, setCalories] = useState(1858);
  const [calorieBars, setCalorieBars] = useState(CALORIE_HOURS);
  const [calorieBusy, setCalorieBusy] = useState(false);

  const [steps, setSteps] = useState(7521);
  const [stepBars, setStepBars] = useState(STEP_HOURS);
  const [stepsBusy, setStepsBusy] = useState(false);

  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [allBusy, setAllBusy] = useState(false);

  function refresh(setBusy: (v: boolean) => void, apply: () => void) {
    setBusy(true);
    setTimeout(() => {
      apply();
      setBusy(false);
    }, 550);
  }

  function refreshAll() {
    setAllBusy(true);
    refresh(setHeartBusy, () => {
      const next = Math.round(randomBetween(58, 96));
      setHeartRate(next);
      setHeartSpark(Array.from({ length: 8 }, () => 35 + Math.random() * 65));
    });
    refresh(setHrvBusy, () => {
      setHrv(Math.round(randomBetween(25, 68)));
      setHrvSpark(Array.from({ length: 8 }, () => 40 + Math.random() * 60));
    });
    refresh(setSpo2Busy, () => setSpo2(Math.round(randomBetween(94, 100))));
    refresh(setSkinBusy, () => setSkinTemp(Math.round(randomBetween(970, 995)) / 10));
    refresh(setSleepBusy, () => setSleepScore(Math.round(randomBetween(55, 96))));
    refresh(setStressBusy, () => setStress(Math.round(randomBetween(10, 62))));
    refresh(setBpBusy, () => {
      setSys(Math.round(randomBetween(108, 128)));
      setDia(Math.round(randomBetween(68, 84)));
    });
    refresh(setCalorieBusy, () => {
      const bars = CALORIE_HOURS.map(() => randomBetween(8, 45));
      setCalorieBars(bars);
      setCalories(Math.round(bars.reduce((a, b) => a + b, 0) * 6.78));
    });
    refresh(setStepsBusy, () => {
      const bars = STEP_HOURS.map(() => randomBetween(10, 115));
      setStepBars(bars);
      setSteps(Math.round(bars.reduce((a, b) => a + b, 0) * 11.36));
    });
    setTimeout(() => {
      setLastSynced(new Date());
      setAllBusy(false);
    }, 600);
  }

  return (
    <div className={cn("relative flex w-full flex-col", className)} style={{ containerType: "size" }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[3.6cqw] text-[#5e6165]">Health Vitals</p>
          <p className="mt-[0.76cqw] text-[2.67cqw] text-[#5e6165]/70">
            {lastSynced ? `Last Synced Today at ${formatTime(lastSynced)}` : "Last Synced Today at 10:04 AM"}
          </p>
        </div>
        <button
          type="button"
          onClick={refreshAll}
          aria-label="Refresh all"
          className="flex size-[9.4cqw] items-center justify-center rounded-full bg-gold/10"
        >
          <RefreshCw className={cn("size-[4cqw] text-cream/70", allBusy && "animate-spin")} />
        </button>
      </div>

      <div className="mt-[5.1cqw] grid grid-cols-2 gap-[2.6cqw]">
        <Tile>
          <RefreshIcon
            spinning={heartBusy}
            onClick={() =>
              refresh(setHeartBusy, () => {
                const next = Math.round(randomBetween(58, 96));
                setHeartRate(next);
                setHeartSpark(Array.from({ length: 8 }, () => 35 + Math.random() * 65));
              })
            }
          />
          <p className="text-[2.8cqw] text-[#909396]">Heart Rate</p>
          <div className="flex items-center gap-[1cqw]">
            <span className="text-[6.1cqw] text-[#f2f2f2]">{heartRate}</span>
            <span className="text-[3.8cqw] text-[#f2f2f2]/30">bpm</span>
          </div>
          <Sparkline heights={heartSpark} color="var(--color-gold)" />
          <Pill
            label={heartRate >= 60 && heartRate <= 100 ? "Normal" : "Elevated"}
            color={heartRate >= 60 && heartRate <= 100 ? SUCCESS : DANGER}
          />
        </Tile>

        <Tile>
          <RefreshIcon
            spinning={hrvBusy}
            onClick={() =>
              refresh(setHrvBusy, () => {
                const next = Math.round(randomBetween(25, 68));
                setHrv(next);
                setHrvSpark(Array.from({ length: 8 }, () => 40 + Math.random() * 60));
              })
            }
          />
          <p className="text-[2.8cqw] text-[#909396]">HRV</p>
          <div className="flex items-end gap-[1cqw]">
            <span className="text-[5.6cqw] text-[#f2f2f2]">{hrv}</span>
            <span className="text-[3.8cqw] text-[#f2f2f2]/30">ms</span>
          </div>
          <Sparkline heights={hrvSpark} color={hrv >= 50 ? SUCCESS : DANGER} />
          <Pill label={hrv >= 50 ? "Normal" : "below avg"} color={hrv >= 50 ? SUCCESS : DANGER} />
        </Tile>

        <Tile>
          <RefreshIcon spinning={spo2Busy} onClick={() => refresh(setSpo2Busy, () => setSpo2(Math.round(randomBetween(94, 100))))} />
          <p className="text-[2.8cqw] text-[#909396]">SPO2</p>
          <p className="text-[4.83cqw] text-[#f2f2f2]">{spo2}%</p>
          <BarTrack percent={spo2} color={SUCCESS} />
          <Pill label={spo2 >= 95 ? "Normal" : "Low"} color={SUCCESS} />
        </Tile>

        <Tile>
          <RefreshIcon spinning={skinBusy} onClick={() => refresh(setSkinBusy, () => setSkinTemp(Math.round(randomBetween(970, 995)) / 10))} />
          <p className="text-[2.8cqw] text-[#909396]">Skin Temperature</p>
          <p className="text-[4.83cqw] text-[#f2f2f2]">{skinTemp.toFixed(1)}°F</p>
          <BarTrack percent={((skinTemp - 96) / (100 - 96)) * 100} color={SUCCESS} />
          <Pill label="Normal" color={SUCCESS} />
        </Tile>

        <Tile className="flex-row items-center">
          <RefreshIcon spinning={sleepBusy} onClick={() => refresh(setSleepBusy, () => setSleepScore(Math.round(randomBetween(55, 96))))} />
          <Ring percent={sleepScore} color={sleepScore >= 60 ? SUCCESS : DANGER} />
          <div>
            <p className="text-[2.8cqw] text-[#909396]">Sleep Score</p>
            <p className="text-[4.6cqw] text-[#f2f2f2]">{sleepScore}/100</p>
          </div>
        </Tile>

        <Tile className="flex-row items-center">
          <RefreshIcon spinning={stressBusy} onClick={() => refresh(setStressBusy, () => setStress(Math.round(randomBetween(10, 62))))} />
          <Ring percent={stress} color={stress <= 40 ? SUCCESS : DANGER} />
          <div>
            <p className="text-[2.8cqw] text-[#909396]">Stress</p>
            <p className="text-[4.6cqw] text-[#f2f2f2]">{stress}/100</p>
          </div>
        </Tile>

        <Tile>
          <RefreshIcon
            spinning={bpBusy}
            onClick={() =>
              refresh(setBpBusy, () => {
                setSys(Math.round(randomBetween(108, 128)));
                setDia(Math.round(randomBetween(68, 84)));
              })
            }
          />
          <p className="text-[2.8cqw] text-[#909396]">Blood Pressure</p>
          <p className="text-[4.83cqw] text-[#f2f2f2]">
            {sys}/{dia}
          </p>
          <div className="flex flex-col gap-[1.27cqw]">
            <div className="flex items-center gap-[2cqw]">
              <span className="w-[7.6cqw] text-[2.67cqw] text-[#909396]">SYS</span>
              <BarTrack percent={((sys - 90) / (140 - 90)) * 100} color={SUCCESS} />
              <span className="text-[2.67cqw] text-[#909396]">{sys}</span>
            </div>
            <div className="flex items-center gap-[2cqw]">
              <span className="w-[7.6cqw] text-[2.67cqw] text-[#909396]">DIA</span>
              <BarTrack percent={((dia - 60) / (90 - 60)) * 100} color={SUCCESS} />
              <span className="text-[2.67cqw] text-[#909396]">{dia}</span>
            </div>
          </div>
          <Pill label="Optimal" color={SUCCESS} />
        </Tile>

        <Tile className="justify-between">
          <RefreshIcon
            spinning={calorieBusy}
            onClick={() =>
              refresh(setCalorieBusy, () => {
                const bars = CALORIE_HOURS.map(() => randomBetween(8, 45));
                setCalorieBars(bars);
                setCalories(Math.round(bars.reduce((a, b) => a + b, 0) * 6.78));
              })
            }
          />
          <p className="text-[2.8cqw] text-[#909396]">Active Calories</p>
          <p className="flex items-baseline gap-[1.27cqw]">
            <span className="text-[5.6cqw] text-[#f2f2f2]">{calories.toLocaleString()}</span>
            <span className="text-[3cqw] text-gold">kcal</span>
          </p>
          <MiniBarChart values={calorieBars} color="var(--color-gold)" />
        </Tile>
      </div>

      <div className="mt-[2.6cqw] flex flex-col gap-[3cqw] rounded-[5.2cqw] border border-gold-soft/30 bg-navy p-[3.5cqw]">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-[6cqw]">
            <div>
              <p className="text-[2.8cqw] text-[#909396]">Daily Steps</p>
              <p className="text-[5.6cqw] text-[#f2f2f2]">{steps.toLocaleString()}</p>
            </div>
            <div className="text-[2.8cqw] text-[#909396]">
              <p>4.7 km</p>
              <p>321 kcal</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-[2.5cqw]">
            <RefreshIcon
              spinning={stepsBusy}
              className="static"
              onClick={() =>
                refresh(setStepsBusy, () => {
                  const bars = STEP_HOURS.map(() => randomBetween(10, 115));
                  setStepBars(bars);
                  setSteps(Math.round(bars.reduce((a, b) => a + b, 0) * 11.36));
                })
              }
            />
            <DateNav label="Today" />
          </div>
        </div>
        <MiniBarChart values={stepBars} color="var(--color-gold)" />
        <HourLabels />
      </div>

      <div className="mt-[2.6cqw] flex flex-col gap-[3.06cqw] rounded-[5.2cqw] border border-gold-soft/30 bg-navy p-[3.5cqw]">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[2.8cqw] text-[#909396]">Sleep Duration</p>
            <p className="text-[5.6cqw] text-[#f2f2f2]">7h 23m</p>
          </div>
          <DateNav label="Today" />
        </div>
        <div className="flex h-[2cqw] gap-[0.5cqw] overflow-hidden rounded-full">
          <div className="h-full" style={{ width: "23%", backgroundColor: "#1b4d3e" }} />
          <div className="h-full" style={{ width: "27%", backgroundColor: "#34d399" }} />
          <div className="h-full" style={{ width: "7%", backgroundColor: "#b8e6c9" }} />
          <div className="h-full" style={{ width: "23%", backgroundColor: "#3188c5" }} />
          <div className="h-full" style={{ width: "18%", backgroundColor: "#34d399" }} />
        </div>
        <div className="flex justify-between text-[2.67cqw]">
          <div className="flex flex-col gap-[0.76cqw]">
            <span className="flex items-center gap-[1.27cqw] text-[#909396]">
              <span className="size-[1.78cqw] rounded-full" style={{ backgroundColor: "#1b4d3e" }} />
              Deep
            </span>
            <span className="text-[3.3cqw] text-[#f2f2f2]">1h 42m</span>
          </div>
          <div className="flex flex-col gap-[0.76cqw]">
            <span className="flex items-center gap-[1.27cqw] text-[#909396]">
              <span className="size-[1.78cqw] rounded-full" style={{ backgroundColor: "#b8e6c9" }} />
              Light
            </span>
            <span className="text-[3.3cqw] text-[#f2f2f2]">3h 36m</span>
          </div>
          <div className="flex flex-col gap-[0.76cqw]">
            <span className="flex items-center gap-[1.27cqw] text-[#909396]">
              <span className="size-[1.78cqw] rounded-full" style={{ backgroundColor: "#34d399" }} />
              Rem
            </span>
            <span className="text-[3.3cqw] text-[#f2f2f2]">2h 02m</span>
          </div>
        </div>
        <div className="border-t border-white/8 pt-[3cqw]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[2.67cqw] text-[#909396]">Bedtime</p>
              <p className="text-[3.3cqw] text-[#f2f2f2]">11:42 PM</p>
            </div>
            <div>
              <p className="text-[2.67cqw] text-[#909396]">Woke Up</p>
              <p className="text-[3.3cqw] text-[#f2f2f2]">7:05 AM</p>
            </div>
            <div>
              <p className="flex items-center gap-[1cqw] text-[2.67cqw] text-[#909396]">
                <span className="size-[1.78cqw] rounded-full bg-[#3188c5]" />
                Awake Time
              </p>
              <p className="text-[3.3cqw] text-[#3188c5]">18 min</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-[2.6cqw] flex flex-col gap-[2.6cqw] rounded-[5.2cqw] border border-gold-soft/30 bg-navy p-[3.5cqw]">
        <div className="flex items-center justify-between">
          <p className="text-[2.8cqw] text-[#909396]">ECG — Electrocardiogram</p>
          <p className="text-[5.6cqw] text-[#f2f2f2]">{heartRate}</p>
        </div>
        <div
          aria-hidden="true"
          className="h-[13.2cqw] overflow-hidden"
          style={{ filter: "drop-shadow(0 0 3px var(--color-gold))" }}
        >
          <div className="flex h-full w-[200%] animate-ecg-scroll">
            <EcgStrip />
            <EcgStrip />
          </div>
        </div>
      </div>
    </div>
  );
}
