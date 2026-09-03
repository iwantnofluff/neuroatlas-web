"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/**
 * Wraps a focal visual panel in a small scroll-linked vertical drift —
 * tracks its own scroll progress through the viewport (not page scroll), so
 * it works anywhere on the page without a shared scrollYProgress. Kept
 * subtle and applied only to a few focal panels (see page.tsx) rather than
 * everywhere, per the "minimal, calming" brand guardrail.
 */
export function Parallax({
  children,
  offset = 32,
  className,
}: {
  children: ReactNode;
  offset?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useSafeReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  return (
    <motion.div ref={ref} style={{ y: reduceMotion ? 0 : y }} className={className}>
      {children}
    </motion.div>
  );
}
