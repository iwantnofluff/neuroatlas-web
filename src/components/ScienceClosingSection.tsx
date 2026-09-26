"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { CurtainReveal } from "@/components/CurtainReveal";
import { EditorialIndexSection } from "@/components/EditorialIndexSection";
import { DotGrid } from "@/components/ui/dot-grid";
import { ShimmerLink } from "@/components/ui/shimmer-button";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/**
 * /the-science's sections 4 + 5 — "The Editorial Index" (the off-white
 * research-card section) acting as the curtain, lifting away on scroll
 * to reveal "The Finale" closing CTA pinned behind it. Same
 * CurtainReveal mechanics as /band's closing pair (see that component
 * and ClosingCurtainSection.tsx) — reused rather than re-derived, per
 * the brief's own explicit "reuse the exact CSS stacking context from
 * /the-band".
 */
export function ScienceClosingSection() {
  const reduceMotion = useSafeReducedMotion();
  const curtainRef = useRef<HTMLDivElement>(null);

  return (
    <CurtainReveal
      curtainRef={curtainRef}
      curtain={<EditorialIndexSection />}
      revealClassName="flex flex-col items-center justify-center bg-navy px-6 text-center text-cream"
      reveal={
        <>
          {/* DotGrid, not just a bigger glow — a direct "this section
             acts weird" fix: this reveal pins at a full h-[100svh]
             (CurtainReveal.tsx's own shared sticky child, not something
             this section controls), but the heading + button it holds
             only occupy a small centered band of that height. The
             55%-radius glow below fades to fully transparent well
             before the box's own top/bottom edges, so as the box
             scrolls (both while pinned-at-top, showing its own lower
             half, and while sliding off after release), a large
             stretch read as flat, unstyled black — confirmed live via
             screenshot, right where "Composure Isn't A Personality"
             scrolls past and before the References list begins. A
             uniform dot texture across the WHOLE box guarantees no
             stretch of it ever reads as truly empty. DotGrid, not
             DotPattern (dot-pattern.tsx) — see that CSS-only
             component's own doc comment for why: DotPattern's
             1000+-live-motion-component approach was a confirmed,
             persistent source of render overhead in exactly this spot. */}
          <DotGrid size={28} />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_50%_50%,color-mix(in_oklab,var(--color-gold)_20%,transparent),transparent_70%)]"
          />
          <div className="relative">
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-4xl leading-tight text-gold-soft lg:text-5xl">
              Composure Isn&rsquo;t A Personality. It&rsquo;s Trained.
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
