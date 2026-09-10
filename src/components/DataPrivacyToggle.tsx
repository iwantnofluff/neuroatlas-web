"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

type View = "individual" | "organisation";

// A fixed illustrative pattern, not live data — this is a UI mockup
// showing what each side of the boundary actually sees, the same "real
// content over a generic box" approach as the dashboard preview further
// down the page, not a claim about any real person's or organisation's
// actual results.
const PERSONAL_METRICS = [
  { label: "Composure score", value: "82" },
  { label: "Recovery streak", value: "6 days" },
  { label: "Stress age", value: "−3 yrs" },
];

// Deliberately abstract: a small grid of shaded cells with no names,
// team labels, or headcounts small enough to re-identify anyone — the
// heatmap itself is the illustration of "anonymous group trend," not a
// literal org chart.
const ORG_HEATMAP_ROWS = 4;
const ORG_HEATMAP_COLS = 6;
const ORG_HEATMAP_LEVELS = [
  2, 3, 1, 2, 4, 2, 3, 2, 2, 3, 2, 1, 1, 2, 3, 2, 3, 2, 2, 4, 2, 1, 2, 3,
];

const HEAT_LEVEL_CLASSNAMES = ["bg-gold/10", "bg-gold/30", "bg-gold/55", "bg-gold/80"];

/**
 * "The Data Privacy toggle" — a tactile Individual/Organization switch
 * that swaps in a conditionally rendered mockup for whichever side is
 * selected, replacing what used to be a static two-column bullet list
 * (LabeledColumnsSection) here — the client's own explicit brief for
 * this section calls for an interactive demonstration of the boundary,
 * not just a description of it. LabeledColumnsSection itself is
 * untouched and still covers /privacy's own two sections that reuse it.
 *
 * `layoutId` gives the selected-tab pill a real shared-layout slide
 * between the two tab positions (framer-motion computes and animates
 * the FLIP transform automatically); AnimatePresence with `mode="wait"`
 * cross-fades the mockup panel below rather than both states ever
 * being mounted at once.
 */
export function DataPrivacyToggle() {
  const [view, setView] = useState<View>("individual");
  const reduceMotion = useSafeReducedMotion();
  const isIndividual = view === "individual";

  return (
    <div className="mx-auto mt-12 w-full max-w-md">
      <div
        role="tablist"
        aria-label="View NeuroAtlas data as"
        className="relative mx-auto flex w-full max-w-xs rounded-full border border-navy/10 bg-white/60 p-1"
      >
        {(["individual", "organisation"] as const).map((option) => (
          <motion.button
            key={option}
            role="tab"
            type="button"
            aria-selected={view === option}
            onClick={() => setView(option)}
            whileTap={{ scale: reduceMotion ? 1 : 0.97 }}
            className={cn(
              "relative z-10 flex-1 rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors",
              view === option ? "text-navy" : "text-mist"
            )}
          >
            {option === "individual" ? "Individual" : "Organization"}
            {view === option && (
              <motion.span
                layoutId="privacy-toggle-thumb"
                transition={{ duration: reduceMotion ? 0 : 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 -z-10 rounded-full bg-cream shadow-[0_4px_14px_-6px_rgba(11,16,22,0.25)]"
              />
            )}
          </motion.button>
        ))}
      </div>

      <div className="relative mt-8 min-h-[230px]">
        <AnimatePresence mode="wait">
          {isIndividual ? (
            <motion.div
              key="individual"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: reduceMotion ? 0 : 0.3 }}
              className="card-glass-light rounded-2xl p-6"
            >
              <p className="eyebrow">Your Personal View</p>
              <div className="mt-4 space-y-3">
                {PERSONAL_METRICS.map((metric) => (
                  <div
                    key={metric.label}
                    className="flex items-center justify-between border-b border-navy/5 pb-3 last:border-0 last:pb-0"
                  >
                    <span className="text-pretty text-sm text-navy/70">{metric.label}</span>
                    <span className="font-serif text-lg font-normal uppercase tracking-normal text-navy">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="organisation"
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
              transition={{ duration: reduceMotion ? 0 : 0.3 }}
              className="card-glass-light rounded-2xl p-6"
            >
              <p className="eyebrow">Anonymous Group Trends</p>
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
              <p className="mt-4 text-pretty text-sm text-navy/60">
                No individual is ever identifiable in this view.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
