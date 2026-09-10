"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/useIsMobile";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

// Rebuilt per the client's own hand-drawn sketch: a "fanned" layout —
// three overlapping cards, the outer two tilted outward like a hand of
// cards, the center one straight, elevated, and stacked on top. This
// replaces the previous upward-arc version (see this file's own git
// history) — a different, more literal reading of "arc" than that one.
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

// Per-card resting fan target (index 0 = left, 1 = center/hero card,
// 2 = right) — rotate in degrees, y in px (translate-y-8 / -translate-y-4
// equivalents), z stacking, and startX: how far this card sits from its
// own resting spot in the pre-animation "closed fan" state (canceled
// back to 0 as it fans open — see MethodCard's own comment).
const FAN = [
  { rotate: -8, y: 32, z: 0, startX: 96 },
  { rotate: 0, y: -16, z: 10, startX: 0 },
  { rotate: 8, y: 32, z: 0, startX: -96 },
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

  // Resting state: the tilted fan on sm:+, a plain flat stack on mobile
  // (rotate 0, no horizontal offset) — per the client's own mobile
  // fallback spec. `y` (the vertical droop/elevation) is likewise only
  // applied on sm:+; it's set via a plain `style` value below rather
  // than animated — the brief's own "initial state" only calls out
  // opacity/rotate/x as starting points, not y, so this card is already
  // sitting at its final height even before it fans open.
  const restRotate = isMobile ? 0 : fan.rotate;
  const restY = isMobile ? 0 : fan.y;

  // Entrance state: on sm:+, every card starts perfectly straight
  // (rotate 0) and pulled in toward the center card's own x position
  // (`startX`, canceled back to 0 as it settles) — reads as "closed",
  // fanning open into its tilted resting spot as it scrolls into view.
  // On mobile there's no fan to open FROM, so this is a plain fade (no
  // rotate/x motion at all) — reduceMotion collapses it the same way,
  // for the same reason (an initial state identical to the resting one
  // means nothing actually animates, without conditionally omitting
  // initial/whileInView's shape — see Reveal.tsx's own comment on why
  // that specific pattern matters for this codebase).
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
      // border and inset-highlight glow. index 1 (the hero card) gets a
      // static z-10 — harmless at mobile's flat stack (nothing to
      // overlap there), and what actually lets it render on top of the
      // tilted side cards' inner edges on sm:+.
      className={cn(
        "card-glass w-full bg-transparent p-4 text-center sm:w-72 sm:p-8 sm:text-left",
        index === 1 && "z-10"
      )}
    >
      <span className="eyebrow">{`0${index + 1}`}</span>
      <h3 className="mt-3 text-balance font-serif text-xl text-cream">{step.label}</h3>
      <p className="mt-3 text-pretty text-base text-cream/70">{step.body}</p>
    </motion.div>
  );
}

export function MethodScrollCards() {
  // 639, not the default 767 (Tailwind's `md`) — this section's own
  // mobile fallback is explicitly "sm and below" (below the 640px `sm:`
  // breakpoint), one narrower than every other `useIsMobile()` caller
  // on this site relies on. See useIsMobile.ts's own comment.
  const isMobile = useIsMobile(639);
  const reduceMotion = useSafeReducedMotion();

  return (
    <section id="the-method" className="dark-glow bg-navy-soft text-cream">
      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24 lg:px-10 lg:py-32">
        <Reveal y={20}>
          <h2 className="text-center text-balance font-serif text-2xl leading-tight sm:text-3xl lg:text-4xl">
            Measure. Intervene. Measure.
          </h2>
        </Reveal>
        {/* flex, not grid — "sit tightly together" (per spec) means the
           outer two cards actually need to OVERLAP the center one, which
           a plain grid's own column tracks don't allow; the negative
           margin below does. sm:gap-0 clears the mobile gap-6 (mobile
           has no overlap to make it redundant with) once the negative
           margins take over. */}
        <div className="mt-10 flex flex-col items-center gap-6 sm:mt-24 sm:flex-row sm:items-center sm:justify-center sm:gap-0">
          {methodSteps.map((step, i) => (
            <div key={`${step.label}-${i}`} className={cn(i !== 1 && "sm:-mx-6")}>
              <MethodCard step={step} index={i} isMobile={isMobile} reduceMotion={reduceMotion} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
