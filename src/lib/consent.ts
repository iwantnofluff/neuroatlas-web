"use client";

import { useSyncExternalStore } from "react";

export type ConsentChoice = { analytics: boolean; marketing: boolean };
type StoredConsent = ConsentChoice & { savedAt: string; version: number };

const STORAGE_KEY = "na-consent";
const CONSENT_VERSION = 1;
/** UK ICO guidance: ask again rather than relying on an old answer forever. */
const CONSENT_LIFETIME_MS = 1000 * 60 * 60 * 24 * 180;

/** Runs in <head> before first paint: marks the page when a valid choice is
 *  already saved, which hides the server-rendered banner (see globals.css). */
export const SAVED_CONSENT_SCRIPT = `try{var c=JSON.parse(localStorage.getItem("${STORAGE_KEY}"));if(c&&c.version===${CONSENT_VERSION}&&Date.now()-Date.parse(c.savedAt)<=${CONSENT_LIFETIME_MS})document.documentElement.dataset.consent="saved"}catch(e){}`;

type ConsentState = { choice: ConsentChoice | null; settingsOpen: boolean };

const listeners = new Set<() => void>();
const serverState: ConsentState = { choice: null, settingsOpen: false };
let state: ConsentState | undefined;

function readStoredChoice(): ConsentChoice | null {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as StoredConsent | null;
    if (!stored || stored.version !== CONSENT_VERSION) return null;
    if (Date.now() - Date.parse(stored.savedAt) > CONSENT_LIFETIME_MS) return null;
    return { analytics: stored.analytics, marketing: stored.marketing };
  } catch {
    return null;
  }
}

function getState() {
  state ??= { choice: readStoredChoice(), settingsOpen: false };
  return state;
}

function setState(next: Partial<ConsentState>) {
  state = { ...getState(), ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Google Analytics cookies set before consent was withdrawn. */
function clearAnalyticsCookies() {
  const host = location.hostname.replace(/^www\./, "");
  for (const name of document.cookie.split(";").map((c) => c.split("=")[0].trim())) {
    if (!/^_ga|^_gid$|^_gat/.test(name)) continue;
    for (const domain of [host, `.${host}`, ""]) {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ""}`;
    }
  }
}

export function saveConsent(choice: ConsentChoice) {
  const previous = getState().choice;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...choice, savedAt: new Date().toISOString(), version: CONSENT_VERSION }));
  } catch {}
  if (previous?.analytics && !choice.analytics) clearAnalyticsCookies();
  setState({ choice, settingsOpen: false });
}

export function hasAnalyticsConsent() {
  return getState().choice?.analytics ?? false;
}

export function openConsentSettings() {
  delete document.documentElement.dataset.consent;
  setState({ settingsOpen: true });
}

export function closeConsentSettings() {
  setState({ settingsOpen: false });
}

/** The visitor's saved choice (null until they make one) and whether the
 *  settings panel has been reopened. Always the empty state on the server
 *  and the first client render, so the banner never causes a hydration
 *  mismatch. */
export function useConsent() {
  return useSyncExternalStore(subscribe, getState, () => serverState);
}
