"use client";

import { useSyncExternalStore } from "react";

/** `useSyncExternalStore`, not a resize-listener `useState`/`useEffect`
 *  pair — this is the actual "external store" (the media query's own
 *  matched state), so subscribing to its native `change` event is both
 *  simpler and genuinely reactive to resize/orientation changes, unlike
 *  a one-time mount check. `getServerSnapshot` returns `false`, matching
 *  the same SSR-safe convention `useSafeReducedMotion` uses — the first
 *  client render always matches the server's HTML (no viewport info
 *  exists yet), then this updates to the real value as soon as
 *  `matchMedia` can be read, without a hydration-mismatch warning. */
function subscribe(query: string) {
  return (callback: () => void) => {
    const mql = window.matchMedia(query);
    mql.addEventListener("change", callback);
    return () => mql.removeEventListener("change", callback);
  };
}

function getSnapshot(query: string) {
  return () => window.matchMedia(query).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * True below the given max-width breakpoint in px (default 767, Tailwind's
 * `md`) — for the handful of spots on the site where a responsive value
 * can't be expressed as a plain CSS class, most notably a Three.js
 * scene's own scale/position props (BuiltToReadYouSection's <Band>),
 * which Tailwind's responsive variants have no reach into at all, or a
 * framer-motion animation TARGET that needs to differ by breakpoint (a
 * CSS class can't touch an inline animated value either).
 *
 * The optional `maxWidthPx` param (added alongside FannedMethodCards,
 * which needs Tailwind's `sm` cutoff — 639, one below the 640px `sm:`
 * breakpoint — not the default `md` one every existing caller already
 * relies on) keeps every existing `useIsMobile()` call site's behavior
 * byte-for-byte unchanged; only a caller that explicitly passes a
 * different value gets a different breakpoint.
 */
export function useIsMobile(maxWidthPx = 767) {
  const query = `(max-width: ${maxWidthPx}px)`;
  return useSyncExternalStore(subscribe(query), getSnapshot(query), getServerSnapshot);
}
