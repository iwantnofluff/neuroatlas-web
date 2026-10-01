"use client";

import { useCallback, useState } from "react";

/**
 * Stops a react-three-fiber scene rendering while its canvas is off
 * screen. Each scene otherwise draws every frame for as long as the page
 * is open, which costs battery and main-thread time on phones and drags
 * down page-speed scores. Pass the ref and frameloop to `<Canvas>`; the
 * scene resumes 200px before it scrolls back into view so it is already
 * drawing when it appears.
 */
export function useOnScreenFrameloop() {
  const [onScreen, setOnScreen] = useState(true);
  const ref = useCallback((canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      rootMargin: "200px 0px",
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);
  return { ref, frameloop: onScreen ? ("always" as const) : ("never" as const) };
}
