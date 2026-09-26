import { cn } from "@/lib/utils";

/**
 * A static ambient dot texture for large flat sections — CSS only, one
 * `background-image` tile, zero DOM nodes and zero JS. Replaces
 * DotPattern (dot-pattern.tsx) at exactly the three spots this session
 * added it to fill an otherwise-empty CTA/footnote background
 * (ScienceClosingSection, ClosingCurtainSection, /the-science's own
 * References section): a direct "the fluctuations/shimmer are still
 * happening" report, even after DotPattern's own resize-observer fix
 * (dot-pattern.tsx's own comment) stopped it re-rendering on scroll.
 * DotPattern renders every dot as its own `motion.circle` — even with
 * `glow` off, that's still 1000+ live Framer Motion components (each
 * subscribing to Motion's own render loop) for what is, visually, a
 * completely static texture. That's real, continuous overhead
 * regardless of whether any single dot's OWN value ever changes, which
 * lines up with a persistent shimmer that isn't tied to any specific
 * scroll position. A tiled `radial-gradient` background paints the
 * exact same visual once, as a GPU-composited image, with nothing left
 * to re-render, ever. DotPattern itself is untouched — Hero.tsx's own
 * (smaller, mask-faded) usage predates this session and was never
 * reported as an issue, so there's no reason to touch it too.
 */
export function DotGrid({
  size = 28,
  colorVar = "--color-gold",
  opacity = 0.35,
  className,
}: {
  /** Spacing between dots, in px. */
  size?: number;
  /** CSS custom property (e.g. "--color-gold") the dot color reads from. */
  colorVar?: string;
  /** Opacity of the dot color itself (the gradient's own stop, not a CSS opacity on the whole layer — keeps the surrounding transparent tile fully transparent). */
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: `radial-gradient(circle, color-mix(in oklab, var(${colorVar}) ${Math.round(opacity * 100)}%, transparent) 1px, transparent 1.5px)`,
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}
