"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";

// The strap itself, not the module — "empty_3" in the raw GLTF (no
// semantic names anywhere in this file, see Band.tsx's own header
// comment for how every mesh here was identified). 260.5 x 22.0 x 1.6mm
// raw, already long on its own local Y axis, which is exactly the
// vertical spine this section wants — no rotation needed to stand it
// up, unlike Band.tsx's own BASE_ROTATION correction for the module.
const STRAP_MESH_NAME = "empty_3";

// Woven navy textile — the same material spec Band.tsx's own header
// comment already documented for when the strap would eventually get
// rendered somewhere: non-metallic, high roughness (a fabric/soft-touch
// finish, not the module's anodised-aluminium sheen), a desaturated
// member of the shell's own #041E42 navy family rather than a separate
// palette.
const STRAP_MATERIAL_PROPS = {
  color: "#1c2733",
  roughness: 0.85,
  metalness: 0,
  side: THREE.DoubleSide,
} as const;

const STRAP_SCALE = 3.6;

// A flat plate viewed dead-on under orthographic projection shows
// literally zero surface variation (no curvature, no highlight gradient
// — every point on the face has the identical normal relative to the
// camera) and reads as an undifferentiated solid-color rectangle,
// confirmed live: indistinguishable from a plain CSS div at first pass.
// A real, if small, tilt gives the flat face a genuine varying angle to
// the light instead, which is what actually makes it read as fabric with
// dimension rather than a flat swatch.
const STRAP_TILT_Y = Math.PI / 8;
const STRAP_TILT_X = Math.PI / 24;

/** Small traveling highlight tied to the SAME scrollYProgress driving the
 *  step text beside it — reads as "the spine lighting up as you scroll
 *  through the steps," the same progress cue the old gold-fill line used
 *  to give, just carried by a real light on the real strap instead of an
 *  SVG mask. Plain useFrame + MotionValue.get() (not useTransform, which
 *  drives style props, not a mesh's own position) — same "read the live
 *  value every frame inside R3F" convention Band.tsx's own useFrame
 *  blocks already use for `scrollProgress`. */
function ProgressHighlight({ progress }: { progress: MotionValue<number> }) {
  const light = useRef<THREE.PointLight>(null);
  useFrame(() => {
    if (!light.current) return;
    const p = progress.get();
    // Strap spans roughly -0.47 (bottom) to 0.47 (top) at STRAP_SCALE —
    // matches the mesh's own raw Y bounds (±0.13m) times STRAP_SCALE.
    light.current.position.y = THREE.MathUtils.lerp(0.47, -0.47, p);
  });
  return (
    <pointLight
      ref={light}
      position={[0, 0.47, 0.15]}
      intensity={1.4}
      distance={0.6}
      color="#dac79e"
    />
  );
}

function StrapMesh() {
  const { nodes } = useGLTF("/band.glb") as unknown as {
    nodes: Record<string, THREE.Mesh>;
  };
  const strap = nodes[STRAP_MESH_NAME];
  if (!strap) return null;

  return (
    <group scale={STRAP_SCALE} rotation={[STRAP_TILT_X, STRAP_TILT_Y, 0]}>
      <mesh geometry={strap.geometry}>
        <meshStandardMaterial {...STRAP_MATERIAL_PROPS} />
      </mesh>
    </group>
  );
}

/**
 * The vertical "spine" running behind the timeline steps on
 * /for-organisations — the real 3D strap mesh from the same GLB the
 * module model uses, standing in for the previous flat SVG line + gold
 * dot markers entirely (both removed, not layered on top of this).
 *
 * Orthographic, not perspective — a flat vertical strip has no need for
 * perspective foreshortening, and it sidesteps having to tune a
 * perspective camera's distance/fov against this canvas's own unusual
 * aspect ratio (very narrow, very tall) the way every other Band scene
 * in this codebase has to for their own roughly-square canvases.
 *
 * Deliberately no StudioEnvironment/full lighting rig — this is a small
 * non-metallic decorative element, not a hero product shot; a
 * meshStandardMaterial at metalness 0 has a real diffuse response and
 * doesn't need an environment map to avoid going flat black the way the
 * module's metalness-1 hardware does (see Band.tsx's own comment on
 * exactly that point). Ambient + two directional lights is enough for a
 * matte fabric surface to read with real shape.
 */
export function TimelineBandSpine({ progress }: { progress: MotionValue<number> }) {
  return (
    <Canvas
      className="!absolute inset-0"
      orthographic
      camera={{ position: [0, 0, 2], zoom: 900, near: 0.1, far: 10 }}
      dpr={[1, 1.5]}
      gl={{
        alpha: true,
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
        toneMappingExposure: 1,
      }}
    >
      <ambientLight intensity={0.55} />
      <directionalLight position={[2, 2, 3]} intensity={1.6} color="#f4f0e9" />
      <directionalLight position={[-2, -1, 2]} intensity={0.5} color="#8fb3d9" />
      <ProgressHighlight progress={progress} />
      <Suspense fallback={null}>
        <StrapMesh />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload("/band.glb");
