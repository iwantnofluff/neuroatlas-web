"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { Band } from "@/components/Band";

/** Model scale for THIS scene specifically — Band.tsx's own
 *  MODEL_SCALE_DESKTOP/MOBILE constants were tuned for
 *  BuiltToReadYouSection's full-bleed, viewport-spanning canvas; this
 *  scene's canvas is a compact, always-roughly-square container
 *  (280px up to 520px depending on breakpoint — see BandScrollShowcase's
 *  own wrapper). Because that container is square at every breakpoint
 *  and the camera's FOV/distance below are fixed, a single scale reads
 *  consistently across all of them (unlike BuiltToReadYouSection, whose
 *  full-viewport canvas has a genuinely different aspect/proportion at
 *  each breakpoint against a CSS-sized text overlay) — no isMobile
 *  branch needed here. Tuned by rendering it and comparing against the
 *  circular callout-line composition this scene already has, not
 *  assumed from BuiltToReadYouSection's own value.
 */
const SHOWCASE_MODEL_SCALE = 24;

/** The actual WebGL scene — kept in its own module so it can be lazy-loaded
 * client-only (see BandScrollShowcase), without pulling @react-three/fiber
 * into the server render at all.
 *
 * Renders the real <Band> GLTF model (was BandModel, a stylized procedural
 * loop-plus-boxes approximation) with the exact lighting rig
 * BuiltToReadYouScene.tsx uses — copied verbatim rather than reinvented, so
 * the Champagne Gold hardware catches light the same way in both places.
 * <Band> needs its own <Suspense> boundary here (its useGLTF call is the
 * actual suspense trigger) — BandModel never needed one since it built its
 * geometry procedurally with nothing to load. */
export function BandScrollScene({
  reduceMotion,
  progress,
}: {
  reduceMotion: boolean;
  progress: MotionValue<number>;
}) {
  return (
    <Canvas
      className="!absolute inset-0"
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
          scale={SHOWCASE_MODEL_SCALE}
        />
      </Suspense>
    </Canvas>
  );
}
