"use client";

import { useEffect, useState, type RefObject } from "react";

const FIRST_INTERACTION = ["scroll", "pointerdown", "touchstart", "keydown"] as const;

/**
 * True once the visitor first scrolls, taps or presses a key, or once the
 * element comes within `margin` of the viewport, whichever is first; then
 * stays true. Used to hold back heavy client-only code (the 3D engine) so
 * it isn't downloaded and run during the page's first load, while still
 * starting early enough to be ready before the section is reached.
 */
export function useNearViewport(ref: RefObject<Element | null>, margin = "1200px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const start = () => setNear(true);
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && start(), { rootMargin: `${margin} 0px` });
    observer.observe(el);
    FIRST_INTERACTION.forEach((type) => window.addEventListener(type, start, { once: true, passive: true }));
    return () => {
      observer.disconnect();
      FIRST_INTERACTION.forEach((type) => window.removeEventListener(type, start));
    };
  }, [ref, margin, near]);
  return near;
}
