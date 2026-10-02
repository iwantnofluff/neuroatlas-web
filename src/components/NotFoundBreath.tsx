"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { cn } from "@/lib/utils";

const WIDTH = 760;
const HEIGHT = 160;
const POINTS = 96;
const INHALE_MS = 4000;

type Phase = "scattered" | "inhale" | "exhale" | "composed";

const PROMPT: Record<Phase, string> = {
  scattered: "Your signal looks a little scattered. Hold the button and breathe in.",
  inhale: "Breathe in…",
  exhale: "And out.",
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
 * calms into a slow wave while the visitor holds "Hold to breathe" for
 * one 4-second inhale. Letting go early lets it drift back; a full
 * inhale settles it and highlights the way home. Works with pointer,
 * touch and keyboard (Space or Enter held). Under reduced motion the line
 * is drawn still and a single press completes the breath.
 */
export function NotFoundBreath({ onComposed }: { onComposed?: () => void }) {
  const reduceMotion = useSafeReducedMotion();
  const [phase, setPhase] = useState<Phase>("scattered");
  const calm = useMotionValue(0);
  const time = useMotionValue(0);
  const ring = useTransform(calm, [0, 1], [0.85, 1.15]);
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
  const holdAnimation = useRef<ReturnType<typeof animate> | null>(null);
  const phaseRef = useRef<Phase>("scattered");

  useAnimationFrame((elapsed) => {
    if (!reduceMotion) time.set(elapsed / 1000);
  });

  useEffect(() => {
    phaseRef.current = phase;
    if (phase === "composed") onComposed?.();
  }, [phase, onComposed]);

  function startBreath() {
    if (phaseRef.current === "composed") return;
    if (reduceMotion) {
      calm.set(1);
      setPhase("composed");
      return;
    }
    setPhase("inhale");
    holdAnimation.current?.stop();
    holdAnimation.current = animate(calm, 1, {
      duration: (INHALE_MS / 1000) * (1 - calm.get()),
      ease: "easeInOut",
      onComplete: () => {
        setPhase("exhale");
        window.setTimeout(() => setPhase("composed"), 1200);
      },
    });
  }

  function endBreath() {
    if (phaseRef.current !== "inhale") return;
    holdAnimation.current?.stop();
    setPhase("scattered");
    holdAnimation.current = animate(calm, 0, { duration: 1.2, ease: "easeOut" });
  }

  const composed = phase === "composed" || phase === "exhale";

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
          style={{ scale: ring, opacity: glow }}
          className="absolute inset-0 rounded-full bg-gold/30 blur-xl"
        />
        <motion.span
          aria-hidden="true"
          style={{ scale: ring }}
          className="absolute inset-3 rounded-full border border-gold/40"
        />
        <button
          type="button"
          disabled={phase === "composed"}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            startBreath();
          }}
          onPointerUp={endBreath}
          onPointerCancel={endBreath}
          onKeyDown={(e) => {
            if ((e.key === " " || e.key === "Enter") && !e.repeat) {
              e.preventDefault();
              startBreath();
            }
          }}
          onKeyUp={(e) => {
            if (e.key === " " || e.key === "Enter") endBreath();
          }}
          onContextMenu={(e) => e.preventDefault()}
          className={cn(
            "relative size-24 touch-none rounded-full border text-xs tracking-[0.15em] uppercase transition-colors duration-500 select-none",
            composed
              ? "border-gold bg-gold/20 text-gold-soft"
              : "border-gold/50 bg-navy/80 text-cream [@media(hover:hover)]:hover:border-gold"
          )}
        >
          {composed ? "Composed" : "Hold to breathe"}
        </button>
      </div>
    </div>
  );
}
