"use client";

import { useRef, useState, type FormEvent } from "react";
import { Reveal } from "@/components/Reveal";
import Link from "next/link";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";

const FIELDS = [
  { id: "name", label: "Name", type: "text", autoComplete: "name", required: true },
  { id: "email", label: "Email", type: "email", autoComplete: "email", required: true },
  { id: "role", label: "Role", type: "text", autoComplete: "organization-title", required: false },
  { id: "organisation", label: "Organisation", type: "text", autoComplete: "organization", required: false },
  { id: "sector", label: "Sector", type: "text", autoComplete: "off", required: false },
] as const;

const FIELD_CLASS =
  "mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-base text-cream placeholder:text-cream/30 outline-none backdrop-blur-md transition-colors focus:border-gold";
const LABEL_CLASS = "text-xs tracking-[0.15em] text-cream/60 uppercase";

/**
 * The /waitlist form. Posts to /api/waitlist, which adds the visitor to
 * Klaviyo (see lib/klaviyo.ts). On success the form is replaced by the
 * confirmation state; on failure the visitor's entries stay in place
 * with an inline error, so nothing they typed is lost.
 */
export function WaitlistApplicationForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const submittingRef = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingRef.current) return;
    submittingRef.current = true;
    setStatus("submitting");
    const data = { ...Object.fromEntries(new FormData(event.currentTarget)), source: "waitlist-page" };
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setStatus(response.ok ? "done" : "error");
    } catch {
      setStatus("error");
    } finally {
      submittingRef.current = false;
    }
  }

  if (status === "done") {
    return (
      <Reveal y={12} className="card-glass bg-transparent p-8 text-center lg:p-10">
        <div role="status">
        <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-2xl leading-tight text-cream lg:text-3xl">
          You&rsquo;re On The List
        </h2>
        <p className="mx-auto mt-4 max-w-md text-pretty text-base text-cream/75">
          Thanks for joining the NeuroAtlas waitlist. We&rsquo;ll be in touch by email when there&rsquo;s an update
          on availability.
        </p>
        <p className="mt-6 text-pretty text-base text-cream/75">
          <Link
            href="/journal"
            className="text-gold-soft underline decoration-gold-soft/40 underline-offset-4 transition-colors hover:decoration-gold-soft"
          >
            Explore The Journal
          </Link>{" "}
          while you wait.
        </p>
        </div>
      </Reveal>
    );
  }

  const submitting = status === "submitting";

  return (
    <div className="card-glass bg-transparent p-6 sm:p-8 lg:p-10">
      <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-2xl leading-tight text-cream lg:text-3xl">
        Join The Waitlist
      </h2>
      <p className="mt-4 text-pretty text-base text-cream/75">
        Fill in your details below and we&rsquo;ll keep you updated on NeuroAtlas.
      </p>
    <form onSubmit={handleSubmit} className="relative mt-8 grid gap-4 text-left">
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.id} className={cn(field.id === "sector" && "sm:col-span-2")}>
            <label htmlFor={`waitlist-${field.id}`} className={LABEL_CLASS}>
              {field.label}
            </label>
            <input
              id={`waitlist-${field.id}`}
              name={field.id}
              type={field.type}
              required={field.required}
              autoComplete={field.autoComplete}
              className={FIELD_CLASS}
            />
          </div>
        ))}
      </div>
      <div>
        <label htmlFor="waitlist-reason" className={LABEL_CLASS}>
          Reason for interest
        </label>
        <textarea id="waitlist-reason" name="reason" rows={4} className={cn(FIELD_CLASS, "resize-none")} />
      </div>
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="waitlist-company-website">Company website</label>
        <input id="waitlist-company-website" name="company_website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {status === "error" && (
        <p role="alert" className="text-pretty text-sm text-[#f0a0ae]">
          Something went wrong and your details were not sent. Please try again.
        </p>
      )}
      <ShimmerButton
        type="submit"
        disabled={submitting}
        background="color-mix(in oklab, var(--color-gold) 35%, transparent)"
        shimmerColor="var(--color-gold-soft)"
        className={cn("mt-2 w-full text-sm tracking-wide text-cream", submitting && "cursor-not-allowed opacity-60")}
      >
        {submitting ? "Joining..." : "Join The Waitlist"}
      </ShimmerButton>
    </form>
    </div>
  );
}
