"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useMotionValue } from "framer-motion";
import * as THREE from "three";
import { Band } from "@/components/Band";
import { StudioEnvironment } from "@/components/StudioEnvironment";

const MODEL_SCALE_DESKTOP = 30;

/** The actual WebGL scene — kept in its own module so it can be lazy-loaded
 *  client-only (see HowToGetStartedSection's own dynamic() import), without
 *  pulling @react-three/fiber into the server render at all — same split
 *  every other Band-model scene in this codebase already uses.
 *
 *  "xray" variant, same as TheSpecs' own click-driven system, just driven
 *  by scroll progress (via `targetRotation`) instead of a reticle click —
 *  the model still just damps toward whichever pose is currently active,
 *  Band.tsx has no idea the trigger is scroll rather than a click. No
 *  `activeAnchorKey`/`anchorRef` — this section has no leader-line
 *  annotations pointing at specific hardware, so that half of the xray
 *  variant's contract is simply left unused (both are optional).
 *
 *  Lighting rig copied verbatim from TheSpecsScene.tsx/BandScrollScene.tsx
 *  rather than reinvented, so the model catches light identically
 *  everywhere it appears. `alpha: true` (no `<color attach="background">`)
 *  keeps this transparent — the section's own cream background shows
 *  through, unlike every other scene that shares this rig (all sit on a
 *  dark navy section) — confirmed live that a fully opaque navy/metal
 *  model still reads correctly against a light backdrop, since the
 *  lighting/environment shapes the model's OWN surface, not the page
 *  behind it. */
export function HowToGetStartedScene({
  reduceMotion,
  targetRotation,
}: {
  reduceMotion: boolean;
  targetRotation: { x: number; y: number };
}) {
  const staticProgress = useMotionValue(0);

  return (
    <Canvas
      className="!absolute inset-0"
      style={{ touchAction: "pan-y" }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      gl={{
        alpha: true,
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
        toneMappingExposure: 1,
      }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#f4f0e9" />
      <directionalLight position={[-4, -2, -3]} intensity={0.6} color="#8fb3d9" />
      <directionalLight position={[0, 0, 5]} intensity={2.5} />
      <spotLight position={[2, 3, 3]} angle={0.35} penumbra={0.6} intensity={3.2} color="#dac79e" />
      <spotLight position={[0.6, 0.7, 4.3]} angle={0.25} penumbra={0.2} intensity={7} color="#ffffff" />
      <StudioEnvironment />
      <Suspense fallback={null}>
        <Band
          scrollProgress={staticProgress}
          reduceMotion={reduceMotion}
          variant="xray"
          scale={MODEL_SCALE_DESKTOP}
          targetRotation={targetRotation}
        />
      </Suspense>
    </Canvas>
  );
}
