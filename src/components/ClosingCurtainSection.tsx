"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CurtainReveal } from "@/components/CurtainReveal";
import { Reveal } from "@/components/Reveal";
import { ShimmerLink } from "@/components/ui/shimmer-button";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/**
 * /band's closing two sections, replacing two standard centered-text
 * blocks with a cinematic "curtain reveal" — see CurtainReveal.tsx for
 * the actual stacking mechanics (now shared with /the-science's own
 * closing section rather than duplicated).
 *
 * This file owns only the content and the one piece of behavior that's
 * genuinely specific to it: the curtain's subtext gets a subtle
 * upward-drift parallax tied to its own local scroll progress. That
 * needs the exact same DOM node CurtainReveal measures for its height
 * calculation, which is why the ref is created HERE and handed to
 * CurtainReveal rather than the other way around (see that
 * component's own doc comment).
 */
export function ClosingCurtainSection() {
  const reduceMotion = useSafeReducedMotion();
  const curtainRef = useRef<HTMLDivElement>(null);

  // Local scroll progress across the curtain's own time in the viewport
  // (NOT a pinned/scroll-jacked track — this is a plain in-flow
  // section), driving a subtle upward drift on the subtext only.
  // Function-transformer form of useTransform, this codebase's
  // standing defensive convention.
  const { scrollYProgress } = useScroll({
    target: curtainRef,
    offset: ["start end", "end start"],
  });
  const subtextY = useTransform(scrollYProgress, (p) => (reduceMotion ? 0 : 60 - p * 120));

  return (
    <CurtainReveal
      curtainRef={curtainRef}
      curtainClassName="flex min-h-[100svh] flex-col items-center justify-center bg-cream px-6 text-center"
      curtain={
        <>
          <Reveal y={20} className="mx-auto max-w-4xl">
            <h2 className="font-serif text-[clamp(2.75rem,7vw,6rem)] leading-[0.95] tracking-tight text-navy">
              Another Device To Charge And Wear?
            </h2>
          </Reveal>
          <motion.p
            style={{ y: subtextY }}
            className="mx-auto mt-8 max-w-xl text-lg text-mist"
          >
            This isn&rsquo;t about tracking steps or workouts. It&rsquo;s about
            catching the moments pressure builds quietly, in a meeting,
            before a call, mid-afternoon, before they show up in a decision
            you regret.
          </motion.p>
        </>
      }
      revealClassName="flex flex-col items-center justify-center bg-navy px-6 text-center text-cream"
      reveal={
        <>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_50%_50%,color-mix(in_oklab,var(--color-gold)_20%,transparent),transparent_70%)]"
          />
          <div className="relative">
            <h2 className="font-serif text-4xl leading-tight text-gold-soft lg:text-5xl">
              Join The London Pilot Program
            </h2>
            <motion.div
              whileHover={{ scale: reduceMotion ? 1 : 1.05 }}
              whileTap={{ scale: reduceMotion ? 1 : 0.97 }}
              transition={{ duration: 0.2 }}
              className="mt-10 inline-block"
            >
              <ShimmerLink
                href="/request-access"
                background="color-mix(in oklab, var(--color-gold) 35%, transparent)"
                shimmerColor="var(--color-gold-soft)"
                className="px-8 py-4 text-sm tracking-wide text-cream"
              >
                Request Access
              </ShimmerLink>
            </motion.div>
          </div>
        </>
      }
    />
  );
}
