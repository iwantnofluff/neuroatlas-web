"use client";

import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUp, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { useIsMobile } from "@/lib/useIsMobile";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { cn } from "@/lib/utils";

// Rebuilt again per the client's own explicit "Spaced Arch" spec — the
// previous "fanned hand of cards" version (see this file's own git
// history) deliberately OVERLAPPED the three cards via negative margins
// and a z-10 stacking order; reported live as reading cluttered rather
// than intentional. This version keeps the same outward-tilt-on-the-
// ends/straight-in-the-middle idea, but the cards sit in a plain gapped
// flex row with real space between them (no negative margin, no
// absolute positioning, no elevated z-index).
//
// All three cards are the SAME height (see MethodScrollCards' own
// items-stretch, below) and mathematically centered on the exact same
// horizontal axis — an earlier pass here dropped the ends by 64px and
// lifted the center by 16px, which read as a sports podium rather than
// a subtle arch, reported live, so nothing here is a genuine height or
// position difference between cards. The dynamic feel comes entirely
// from the ±6° tilt on the ends.
type StressAgeState = {
  age: number;
  title: string;
  body: string;
  trend: string;
  TrendIcon: LucideIcon;
  trendColor: string;
  matchesAge?: boolean;
};

const STRESS_AGE_STATES: StressAgeState[] = [
  {
    age: 20,
    title: "Recovery trending above your usual pattern",
    body: "Your recent autonomic recovery is mapping younger on the Stress Age reference scale.",
    trend: "Improving",
    TrendIcon: ArrowDown,
    trendColor: "#7fd1a4",
  },
  {
    age: 24,
    title: "Close to your usual pattern",
    body: "Your recent recovery is broadly aligned with your established baseline.",
    trend: "Stable",
    TrendIcon: ArrowRight,
    trendColor: "var(--color-gold-soft)",
    matchesAge: true,
  },
  {
    age: 31,
    title: "Recovery trending below your usual pattern",
    body: "Your recent autonomic recovery is mapping older on the Stress Age reference scale.",
    trend: "Increasing",
    TrendIcon: ArrowUp,
    trendColor: "#f0a0ae",
  },
];

// Per-card resting arch target (index 0 = left, 1 = center, 2 = right)
// — rotate in degrees, y in px, and startX: how far this card sits from
// its own resting spot in the pre-animation "closed" state (canceled
// back to 0 as it settles into the arch — see MethodCard's own
// comment).
//
// y is NOT 0 on the rotated ends — a real, confirmed optical mismatch
// this fixes: with items-stretch giving all three cards the exact same
// height, centered on the exact same axis (mathematically confirmed
// live via getBoundingClientRect: all three report the same centerY),
// a rotated rectangle's own BOUNDING BOX is still visibly taller than
// an unrotated one of the same size — rotating around the box's own
// center swings its corners up and down past its un-rotated top/bottom
// edge. At this card's actual rendered size (~288px wide, ~262px tall)
// and a 6° tilt, that adds roughly 14px above (and again below) center
// versus the flat, unrotated center card — confirmed live: the center
// card's own top edge sat ~14px BELOW the tilted cards' own top
// corners, reading as "dipped", even though every card's true center
// and height were already identical. ROTATION_TOP_ALIGN_PX nudges the
// two tilted cards down by that same amount, so their visual top edge
// lines up with the flat center card's — the tradeoff (their bottoms
// now sit further below center's than before) is the right one here:
// a horizontal row of cards reads by its TOP edges first, not its
// bottoms. This is a rotation-geometry correction, not a return to the
// rejected "podium" height difference above — the two are unrelated:
// removing it would leave the cards' true, pre-rotation position
// identical again, just visibly mismatched at the top edge once more.
const ROTATION_TOP_ALIGN_PX = 14;

const FAN = [
  { rotate: -6, y: ROTATION_TOP_ALIGN_PX, startX: 96 },
  { rotate: 0, y: 0, startX: 0 },
  { rotate: 6, y: ROTATION_TOP_ALIGN_PX, startX: -96 },
] as const;

// Seconds between each card's own fan-open start — a real fan opens as
// each rib follows the last, not all three snapping at once.
const STAGGER = 0.08;

function MethodCard({
  step,
  index,
  isMobile,
  reduceMotion,
}: {
  step: StressAgeState;
  index: number;
  isMobile: boolean;
  reduceMotion: boolean;
}) {
  const fan = FAN[index];

  // Resting state: the arch (tilt + up/down offset) on md:+, a plain flat
  // stack below it (rotate 0, no vertical offset, all three cards sitting
  // in an ordinary gapped column) — per the client's own mobile/tablet
  // fallback spec: "on mobile, all rotations and Y-translations reset to
  // zero". `y` is likewise only applied on md:+; it's set via a plain
  // `style` value below rather than animated — the brief's own "initial
  // state" only calls out opacity/rotate/x as starting points, not y, so
  // this card is already sitting at its final height even before it
  // settles into the arch.
  const restRotate = isMobile ? 0 : fan.rotate;
  const restY = isMobile ? 0 : fan.y;

  // Entrance state: on md:+, every card starts perfectly straight
  // (rotate 0) and pulled in toward the center card's own x position
  // (`startX`, canceled back to 0 as it settles) — reads as "closed",
  // opening out into its tilted, arched resting spot as it scrolls into
  // view. On mobile there's no arch to open FROM, so this is a plain
  // fade (no rotate/x motion at all) — reduceMotion collapses it the
  // same way, for the same reason (an initial state identical to the
  // resting one means nothing actually animates, without conditionally
  // omitting initial/whileInView's shape — see Reveal.tsx's own comment
  // on why that specific pattern matters for this codebase).
  const skipMotion = isMobile || reduceMotion;
  const startRotate = skipMotion ? restRotate : 0;
  const startX = skipMotion ? 0 : fan.startX;

  return (
    <motion.div
      // key={skipMotion ...} — a real, confirmed bug this fixes, found
      // during a global responsiveness audit: both `isMobile` and
      // `reduceMotion` default to `false` on the server/first paint
      // (see useIsMobile.ts/useSafeReducedMotion.ts's own
      // getServerSnapshot) and only resolve to their real client value
      // a tick later. framer-motion's `initial` prop is captured ONCE
      // at mount, never re-read on a later prop change — so on an
      // actual mobile device, this card could mount with `initial`
      // baked in from the STALE isMobile=false pass (rotate/x from the
      // desktop fan), and since whileInView hadn't fired yet, it just
      // sat at that wrong offset until scrolled into view. Confirmed
      // live: document.documentElement.scrollWidth read 72px wider
      // than the viewport on page load, tracing to exactly this card's
      // pre-animation x offset. Keying on `skipMotion` forces a clean
      // remount the instant it resolves to its real value, so
      // `initial` is always captured fresh and correct.
      key={skipMotion ? "settled" : "fan"}
      initial={{ opacity: 0, rotate: startRotate, x: startX }}
      whileInView={{ opacity: 1, rotate: restRotate, x: 0 }}
      // amount: 0.15, not margin: "-80px" — see Reveal.tsx's own
      // comment: a negative rootMargin delays the trigger rather than
      // advancing it, confirmed live (an element didn't start fading
      // in until it was already ~89% scrolled into the viewport).
      viewport={{ once: true, amount: 0.15 }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : {
              rotate: { type: "spring", stiffness: 260, damping: 20 },
              x: { type: "spring", stiffness: 260, damping: 20 },
              opacity: { duration: 0.4, ease: "easeOut" },
              delay: index * STAGGER,
            }
      }
      style={{ y: restY }}
      // .card-glass's own tinted fill read as a flat white/grey glow
      // across the whole card rather than glass on this dark section —
      // these three specifically drop the fill (bg-transparent, a
      // utility, wins over .card-glass's own `background` regardless of
      // source order under Tailwind's cascade layers) and keep only its
      // border and inset-highlight glow.
      //
      // No z-index at all — the whole point of the Spaced Arch is that
      // the three cards never overlap, so there's nothing for a stacking
      // order to resolve (the previous fanned version's static z-10 on
      // the center card only existed to win against the side cards'
      // encroaching edges, which the negative-margin overlap caused in
      // the first place).
      //
      // md:w-auto md:max-w-72 md:flex-1 (was a flat min-[900px]:w-72) —
      // a fixed 288px-per-card width is what forced the previous
      // breakpoint out to a custom 900px in the first place (three
      // 288px cards plus real gaps between them need ~950px+ of clear
      // width). flex-1 (grow AND shrink) shares whatever width the row
      // actually has evenly across all three cards instead, capped at
      // the original 288px so it doesn't keep growing forever past
      // that on a very wide row — which is what lets the arch itself
      // engage at md (768px, as specced) rather than needing its own
      // wider custom breakpoint the way the fixed-width fan did.
      // min-w-0 overrides flex's own default min-width:auto, which
      // would otherwise floor each card at its longest unbroken word's
      // width and defeat the shrinking flex-1 is here to do.
      className={cn(
        "card-glass flex w-full min-w-0 flex-col items-center bg-transparent p-6 text-center md:w-auto md:max-w-72 md:flex-1 md:items-start md:text-left lg:p-8",
        step.matchesAge && "border-gold/50"
      )}
    >
      <span className="eyebrow">Stress Age</span>
      <p className="mt-3 font-serif text-6xl leading-none font-normal text-cream tabular-nums">{step.age}</p>
      <h3 className="mt-6 text-pretty text-base font-medium text-cream">{step.title}</h3>
      <p className="mt-2 text-pretty text-sm text-cream/70">{step.body}</p>
      <p className="mt-auto pt-6">
        <span
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs tracking-wide"
          style={{
            color: step.trendColor,
            borderColor: `color-mix(in oklab, ${step.trendColor} 40%, transparent)`,
          }}
        >
          <step.TrendIcon aria-hidden="true" className="size-3.5" />
          {step.trend}
        </span>
      </p>
    </motion.div>
  );
}

export function MethodScrollCards() {
  // Default (767, Tailwind's `md`) — matches the CSS breakpoint below
  // exactly, same pairing convention as every other useIsMobile() caller
  // on this site. A previous version of this arch needed a wider custom
  // 900px breakpoint because its cards were a FIXED 288px each — three
  // of those plus real gaps genuinely don't fit in 768px. Making the
  // cards flex-1 (see MethodCard's own comment) instead of fixed-width
  // means the row now shares whatever space it actually has, so the
  // standard md breakpoint the client asked for works without
  // reintroducing that overflow.
  const isMobile = useIsMobile();
  const reduceMotion = useSafeReducedMotion();

  return (
    <section id="the-method" data-visual-section="the-method" className="dark-glow bg-navy-soft text-cream">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24 lg:px-10 lg:py-32">
        <div className="grid items-end gap-8 lg:grid-cols-12 lg:gap-14">
          <Reveal y={20} className="lg:col-span-7">
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
              Your Age Tells One Story. Your Stress Age Tells Another.
            </h2>
          </Reveal>
          <Reveal y={20} delay={0.1} className="lg:col-span-5">
            <p className="text-pretty text-lg text-cream/75">
              We all know how old we are. What&rsquo;s harder to see is how well
              our system is keeping up.
            </p>
            <p className="mt-4 text-pretty text-base text-cream/65">
              Stress Age gives you a simple, age-like view of your recent
              recovery — helping you see when your system is recovering well,
              holding steady, or showing signs of greater strain.
            </p>
          </Reveal>
        </div>

        <Reveal y={20} className="mt-16 lg:mt-24">
          <h3 className="mx-auto max-w-2xl text-balance text-center font-serif font-normal uppercase tracking-normal text-xl leading-snug lg:text-2xl">
            24 Years Old. But What State Is Your System In?
          </h3>
        </Reveal>
        {/* Spaced Arch: a plain gapped flex row, no negative margins, no
           absolute positioning, no elevated z-index — every card gets
           real, physical space from its neighbors regardless of
           breakpoint. gap-8 lg:gap-16 widens the gap again once there's
           real room for it; md:mt-16 gives the tilted cards clearance below the
           subhead.
           md:items-stretch, not md:items-center — a real, confirmed
           mismatch this fixes: centering let each card size itself off
           its OWN content, so card 01 (the longest body copy) stood
           taller than 02 and 03, reading as uneven/misaligned rather
           than a uniform set of three. Flex's own default cross-axis
           behavior is stretch, so removing the override (rather than
           setting a fixed height by hand) is what makes every card match
           the row's tallest card automatically, including if the copy
           ever changes later. */}
        <div className="mt-10 flex flex-col items-center gap-6 md:mt-16 md:flex-row md:items-stretch md:justify-center md:gap-8 lg:gap-16">
          {STRESS_AGE_STATES.map((step, i) => (
            <MethodCard key={step.age} step={step} index={i} isMobile={isMobile} reduceMotion={reduceMotion} />
          ))}
        </div>

        <div className="mt-16 grid gap-8 border-t border-line-dark pt-12 lg:mt-24 lg:grid-cols-12 lg:gap-14 lg:pt-16">
          <Reveal y={20} className="lg:col-span-5">
            <h3 className="text-balance font-serif font-normal uppercase tracking-normal text-2xl leading-tight lg:text-3xl">
              It&rsquo;s Not Your Biological Age.
            </h3>
          </Reveal>
          <Reveal y={20} delay={0.1} className="lg:col-span-6 lg:col-start-7">
            <p className="text-pretty text-lg text-cream/75">
              Stress Age is a wellness estimate, not a diagnosis and not a
              measure of how many years stress has added to your life.
            </p>
            <p className="mt-4 text-pretty text-base text-cream/65">
              It is designed to help make changes in your recovery pattern
              easier to see and understand over time.
            </p>
            <p className="mt-4 text-pretty text-base italic text-cream/55">
              Think of it as a trend, not a verdict.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
