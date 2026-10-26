"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

/** True only after the client has taken over from the server-rendered HTML
 *  — the canonical `useSyncExternalStore` pattern for this, rather than a
 *  `useState` + `useEffect(() => setMounted(true))` pair (which the React
 *  Compiler's `react-hooks/set-state-in-effect` rule now flags). */
function useMounted() {
  return useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
}

/**
 * `useReducedMotion()` returns `null` on the server (no `matchMedia`) but
 * can resolve synchronously on the client's very first render when the OS
 * preference is set — that mismatch between "null" (server) and "true"
 * (client) produces a real hydration-diff warning for any component whose
 * rendered output branches on it directly (discovered via Playwright's
 * `reducedMotion: "reduce"` context emulation while building the hero).
 *
 * This always reports `false` until after mount, then reports the real
 * value — guaranteeing the first client render matches the server's HTML
 * exactly, at the cost of one frame of motion-enabled output for
 * reduced-motion users before it corrects. That's the standard workaround
 * for this specific framer-motion SSR quirk.
 */
export function useSafeReducedMotion() {
  const reduceMotion = useReducedMotion();
  const mounted = useMounted();
  return mounted ? Boolean(reduceMotion) || isSearchCrawler() : false;
}

const SEARCH_CRAWLER =
  /Googlebot|Google-InspectionTool|Storebot-Google|AdsBot-Google|bingbot|DuckDuckBot|Applebot|YandexBot|Baiduspider|facebookexternalhit|LinkedInBot|Twitterbot|GPTBot|ClaudeBot|PerplexityBot/i;

/**
 * Search engines render pages in one very tall viewport without scrolling,
 * and most sections here are sized in svh, so they grow with that viewport
 * and push content out of view. Scroll and in-view animations would then
 * leave that text at opacity 0 for the crawler. Crawlers get the same
 * static, fully visible end state reduced-motion visitors get: identical
 * content, just without the motion. Lighthouse is deliberately not listed,
 * so performance runs still measure the real visitor experience.
 */
function isSearchCrawler() {
  return typeof navigator !== "undefined" && SEARCH_CRAWLER.test(navigator.userAgent);
}
