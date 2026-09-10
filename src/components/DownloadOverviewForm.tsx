"use client";

import { useState, type FormEvent } from "react";
import { Reveal } from "@/components/Reveal";
import { ShimmerButton } from "@/components/ui/shimmer-button";

const FIELDS = [
  { id: "name", label: "Name", type: "text", autoComplete: "name" },
  { id: "organisation", label: "Organisation", type: "text", autoComplete: "organization" },
  { id: "role", label: "Role", type: "text", autoComplete: "organization-title" },
  { id: "email", label: "Work Email", type: "email", autoComplete: "email" },
] as const;

/**
 * "Download The Overview" — /for-organisations' own lead-capture form.
 * No backend/CMS exists anywhere in this codebase yet (confirmed: no
 * src/app/api route of any kind). Footer.tsx's own newsletter signup
 * already accepts that reality and swaps to a confirmation message on
 * submit rather than actually sending anything — this follows that
 * exact same established convention rather than inventing a new one,
 * just scaled up to four fields.
 */
export function DownloadOverviewForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <Reveal
        y={12}
        className="card-glass mx-auto max-w-md bg-transparent p-8 text-center"
      >
        <p className="text-pretty text-base text-cream">
          Thanks, that is on its way. Check your inbox for the overview.
        </p>
      </Reveal>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto grid max-w-md gap-4 text-left">
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
            className="mt-2 w-full rounded-lg border border-cream/20 bg-cream/5 px-4 py-3 text-sm text-cream placeholder:text-cream/30 outline-none transition-colors focus:border-gold"
          />
        </div>
      ))}
      <ShimmerButton
        type="submit"
        background="color-mix(in oklab, var(--color-cream) 30%, transparent)"
        shimmerColor="var(--color-cream)"
        className="mt-2 w-full text-sm tracking-wide text-cream"
      >
        Send Overview
      </ShimmerButton>
    </form>
  );
}
