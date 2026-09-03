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

// Desktop 22 (was 18) — the "Built To"/"Read You" sandwich (see
// BuiltToReadYouSection.tsx) now closes its text blocks together at the
// exact vertical center instead of leaving a large empty gap around the
// model; at the old scale the model read as too small for that tighter
// space ("a bit lost in the gap"). +22% is enough to intentionally
// overlap both lines' inner edges without swallowing them.
//
// Mobile — NOTE this value's history only makes sense in light of
// BuiltToReadYouSection.tsx's OWN history: 8 was tuned down from 10
// specifically to stop the model overlapping/obscuring the old mobile
// "sandwich" headline (confirmed live at the time: 10-12 swallowed
// enough of both lines that "BUILT TO"/"READ YOU" stopped reading as
// words). Mobile no longer uses that layout at all — it now gets an
// ordinary top-anchored two-line headline with the model free in the
// untouched middle of the screen (see that file's mobile-only block),
// so there's nothing left for the model to avoid overlapping. At the
// old value of 8 it read as too small and lost in that now-empty
// middle (client feedback, live: "tighten up the space around the 3D
// model, make it bigger, maybe it's too small on a narrow device").
// 20 — well past the old text-avoidance ceiling — is what actually
// reads as a confident focal object filling that space rather than a
// small thing floating in a big void; checked live on iPhone 14 and SE
// that it still clears the headline above and subtext below with no
// overlap at any point in the scroll (position/rotation change, scale
// doesn't).
const MODEL_SCALE_DESKTOP = 22;
const MODEL_SCALE_MOBILE = 20;

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

/** "showcase" variant only (see the `variant` prop below) — BandScrollShowcase
 *  pins THREE signal callouts (HRV, Breathing, Stress Load) to the ranges
 *  [0,0.34]/[0.33,0.67]/[0.66,1] and wants the model to settle into a
 *  distinct, readable pose for each one (front-on, ~90° side profile, a
 *  more pronounced tilt) rather than spinning continuously or freezing
 *  after an initial rise — a completely different narrative from the
 *  "reveal" variant's rise-then-lock, hence a separate keyframe set
 *  rather than reusing LOCK_ROTATION_TURNS' single target angle.
 *  {p, ry, rx} keyframes are sampled every frame (see sampleShowcasePose)
 *  by finding the surrounding pair for the current scroll progress and
 *  smoothstep-easing between them — flat "hold" pairs (two adjacent
 *  keyframes with identical ry/rx) are what keep the pose settled and
 *  readable through the middle of each signal's own range, rather than
 *  still visibly rotating while its callout text is trying to be read. */
const SHOWCASE_POSE_KEYFRAMES: ReadonlyArray<{ p: number; ry: number; rx: number }> = [
  { p: 0, ry: -0.35, rx: 0.15 },
  { p: 0.17, ry: 0, rx: 0.3 }, // front-on, settled mid-HRV
  { p: 0.34, ry: 0, rx: 0.3 }, // hold through end of HRV's range
  { p: 0.5, ry: Math.PI / 2, rx: 0.3 }, // side profile, settled mid-Breathing
  { p: 0.67, ry: Math.PI / 2, rx: 0.3 }, // hold through end of Breathing's range
  { p: 0.83, ry: Math.PI * 0.58, rx: 0.55 }, // more pronounced tilt, settled mid-Stress Load
  { p: 1, ry: Math.PI * 0.58, rx: 0.55 }, // hold through end
];

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function sampleShowcasePose(p: number) {
  const kf = SHOWCASE_POSE_KEYFRAMES;
  if (p <= kf[0].p) return { ry: kf[0].ry, rx: kf[0].rx };
  for (let i = 0; i < kf.length - 1; i++) {
    const a = kf[i];
    const b = kf[i + 1];
    if (p <= b.p) {
      const t = a.p === b.p ? 1 : smoothstep((p - a.p) / (b.p - a.p));
      return {
        ry: THREE.MathUtils.lerp(a.ry, b.ry, t),
        rx: THREE.MathUtils.lerp(a.rx, b.rx, t),
      };
    }
  }
  const last = kf[kf.length - 1];
  return { ry: last.ry, rx: last.rx };
}

/** `scrollProgress` is a Framer Motion MotionValue (0–1), read every
 *  frame via `.get()` rather than subscribed — same convention as
 *  BandModel.tsx.
 *
 *  `variant` picks which narrative drives position/rotation:
 *  - "reveal" (default, BuiltToReadYouSection's exact original behavior,
 *    untouched): `t` ramps 0→1 across just the first 40% of the scroll
 *    range then clamps at 1, so the model rises from off-screen while
 *    completing one full turn, then locks in place for the rest of the
 *    scroll — the "position -5→0, rotation 0→2π, then holds" sequence.
 *  - "showcase" (BandScrollShowcase): the model is already fully visible
 *    from the start (no rise — position.y stays 0 throughout), and
 *    rotation continuously eases through SHOWCASE_POSE_KEYFRAMES above
 *    instead.
 *
 *  `scale` overrides the isMobile-based MODEL_SCALE_DESKTOP/MOBILE
 *  ternary entirely when supplied — those two constants were tuned
 *  specifically for BuiltToReadYouSection's full-bleed canvas;
 *  BandScrollShowcase's model sits in a much smaller, differently-framed
 *  container and needs its own independently-tuned value. */
export function Band({
  scrollProgress,
  reduceMotion,
  isMobile = false,
  variant = "reveal",
  scale,
}: {
  scrollProgress: MotionValue<number>;
  reduceMotion: boolean;
  isMobile?: boolean;
  variant?: "reveal" | "showcase";
  scale?: number;
}) {
  const { nodes } = useGLTF("/band.glb") as unknown as {
    nodes: Record<string, THREE.Mesh>;
  };
  const group = useRef<THREE.Group>(null);
  const modelScale = scale ?? (isMobile ? MODEL_SCALE_MOBILE : MODEL_SCALE_DESKTOP);

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

    if (variant === "showcase") {
      g.position.y = 0;
      if (reduceMotion) {
        // A representative settled front-on pose — there's no single
        // "final" state in a 3-part narrative to freeze on, so this
        // picks the first (front-facing) one rather than an arbitrary
        // mid-rotation angle.
        g.rotation.y = 0;
        g.rotation.x = 0.3;
        return;
      }
      const pose = sampleShowcasePose(scrollProgress.get());
      g.rotation.y = pose.ry;
      g.rotation.x = pose.rx;
      return;
    }

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
    <group
      ref={group}
      scale={modelScale}
      position={[0, variant === "showcase" ? 0 : -5, 0]}
      dispose={null}
    >
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
