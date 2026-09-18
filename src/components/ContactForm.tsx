"use client";

import { useState, type FormEvent } from "react";
import { Reveal } from "@/components/Reveal";
import { ShimmerButton } from "@/components/ui/shimmer-button";

const FIELDS = [
  { id: "name", label: "Name", type: "text", autoComplete: "name" },
  { id: "email", label: "Email", type: "email", autoComplete: "email" },
] as const;

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Reveal y={12} className="card-glass mt-8 bg-transparent p-8 text-center">
        <p className="text-pretty text-base text-cream">
          Thank you. Your enquiry has been sent. We&rsquo;ll get back to
          you by email shortly.
        </p>
      </Reveal>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-4 text-left">
      {FIELDS.map((field) => (
        <div key={field.id}>
          <label
            htmlFor={field.id}
            className="text-xs tracking-[0.15em] text-cream/50 uppercase"
          >
            {field.label}
          </label>
          <input
            id={field.id}
            name={field.id}
            type={field.type}
            required
            autoComplete={field.autoComplete}
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-base text-cream placeholder:text-cream/30 outline-none backdrop-blur-md transition-colors focus:border-gold"
          />
        </div>
      ))}
      <div>
        <label
          htmlFor="message"
          className="text-xs tracking-[0.15em] text-cream/50 uppercase"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="mt-2 w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-base text-cream placeholder:text-cream/30 outline-none backdrop-blur-md transition-colors focus:border-gold"
        />
      </div>
      <ShimmerButton
        type="submit"
        background="color-mix(in oklab, var(--color-cream) 30%, transparent)"
        shimmerColor="var(--color-cream)"
        className="mt-2 w-full text-sm tracking-wide text-cream"
      >
        Send Message
      </ShimmerButton>
    </form>
  );
}
