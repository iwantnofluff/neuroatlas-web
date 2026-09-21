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
 * Shell/hardware colors are the final, real Pantone-matched device
 * colorway (supplied directly as swatches: PANTONE 282 CP for the shell,
 * PANTONE Cool Gray 7 C for the hardware/strap accent), not a stylistic
 * pick — #041E42 and #97999B are those two Pantones' hex equivalents.
 * #041E42 is an even deeper navy than the #1B2340 placeholder this
 * replaces, which pushed roughness up alongside it (0.32 -> 0.48): this
 * codebase already hit and fixed the "near-black object with only a
 * couple of sharp glints" failure mode once at a shallower color (see
 * roughness history below) — an even darker target color needs more of
 * the same correction, not less, to keep reading as a lit navy surface
 * rather than flat black.
 */
// Shell flipped from the earlier machined-metal pass to a strict matte
// finish per direct instruction, matching the real device photos — the
// casing itself reads as a soft-touch matte navy, not a polished metal
// shell. High roughness (0.85) + low metalness (0.15) is the standard
// PBR recipe for that: metalness near 0 removes almost all of the
// specular reflection a metallic surface depends on to read as lit at
// all, leaving mostly flat diffuse color; a touch of metalness (rather
// than 0 exactly) keeps a faint, realistic sheen instead of reading as
// completely dead/chalky. Color unchanged — still the real PANTONE 282
// CP hex.
//
// Hardware default (Cool Gray 7 C) still metalness 1/roughness 0.25 —
// unchanged, still applies to whichever hardware meshes below AREN'T
// one of the three specifically-identified parts (charging pins,
// biometric contact panel, action button) getting their own material.
const SHELL_MATERIAL_PROPS = {
  color: "#041E42",
  roughness: 0.85,
  metalness: 0.15,
  side: THREE.DoubleSide,
} as const;

const HARDWARE_MATERIAL_PROPS = {
  color: "#97999B",
  roughness: 0.25,
  metalness: 1,
  side: THREE.DoubleSide,
} as const;

// Metallic gold — the two charging pins.
const CHARGING_PIN_MATERIAL_PROPS = {
  color: "#D4AF37",
  roughness: 0.2,
  metalness: 1,
  side: THREE.DoubleSide,
} as const;

// Polished silver/metallic — the biometric contact panel (the one with
// the heartbeat logo). High metalness, low roughness so it actually
// catches specular highlights from the rig's lights, per direct
// instruction ("polished... so it catches the light").
const CONTACT_PANEL_MATERIAL_PROPS = {
  color: "#C7C9CC",
  roughness: 0.12,
  metalness: 1,
  side: THREE.DoubleSide,
} as const;

// Vibrant solid blue, low metalness/moderate roughness — a painted
// plastic button, not a metal one, matching the real photos.
const ACTION_BUTTON_MATERIAL_PROPS = {
  color: "#2563EB",
  roughness: 0.35,
  metalness: 0.1,
  side: THREE.DoubleSide,
} as const;

/** The source GLTF has no semantic mesh names at all (see this file's
 *  own header comment), so which of the 9 "hardware" meshes is which
 *  real part can't be looked up by name — these are fixed array
 *  indices into `hardwareMeshes` (itself sorted by vertex count
 *  descending, see the `shellMeshes`/`hardwareMeshes` useMemo below),
 *  identified by rendering each one in its own distinct debug color and
 *  visually matching the result against the real device photos:
 *  - 0, 1: two small round pads near one edge, paired the same way the
 *    two visible charging pins are in the photos.
 *  - 2: a flat, centered plate in the middle of a row of three -
 *    matches the biometric contact panel's position between two other
 *    unlabeled panels.
 *  - 6: sits directly adjacent to index 2, matching the action button's
 *    position right next to the contact panel in the photos.
 *  Every other index keeps the general HARDWARE_MATERIAL_PROPS default.
 *  Best-effort visual identification, not a certainty (no per-feature
 *  geometry to confirm against) — same standing caveat this file
 *  already applies to spec rotations and anchor points elsewhere. */
const CHARGING_PIN_INDICES = new Set([0, 1]);
const CONTACT_PANEL_INDEX = 2;
const ACTION_BUTTON_INDEX = 6;

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
const MODEL_SCALE_DESKTOP = 32;
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

/** "reveal" variant only — how much of the scroll progress range the
 *  rise + spin takes to complete, before holding at its locked pose for
 *  whatever's left. Was 0.4 (locked by 40% progress, holding through the
 *  remaining 60%) — reported live as feeling rushed: on a real scroll
 *  gesture, that 40% slice flew by almost immediately, with barely any
 *  chance to actually watch the model turn before it settled. 0.7 gives
 *  the turn itself nearly double the scroll distance to play out across
 *  (see BuiltToReadYouSection.tsx's own wrapper height, which this pairs
 *  with), so the same physical scrolling now reads as a deliberate,
 *  legible rotation rather than a near-instant snap, while still leaving
 *  a real (just shorter) hold at the end to register the locked pose. */
const REVEAL_RATIO = 0.7;

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
 *    untouched): `t` ramps 0→1 across the first REVEAL_RATIO (70%) of the scroll
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
    const t = THREE.MathUtils.clamp(p / REVEAL_RATIO, 0, 1);
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
        {hardwareMeshes.map((mesh, i) => {
          const materialProps = CHARGING_PIN_INDICES.has(i)
            ? CHARGING_PIN_MATERIAL_PROPS
            : i === CONTACT_PANEL_INDEX
              ? CONTACT_PANEL_MATERIAL_PROPS
              : i === ACTION_BUTTON_INDEX
                ? ACTION_BUTTON_MATERIAL_PROPS
                : HARDWARE_MATERIAL_PROPS;
          return (
            <mesh
              key={`hardware-${i}`}
              geometry={mesh.geometry}
              position={mesh.position}
              rotation={mesh.rotation}
              scale={mesh.scale}
            >
              <meshStandardMaterial {...materialProps} />
            </mesh>
          );
        })}

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
