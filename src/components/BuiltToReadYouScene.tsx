"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { Band } from "@/components/Band";

/** The actual WebGL scene, kept in its own module (see
 *  BuiltToReadYouSection's dynamic() import) so @react-three/fiber is
 *  never touched during the server render — the same split this
 *  codebase already uses for BandScrollScene/BandSignal.
 *
 *  No <Environment> here — it was fetching its HDRI from an external CDN
 *  (raw.githack.com, which is explicitly a dev/testing proxy, not a
 *  production asset host), and when that request hung, the whole page
 *  white-screened rather than just that one section going dark. Two
 *  compounding problems, both fixed: `<Band>` (whose useGLTF call is the
 *  actual Suspense trigger) now has its own `<Suspense fallback={null}>`
 *  boundary right here, so a slow/failed load only blanks the Canvas,
 *  never bubbles up past this component; and the CDN dependency itself
 *  is gone, replaced by a synthetic light rig below (no network fetch
 *  involved, nothing to hang on) — good practice regardless of the
 *  Suspense fix, since Environment's images CDN isn't meant for
 *  production traffic anyway.
 *
 *  The rig: a low ambient fill (so the Deep Navy shells don't go fully
 *  black on their shadow side) plus a bright key light and a softer
 *  rim/fill light for form definition, and a tight spotLight aimed at
 *  the model specifically for the gold hardware's specular highlight —
 *  a `meshStandardMaterial` at metalness 0.9 has essentially nothing to
 *  reflect without at least one concentrated, close light source, no
 *  matter how bright the ambient/directional lights are. */
export function BuiltToReadYouScene({
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
      className="!absolute inset-0"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
    >
      {/* alpha: true above + no <color attach="background"> here is what
         keeps this transparent, so the section's own Deep Navy
         background shows through around/behind the model. */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#f4f0e9" />
      <directionalLight position={[-4, -2, -3]} intensity={0.6} color="#8fb3d9" />
      {/* Straight down the Z-axis, facing the camera — specifically for
         the locked state, where the model faces front-on and the angled
         key/rim lights above leave the front face under-lit. */}
      <directionalLight position={[0, 0, 5]} intensity={1.5} />
      {/* No explicit target — THREE.SpotLight's default target sits at
         world origin (0,0,0) already, which is exactly where the model
         settles once locked, so there's nothing to aim manually here. */}
      <spotLight
        position={[2, 3, 3]}
        angle={0.35}
        penumbra={0.6}
        intensity={2.2}
        color="#dac79e"
      />
      <Suspense fallback={null}>
        <Band scrollProgress={progress} reduceMotion={reduceMotion} isMobile={isMobile} />
      </Suspense>
    </Canvas>
  );
}
