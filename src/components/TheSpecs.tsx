"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  Activity,
  BatteryCharging,
  Ruler,
  Watch,
  type LucideIcon,
} from "lucide-react";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";
import { useIsMobile } from "@/lib/useIsMobile";
import { Reveal } from "@/components/Reveal";

// Genuinely lazy — @react-three/fiber's Canvas is only pulled in once this
// resolves client-side, never touched during the server render. Same
// split BandScrollShowcase.tsx uses for BandScrollScene.
const TheSpecsScene = dynamic(
  () => import("@/components/TheSpecsScene").then((m) => m.TheSpecsScene),
  { ssr: false }
);

// Scroll-Driven 3D Timeline — replaces the previous click-through
// Leader Line Annotation system (five reticles, a hand-drawn SVG line
// projected live from the model's own 3D anchor points) outright per
// direct instruction. Four stages now, not five — Connectivity and
// Compatibility dropped, Strap added, matching the real Pantone
// colorway now applied to the model itself (see Band.tsx).
//
// `detail` for Sensors/Battery/Dimensions is the same placeholder copy
// the old system used (still pending the real spec doc); Strap's is the
// real supplied copy.
type Stage = {
  label: string;
  icon: LucideIcon;
  detail: string;
};

const STAGES: Stage[] = [
  {
    label: "Sensors",
    icon: Activity,
    detail: "The onboard sensor suite that reads the raw physiological signal.",
  },
  {
    label: "Battery",
    icon: BatteryCharging,
    detail: "Rated runtime per charge, plus typical charging time.",
  },
  {
    label: "Dimensions",
    icon: Ruler,
    detail: "Weight, module size, and strap sizing range.",
  },
  {
    label: "Strap",
    icon: Watch,
    detail:
      "Woven from ultra-soft microfilament yarn (52% polyamide, 41% polyester, 7% elastane) for a breathable, skin-friendly fit. Engineered in Pantone 282 CP and Cool Gray 7 C.",
  },
];

// Each stage claims an equal quarter of the scroll range — kept in sync
// with Band.tsx's own TIMELINE_STAGE_SPAN/TIMELINE_POSES by matching
// plain fraction, not a shared constants module.
const STAGE_SPAN = 1 / STAGES.length;
const ENTER_FRACTION = 0.15;
const EXIT_FRACTION = 0.15;

function clamp01(v: number) {
  return Math.min(1, Math.max(0, v));
}

/** A stage's card: rises in (opacity 0, x 50 -> opacity 1, x 0) as scroll
 *  progress enters its own quarter of the track, holds fully visible,
 *  then fades back out — opacity only, position stays put — as the
 *  NEXT stage's quarter begins. The last stage never fades out (there's
 *  nothing after it to hand off to); it just holds once entered.
 *
 *  Function-transformer form of useTransform throughout, not the array-
 *  range form — this codebase hit a confirmed bug (see
 *  BandScrollShowcase.tsx's own comment) where the array form computes
 *  wrong values once a SECOND scroll-linked transform exists on the same
 *  element, which is exactly the case here (opacity AND x). */
function useStageReveal(
  progress: MotionValue<number>,
  index: number,
  reduceMotion: boolean
) {
  const isLast = index === STAGES.length - 1;
  const start = index * STAGE_SPAN;
  const end = start + STAGE_SPAN;
  const enterEnd = start + STAGE_SPAN * ENTER_FRACTION;
  const exitStart = end - STAGE_SPAN * EXIT_FRACTION;

  const opacity = useTransform(progress, (p) => {
    if (reduceMotion) {
      return p >= start && (isLast ? p <= 1 : p < end) ? 1 : 0;
    }
    const enterT = clamp01((p - start) / (enterEnd - start));
    const exitT = isLast ? 0 : clamp01((p - exitStart) / (end - exitStart));
    return enterT * (1 - exitT);
  });

  const x = useTransform(progress, (p) => {
    if (reduceMotion) return 0;
    const enterT = clamp01((p - start) / (enterEnd - start));
    return 50 * (1 - enterT);
  });

  return { opacity, x };
}

function StageCard({
  stage,
  index,
  progress,
  reduceMotion,
}: {
  stage: Stage;
  index: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const { opacity, x } = useStageReveal(progress, index, reduceMotion);
  const Icon = stage.icon;
  return (
    <motion.div
      style={{ opacity, x }}
      className="absolute inset-x-6 bottom-24 z-10 mx-auto max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6 text-left backdrop-blur-md sm:bottom-28 sm:left-10 sm:inset-x-auto sm:mx-0 sm:w-80 lg:left-16"
    >
      <Icon aria-hidden="true" className="size-5 text-gold" />
      <h3 className="mt-3 text-xs font-medium tracking-[-0.04em] text-gold uppercase">
        {stage.label}
      </h3>
      <p className="mt-2 text-pretty text-sm leading-snug text-cream/70">
        {stage.detail}
      </p>
    </motion.div>
  );
}

export function TheSpecs() {
  const reduceMotion = useSafeReducedMotion();
  const isMobile = useIsMobile();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // offset ["start start", "end end"], not BandScrollShowcase.tsx's own
  // ["start end", "end end"] — a real, confirmed problem that choice
  // caused here (see BuiltToReadYouSection.tsx's own comment for the
  // general mechanics): "start end" starts advancing progress the
  // moment the wrapper enters view from below, well BEFORE the sticky
  // child actually engages (that only happens once the wrapper's own
  // top reaches the viewport's top, one full viewport-height later).
  // With four discrete stages that each need real, genuinely-pinned
  // hold time to be readable, that pre-pin approach was silently eating
  // the entire first stage's window — confirmed live via a scroll walk
  // logging which stage card was active at each step: Sensors was
  // already fading out before the section was visibly stuck at all,
  // with Battery taking over the instant it engaged. "start start"
  // holds progress at exactly 0 for the whole pre-pin approach (only
  // starting to advance once the wrapper's top reaches the viewport's
  // top, i.e. the instant the pin engages), so all four stages get
  // their full, equal share of genuinely-pinned scroll distance.
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });

  // Buttery-smooth scroll interpolation, per the Taste Mandate — both the
  // 3D model's rotation (inside TheSpecsScene -> Band) and every stage
  // card's own opacity/x below read this SAME smoothed value, not the
  // raw scrollYProgress, so the two halves of the choreography never
  // drift out of sync with each other. Skipped entirely under reduced
  // motion — useStageReveal/Band's own "timeline" variant already
  // resolve straight to their settled values in that case, so smoothing
  // the input would just add pointless lag with nothing visually
  // benefiting from it.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.5,
  });
  const progress = reduceMotion ? scrollYProgress : smoothProgress;

  return (
    // h-[400vh] — four stages, 100vh of real scroll distance each.
    <div ref={wrapperRef} className={reduceMotion ? undefined : "h-[400vh]"}>
      {/* h-[100svh], not h-screen — see MethodScrollCards.tsx for the full
         explanation: `vh` assumes the browser's toolbar chrome is fully
         hidden, so a real phone's actual visible area can be shorter than
         100vh, clipping this pinned section's bottom against its own
         overflow-hidden. `svh` is the small/guaranteed-visible size. */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-navy text-cream">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_55%_55%_at_50%_45%,color-mix(in_oklab,var(--color-gold)_14%,transparent),transparent_70%)]"
        />

        <Reveal
          y={20}
          className="relative z-10 mx-auto max-w-2xl px-6 pt-16 text-center lg:pt-20"
        >
          <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
            The Specs
          </h2>
          <p className="mx-auto mt-4 max-w-md text-pretty text-lg text-cream/70">
            The detail for those who want it.
          </p>
        </Reveal>

        <div
          className="relative z-0 h-full w-full"
          style={{ touchAction: "pan-y" }}
        >
          <TheSpecsScene
            reduceMotion={reduceMotion}
            isMobile={isMobile}
            progress={progress}
          />
        </div>

        {STAGES.map((stage, i) => (
          <StageCard
            key={stage.label}
            stage={stage}
            index={i}
            progress={progress}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </div>
  );
}
