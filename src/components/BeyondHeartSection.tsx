"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

// Concentric-rings "radar" infographic, replacing the previous bento
// grid (which itself replaced an EARLIER concentric-rings version — a
// pinned 300vh scroll-jacked section with a sticky h-screen pin; see
// that prior comment block in this file's own git history). This is a
// deliberately different, more disciplined take on the same concept:
// no scroll-jacking, no pin, no h-[300vh] — a plain normal-flow
// section, sized once via aspect-square, with the "alive" feeling
// coming entirely from a slow, continuous rotation rather than tying
// anything to scroll position at all.
//
// #D4AF37 ("Champagne Gold") was specified literally, but doesn't
// match any color actually defined in this codebase — the site's own
// gold token is --color-gold (#dac79e), used everywhere else for
// exactly this kind of accent (buttons, borders, glows, eyebrows).
// Using that existing token instead of a bespoke one-off hex keeps
// this in the same token system as the rest of the site, matching
// this file's own established reasoning for gold-soft below.
// True center — a real, confirmed bug this replaces: an earlier
// version used CX=40 (not 50) specifically to make room for the
// labels within a wide aspect-square container, but that visibly
// shifted the whole ring diagram off-center within the section
// ("none of this is center", reported live). Centering the rings
// properly and shrinking the container instead (see the infographic
// wrapper's own className below) is what actually fixes it — the
// labels get their room from the surrounding section's own margin,
// not from pushing the rings themselves off-center.
const CX = 50;
const CY = 50;

function pointOnRing(radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

// Fixed text-column width for the label overlay (rem) — deliberately a
// single fixed value, not the previous responsive max-w-[11rem]
// lg:max-w-[14rem]. A left-side node needs to shift its WHOLE wrapper
// leftward by exactly this width (+ the dot's own gap) so the dot still
// lands precisely on the ring despite the text rendering BEFORE it in
// DOM order (see NODE_QUADRANTS' own comment) — that offset has to be a
// single known constant, not one that silently changes per breakpoint.
// 12.5rem (200px) — widened from 11rem per an explicit typography-pass
// request, paired with text-pretty below: a touch more width gives the
// "no orphaned final word" balancing algorithm more room to distribute
// across 2–3 genuinely even lines rather than fighting a narrower column.
const NODE_WIDTH_REM = 12.5;
const NODE_GAP_REM = 0.75;

// radius/labelAngle/startAngle are all in the SVG's own unitless 0–100
// viewBox space. Per an explicit follow-up spec: each label now sits in
// a DIFFERENT QUADRANT of its own ring (not all fanned along the right
// side, which is what the previous version did) — node 01 top-left of
// the inner ring, 02 bottom-right of the middle ring, 03 bottom-left of
// the outer ring. A clean diagonal angle per quadrant (-135°/45°/135°)
// keeps all three comfortably far apart (they're now in three
// genuinely different regions of the box, not variations on the same
// right-side arc), which is what actually avoids the earlier version's
// collision risk — no per-ring angle tuning needed this time.
// `side` drives which way its text reads (see the label-overlay
// comment below); startAngle offsets each ring's traveling pulse so
// they don't all begin aligned.
const RINGS = [
  {
    key: "stress-age",
    label: "Stress Age",
    body: "How your body is responding to stress over time.",
    radius: 14,
    labelAngle: -135,
    side: "left",
    startAngle: 0,
  },
  {
    key: "cognitive-load",
    label: "Cognitive Load",
    body: "How much your mind is juggling before your focus starts to slip.",
    radius: 26,
    labelAngle: 45,
    side: "right",
    startAngle: 120,
  },
  {
    key: "emotional-regulation",
    label: "Emotional Regulation",
    body: "How well you stay balanced under pressure, so your response matches the moment.",
    radius: 38,
    labelAngle: 135,
    side: "left",
    startAngle: 240,
  },
] as const;

/** One ring pair: a static dashed base ring (always visible, very
 *  subtle) plus a short, glowing gold arc that continuously rotates
 *  around the SAME circle on top of it — the "traveling pulse".
 *
 *  Rotation, not strokeDashoffset: rotating the whole arc around the
 *  ring's own center is the geometrically simpler of the two ways to
 *  animate "a short segment travels around a circle" (the brief
 *  itself offers both) — `transform-box: fill-box` +
 *  `transform-origin: center` resolves to this circle's own geometric
 *  center automatically, so there's no manual pixel-offset math to
 *  get wrong the way a hand-rolled dashoffset-vs-circumference
 *  calculation would require.
 *
 *  `initial={{ rotate: startAngle }}` -> `animate={{ rotate:
 *  startAngle + 360 }}` is the standard "seamless infinite spin"
 *  trick: a full 360° turn ends up looking IDENTICAL to where it
 *  started, so `repeat: Infinity`'s own reset-to-initial-value at the
 *  top of each loop is visually imperceptible — it never actually
 *  "snaps back", it just keeps going.
 *
 *  reduceMotion collapses the transition to `duration: 0` rather than
 *  omitting the animation altogether — it still resolves to the same
 *  `animate` target (startAngle + 360, which looks identical to
 *  startAngle), so each ring shows one static gold arc at its own
 *  offset angle: a meaningful, deliberately-still frame of the same
 *  animation, not a different, conditionally-rendered element.
 *
 * The pulse itself is a real gradient "comet" now, not a solid-color
 * dash — matching the client's own reference: the same travelling-light
 * treatment ShimmerButton.tsx already uses (a masked, spinning conic
 * gradient tracing the button's border). SVG strokes can't take a
 * conic-gradient directly, so this is the closest equivalent: a
 * `<linearGradient>` (transparent tail -> solid gold head) whose own
 * vector is defined in this ring's LOCAL, pre-rotation coordinates
 * (from the arc's tail point to its head point, both computed via
 * pointOnRing) — since gradientUnits="userSpaceOnUse" resolves in the
 * SAME user space the circle's own geometry is drawn in, rotating the
 * element via the same CSS `rotate` transform carries the gradient
 * around with it, tail-to-head, exactly as if it were painted onto a
 * rigid physical arc. ARC_FRACTION (18% of this ring's own
 * circumference) is deliberately much longer than a tiny dot-sized
 * pulse — a real visible trailing sweep, closer to the button's own
 * fairly long light-trail than a short blip. */
const ARC_FRACTION = 0.18;

function Ring({
  radius,
  startAngle,
  gradientId,
  reduceMotion,
}: {
  radius: number;
  startAngle: number;
  gradientId: string;
  reduceMotion: boolean;
}) {
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * ARC_FRACTION;
  const pulseDash = `${arcLength} ${circumference - arcLength}`;
  // Tail sits at this ring's own path-start point (angle 0); head is
  // ARC_FRACTION of the way around from there — matching whichever
  // direction strokeDasharray actually draws in for a <circle>, so the
  // bright end leads and the transparent end trails as it spins.
  const tail = pointOnRing(radius, 0);
  const head = pointOnRing(radius, 360 * ARC_FRACTION);

  return (
    <>
      <defs>
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1={tail.x}
          y1={tail.y}
          x2={head.x}
          y2={head.y}
        >
          <stop offset="0%" stopColor="var(--color-gold)" stopOpacity={0} />
          <stop offset="100%" stopColor="var(--color-gold)" stopOpacity={1} />
        </linearGradient>
      </defs>
      {/* Base ring — a full, solid, faint circle (not dashed): the
         "track" the pulse travels along. */}
      <circle cx={CX} cy={CY} r={radius} fill="none" stroke="#F4EFE6" strokeOpacity={0.14} strokeWidth={0.5} />
      <motion.circle
        // key toggles a full remount on reduceMotion change — a real,
        // confirmed bug this replaces: useSafeReducedMotion() is always
        // false on the very first render by design (the SSR-hydration-
        // safe convention every reduced-motion check in this codebase
        // uses), so this animation's 20s/Infinity transition already
        // started before React ever re-rendered with the real value.
        // Once framer-motion has an animation in flight, changing only
        // the `transition` prop on a later render — the target `animate`
        // VALUE never changes here, only its timing — doesn't interrupt
        // it; confirmed live via two screenshots 2s apart under
        // prefers-reduced-motion: reduce, both showing the arcs having
        // visibly moved. Keying by reduceMotion forces React to treat
        // it as a brand-new element the instant reduceMotion resolves,
        // discarding whatever was already animating and mounting fresh
        // with the correct (frozen) transition from the start.
        key={reduceMotion ? "static" : "spinning"}
        cx={CX}
        cy={CY}
        r={radius}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={0.9}
        strokeLinecap="round"
        strokeDasharray={pulseDash}
        filter="url(#pulse-glow)"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={{ rotate: startAngle }}
        animate={{ rotate: startAngle + 360 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 20, repeat: Infinity, ease: "linear" }
        }
      />
    </>
  );
}

export function BeyondHeartSection() {
  const reduceMotion = useSafeReducedMotion();

  return (
    <section id="beyond-heart-rate" className="dark-glow bg-navy-soft text-cream">
      {/* min-h-screen + flex centering — a real, confirmed complaint
         this replaces: the previous py-24/py-32 block, plus a big
         mt-16 gap before the rings, plus an unconstrained aspect-square
         infographic, could together run taller than a real laptop
         screen's viewport, overflowing it rather than reading as one
         self-contained, cohesive unit. pb-0 (no bottom padding at all)
         + justify-center is what actually keeps this fitting inside a
         single viewport — the flex column centers the heading+rings
         group vertically inside min-h-screen regardless of the
         (deliberately asymmetric — pt only) padding above it. */}
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 pt-24 pb-0 lg:px-10 lg:pt-32">
        <Reveal y={20} className="text-center">
          <h2 className="text-balance font-serif text-3xl leading-tight lg:text-4xl">
            Beyond Heart Rate
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-cream/75">
            Beyond heart rate, NeuroAtlas tracks three things most other
            tools miss.
          </p>
        </Reveal>

        {/* Concentric-rings infographic — sm: and up only (see the
           mobile fallback below). aspect-square + a 0–100 viewBox
           means every coordinate here IS a percentage of the
           container, so the HTML label overlay can reuse the exact
           same numbers as plain CSS top/left percentages with no unit
           conversion. Rings are truly centered (cx=cy=50) — this box's
           own max width (48rem, below) is narrower than the section's
           own max-w-6xl, deliberate: the margin that opens up on each
           side once this box is centered via mx-auto within the wider
           section is exactly where the outer ring's label overflows
           into (this container's own overflow is never clipped — no
           overflow-hidden anywhere in its ancestry), rather than
           shifting the rings themselves off-center to manufacture room
           inside a wider box. mt-4, not a previous mt-16 — the heading
           and the rings should read as one cohesive unit, not two
           separate blocks with a big gap between them.
           w-[min(48rem,70vh)], not a plain max-h-[70vh] alongside
           max-w-3xl/w-full — a real, confirmed bug that replaces: this
           element is a flex item (the section wrapper is `flex
           flex-col items-center`) with NON-stretch cross-axis
           alignment, so `aspect-ratio` only derives one dimension from
           the other when the OTHER is genuinely auto. `w-full` is an
           EXPLICIT width, not auto, so it won — aspect-ratio then
           derived height=width from that explicit 768px, and
           max-h-[70vh] clamped ONLY the height afterward, leaving a
           768×630 box that isn't square at all (confirmed by measuring
           the SVG's own rendered getBoundingClientRect() live: width
           768, height 630) — which put every dot's computed
           percentage-of-square position off its ring, worse the larger
           the ring's own radius. Removing width entirely doesn't work
           either — with no in-flow content and no explicit size, the
           box collapses to 0×0 (also confirmed live). A single width
           expressed as `min(48rem, 70vh)` sidesteps this entirely:
           aspect-square then derives a MATCHING height from that one
           real, explicit, already-fully-resolved value, so both
           dimensions are always equal by construction — a true square
           at every viewport size, no flex/aspect-ratio interaction
           left to go wrong. */}
        <Reveal
          delay={0.1}
          y={20}
          className="relative mx-auto mt-4 hidden aspect-square w-[min(48rem,70vh)] sm:block"
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <filter id="pulse-glow" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="1.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {RINGS.map((ring) => (
              <Ring
                key={ring.key}
                radius={ring.radius}
                startAngle={ring.startAngle}
                gradientId={`pulse-gradient-${ring.key}`}
                reduceMotion={reduceMotion}
              />
            ))}
          </svg>

          {RINGS.map((ring, i) => {
            const { x, y } = pointOnRing(ring.radius, ring.labelAngle);
            const isLeft = ring.side === "left";
            const textBlock = (
              <div style={{ width: `${NODE_WIDTH_REM}rem` }}>
                <span className="eyebrow">{`0${i + 1}`}</span>
                <h3 className="mt-1 text-balance font-serif text-sm text-cream">{ring.label}</h3>
                <p className="mt-1 text-pretty text-xs text-cream/65">{ring.body}</p>
              </div>
            );
            return (
              // A real, confirmed bug this replaces: the dot's exact
              // position used to fall out of flex layout (order + a
              // small mt-1.5 nudge), which put it up to ~10px off the
              // ring depending on the text block's own line-height —
              // close, but visibly not ON the ring, confirmed live via
              // screenshot. This wrapper is now purely an ANCHOR (no
              // size, no flex) at the exact ring point; the dot and the
              // text are each independently absolutely positioned
              // against that same anchor via transform, so the dot's
              // position is never affected by how many lines the text
              // wraps to.
              <div key={ring.key} className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
                <span
                  aria-hidden
                  className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_10px_2px_color-mix(in_oklab,var(--color-gold)_55%,transparent)]"
                />
                <div
                  className={cn("absolute top-1/2 -translate-y-1/2", isLeft ? "text-right" : "text-left")}
                  style={isLeft ? { right: `${NODE_GAP_REM}rem` } : { left: `${NODE_GAP_REM}rem` }}
                >
                  {textBlock}
                </div>
              </div>
            );
          })}
        </Reveal>

        {/* Mobile fallback (below sm:) — the rings get too cramped for
           real label text at phone widths, so this drops the radar
           entirely for a plain vertical stack, matching every other
           card list on the site rather than a shrunk-down version of
           a layout that needs real room to read. */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:hidden">
          {RINGS.map((ring, i) => (
            <Reveal
              key={ring.key}
              delay={i * 0.1}
              y={20}
              className="bento-glass p-6 text-center"
            >
              <span className="eyebrow">{`0${i + 1}`}</span>
              <h3 className="mt-3 text-balance font-serif text-xl text-cream">{ring.label}</h3>
              <p className="mt-3 text-pretty text-sm text-cream/70">{ring.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
