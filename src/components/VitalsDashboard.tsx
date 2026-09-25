"use client";

import { useId, useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Figma file Ok6qYziHfAl50GRs0YRC6O, node 15332:15442 ("Health Vitals")
 * — a phone-app "vitals dashboard" mockup. Only six of its eleven
 * widgets are used here, per explicit instruction: Heart Rate, HRV,
 * SpO2, Skin Temperature, Sleep Score, and Stress. Blood Pressure,
 * Active Calories, Daily Steps, Sleep Duration and the ECG trace are
 * dropped.
 *
 * This is a screenshot of an app screen, not a themed marketing
 * surface — its near-black card background (rgb(11,16,22)) is an
 * exact hex match for --color-navy, and its border/sparkline tan is an
 * exact match for --color-gold-soft / --color-gold, so those three are
 * reused. Its status colors (success #4ADE80, danger #DD416B) and
 * neutral greys are the app's own semantic palette, not this site's
 * brand tokens, and stay literal hex — same treatment as the unnamed
 * local colors in BodySilhouette/BreathingCard.
 *
 * "Live interactive": each tile has its own working refresh control —
 * clicking it re-rolls that metric's value (and its sparkline/bar/ring)
 * within a plausible physiological range, with a brief spin on the
 * icon. There's no real sensor behind it, so this is a genuinely
 * interactive demo, not a claim of live device data.
 */

const SUCCESS = "#4ade80";
const DANGER = "#dd416b";

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function RefreshIcon({ onClick, spinning }: { onClick: () => void; spinning: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Refresh reading"
      className="absolute top-3.5 right-3.5 text-cream/40 transition-colors hover:text-cream/70"
    >
      <RefreshCw className={cn("size-3.5", spinning && "animate-spin")} />
    </button>
  );
}

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="rounded-full border px-2.5 py-1 text-[10px]"
      style={{ borderColor: color, color, backgroundColor: `${color}1a` }}
    >
      {label}
    </span>
  );
}

function Sparkline({ heights, color }: { heights: number[]; color: string }) {
  return (
    <div className="flex h-5 w-[72px] items-end gap-[3px]">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[6px] rounded-[2px]"
          style={{ height: `${h}%`, backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function BarTrack({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="h-[5px] w-full max-w-[139px] overflow-hidden rounded-full bg-[#5e6165]">
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${percent}%`, backgroundColor: color }} />
    </div>
  );
}

function Ring({ percent, color }: { percent: number; color: string }) {
  const uid = useId();
  const r = 16;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 40 40" className="size-10 shrink-0 -rotate-90">
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
        "relative flex flex-col gap-2.5 overflow-hidden rounded-2xl border border-gold-soft/30 bg-navy p-3.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function heartRateSparkline(bpm: number) {
  return Array.from({ length: 8 }, () => 35 + Math.random() * 65 + (bpm - 75) * 0.3);
}

function hrvSparkline(ms: number) {
  return Array.from({ length: 8 }, () => 40 + Math.random() * 60 + (ms - 45) * 0.4);
}

// Figma's own exact sparkline bars for the initial 75bpm/45ms readings
// (server-rendered, so this must be deterministic — the randomized
// version only kicks in on a client refresh click, never on mount).
const INITIAL_HEART_SPARK = [42.85, 64.3, 35.7, 100, 57.15, 78.55, 50, 71.45];
const INITIAL_HRV_SPARK = [100, 70, 90, 50, 60, 40, 50, 60];

export function VitalsDashboard({ className }: { className?: string }) {
  const [heartRate, setHeartRate] = useState(75);
  const [heartSpark, setHeartSpark] = useState(INITIAL_HEART_SPARK);
  const [heartBusy, setHeartBusy] = useState(false);

  const [hrv, setHrv] = useState(45);
  const [hrvSpark, setHrvSpark] = useState(INITIAL_HRV_SPARK);
  const [hrvBusy, setHrvBusy] = useState(false);

  const [spo2, setSpo2] = useState(98);
  const [spo2Busy, setSpo2Busy] = useState(false);

  const [skinTemp, setSkinTemp] = useState(98.6);
  const [skinBusy, setSkinBusy] = useState(false);

  const [sleepScore, setSleepScore] = useState(82);
  const [sleepBusy, setSleepBusy] = useState(false);

  const [stress, setStress] = useState(28);
  const [stressBusy, setStressBusy] = useState(false);

  function refresh(setBusy: (v: boolean) => void, apply: () => void) {
    setBusy(true);
    setTimeout(() => {
      apply();
      setBusy(false);
    }, 550);
  }

  return (
    <div className={cn("grid w-full grid-cols-2 gap-2.5", className)}>
      <Tile>
        <RefreshIcon
          spinning={heartBusy}
          onClick={() =>
            refresh(setHeartBusy, () => {
              const next = Math.round(randomBetween(58, 96));
              setHeartRate(next);
              setHeartSpark(heartRateSparkline(next));
            })
          }
        />
        <p className="text-[11px] text-cream/50">Heart Rate</p>
        <div className="flex items-center gap-1">
          <span className="text-2xl text-[#f2f2f2]">{heartRate}</span>
          <span className="text-sm text-[#f2f2f2]/30">bpm</span>
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
              setHrvSpark(hrvSparkline(next));
            })
          }
        />
        <p className="text-[11px] text-cream/50">HRV</p>
        <div className="flex items-end gap-1">
          <span className="text-2xl text-[#f2f2f2]">{hrv}</span>
          <span className="text-sm text-[#f2f2f2]/30">ms</span>
        </div>
        <Sparkline heights={hrvSpark} color={hrv >= 50 ? SUCCESS : DANGER} />
        <Pill label={hrv >= 50 ? "Normal" : "below avg"} color={hrv >= 50 ? SUCCESS : DANGER} />
      </Tile>

      <Tile>
        <RefreshIcon
          spinning={spo2Busy}
          onClick={() =>
            refresh(setSpo2Busy, () => setSpo2(Math.round(randomBetween(94, 100))))
          }
        />
        <p className="text-[11px] text-cream/50">SPO2</p>
        <p className="text-lg text-[#f2f2f2]">{spo2}%</p>
        <BarTrack percent={spo2} color={SUCCESS} />
        <Pill label={spo2 >= 95 ? "Normal" : "Low"} color={SUCCESS} />
      </Tile>

      <Tile>
        <RefreshIcon
          spinning={skinBusy}
          onClick={() =>
            refresh(setSkinBusy, () => setSkinTemp(Math.round(randomBetween(970, 995)) / 10))
          }
        />
        <p className="text-[11px] text-cream/50">Skin Temperature</p>
        <p className="text-lg text-[#f2f2f2]">{skinTemp.toFixed(1)}°F</p>
        <BarTrack percent={((skinTemp - 96) / (100 - 96)) * 100} color={SUCCESS} />
        <Pill label="Normal" color={SUCCESS} />
      </Tile>

      <Tile className="flex-row items-center">
        <RefreshIcon
          spinning={sleepBusy}
          onClick={() =>
            refresh(setSleepBusy, () => setSleepScore(Math.round(randomBetween(55, 96))))
          }
        />
        <Ring percent={sleepScore} color={sleepScore >= 60 ? SUCCESS : DANGER} />
        <div>
          <p className="text-[11px] text-cream/50">Sleep Score</p>
          <p className="text-base text-[#f2f2f2]">{sleepScore}/100</p>
        </div>
      </Tile>

      <Tile className="flex-row items-center">
        <RefreshIcon
          spinning={stressBusy}
          onClick={() =>
            refresh(setStressBusy, () => setStress(Math.round(randomBetween(10, 62))))
          }
        />
        <Ring percent={stress} color={stress <= 40 ? SUCCESS : DANGER} />
        <div>
          <p className="text-[11px] text-cream/50">Stress</p>
          <p className="text-base text-[#f2f2f2]">{stress}/100</p>
        </div>
      </Tile>
    </div>
  );
}
