"use client";

import { motion, useScroll } from "framer-motion";

export function ReadingProgressBar() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gold"
      style={{ scaleX: scrollYProgress }}
    />
  );
}
