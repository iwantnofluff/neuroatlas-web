"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BatteryCharging,
  Bluetooth,
  Ruler,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

// Values are all placeholders pending the real spec doc — this exists to
// give the section real interactivity now (click a spec, its detail
// animates in) rather than a row of five identical "To be confirmed"
// cards, and to already be in the right shape to fill in real values
// later with no restructuring.
const specs = [
  { label: "Sensors", icon: Activity, value: "To be confirmed" },
  { label: "Battery", icon: BatteryCharging, value: "To be confirmed" },
  { label: "Connectivity", icon: Bluetooth, value: "To be confirmed" },
  { label: "Dimensions", icon: Ruler, value: "To be confirmed" },
  { label: "Compatibility", icon: Smartphone, value: "To be confirmed" },
];

export function SpecsPanel() {
  const [active, setActive] = useState(0);
  const reduceMotion = useSafeReducedMotion();
  const ActiveIcon = specs[active].icon;

  return (
    <div className="mt-14 grid gap-3 md:grid-cols-[220px_1fr] md:gap-6">
      <div
        role="tablist"
        aria-label="Technical specifications"
        className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:gap-1.5 md:overflow-visible md:pb-0"
      >
        {specs.map((spec, i) => {
          const Icon = spec.icon;
          const isActive = i === active;
          return (
            <button
              key={spec.label}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActive(i)}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-3 text-left text-sm transition-colors",
                isActive
                  ? "bg-gold text-navy"
                  : "text-cream/70 hover:bg-cream/10"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {spec.label}
            </button>
          );
        })}
      </div>

      <div className="card-glass min-h-[200px] overflow-hidden px-8 py-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active}
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <ActiveIcon className="size-6 text-gold" aria-hidden="true" />
            <h3 className="mt-4 font-serif text-2xl text-cream">
              {specs[active].label}
            </h3>
            <p className="mt-2 text-base italic text-cream/70">
              {specs[active].value}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
