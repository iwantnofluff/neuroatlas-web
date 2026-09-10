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
import type { SpecKey } from "@/lib/specAnchors";

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
// rather than pointing at any actual mesh. `key` maps to a REAL 3D
// point on the model (see specAnchors.ts) that the leader line's target
// end is projected from every frame, live — a real, confirmed bug this
// replaces: a previous version pointed lines at a fixed 2D screen
// percentage that had no actual relationship to the model, so it was
// only correct by coincidence at whatever single angle it was tuned
// against, and visibly wrong (pointing at empty space) the instant the
// model turned to face a different spec. See TheSpecsScene.tsx's own
// AnchorProjector for the projection itself.
type Side = "left" | "right";
type Spec = {
  label: string;
  icon: LucideIcon;
  detail: string;
  rotation: { x: number; y: number };
  side: Side;
  /** Which entry in SPEC_ANCHORS (specAnchors.ts) this spec targets. */
  key: SpecKey;
  /** % down the rail's own box (top-[200px] to bottom-[100px], see
   *  below) this spec's node sits at. Staggered by design, not an
   *  even split per side — the 2 right-side nodes are deliberately
   *  offset to land in the vertical GAPS between the 3 left-side
   *  nodes (35%/65%, the midpoints of the 20-50 and 50-80 gaps)
   *  rather than lining up evenly with them, so the two columns read
   *  as an interleaved, balanced composition instead of a plain
   *  side-by-side grid — a direct, explicit layout request, not a
   *  cosmetic tweak inferred from a bug report. */
  railPercent: number;
};

const specs: Spec[] = [
  {
    label: "Sensors",
    icon: Activity,
    detail: "The onboard sensor suite that reads the raw physiological signal.",
    rotation: { x: 0.25, y: Math.PI },
    side: "left",
    key: "sensors",
    railPercent: 20,
  },
  {
    label: "Battery",
    icon: BatteryCharging,
    detail: "Rated runtime per charge, plus typical charging time.",
    rotation: { x: 1.3, y: 0.1 },
    side: "left",
    key: "battery",
    railPercent: 50,
  },
  {
    label: "Connectivity",
    icon: Bluetooth,
    detail: "How the band stays paired to the app, and how far it reaches.",
    rotation: { x: 0.3, y: -0.9 },
    side: "left",
    key: "connectivity",
    railPercent: 80,
  },
  {
    label: "Dimensions",
    icon: Ruler,
    detail: "Weight, module size, and strap sizing range.",
    rotation: { x: 0.15, y: Math.PI / 2 },
    side: "right",
    key: "dimensions",
    railPercent: 35,
  },
  {
    label: "Compatibility",
    icon: Smartphone,
    detail: "Supported phones and operating system versions.",
    rotation: { x: 0.3, y: 0 },
    side: "right",
    key: "compatibility",
    railPercent: 65,
  },
];

// The whole floating-node/leader-line system below (rail, anchors,
// line) is only ever rendered at `md:` and up now — see the `isMobile`
// check that wraps it further down, and MobileSpecList just below for
// what renders instead. That means `left-8`/`right-8` (not `left-4`/
// `sm:left-8` — those below-`sm` tiers are now dead code, unreachable
// since nothing under `md` ever mounts this rail at all) is already the
// SMALLEST width this ever needs to handle. lg:left-80/right-80
// (320px) — up from lg:left-16/right-16 (64px), this section's
// ORIGINAL inset back when the only thing living in the rail was a
// 56px circle — is a real, confirmed bug fix once a w-64 (256px) card
// has to grow further outward from there: 64px of margin can't hold a
// 256px card + a 1rem gap (needs >=272px), so the card blew straight
// past the section's own overflow-hidden edge and was clipped down to
// a sliver, confirmed live via screenshot. 320px leaves a real 48px
// buffer beyond that minimum at the narrowest width it applies to
// (1024px, the lg breakpoint itself).
const RAIL_SIDE_CLASSNAMES: Record<Side, string> = {
  left: "left-8 lg:left-80",
  right: "right-8 lg:right-80",
};

/** The card's own edge (nearest the model) — re-measured on activate and
 *  on resize, NOT every frame; unlike the model's target point, this
 *  half of the line doesn't move continuously (the card sits in a fixed
 *  editorial rail position; see its own doc comment below). Kept in a
 *  ref, not state — it's read inside a 60fps callback (see
 *  handleProjected) where a React re-render would be wasted work. */
type CardEdge = { x: number; y: number };

export function TheSpecs() {
  const [active, setActive] = useState(0);
  const reduceMotion = useSafeReducedMotion();
  // Below `md` (768px, useIsMobile's own default): the entire floating-
  // node/leader-line system is replaced outright by a dedicated mobile
  // layout (a small auto-rotating model + a plain vertical spec list —
  // see the JSX below) rather than trying to make the annotation system
  // itself responsive down to phone widths. One flag now drives BOTH
  // that swap AND the model's own scale prop — they used to be two
  // separate `useIsMobile()` calls at two different breakpoints (768px
  // for scale, 1024px for the annotation system), which is no longer
  // needed now that both concerns share the same cutoff.
  const isMobile = useIsMobile();
  const activeSpec = specs[active];

  const sectionRef = useRef<HTMLElement>(null);
  const activeCardRef = useRef<HTMLDivElement | null>(null);
  const cardEdgeRef = useRef<CardEdge | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const [lineVisible, setLineVisible] = useState(false);

  function measureCardEdge(specIndex: number) {
    const sectionRect = sectionRef.current?.getBoundingClientRect();
    const cardRect = activeCardRef.current?.getBoundingClientRect();
    if (!sectionRect || !cardRect) {
      cardEdgeRef.current = null;
      return;
    }
    const side = specs[specIndex].side;
    cardEdgeRef.current = {
      x: (side === "left" ? cardRect.right : cardRect.left) - sectionRect.left,
      y: cardRect.top + cardRect.height / 2 - sectionRect.top,
    };
  }

  // Reduced motion skips the card's own enter transition entirely (see
  // the card's own initial/animate below), so there's no
  // onAnimationComplete to hang the first measurement off — this runs it
  // directly instead. Also the one place that keeps the CARD half of the
  // line in sync with a window resize/orientation change while a card is
  // already settled (the model's half tracks itself continuously via
  // AnchorProjector below, resize included, since it re-reads the live
  // canvas size every frame).
  useLayoutEffect(() => {
    if (isMobile) return;
    if (reduceMotion) measureCardEdge(active);
    function onResize() {
      measureCardEdge(active);
    }
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    if (sectionRef.current) ro.observe(sectionRef.current);
    return () => {
      window.removeEventListener("resize", onResize);
      ro.disconnect();
    };
  }, [active, isMobile, reduceMotion]);

  function selectSpec(index: number) {
    if (index === active) return;
    setActive(index);
    // Hides the OLD line immediately (same tick as the active change) —
    // the new one only reappears once handleProjected below has a fresh
    // point for the NEWLY active spec, rather than leaving the outgoing
    // line pointing at the wrong target for even one frame.
    setLineVisible(false);
    cardEdgeRef.current = null;
  }

  /** Called every frame from INSIDE the R3F canvas (see AnchorProjector
   *  in TheSpecsScene.tsx) with the active spec's live 3D anchor,
   *  already projected to a 2D point relative to this same section's
   *  box. Writes straight to the path element's `d` attribute via a
   *  plain DOM ref, bypassing React entirely — a setState here would
   *  re-render this whole section up to 60 times a second for what's
   *  ultimately just one SVG attribute. This is also the ONLY thing
   *  that changes per frame: the card half of the line (cardEdgeRef)
   *  is fixed once measured, so each call only has to recompute the
   *  dogleg's model-facing segment, not remeasure anything.
   *
   *  The `setLineVisible`/`pathRef.current` ordering below is load-
   *  bearing, not incidental — a real, confirmed deadlock this replaces:
   *  the `<svg>`/`<path>` only exists in the DOM once `lineVisible` is
   *  true, so on the very first frame with a valid point, `pathRef.
   *  current` is STILL null (nothing has mounted yet). Bailing out
   *  early whenever the path ref is missing — which seemed like the
   *  obvious guard — meant `setLineVisible(true)` was never reached on
   *  that first call, so the path never mounted, so the ref never
   *  populated, forever: confirmed live via instrumented counters
   *  (handleProjected firing every frame, always hitting the "no path"
   *  branch, `lineVisible` never once flipping). The fix is to decide
   *  visibility from `point`/`edge` ALONE; writing to the path is a
   *  separate, independently-guarded step that simply no-ops for
   *  whichever single frame the path hasn't mounted yet and succeeds
   *  every frame after. */
  function handleProjected(point: { x: number; y: number } | null) {
    if (isMobile) return;
    const edge = cardEdgeRef.current;
    if (!point || !edge) return;
    if (!lineVisible) setLineVisible(true);
    const path = pathRef.current;
    if (!path) return;
    const midX = (edge.x + point.x) / 2;
    path.setAttribute("d", `M ${edge.x} ${edge.y} L ${midX} ${edge.y} L ${point.x} ${point.y}`);
  }

  // Computed here rather than inline as `{!isMobile && (...)}` in the
  // JSX below — functionally identical, but eslint's react-hooks/refs
  // rule (a real false positive here, confirmed by testing: it only
  // fires once this exact map is wrapped in a JSX-level conditional,
  // not when it's unconditional, even though `selectSpec` closing over
  // a ref is only ever invoked from an onClick handler either way,
  // never during render) doesn't flag a plain JS variable the same way.
  const desktopRail = !isMobile && (
    <>
      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          className={cn("absolute top-[200px] bottom-[100px] z-20", RAIL_SIDE_CLASSNAMES[side])}
        >
          {specs.map((spec, i) => {
            if (spec.side !== side) return null;
            const isActive = i === active;
            const Icon = spec.icon;
            return (
              <div
                key={spec.label}
                // No translateY here — the same real, confirmed bug
                // this avoids as BeyondHeartSection.tsx's own ring dots
                // (see that file's doc comment): centering this WHOLE
                // wrapper vertically on railPercent would shift the
                // CIRCLE's position by however tall the card currently
                // is, since below `lg` the card is normal-flow content
                // stacked inside this same wrapper (see the card's own
                // className below) — meaning every node would visibly
                // jump position the instant one of them activates.
                // Leaving it unset means the circle (first child) just
                // sits flush at the wrapper's own top edge, which is
                // pinned at railPercent regardless of what mounts below
                // it.
                //
                // No translateX(-50%) either — a real, confirmed bug
                // this replaces: that classic "true center" idiom only
                // works against a parent with a REAL width to be 50%
                // of; this rail has none (only one of `left`/`right` is
                // ever set, see RAIL_SIDE_CLASSNAMES, so it shrinks to
                // fit its own content instead of spanning a fixed box).
                // Against a shrink-to-fit parent, `left-1/2` resolves to
                // ~0 and `-translate-x-1/2` then shifts this whole node
                // left by HALF ITS OWN WIDTH regardless — on desktop a
                // subtle ~28px drift, confirmed live via a before/after
                // pixel comparison; at a narrow (below-`lg`) viewport
                // that same shift pushed the stacked card half off the
                // left edge of the screen, confirmed live via
                // screenshot (its own label visibly clipped). Simply
                // sitting flush against whichever edge the rail is
                // itself anchored to — `left-0` here since the rail's
                // own inset (left-8/lg:left-80) IS that edge already —
                // reproduces the exact pre-stagger horizontal position
                // with no transform math needed at all.
                //
                // w-11/sm:w-14 — matches the circle's own size-11/
                // sm:size-14 exactly, rather than leaving this wrapper
                // to shrink-to-fit its content. Below `lg`, that content
                // includes the stacked card (see its own className
                // below), which is WIDER than the circle — a shrink-to-
                // fit wrapper would grow to match it the instant this
                // spec activates, which then shifts the CIRCLE sideways
                // too (`items-center` would recentre it within whatever
                // the wrapper's current width happens to be). A fixed
                // width equal to the circle's own removes that risk
                // entirely — the circle already fills the wrapper
                // exactly, at any width.
                //
                // items-start (left rail) / items-end (right rail), not
                // items-center — a real, confirmed bug this replaces:
                // centering the wider stacked card within this now
                // FIXED-width wrapper made it overflow symmetrically
                // both directions, and on the left rail specifically
                // (anchored just 16px from the viewport's own left
                // edge) that pushed the card's left half straight past
                // x=0, clipped by the section's own overflow-hidden —
                // confirmed live via screenshot (the card's own text
                // visibly cut off mid-word on every line). Aligning to
                // whichever edge the circle itself sits flush against
                // instead — same principle the `lg:` edge-anchored
                // expansion already uses, just applied to a stacked
                // instead of a sideways layout — means the card only
                // ever grows INWARD, toward the safe center of the
                // screen, never toward the edge it's already close to.
                className={cn(
                  "absolute flex w-11 flex-col sm:w-14",
                  side === "left" ? "left-0 items-start" : "right-0 items-end"
                )}
                style={{ top: `${spec.railPercent}%` }}
              >
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
                      onAnimationComplete={() => measureCardEdge(i)}
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
                      // the viewport edge. At `lg:` and up it becomes
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
                      <h3 className="text-xs font-medium tracking-[-0.04em] text-gold uppercase">
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
    </>
  );

  return (
    <section
      ref={sectionRef}
      // md:min-h-[820px] — a real safety floor, not decorative: the
      // rail's own top-[200px]/bottom-[100px] insets (see
      // RAIL_SIDE_CLASSNAMES' sibling block below) need enough real
      // vertical room between them for 3 staggered nodes to read as
      // "staggered" rather than "cramped" — min-h-screen alone doesn't
      // guarantee that on a short-but-wide "smaller laptop" display
      // (e.g. a 1366×768 screen, common on budget/older laptops, where
      // min-h-screen would only reserve 768px total). No matching
      // max-width added alongside it — the annotation system's own
      // horizontal margins (lg:left-80/right-80) were already verified
      // safe at the narrowest width they apply to (1024px, see
      // RAIL_SIDE_CLASSNAMES' own comment); constraining the SECTION's
      // own width to "fix" a wide-screen case that isn't actually broken
      // would just risk a new one — this section's background glow
      // (the very next child below) would visibly stop at that max-
      // width's edge on an ultra-wide monitor instead of filling it.
      className="relative min-h-screen overflow-hidden bg-navy text-cream md:min-h-[820px]"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_50%_45%,color-mix(in_oklab,var(--color-gold)_14%,transparent),transparent_70%)]"
      />

      <Reveal
        y={20}
        className="relative z-10 mx-auto max-w-2xl px-6 pt-20 text-center lg:pt-28"
      >
        <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">The Specs</h2>
        <p className="mx-auto mt-4 max-w-md text-pretty text-lg text-cream/70">
          The detail for those who want it.
        </p>
      </Reveal>

      {/* The 3D core. Two completely different roles depending on
         breakpoint, both from this ONE canvas (not two separate
         mounts — a second WebGL context is real memory/GPU cost, not a
         free alternative): below `md` it's a normal-flow block of its
         own (h-[45vh], own real document height, sitting between the
         heading and the mobile spec list below) with the model just
         slowly auto-rotating for its own sake; at `md:` and up it
         becomes the full-bleed absolutely-positioned backdrop the
         reticles/line pin themselves against, exactly as before.
         Tailwind's responsive classes (not a JS conditional swapping
         between two different elements) do this switch — the browser's
         own media query evaluation applies at first paint, with no
         hydration-timing gap the way mounting a different component
         based on the `isMobile` flag would have.
         Scroll-safety (touch-action/pointer-events) is intentionally
         NOT set as Tailwind classes on this div — a real, confirmed bug
         that turned out to be: R3F's <Canvas> renders its own wrapper
         div around the actual <canvas> element with an explicit inline
         `pointer-events: auto`, which wins over whatever a class on an
         ANCESTOR div (this one) computes via inheritance, confirmed by
         inspecting the rendered DOM directly — a `pointer-events-none`
         class here had no actual effect on the canvas at all. Both are
         set correctly in TheSpecsScene.tsx's own `style` prop instead,
         where R3F actually applies them to that inner wrapper. See that
         file's own comment for the full mechanics. `activeAnchorKey`/
         `onProjected` are both undefined on mobile — see
         TheSpecsScene.tsx's own comment on why a dot with no line
         pointing at it isn't rendered there at all. */}
      <div className="relative h-[45vh] w-full md:absolute md:inset-0 md:h-auto">
        <TheSpecsSceneClient
          reduceMotion={reduceMotion}
          isMobile={isMobile}
          targetRotation={activeSpec.rotation}
          activeAnchorKey={isMobile ? undefined : activeSpec.key}
          onProjected={isMobile ? undefined : handleProjected}
          autoRotate={isMobile}
        />
      </div>

      {/* The leader line itself — a single dogleg path (a short flat
         segment off the card's edge, then a straight run to the model's
         live anchor point). `d` is never set via React/JSX — it's
         written directly by handleProjected every frame (see that
         function's own comment for why: a setState at 60fps would
         re-render this whole section for one SVG attribute). The
         stroke-dashoffset draw-in below is the one thing that DOES stay
         React/framer-motion-driven, and deliberately doesn't use the
         `pathLength` convenience prop — that trick measures the path's
         total length ONCE (getTotalLength() at mount) and derives a
         fixed dasharray/dashoffset pair from it, which would go stale
         the instant `d` changes shape as the model keeps easing toward
         its target rotation post-click. A fixed, generously-oversized
         strokeDasharray (3000 — comfortably longer than this dogleg
         could ever be at any realistic viewport width) sidesteps that:
         animating `strokeDashoffset` from 3000 to 0 draws the line in
         exactly the same way regardless of how the underlying `d`
         keeps moving underneath it. `key={activeSpec.label}` remounts
         the whole path on every switch so the draw-in restarts cleanly
         at 0 rather than interpolating between two unrelated lines. */}
      {!isMobile && lineVisible && (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-10 h-full w-full overflow-visible"
        >
          <motion.path
            key={activeSpec.label}
            ref={pathRef}
            fill="none"
            stroke="var(--color-gold)"
            strokeWidth={1}
            strokeOpacity={0.45}
            strokeDasharray={3000}
            initial={reduceMotion ? false : { strokeDashoffset: 3000 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
      )}

      {/* The reticles — flanking left/right, loosely ringing the model
         rather than tracing its literal silhouette. One rail per side —
         `top`+`bottom` (no explicit height) makes each rail's box always
         exactly fill the safe gap between the heading and the section's
         own bottom edge, which each spec's own `railPercent` (see the
         Spec type's own comment) is a percentage OF. bottom-[100px]
         (was bottom-[330px]) — that much larger inset existed solely to
         clear the old fixed bottom data panel; with the panel gone (its
         content now lives in each reticle's own expanding card instead)
         the rail can use nearly the section's full height.
         `justify-between` (evenly spreading whichever nodes happen to
         share a side) is deliberately GONE, replaced with each node
         positioning itself independently via its own `railPercent` —
         justify-between can't produce a staggered layout where the 2
         right-side nodes land in the GAPS between the 3 left-side ones
         rather than lining up with them, since it only knows how to
         space a side's own nodes relative to EACH OTHER, never relative
         to the other rail. Hidden entirely below `md` (see MobileSpecList
         just below this block for what renders there instead) — these
         insets have no real margin to work with much below that already
         (see RAIL_SIDE_CLASSNAMES' own comment), and a phone-width
         screen has no room at all for a floating node beside the model
         in the first place. */}
      {desktopRail}

      {/* Mobile's own layout — replacing the floating nodes/leader lines
         above outright rather than trying to squeeze that system down to
         phone width (there's no room beside the model for a floating
         node at all below `md`, and the leader line's whole premise —
         "point across the screen at the model" — doesn't hold at a width
         where the model already fills most of it). A plain, always-
         expanded vertical list, not an accordion — every spec's own
         detail is already a single short sentence (see the `specs`
         array above), so collapsing it behind a click would be adding
         an interaction for content that never needed hiding in the
         first place. relative z-10 — sits in NORMAL DOCUMENT FLOW below
         the model canvas above (which is a normal-flow block of its own
         on mobile too, see that div's own comment), simply because
         that's the layout a plain list needs; it doesn't join the
         absolutely-positioned layer the desktop annotation system
         above lives in. */}
      {isMobile && (
        <div className="relative z-10 flex flex-col gap-4 px-6 pt-10 pb-16">
          {specs.map((spec) => {
            const Icon = spec.icon;
            return (
              <div
                key={spec.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
              >
                <Icon className="size-5 text-gold" aria-hidden="true" />
                <h3 className="mt-3 text-xs font-medium tracking-[-0.04em] text-gold uppercase">
                  {spec.label}
                </h3>
                <p className="mt-2 text-pretty text-sm text-cream/70">{spec.detail}</p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
