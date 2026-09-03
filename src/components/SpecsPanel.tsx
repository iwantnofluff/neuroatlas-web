"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
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

// Values are all placeholders pending the real spec doc — this exists to
// give the section its real shape now (a scroll-spy index reading against
// massive detail cards) rather than a row of five identical "To be
// confirmed" cards, and to already be in the right shape to fill in real
// values later with no restructuring. Replaces the earlier click-through
// tab version: same placeholder data, new interaction model.
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

/**
 * One massive detail card in the right column. Owns its own `useInView`
 * with a zero-height detection band pinned to the exact vertical center of
 * the viewport (`-50%` margin from both top and bottom) — so "active"
 * means this card is currently crossing the center of the screen, not
 * merely that some part of it is on screen. Only ever reports UP via
 * `onActive`; it never reads or renders its own active state, so there's
 * nothing here that flips prop shape across renders (the confirmed
 * Reveal.tsx failure mode) — just a plain boolean effect.
 */
function SpecDetailCard({
  spec,
  index,
  isActive,
  onActive,
}: {
  spec: Spec;
  index: number;
  isActive: boolean;
  onActive: (index: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-50% 0px -50% 0px" });

  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  const Icon = spec.icon;

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl border bg-white/5 p-12 backdrop-blur-xl transition-colors duration-500",
        isActive ? "border-gold/30" : "border-white/10"
      )}
    >
      <Icon className="size-8 text-gold" aria-hidden="true" />
      <h3 className="mt-6 text-sm font-medium tracking-[0.2em] text-gold uppercase">
        {spec.label}
      </h3>
      <p className="mt-3 text-2xl text-cream lg:text-3xl">{spec.value}</p>
      <p className="mt-4 max-w-md text-base text-cream/60">{spec.detail}</p>
    </div>
  );
}

export function SpecsPanel() {
  const [active, setActive] = useState(0);
  const reduceMotion = useSafeReducedMotion();

  return (
    <div className="mt-14 grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8">
      {/* Left column — the index. Sticky on md+ so it stays put while the
         right column's cards scroll past it; a plain horizontal strip on
         mobile, where there's no room for a two-column layout. Purely a
         read-out of scroll position, not a set of controls — no click
         handlers, so no button/tab semantics; `aria-current` marks the
         one that matches where the reader actually is. */}
      <div className="md:col-span-3">
        <ul
          aria-label="Technical specifications"
          className="flex gap-5 overflow-x-auto pb-2 md:sticky md:top-32 md:flex-col md:gap-5 md:overflow-visible md:pb-0"
        >
          {specs.map((spec, i) => {
            const isActive = i === active;
            return (
              <li key={spec.label} className="shrink-0">
                <motion.span
                  aria-current={isActive ? "true" : undefined}
                  animate={{
                    color: isActive
                      ? "var(--color-gold)"
                      : "color-mix(in oklab, var(--color-cream) 40%, transparent)",
                    scale: isActive ? 1.08 : 1,
                  }}
                  transition={{
                    duration: reduceMotion ? 0 : 0.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="block origin-left text-sm font-medium tracking-wide"
                >
                  {spec.label}
                </motion.span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right column — the detail. A plain vertical stack, no pinned
         track of its own; scrolls at normal speed while the left index
         above tracks which card is passing the center of the screen. */}
      <div className="flex flex-col gap-8 md:col-span-9">
        {specs.map((spec, i) => (
          <SpecDetailCard
            key={spec.label}
            spec={spec}
            index={i}
            isActive={i === active}
            onActive={setActive}
          />
        ))}
      </div>
    </div>
  );
}
