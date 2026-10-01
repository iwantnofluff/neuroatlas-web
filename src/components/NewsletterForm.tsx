"use client";

import { Reveal } from "@/components/Reveal";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";
import { useFormSubmit } from "@/lib/useFormSubmit";
import { FormHoneypot, FORM_ERROR_MESSAGE } from "@/components/FormHoneypot";

export function NewsletterForm() {
  const { status, submitting, onSubmit } = useFormSubmit("/api/newsletter", { source: "journal" });

  if (status === "done") {
    return (
      <Reveal y={12} className="mt-6 text-pretty text-base text-gold-soft">
        You&rsquo;re on the list. We&rsquo;ll be in touch.
      </Reveal>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative mx-auto mt-8 max-w-md">
      <div className="flex gap-2">
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
        disabled={submitting}
        background="color-mix(in oklab, var(--color-gold) 35%, transparent)"
        shimmerColor="var(--color-gold-soft)"
        className={cn(
          "shrink-0 py-3 text-sm tracking-wide text-cream",
          submitting && "cursor-not-allowed opacity-60"
        )}
      >
        {submitting ? "Sending..." : "Subscribe"}
      </ShimmerButton>
      </div>
      <FormHoneypot id="journal-company-website" />
      {status === "error" && (
        <p role="alert" className="mt-3 text-pretty text-sm text-[#f0a0ae]">
          {FORM_ERROR_MESSAGE}
        </p>
      )}
    </form>
  );
}
