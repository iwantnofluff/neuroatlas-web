import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";

// Same visual logic as /for-organisations' own individual/organisation
// contrast (see DataPrivacyToggle.tsx) — a personal metrics mockup next
// to an anonymous group heatmap — but shown as a permanent 50/50 split
// rather than a toggle: this section's own point is that BOTH views
// exist side by side at once (an employer never gets to "switch into"
// the individual view), so a always-both-visible split reads truer to
// that boundary than a control that lets you flip between them.
// DataPrivacyToggle itself is untouched; this duplicates its small
// mockup pieces rather than importing it, since the two components now
// diverge in a real way (toggle vs. permanent split), not just styling.
const PERSONAL_ITEMS = ["Your own readings.", "Your own progress.", "Your own history."];

// Deliberately abstract — no names, team labels, or headcounts small
// enough to re-identify anyone; the heatmap itself IS the illustration
// of "anonymous group trend," not a literal org chart. Same fixed
// pattern DataPrivacyToggle uses, not live data.
const ORG_HEATMAP_ROWS = 4;
const ORG_HEATMAP_COLS = 6;
const ORG_HEATMAP_LEVELS = [
  2, 3, 1, 2, 4, 2, 3, 2, 2, 3, 2, 1, 1, 2, 3, 2, 3, 2, 2, 4, 2, 1, 2, 3,
];
const HEAT_LEVEL_CLASSNAMES = ["bg-gold/10", "bg-gold/30", "bg-gold/55", "bg-gold/80"];

/**
 * "The Line We Do Not Cross" — the 50/50 individual-vs-employer split
 * for /privacy. `grid-cols-1 md:grid-cols-2` — stacks on mobile and the
 * whole foldable tier, splits at true tablet width, the same md
 * breakpoint FeatureSplitSection's own doc comment establishes for
 * exactly this failure mode (a two-column split engaging too early
 * squeezes real content into too little width).
 */
export function PrivacyBoundarySplit() {
  return (
    <div className="mt-12 grid gap-6 text-left md:grid-cols-2 md:gap-10">
      <Reveal className="card-glass rounded-2xl bg-transparent p-6 lg:p-8">
        <p className="eyebrow">What You See</p>
        <ul className="mt-4 space-y-2 text-pretty text-base text-cream/80">
          {PERSONAL_ITEMS.map((item) => (
            <li key={item} className="flex gap-2">
              <span
                aria-hidden="true"
                className="mt-2.5 size-1 shrink-0 rounded-full bg-gold/70"
              />
              {item}
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal delay={0.1} className="card-glass rounded-2xl bg-transparent p-6 lg:p-8">
        <p className="eyebrow">What Your Employer Sees</p>
        <div
          className="mt-4 grid gap-1.5"
          style={{ gridTemplateColumns: `repeat(${ORG_HEATMAP_COLS}, minmax(0, 1fr))` }}
          aria-hidden="true"
        >
          {Array.from({ length: ORG_HEATMAP_ROWS * ORG_HEATMAP_COLS }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "aspect-square rounded-sm",
                HEAT_LEVEL_CLASSNAMES[ORG_HEATMAP_LEVELS[i % ORG_HEATMAP_LEVELS.length] - 1]
              )}
            />
          ))}
        </div>
        <p className="mt-4 text-pretty text-sm text-cream/60">
          Aggregate trends across the whole team. No individual is ever
          identifiable.
        </p>
      </Reveal>
    </div>
  );
}
