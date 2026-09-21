"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { Band } from "@/components/Band";
import { StudioEnvironment } from "@/components/StudioEnvironment";

const TIMELINE_MODEL_SCALE_DESKTOP = 34;
// 22 -> 30 (BandScrollScene's own history) -> 42 — this value's old
// tuning was for a completely different container shape: the pre-
// scroll-timeline stacked-card fallback's confined h-[45vh] mobile
// canvas. The scroll-driven timeline now gives mobile the same full-
// bleed sticky viewport desktop gets (see TheSpecs.tsx), so the model
// reads small in that much larger box at 42 — confirmed live via
// screenshot, not assumed from the box's height ratio alone (the same
// standard this codebase already holds itself to for every other
// scene-specific scale constant).
const TIMELINE_MODEL_SCALE_MOBILE = 30;

/** The actual WebGL scene, kept in its own module so it can be lazy-loaded
 * client-only (see TheSpecsSceneClient), without pulling @react-three/fiber
 * into the server render at all — same split BandScrollScene.tsx uses.
 *
 * Lighting rig copied verbatim from BandScrollScene.tsx (itself copied
 * from BuiltToReadYouScene.tsx) rather than reinvented, so the shell/
 * hardware materials catch light identically everywhere <Band> appears.
 *
 * `progress` is expected to already be spring-smoothed (see TheSpecs.tsx's
 * own `useSpring`) — this scene just forwards it straight into <Band>,
 * which samples it every frame via `.get()`, same convention as every
 * other scroll-driven variant. */
export function TheSpecsScene({
  reduceMotion,
  isMobile,
  progress,
}: {
  reduceMotion: boolean;
  isMobile: boolean;
  progress: MotionValue<number>;
}) {
  return (
    <Canvas
      className="!absolute inset-0"
      // touchAction/pointerEvents here, not as Tailwind classes on
      // TheSpecs.tsx's own wrapper div — a real, confirmed bug those
      // would otherwise be: R3F's <Canvas> renders its OWN wrapper div
      // around the actual <canvas> element (this component's `style`
      // prop lands on THAT div, not on the canvas tag itself, confirmed
      // by inspecting the rendered DOM directly), and that div sets its
      // own explicit inline `pointer-events: auto` regardless of
      // whatever an ANCESTOR further up computes — CSS inheritance
      // doesn't win against a more specific explicit value. `pan-y`
      // means a swipe over the model always scrolls the page — the
      // whole point of this section now that it's scroll-driven.
      style={{ touchAction: "pan-y" }}
      // 2->1.5 — see BandScrollScene.tsx's own comment: the fully-
      // metallic materials + <StudioEnvironment /> measurably raised
      // per-pixel shading cost, and capping the DPR ceiling is the
      // standard lever for that (quadratic cost — a Retina 2x display
      // shades 4x the pixels of 1x).
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
    >
      {/* 0.4 -> 0.75 ambient, 2.2 -> 3.2 key spotlight — a direct "too
         dark to see the hardware details" request: this rig's original
         values (still used verbatim in BandScrollScene.tsx, where the
         model sits far smaller and further from camera) left this
         section's much larger, much closer casing reading mostly as
         shadow once you're actually trying to read hardware detail off
         it rather than just its silhouette. Raised only the fill
         (ambient) and the front-facing key spotlight already aimed at
         the model — not the rim/back lights — so the fix is "brighter
         face, still has real shadow shape," not "flatly lit." */}
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#f4f0e9" />
      <directionalLight position={[-4, -2, -3]} intensity={0.6} color="#8fb3d9" />
      <directionalLight position={[0, 0, 5]} intensity={2.5} />
      <spotLight
        position={[2, 3, 3]}
        angle={0.35}
        penumbra={0.6}
        intensity={3.2}
        color="#dac79e"
      />
      <spotLight
        position={[0.6, 0.7, 4.3]}
        angle={0.25}
        penumbra={0.2}
        intensity={7}
        color="#ffffff"
      />
      <StudioEnvironment />
      <Suspense fallback={null}>
        <Band
          scrollProgress={progress}
          reduceMotion={reduceMotion}
          variant="timeline"
          scale={isMobile ? TIMELINE_MODEL_SCALE_MOBILE : TIMELINE_MODEL_SCALE_DESKTOP}
        />
      </Suspense>
    </Canvas>
  );
}
