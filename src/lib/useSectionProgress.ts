"use client";

import { useEffect, type RefObject } from "react";
import { useMotionValue, useScroll, useTransform } from "framer-motion";
import { useIsMobile } from "@/lib/useIsMobile";

type ScrollOffset = NonNullable<Parameters<typeof useScroll>[0]>["offset"];

/**
 * Scroll progress for a pinned (sticky, tall-track) section that pins on
 * desktop and scrolls normally on phones and tablets. Pinning on a phone
 * left long stretches of near-static screen, then the next section
 * sliding up over it, and the scroll-linked work made pages lag. Below md
 * the section is a normal one-screen block (callers drop the tall track
 * and the sticky with `md:` classes) and its reveal plays over the scroll
 * that brings it in: section top from 85% of the screen (0) to 10% (1).
 */
export function useSectionProgress(target: RefObject<HTMLElement | null>, pinnedOffset: ScrollOffset) {
  const isMobile = useIsMobile();
  const { scrollYProgress: pinned } = useScroll({ target, offset: pinnedOffset });
  const { scrollYProgress: inFlow } = useScroll({ target, offset: ["start 0.85", "start 0.1"] });
  const mode = useMotionValue(0);
  useEffect(() => mode.set(isMobile ? 1 : 0), [isMobile, mode]);
  const progress = useTransform([pinned, inFlow, mode], ([p, f, m]: number[]) => (m ? f : p));
  return { progress, isMobile };
}
