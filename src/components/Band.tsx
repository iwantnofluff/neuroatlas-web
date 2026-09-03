"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";

/**
 * Real gltfjsx export of the NA·01 sensor module (public/band.glb),
 * replacing the earlier <Torus> placeholder used in BuiltToReadYouScene.
 * The source file has no semantic names at all — every mesh is
 * "empty_2".."empty_12" and every material is unnamed too (confirmed by
 * parsing the GLB's own JSON chunk directly, not just gltfjsx's
 * generated output) — so mesh identity here is inferred from actual
 * geometry rather than assumed from a name: the two largest-vertex-count
 * meshes are the module's front/back shell (the "Main Band" surface per
 * the brief — leaning into a "core module" read, the precision housing
 * around the sensor), the other nine are small hardware details (lugs,
 * pins, buttons — the "Clasp/Hardware Accents").
 *
 * Scale: the source is modeled in real-world meters (~2.5cm bounding
 * box) — ×18 brings it in line with this scene's existing unit
 * conventions (the camera/lighting rig assume ~1–2 unit sized objects,
 * matching BandModel.tsx elsewhere in this codebase) at a size that
 * sits between/slightly over the "BUILT TO READ YOU" letters behind it
 * rather than blotting them out entirely (×30 read as a flat black box
 * censoring the whole headline). ×18 is tuned for desktop specifically
 * though — on a ~375px phone the same world-scale object fills a much
 * bigger share of the (much narrower) frame, and ends up covering most
 * of both text lines instead of sitting between them (confirmed via
 * screenshot, not assumed). `isMobile` drops it to ×10 below the 768px
 * breakpoint to compensate — a plain prop, not a CSS class, since
 * Tailwind's responsive variants have no reach into a Three.js scale
 * prop at all.
 *
 * One of the two shell meshes has inverted normals (invisible when
 * solid-filled from most angles — confirmed by isolating it with a
 * wireframe material, where it rendered fine, versus solid fill, where
 * it didn't). `side: THREE.DoubleSide` on both materials sidesteps this
 * rather than patching that one mesh's winding order specifically —
 * costs nothing visually on an opaque object, and covers either shell
 * if the export changes again.
 *
 * Shell color is a lighter, slightly desaturated navy (not the near-
 * black #0A0F1D this started with) at lower roughness/higher metalness
 * — #0A0F1D with roughness 0.8 absorbed essentially all incoming light,
 * reading as a flat 2D silhouette rather than a lit 3D object; this
 * combination actually catches the rig's rim/fill lights.
 */
const SHELL_MATERIAL_PROPS = {
  color: "#1E2B4D",
  roughness: 0.4,
  metalness: 0.3,
  side: THREE.DoubleSide,
} as const;

const HARDWARE_MATERIAL_PROPS = {
  color: "#D4AF37",
  roughness: 0.15,
  metalness: 0.9,
  side: THREE.DoubleSide,
} as const;

const MODEL_SCALE_DESKTOP = 18;
const MODEL_SCALE_MOBILE = 10;

/** The CAD export's own "up" axis doesn't match this scene's — the
 *  module renders standing on end (portrait) rather than lying flat
 *  (landscape), like a watch face. This is a fixed correction applied to
 *  a static inner group wrapping the meshes, not to the outer animated
 *  group (whose rotation.x/y are set imperatively every frame for the
 *  scroll spin + tilt) — composing a third fixed axis onto a group two
 *  OTHER axes are already being driven on risks the Euler angles
 *  combining unpredictably. Applied in the model's own local space
 *  instead, so the outer group's spin/tilt keep behaving exactly as
 *  before regardless. */
const BASE_ROTATION: readonly [number, number, number] = [0, 0, Math.PI / 2];

/** Multiplier on the lock rotation — `Math.PI * 2` (2π) is a full turn,
 *  which lands the model back at its exact starting orientation, and
 *  that orientation happens to show the gold hardware edge-on rather
 *  than facing the camera. Tuned by actually rendering both of the
 *  brief's suggested values (1.75 and 2.25) and comparing which one
 *  presents the hardware face-on at the locked state — see the
 *  component's own verification notes. */
const LOCK_ROTATION_TURNS = 1.75;

/** `scrollProgress` is a Framer Motion MotionValue (0–1), read every
 *  frame via `.get()` rather than subscribed — same convention as
 *  BandModel.tsx. Position/rotation math is unchanged from the Torus
 *  placeholder it replaces: `t` ramps 0→1 across just the first 40% of
 *  the scroll range, then clamps at 1, so the model rises from off-
 *  screen while completing one full turn, then locks in place for the
 *  rest of the scroll (0.4–1.0) — the exact "position -5→0, rotation
 *  0→2π, then holds" sequence from the original plan. */
export function Band({
  scrollProgress,
  reduceMotion,
  isMobile = false,
}: {
  scrollProgress: MotionValue<number>;
  reduceMotion: boolean;
  isMobile?: boolean;
}) {
  const { nodes } = useGLTF("/band.glb") as unknown as {
    nodes: Record<string, THREE.Mesh>;
  };
  const group = useRef<THREE.Group>(null);
  const modelScale = isMobile ? MODEL_SCALE_MOBILE : MODEL_SCALE_DESKTOP;

  const { shellMeshes, hardwareMeshes } = useMemo(() => {
    const meshes = Object.values(nodes).filter(
      (n): n is THREE.Mesh => Boolean((n as THREE.Mesh)?.isMesh)
    );
    const byVertexCountDesc = [...meshes].sort(
      (a, b) =>
        (b.geometry.attributes.position?.count ?? 0) -
        (a.geometry.attributes.position?.count ?? 0)
    );
    return {
      shellMeshes: byVertexCountDesc.slice(0, 2),
      hardwareMeshes: byVertexCountDesc.slice(2),
    };
  }, [nodes]);

  useFrame(() => {
    const g = group.current;
    if (!g) return;

    if (reduceMotion) {
      g.position.y = 0;
      g.rotation.y = 0;
      g.rotation.x = 0.4;
      return;
    }

    const p = scrollProgress.get();
    const t = THREE.MathUtils.clamp(p / 0.4, 0, 1);
    g.position.y = THREE.MathUtils.lerp(-5, 0, t);
    g.rotation.y = t * Math.PI * LOCK_ROTATION_TURNS;
    // A gentle fixed tilt (not scroll-driven) so the module reads as a
    // dimensional object rather than flat, face-on.
    g.rotation.x = 0.4;
  });

  return (
    <group ref={group} scale={modelScale} position={[0, -5, 0]} dispose={null}>
      <group rotation={BASE_ROTATION}>
        {shellMeshes.map((mesh, i) => (
          <mesh
            key={`shell-${i}`}
            geometry={mesh.geometry}
            position={mesh.position}
            rotation={mesh.rotation}
            scale={mesh.scale}
          >
            <meshStandardMaterial {...SHELL_MATERIAL_PROPS} />
          </mesh>
        ))}
        {hardwareMeshes.map((mesh, i) => (
          <mesh
            key={`hardware-${i}`}
            geometry={mesh.geometry}
            position={mesh.position}
            rotation={mesh.rotation}
            scale={mesh.scale}
          >
            <meshStandardMaterial {...HARDWARE_MATERIAL_PROPS} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

useGLTF.preload("/band.glb");
