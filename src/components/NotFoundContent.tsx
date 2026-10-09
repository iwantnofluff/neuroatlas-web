"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { NotFoundBreath } from "@/components/NotFoundBreath";
import { ShimmerLink } from "@/components/ui/shimmer-button";

export function NotFoundContent() {
  const [composed, setComposed] = useState(false);
  return (
    <div className="mx-auto w-full max-w-3xl text-center">
      <p className="font-serif text-7xl leading-none font-normal text-gold/80 tabular-nums sm:text-8xl">404</p>
      <h1 className="mt-8 text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
        Page Not Found
      </h1>
      <p className="mx-auto mt-6 max-w-md text-pretty text-lg text-cream/75">
        The page you&rsquo;re looking for doesn&rsquo;t exist or has moved.
      </p>

      <NotFoundBreath onComposed={() => setComposed(true)} />

      <motion.div
        animate={{ scale: composed ? 1.04 : 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="mt-10 flex flex-wrap justify-center gap-4"
      >
        <ShimmerLink
          href="/"
          background="color-mix(in oklab, var(--color-cream) 30%, transparent)"
          shimmerColor="var(--color-cream)"
          className="px-6 py-3 text-sm tracking-wide text-cream"
        >
          Back To Home
        </ShimmerLink>
        <ShimmerLink
          href="/waitlist"
          background="color-mix(in oklab, var(--color-cream) 30%, transparent)"
          shimmerColor="var(--color-cream)"
          className="px-6 py-3 text-sm tracking-wide text-cream"
        >
          Join The Waitlist
        </ShimmerLink>
      </motion.div>
    </div>
  );
}
