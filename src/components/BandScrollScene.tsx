"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { Band } from "@/components/Band";

/** Model scale for THIS scene — Band.tsx's own MODEL_SCALE_DESKTOP/MOBILE
 *  constants were tuned for BuiltToReadYouSection's composition (model
 *  settling in a gap between two text halves); this scene's brief is the
 *  opposite — "grid-breaking", the model scaled "way up" so it
 *  intentionally overlaps and obscures parts of the centered headline
 *  behind it, physically breaking out of its own frame. The canvas is
 *  now full-bleed (`!absolute inset-0` over the ENTIRE pinned viewport,
 *  not a small square container as before), so unlike the previous
 *  version of this scene it DOES need an isMobile split — a full-
 *  viewport canvas has a genuinely different aspect/proportion at each
 *  breakpoint, the same reason BuiltToReadYouSection needed one. Both
 *  values tuned live against real screenshots, not assumed. */
const SHOWCASE_MODEL_SCALE_DESKTOP = 46;
const SHOWCASE_MODEL_SCALE_MOBILE = 26;

/** The actual WebGL scene — kept in its own module so it can be lazy-loaded
 * client-only (see BandScrollShowcase), without pulling @react-three/fiber
 * into the server render at all.
 *
 * Renders the real <Band> GLTF model with the exact lighting rig
 * BuiltToReadYouScene.tsx uses — copied verbatim rather than reinvented, so
 * the Champagne Gold hardware catches light the same way in both places.
 * <Band> needs its own <Suspense> boundary here (its useGLTF call is the
 * actual suspense trigger). */
export function BandScrollScene({
  reduceMotion,
  progress,
  isMobile,
}: {
  reduceMotion: boolean;
  progress: MotionValue<number>;
  isMobile: boolean;
}) {
  return (
    <Canvas
      // z-0, explicit — guarantees this paints above the centered
      // headline's z-[-1] regardless of default stacking order, the
      // same reasoning as BuiltToReadYouScene's own Canvas: the model
      // overlapping the text is the deliberate design here, not an
      // accident of paint order.
      className="!absolute inset-0 z-0"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#f4f0e9" />
      <directionalLight position={[-4, -2, -3]} intensity={0.6} color="#8fb3d9" />
      <directionalLight position={[0, 0, 5]} intensity={1.5} />
      <spotLight
        position={[2, 3, 3]}
        angle={0.35}
        penumbra={0.6}
        intensity={2.2}
        color="#dac79e"
      />
      <Suspense fallback={null}>
        <Band
          scrollProgress={progress}
          reduceMotion={reduceMotion}
          variant="showcase"
          scale={isMobile ? SHOWCASE_MODEL_SCALE_MOBILE : SHOWCASE_MODEL_SCALE_DESKTOP}
        />
      </Suspense>
    </Canvas>
  );
}
