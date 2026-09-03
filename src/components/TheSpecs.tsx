"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BatteryCharging,
  Bluetooth,
  Ruler,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { useIsMobile } from "@/lib/useIsMobile";
import { Reveal } from "@/components/Reveal";
import { TheSpecsSceneClient } from "@/components/TheSpecsSceneClient";

// Values are all placeholders pending the real spec doc — this exists to
// give the section its real shape now (the Interactive X-Ray) rather than
// a row of five identical "To be confirmed" entries, and to already be in
// the right shape to fill in real values later with no restructuring.
// Fifth layout for this section this session: click-through tabs, a tall
// scroll-spy stack, a bento grid, an editorial hover showcase (all
// scrapped per direct feedback), now a 3D reticle showcase — the model
// itself physically turns to face whichever category is selected.
//
// `rotation` is a best-effort, stylized mapping, not a literal feature
// callout — this model (see Band.tsx) has no separate geometry for
// charging contacts or a sensor window, so "Battery"/"Sensors" pick the
// angle that would show that area on a real band (underside, back face)
// rather than pointing at any actual mesh.
//
// Each side's reticles live in a shared "rail": one wrapper per side,
// absolutely positioned with BOTH `top` and `bottom` set (not a fixed
// height) so its own height always exactly fills the gap between two
// guaranteed-safe insets — clear of the heading above and the data
// panel below, regardless of the section's actual rendered height —
// then `flex flex-col justify-between` spreads that side's own
// reticles evenly within it. This replaced two earlier, more fragile
// attempts, both caught live (not hypothetical) with a screenshot at
// 425×748 (a short viewport — DevTools responsive mode, but the same
// height class as plenty of real phones/small tablets):
//  1. Every reticle at `top-[N%]` of the section's own height. On a
//     short viewport, the two lowest (`78%`/`64%`) landed inside the
//     bottom-anchored data panel's own footprint — confirmed both
//     visually (the panel painted over the reticle/label) and
//     functionally (Playwright's click timed out — "subtree
//     intercepts pointer events", the panel was on top eating it).
//  2. Anchoring just those two lower reticles to a fixed distance from
//     the bottom edge fixed THAT collision, but on an even shorter
//     viewport they instead climbed high enough to collide with the
//     OTHER reticle on their own side (Battery, Dimensions) — the same
//     underlying problem (independently-anchored siblings with no
//     shared awareness of each other) one step removed.
// A flex rail can't have this class of bug at all: its children are
// laid out relative to EACH OTHER and the rail's own (always-safe)
// box, not computed independently against the section's raw height.
type Side = "left" | "right";
type Spec = {
  label: string;
  icon: LucideIcon;
  value: string;
  detail: string;
  rotation: { x: number; y: number };
  side: Side;
};

const specs: Spec[] = [
  {
    label: "Sensors",
    icon: Activity,
    value: "To be confirmed",
    detail: "The onboard sensor suite that reads the raw physiological signal.",
    rotation: { x: 0.25, y: Math.PI },
    side: "left",
  },
  {
    label: "Battery",
    icon: BatteryCharging,
    value: "To be confirmed",
    detail: "Rated runtime per charge, plus typical charging time.",
    rotation: { x: 1.3, y: 0.1 },
    side: "left",
  },
  {
    label: "Connectivity",
    icon: Bluetooth,
    value: "To be confirmed",
    detail: "How the band stays paired to the app, and how far it reaches.",
    rotation: { x: 0.3, y: -0.9 },
    side: "left",
  },
  {
    label: "Dimensions",
    icon: Ruler,
    value: "To be confirmed",
    detail: "Weight, module size, and strap sizing range.",
    rotation: { x: 0.15, y: Math.PI / 2 },
    side: "right",
  },
  {
    label: "Compatibility",
    icon: Smartphone,
    value: "To be confirmed",
    detail: "Supported phones and operating system versions.",
    rotation: { x: 0.3, y: 0 },
    side: "right",
  },
];

const RAIL_SIDE_CLASSNAMES: Record<Side, string> = {
  left: "left-4 sm:left-8 lg:left-16",
  right: "right-4 sm:right-8 lg:right-16",
};

export function TheSpecs() {
  const [active, setActive] = useState(0);
  const reduceMotion = useSafeReducedMotion();
  const isMobile = useIsMobile();
  const activeSpec = specs[active];
  const ActiveIcon = activeSpec.icon;

  return (
    <section className="relative min-h-screen overflow-hidden bg-navy text-cream">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_50%_45%,color-mix(in_oklab,var(--color-gold)_14%,transparent),transparent_70%)]"
      />

      <Reveal
        y={20}
        className="relative z-10 mx-auto max-w-2xl px-6 pt-20 text-center lg:pt-28"
      >
        <h2 className="font-serif text-3xl leading-tight lg:text-4xl">The Specs</h2>
        <p className="mx-auto mt-4 max-w-md text-lg text-cream/70">
          The detail for those who want it.
        </p>
      </Reveal>

      {/* The 3D core — dead center, first in the absolutely-positioned
         layer so the reticles/panel below simply paint on top with no
         z-index arithmetic needed against it specifically (only against
         each other, where it matters — both are z-10). */}
      <div className="absolute inset-0">
        <TheSpecsSceneClient
          reduceMotion={reduceMotion}
          isMobile={isMobile}
          targetRotation={activeSpec.rotation}
        />
      </div>

      {/* The reticles — flanking left/right, loosely ringing the model
         rather than tracing its literal silhouette. One rail per side
         (see the doc comment above for why this is a rail rather than
         each reticle positioned independently) — `top`+`bottom` (no
         explicit height) makes each rail's box always exactly fill the
         safe gap between the heading and the data panel, and
         `justify-between` spreads that side's reticles evenly inside
         it. Click sets `active` directly; framer-motion's own hover
         gesture ignores touch, so there's no separate mobile-vs-
         desktop interaction to build — tap already reaches onClick
         everywhere. */}
      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          className={cn(
            "absolute top-[200px] bottom-[330px] z-10 flex flex-col items-center justify-between",
            RAIL_SIDE_CLASSNAMES[side]
          )}
        >
          {specs.map((spec, i) => {
            if (spec.side !== side) return null;
            const isActive = i === active;
            return (
              <motion.button
                key={spec.label}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActive(i)}
                whileHover={{ scale: reduceMotion ? 1 : 1.08 }}
                whileTap={{ scale: reduceMotion ? 1 : 0.94 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-2"
              >
                <motion.span
                  animate={{
                    borderColor: isActive
                      ? "var(--color-gold)"
                      : "color-mix(in oklab, var(--color-cream) 20%, transparent)",
                  }}
                  transition={{ duration: reduceMotion ? 0 : 0.3 }}
                  className="flex size-14 items-center justify-center rounded-full border bg-white/5 backdrop-blur-sm"
                >
                  <motion.span
                    animate={{ scale: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.25 }}
                    className="size-2 rounded-full bg-gold"
                  />
                </motion.span>
                <motion.span
                  animate={{
                    color: isActive
                      ? "var(--color-gold)"
                      : "color-mix(in oklab, var(--color-cream) 40%, transparent)",
                  }}
                  transition={{ duration: reduceMotion ? 0 : 0.3 }}
                  // Narrow + allowed to wrap mid-word (`w-16
                  // break-words`) below `sm` only: at that width the
                  // rail sits just 16px from the viewport edge
                  // (`left-4`/`right-4`), and a longer single-word
                  // label like "COMPATIBILITY" at its natural width
                  // visibly clipped off the edge of the screen —
                  // confirmed live via screenshot. `sm:` and up gets
                  // its usual single-line width back: the rail has
                  // already moved out to `sm:left-8`/`right-8` (and
                  // `lg:left-16`/`right-16`) by then, with real margin
                  // to spare.
                  className="w-16 max-w-16 text-center text-[10px] font-medium tracking-[0.15em] break-words uppercase sm:w-24 sm:max-w-none sm:text-xs sm:whitespace-nowrap"
                >
                  {spec.label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      ))}

      {/* The data panel — bottom-anchored and fixed in place (per spec:
         "either to the side of the screen or right next to the active
         reticle"), rather than chasing whichever reticle is active, so
         it never has to dodge either flanking column. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex justify-center px-6 sm:bottom-12">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeSpec.label}
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -24 }}
            transition={{
              duration: reduceMotion ? 0 : 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="pointer-events-auto w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-md"
          >
            <ActiveIcon className="mx-auto size-8 text-gold" aria-hidden="true" />
            <h3 className="mt-4 text-sm font-medium tracking-[0.2em] text-gold uppercase">
              {activeSpec.label}
            </h3>
            <p className="mt-2 text-2xl text-cream">{activeSpec.value}</p>
            <p className="mt-3 text-sm text-cream/60">{activeSpec.detail}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
