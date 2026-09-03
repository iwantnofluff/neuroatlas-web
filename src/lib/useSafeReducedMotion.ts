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
  return mounted ? Boolean(reduceMotion) : false;
}
