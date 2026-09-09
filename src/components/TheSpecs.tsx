"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  BatteryCharging,
  Bluetooth,
  Ruler,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { useIsMobile } from "@/lib/useIsMobile";
import { Reveal } from "@/components/Reveal";
import { TheSpecsSceneClient } from "@/components/TheSpecsSceneClient";

// Values are all placeholders pending the real spec doc — this exists to
// give the section its real shape now (the Leader Line Annotation system)
// rather than a row of five identical "To be confirmed" entries, and to
// already be in the right shape to fill in real values later with no
// restructuring. (The old fixed "value" line — always literally "To be
// confirmed" — is intentionally no longer rendered at all: this refactor's
// card only shows a title + description, and a prominent placeholder in a
// now much more polished card read worse than just omitting it. Trivial to
// reintroduce once real numbers exist.)
//
// Sixth layout for this section this session: click-through tabs, a tall
// scroll-spy stack, a bento grid, an editorial hover showcase, a reticle
// ring with a fixed bottom data panel (all scrapped per direct feedback),
// now a Leader Line Annotation system — floating glass cards expand
// in place next to each reticle, connected to the model by a hand-drawn-
// style leader line, the same annotation language real product pages use.
//
// `rotation` is a best-effort, stylized mapping, not a literal feature
// callout — this model (see Band.tsx) has no separate geometry for
// charging contacts or a sensor window, so "Battery"/"Sensors" pick the
// angle that would show that area on a real band (underside, back face)
// rather than pointing at any actual mesh. `anchor` (the leader line's
// target point) is the same kind of best-effort stylized placement — a
// percentage position within the section's own box, chosen to land
// somewhere plausible on the model's silhouette for that feature, not a
// true 3D-to-2D projection onto real per-feature geometry (there isn't
// any to project onto). This is deliberately simpler than wiring up
// drei's <Html> + camera projection for exactly that reason: the model
// doesn't move in screen space (camera and model position are both
// fixed — only rotation changes when a spec is selected, see
// TheSpecsScene.tsx), so a fixed 2D anchor is just as honest as a
// projected one would be, at a fraction of the complexity and render
// cost.
type Side = "left" | "right";
type Spec = {
  label: string;
  icon: LucideIcon;
  detail: string;
  rotation: { x: number; y: number };
  side: Side;
  /** % position (of the section's own box) the leader line points to. */
  anchor: { left: number; top: number };
};

const specs: Spec[] = [
  {
    label: "Sensors",
    icon: Activity,
    detail: "The onboard sensor suite that reads the raw physiological signal.",
    rotation: { x: 0.25, y: Math.PI },
    side: "left",
    anchor: { left: 44, top: 60 },
  },
  {
    label: "Battery",
    icon: BatteryCharging,
    detail: "Rated runtime per charge, plus typical charging time.",
    rotation: { x: 1.3, y: 0.1 },
    side: "left",
    anchor: { left: 58, top: 60 },
  },
  {
    label: "Connectivity",
    icon: Bluetooth,
    detail: "How the band stays paired to the app, and how far it reaches.",
    rotation: { x: 0.3, y: -0.9 },
    side: "left",
    anchor: { left: 49, top: 39 },
  },
  {
    label: "Dimensions",
    icon: Ruler,
    detail: "Weight, module size, and strap sizing range.",
    rotation: { x: 0.15, y: Math.PI / 2 },
    side: "right",
    anchor: { left: 63, top: 50 },
  },
  {
    label: "Compatibility",
    icon: Smartphone,
    detail: "Supported phones and operating system versions.",
    rotation: { x: 0.3, y: 0 },
    side: "right",
    anchor: { left: 51, top: 51 },
  },
];

// lg:left-16/right-16 (64px) — this section's ORIGINAL inset, back when
// the only thing living in the rail was a 56px circle — is a real,
// confirmed bug once a w-64 (256px) card has to grow further outward
// from there: 64px of margin can't hold a 256px card + a 1rem gap
// (needs >=272px), so the card blew straight past the section's own
// overflow-hidden edge and was clipped down to a sliver, confirmed live
// via screenshot. lg:left-80/right-80 (320px) leaves a real 48px buffer
// beyond that minimum at the narrowest width this still applies to
// (1024px, the lg breakpoint itself) — sm and below are unaffected,
// since the card is a normal-flow stacked block there, never absolutely
// positioned against the viewport edge (see the per-spec card's own
// doc comment).
const RAIL_SIDE_CLASSNAMES: Record<Side, string> = {
  left: "left-4 sm:left-8 lg:left-80",
  right: "right-4 sm:right-8 lg:right-80",
};

/** Below this width there's no real margin for a card to expand into (the
 *  rail sits only 16-32px from the viewport edge below `lg`) — see the
 *  per-spec card's own doc comment for the full reasoning and what
 *  happens instead. Matches Tailwind's own `lg` breakpoint (1024px) so
 *  the JS-driven branch here and the `lg:` CSS classes below never
 *  disagree about where the line falls. */
const ANNOTATION_BREAKPOINT_PX = 1023;

type LinePoint = { x1: number; y1: number; x2: number; y2: number };

export function TheSpecs() {
  const [active, setActive] = useState(0);
  const reduceMotion = useSafeReducedMotion();
  const isMobile = useIsMobile();
  const isNarrow = useIsMobile(ANNOTATION_BREAKPOINT_PX);
  const activeSpec = specs[active];

  const sectionRef = useRef<HTMLElement>(null);
  const anchorRefs = useRef<Array<HTMLDivElement | null>>([]);
  const activeCardRef = useRef<HTMLDivElement | null>(null);
  const [linePoint, setLinePoint] = useState<LinePoint | null>(null);

  /** Measures the CURRENT active card's edge (nearest the model) and its
   *  spec's anchor marker, both relative to the section's own box, and
   *  stores the result as plain SVG coordinates — no live 3D projection,
   *  no per-frame work, just two getBoundingClientRect() reads. Called
   *  once the active card has finished animating INTO its resting
   *  position (via the card's own onAnimationComplete below), not
   *  during the transition — a line chasing a still-moving card reads as
   *  janky, not "elegant"; settling first, then drawing the line in
   *  cleanly on top of a static composition, is what actually reads as
   *  deliberate. */
  function measureLine(specIndex: number) {
    const sectionRect = sectionRef.current?.getBoundingClientRect();
    const cardRect = activeCardRef.current?.getBoundingClientRect();
    const anchorRect = anchorRefs.current[specIndex]?.getBoundingClientRect();
    if (!sectionRect || !cardRect || !anchorRect) return;
    const side = specs[specIndex].side;
    const x1 = (side === "left" ? cardRect.right : cardRect.left) - sectionRect.left;
    const y1 = cardRect.top + cardRect.height / 2 - sectionRect.top;
    const x2 = anchorRect.left + anchorRect.width / 2 - sectionRect.left;
    const y2 = anchorRect.top + anchorRect.height / 2 - sectionRect.top;
    setLinePoint({ x1, y1, x2, y2 });
  }

  // Reduced motion skips the card's own enter transition entirely (see
  // the card's own initial/animate below), so there's no
  // onAnimationComplete to hang the FIRST measurement off — this runs it
  // directly instead. Also the one place that keeps the line in sync
  // with a window resize/orientation change while a card is already
  // settled (the active card and anchor haven't remounted, just moved).
  useLayoutEffect(() => {
    if (isNarrow) return;
    if (reduceMotion) measureLine(active);
    function onResize() {
      measureLine(active);
    }
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    if (sectionRef.current) ro.observe(sectionRef.current);
    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [active, isNarrow, reduceMotion]);

  function selectSpec(index: number) {
    if (index === active) return;
    setActive(index);
    // Clears the OLD line immediately (same tick as the active change,
    // so nothing stale ever paints) rather than leaving it pointing at
    // the wrong anchor until the new card settles and remeasures.
    setLinePoint(null);
  }

  const dogleg = linePoint
    ? `M ${linePoint.x1} ${linePoint.y1} L ${(linePoint.x1 + linePoint.x2) / 2} ${linePoint.y1} L ${linePoint.x2} ${linePoint.y2}`
    : "";

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden bg-navy text-cream"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_50%_45%,color-mix(in_oklab,var(--color-gold)_14%,transparent),transparent_70%)]"
      />

      <Reveal
        y={20}
        className="relative z-10 mx-auto max-w-2xl px-6 pt-20 text-center lg:pt-28"
      >
        <h2 className="text-balance font-serif text-3xl leading-tight lg:text-4xl">The Specs</h2>
        <p className="mx-auto mt-4 max-w-md text-pretty text-lg text-cream/70">
          The detail for those who want it.
        </p>
      </Reveal>

      {/* The 3D core — dead center, first in the absolutely-positioned
         layer so the reticles/anchors/line below simply paint on top
         with no z-index arithmetic needed against it specifically (only
         against each other, where it matters). */}
      <div className="absolute inset-0">
        <TheSpecsSceneClient
          reduceMotion={reduceMotion}
          isMobile={isMobile}
          targetRotation={activeSpec.rotation}
        />
      </div>

      {/* Anchor markers — one per spec, an invisible measurement target
         at rest (aria-hidden, no visual footprint of its own beyond the
         dot below) sitting at that spec's stylized point on the model
         (see the Spec type's own doc comment). Only the ACTIVE one shows
         a small gold pulse, echoing the reticle's own active-state
         treatment so the two ends of the leader line read as one
         deliberate pair rather than two unrelated dots. Skipped below
         `lg` entirely — no line ever points at these there, see the
         per-spec card's own doc comment. */}
      {!isNarrow &&
        specs.map((spec, i) => (
          <div
            key={spec.label}
            ref={(el) => {
              anchorRefs.current[i] = el;
            }}
            aria-hidden="true"
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${spec.anchor.left}%`, top: `${spec.anchor.top}%` }}
          >
            <motion.span
              animate={{ scale: i === active ? 1 : 0, opacity: i === active ? 1 : 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.25 }}
              className="block size-2 rounded-full bg-gold shadow-[0_0_10px_2px_color-mix(in_oklab,var(--color-gold)_55%,transparent)]"
            />
          </div>
        ))}

      {/* The leader line itself — a single dogleg path (a short flat
         segment off the card's edge, then a straight run to the model),
         the same "elbow" shape real product-annotation lines use rather
         than a plain diagonal. `pathLength` 0->1 is framer-motion's
         built-in SVG line-draw trick (it manages the underlying
         stroke-dasharray/-dashoffset math itself); `key={activeSpec.label}`
         means switching specs unmounts the old path and mounts a
         genuinely new one, so the draw-in restarts cleanly at 0 instead
         of interpolating between two unrelated lines (which would sweep
         across the model in a way that reads as broken, not
         deliberate). No exit transition to protect — `linePoint` itself
         is cleared the instant a new spec is selected (see selectSpec),
         so the outgoing line simply disappears along with it rather
         than needing its own animated handoff. */}
      {!isNarrow && linePoint && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
        >
          <motion.path
            key={activeSpec.label}
            d={dogleg}
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth={1}
            strokeOpacity={0.45}
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
      )}

      {/* The reticles — flanking left/right, loosely ringing the model
         rather than tracing its literal silhouette. One rail per side —
         `top`+`bottom` (no explicit height) makes each rail's box always
         exactly fill the safe gap between the heading and the section's
         own bottom edge, and `justify-between` spreads that side's
         reticles evenly inside it. bottom-[100px] (was bottom-[330px]) —
         that much larger inset existed solely to clear the old fixed
         bottom data panel; with the panel gone (its content now lives in
         each reticle's own expanding card instead) the rail can use
         nearly the section's full height. */}
      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          className={cn(
            "absolute top-[200px] bottom-[100px] z-20 flex flex-col items-center justify-between",
            RAIL_SIDE_CLASSNAMES[side]
          )}
        >
          {specs.map((spec, i) => {
            if (spec.side !== side) return null;
            const isActive = i === active;
            const Icon = spec.icon;
            return (
              <div key={spec.label} className="relative flex flex-col items-center">
                <motion.button
                  type="button"
                  aria-pressed={isActive}
                  aria-label={spec.label}
                  onClick={() => selectSpec(i)}
                  whileHover={{ scale: reduceMotion ? 1 : 1.08 }}
                  whileTap={{ scale: reduceMotion ? 1 : 0.94 }}
                  animate={{
                    borderColor: isActive
                      ? "var(--color-gold)"
                      : "color-mix(in oklab, var(--color-cream) 20%, transparent)",
                  }}
                  transition={{ duration: reduceMotion ? 0 : 0.2 }}
                  // size-11, not the usual size-14, below `sm` — client
                  // feedback, live (screenshot at 425×748): full-size
                  // reticles read as too dense/tight at that width.
                  className="relative z-10 flex size-11 items-center justify-center rounded-full border bg-white/5 backdrop-blur-sm sm:size-14"
                >
                  {/* At rest this IS the whole node — "just the small
                     circular node" — with just its icon for minimal
                     affordance about what it represents; the label and
                     description only exist inside the expanded card
                     below, never as a persistent caption underneath. */}
                  <Icon
                    className={cn(
                      "size-4 transition-colors duration-300 sm:size-5",
                      isActive ? "text-gold" : "text-cream/50"
                    )}
                    aria-hidden="true"
                  />
                </motion.button>

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      ref={activeCardRef}
                      key="card"
                      onAnimationComplete={() => measureLine(i)}
                      initial={
                        reduceMotion
                          ? false
                          : { opacity: 0, scale: 0.92, x: side === "left" ? 10 : -10 }
                      }
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.92 }}
                      transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                      // The expand-in-place mechanic: below `lg` this is
                      // a normal-flow block stacked under the circle
                      // (centered, capped width) — there's no real
                      // margin for edge-anchored growth that close to
                      // the viewport edge (see ANNOTATION_BREAKPOINT_PX's
                      // own comment). At `lg:` and up it becomes
                      // absolutely positioned against THIS spec's own
                      // wrapper (`relative` above), pinned on the edge
                      // nearest the circle and growing away from it —
                      // `right/left: calc(100% + gap)` anchors that near
                      // edge exactly one gap outside the circle, so
                      // increasing the card's own width only ever moves
                      // its FAR edge further out, never the near one.
                      // That's what makes "expand to the left/right"
                      // true in the literal sense: the side facing the
                      // model never moves, only the outer side grows.
                      className={cn(
                        "z-10 mt-3 w-44 rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-md sm:w-52",
                        side === "left"
                          ? "lg:absolute lg:top-1/2 lg:right-[calc(100%+1rem)] lg:mt-0 lg:w-64 lg:-translate-y-1/2 lg:text-right"
                          : "lg:absolute lg:top-1/2 lg:left-[calc(100%+1rem)] lg:mt-0 lg:w-64 lg:-translate-y-1/2 lg:text-left"
                      )}
                    >
                      <h3 className="text-xs font-medium tracking-[0.2em] text-gold uppercase">
                        {spec.label}
                      </h3>
                      <p className="mt-2 text-pretty text-sm text-cream/70">{spec.detail}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}
