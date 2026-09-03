"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { Band } from "@/components/Band";

/** Model scale for THIS scene. A previous pass scaled this "way up" to
 *  deliberately overlap the CENTERED headline behind it — client
 *  feedback: that made the headline illegible, not just artfully
 *  overlapped. The headline has since moved to the top of the viewport
 *  (see BandScrollShowcase.tsx) and this canvas is now confined to the
 *  bottom ~72% of it (was full-bleed `inset-0`) so the model can
 *  dominate the center/bottom without ever reaching the words. Scale
 *  tuned down from the previous pass to match — a shorter canvas box
 *  means the same world-space object occupies proportionally MORE of
 *  its own (now smaller) vertical frame, confirmed live via screenshot
 *  rather than assumed from the box's height ratio alone. */
const SHOWCASE_MODEL_SCALE_DESKTOP = 30;
const SHOWCASE_MODEL_SCALE_MOBILE = 17;

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
      // Confined to the bottom ~72% of the viewport (was full-bleed
      // inset-0) — this is what actually keeps the model out of the
      // headline's territory at the top, rather than relying on scale
      // alone to avoid it. z-0 still explicit: guarantees this paints
      // above the headline's z-[-1] regardless of default stacking
      // order, so any deliberate slight overlap at the very bottom
      // edge of the text still shows the model in front of it.
      className="!absolute inset-x-0 bottom-0 z-0 h-[72%]"
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
