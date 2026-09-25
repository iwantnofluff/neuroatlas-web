"use client";

import { useId, useState } from "react";
import { Heart, Zap, Eye, Coffee, ChevronRight, CornerRightDown, ArrowLeft, Watch } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Figma file Ok6qYziHfAl50GRs0YRC6O, node 15332:15354 — the "Stress
 * Age" dashboard: a gauge card (chronological vs. nervous-system age),
 * three toolkit metric tiles (Recovery Capacity, Cognitive Load,
 * Emotional Regulation), and a caffeine/band status row. Everything
 * below that row (the "Recommended / Mind Sanctum" wellness card) is
 * excluded per explicit instruction — this covers up to Caffeine and
 * Band only.
 *
 * Token reuse (do not re-declare):
 *   - Card borders (#6D644F) are an exact match for --color-bronze.
 *   - "Stress Age" label, metric-tile labels, and the Caffeine/Band
 *     labels (#C4B38E) are an exact match for --color-gold-deep.
 *   - Caffeine/Band card backgrounds (#0B1016) are an exact match for
 *     --color-navy.
 * The two-stop card gradients (#2C2820/#04121F, #04121F/#161410), the
 * success green (#4ADE80), danger red (#DD416B), and the cognitive-
 * load blue (#4B769E) are the app's own local palette and stay
 * literal hex, same treatment as VitalsDashboard.tsx/HrvDetailCard.tsx.
 *
 * Live interactive: each metric tile has VitalsDashboard's own
 * refresh-tile pattern (re-rolls that one value/status on click). The
 * gauge's own refresh badge re-simulates chronological/nervous-system
 * age together. The caffeine tile is a real log-use counter — tapping
 * it increments today's count and nudges Cognitive Load up slightly,
 * a believable (not real-sensor) cause and effect.
 */
const SUCCESS = "#4ade80";
const DANGER = "#dd416b";
const INFO = "#4b769e";

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function MetricTile({
  icon,
  label,
  value,
  status,
  color,
  onRefresh,
  busy,
  corner,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  status: string;
  color: string;
  onRefresh: () => void;
  busy: boolean;
  corner: "left" | "right" | "none";
}) {
  return (
    <div
      className={cn(
        "relative flex flex-1 flex-col gap-1.5 overflow-hidden border border-bronze px-2.5 py-3",
        corner === "left" && "rounded-tl-2xl rounded-tr-sm rounded-br-sm rounded-bl-sm",
        corner === "right" && "rounded-br-2xl rounded-tl-sm rounded-tr-sm rounded-bl-sm",
        corner === "none" && "rounded-sm",
      )}
      style={{
        backgroundImage: "linear-gradient(180deg, #04121f 36%, #161410 100%)",
      }}
    >
      <button
        type="button"
        onClick={onRefresh}
        aria-label={`Refresh ${label}`}
        className="absolute top-2 right-2 text-[#f2f2f2]/30 transition-colors hover:text-[#f2f2f2]/60"
      >
        <svg
          viewBox="0 0 24 24"
          className={cn("size-3", busy && "animate-spin")}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M21 12a9 9 0 1 1-3-6.7" strokeLinecap="round" />
          <path d="M21 3v5h-5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <span className="text-gold">{icon}</span>
      <p className="text-[8px] leading-tight tracking-[0.3px] whitespace-pre-line text-[#f2f2f2] uppercase">
        {label}
      </p>
      <div className="flex flex-col gap-0.5">
        <p className="text-xl font-light tracking-[-0.02em] text-[#f2f2f2]">{value}</p>
        <p className="text-[11px]" style={{ color }}>
          {status}
        </p>
      </div>
    </div>
  );
}

function BatteryRingBadge({ percent }: { percent: number }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex size-7 shrink-0 items-center justify-center">
      <svg viewBox="0 0 36 36" className="absolute inset-0 size-full -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="#f2f2f2" strokeOpacity="0.15" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke={SUCCESS}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${(c * percent) / 100} ${c}`}
        />
      </svg>
      <Watch className="size-3" style={{ color: SUCCESS }} />
    </div>
  );
}

export function StressAgeCard({ className }: { className?: string }) {
  const uid = useId();
  const id = (name: string) => `${name}-${uid}`;

  const [chronological] = useState(40);
  const [nervous, setNervous] = useState(35);
  const [gaugeBusy, setGaugeBusy] = useState(false);

  const [recovery, setRecovery] = useState(74);
  const [recoveryBusy, setRecoveryBusy] = useState(false);

  const [cognitive, setCognitive] = useState(61);
  const [cognitiveBusy, setCognitiveBusy] = useState(false);

  const [emotional, setEmotional] = useState(51);
  const [emotionalBusy, setEmotionalBusy] = useState(false);

  const [caffeineCount, setCaffeineCount] = useState(0);

  function refresh(setBusy: (v: boolean) => void, apply: () => void) {
    setBusy(true);
    setTimeout(() => {
      apply();
      setBusy(false);
    }, 500);
  }

  const diff = chronological - nervous;
  // The arc shows the "years younger/older" DELTA, not the ratio of
  // nervous-system age to chronological age — it's a short highlight
  // segment starting at the badge, not most of the ring.
  const arcPercent = clamp((Math.abs(diff) / chronological) * 100, 5, 45);

  function logCaffeine() {
    setCaffeineCount((c) => c + 1);
    setCognitive((c) => clamp(c + Math.round(randomBetween(3, 8)), 0, 100));
    setRecovery((r) => clamp(r - Math.round(randomBetween(2, 6)), 0, 100));
  }

  return (
    <div className={cn("flex w-full max-w-xs flex-col gap-3", className)}>
      {/* Gauge card */}
      <div
        className="relative overflow-hidden rounded-t-2xl rounded-b-sm border border-bronze px-4 py-4"
        style={{ backgroundImage: "linear-gradient(180deg, #2c2820 0%, #04121f 100%)" }}
      >
        <p className="text-center text-[10px] tracking-[0.25em] text-gold-deep uppercase">
          Stress Age
        </p>

        <div className="relative mx-auto mt-2 flex aspect-square w-[46%] items-center justify-center">
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90">
            <defs>
              <linearGradient id={id("track")} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="var(--color-gold-deep)" />
                <stop offset="100%" stopColor="var(--color-bronze)" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="44" fill="none" stroke={`url(#${id("track")})`} strokeWidth="6" />
          </svg>

          {/* Soft glow layer — a wide, blurred duplicate of the arc
              sitting behind the crisp one. A CSS `blur()` on the whole
              layer gives an even, falling-off halo; the drop-shadow
              filter this replaced instead traces the stroke's exact
              silhouette, which reads as a hard-edged cutout right where
              the arc ends against the tan track. */}
          {/* Two-value dasharray (arc length, then the rest of the
              circumference as one long gap) rather than a single-value
              dasharray + offset trick — the offset trick's dash and
              gap are the same length as the full circumference, so at
              small percentages it was rendering as TWO separate
              visible segments (a wraparound artifact) instead of one
              clean arc starting at the badge. -scale-x-100 alongside
              -rotate-90 mirrors the whole circle so the single arc
              sweeps from the top badge toward the left, matching the
              reference, rather than the right. */}
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 size-full -rotate-90 -scale-x-100 blur-[6px]"
          >
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={SUCCESS}
              strokeWidth="10"
              strokeLinecap="round"
              strokeOpacity="0.55"
              strokeDasharray={`${(2 * Math.PI * 44 * arcPercent) / 100} ${2 * Math.PI * 44}`}
              style={{ transition: "stroke-dasharray 500ms ease" }}
            />
          </svg>

          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full -rotate-90 -scale-x-100">
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke={SUCCESS}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(2 * Math.PI * 44 * arcPercent) / 100} ${2 * Math.PI * 44}`}
              style={{ transition: "stroke-dasharray 500ms ease" }}
            />
          </svg>

          <div className="flex flex-col items-center">
            <p className="text-[10px] text-gold-soft">Feels Like</p>
            <p className="font-serif text-3xl font-light text-cream">{nervous}</p>
            <p className="text-[9px] tracking-[0.25em] text-gold-muted">YEARS</p>
          </div>

          <button
            type="button"
            aria-label="Re-simulate stress age"
            onClick={() =>
              refresh(setGaugeBusy, () => {
                setNervous(Math.round(randomBetween(28, 45)));
              })
            }
            className="absolute top-[6%] left-1/2 flex size-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
            style={{
              background: SUCCESS,
              boxShadow: `0 0 6px ${SUCCESS}66, 0 0 14px ${SUCCESS}33`,
            }}
          >
            <ArrowLeft className={cn("size-2.5 text-[#04121f]", gaugeBusy && "animate-spin")} />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1 text-[10px] text-[#909396]">
              <span className="size-2 rounded-full bg-gold-deep" />
              Chronological Age <span className="text-[#f2f2f2]">{chronological}</span>
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[#909396]">
              <span className="size-2 rounded-full" style={{ backgroundColor: SUCCESS }} />
              Nervous System <span className="text-[#f2f2f2]">{nervous}</span>
            </span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="flex flex-col items-center gap-1">
            <span
              className="flex size-6 items-center justify-center rounded-full"
              style={{ backgroundColor: `${SUCCESS}1a` }}
            >
              <CornerRightDown className="size-3.5" style={{ color: SUCCESS }} />
            </span>
            <span className="text-[10px] whitespace-nowrap" style={{ color: SUCCESS }}>
              {diff >= 0 ? `${diff} years younger` : `${Math.abs(diff)} years older`}
            </span>
          </div>
        </div>
      </div>

      {/* Metric tiles */}
      <div className="flex gap-2">
        <MetricTile
          icon={<Heart className="size-3.5" />}
          label="Recovery Capacity"
          value={recovery}
          status={recovery >= 65 ? "Strained" : recovery >= 35 ? "Balanced" : "Depleted"}
          color={recovery >= 65 || recovery < 35 ? DANGER : SUCCESS}
          onRefresh={() =>
            refresh(setRecoveryBusy, () => setRecovery(Math.round(randomBetween(35, 90))))
          }
          busy={recoveryBusy}
          corner="left"
        />
        <MetricTile
          icon={<Zap className="size-3.5" />}
          label={"Cognitive\nLoad"}
          value={cognitive}
          status={cognitive >= 70 ? "High" : cognitive >= 40 ? "Moderate" : "Low"}
          color={cognitive >= 70 ? DANGER : INFO}
          onRefresh={() =>
            refresh(setCognitiveBusy, () => setCognitive(Math.round(randomBetween(30, 85))))
          }
          busy={cognitiveBusy}
          corner="none"
        />
        <MetricTile
          icon={<Eye className="size-3.5" />}
          label="Emotional Regulation"
          value={emotional}
          status={emotional >= 40 ? "Primed" : "Reactive"}
          color={emotional >= 40 ? SUCCESS : DANGER}
          onRefresh={() =>
            refresh(setEmotionalBusy, () => setEmotional(Math.round(randomBetween(35, 90))))
          }
          busy={emotionalBusy}
          corner="right"
        />
      </div>

      {/* Caffeine / Band row */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={logCaffeine}
          className="flex flex-1 items-center justify-between rounded-xl border border-gold-deep bg-navy p-2.5 text-left transition-colors hover:bg-navy/80"
        >
          <span className="flex items-center gap-2">
            <Coffee className="size-4 text-gold" />
            <span className="flex flex-col">
              <span className="text-xs font-light text-gold-deep">Caffeine</span>
              <span className="text-[9px] tracking-[0.2px] text-[#5e6165] uppercase">
                {caffeineCount === 0 ? "Log use" : `${caffeineCount} logged today`}
              </span>
            </span>
          </span>
          <ChevronRight className="size-4 text-[#5e6165]" />
        </button>

        <div className="flex flex-1 items-center justify-between rounded-xl border border-gold-deep bg-navy p-2.5">
          <span className="flex items-center gap-2">
            <BatteryRingBadge percent={78} />
            <span className="flex flex-col">
              <span className="text-xs font-light text-gold-deep">Band</span>
              <span className="text-[9px] tracking-[0.2px] text-[#5e6165] uppercase">78%</span>
            </span>
          </span>
          <ChevronRight className="size-4 text-[#5e6165]" />
        </div>
      </div>
    </div>
  );
}
