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
      // z-0, explicit — guarantees this paints above the text layer's
      // z-[-1] (BuiltToReadYouSection.tsx) regardless of default stacking
      // order, since the model is now meant to visually overlap into
      // both text blocks' inner edges rather than just sit in a gap
      // between them.
      className="!absolute inset-0 z-0"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
    >
      {/* alpha: true above + no <color attach="background"> here is what
         keeps this transparent, so the section's own Deep Navy
         background shows through around/behind the model. Ambient
         trimmed 0.5->0.35 — a flat ambient fill lights every surface
         (including shadow recesses) evenly, which is exactly what was
         flattening the engraved front-face logo's contrast; a touch
         less of it is what lets the kicker light below actually carve
         out deep shadow in its recesses instead of the fill washing
         them back out. */}
      <ambientLight intensity={0.35} />
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
      {/* Dedicated "kicker" light for the front-face engraved logo — the
         spotLight above is warm-tinted (#dac79e) and fairly soft-edged
         (penumbra 0.6, angle 0.35), tuned for the gold hardware's broad
         specular sheen, not for carving crisp micro-shadow/highlight
         contrast into a shallow engraved relief — confirmed live, the
         logo was reading as "completely lost" against the shell with
         only that rig. This one is neutral white (no color tint to
         compete with the logo's own contrast), much tighter (angle
         0.15 vs 0.35, penumbra 0.15 vs 0.6 — a hard-edged, localized
         beam rather than one that washes over the whole shell), and
         higher intensity, positioned slightly above and to the side of
         the model per real product-photography practice for revealing
         engraved/embossed detail. Same no-explicit-target reasoning as
         the spotLight above — world origin is already where the model
         sits. */}
      <spotLight
        position={[1, 1, 2]}
        angle={0.15}
        penumbra={0.15}
        intensity={4}
        color="#ffffff"
      />
      <Suspense fallback={null}>
        <Band scrollProgress={progress} reduceMotion={reduceMotion} isMobile={isMobile} />
      </Suspense>
    </Canvas>
  );
}
