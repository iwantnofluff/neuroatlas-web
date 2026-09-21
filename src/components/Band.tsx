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
//
// Shell roughness bumped 0.25 -> 0.32 (an earlier pass, still valid
// reasoning) -> 0.48 (this pass, alongside the darker Pantone color
// above) — a razor-low roughness is a near-mirror finish, which only
// reflects light back from the exact narrow angle it's coming from; the
// shell's own broad, mostly-flat faces were simply missing that one
// angle from most camera positions. More roughness blurs/spreads the
// reflection so the shell picks up light across more of its surface
// instead of nothing-or-a-glint, while staying well short of a matte/
// plastic look. Paired with StudioEnvironment.tsx's own wraparound fill
// panels (same root cause, see that file's comment) rather than relying
// on either fix alone. Hardware roughness left at 0.25 — Cool Gray 7 C
// is a light, mid-value gray, not a near-black color, so it doesn't hit
// the same "reads as flat black" failure mode the shell's own color
// does, and a lower roughness there reads as the brushed-steel hardware
// accent this colorway calls for.
const SHELL_MATERIAL_PROPS = {
  color: "#041E42",
  roughness: 0.48,
  metalness: 1,
  side: THREE.DoubleSide,
} as const;

const HARDWARE_MATERIAL_PROPS = {
  color: "#97999B",
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

/** "timeline" variant only (TheSpecs' scroll-driven 3D timeline) — four
 *  stages, each claiming an equal quarter of the scroll range (see
 *  TIMELINE_STAGE_SPAN). Unlike SHOWCASE_POSE_KEYFRAMES' continuous
 *  tumble, each stage HOLDS its pose for most of its own quarter (see
 *  TIMELINE_HOLD_FRACTION) so the model is genuinely settled — not still
 *  easing toward it — for the whole time its matching text card (see
 *  TheSpecs.tsx) is fully visible, only beginning the turn toward the
 *  NEXT stage's pose in the closing stretch of the current one, timed to
 *  land exactly as that next card takes over. The two files keep this
 *  timing in sync via the same plain fractions (0.25 per stage, 0.7 hold)
 *  rather than a shared constants module.
 *
 *  Poses are a best-effort, stylized mapping to each stage's theme (this
 *  model has no separate geometry for a sensor window, battery
 *  compartment, or strap lug to point the camera at specifically — see
 *  this file's own header comment on mesh identity) rather than a
 *  literal feature callout:
 *  - Sensors: y=π shows the back/underside (this model's default y=0
 *    front face turned fully away from camera).
 *  - Battery: y=π/2, a clean side profile.
 *  - Dimensions: a steep x tilt, tipping the flat face up toward camera
 *    for a top-down-leaning angled view.
 *  - Strap: the far side from Sensors' own back view, at a shallower
 *    tilt, showing the OTHER end of the shell where the hardware meshes
 *    (lugs) sit. */
const TIMELINE_POSES: ReadonlyArray<{ ry: number; rx: number }> = [
  { ry: Math.PI, rx: 0.25 }, // Sensors
  { ry: Math.PI / 2, rx: 0.15 }, // Battery
  { ry: 0.55, rx: 1.2 }, // Dimensions
  { ry: -1.35, rx: 0.35 }, // Strap
];

const TIMELINE_STAGE_SPAN = 1 / TIMELINE_POSES.length;
const TIMELINE_HOLD_FRACTION = 0.7;

function sampleTimelinePose(p: number) {
  const stageIndex = Math.min(
    TIMELINE_POSES.length - 1,
    Math.floor(p / TIMELINE_STAGE_SPAN)
  );
  const current = TIMELINE_POSES[stageIndex];
  if (stageIndex === TIMELINE_POSES.length - 1) return current;

  const localT = (p - stageIndex * TIMELINE_STAGE_SPAN) / TIMELINE_STAGE_SPAN;
  if (localT <= TIMELINE_HOLD_FRACTION) return current;

  const next = TIMELINE_POSES[stageIndex + 1];
  const t = smoothstep((localT - TIMELINE_HOLD_FRACTION) / (1 - TIMELINE_HOLD_FRACTION));
  return {
    ry: THREE.MathUtils.lerp(current.ry, next.ry, t),
    rx: THREE.MathUtils.lerp(current.rx, next.rx, t),
  };
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
 *  - "timeline" (TheSpecs' scroll-driven 3D timeline): also fully visible
 *    from the start, rotation sampled from TIMELINE_POSES above instead —
 *    holds each stage's pose, then eases to the next one late in that
 *    stage's own scroll range. `scrollProgress` here is expected to
 *    already be a spring-smoothed value (see TheSpecs.tsx's own
 *    `useSpring`) — this branch just samples whatever it's given every
 *    frame, same as "showcase".
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
}: {
  scrollProgress: MotionValue<number>;
  reduceMotion: boolean;
  isMobile?: boolean;
  variant?: "reveal" | "showcase" | "timeline";
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

    if (variant === "timeline") {
      g.position.y = 0;
      if (reduceMotion) {
        // Unlike "showcase"'s own reduceMotion branch (a purely
        // decorative tumble with no informational content tied to any
        // specific angle, safe to just freeze), this variant's rotation
        // IS tied to real information — TheSpecs.tsx's stage cards keep
        // cycling their label/detail text under reduced motion too (see
        // that file's own useStageReveal), just without the smooth
        // easing. Freezing the model here while the card text kept
        // changing underneath it would desync the two halves of the
        // same narrative. A hard stage-index jump (no smoothstep
        // blending, no handoff) keeps them showing the same stage at
        // all times, matching this codebase's standing "still
        // functions, just instant" convention rather than "stops
        // functioning".
        const stageIndex = Math.min(
          TIMELINE_POSES.length - 1,
          Math.floor(scrollProgress.get() / TIMELINE_STAGE_SPAN)
        );
        const pose = TIMELINE_POSES[stageIndex];
        g.rotation.y = pose.ry;
        g.rotation.x = pose.rx;
        return;
      }
      const pose = sampleTimelinePose(scrollProgress.get());
      g.rotation.y = pose.ry;
      g.rotation.x = pose.rx;
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
