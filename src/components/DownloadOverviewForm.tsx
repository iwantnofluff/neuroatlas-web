"use client";

import { Reveal } from "@/components/Reveal";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { FormHoneypot, FORM_ERROR_MESSAGE } from "@/components/FormHoneypot";
import { useFormSubmit } from "@/lib/useFormSubmit";
import { cn } from "@/lib/utils";

const FIELDS = [
  { id: "name", label: "Name", type: "text", autoComplete: "name" },
  { id: "organisation", label: "Organisation", type: "text", autoComplete: "organization" },
  { id: "role", label: "Role", type: "text", autoComplete: "organization-title" },
  { id: "email", label: "Work Email", type: "email", autoComplete: "email" },
] as const;

/**
 * "Download The Overview": /for-organisations' lead-capture form. Posts to
 * /api/overview, which records a "Requested Organisation Overview" event in
 * Klaviyo; a Klaviyo flow on that event emails the overview document.
 */
export function DownloadOverviewForm() {
  const { status, submitting, onSubmit } = useFormSubmit("/api/overview");

  if (status === "done") {
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
    <form onSubmit={onSubmit} className="mx-auto grid max-w-md gap-4 text-left">
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
      <FormHoneypot id="overview-company-website" />
      {status === "error" && (
        <p role="alert" className="text-pretty text-sm text-[#f0a0ae]">
          {FORM_ERROR_MESSAGE}
        </p>
      )}
      <ShimmerButton
        type="submit"
        disabled={submitting}
        background="color-mix(in oklab, var(--color-cream) 30%, transparent)"
        shimmerColor="var(--color-cream)"
        className={cn("mt-2 w-full text-sm tracking-wide text-cream", submitting && "cursor-not-allowed opacity-60")}
      >
        {submitting ? "Sending..." : "Send Overview"}
      </ShimmerButton>
    </form>
  );
}
