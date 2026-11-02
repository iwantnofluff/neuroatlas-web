"use client";

import { useEffect } from "react";
import { hasAnalyticsConsent } from "@/lib/consent";

export type ConversionEvent = "waitlist_signup" | "enterprise_enquiry" | "contact_enquiry" | "newsletter_signup";

const ENQUIRY_EVENTS: ConversionEvent[] = ["waitlist_signup", "enterprise_enquiry", "contact_enquiry"];
const JOURNAL_VISIT_KEY = "na-journal-visit";

let visitedJournal = false;

function journalVisitedThisSession() {
  if (visitedJournal) return true;
  try {
    return sessionStorage.getItem(JOURNAL_VISIT_KEY) === "1";
  } catch {
    return false;
  }
}

/** Remembers, for this tab's session only, that the visitor read the journal,
 *  so a later enquiry can be counted as blog-to-enquiry. Kept in memory until
 *  analytics consent is given, and only then written to sessionStorage. */
export function useJournalVisitTracking(pathname: string) {
  useEffect(() => {
    if (!pathname.startsWith("/journal")) return;
    visitedJournal = true;
    if (!hasAnalyticsConsent()) return;
    try {
      sessionStorage.setItem(JOURNAL_VISIT_KEY, "1");
    } catch {}
  }, [pathname]);
}

/**
 * Sends a conversion to Google Tag Manager, where a GA4 event tag forwards it
 * and GA4 marks it as a key event. `window.dataLayer` only exists once the
 * visitor has opted in and the container has loaded (see ConsentTags), so
 * nothing is recorded without consent or off the live site.
 */
export function trackConversion(event: ConversionEvent, formLocation: string) {
  if (!window.dataLayer) return;
  window.dataLayer.push({ event, form_location: formLocation });
  if (ENQUIRY_EVENTS.includes(event) && journalVisitedThisSession()) {
    window.dataLayer.push({ event: "blog_to_enquiry", form_location: formLocation });
  }
}
