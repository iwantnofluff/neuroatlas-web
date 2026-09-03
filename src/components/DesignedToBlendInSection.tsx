"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/**
 * "Designed To Blend In" — the image starts as a thin, rounded
 * horizontal slit and expands outward across this section's own
 * h-[300vh] pinned track until it swallows the entire screen, acting as
 * a full-bleed cinematic billboard behind the headline (which stays
 * static and in front the whole time, z-10 above the image).
 *
 * clip-path is built as a SINGLE function-transformer useTransform that
 * returns the COMPLETE template string directly (inset(...% ...% ...%
 * ...% round ...px)), computed from plain lerp() math over four inset
 * values and a radius — rather than handing framer-motion two literal
 * clip-path strings and relying on its own generic string-interpolation
 * to mix between them. That generic path isn't a reliable fit for a
 * value packing several differently-unit-ed numbers (percentages AND a
 * trailing round-radius in px) into one template, so this sidesteps it
 * entirely: one MotionValue<string>, computed by us, every frame — the
 * same "compute the real value ourselves" defensiveness this codebase
 * already applies to its numeric scroll-linked transforms.
 *
 * reduceMotion resolves straight to the fully-expanded end state (a
 * full-bleed photo is a complete, meaningful composition on its own;
 * freezing on the thin starting slit would just look like a broken,
 * unfinished layout) rather than the array-range form or a prop-shape
 * swap — the two confirmed failure modes elsewhere in this codebase.
 */
const START_INSET = { top: 40, right: 10, bottom: 40, left: 10, radius: 24 };
const END_INSET = { top: 0, right: 0, bottom: 0, left: 0, radius: 0 };

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function DesignedToBlendInSection() {
  const reduceMotion = useSafeReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const clipPath = useTransform(scrollYProgress, (p) => {
    const t = reduceMotion ? 1 : Math.min(1, Math.max(0, p));
    const top = lerp(START_INSET.top, END_INSET.top, t);
    const right = lerp(START_INSET.right, END_INSET.right, t);
    const bottom = lerp(START_INSET.bottom, END_INSET.bottom, t);
    const left = lerp(START_INSET.left, END_INSET.left, t);
    const radius = lerp(START_INSET.radius, END_INSET.radius, t);
    return `inset(${top}% ${right}% ${bottom}% ${left}% round ${radius}px)`;
  });

  return (
    <div ref={wrapperRef} className={cn(!reduceMotion && "h-[300vh]")}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-navy">
        <motion.div aria-hidden="true" style={{ clipPath }} className="absolute inset-0">
          <Image
            src="/photos/band-bw-wrist.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          {/* Scrim — always present, not scroll-linked, since the
             headline in front needs to stay legible from the very first
             (thin-slit) frame through the final full-bleed one. */}
          <div className="absolute inset-0 bg-navy/50" />
        </motion.div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <h2 className="font-serif text-3xl leading-tight text-cream lg:text-4xl">
            Designed To Blend In
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-cream/75">
            Lightweight, screenless, and made to disappear into your day.
            Charges quickly, when it needs it.
          </p>
        </div>
      </div>
    </div>
  );
}
