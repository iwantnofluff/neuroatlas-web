"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

export function ArticleHeroImage({ src, alt }: { src: string; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useSafeReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], reduceMotion ? [1, 1] : [1.1, 1]);
  const y = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-30, 30]);

  return (
    <div
      ref={ref}
      className="relative aspect-video overflow-hidden rounded-2xl border border-navy/10 bg-navy/5"
    >
      <motion.div style={{ scale, y }} className="absolute inset-0">
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="(min-width: 672px) 672px, 100vw"
          className="object-cover"
        />
      </motion.div>
    </div>
  );
}
