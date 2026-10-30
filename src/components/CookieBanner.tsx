"use client";

import { useId, useState, type CSSProperties } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { closeConsentSettings, saveConsent, useConsent, type ConsentChoice } from "@/lib/consent";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { legalNav } from "@/lib/nav";
import { cn } from "@/lib/utils";

const GLASS_ON_NAVY = "color-mix(in oklab, var(--color-cream) 30%, transparent)";

const CATEGORIES: { key: keyof ConsentChoice; label: string; description: string }[] = [
  { key: "analytics", label: "Analytics", description: "Google Analytics, to see which pages help people and which don't." },
  { key: "marketing", label: "Marketing", description: "Measures the campaigns that bring people to the site." },
];

function Toggle({ checked, onChange, labelledBy, describedBy }: { checked: boolean; onChange: (next: boolean) => void; labelledBy: string; describedBy: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      onClick={() => onChange(!checked)}
      className={cn(
        "tap-area relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        checked ? "border-gold bg-gold/80" : "border-cream/25 bg-cream/10"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute top-1/2 left-0.5 size-[18px] -translate-y-1/2 rounded-full bg-cream shadow transition-transform duration-300",
          checked && "translate-x-5"
        )}
      />
    </button>
  );
}

function ConsentPreferences({ initial, onSave }: { initial: ConsentChoice; onSave: (choice: ConsentChoice) => void }) {
  const [draft, setDraft] = useState(initial);
  const id = useId();
  return (
    <div className="mt-5 border-t border-cream/10 pt-5">
      <ul className="space-y-4">
        <li className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-cream">Strictly necessary</p>
            <p className="mt-0.5 text-pretty text-sm text-cream/60">Keeps the site working and remembers this choice. Always on.</p>
          </div>
        </li>
        {CATEGORIES.map((category) => (
          <li key={category.key} className="flex items-start justify-between gap-4">
            <div>
              <p id={`${id}-${category.key}`} className="text-sm font-medium text-cream">
                {category.label}
              </p>
              <p id={`${id}-${category.key}-desc`} className="mt-0.5 text-pretty text-sm text-cream/60">
                {category.description}
              </p>
            </div>
            <Toggle
              checked={draft[category.key]}
              onChange={(next) => setDraft((current) => ({ ...current, [category.key]: next }))}
              labelledBy={`${id}-${category.key}`}
              describedBy={`${id}-${category.key}-desc`}
            />
          </li>
        ))}
      </ul>
      <ShimmerButton background={GLASS_ON_NAVY} className="mt-5 w-full" onClick={() => onSave(draft)}>
        Save Choices
      </ShimmerButton>
    </div>
  );
}

/**
 * Asks for cookie consent on the first visit and again from the footer's
 * Cookie Settings link. Accept and Reject carry equal weight, as the UK
 * ICO expects, and nothing non-essential loads until a choice is saved
 * (see ConsentTags).
 */
export function CookieBanner() {
  const { choice, settingsOpen } = useConsent();
  const reduceMotion = useSafeReducedMotion();
  const [managing, setManaging] = useState(false);
  const headingId = useId();
  const privacyPolicy = legalNav[0];

  const open = !choice || settingsOpen;
  const showPreferences = managing || settingsOpen;

  const decide = (next: ConsentChoice) => {
    saveConsent(next);
    setManaging(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          role="dialog"
          aria-modal="false"
          aria-labelledby={headingId}
          initial={settingsOpen && !reduceMotion ? { opacity: 0, y: 24 } : false}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ "--hero-enter-delay": "0.8s", "--hero-enter-y": "24px" } as CSSProperties}
          className={cn(
            "cookie-banner fixed inset-x-4 bottom-4 z-[60] max-h-[calc(100svh-2rem)] overflow-y-auto rounded-2xl border border-cream/10 bg-navy/85 p-5 text-cream shadow-[0_24px_48px_-24px_rgba(4,18,31,0.8)] backdrop-blur-xl sm:inset-x-auto sm:left-6 sm:bottom-6 sm:max-w-md sm:p-6",
            !settingsOpen && "hero-enter"
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <h2 id={headingId} className="font-serif text-lg font-normal tracking-normal uppercase">
              Your data, your call
            </h2>
            {settingsOpen && choice && (
              <button
                type="button"
                onClick={closeConsentSettings}
                className="tap-area text-sm text-cream/60 transition-colors hover:text-cream"
              >
                Close
              </button>
            )}
          </div>
          <p className="mt-2 text-pretty text-base text-cream/75 md:text-sm">
            We&apos;d like to use cookies to understand how the site is used. Nothing beyond the essentials runs unless you
            say yes.{" "}
            <Link href={privacyPolicy.href} className="underline decoration-cream/35 underline-offset-4 hover:decoration-gold">
              {privacyPolicy.label}
            </Link>
          </p>

          {showPreferences ? (
            <ConsentPreferences initial={choice ?? { analytics: false, marketing: false }} onSave={decide} />
          ) : (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <ShimmerButton background={GLASS_ON_NAVY} className="flex-1" onClick={() => decide({ analytics: true, marketing: true })}>
                Accept All
              </ShimmerButton>
              <ShimmerButton background={GLASS_ON_NAVY} className="flex-1" onClick={() => decide({ analytics: false, marketing: false })}>
                Reject All
              </ShimmerButton>
              <button
                type="button"
                onClick={() => setManaging(true)}
                className="tap-area basis-full text-center text-sm text-cream/60 underline decoration-cream/30 underline-offset-4 transition-colors hover:text-cream"
              >
                Manage Choices
              </button>
            </div>
          )}
        </motion.section>
      )}
    </AnimatePresence>
  );
}
