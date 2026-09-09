"use client";

import { useMemo, useRef } from "react";
import type { Ref } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { SPEC_ANCHORS, SPEC_ANCHOR_DOT_RADIUS, type SpecKey } from "@/lib/specAnchors";

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
 * combination actually catches the rig's rim/fill lights. #1E2B4D ->
 * #1B2340 per a direct client color pick — close to the same hue/depth,
 * still well clear of #0A0F1D's near-black floor.
 */
// Machined-metal pass: metalness 1 (was 0.4) + roughness 0.25 (was 0.3)
// on BOTH materials below, per the client's own explicit spec — a
// "premium, machined-metal product," not the part-plastic read
// metalness 0.4 gave the shell. metalness 1 needs real reflections to
// look like metal rather than flat-shaded black (a fully metallic
// surface has no diffuse component left at all — everything it shows
// is either a direct specular highlight from a light or a reflection of
// its environment), which is what the new procedural <Environment> in
// every scene that renders this component is for — see e.g.
// BandScrollScene.tsx's own comment on why that isn't a `preset`.
// Deep Navy shell / Champagne Gold hardware unchanged.
//
// Shell roughness bumped 0.25 -> 0.32 specifically (hardware left at
// 0.25) after this read as a near-black object in production with only
// a couple of sharp gold glints — a razor-low roughness is a near-
// mirror finish, which only reflects light back from the exact narrow
// angle it's coming from; the shell's own broad, mostly-flat faces were
// simply missing that one angle from most camera positions. A touch
// more roughness blurs/spreads the reflection so the shell picks up
// light across more of its surface instead of nothing-or-a-glint, while
// staying well short of a matte/plastic look. Paired with
// StudioEnvironment.tsx's new wraparound fill panels (same root cause,
// see that file's comment) rather than relying on either fix alone.
const SHELL_MATERIAL_PROPS = {
  color: "#1B2340",
  roughness: 0.32,
  metalness: 1,
  side: THREE.DoubleSide,
} as const;

const HARDWARE_MATERIAL_PROPS = {
  color: "#D4AF37",
  roughness: 0.25,
  metalness: 1,
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

/** "showcase" variant only (see the `variant` prop below) — the model
 *  should read as a continuous, fluid tumble across the WHOLE scroll
 *  range now that the three signal callouts (HRV, Breathing, Stress
 *  Load) are persistent, organically-scattered UI elements rather than
 *  edge-pointing labels that needed the model to hold still at a
 *  specific readable pose while each one was active — an earlier
 *  version of this used flat "hold" pairs between poses for exactly
 *  that reason, which is no longer needed now the callouts don't
 *  depend on the model being static to be legible. {p, ry, rx}
 *  keyframes are sampled every frame (see sampleShowcasePose) by
 *  finding the surrounding pair for the current scroll progress and
 *  smoothstep-easing between them, on BOTH rotation.y and rotation.x
 *  simultaneously — a genuine multi-axis tumble, not a single-axis
 *  spin with an incidental fixed tilt. */
const SHOWCASE_POSE_KEYFRAMES: ReadonlyArray<{ p: number; ry: number; rx: number }> = [
  { p: 0, ry: -0.5, rx: -0.3 },
  { p: 0.34, ry: 0.8, rx: 0.5 },
  { p: 0.67, ry: 1.8, rx: 0.2 },
  { p: 1, ry: 2.6, rx: 0.65 },
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
 *  - "xray" (TheSpecs): not scroll-driven at all — `scrollProgress` is
 *    still accepted (kept required so every call site shares one prop
 *    contract) but never read in this branch. Rotation instead damps
 *    toward whatever `targetRotation` currently holds, every frame,
 *    using the same `THREE.MathUtils.lerp` "smooth follow" already used
 *    for BandModel.tsx's pointer-tilt above — no new dependency (no
 *    react-spring/framer-motion-3d) needed for a physical-feeling ease
 *    toward a moving target. reduceMotion snaps straight to the target
 *    every frame (lerp factor 1) instead of easing, matching this
 *    codebase's standing "still functions, just instant" convention.
 *
 *  `scale` overrides the isMobile-based MODEL_SCALE_DESKTOP/MOBILE
 *  ternary entirely when supplied — those two constants were tuned
 *  specifically for BuiltToReadYouSection's full-bleed canvas;
 *  BandScrollShowcase's and TheSpecs' models each sit in their own
 *  differently-framed container and need their own independently-tuned
 *  value. */
export function Band({
  scrollProgress,
  reduceMotion,
  isMobile = false,
  variant = "reveal",
  scale,
  targetRotation,
  activeAnchorKey,
  anchorRef,
  autoRotate = false,
}: {
  scrollProgress: MotionValue<number>;
  reduceMotion: boolean;
  isMobile?: boolean;
  variant?: "reveal" | "showcase" | "xray";
  scale?: number;
  /** "xray" only — the Euler x/y the model should currently ease toward.
   *  Ignored entirely when `autoRotate` is true. */
  targetRotation?: { x: number; y: number };
  /** "xray" only — which spec's anchor point to render the glowing dot
   *  at (see specAnchors.ts). Undefined renders no dot at all. */
  activeAnchorKey?: SpecKey;
  /** "xray" only — a ref TheSpecsScene.tsx reads every frame (via
   *  `.getWorldPosition()`) to project this exact point to 2D for the
   *  leader line. Attached directly to the dot mesh itself, not a
   *  separate invisible marker, so the projected point and the visible
   *  dot can never drift apart — see specAnchors.ts's own comment. */
  anchorRef?: Ref<THREE.Mesh>;
  /** "xray" only — TheSpecs.tsx's mobile layout has no click-driven
   *  spec selection to steer the model toward (the whole annotation UI
   *  is hidden below `md`, see that file's own comment), so it passes
   *  this instead: a slow, continuous turntable spin, purely ambient,
   *  just enough to still show off the hardware. Takes over the
   *  rotation update entirely — `targetRotation` is read at all only
   *  when this is false. */
  autoRotate?: boolean;
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

  useFrame((_state, delta) => {
    const g = group.current;
    if (!g) return;

    if (variant === "xray") {
      g.position.y = 0;
      if (autoRotate) {
        // A representative settled front-on tilt (matches the
        // "showcase" variant's own reduceMotion pose just below) rather
        // than 0 — a flat, un-tilted spin reads as a coin spinning edge-
        // on more than a product turning to show itself off. reduceMotion
        // holds it there entirely, same "still functions, just instant"
        // convention as every other variant's own reduceMotion branch.
        g.rotation.x = 0.3;
        if (!reduceMotion) g.rotation.y += delta * 0.35;
        return;
      }
      const target = targetRotation ?? { x: 0.3, y: 0 };
      const damp = reduceMotion ? 1 : 0.08;
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, target.x, damp);
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, target.y, damp);
      return;
    }

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

        {/* The leader line's target — a real 3D object living in the
           SAME group as the mesh geometry above, so it inherits both
           BASE_ROTATION and the outer group's live per-frame rotation
           automatically, with no transform math of our own to keep in
           sync. A real, confirmed bug this replaces: the previous
           version pointed leader lines at a FIXED 2D screen percentage
           that had no actual relationship to the model at all — correct
           only by coincidence at whatever angle it was tuned against,
           and visibly wrong (pointing at empty space) the moment the
           model rotated to face a different spec. `anchorRef` is
           attached directly to this mesh — TheSpecs.tsx reads its live
           world position every frame via `.getWorldPosition()`, so the
           dot rendered here and the leader line's endpoint can never
           drift apart.
           `depthTest={false}` + `renderOrder` — SPEC_ANCHORS' own
           coordinates are a hand-picked, best-effort guess at each
           feature's location (see that file's comment: there's no real
           per-feature geometry to target), not measured against the
           actual mesh surface, so a normal depth-tested sphere read as
           invisible more often than not — confirmed live via a zoomed
           screenshot on the Sensors pose, where the anchor should have
           sat plainly on the visible front face and didn't render at
           all, meaning it was landing fractionally inside the solid
           shell rather than on top of it. Always rendering on top
           trades away correct occlusion (a dot nominally on the far
           side would, in principle, ideally hide behind the shell) for
           actually being visible, which is what requirement #3 (a dot
           that visibly "proves exactly what the line is pointing to")
           depends on far more than strict physical correctness does. */}
        {variant === "xray" && activeAnchorKey && (
          <mesh ref={anchorRef} position={SPEC_ANCHORS[activeAnchorKey]} renderOrder={999}>
            <sphereGeometry args={[SPEC_ANCHOR_DOT_RADIUS, 16, 16]} />
            <meshBasicMaterial color="#D4AF37" toneMapped={false} depthTest={false} />
          </mesh>
        )}
      </group>
    </group>
  );
}

useGLTF.preload("/band.glb");
