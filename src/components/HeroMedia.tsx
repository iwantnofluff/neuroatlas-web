"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

type HeroMediaProps = {
  /** Real footage goes here once it's ready — e.g. "/video/hero-band.mp4".
   *  Left undefined for now, which renders the ambient placeholder below
   *  instead. Swapping in the real file later is exactly this one prop. */
  src?: string;
  poster?: string;
  /** A static photo background for pages that don't have hero footage of
   *  their own (e.g. /how-it-works) — only used when `src` is absent.
   *  Renders via next/image (fill + object-cover, priority since it's
   *  always above the fold) instead of the ambient placeholder. */
  image?: string;
  className?: string;
  /** Pauses the video on its own first frame instead of autoplaying/
   *  looping — the same "still functions, just instant" convention every
   *  other motion element on this site already follows under
   *  prefers-reduced-motion (see Reveal.tsx, this file's own caller).
   *  `autoPlay` on the <video> tag itself has no awareness of the media
   *  query, so without this the background video ignored reduced-motion
   *  entirely — confirmed live, a real gap the rest of this codebase
   *  doesn't have anywhere else. Omit to follow the visitor's own
   *  reduced-motion setting (useSafeReducedMotion). */
  reduceMotion?: boolean;
};

/**
 * Full-bleed hero background. A real <video> once `src` is supplied; an
 * ambient CSS placeholder (two slow-drifting gold blooms over navy) until
 * then, so the hero still reads as intentional rather than empty. Kept as
 * its own component so that swap never touches Hero.tsx's layout — see
 * HERO_VIDEO_SRC at the top of Hero.tsx.
 */
export function HeroMedia({ src, poster, image, className, reduceMotion: reduceMotionProp }: HeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useSafeReducedMotion();
  const reduceMotion = reduceMotionProp ?? prefersReducedMotion;

  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // React does not put `muted` in the server-rendered HTML, and iOS only
    // autoplays muted video, so it is set here before play() is called.
    video.muted = true;
    video.defaultMuted = true;
    if (reduceMotion) {
      video.pause();
      video.currentTime = 0;
    } else {
      video.play().catch(() => {});
    }
  }, [reduceMotion]);

  if (src) {
    // The poster is a real image underneath, and the video fades in only
    // once it is actually playing. When a phone refuses autoplay (Low
    // Power Mode, data saver, some private windows) the visitor sees the
    // still frame, never the browser's play button.
    return (
      <div aria-hidden="true" className={cn("absolute inset-0 overflow-hidden", className)}>
        {poster && (
          <Image src={poster} alt="" fill priority sizes="100vw" className="object-cover" />
        )}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          controls={false}
          poster={poster}
          onPlaying={() => setPlaying(true)}
          className={cn(
            "hero-video absolute inset-0 size-full object-cover transition-opacity duration-700",
            playing || reduceMotion ? "opacity-100" : "opacity-0"
          )}
        >
          <source src={src} />
        </video>
      </div>
    );
  }

  if (image) {
    return (
      <Image
        src={image}
        alt=""
        fill
        priority
        sizes="100vw"
        className={cn("absolute inset-0 size-full object-cover", className)}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn("absolute inset-0 overflow-hidden bg-navy-deep", className)}
    >
      <div className="hero-ambient-a absolute inset-0" />
      <div className="hero-ambient-b absolute inset-0" />
    </div>
  );
}
