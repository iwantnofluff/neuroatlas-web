"use client";

import { useRef, useState, type FormEvent } from "react";
import { Reveal } from "@/components/Reveal";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";

export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);

    const data = Object.fromEntries(new FormData(event.currentTarget));

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (response.ok) setSubmitted(true);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
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
        name="email"
        type="email"
        required
        placeholder="Your email"
        className="w-full rounded-full border border-cream/20 bg-white/5 px-5 py-3 text-base text-cream placeholder:text-cream/40 outline-none backdrop-blur-md transition-colors focus:border-gold"
      />
      <ShimmerButton
        type="submit"
        disabled={isSubmitting}
        background="color-mix(in oklab, var(--color-gold) 35%, transparent)"
        shimmerColor="var(--color-gold-soft)"
        className={cn(
          "shrink-0 py-3 text-sm tracking-wide text-cream",
          isSubmitting && "cursor-not-allowed opacity-60"
        )}
      >
        {isSubmitting ? "Sending..." : "Subscribe"}
      </ShimmerButton>
    </form>
  );
}
