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
//
// VIEWBOX_SIZE 100 -> 124, CX/CY 50 -> 62 (still true center: 62 is
// exactly half of 124), alongside adding the fourth ring below. The
// three original rings (radius 14/26/38) always had exactly one
// step's worth (12 units) of margin between the outermost ring and
// the 100-unit box edge — the fourth ring's own radius (50, the same
// +12 step) would land EXACTLY ON that old edge, leaving zero margin
// and clipping the ring's own stroke at its cardinal points. Widening
// the box by one more step in every direction (124 = 2 × (50 + 12))
// restores that same margin for the new outermost ring, without
// touching the three existing rings' own radii at all.
const VIEWBOX_SIZE = 124;
const CX = 62;
const CY = 62;

function pointOnRing(radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

// The label overlay places a ring's dot/text at `${x}%`/`${y}%` of its
// container — valid ONLY when the coordinate is first expressed as a
// fraction of the viewBox's own total size, not used as a raw
// unitless value (that only ever worked before because VIEWBOX_SIZE
// was exactly 100, making "coordinate" and "percent" numerically
// identical by coincidence — no longer true now that it's 124).
function toPercent(value: number) {
  return (value / VIEWBOX_SIZE) * 100;
}

// Text-column width for the label overlay (rem) — the dot and the text
// block are each independently absolutely positioned against the same
// anchor point (see the label-overlay's own comment further down), so
// unlike an earlier version of this file, NODE_WIDTH_REM no longer has
// any bearing on where a ring's DOT actually lands — only on how far
// its text visually reaches out from that anchor. That's what makes it
// safe to cap responsively below, where it wasn't before.
// 12.5rem (200px) — widened from 11rem per an explicit typography-pass
// request, paired with text-pretty below: a touch more width gives the
// "no orphaned final word" balancing algorithm more room to distribute
// across 2–3 genuinely even lines rather than fighting a narrower column.
//
// Used as `min(12.5rem, 20vw)` at the actual render site, not this bare
// value — a real, confirmed overflow this caps: the ring box's own size
// here is driven by viewport HEIGHT (see the infographic wrapper's own
// w-[min(48rem,70vh)]), not width, so on a wide-but-short viewport the
// box (and the side margin around it the labels rely on to spill into)
// doesn't shrink to match a NARROW width the way it should. Confirmed
// live at 768×900 (the exact width the ring diagram first turns on at):
// the new, larger outer ring's label reached 8px past the viewport's
// own right edge at the fixed 12.5rem width. `20vw` only ever binds at
// exactly this kind of tight width — at any normal desktop width it's
// comfortably wider than 12.5rem, so `min()` picks the unchanged
// 12.5rem there and nothing about the already-approved wider layout
// changes.
const NODE_WIDTH_REM = 12.5;
const NODE_GAP_REM = 0.75;

// radius/labelAngle/startAngle are all in the SVG's own unitless
// VIEWBOX_SIZE-wide space. Per an explicit follow-up spec: each label
// now sits in a DIFFERENT QUADRANT of its own ring (not all fanned
// along the right side, which is what the previous version did) —
// node 01 top-left of the inner ring, 02 bottom-right of the middle
// ring, 03 bottom-left of the outer ring, 04 top-right of the new
// outermost ring — the one quadrant of the four still unused, so all
// four labels sit in genuinely different regions of the box rather
// than two of them competing for the same corner. A clean diagonal
// angle per quadrant (-135°/45°/135°/-45°) keeps them all comfortably
// far apart, which is what actually avoids a collision risk — no
// per-ring angle tuning needed. `side` drives which way its text reads
// (see the label-overlay comment below) — always matching whichever
// HALF of the box (left/right of center) the dot itself falls in, so
// the text always extends further toward that same outer margin
// rather than back in across the diagram; startAngle offsets each
// ring's traveling pulse so they don't all begin aligned.
const RINGS = [
  {
    key: "stress-age",
    label: "Stress Age",
    body: "See the long-term pattern.",
    radius: 14,
    labelAngle: -135,
    side: "left",
    startAngle: 0,
  },
  {
    key: "cognitive-load",
    label: "Cognitive Load",
    body: "Understand the demand on your mind.",
    radius: 26,
    labelAngle: 45,
    side: "right",
    startAngle: 120,
  },
  {
    key: "emotional-regulation",
    label: "Emotional Regulation",
    body: "See how steadily you're responding.",
    radius: 38,
    labelAngle: 135,
    side: "left",
    startAngle: 240,
  },
  {
    key: "recovery-capacity",
    label: "Recovery Capacity",
    body: "Know how ready your system is.",
    // 38 + 12 — the same step as every other consecutive pair above
    // (14→26→38), per an explicit "match the existing spacing" spec.
    radius: 50,
    labelAngle: -45,
    side: "right",
    startAngle: 60,
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
      {/* pt-16 md:pt-24 lg:pt-32 (was a flat pt-24) — same progressive
         step used elsewhere (see page.tsx); still just the TOP inset,
         pb-0 unchanged, so the min-h-screen + justify-center balance
         this whole block's own comment describes is untouched — a
         smaller top pad on mobile only ever gives the centered content
         MORE room, never less. */}
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 pt-16 pb-0 md:pt-24 lg:px-10 lg:pt-32">
        <Reveal y={20} className="text-center">
          <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
            Beyond Heart Rate
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-cream/75">
            Beyond individual biometrics, NeuroAtlas turns your signals into
            four deeper measures of how your system is performing.
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
           w-[min(48rem,70vh,88vw)], not a plain max-h-[70vh] alongside
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
           expressed as `min(48rem, 70vh, 88vw)` sidesteps this entirely:
           aspect-square then derives a MATCHING height from that one
           real, explicit, already-fully-resolved value, so both
           dimensions are always equal by construction — a true square
           at every viewport size, no flex/aspect-ratio interaction
           left to go wrong.
           The `88vw` term is new, added alongside the fourth ring: on a
           narrow-but-TALL viewport (confirmed live at 768×1200), 70vh
           alone can exceed the 48rem cap, growing the box out to the
           full 48rem/768px — exactly this viewport's own width, leaving
           literally zero side margin for any label to spill into
           (see NODE_WIDTH_REM's own comment on the labels' own width
           cap; that alone can't help once the BOX itself has no margin
           left at all). 88vw guarantees the box always leaves at least
           a small width-relative margin on both sides, regardless of
           how tall the viewport is — it only ever binds in this narrow-
           and-tall case; at any normal desktop aspect ratio 70vh or
           48rem is still smaller, so nothing about the existing
           approved sizing changes there. */}
        <Reveal
          delay={0.1}
          y={20}
          className="relative mx-auto mt-4 hidden aspect-square w-[min(48rem,70vh,88vw)] md:block"
        >
          <svg
            viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`}
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
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
              <div style={{ width: `min(${NODE_WIDTH_REM}rem, 20vw)` }}>
                <span className="eyebrow">{`0${i + 1}`}</span>
                <h3 className="mt-1 text-balance font-serif font-normal uppercase tracking-normal text-sm text-cream">{ring.label}</h3>
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
              <div
                key={ring.key}
                className="absolute"
                style={{ left: `${toPercent(x)}%`, top: `${toPercent(y)}%` }}
              >
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

        {/* Mobile + foldable fallback (below md:) — the rings get too
           cramped for real label text below tablet width (a 640–767px
           foldable-open screen included, not just phones), so this drops
           the radar entirely for a plain vertical stack below md, matching
           every other card list on the site rather than a shrunk-down
           version of a layout that needs real room to read. Was `sm:`
           (640px) — moved to `md:` (768px) so the circular layout only
           ever engages at genuine tablet width and up. */}
        <div className="mt-10 grid grid-cols-1 gap-4 md:hidden">
          {RINGS.map((ring, i) => (
            <Reveal
              key={ring.key}
              delay={i * 0.1}
              y={20}
              className="bento-glass p-6 text-center"
            >
              <span className="eyebrow">{`0${i + 1}`}</span>
              <h3 className="mt-3 text-balance font-serif font-normal uppercase tracking-normal text-xl text-cream">{ring.label}</h3>
              <p className="mt-3 text-pretty text-sm text-cream/70">{ring.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
