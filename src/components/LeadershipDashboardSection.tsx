"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { DotPattern } from "@/components/ui/dot-pattern";
import { useIsMobile } from "@/lib/useIsMobile";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { cn } from "@/lib/utils";

type Metric = {
  label: string;
  note: string;
  /** Illustrative mockup value only — see this file's own top comment. */
  value: number;
  prefix?: string;
  suffix?: string;
};

// Same four trends the old static bullet list here used to describe in
// plain prose — kept word-for-word, just given a number each so the
// panel reads as an actual dashboard rather than a sentence list. All
// four are illustrative mockup figures, not a real customer's data (no
// live NeuroAtlas org has run a pilot long enough to report from yet) —
// same honesty convention as EditorialIndexSection's own placeholder
// research cards: real content over a blank box, without pretending a
// specific number is a fact about the world.
const METRICS: Metric[] = [
  { label: "Composure trend", note: "Across the group, over time.", value: 74, suffix: "%" },
  {
    label: "Teams flagged",
    note: "Showing elevated pressure this period.",
    value: 20,
    suffix: "%",
  },
  { label: "Platform engagement", note: "Active at a group level.", value: 88, suffix: "%" },
  {
    label: "Movement since last review",
    note: "Composure trend, quarter over quarter.",
    value: 12,
    prefix: "+",
    suffix: "%",
  },
];

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

/** Even hold-then-reveal quarters, same shape as EditorialIndexSection's
 *  own CARD_WINDOWS (see that file's doc comment for the full mechanics)
 *  — metric `i` holds invisible through every earlier metric's own
 *  reveal, then gets its own slice of the track to ease in and settle
 *  before the next one starts, so a reader who stops anywhere mid-scroll
 *  always sees a coherent, already-settled state, never a half-revealed
 *  row. */
function windowFor(index: number, total: number) {
  const start = index / total;
  const end = (index + 1) / total;
  return { start, end };
}

/** Ties this row's own numeric readout to the SAME scroll progress
 *  driving its opacity/x — a plain useTransform can't drive formatted
 *  text directly, so this subscribes to the motion value's change
 *  events instead (the exact pattern Header.tsx already uses for its
 *  own scroll-driven state), and only overwrites state while the value
 *  actually needs to move — once eased(p) reaches 1 it stops mattering
 *  which frame last set it. */
function useCountFromProgress(
  progress: MotionValue<number>,
  start: number,
  end: number,
  target: number,
  reduceMotion: boolean
) {
  const [display, setDisplay] = useState(reduceMotion ? target : 0);
  useMotionValueEvent(progress, "change", (p) => {
    if (reduceMotion) return;
    const eased = clamp01((p - start) / (end - start));
    setDisplay(Math.round(eased * target));
  });
  return display;
}

function DashboardRow({
  progress,
  index,
  metric,
  reduceMotion,
}: {
  progress: MotionValue<number>;
  index: number;
  metric: Metric;
  reduceMotion: boolean;
}) {
  const { start, end } = windowFor(index, METRICS.length);
  const eased = (p: number) => (reduceMotion ? 1 : clamp01((p - start) / (end - start)));
  const opacity = useTransform(progress, (p) => eased(p));
  const x = useTransform(progress, (p) => (reduceMotion ? 0 : 20 * (1 - eased(p))));
  // The floating annotation badge gets its own, slightly delayed-reading
  // pop (scale + a small lift) on top of the row's own fade — the
  // "staggered floating annotation" the brief asks for, distinct from
  // the row text simply fading in beside it.
  const badgeScale = useTransform(progress, (p) => (reduceMotion ? 1 : 0.85 + 0.15 * eased(p)));
  const badgeY = useTransform(progress, (p) => (reduceMotion ? 0 : 10 * (1 - eased(p))));
  const display = useCountFromProgress(progress, start, end, metric.value, reduceMotion);

  return (
    <motion.div
      style={{ opacity, x }}
      className="flex items-center justify-between gap-4 border-b border-cream/10 py-5 first:pt-0 last:border-0 last:pb-0"
    >
      <div>
        <p className="text-sm font-medium text-cream/70">{metric.label}</p>
        <p className="mt-1 text-pretty text-sm text-cream/40">{metric.note}</p>
      </div>
      <motion.div
        style={{ scale: badgeScale, y: badgeY }}
        className="card-glass shrink-0 rounded-xl bg-transparent px-4 py-2 text-right shadow-[0_0_20px_-8px_rgba(218,199,158,0.45)]"
      >
        <span className="font-serif text-2xl font-normal uppercase tracking-normal text-gold">
          {metric.prefix}
          {display}
          {metric.suffix}
        </span>
      </motion.div>
    </motion.div>
  );
}

/** Pinned scroll-jacked dashboard preview + a plain, non-pinned stacked
 *  fallback below `md` — the same split TheSpecs.tsx already
 *  established for its own floating-annotation system (see that file's
 *  own `isMobile` comment): a phone-width viewport has no real room for
 *  a "hold while things reveal beside it" pin to read as anything but
 *  cramped, so it renders the same four rows as a plain in-flow Reveal
 *  stagger instead. Kept active through `md:` (tablet/iPad) rather than
 *  disabled there too, unlike TheSpecs' own 3D leader-line rail — this
 *  system has no leader line needing real lateral rail space, just a
 *  stacked panel that already fits an iPad's own two-column split fine. */
export function LeadershipDashboardSection() {
  const isMobile = useIsMobile();
  const reduceMotion = useSafeReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  // offset ["start start", "end end"] — same reasoning as
  // EditorialIndexSection's own identical pairing (see that file's own
  // doc comment in full): "start end" would start counting progress the
  // moment any sliver of this wrapper enters from below, long before the
  // sticky panel is actually pinned in its readable position, which
  // would have every metric already sliding by the time the section is
  // even fully in view.
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const heading = (
    <Reveal y={20}>
      <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight text-cream lg:text-4xl">
        What Your Dashboard Shows
      </h2>
      <p className="mt-6 max-w-md text-pretty text-lg text-cream/70">
        Leadership gets a clear read on how pressure is moving through the
        organisation.
      </p>
    </Reveal>
  );

  if (isMobile) {
    return (
      <section className="dark-glow bg-navy-soft text-cream">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
          {heading}
          <div className="relative mt-10 overflow-hidden rounded-3xl">
            <DotPattern className="text-cream/10" />
            <div className="card-glass relative bg-transparent p-6">
              {METRICS.map((metric, i) => (
                <Reveal key={metric.label} delay={i * 0.08}>
                  <div className="flex items-center justify-between gap-4 border-b border-cream/10 py-5 first:pt-0 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium text-cream/70">{metric.label}</p>
                      <p className="mt-1 text-pretty text-sm text-cream/40">{metric.note}</p>
                    </div>
                    <div className="card-glass shrink-0 rounded-xl bg-transparent px-4 py-2 text-right">
                      <span className="font-serif text-2xl font-normal uppercase tracking-normal text-gold">
                        {metric.prefix}
                        {metric.value}
                        {metric.suffix}
                      </span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
          <p className="mt-4 text-center text-xs text-cream/30">
            Illustrative dashboard preview — your organisation&rsquo;s own
            view reflects your own data.
          </p>
        </div>
      </section>
    );
  }

  return (
    // h-[280vh] — four rows across a comfortable ~180vh of real pinned
    // scroll distance once the "start start"/"end end" offset (see
    // above) is accounted for, in the same proportion EditorialIndexSection
    // uses for its own three-card sequence.
    <div ref={wrapperRef} className={cn("relative", !reduceMotion && "h-[280vh]")}>
      {/* min-h-[100svh], not h-screen — see EditorialIndexSection/
         MethodScrollCards' own comments: h-[100svh] alone assumes the
         browser's own chrome is fully hidden, which clips this pinned
         section's bottom edge on a real phone. This branch only ever
         renders at md+ (see the isMobile fallback above), but keeping
         the same svh convention here too costs nothing and avoids the
         exact same bug on a short tablet viewport. */}
      <div className="sticky top-0 flex min-h-[100svh] items-center bg-navy-soft px-6 py-16 md:py-24 lg:px-10">
        <div className="mx-auto grid w-full max-w-6xl gap-16 md:grid-cols-2 md:items-center">
          {heading}
          <div className="relative overflow-hidden rounded-3xl">
            <DotPattern className="text-cream/10" />
            <div className="card-glass relative bg-transparent p-6 lg:p-8">
              {METRICS.map((metric, i) => (
                <DashboardRow
                  key={metric.label}
                  progress={scrollYProgress}
                  index={i}
                  metric={metric}
                  reduceMotion={reduceMotion}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
