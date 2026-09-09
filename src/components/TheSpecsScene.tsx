"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import type { RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMotionValue } from "framer-motion";
import * as THREE from "three";
import { Band } from "@/components/Band";
import { StudioEnvironment } from "@/components/StudioEnvironment";
import type { SpecKey } from "@/lib/specAnchors";

const XRAY_MODEL_SCALE_DESKTOP = 34;
const XRAY_MODEL_SCALE_MOBILE = 22;

export type ProjectedPoint = { x: number; y: number } | null;

/** Lives INSIDE the Canvas specifically so it can read the live camera
 *  and canvas size via useThree() and tick every frame via useFrame —
 *  neither is available outside the R3F tree, which is the whole reason
 *  this tracking has to happen in here rather than back in TheSpecs.tsx.
 *
 *  Reports the result through a plain callback, not React state — a
 *  setState here would re-render the entire DOM tree up to 60 times a
 *  second for a single line's coordinates. `onProjectedRef` (updated via
 *  an effect, read inside useFrame) is the standard R3F pattern for
 *  always calling the LATEST callback a parent passed down without
 *  making useFrame's own closure stale across renders. TheSpecs.tsx
 *  applies the result directly to a DOM node via a ref, bypassing React
 *  entirely for the per-frame write. */
function AnchorProjector({
  anchorRef,
  onProjected,
}: {
  anchorRef: RefObject<THREE.Object3D | null>;
  onProjected: (point: ProjectedPoint) => void;
}) {
  // Two separate selectors, not one selector returning `{camera, size}`
  // — that object literal is a new reference every store update (R3F's
  // clock ticks the store every frame), which would defeat the point of
  // selecting at all and re-render this on every frame regardless.
  // Each of these two only re-renders when THAT specific field's own
  // reference changes (camera: essentially never; size: on resize).
  const camera = useThree((state) => state.camera);
  const size = useThree((state) => state.size);
  const vector = useMemo(() => new THREE.Vector3(), []);
  const onProjectedRef = useRef(onProjected);
  useEffect(() => {
    onProjectedRef.current = onProjected;
  });

  useFrame(() => {
    const anchor = anchorRef.current;
    if (!anchor) {
      onProjectedRef.current(null);
      return;
    }
    anchor.getWorldPosition(vector);
    // Vector3.project (NOT a "camera.project" method — THREE has no
    // such method; projection is a Vector3 operation that takes the
    // camera as its argument) converts world space to Normalized
    // Device Coordinates: x/y in [-1, 1], z the depth. z > 1 means the
    // point is behind the camera — guard against drawing a line to a
    // mirrored/garbage 2D point in that case (not expected in normal
    // use here, since the anchor always sits on the small centered
    // model well within view, but real state, not assumed).
    vector.project(camera);
    if (vector.z > 1) {
      onProjectedRef.current(null);
      return;
    }
    onProjectedRef.current({
      x: (vector.x * 0.5 + 0.5) * size.width,
      y: (-vector.y * 0.5 + 0.5) * size.height,
    });
  });

  return null;
}

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
  activeAnchorKey,
  onProjected,
}: {
  reduceMotion: boolean;
  isMobile: boolean;
  targetRotation: { x: number; y: number };
  /** Which spec's 3D anchor to render the glowing dot at and track. */
  activeAnchorKey: SpecKey;
  /** Called every frame with the active anchor's current 2D screen
   *  position (relative to this canvas, which is the same box as the
   *  section — see TheSpecs.tsx), or null while it can't be resolved
   *  (not yet mounted, or behind the camera). Omit entirely (leave
   *  undefined) to skip tracking altogether — TheSpecs.tsx does this
   *  below the `lg` breakpoint, where no leader line is ever drawn. */
  onProjected?: (point: ProjectedPoint) => void;
}) {
  const staticProgress = useMotionValue(0);
  const anchorRef = useRef<THREE.Mesh>(null);

  return (
    <Canvas
      className="!absolute inset-0"
      // 2->1.5 — see BandScrollScene.tsx's own comment: the fully-
      // metallic materials + <StudioEnvironment /> measurably raised
      // per-pixel shading cost, and capping the DPR ceiling is the
      // standard lever for that (quadratic cost — a Retina 2x display
      // shades 4x the pixels of 1x).
      dpr={[1, 1.5]}
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
      <StudioEnvironment />
      <Suspense fallback={null}>
        <Band
          scrollProgress={staticProgress}
          reduceMotion={reduceMotion}
          variant="xray"
          scale={isMobile ? XRAY_MODEL_SCALE_MOBILE : XRAY_MODEL_SCALE_DESKTOP}
          targetRotation={targetRotation}
          activeAnchorKey={activeAnchorKey}
          anchorRef={anchorRef}
        />
      </Suspense>
      {onProjected && <AnchorProjector anchorRef={anchorRef} onProjected={onProjected} />}
    </Canvas>
  );
}
