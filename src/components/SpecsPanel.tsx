"use client";

import { useState, type MouseEvent } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
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
// give the section its real shape now (a compact bento grid) rather than
// a row of five identical "To be confirmed" cards, and to already be in
// the right shape to fill in real values later with no restructuring.
// Third layout for this section this session: started as click-through
// tabs, became a tall scroll-spy stack (too long/tedious to navigate per
// direct user feedback), now a single-viewport bento grid — no sticky
// container, no tall track, just one glance.
type Spec = { label: string; icon: LucideIcon; value: string; detail: string };

const specs: Spec[] = [
  {
    label: "Sensors",
    icon: Activity,
    value: "To be confirmed",
    detail: "The onboard sensor suite that reads the raw physiological signal.",
  },
  { label: "Battery", icon: BatteryCharging, value: "To be confirmed", detail: "" },
  { label: "Connectivity", icon: Bluetooth, value: "To be confirmed", detail: "" },
  { label: "Dimensions", icon: Ruler, value: "To be confirmed", detail: "" },
  { label: "Compatibility", icon: Smartphone, value: "To be confirmed", detail: "" },
];

/**
 * One bento tile. The hover treatment is entirely transform/opacity based
 * — `whileHover={{ scale }}` and a glow layer's opacity — so nothing here
 * ever changes a tile's box size or the grid's row heights; no layout
 * shift is possible by construction, not just by convention.
 *
 * The glow is a separate absolutely-positioned layer tracking the cursor
 * via two `useMotionValue`s fed straight into a `useMotionTemplate`
 * radial-gradient — updated directly on `style` (no easing lag, so it
 * genuinely follows the pointer) while its opacity fades in/out through
 * `animate`, which layers cleanly on top of a raw `style` binding.
 *
 * reduceMotion skips both the scale-on-hover and the glow entirely (a
 * gradient chasing the pointer is exactly the kind of motion that
 * preference exists to suppress) — baked into the same `whileHover`
 * object shape (scale 1 vs 1.02) rather than removing the prop, and the
 * glow layer itself just doesn't mount, which is safe here since it's
 * purely decorative and carries no layout of its own.
 */
function SpecTile({
  spec,
  featured = false,
  className,
}: {
  spec: Spec;
  featured?: boolean;
  className?: string;
}) {
  const reduceMotion = useSafeReducedMotion();
  const [hovered, setHovered] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowBackground = useMotionTemplate`radial-gradient(${featured ? 360 : 240}px circle at ${mouseX}px ${mouseY}px, color-mix(in oklab, var(--color-gold) 18%, transparent), transparent 70%)`;

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    mouseX.set(event.clientX - rect.left);
    mouseY.set(event.clientY - rect.top);
  }

  const Icon = spec.icon;

  return (
    <motion.div
      role="listitem"
      onMouseMove={reduceMotion ? undefined : handleMouseMove}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      whileHover={{ scale: reduceMotion ? 1 : 1.02 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-md",
        className
      )}
    >
      {!reduceMotion && (
        <motion.div
          aria-hidden="true"
          style={{ background: glowBackground }}
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute inset-0"
        />
      )}

      <div className="relative">
        <Icon
          className={cn("text-gold", featured ? "size-10" : "size-7")}
          aria-hidden="true"
        />
        <h3
          className={cn(
            "mt-6 font-medium tracking-[0.2em] text-gold uppercase",
            featured ? "text-sm" : "text-xs"
          )}
        >
          {spec.label}
        </h3>
        <p
          className={cn(
            "mt-3 text-cream",
            featured ? "text-3xl lg:text-4xl" : "text-xl"
          )}
        >
          {spec.value}
        </p>
        {featured && spec.detail && (
          <p className="mt-4 max-w-sm text-base text-cream/60">{spec.detail}</p>
        )}
      </div>
    </motion.div>
  );
}

export function SpecsPanel() {
  const [sensors, battery, connectivity, dimensions, compatibility] = specs;

  return (
    <div
      role="list"
      aria-label="Technical specifications"
      className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-4 md:grid-rows-2 md:h-[560px]"
    >
      <SpecTile spec={sensors} featured className="md:col-span-2 md:row-span-2" />
      <SpecTile spec={battery} />
      <SpecTile spec={connectivity} />
      <SpecTile spec={dimensions} />
      <SpecTile spec={compatibility} />
    </div>
  );
}
