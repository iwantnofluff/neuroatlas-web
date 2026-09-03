"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useMotionValue } from "framer-motion";
import { Band } from "@/components/Band";

const XRAY_MODEL_SCALE_DESKTOP = 34;
const XRAY_MODEL_SCALE_MOBILE = 22;

/** The actual WebGL scene, kept in its own module so it can be lazy-loaded
 * client-only (see TheSpecsSceneClient), without pulling @react-three/fiber
 * into the server render at all — same split BandScrollScene.tsx already
 * uses.
 *
 * Lighting rig copied verbatim from BandScrollScene.tsx (itself copied
 * from BuiltToReadYouScene.tsx) rather than reinvented, so the Champagne
 * Gold hardware catches light identically everywhere it appears.
 *
 * `<Band>` still wants a `scrollProgress` MotionValue (shared prop
 * contract across all three variants) even though the "xray" variant
 * never reads it — a local, never-updated `useMotionValue(0)` satisfies
 * that without wiring up a real scroll listener this scene has no use
 * for. */
export function TheSpecsScene({
  reduceMotion,
  isMobile,
  targetRotation,
}: {
  reduceMotion: boolean;
  isMobile: boolean;
  targetRotation: { x: number; y: number };
}) {
  const staticProgress = useMotionValue(0);

  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#f4f0e9" />
      <directionalLight position={[-4, -2, -3]} intensity={0.6} color="#8fb3d9" />
      <directionalLight position={[0, 0, 5]} intensity={2.5} />
      <spotLight
        position={[2, 3, 3]}
        angle={0.35}
        penumbra={0.6}
        intensity={2.2}
        color="#dac79e"
      />
      <spotLight
        position={[0.6, 0.7, 4.3]}
        angle={0.25}
        penumbra={0.2}
        intensity={7}
        color="#ffffff"
      />
      <Suspense fallback={null}>
        <Band
          scrollProgress={staticProgress}
          reduceMotion={reduceMotion}
          variant="xray"
          scale={isMobile ? XRAY_MODEL_SCALE_MOBILE : XRAY_MODEL_SCALE_DESKTOP}
          targetRotation={targetRotation}
        />
      </Suspense>
    </Canvas>
  );
}
