"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { useIsMobile } from "@/lib/useIsMobile";
import { ShimmerLink } from "@/components/ui/shimmer-button";

// Genuinely lazy — @react-three/fiber's Canvas is only pulled in once this
// resolves client-side, never touched during the server render. This file
// is already "use client", so ssr:false is allowed here (the constraint is
// specifically that it can't be called from a Server Component).
const BandScrollScene = dynamic(
  () => import("@/components/BandScrollScene").then((m) => m.BandScrollScene),
  { ssr: false }
);

// Doubles as both the page's hero (headline/supporting line/CTA) and the
// "Beyond Heart Rate" section from the client's final copy pass (the
// three signals — was "What It Reads": Heart Rate Variability/
// Breathing/Stress Load, replaced wholesale with the same three metrics
// the homepage's own BeyondHeartSection.tsx already uses, word-for-word,
// per that final copy) — all three eventually appear TOGETHER and stay,
// each pinned to a fixed spot floating around the model rather than
// swapping in and out of one shared position. `position` is a real spot
// in the composition (see POSITION_CLASSNAMES), not a left/right side
// relative to the model.
// `depth` — a direct "make it look layered, not just stacked flat on
// top of the model" request: with every card previously at the SAME
// z-index (in front of the model, full stop), the composition read as
// a deck of cards sitting ON the product rather than genuinely woven
// through it. Alternating "back"/"front"/"back" (see OrganicSignalCallout's
// own z-index handling below) puts the model's own opaque body between
// the reader and two of the three cards — those two are now physically
// occluded wherever the model overlaps them, exactly like a real object
// sitting in front of some cards and behind others, while the middle
// card (front) still reads clearly on top.
const signals = [
  {
    label: "Stress Age",
    body: "How your body is responding to stress over time.",
    range: [0, 0.34] as const,
    position: "upper-left" as const,
    depth: "back" as const,
  },
  {
    label: "Cognitive Load",
    body: "How much your mind is juggling before your focus starts to slip.",
    range: [0.33, 0.67] as const,
    position: "lower-right" as const,
    depth: "front" as const,
  },
  {
    label: "Emotional Regulation",
    body: "How well you stay balanced under pressure, so your response matches the moment.",
    range: [0.66, 1] as const,
    position: "lower-left" as const,
    depth: "back" as const,
  },
];

/** A signal's reveal — sits at 0 before `start`, animates across [start,
 *  end], then holds at 1 forever after, matching this codebase's
 *  established "reveal, don't cross-fade back out" convention (see
 *  MethodScrollCards' own useCardReveal) rather than a fade-in/fade-out
 *  carousel — once a signal has appeared it's part of the permanent
 *  composition. Function-transformer form of useTransform throughout,
 *  not the array-range form — this codebase hit a confirmed bug where
 *  the array form computes wrong values once a second scroll-linked
 *  transform exists on the same element (here: opacity AND y). */
function useSignalReveal(
  progress: MotionValue<number>,
  range: readonly [number, number],
  reduceMotion: boolean
) {
  const [start, end] = range;
  const eased = (p: number) =>
    reduceMotion ? 1 : p <= start ? 0 : p >= end ? 1 : (p - start) / (end - start);
  const opacity = useTransform(progress, (p) => eased(p));
  const y = useTransform(progress, (p) => (reduceMotion ? 0 : 16 * (1 - eased(p))));
  return { opacity, y };
}

/** xl+ only — floating glass cards positioned within the center/bottom
 *  band where the model itself lives (the canvas is confined to the
 *  bottom ~72% of the viewport — see BandScrollScene.tsx). Percentage-
 *  based insets (not fixed left-6/right-6 edge values) are what actually
 *  reads as "floating around the model" rather than "pinned to the
 *  corners of the viewport".
 *
 * 20% -> 30% — a direct "bring them closer, let them overlap the model"
 * request: at 20% (this whole comment block's own former reasoning —
 * "too tight/bleeding into the model" was the complaint about a smaller
 * PERCENTAGE back when these were mis-read as edge-margins to shrink;
 * `left`/`right` here are insets FROM the edge, so a SMALLER number
 * moves a card OUTWARD toward the screen edge, and a LARGER one moves it
 * INWARD toward the model — the opposite of what "bring closer" needs)
 * the cards sat with real daylight between them and the model at every
 * scroll frame, confirmed live via screenshot. 30% is deep enough to
 * genuinely overlap the model's own silhouette at its widest tumbled
 * poses (confirmed the same way), which is the point — the cards are
 * meant to read as layered in front of the 3D object, not floating
 * beside it.
 */
const POSITION_CLASSNAMES: Record<(typeof signals)[number]["position"], string> = {
  // top-[36%] stays — a real, confirmed collision this avoids,
  // independent of the horizontal value: this card's own right edge
  // lands underneath the "For Stress" headline at every xl+ width up to
  // ~1800px (confirmed via a Range measurement of that specific text
  // run) unless it has this much clearance from the top.
  //
  // left-[25%], not the previous 30% — eased back out a touch alongside
  // this card becoming a "back" card (see `depth` above): fully behind
  // the model at the SAME depth of overlap that worked for an in-front
  // card buries so much of it that there's nothing left to visibly read
  // as "behind" — a sliver has to stay clear of the model's own
  // silhouette for the occlusion to actually be legible as depth rather
  // than the card just being darker.
  // left-[23%], not 25% — a real, confirmed collision the w-72->w-80
  // width change (see this card's own base-className comment) introduced
  // at exactly xl's own 1280px floor, the narrowest width these cards
  // ever render at: both this card and "lower-right" got 32px wider at
  // the same two fixed insets, closing what used to be a real ~26px gap
  // between them into an actual ~38px rectangle overlap, confirmed live
  // via getBoundingClientRect (both axes overlapping, not just a close
  // call). 2% further outward here (and the matching 2% on
  // "lower-right", see that entry) reopens a real ~13px clear gap at
  // 1280px specifically, confirmed the same way, while staying close
  // enough at 1366px+ that the wider gap there was never the problem in
  // the first place.
  "upper-left": "left-[23%] top-[36%]",
  // bottom-[22%], not the original 16% — a real, confirmed collision
  // the horizontal move introduced: at 16% this card's own bottom edge
  // (now much closer to center) landed inside the "Because knowing your
  // stress..." subtext's own box at every xl+ width tested (1280–1920),
  // confirmed live via getBoundingClientRect on both elements. 22%
  // clears the subtext's own top edge with real margin without needing
  // to move the subtext itself.
  //
  // top-[42%] right-[28%] (was bottom-[22%] right-[27%], briefly
  // right-[15%]) — a direct "act as a tight anatomical callout" request,
  // in two passes: the first pass dropped the inset from 27% to 15% to
  // "bring it closer", but that's backwards per this very file's own
  // top-of-block explanation — `right`/`left` here are insets FROM the
  // edge, so a SMALLER number moves a card OUTWARD, not inward — which
  // is exactly why it then drifted away from the model at wider
  // viewports, confirmed live via screenshot at 1920px (a visibly large
  // gap that wasn't there at 1440). 28% actually pulls it inward, close
  // to "lower-left"'s own 32% (its width and text-right alignment make
  // it read just as snug at a couple points less), and stays close to
  // the model across the whole 1440–1920px range this was checked at,
  // not just one width. Vertically unchanged — top-[42%] still lands
  // level with the model's top gold side-button, unaffected by this
  // horizontal fix.
  // right-[26%], not 28% — the other half of the same w-80-vs-1280px
  // collision fix as "upper-left" above (see that entry's own comment
  // for the actual measured overlap this resolves).
  "lower-right": "top-[42%] right-[26%] text-right",
  // left-[32%] (was left-[25%]) — the other half of the same "tight
  // anatomical callout" request: pulled inward so it sits snugly under
  // the left side of the model's gold sensors, in the lower-middle-left
  // space, rather than floating at the section's own bottom-left
  // corner. Still a "back" depth card, so still eased back from the
  // model's own edge enough to leave a real visible sliver clear of it
  // (see "upper-left"'s own comment on why that matters) rather than
  // the deeper reach "lower-right" affords a front card.
  //
  // bottom-[28%] (was 22%, before that 18%) — a direct "nudge the card
  // up so its top edge sits right under the model's bottom-left rim"
  // request: a further ~6% of viewport height (~54px at 900px tall,
  // within the requested 40-60px range) higher than the previous 22%.
  // left unchanged (still 32%) — this was a vertical-only request.
  // Re-checked live against the subtext block below (now even more
  // clearance than 22% already had) and against "lower-right" above it
  // (no new overlap introduced at 1280-1920px).
  //
  // w-96 — a direct "make this specific card wider so its body copy
  // takes fewer lines" request, overriding the shared w-80 every other
  // card uses (this value is listed after that base class in the same
  // cn() call, and cn() runs everything through tailwind-merge, so the
  // later, more specific width wins for this card only). This one's own
  // body copy ("How well you stay balanced under pressure...") is the
  // longest of the three, and stayed at 3 lines even at w-80 (320px) —
  // w-96 (384px) is what actually brought it down to 2, confirmed live.
  // Re-checked all three cards against each other and against the
  // headline/subtext at 1280–1920px with this wider box in place — no
  // new collisions introduced.
  "lower-left": "left-[32%] bottom-[28%] w-96",
};

/** Premium floating UI card — glassmorphic (bg-white/5, backdrop-blur,
 *  a delicate border), no step-number eyebrow (removed per client
 *  feedback: "remove the step numbers entirely"). */
function OrganicSignalCallout({
  signal,
  progress,
  reduceMotion,
}: {
  signal: (typeof signals)[number];
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const { opacity, y } = useSignalReveal(progress, signal.range, reduceMotion);
  return (
    <motion.div
      style={{ opacity, y }}
      className={cn(
        // z-10 (front) sits above the model's own z-0 canvas (see
        // BandScrollScene.tsx); z-[-1] (back) sits below it, letting the
        // model's own opaque body physically occlude whatever part of
        // the card it overlaps — the alternating depth effect signals'
        // own `depth` field drives (see that field's own comment).
        signal.depth === "back" ? "z-[-1]" : "z-10",
        // w-80, not the previous w-72 (before that w-64) — the earlier
        // w-72 came from a "fewer body-copy lines" request alone, before
        // headings picked up whitespace-nowrap (see the label <p> below,
        // "force onto a single line" request): measured live, "Cognitive
        // Load" and "Stress Age" only had ~2px of clearance against
        // w-72's own 240px content width once nowrap was added — real,
        // but too tight to trust across fonts/DPI. w-80 (320px, 272px of
        // text width) gives real headroom instead, confirmed live, with
        // no regression to body-copy line count (still 2 lines, same as
        // w-72 — a wider box only ever holds MORE text per line, never
        // less).
        "absolute hidden w-80 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md xl:block",
        POSITION_CLASSNAMES[signal.position]
      )}
    >
      <p className="whitespace-nowrap font-serif font-normal uppercase tracking-normal text-2xl leading-snug text-cream">{signal.label}</p>
      <p className="mt-1 text-pretty text-sm text-cream/70">{signal.body}</p>
    </motion.div>
  );
}

/** Below xl there's no room for floating cards — a compact, still-
 *  persistent (not swapping) stacked list instead, sitting above the
 *  bottom-left subtext/CTA. Same glass-card treatment, no step numbers,
 *  just a tighter footprint. */
function MobileSignalCard({
  signal,
  progress,
  reduceMotion,
}: {
  signal: (typeof signals)[number];
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const { opacity, y } = useSignalReveal(progress, signal.range, reduceMotion);
  return (
    <motion.div
      style={{ opacity, y }}
      className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur-md"
    >
      <p className="text-balance font-serif font-normal uppercase tracking-normal text-base leading-snug text-cream">{signal.label}</p>
      <p className="mt-0.5 text-pretty text-xs text-cream/70">{signal.body}</p>
    </motion.div>
  );
}

export function BandScrollShowcase() {
  const reduceMotion = useSafeReducedMotion();
  const isMobile = useIsMobile();
  const wrapperRef = useRef<HTMLDivElement>(null);
  // offset ["start end", "end end"] — see FeatureSplitSection.tsx's own
  // comment for the full mechanics: "start start" leaves scrollYProgress
  // clamped at exactly 0 for the whole approach window while this
  // taller-than-viewport wrapper is still scrolling up from below (its
  // content already on screen), which for anything gated by progress
  // rather than always-on renders as genuinely blank/frozen for that
  // whole stretch, not just briefly.
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start end", "end end"],
  });

  return (
    // 520vh -> 280vh — per an explicit "too much scrolling to reveal"
    // pass: this track's own 3 signal windows are already spaced a full
    // third of progress apart ([0,0.34]/[0.33,0.67]/[0.66,1]), so at
    // 280vh each still gets ~92vh of real scroll distance, comfortably
    // legible — 520vh was just excess dead scroll on top of that, not
    // extra room any specific beat needed.
    <div ref={wrapperRef} className={cn(!reduceMotion && "h-[280vh]")}>
      {/* h-[100svh], not h-screen — see MethodScrollCards.tsx for the full
         explanation: `vh` assumes the browser's toolbar chrome is fully
         hidden, so a real phone's actual visible area can be shorter than
         100vh, clipping this pinned section's bottom against its own
         overflow-hidden. `svh` is the small/guaranteed-visible size. */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-navy">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_50%_45%,color-mix(in_oklab,var(--color-gold)_16%,transparent),transparent_70%)]"
        />

        {/* Headline — top-anchored (was dead-center, which the model's
           deliberate overlap made illegible per client feedback), z-[-1]
           still (BEHIND the model — see BandScrollScene's z-0 canvas),
           so the model dominating the center/bottom band below can just
           graze its very bottom edge without ever covering the words
           themselves. top-16/xl:top-20 is a guaranteed floor under the
           fixed header, the same reasoning BandScrollShowcase's own
           original hero used before this redesign. */}
        <div className="pointer-events-none absolute inset-x-0 top-16 z-[-1] px-6 text-center xl:top-20">
          <p className="eyebrow">The NA·01 band</p>
          <h1 className="mt-4 text-balance font-serif font-normal uppercase tracking-normal text-5xl leading-[0.95] text-gold-soft sm:text-6xl md:text-7xl lg:text-8xl">
            The <em className="not-italic text-gold">First</em> Band
            <br />
            For Stress
          </h1>
        </div>

        <BandScrollScene
          reduceMotion={reduceMotion}
          progress={scrollYProgress}
          isMobile={isMobile}
        />

        {/* xl+: floating glass cards around the model. Below xl: a
           stacked list — see each component's own doc comment. */}
        {signals.map((s) => (
          <OrganicSignalCallout
            key={s.label}
            signal={s}
            progress={scrollYProgress}
            reduceMotion={reduceMotion}
          />
        ))}
        <div className="pointer-events-none absolute inset-x-6 bottom-44 z-10 flex flex-col gap-3 xl:hidden">
          {signals.map((s) => (
            <MobileSignalCard
              key={s.label}
              signal={s}
              progress={scrollYProgress}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>

        {/* Subtext + CTA — centered directly under the model (was
           editorial bottom-left, which read as too far from the model
           it's actually describing), z-10, IN FRONT of the model. Kept
           as its own element rather than folded into the top headline
           block — if it lived there, the model's own overlap into that
           block could end up visually covering (and since a WebGL
           canvas isn't naturally click-through, potentially
           intercepting clicks on) the CTA button. Kept static, not tied
           to scroll progress — matching this hero's original always-
           visible-on-load treatment; only the signals and the model's
           own rotation are scroll-driven. */}
        <div className="absolute inset-x-0 bottom-8 z-10 mx-auto max-w-xs text-center sm:bottom-10">
          <p className="text-pretty text-base text-cream/75 sm:text-lg">
            Because knowing your stress is the first step to managing it.
          </p>
          <div className="mt-4 flex justify-center sm:mt-6">
            <ShimmerLink
              href="/request-access"
              background="color-mix(in oklab, var(--color-cream) 30%, transparent)"
              shimmerColor="var(--color-cream)"
              className="px-6 py-3 text-sm tracking-wide text-cream"
            >
              Request Access
            </ShimmerLink>
          </div>
        </div>
      </div>
    </div>
  );
}
