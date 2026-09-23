"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type HeroMediaProps = {
  /** Real footage goes here once it's ready — e.g. "/video/hero-band.mp4".
   *  Left undefined for now, which renders the ambient placeholder below
   *  instead. Swapping in the real file later is exactly this one prop. */
  src?: string;
  poster?: string;
  className?: string;
  /** Pauses the video on its own first frame instead of autoplaying/
   *  looping — the same "still functions, just instant" convention every
   *  other motion element on this site already follows under
   *  prefers-reduced-motion (see Reveal.tsx, this file's own caller).
   *  `autoPlay` on the <video> tag itself has no awareness of the media
   *  query, so without this the background video ignored reduced-motion
   *  entirely — confirmed live, a real gap the rest of this codebase
   *  doesn't have anywhere else. Omit (or false) for the default
   *  autoplay/loop background video. */
  reduceMotion?: boolean;
};

/**
 * Full-bleed hero background. A real <video> once `src` is supplied; an
 * ambient CSS placeholder (two slow-drifting gold blooms over navy) until
 * then, so the hero still reads as intentional rather than empty. Kept as
 * its own component so that swap never touches Hero.tsx's layout — see
 * HERO_VIDEO_SRC at the top of Hero.tsx.
 */
export function HeroMedia({ src, poster, className, reduceMotion = false }: HeroMediaProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduceMotion) {
      video.pause();
      video.currentTime = 0;
    } else {
      void video.play();
    }
  }, [reduceMotion]);

  if (src) {
    return (
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster={poster}
        className={cn("absolute inset-0 size-full object-cover", className)}
      >
        <source src={src} />
      </video>
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
