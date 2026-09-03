import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Annotation = { label: string; className: string };

/**
 * A generic "phone screen" silhouette standing in for a real app
 * screenshot on /inside-the-app — no real UI has been designed or
 * exported yet, so rather than the flat placeholder box this codebase
 * already uses elsewhere (FeatureSplitSection's default ImageIcon
 * panel), this at least reads specifically as "a phone": a notch bar
 * and rounded-corner frame, with an icon + label naming which screen
 * it stands in for rather than a generic, unlabeled box.
 *
 * `annotations` render as small floating callout chips positioned near
 * the frame (via each one's own `className`, e.g. `"top-10 -right-6"`)
 * — the "annotated screenshot" effect a couple of sections' copy asks
 * for, without pretending to trace real UI that doesn't exist yet.
 * Chips are always dark/gold regardless of `tone` — they read as
 * floating UI callouts sitting ON TOP of the frame, not part of
 * whatever's behind them, so they stay legible over both `tone`s.
 *
 * `className` overrides the default max-w-[260px] (via `cn`'s
 * tailwind-merge, so a later `max-w-*` genuinely wins rather than both
 * applying) — needed when this sits inside FeatureSplitSection's media
 * slot, which forces its wrapper to `aspect-square overflow-hidden`
 * regardless of what's passed as `media`: at the default width this
 * tall aspect-[9/19] frame renders taller than that square, so the
 * square's own overflow-hidden would silently crop it — confirmed live
 * via screenshot before the narrower override was added, not assumed.
 * A narrower cap keeps the frame's computed height inside the square
 * at any of this site's actual FeatureSplitSection column widths.
 */
export function AppScreenMock({
  icon: Icon,
  label,
  annotations = [],
  tone = "dark",
  className,
}: {
  icon: LucideIcon;
  label: string;
  annotations?: Annotation[];
  tone?: "dark" | "light";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={cn("relative mx-auto w-full max-w-[260px]", className)}>
      <div
        className={cn(
          "relative aspect-[9/19] w-full overflow-hidden rounded-[2.25rem] border shadow-2xl",
          dark ? "border-white/10 bg-navy-soft" : "border-navy/10 bg-white"
        )}
      >
        <div className="absolute inset-x-0 top-0 flex justify-center pt-3">
          <div className={cn("h-1.5 w-16 rounded-full", dark ? "bg-white/15" : "bg-navy/10")} />
        </div>
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
          <Icon
            aria-hidden="true"
            strokeWidth={1.25}
            className={cn("size-10", dark ? "text-gold/70" : "text-navy/25")}
          />
          <p
            className={cn(
              "text-xs tracking-[0.15em] uppercase",
              dark ? "text-cream/40" : "text-navy/30"
            )}
          >
            {label}
          </p>
        </div>
      </div>
      {annotations.map((a) => (
        <span
          key={a.label}
          aria-hidden="true"
          className={cn(
            "absolute rounded-full border border-gold/30 bg-navy/90 px-3 py-1 text-[11px] whitespace-nowrap text-gold shadow-lg backdrop-blur-sm",
            a.className
          )}
        >
          {a.label}
        </span>
      ))}
    </div>
  );
}
