"use client";

import { Reveal } from "@/components/Reveal";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";
import { useFormSubmit } from "@/lib/useFormSubmit";
import { FormHoneypot, FORM_ERROR_MESSAGE } from "@/components/FormHoneypot";

export function WaitlistForm() {
  const { status, submitting, onSubmit } = useFormSubmit("/api/waitlist", { source: "pricing" });

  if (status === "done") {
    return (
      <Reveal y={12} className="mt-8 text-pretty text-base text-gold-soft">
        You&rsquo;re on the pilot waitlist. We&rsquo;ll reach out by email
        with next steps.
      </Reveal>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative mt-8">
      <div className="flex flex-col gap-3 sm:flex-row">
      <label htmlFor="pilot-waitlist-email" className="sr-only">
        Email address
      </label>
      <input
        id="pilot-waitlist-email"
        name="email"
        type="email"
        required
        placeholder="Your email"
        className="w-full rounded-full border border-cream/20 bg-white/5 px-5 py-3 text-base text-cream placeholder:text-cream/40 outline-none backdrop-blur-md transition-colors focus:border-gold"
      />
      <ShimmerButton
        type="submit"
        disabled={submitting}
        background="color-mix(in oklab, var(--color-gold) 35%, transparent)"
        shimmerColor="var(--color-gold-soft)"
        className={cn(
          "shrink-0 py-3 text-sm tracking-wide text-cream",
          submitting && "cursor-not-allowed opacity-60"
        )}
      >
        {submitting ? "Securing Place..." : "Join Waitlist"}
      </ShimmerButton>
      </div>
      <FormHoneypot id="pricing-company-website" />
      {status === "error" && (
        <p role="alert" className="mt-3 text-pretty text-sm text-[#f0a0ae]">
          {FORM_ERROR_MESSAGE}
        </p>
      )}
    </form>
  );
}
