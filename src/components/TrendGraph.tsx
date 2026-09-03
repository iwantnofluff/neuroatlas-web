import { cn } from "@/lib/utils";

/**
 * A hand-authored SVG line — not a charting library, matching this
 * codebase's existing preference for plain decorative SVG over a new
 * dependency (see BeyondHeartSection's own NeuralWave). Standing in for
 * a real trend chart on /inside-the-app's "Progress Tracking" section;
 * the shape (a generally upward, slightly noisy line) is illustrative
 * of "improvement over time" as a concept, not real pilot data — same
 * honesty convention /how-it-works' own HRV stat card already uses
 * ("Illustrative example, pending real pilot data").
 */
export function TrendGraph({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "flex size-full flex-col items-center justify-center gap-4 p-8",
        dark ? "card-glass bg-transparent" : "card-glass-light"
      )}
    >
      <svg viewBox="0 0 280 100" className="w-full max-w-xs" aria-hidden="true">
        {/* Faint baseline grid — three horizontal guides, purely decorative. */}
        {[20, 50, 80].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="280"
            y2={y}
            stroke={dark ? "rgba(244,240,233,0.08)" : "rgba(11,16,22,0.08)"}
            strokeWidth="1"
          />
        ))}
        <polyline
          points="0,86 40,74 80,78 120,54 160,60 200,34 240,38 280,14"
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="280" cy="14" r="4.5" fill="var(--color-gold)" />
      </svg>
      <p
        className={cn(
          "text-center text-xs italic",
          dark ? "text-cream/40" : "text-navy/35"
        )}
      >
        Illustrative example, pending real pilot data.
      </p>
    </div>
  );
}
