"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(max-width: 767px)";

/** `useSyncExternalStore`, not a resize-listener `useState`/`useEffect`
 *  pair — this is the actual "external store" (the media query's own
 *  matched state), so subscribing to its native `change` event is both
 *  simpler and genuinely reactive to resize/orientation changes, unlike
 *  a one-time mount check. `getServerSnapshot` returns `false`, matching
 *  the same SSR-safe convention `useSafeReducedMotion` uses — the first
 *  client render always matches the server's HTML (no viewport info
 *  exists yet), then this updates to the real value as soon as
 *  `matchMedia` can be read, without a hydration-mismatch warning. */
function subscribe(callback: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * True below the 768px breakpoint (Tailwind's `md`) — for the handful of
 * spots on the site where a responsive value can't be expressed as a
 * plain CSS class, most notably a Three.js scene's own scale/position
 * props (BuiltToReadYouSection's <Band>), which Tailwind's responsive
 * variants have no reach into at all.
 */
export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
