"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

type FeatureSplitSectionProps = {
  id?: string;
  eyebrow?: string;
  heading: string;
  body: ReactNode;
  /** Which side the media panel sits on at the md breakpoint. On mobile
   *  the media always shows first regardless — see the order-utility
   *  note below, matching every other image+text section on this site. */
  imageSide: "left" | "right";
  background: "cream" | "navy" | "navy-soft";
  /** Real content to use as the media half instead of the default
   *  placeholder panel — e.g. an existing proof/stat card that already
   *  serves as this section's visual, rather than burying it behind a
   *  generic box. */
  media?: ReactNode;
};

/** Enter → hold pacing shared by both halves below.
 *
 *  - 0.00–0.35: enter (opacity 0→1, plus each half's own motion below),
 *    starting IMMEDIATELY at p=0 — no held/blank period first.
 *  - 0.35–1.00: hold, fully settled, unchanging.
 *
 *  A real, confirmed bug this replaces: the previous version held
 *  BOTH halves at opacity 0 from p=0 to p=0.15 first ("the pin locking
 *  into place with a beat before anything moves is part of what reads
 *  as deliberate"), on the theory that a brief pause read as
 *  intentional pacing. In practice that 15%-of-progress window is a
 *  genuinely BLANK pinned section — confirmed live via screenshot: a
 *  user who scrolls into one of these (there are several per page) and
 *  stops anywhere in that window sees nothing at all, just the page's
 *  own background, which reads as broken rather than deliberate.
 *  Starting the enter animation at p=0 directly means there is no
 *  progress value at which the pinned section shows nothing.
 *
 *  Deliberately NOT a scripted fade-out at the end — this codebase's
 *  established convention (MethodScrollCards, BuiltToReadYouSection) is
 *  "reveal, then hold fully visible", letting the sticky container's
 *  own natural unstick (as this wrapper's h-[130vh] scroll distance
 *  runs out) BE the exit, rather than animating a separate release that
 *  would just fight that native browser behavior.
 *
 *  Both halves put TWO scroll-linked values on the same element
 *  (opacity plus x, or opacity plus scale) — always via the function-
 *  transformer form of useTransform, never the array-range form. This
 *  codebase hit a confirmed bug (BuiltToReadYouSection's own history):
 *  the array form hands off to a native `animation-timeline: scroll()`
 *  optimization that computes wrong values once a SECOND scroll-linked
 *  transform exists on the same element. `reduceMotion` resolves
 *  straight to the settled end-state value here rather than swapping
 *  which props/shapes get passed — the OTHER documented failure mode
 *  (an element can get permanently stuck mid-transition if its style
 *  prop's shape changes across renders — see Reveal.tsx's own history). */
function useEnterHold(progress: MotionValue<number>, reduceMotion: boolean) {
  const eased = (p: number) => (p >= 0.35 ? 1 : p / 0.35);
  const opacity = useTransform(progress, (p) => (reduceMotion ? 1 : eased(p)));
  return { eased, opacity };
}

/** Text half: fades in AND glides in from whichever side it's actually
 *  stationed on — left-text sections drift in from the left (negative
 *  x → 0), right-text sections from the right (positive x → 0), a
 *  literal "arriving from off-frame" motion rather than a generic fade
 *  in place. */
function useTextMotion(
  progress: MotionValue<number>,
  reduceMotion: boolean,
  fromSide: "left" | "right"
) {
  const { eased, opacity } = useEnterHold(progress, reduceMotion);
  const startX = fromSide === "left" ? -48 : 48;
  const x = useTransform(progress, (p) => (reduceMotion ? 0 : startX * (1 - eased(p))));
  return { opacity, x };
}

/** Media half: fades in and scales up from just-below-final size — a
 *  gentle "arriving into focus" on the same enter timing as the text,
 *  scale standing in for the horizontal glide since a centered panel
 *  has no "side" to travel from. Replaces the old <Parallax> wrapper
 *  entirely: Parallax tracked the element's OWN progress scrolling
 *  through the viewport, which made sense when this section scrolled
 *  past normally — now the whole section is pinned, so the panel's
 *  rect stays fixed relative to the viewport for the entire hold and
 *  Parallax's own scroll math would just freeze at whatever value it
 *  had the instant the pin engaged. This scale motion, tied to the
 *  SAME progress driving everything else in this section, is what
 *  actually replaces it. */
function useMediaMotion(progress: MotionValue<number>, reduceMotion: boolean) {
  const { eased, opacity } = useEnterHold(progress, reduceMotion);
  const scale = useTransform(progress, (p) => (reduceMotion ? 1 : 0.92 + 0.08 * eased(p)));
  return { opacity, scale };
}

/**
 * Reusable 50/50 two-column section for /how-it-works: a pinned,
 * scroll-jacked cinematic beat (own h-[130vh] track, sticky h-[100svh]
 * viewport) rather than a plain scroll-into-view fade — heading + body
 * copy on one side, a focal visual (a placeholder for now, real media
 * later) on the other, each animating in tied to this section's own
 * scroll progress through its pin, then holding fully visible until the
 * pin naturally releases into the next section.
 *
 * DOM order is ALWAYS [text, media] — left/right is controlled purely
 * with `order` utilities, not by swapping the JSX, which is what keeps
 * "media shows first on mobile" uniform regardless of which side it ends
 * up on at the two-column breakpoint: the text block carries a base
 * `order-2` (so the media panel, left at its default `order-0`, is always
 * first once the grid stacks to one column below md); `imageSide="right"`
 * then adds `md:order-1` to flip text back in front once the two-column
 * split engages, with the media panel picking up the matching
 * `md:order-2`. `imageSide="left"` needs nothing extra — the media panel
 * already defaults to first at every breakpoint, mobile and desktop
 * alike.
 *
 * Two-column split engages at md (768px), not lg (1024px) — a real,
 * confirmed bug this replaces: staying single-column through the whole
 * 768–1023px tablet range meant the media panel's `aspect-square` sized
 * itself off the FULL container width (~720px at a 768px viewport),
 * producing a 720×720 square that, stacked above the text block inside
 * this section's fixed h-[100svh] pinned viewport, pushed the text
 * below the visible area entirely — confirmed live via
 * getBoundingClientRect (text bottom edge past the viewport's own
 * height). Splitting into two real columns at md instead of lg gives the
 * media panel roughly half the container width, which is what actually
 * keeps its aspect-square size reasonable — the `md:max-h-[55vh]` cap
 * on the panel itself (see its own comment below) is a second,
 * independent safety net for the same failure mode, not the primary fix.
 */
export function FeatureSplitSection({
  id,
  eyebrow,
  heading,
  body,
  imageSide,
  background,
  media,
}: FeatureSplitSectionProps) {
  const reduceMotion = useSafeReducedMotion();
  const wrapperRef = useRef<HTMLDivElement>(null);
  // offset ["start end", "end end"], not ["start start", "end end"] —
  // a real, confirmed bug this replaces, distinct from the opacity-hold
  // bug fixed earlier: "start start" only starts counting progress once
  // this wrapper's OWN top edge reaches the viewport's top edge — but
  // this wrapper (130vh) is taller than the viewport (100vh), so there's
  // a real ~30vh window where the wrapper has already scrolled well
  // into view from the bottom (its cream background fully on screen)
  // while its top edge STILL hasn't reached the viewport's top yet.
  // scrollYProgress is mathematically clamped at exactly 0 for that
  // entire window (by definition of the offset, not a rounding
  // artifact), so eased(0) — whatever it is — is what renders that
  // whole time. Confirmed live via screenshot: scrolled into this
  // exact window and got a fully blank cream section, nothing
  // rendered at all, not just faint. "start end" starts counting
  // progress from the moment this wrapper's top edge enters the
  // viewport's BOTTOM edge instead — i.e. the instant any part of it
  // is first visible — so there's no scroll position left where the
  // section is on screen but progress is still stuck at the pre-range
  // value. The enter/hold breakpoints below (0–0.35 ramp, 0.35–1 hold)
  // don't need rescaling for this — they just complete as a fraction of
  // a now-larger 0–1 range (physically ~410px of scroll instead of
  // ~95px), which reads as a touch more gradual, not broken.
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start end", "end end"],
  });

  // The text half enters from whichever side is OPPOSITE the media —
  // e.g. imageSide="right" puts text on the left, so it should arrive
  // FROM the left.
  const textFromSide = imageSide === "right" ? "left" : "right";
  const text = useTextMotion(scrollYProgress, reduceMotion, textFromSide);
  const visual = useMediaMotion(scrollYProgress, reduceMotion);

  const dark = background !== "cream";
  const sectionClassName =
    background === "navy"
      ? "dark-glow bg-navy text-cream"
      : background === "navy-soft"
        ? "dark-glow bg-navy-soft text-cream"
        : undefined;

  return (
    // 200vh -> 130vh — per an explicit "too much scrolling to reveal"
    // pass: the enter window (0.15-0.45) still gets ~39vh of real
    // scroll distance at this height, still legible for both halves'
    // own motion — 200vh was excess dead scroll on top of that. This
    // one component is reused across many pages (/how-it-works,
    // /inside-the-app, etc.), so this single change tightens all of
    // them at once.
    <div id={id} ref={wrapperRef} className={cn(!reduceMotion && "h-[130vh]")}>
      {/* h-[100svh], not h-screen — see MethodScrollCards.tsx/
         BuiltToReadYouSection.tsx for the full explanation: `vh` assumes
         the browser's toolbar chrome is fully hidden, so a real phone's
         actual visible area can be shorter than 100vh, clipping this
         pinned section's bottom against its own overflow-hidden. `svh`
         is the small/guaranteed-visible size. */}
      <section
        className={cn(
          "sticky top-0 flex h-[100svh] w-full items-center overflow-hidden",
          sectionClassName
        )}
      >
        {/* px-6 md:px-8 lg:px-10 — was px-6 lg:px-10 with nothing between;
           now that the split itself engages at md (see this component's
           own doc comment), the gutter needed its own step at that same
           breakpoint rather than jumping straight from mobile's 24px to
           desktop's 40px. */}
        <div className="mx-auto w-full max-w-6xl px-6 md:px-8 lg:px-10">
          <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-14">
            <motion.div
              style={{ opacity: text.opacity, x: text.x }}
              className={cn(
                "order-2 text-center md:text-left",
                imageSide === "right" && "md:order-1"
              )}
            >
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}
              <h2
                className={cn(
                  "text-balance font-serif text-3xl leading-tight lg:text-4xl",
                  eyebrow && "mt-4",
                  !dark && "text-navy"
                )}
              >
                {heading}
              </h2>
              <div
                className={cn(
                  "mx-auto mt-6 max-w-xl text-pretty text-lg md:mx-0",
                  dark ? "text-cream/75" : "text-mist"
                )}
              >
                {body}
              </div>
            </motion.div>

            {/* max-h caps below lg — a SECOND, independent bug this
               fixes beyond the md:grid-cols-2 split above: below md, this
               panel is still full-width and stacked ABOVE the text (see
               the order-utility comment up top), so its aspect-square
               size derives from the full container width — at a 640px
               foldable width that's a ~590px-tall square, which combined
               with the text block below it genuinely doesn't fit this
               section's own h-[100svh] pinned viewport. Confirmed live
               via getBoundingClientRect across a width/height sweep: the
               media panel's top edge sat well ABOVE y=0 (items-center
               distributing the overflow equally above and below) at
               foldable widths down to a 700px-tall viewport — the exact
               same "content taller than the pin" failure the md fix
               addresses, just triggered by the STACKED layout's full
               width rather than the two-column layout's lg-only split.
               `max-md:max-h-[50vh]` caps it there; `md:max-h-[55vh]` is
               the equivalent cap for the two-column case (in practice a
               2-column square is already well under this, so it's a
               ceiling for an unusually short md viewport, not something
               that visibly changes the ordinary case); `lg:max-h-none`
               cancels the cap again once there's a real two-column
               desktop layout with plenty of vertical room, preserving
               this panel's original, already-tuned lg+ size exactly.
               Both max-md: and md: pair their cap with an explicit
               w-full + mx-auto — a real, confirmed bug this avoids:
               grid/flow items stretch to their container's width by
               default with NO width class needed, but adding
               aspect-ratio + max-height together overrides that default
               stretch, collapsing the div down to the size of the tiny
               ImageIcon placeholder inside it instead (confirmed live
               via screenshot: a ~50×50px box floating in an otherwise
               empty column). The explicit width restores the intended
               full-width square; max-height only ever overrides it
               downward on a viewport short enough to actually need it. */}
            <motion.div
              style={{ opacity: visual.opacity, scale: visual.scale }}
              className={cn(
                "relative aspect-square overflow-hidden rounded-3xl",
                "max-md:mx-auto max-md:w-full max-md:max-h-[50vh]",
                "md:mx-auto md:w-full md:max-h-[55vh] lg:max-h-none",
                imageSide === "right" && "md:order-2"
              )}
            >
              {media ?? (
                // dark sections: .card-glass's tinted fill overridden away
                // with bg-transparent, keeping only its border + inset
                // glow — the same "floating outline, not a solid tile"
                // treatment as the homepage's "Inside the app" float tiles
                // and MethodScrollCards' cards. .card-glass-light is
                // already transparent-fill by definition, so the cream
                // variant needs no override.
                <div
                  className={cn(
                    "flex size-full items-center justify-center",
                    dark ? "card-glass bg-transparent" : "card-glass-light"
                  )}
                >
                  <ImageIcon
                    aria-hidden="true"
                    strokeWidth={1.25}
                    className={cn("size-12", dark ? "text-cream/20" : "text-navy/15")}
                  />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
