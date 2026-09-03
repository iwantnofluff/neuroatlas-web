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
  /** Which side the media panel sits on at the lg breakpoint. On mobile
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

/** Enter → hold pacing shared by both halves below, per the site's
 *  "Vibe & Motion" manifesto: sections should feel pinned, deliberate,
 *  and cinematic, not a quick fade the instant they scroll into view.
 *
 *  - 0.00–0.15: held, untouched — the pin locking into place with a
 *    beat before anything moves is part of what reads as deliberate
 *    rather than instant.
 *  - 0.15–0.45: enter (opacity 0→1, plus each half's own motion below).
 *  - 0.45–1.00: hold, fully settled, unchanging.
 *
 *  Deliberately NOT a scripted fade-out at the end — this codebase's
 *  established convention (MethodScrollCards, BuiltToReadYouSection) is
 *  "reveal, then hold fully visible", letting the sticky container's
 *  own natural unstick (as this wrapper's h-[200vh] scroll distance
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
  const eased = (p: number) => (p <= 0.15 ? 0 : p >= 0.45 ? 1 : (p - 0.15) / 0.3);
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
 * scroll-jacked cinematic beat (own h-[200vh] track, sticky h-[100svh]
 * viewport) rather than a plain scroll-into-view fade — heading + body
 * copy on one side, a focal visual (a placeholder for now, real media
 * later) on the other, each animating in tied to this section's own
 * scroll progress through its pin, then holding fully visible until the
 * pin naturally releases into the next section.
 *
 * DOM order is ALWAYS [text, media] — desktop left/right is controlled
 * purely with `order` utilities, not by swapping the JSX, which is what
 * keeps "media shows first on mobile" uniform regardless of which side it
 * ends up on at desktop: the text block carries a base `order-2` (so the
 * media panel, left at its default `order-0`, is always first once the
 * grid stacks to one column on mobile); `imageSide="right"` then adds
 * `lg:order-1` to flip text back in front at the two-column breakpoint,
 * with the media panel picking up the matching `lg:order-2`. `imageSide=
 * "left"` needs nothing extra — the media panel already defaults to first
 * at every breakpoint, mobile and desktop alike.
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
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
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
    <div id={id} ref={wrapperRef} className={cn(!reduceMotion && "h-[200vh]")}>
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
        <div className="mx-auto w-full max-w-6xl px-6 lg:px-10">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <motion.div
              style={{ opacity: text.opacity, x: text.x }}
              className={cn(
                "order-2 text-center lg:text-left",
                imageSide === "right" && "lg:order-1"
              )}
            >
              {eyebrow && <p className="eyebrow">{eyebrow}</p>}
              <h2
                className={cn(
                  "font-serif text-3xl leading-tight lg:text-4xl",
                  eyebrow && "mt-4",
                  !dark && "text-navy"
                )}
              >
                {heading}
              </h2>
              <div
                className={cn(
                  "mx-auto mt-6 max-w-xl text-lg lg:mx-0",
                  dark ? "text-cream/75" : "text-mist"
                )}
              >
                {body}
              </div>
            </motion.div>

            <motion.div
              style={{ opacity: visual.opacity, scale: visual.scale }}
              className={cn(
                "relative aspect-square overflow-hidden rounded-3xl",
                imageSide === "right" && "lg:order-2"
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
