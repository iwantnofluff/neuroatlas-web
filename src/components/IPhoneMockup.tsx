"use client";

import { useEffect, useRef, useState } from "react";
import { Pointer } from "lucide-react";
import { cn } from "@/lib/utils";

type WheelEventWithLenis = WheelEvent & { lenisStopPropagation?: boolean };

/** True when some scroll container between `target` and `root` can still
 *  move in the wheel's direction — the only case the phone screen, not
 *  the page, should take the wheel. */
function canScrollInside(target: EventTarget | null, root: HTMLElement, deltaY: number) {
  for (let node = target instanceof Element ? target : null; node && node !== root.parentElement; node = node.parentElement) {
    if (!(node instanceof HTMLElement)) continue;
    const { overflowY } = getComputedStyle(node);
    if (overflowY !== "auto" && overflowY !== "scroll") continue;
    const max = node.scrollHeight - node.clientHeight;
    if (max <= 1) continue;
    if (deltaY > 0 && node.scrollTop < max - 1) return true;
    if (deltaY < 0 && node.scrollTop > 0) return true;
  }
  return false;
}

/**
 * A realistic (CSS-only, no image asset) iPhone frame — titanium-style
 * bezel, a Dynamic Island notch, and side buttons — for presenting an
 * app screen as a device photo mockup rather than a bare card. Sized
 * by height with its own true aspect ratio, same "size by height,
 * width follows" pattern as BodySilhouette.tsx.
 *
 * `variant` picks which real device's screen resolution the aspect
 * ratio matches — "pro" (the default, every existing caller) is
 * iPhone 17 Pro's 1206:2622 (~9:19.57); "pro-max" is iPhone 17 Pro
 * Max's own, larger 1320:2868 (~9:19.57 too, but not the identical
 * ratio — confirmed via Apple's own published specs, not assumed from
 * the smaller Pro). Either way this mockup stands in for the screen
 * itself, so the resolution ratio is the correct one to match, not
 * the physical case ratio (close but not identical, since bezel
 * proportions differ from the pixel grid).
 *
 * `interactive` marks a screen visitors can play with. It shows a
 * "Tap to explore" cue and uses click-to-engage, like an embedded map:
 * until the phone is tapped, clicked or focused (click, not pointerdown:
 * a touch swipe also starts with pointerdown, and must scroll the page),
 * its inner scroll areas
 * are held still (globals.css) so the wheel and touch swipes always
 * scroll the page. Once engaged, a gold rim on the bezel shows it (drawn
 * inside the bezel so a parent's overflow-hidden can't clip it), the wheel
 * scrolls the screen while it has room and hands back to Lenis' page
 * scroll at the end, and pointer-leave, a tap outside, Escape or
 * scrolling it offscreen releases it.
 */
export function IPhoneMockup({
  children,
  className,
  variant = "pro",
  interactive = false,
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "pro" | "pro-max";
  interactive?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const [engaged, setEngaged] = useState(false);

  useEffect(() => {
    const screen = screenRef.current;
    if (!interactive || !engaged || !screen) return;
    const onWheel = (event: WheelEvent) => {
      if (canScrollInside(event.target, screen, event.deltaY)) {
        (event as WheelEventWithLenis).lenisStopPropagation = true;
      }
    };
    screen.addEventListener("wheel", onWheel, { passive: true });
    return () => screen.removeEventListener("wheel", onWheel);
  }, [interactive, engaged]);

  useEffect(() => {
    const root = rootRef.current;
    if (!interactive || !engaged || !root) return;
    const release = () => setEngaged(false);
    const onPointerDown = (event: PointerEvent) => {
      if (!root.contains(event.target as Node)) release();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") release();
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) release();
    });
    observer.observe(root);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      observer.disconnect();
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [interactive, engaged]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative h-full",
        variant === "pro-max" ? "aspect-[1320/2868]" : "aspect-[1206/2622]",
        interactive && !engaged && "cursor-pointer",
        className
      )}
      {...(interactive && {
        onClick: () => setEngaged(true),
        onPointerLeave: (event: React.PointerEvent) => {
          if (event.pointerType === "mouse") setEngaged(false);
        },
        onFocus: () => setEngaged(true),
        onBlur: (event: React.FocusEvent) => {
          const next = event.relatedTarget as Node | null;
          if (next && !event.currentTarget.contains(next)) setEngaged(false);
        },
      })}
    >
      {/* Side buttons — sit outside the bezel's own rounded rect. */}
      <div className="absolute top-[16%] -left-[2px] h-[3.5%] w-[3px] rounded-l-sm bg-[#3a3b3e]" />
      <div className="absolute top-[22%] -left-[2px] h-[6%] w-[3px] rounded-l-sm bg-[#3a3b3e]" />
      <div className="absolute top-[30%] -left-[2px] h-[6%] w-[3px] rounded-l-sm bg-[#3a3b3e]" />
      <div className="absolute top-[20%] -right-[2px] h-[9%] w-[3px] rounded-r-sm bg-[#3a3b3e]" />

      {/* Bezel */}
      <div
        className={cn(
          "relative size-full rounded-[13%] p-[3%] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] -outline-offset-2 transition-[outline-color] duration-300",
          interactive && "outline-2 outline-solid",
          engaged ? "outline-gold/70" : "outline-transparent"
        )}
        style={{
          background:
            "linear-gradient(155deg, #4a4b4f 0%, #1c1d1f 12%, #0a0a0b 50%, #1c1d1f 88%, #4a4b4f 100%)",
        }}
      >
        {/* Screen */}
        <div
          ref={screenRef}
          data-device-screen
          data-mockup-screen={interactive ? (engaged ? "engaged" : "idle") : undefined}
          className="relative size-full overflow-hidden rounded-[10%] bg-black"
        >
          {children}

          {/* Dynamic Island */}
          <div className="absolute top-[1.6%] left-1/2 h-[3%] w-[28%] -translate-x-1/2 rounded-full bg-black" />

          {interactive && (
            <div
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-[5%] z-20 flex justify-center transition-opacity duration-300",
                engaged ? "opacity-0" : "opacity-100"
              )}
            >
              <span className="flex items-center gap-1.5 rounded-full border border-gold-soft/35 bg-navy/75 px-3 py-1.5 text-[11px] tracking-wide whitespace-nowrap text-cream shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] backdrop-blur-md">
                <span className="mockup-cue-dot size-1.5 rounded-full bg-gold" />
                <Pointer className="size-3.5 text-gold-soft" />
                <span className="[@media(hover:hover)]:hidden">Tap to explore</span>
                <span className="hidden [@media(hover:hover)]:inline">Click to explore</span>
              </span>
            </div>
          )}

          {/* Home indicator — #F4F0E9 is an exact match for
              --color-cream, reused rather than hardcoded again. */}
          <div className="absolute bottom-[1%] left-1/2 h-[0.4%] w-[32%] -translate-x-1/2 rounded-full bg-cream" />
        </div>
      </div>
    </div>
  );
}
