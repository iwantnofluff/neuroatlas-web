"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { useIsMobile } from "@/lib/useIsMobile";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

// Rebuilt again per the client's own explicit "Spaced Arch" spec — the
// previous "fanned hand of cards" version (see this file's own git
// history) deliberately OVERLAPPED the three cards via negative margins
// and a z-10 stacking order; reported live as reading cluttered rather
// than intentional. This version keeps the same outward-tilt-on-the-
// ends/straight-in-the-middle idea, but the cards sit in a plain gapped
// flex row with real space between them (no negative margin, no
// absolute positioning, no elevated z-index) and the ends are pushed
// DOWN while the center is pushed UP, so the three together read as an
// arch rather than an interlocking hand.
const methodSteps = [
  {
    label: "Measure",
    body: "Reads what's happening in your body, from emotional regulation to stress age, to build a clear picture beneath the surface.",
  },
  {
    label: "Intervene",
    body: "A short, simple reset, right where you are.",
  },
  {
    label: "Measure",
    body: "A second reading proves the shift, not just the feeling.",
  },
];

// Per-card resting arch target (index 0 = left, 1 = center, 2 = right)
// — rotate in degrees, y in px (translate-y-16/-translate-y-4
// equivalents), and startX: how far this card sits from its own resting
// spot in the pre-animation "closed" state (canceled back to 0 as it
// settles into the arch — see MethodCard's own comment). The two ends
// share the same +64px (translate-y-16) drop to form the arch's base;
// the center's -16px (-translate-y-4) lift forms the peak.
const FAN = [
  { rotate: -6, y: 64, startX: 96 },
  { rotate: 0, y: -16, startX: 0 },
  { rotate: 6, y: 64, startX: -96 },
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
  step: (typeof methodSteps)[number];
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
      className="card-glass w-full min-w-0 bg-transparent p-4 text-center md:w-auto md:max-w-72 md:flex-1 md:p-6 md:text-left lg:p-8"
    >
      <span className="eyebrow">{`0${index + 1}`}</span>
      <h3 className="mt-3 text-balance font-serif text-xl text-cream">{step.label}</h3>
      <p className="mt-3 text-pretty text-base text-cream/70">{step.body}</p>
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
    <section id="the-method" className="dark-glow bg-navy-soft text-cream">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24 lg:px-10 lg:py-32">
        <Reveal y={20}>
          <h2 className="text-center text-balance font-serif text-2xl leading-tight sm:text-3xl lg:text-4xl">
            Measure. Intervene. Measure.
          </h2>
        </Reveal>
        {/* Spaced Arch: a plain gapped flex row, no negative margins, no
           absolute positioning, no elevated z-index — every card gets
           real, physical space from its neighbors regardless of
           breakpoint. gap-8 lg:gap-16 widens the gap again once there's
           real room for it; md:mt-24 keeps this section's own extra
           top-clearance (unchanged from the previous fanned version). */}
        <div className="mt-10 flex flex-col items-center gap-6 md:mt-24 md:flex-row md:items-center md:justify-center md:gap-8 lg:gap-16">
          {methodSteps.map((step, i) => (
            <MethodCard key={`${step.label}-${i}`} step={step} index={i} isMobile={isMobile} reduceMotion={reduceMotion} />
          ))}
        </div>
      </div>
    </section>
  );
}
