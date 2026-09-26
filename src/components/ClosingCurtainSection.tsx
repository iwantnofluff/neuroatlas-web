"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CurtainReveal } from "@/components/CurtainReveal";
import { Reveal } from "@/components/Reveal";
import { DotGrid } from "@/components/ui/dot-grid";
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
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-[clamp(2.75rem,7vw,6rem)] leading-[0.95] text-navy">
              Another Device To Charge And Wear?
            </h2>
          </Reveal>
          {/* max-w-4xl, text-balance, no manual <br>s — this section's
             previous copy used 4 hand-measured line breaks (see this
             file's own git history), but those were tuned to that exact
             text's own line lengths; new copy of a different length
             makes them meaningless (either orphaned or overflowing).
             text-balance re-derives an even, editorial taper for
             whatever text is here automatically, without needing
             hand-measurement to be redone on every future copy change —
             confirmed live, no orphaned last line at this width. */}
          <motion.p
            style={{ y: subtextY }}
            className="mx-auto mt-8 max-w-4xl text-balance text-lg text-mist"
          >
            A wearable should earn its place on your wrist. NA.01 is
            designed to work quietly in the background, building a
            continuous picture of how your system changes. The value
            isn&rsquo;t in giving you more numbers to check: it&rsquo;s
            in giving NeuroAtlas the context to make those numbers more
            meaningful when you need them.
          </motion.p>
        </>
      }
      revealClassName="flex flex-col items-center justify-center bg-navy px-6 text-center text-cream"
      reveal={
        <>
          {/* DotGrid — same "this section acts weird" fix applied to
             /the-science's own equivalent CTA (see ScienceClosingSection.tsx's
             own doc comment for the full mechanics): this reveal pins at
             a full h-[100svh] via CurtainReveal's shared sticky child,
             but the heading/body/button only occupy a small centered
             band of it, and the radial glow below fades to fully
             transparent well before the box's own edges — leaving a
             large stretch of the scroll (both while pinned, and while
             this box slides off after release) reading as flat,
             unstyled black. A uniform dot texture across the whole box
             guarantees no stretch of it ever reads as empty. CSS-only
             DotGrid, not DotPattern's live motion-component cloud — see
             dot-grid.tsx's own doc comment for why. */}
          <DotGrid size={28} />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_50%_50%,color-mix(in_oklab,var(--color-gold)_20%,transparent),transparent_70%)]"
          />
          <div className="relative">
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-4xl leading-tight text-gold-soft lg:text-5xl">
              Join Our Pilot Project
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-balance text-cream/75">
              Be part of the NeuroAtlas pilot project and help us understand
              how the product works in real-world settings.
            </p>
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
