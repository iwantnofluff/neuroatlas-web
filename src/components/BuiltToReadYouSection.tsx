"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { useIsMobile } from "@/lib/useIsMobile";
import { ShimmerLink } from "@/components/ui/shimmer-button";

// Replaces the previous "the-band" section (a plain two-column image+text
// block) with a cinematic, sticky-scroll WebGL moment — same headline/
// subtext copy, same /band destination for "Learn More", dramatically
// different presentation. Genuinely lazy: @react-three/fiber's Canvas is
// only pulled in client-side, never touched during the server render (the
// same split this codebase already uses for BandScrollScene/BandSignal).
const BuiltToReadYouScene = dynamic(
  () => import("@/components/BuiltToReadYouScene").then((m) => m.BuiltToReadYouScene),
  { ssr: false }
);

/** Headline opacity/scale, both driven by the SAME 0–0.5 scroll window —
 *  widened from 0–0.35 to stay paired with the model's own reveal, which
 *  now takes 70% of progress to complete instead of 40% (see Band.tsx's
 *  REVEAL_RATIO — reported live as feeling rushed, snapping into its
 *  locked pose almost as soon as the section pinned). the function-
 *  transformer form of useTransform, not the array-range form. This
 *  codebase hit a confirmed framer-motion bug where the array form hands
 *  scroll-linked transforms off to a native `animation-timeline:
 *  scroll()` optimization that computes wrong values once a *second*
 *  scroll-linked transform exists on the same element — exactly this
 *  case (opacity AND scale on one element). reduceMotion resolves
 *  straight to the settled end-state rather than toggling which props
 *  are passed, since swapping prop shapes between renders is the OTHER
 *  documented failure mode here (an element can get permanently stuck
 *  mid-transition — see Reveal.tsx's own history).
 *
 *  Starts at p=0 directly, not p=0.3 — a real, confirmed bug this
 *  replaces: holding the headline at opacity 0 until 30% progress meant
 *  a user who scrolled into this pinned section and stopped anywhere in
 *  that window saw the 3D model with no heading at all, reading as
 *  broken rather than a deliberate beat. */
function useHeadlineMotion(progress: MotionValue<number>, reduceMotion: boolean) {
  const eased = (p: number) => (p >= 0.5 ? 1 : p / 0.5);
  const opacity = useTransform(progress, (p) => (reduceMotion ? 1 : eased(p)));
  const scale = useTransform(progress, (p) => (reduceMotion ? 1 : 1.1 - 0.1 * eased(p)));
  return { opacity, scale };
}

/** Same reasoning as useHeadlineMotion, for the subtext + button's
 *  opacity/y over the 0.5–0.7 window (was 0.35–0.55, shifted to match
 *  the model's own new, slower lock point at 0.7) — starting right as
 *  the headline finishes, not after an additional held gap, and
 *  finishing right as the model itself settles into its locked pose, so
 *  text and model arrive together rather than the text sitting fully
 *  settled while the model visibly keeps turning behind it. Holds fully
 *  visible for the rest of the scroll range past 0.7, matching this
 *  site's established "reveal, don't cross-fade back out" convention. */
function useSubtextMotion(progress: MotionValue<number>, reduceMotion: boolean) {
  const eased = (p: number) => (p <= 0.5 ? 0 : p >= 0.7 ? 1 : (p - 0.5) / 0.2);
  const opacity = useTransform(progress, (p) => (reduceMotion ? 1 : eased(p)));
  const y = useTransform(progress, (p) => (reduceMotion ? 0 : 20 * (1 - eased(p))));
  return { opacity, y };
}

// Shared by the desktop sandwich AND the mobile stacked headline below —
// one className, both markups. leading-none + tracking-tighter (was
// leading-[0.95]/tracking-tight) — an editorial "monolithic, heavy"
// headline reads as one continuous mass of type, not two lines with
// visible internal breathing room; tighter tracking and a true 1-to-1
// line-height are what actually sell that at this size and weight.
//
// text-gold-soft, not text-cream — pure cream read as too stark/harsh
// against the Deep Navy at this size and weight per client feedback.
// gold-soft (#e5dac2) is an existing token in this site's own palette
// (see globals.css), a warmer champagne tint one step down from the
// gold hardware color itself — reusing it here (rather than a bespoke
// one-off hex) is what actually "echoes the gold hardware" the client
// asked for, and keeps this in the same token system as the rest of
// the site instead of introducing a color nothing else uses.
// xl:text-[10rem] is a FLAT cap — fine up through a normal laptop
// screen, but on anything wider (a real, confirmed complaint: a ~2000px
// viewport left visibly too much whitespace at both sides) the text
// just stops growing forever past that one fixed size, while the
// viewport itself keeps getting wider. 2xl: (1536px+) switches to a
// vw-based clamp so it keeps scaling with the viewport instead of
// flatlining — clamp's own floor (10rem) matches xl's own value almost
// exactly at the 1536px breakpoint itself (11vw ≈ 10.56rem there), so
// there's no visible jump at the breakpoint edge, just a smooth
// continuation; the 16rem ceiling is a sanity cap for genuinely
// ultra-wide displays, not a reintroduction of the same flat-cap bug.
const HEADLINE_TEXT_CLASSNAME =
  "font-sans text-5xl leading-none font-black tracking-tighter text-gold-soft uppercase sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem] 2xl:text-[clamp(10rem,17vw,22rem)]";

export function BuiltToReadYouSection() {
  const reduceMotion = useSafeReducedMotion();
  const isMobile = useIsMobile();
  const wrapperRef = useRef<HTMLDivElement>(null);
  // offset ["start start", "end end"] — was ["start end", "end end"], a
  // real, confirmed bug this replaces: with a 180vh wrapper and a 100vh
  // viewport, "start end" maps the full 0–1 progress range across the
  // wrapper's own FULL height (180vh) of scroll, starting the instant its
  // top sliver enters the viewport from below — but the sticky child
  // doesn't actually PIN until 100vh of that has already scrolled by (the
  // point where the wrapper's top reaches the viewport's top). That's
  // progress ≈0.56 by the time pinning engages — well past the model's
  // own rise/spin/lock sequence, which completes entirely by progress 0.4
  // (see Band.tsx's `t = p / 0.4` for the "reveal" variant). The model
  // was finishing its whole animation and locking into its final pose
  // WHILE THE SECTION WAS STILL SCROLLING UP INTO VIEW, before it was
  // even pinned — confirmed live: scrubbing to progress 0.4 showed the
  // wrapper's top well below the viewport's top, nowhere near pinned yet.
  // Once pinned, the remaining ~44% of the range was pure dead hold, on
  // top of an approach that had already used up the interesting part.
  //
  // "start start" fixes this at the source: progress is mathematically
  // clamped at exactly 0 for the entire approach (while the wrapper is
  // still scrolling up but hasn't reached the pin point), and only starts
  // advancing once the wrapper's own top hits the viewport's top — i.e.
  // the exact instant `sticky top-0` engages. That's not the blank-
  // content failure mode FeatureSplitSection's own comment warns about
  // (this section's content is SUPPOSED to sit at its progress-0 state —
  // model off-screen, headline invisible — for the whole approach; there's
  // nothing here that needs to be visible before the pin engages, unlike
  // that other case), so there's no downside to it here, and it removes
  // the early-completion bug entirely: the model now rises, spins, and
  // locks entirely within the section's own pinned scroll, not before it.
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  const headline = useHeadlineMotion(scrollYProgress, reduceMotion);
  const subtext = useSubtextMotion(scrollYProgress, reduceMotion);

  return (
    <div
      id="the-band"
      ref={wrapperRef}
      // 150vh -> 200vh — a follow-up "still too fast" report after the
      // offset fix above: fixing the early-completion bug alone still
      // left the actual rotation happening across only 50vh of real
      // pinned scroll (150vh wrapper − 100vh viewport), and reported live
      // as flying by too quickly to actually watch the model turn before
      // it locked. Paired with Band.tsx's REVEAL_RATIO going from 0.4 to
      // 0.7, at 200vh the pinned distance is 100vh, of which 70%
      // (~70vh) is now the model's own rise+spin, twice the previous
      // window's absolute scroll distance for the SAME rotation — the
      // same physical scroll gesture now covers noticeably less of the
      // turn per tick, reading as deliberate rather than instant.
      // Remaining ~30vh is the settled hold before release, comparable
      // to what the previous 150vh/0.4 pairing already held for, not a
      // reintroduction of the original "way too tall" complaint.
      className={cn(!reduceMotion && "h-[200vh]")}
    >
      {/* h-[100svh], not h-screen — see MethodScrollCards.tsx for the full
         explanation: `vh` assumes the browser's toolbar chrome is fully
         hidden, so a real phone's actual visible area can be shorter than
         100vh, clipping this pinned section's bottom against its own
         overflow-hidden. `svh` is the small/guaranteed-visible size. */}
      <div className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden bg-navy">
        {/* Two structurally DIFFERENT layouts below md vs. at/above it —
           not the same markup nudged with a transform. A previous pass
           tried shifting the desktop "sandwich" up as one rigid unit on
           mobile (so the model still bridged both text halves), but the
           client called it out as still too compressed: with the model
           and both text halves squeezed toward the same center point,
           the space above the whole cluster still read as a big gap
           under the header. Splitting into two real layouts instead:
           mobile gets an ordinary top-anchored two-line headline (no
           split, no overlap, ordinary reading order) with the model
           free to occupy the untouched middle of the screen on its own,
           and subtext at the bottom; desktop keeps the split-open
           "sandwich" sandwich exactly as the client separately confirmed
           is "absolutely perfect", completely unmodified below other
           than gaining a `hidden md:flex`/`md:hidden` toggle against its
           mobile sibling. */}

        {/* MOBILE ONLY (< md) — ordinary stacked two-line headline,
           top-anchored below the fixed header (which measures ~73px;
           top-28 = 112px clears it with real breathing room), behind the
           canvas (z-[-1]) same as the desktop version, but with no split
           and no intentional model overlap — the model has the entire
           middle of the screen to itself here. */}
        <motion.div
          style={{ opacity: headline.opacity, scale: headline.scale }}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-28 z-[-1] px-6 text-center md:hidden"
        >
          <span className={HEADLINE_TEXT_CLASSNAME}>Built To</span>
          <br />
          <span className={HEADLINE_TEXT_CLASSNAME}>Read You</span>
        </motion.div>

        {/* DESKTOP ONLY (>= md) — unchanged "sandwich": a flex-1 top half
           with the text pinned to ITS bottom edge (items-end) and a
           flex-1 bottom half pinned to ITS top edge (items-start). Both
           edges land on the exact same seam — the viewport's vertical
           center — so "Built To"/"Read You" sit back-to-back with no
           programmatic gap, reading as one monolithic headline that the
           model (see Band.tsx's MODEL_SCALE_DESKTOP) physically splits
           open by overlapping into both inner edges. Both rows share the
           SAME opacity/scale motion values (one scroll-driven fade+scale
           applied to two elements) rather than each computing its own —
           reusing an already-computed motion value across multiple
           elements is safe; it's a SECOND independent useTransform call
           on the SAME element that this codebase's array-transform bug
           actually depends on. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[-1] hidden flex-col md:flex"
        >
          <motion.div
            style={{ opacity: headline.opacity, scale: headline.scale }}
            className="flex flex-1 items-end justify-center px-6 text-center"
          >
            <span className={HEADLINE_TEXT_CLASSNAME}>Built To</span>
          </motion.div>
          <motion.div
            style={{ opacity: headline.opacity, scale: headline.scale }}
            className="flex flex-1 items-start justify-center px-6 text-center"
          >
            <span className={HEADLINE_TEXT_CLASSNAME}>Read You</span>
          </motion.div>
        </div>

        <BuiltToReadYouScene
          reduceMotion={reduceMotion}
          progress={scrollYProgress}
          isMobile={isMobile}
        />

        {/* In front of the canvas (z-index 10). text-gold-soft/70, not
            text-cream/80 — same softened tint as the headline above,
            but at a visibly lower opacity than its (fully solid)
            gold-soft so the subtext recedes a step behind the
            headline, a deliberate hierarchy rather than both reading
            at the same visual weight. */}
        {/* bottom-8, flat (no sm: bump) — was bottom-14/sm:bottom-20 — a
           direct "the body text is sticking to the heading" report:
           this block is anchored to the SECTION's bottom edge with no
           explicit top, so its rendered position only depends on this
           bottom offset and its own content height — a top margin/
           padding added to the paragraph INSIDE it would just grow the
           box upward by the same amount its anchor point rises,
           leaving the visible text in exactly the same spot (confirmed
           by the math, not assumed). "Read You" below it is a huge,
           width-driven headline (see HEADLINE_TEXT_CLASSNAME) whose
           pixel height barely changes with viewport HEIGHT, while the
           center seam it hangs from IS exactly 50% of that height — so
           on a shorter browser window the two visibly close in,
           confirmed live via measurement (a real gap shrinking from
           ~110px at 956px viewport height down to actual overlap
           around 720px tall, a perfectly ordinary un-maximized laptop
           window). The previous sm: bump was a viewport-WIDTH
           breakpoint, which doesn't track viewport HEIGHT at all — the
           actual variable this bug depends on — so it helped on some
           widths and not others by coincidence; a single flat 32px
           offset instead, re-checked live from 660px up to 1080px of
           viewport height, keeps a real (if thin at the very shortest
           end) positive gap across that whole practical range, with
           the button still comfortably 160px+ clear of the screen's own
           bottom edge at every height tested. */}
        <motion.div
          style={{ opacity: subtext.opacity, y: subtext.y }}
          className="absolute inset-x-0 bottom-8 z-10 mx-auto max-w-2xl px-6 text-center"
        >
          {/* max-w-md (448px) wrapped this to 3 lines, the last one just
             "day." on its own — an orphan, not a deliberate 2-line
             break. Widened close to the headline's own span (max-w-2xl,
             not full-bleed — text this size needs SOME line length cap
             to stay readable) and added text-balance so the browser
             distributes the words evenly across however many lines it
             takes, rather than greedily filling each line until the
             next word doesn't fit; at this width that's reliably 2
             even lines, never a dangling one.

             Deliberately text-balance, not text-pretty (the site-wide
             convention this typography pass otherwise uses for body
             copy) — this is a short, 2-line block much closer in
             length to a headline than a running paragraph, and
             text-balance's "even out every line" algorithm was already
             tested and confirmed to fix this exact orphan; switching it
             to text-pretty's lighter "just avoid a lone final word"
             heuristic for category-consistency alone risked undoing a
             verified fix for an unverified one. */}
          <p className="text-lg text-balance text-gold-soft/70">
            A screenless band designed to read your stress, quietly and
            precisely, throughout your day.
          </p>
          <div className="mt-6 flex justify-center">
            <ShimmerLink
              href="/band"
              background="color-mix(in oklab, var(--color-cream) 30%, transparent)"
              shimmerColor="var(--color-cream)"
              className="px-6 py-3 text-sm tracking-wide text-cream"
            >
              Learn More
            </ShimmerLink>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
