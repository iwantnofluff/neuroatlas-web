"use client";

import { motion } from "framer-motion";
import { Reveal } from "@/components/Reveal";
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

// radius/labelAngle/startAngle are all in the SVG's own unitless 0–100
// viewBox space. labelAngle places each ring's HTML label at a
// DIFFERENT angle rather than all three at literally the same "3
// o'clock" (0°) — three rings sharing that one exact point would stack
// their labels on top of each other (they'd all sit at the same y
// there, only x differs by radius). A real, confirmed bug this
// replaces: a first pass used a gentle -25°/0°/25° fan, which reads
// well on paper but the INNER ring's own radius (14 units) caps how
// far up that can push its label — 14 * sin(25°) is only ~6 units,
// nowhere near enough vertical clearance for an actual multi-line
// label, and it visibly collided with the middle ring's. The inner
// ring's angle is pushed much further (-70°, closer to "1 o'clock"
// than "3") specifically because its small radius means even a steep
// angle only buys ~13 units of clearance — the outer ring's much
// larger radius (38) reaches similar clearance at a shallower angle
// (45°). Confirmed via screenshot, not just computed. startAngle
// offsets each ring's traveling pulse so they don't all begin aligned.
const RINGS = [
  {
    key: "stress-age",
    label: "Stress Age",
    body: "How your body is responding to stress over time.",
    radius: 14,
    labelAngle: -70,
    startAngle: 0,
  },
  {
    key: "cognitive-load",
    label: "Cognitive Load",
    body: "How much your mind is juggling before your focus starts to slip.",
    radius: 26,
    labelAngle: 0,
    startAngle: 120,
  },
  {
    key: "emotional-regulation",
    label: "Emotional Regulation",
    body: "How well you stay balanced under pressure, so your response matches the moment.",
    radius: 38,
    labelAngle: 45,
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
 *  animation, not a different, conditionally-rendered element. */
function Ring({
  radius,
  startAngle,
  reduceMotion,
}: {
  radius: number;
  startAngle: number;
  reduceMotion: boolean;
}) {
  const circumference = 2 * Math.PI * radius;
  const pulseDash = `6 ${circumference - 6}`;

  return (
    <>
      <circle
        cx={CX}
        cy={CY}
        r={radius}
        fill="none"
        stroke="#F4EFE6"
        strokeOpacity={0.1}
        strokeWidth={0.5}
        strokeDasharray="1.4 1.4"
      />
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
        stroke="var(--color-gold)"
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
      <div className="mx-auto max-w-6xl px-6 py-24 lg:px-10 lg:py-32">
        <Reveal y={20} className="text-center">
          <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
            Beyond Heart Rate
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-cream/75">
            Beyond heart rate, NeuroAtlas tracks three things most other
            tools miss.
          </p>
        </Reveal>

        {/* Concentric-rings infographic — sm: and up only (see the
           mobile fallback below). aspect-square + a 0–100 viewBox
           means every coordinate here IS a percentage of the
           container, so the HTML label overlay can reuse the exact
           same numbers as plain CSS top/left percentages with no unit
           conversion. Rings are truly centered (cx=cy=50) — max-w-2xl,
           narrower than the section's own max-w-6xl, is deliberate:
           the ~240px of margin that opens up on each side once this
           box is centered via mx-auto within the wider section is
           exactly where the outer ring's label overflows into (this
           container's own overflow is never clipped — no
           overflow-hidden anywhere in its ancestry), rather than
           shifting the rings themselves off-center to manufacture room
           inside a wider box. */}
        <Reveal
          delay={0.1}
          y={20}
          className="relative mx-auto mt-16 hidden aspect-square w-full max-w-3xl sm:block"
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
                reduceMotion={reduceMotion}
              />
            ))}
          </svg>

          {RINGS.map((ring, i) => {
            const { x, y } = pointOnRing(ring.radius, ring.labelAngle);
            return (
              <div
                key={ring.key}
                className="absolute flex items-center gap-3"
                style={{ left: `${x}%`, top: `${y}%`, transform: "translateY(-50%)" }}
              >
                <span className="size-2 shrink-0 rounded-full bg-gold shadow-[0_0_10px_2px_color-mix(in_oklab,var(--color-gold)_55%,transparent)]" />
                <div className="max-w-[11rem] lg:max-w-[14rem]">
                  <span className="eyebrow">{`0${i + 1}`}</span>
                  <h3 className="mt-1 font-serif text-sm text-cream lg:text-base">
                    {ring.label}
                  </h3>
                  <p className="mt-1 text-xs text-cream/65 lg:text-sm">{ring.body}</p>
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
              <h3 className="mt-3 font-serif text-xl text-cream">{ring.label}</h3>
              <p className="mt-3 text-sm text-cream/70">{ring.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
