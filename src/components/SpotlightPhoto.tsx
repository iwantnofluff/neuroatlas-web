"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/**
 * A grayscale product photo that reveals its real color inside a small
 * circle following the cursor — a flashlight passing over the band on a
 * real wrist. Exactly the same mask technique as Footer.tsx's spotlight
 * wordmark (see that file's own doc comment for the full mechanics),
 * applied here to a photo instead of text: a grayscale `next/image` sits
 * as the permanent base layer, a color copy stacked on top gets a CSS
 * `mask-image` of `radial-gradient(circle Rpx at Xpx Ypx, black 0%,
 * transparent 100%)` — the browser's default mask-mode reads the
 * gradient's alpha, so only the area inside the circle shows the color
 * layer through; everywhere outside it, the grayscale base shows. The
 * circle's center is two `useMotionValue`s fed straight into a
 * `useMotionTemplate` that writes the resulting mask-image straight to
 * the DOM every frame — bypassing React's render cycle, the only way
 * this stays smooth at 60fps on every pointermove.
 *
 * Deliberately NOT run through `useSpring` the way the footer's own
 * version is — a real, confirmed bug this replaces: the footer's
 * damping/stiffness/mass combination (30/200/0.4) is heavily overdamped
 * (damping ratio ≈1.68, not the ≈1.0 "critically damped" that would
 * catch up promptly), so instead of snapping to the cursor it slowly
 * creeps toward it. That's barely noticeable on the footer's own
 * page-wide wordmark sweep, but paired with this component's off-canvas
 * starting point (-9999px), the very first hover had a huge distance to
 * creep across — reported live as "a second or two" of delay before the
 * spotlight showed up where the cursor actually was. Feeding the raw
 * motion values straight into the template (no spring in between) makes
 * this track the cursor 1:1 with zero lag, at the cost of the footer's
 * own deliberate "weighted flashlight" trailing feel — the right
 * trade-off here, where the point is a responsive product reveal, not a
 * slow cinematic sweep.
 *
 * Unlike the footer (one page-wide element, pointer listener on the
 * whole <footer>, coordinates translated into a separate text wrapper's
 * local space), this is fully self-contained — the pointer handlers sit
 * directly on this component's own wrapper, and the coordinates read
 * off that same wrapper's own getBoundingClientRect(), so this can be
 * dropped in anywhere without any extra ref plumbing at the call site.
 *
 * reduceMotion shows the color layer fully, unmasked — the complete,
 * "revealed" state rather than the muted grayscale one, the same
 * judgment call Footer.tsx makes for its own wordmark (a meaningful
 * static state beats a permanently-dim "broken effect").
 *
 * `mask-size` is explicitly measured and set in real px — a real,
 * confirmed bug this replaces: on any non-square panel (this one is
 * ~548×511), the circle rendered as a visibly wider-than-tall ellipse,
 * not a circle. `mask-image`'s own gradient has no intrinsic size or
 * ratio, so `mask-size: auto` (the default) resolves to "100% 100% of
 * the mask positioning area" per spec — each axis stretched
 * independently to fill the box, which distorts even a `circle Rpx`
 * (an explicitly circular, absolutely-sized gradient) into an ellipse
 * whenever the box itself isn't square. A PERCENTAGE mask-size doesn't
 * fix this either — it resolves to the exact same per-axis stretch,
 * just spelled out explicitly instead of defaulted. What actually
 * avoids it is an ABSOLUTE pixel size matching the box's own real
 * rendered dimensions: an explicit `WxH`px size bypasses the "no
 * natural size" auto-resolution entirely, so the gradient paints onto a
 * canvas exactly as large as the box itself, with no additional
 * per-axis scaling — the same px coordinate space `mouseX`/`mouseY`
 * are already measured in, so the circle renders undistorted and
 * exactly where the cursor is. Measured via ResizeObserver (not a
 * one-time read) since this panel's size can change — a fixed-px
 * wrapper is constant, but a `fill`-based one (percentage width/aspect-
 * ratio, like #the-problem's own column) genuinely resizes with the
 * viewport.
 *
 * `maskSize` starts as `null`, not `{width: 0, height: 0}` — a real,
 * confirmed bug this replaces: a numeric default meant `mask-size: 0px
 * 0px` was what actually got rendered (baked into the server-rendered
 * HTML, too) for every instant before the layout effect's measurement
 * resolved. A degenerate zero-size mask is invalid, and browsers don't
 * agree on what to do with an invalid mask — some drop the mask
 * entirely and show the color layer fully unmasked, which is
 * indistinguishable from "the circle isn't a circle at all," not just
 * briefly. The color layer now doesn't mount until a real measurement
 * exists, so there's no zero/invalid state to ever hit — a real no-JS
 * visitor simply sees the plain grayscale photo forever (a legitimate,
 * fully-formed fallback, not a broken one), and everyone else gets it
 * within the same layout-effect flush, before the first paint.
 */
export function SpotlightPhoto({
  srcColor,
  srcGray,
  alt,
  radius = 80,
  className,
  sizes,
}: {
  srcColor: string;
  srcGray: string;
  /** Real alt text — describes the photo once, for the grayscale base
   *  layer (which is always present). The color layer stacked on top of
   *  it is decorative (aria-hidden) so a screen reader doesn't hear the
   *  same description twice. */
  alt: string;
  /** Spotlight circle radius in px. Default (80) is tuned for a modest
   *  portrait-sized photo panel, noticeably smaller than the footer's
   *  320px (that one sweeps a page-wide wordmark). */
  radius?: number;
  className?: string;
  sizes?: string;
}) {
  const reduceMotion = useSafeReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [maskSize, setMaskSize] = useState<{ width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setMaskSize({ width: el.clientWidth, height: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Starts well off-canvas so nothing is revealed before the pointer has
  // actually moved over the photo.
  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);
  // black 0%->65% is a solid plateau (fully revealed, not fading yet) —
  // black/transparent 0%->100% (the original version) linearly faded
  // across the WHOLE radius, so the reveal was dimmest exactly at its
  // center and never actually solid anywhere; a real, confirmed
  // mismatch against the requested reference (a solid disc with a soft
  // blurred rim, not a fade-throughout blob). The remaining 65%->100%
  // band is where it actually feathers out to fully transparent.
  const maskImage = useMotionTemplate`radial-gradient(circle ${radius}px at ${mouseX}px ${mouseY}px, black 0%, black 65%, transparent 100%)`;
  const maskSizeValue = maskSize ? `${maskSize.width}px ${maskSize.height}px` : undefined;

  function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const rect = wrapperRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  function handlePointerLeave() {
    mouseX.set(-9999);
    mouseY.set(-9999);
  }

  return (
    <div
      ref={wrapperRef}
      onPointerMove={reduceMotion ? undefined : handlePointerMove}
      onPointerLeave={reduceMotion ? undefined : handlePointerLeave}
      className={cn("relative overflow-hidden", className)}
    >
      <Image src={srcGray} alt={alt} fill sizes={sizes} className="object-cover" />
      {reduceMotion ? (
        <Image
          src={srcColor}
          alt=""
          aria-hidden
          fill
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        // maskSize is null until the ResizeObserver below resolves a
        // real measurement — the color layer simply doesn't exist yet
        // rather than existing with a degenerate mask-size (see this
        // component's own doc comment for why that distinction matters).
        maskSizeValue && (
          <motion.div
            aria-hidden
            style={{
              WebkitMaskImage: maskImage,
              maskImage,
              WebkitMaskSize: maskSizeValue,
              maskSize: maskSizeValue,
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
            className="absolute inset-0"
          >
            <Image src={srcColor} alt="" fill sizes={sizes} className="object-cover" />
          </motion.div>
        )
      )}
    </div>
  );
}
