"use client";

import Image from "next/image";
import { useRef, type PointerEvent as ReactPointerEvent } from "react";
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

  // Starts well off-canvas so nothing is revealed before the pointer has
  // actually moved over the photo.
  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);
  const maskImage = useMotionTemplate`radial-gradient(circle ${radius}px at ${mouseX}px ${mouseY}px, black 0%, transparent 100%)`;

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
        <motion.div
          aria-hidden
          style={{ WebkitMaskImage: maskImage, maskImage }}
          className="absolute inset-0"
        >
          <Image src={srcColor} alt="" fill sizes={sizes} className="object-cover" />
        </motion.div>
      )}
    </div>
  );
}
