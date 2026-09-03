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
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

// Values are all placeholders pending the real spec doc — this exists to
// give the section its real shape now (an editorial hover showcase)
// rather than a row of five identical "To be confirmed" entries, and to
// already be in the right shape to fill in real values later with no
// restructuring. Fourth layout for this section this session: click-
// through tabs, then a tall scroll-spy stack, then a bento grid (both
// scrapped per direct feedback — the stack was too long to scroll
// through, the grid didn't feel editorial enough) — now a fixed-height
// index/display split, contained to a normal section, no extra page
// length either way.
type Spec = { label: string; icon: LucideIcon; value: string; detail: string };

const specs: Spec[] = [
  {
    label: "Sensors",
    icon: Activity,
    value: "To be confirmed",
    detail: "The onboard sensor suite that reads the raw physiological signal.",
  },
  {
    label: "Battery",
    icon: BatteryCharging,
    value: "To be confirmed",
    detail: "Rated runtime per charge, plus typical charging time.",
  },
  {
    label: "Connectivity",
    icon: Bluetooth,
    value: "To be confirmed",
    detail: "How the band stays paired to the app, and how far it reaches.",
  },
  {
    label: "Dimensions",
    icon: Ruler,
    value: "To be confirmed",
    detail: "Weight, module size, and strap sizing range.",
  },
  {
    label: "Compatibility",
    icon: Smartphone,
    value: "To be confirmed",
    detail: "Supported phones and operating system versions.",
  },
];

export function SpecsPanel() {
  // The one piece of state driving both columns: which category is
  // currently "showing" in the right-hand display. Hover sets it on
  // desktop; click/focus set it too, so touch and keyboard get the same
  // behavior hover gives a mouse — there's no separate "mobile mode",
  // just more ways to reach the same state.
  const [active, setActive] = useState(0);
  const reduceMotion = useSafeReducedMotion();
  const activeSpec = specs[active];
  const ActiveIcon = activeSpec.icon;

  return (
    <div className="mt-14 grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center md:gap-16">
      {/* Left column — the index. Large, elegant, muted by default; each
         entry animates its own color + x-offset in response to `active`,
         same object shape every render (only the target values differ),
         so there's nothing here that can get stuck mid-transition. */}
      <ul aria-label="Technical specifications" className="flex flex-col">
        {specs.map((spec, i) => {
          const isActive = i === active;
          return (
            <li key={spec.label} className="border-b border-white/10 last:border-b-0">
              <motion.button
                type="button"
                aria-current={isActive ? "true" : undefined}
                onHoverStart={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                animate={{
                  color: isActive
                    ? "var(--color-gold)"
                    : "color-mix(in oklab, var(--color-cream) 40%, transparent)",
                  x: isActive && !reduceMotion ? 16 : 0,
                }}
                transition={{
                  duration: reduceMotion ? 0 : 0.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="block w-full py-5 text-left font-serif text-3xl leading-tight lg:text-4xl"
              >
                {spec.label}
              </motion.button>
            </li>
          );
        })}
      </ul>

      {/* Right column — the display. A single glass panel, fixed size —
         it never grows or shrinks as the data swaps; the swapping pane
         is absolutely positioned inside it, so content length can never
         change the panel's box. */}
      <div className="relative h-[420px] overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-12 backdrop-blur-md">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeSpec.label}
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -16 }}
            transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 flex flex-col justify-center p-12"
          >
            <ActiveIcon className="size-10 text-gold" aria-hidden="true" />
            <h3 className="mt-6 text-sm font-medium tracking-[0.2em] text-gold uppercase">
              {activeSpec.label}
            </h3>
            <p className="mt-3 text-3xl text-cream lg:text-4xl">{activeSpec.value}</p>
            <p className="mt-4 max-w-sm text-base text-cream/60">{activeSpec.detail}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
