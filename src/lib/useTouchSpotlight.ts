"use client";

import { useEffect, useRef, type RefObject } from "react";
import { animate, type MotionValue } from "framer-motion";

/**
 * Touch-screen version of a cursor-following spotlight. There is no
 * pointer to follow on a phone or tablet, so while the element is on
 * screen the spotlight drifts slowly across it on its own, and a tap
 * moves it to the tapped spot before the drift resumes. Does nothing on
 * devices with a mouse, or under reduced motion.
 */
export function useTouchSpotlight(
  ref: RefObject<HTMLElement | null>,
  x: MotionValue<number>,
  y: MotionValue<number>,
  enabled: boolean
) {
  const pausedUntil = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || !window.matchMedia("(hover: none), (pointer: coarse)").matches) return;

    let frame = 0;
    let onScreen = false;
    let start = performance.now();

    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (!onScreen || now < pausedUntil.current) return;
      const t = (now - start) / 1000;
      const { width, height } = el.getBoundingClientRect();
      x.set(width * (0.5 + 0.38 * Math.sin(t * 0.45)));
      y.set(height * (0.5 + 0.3 * Math.sin(t * 0.7 + 1.2)));
    };

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start = performance.now();
    });
    observer.observe(el);

    const onTap = (event: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      pausedUntil.current = performance.now() + 2200;
      animate(x, event.clientX - rect.left, { duration: 0.45, ease: [0.22, 1, 0.36, 1] });
      animate(y, event.clientY - rect.top, { duration: 0.45, ease: [0.22, 1, 0.36, 1] });
    };
    el.addEventListener("pointerdown", onTap, { passive: true });
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      el.removeEventListener("pointerdown", onTap);
    };
  }, [ref, x, y, enabled]);
}
