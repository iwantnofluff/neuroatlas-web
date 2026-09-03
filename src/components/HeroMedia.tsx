import { cn } from "@/lib/utils";

type HeroMediaProps = {
  /** Real footage goes here once it's ready — e.g. "/video/hero-band.mp4".
   *  Left undefined for now, which renders the ambient placeholder below
   *  instead. Swapping in the real file later is exactly this one prop. */
  src?: string;
  poster?: string;
  className?: string;
};

/**
 * Full-bleed hero background. A real <video> once `src` is supplied; an
 * ambient CSS placeholder (two slow-drifting gold blooms over navy) until
 * then, so the hero still reads as intentional rather than empty. Kept as
 * its own component so that swap never touches Hero.tsx's layout — see
 * HERO_VIDEO_SRC at the top of Hero.tsx.
 */
export function HeroMedia({ src, poster, className }: HeroMediaProps) {
  if (src) {
    return (
      <video
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
