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
type Spec = {
  label: string;
  icon: LucideIcon;
  value: string;
  detail: string;
  rotation: { x: number; y: number };
  posClassName: string;
};

const specs: Spec[] = [
  {
    label: "Sensors",
    icon: Activity,
    value: "To be confirmed",
    detail: "The onboard sensor suite that reads the raw physiological signal.",
    rotation: { x: 0.25, y: Math.PI },
    posClassName: "left-4 top-[22%] sm:left-8 lg:left-16",
  },
  {
    label: "Battery",
    icon: BatteryCharging,
    value: "To be confirmed",
    detail: "Rated runtime per charge, plus typical charging time.",
    rotation: { x: 1.3, y: 0.1 },
    posClassName: "left-4 top-1/2 -translate-y-1/2 sm:left-8 lg:left-16",
  },
  {
    label: "Connectivity",
    icon: Bluetooth,
    value: "To be confirmed",
    detail: "How the band stays paired to the app, and how far it reaches.",
    rotation: { x: 0.3, y: -0.9 },
    posClassName: "left-4 top-[78%] sm:left-8 lg:left-16",
  },
  {
    label: "Dimensions",
    icon: Ruler,
    value: "To be confirmed",
    detail: "Weight, module size, and strap sizing range.",
    rotation: { x: 0.15, y: Math.PI / 2 },
    posClassName: "right-4 top-[36%] sm:right-8 lg:right-16",
  },
  {
    label: "Compatibility",
    icon: Smartphone,
    value: "To be confirmed",
    detail: "Supported phones and operating system versions.",
    rotation: { x: 0.3, y: 0 },
    posClassName: "right-4 top-[64%] sm:right-8 lg:right-16",
  },
];

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
         rather than tracing its literal silhouette. Click sets `active`
         directly; framer-motion's own hover gesture ignores touch, so
         there's no separate mobile-vs-desktop interaction to build —
         tap already reaches onClick everywhere. */}
      {specs.map((spec, i) => {
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
            className={cn(
              "absolute z-10 flex flex-col items-center gap-2",
              spec.posClassName
            )}
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
              className="w-20 text-center text-[10px] font-medium tracking-[0.15em] uppercase sm:text-xs"
            >
              {spec.label}
            </motion.span>
          </motion.button>
        );
      })}

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
