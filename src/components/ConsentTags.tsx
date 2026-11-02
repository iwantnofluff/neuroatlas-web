"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useJournalVisitTracking } from "@/lib/analytics";
import { useConsent, type ConsentChoice } from "@/lib/consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/** Google's tag only reads commands pushed as an `arguments` object, not
 *  as a plain array, so this mirrors the official snippet exactly. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function gtag(..._args: unknown[]) {
  window.dataLayer = window.dataLayer ?? [];
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer.push(arguments);
}

function consentSignals({ analytics, marketing }: ConsentChoice) {
  const value = (granted: boolean) => (granted ? "granted" : "denied");
  return {
    analytics_storage: value(analytics),
    ad_storage: value(marketing),
    ad_user_data: value(marketing),
    ad_personalization: value(marketing),
  };
}

function loadTagManager(containerId: string) {
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
  document.head.appendChild(script);
}

/**
 * Loads Google Tag Manager only once the visitor has opted in to analytics
 * or marketing, so no tag in the container (GA4 or any future pixel) can
 * run before consent. Google consent mode signals are set before the
 * container loads and updated whenever the choice changes. The `update`
 * sits alongside the `default` because consent updates outrank defaults,
 * so a default set later inside the container cannot override the choice.
 */
export function ConsentTags({ containerId, enabled }: { containerId: string; enabled: boolean }) {
  const { choice } = useConsent();
  const loaded = useRef(false);
  useJournalVisitTracking(usePathname());

  useEffect(() => {
    if (!enabled || !choice) return;
    const signals = consentSignals(choice);
    if (loaded.current) {
      gtag("consent", "update", signals);
      return;
    }
    if (!choice.analytics && !choice.marketing) return;
    gtag("consent", "default", signals);
    gtag("consent", "update", signals);
    loadTagManager(containerId);
    loaded.current = true;
  }, [choice, containerId, enabled]);

  return null;
}
