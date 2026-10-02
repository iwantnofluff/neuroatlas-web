"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { cn } from "@/lib/utils";

const WIDTH = 760;
const HEIGHT = 160;
const POINTS = 96;
const INHALE_S = 4;
const EXHALE_S = 4;

type Phase = "scattered" | "inhale" | "exhale" | "composed";

const PROMPT: Record<Phase, string> = {
  scattered: "Your signal looks a little scattered. Tap the button and take one slow breath.",
  inhale: "Breathe in…",
  exhale: "And slowly out…",
  composed: "Composed. Now let’s get you back on track.",
};

/** Deterministic pseudo-noise so the jitter is stable between renders. */
function jitter(i: number, t: number) {
  return (
    Math.sin(i * 1.7 + t * 6.1) * 0.5 +
    Math.sin(i * 4.3 - t * 9.7) * 0.3 +
    Math.sin(i * 11.9 + t * 13.3) * 0.2
  );
}

/**
 * The 404 page's breathing reset: a stressed, jittery signal line that
 * calms into a slow wave over one guided breath. A single tap (or click,
 * or Enter/Space) starts it: a 4-second inhale while the ring expands,
 * then a 4-second exhale while it settles, then the way home is
 * highlighted. Tap-to-start rather than press-and-hold, because holding
 * on a touch screen fights scrolling and the long-press menu. Under
 * reduced motion the line is drawn still and the tap completes at once.
 */
export function NotFoundBreath({ onComposed }: { onComposed?: () => void }) {
  const reduceMotion = useSafeReducedMotion();
  const [phase, setPhase] = useState<Phase>("scattered");
  const calm = useMotionValue(0);
  const time = useMotionValue(0);
  const glow = useTransform(calm, [0, 1], [0.15, 0.55]);
  const path = useTransform([calm, time], ([c, t]: number[]) => {
    let d = "";
    for (let i = 0; i <= POINTS; i++) {
      const x = (i / POINTS) * WIDTH;
      const stressed = jitter(i, t) * 46 * (1 - c);
      const spike = i % 17 === 8 ? -38 * (1 - c) * Math.max(0, Math.sin(t * 3 + i)) : 0;
      const wave = Math.sin((i / POINTS) * Math.PI * 4 - t * 1.4) * 22 * c;
      d += `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${(HEIGHT / 2 + stressed + spike + wave).toFixed(1)}`;
    }
    return d;
  });
  const phaseRef = useRef<Phase>("scattered");
  const breath = useRef<ReturnType<typeof animate> | null>(null);
  const exhaleRing = useMotionValue(0);
  const ringScale = useTransform([calm, exhaleRing], ([c, e]: number[]) => 0.85 + 0.3 * Math.min(c / 0.75, 1) - 0.18 * e);

  useAnimationFrame((elapsed) => {
    if (!reduceMotion) time.set(elapsed / 1000);
  });

  useEffect(() => {
    phaseRef.current = phase;
    if (phase === "composed") onComposed?.();
  }, [phase, onComposed]);

  useEffect(() => () => breath.current?.stop(), []);

  function beginBreath() {
    if (phaseRef.current !== "scattered") return;
    if (reduceMotion) {
      calm.set(1);
      setPhase("composed");
      return;
    }
    setPhase("inhale");
    breath.current = animate(calm, 0.75, {
      duration: INHALE_S,
      ease: "easeInOut",
      onComplete: () => {
        setPhase("exhale");
        animate(exhaleRing, 1, { duration: EXHALE_S, ease: "easeInOut" });
        breath.current = animate(calm, 1, {
          duration: EXHALE_S,
          ease: "easeInOut",
          onComplete: () => setPhase("composed"),
        });
      },
    });
  }

  const composed = phase === "composed";

  return (
    <div className="mt-10 flex flex-col items-center">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-24 w-full max-w-2xl overflow-visible sm:h-32"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="nf-signal" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="var(--color-gold)" stopOpacity="0" />
            <stop offset="18%" stopColor="var(--color-gold)" />
            <stop offset="82%" stopColor="var(--color-gold-soft)" />
            <stop offset="100%" stopColor="var(--color-gold-soft)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path d={path} fill="none" stroke="url(#nf-signal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <p aria-live="polite" className="mt-6 min-h-[3.5rem] max-w-md text-pretty text-lg text-cream/75">
        {PROMPT[phase]}
      </p>

      <div className="relative mt-6 flex size-36 items-center justify-center">
        <motion.span
          aria-hidden="true"
          style={{ scale: ringScale, opacity: glow }}
          className="absolute inset-0 rounded-full bg-gold/30 blur-xl"
        />
        <motion.span
          aria-hidden="true"
          style={{ scale: ringScale }}
          className="absolute inset-3 rounded-full border border-gold/40"
        />
        <button
          type="button"
          disabled={phase !== "scattered"}
          onClick={beginBreath}
          className={cn(
            "relative size-24 rounded-full border px-2 text-xs tracking-[0.15em] uppercase transition-colors duration-500 select-none disabled:cursor-default",
            composed
              ? "border-gold bg-gold/20 text-gold-soft"
              : "border-gold/50 bg-navy/80 text-cream [@media(hover:hover)]:hover:border-gold"
          )}
        >
          {phase === "scattered" ? "Begin a breath" : phase === "composed" ? "Composed" : phase === "inhale" ? "In" : "Out"}
        </button>
      </div>
    </div>
  );
}
