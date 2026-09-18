"use client";

import { useState, type FormEvent } from "react";
import { Reveal } from "@/components/Reveal";
import { ShimmerButton } from "@/components/ui/shimmer-button";

export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Reveal y={12} className="mt-6 text-pretty text-base text-gold-soft">
        You&rsquo;re on the list. We&rsquo;ll be in touch.
      </Reveal>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md gap-2">
      <label htmlFor="journal-email" className="sr-only">
        Email address
      </label>
      <input
        id="journal-email"
        type="email"
        required
        placeholder="Your email"
        className="w-full rounded-full border border-cream/20 bg-white/5 px-5 py-3 text-base text-cream placeholder:text-cream/40 outline-none backdrop-blur-md transition-colors focus:border-gold"
      />
      <ShimmerButton
        type="submit"
        background="color-mix(in oklab, var(--color-gold) 35%, transparent)"
        shimmerColor="var(--color-gold-soft)"
        className="shrink-0 py-3 text-sm tracking-wide text-cream"
      >
        Subscribe
      </ShimmerButton>
    </form>
  );
}
