"use client";

import { useMemo, useRef } from "react";
import type { Ref } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { SPEC_ANCHORS, SPEC_ANCHOR_DOT_RADIUS, type SpecKey } from "@/lib/specAnchors";

/**
 * CAD export of the NA·01 sensor module (public/band.glb) — updated to
 * the client's latest assembly file, which bundles the sensor module
 * AND a separate strap/buckle/clasp sub-assembly in one GLB. Five
 * meshes belong to that outer sub-assembly, not the module, and are
 * filtered out below by name — each one directly identified via
 * isolated single-mesh rendering (this file's own established
 * methodology) and cross-checked against its measured size, not
 * inferred from position alone:
 * - "empty_3": the strap itself, 260.5 x 22.0 x 1.6mm. Straddles the
 *   origin (its own center lands within ~4mm of it, same as the
 *   module), which is why the moduleMeshes filter below needs a
 *   maxDimension check and can't rely on center-distance alone.
 * - "empty_4", "empty_5": the two clasp halves, ~24.4 x 14.0mm each,
 *   ~132mm off origin on -Y.
 * - "empty_6": the keeper loop, 20.0 x 7.7mm, ~135mm off origin on -Y.
 * - "empty_13": a strap lug/pin — a mounting bracket with a long thin
 *   pin extending from it, 48.4 x 10.2 x 6.9mm, confirmed via isolated
 *   render (visibly a hardware bracket + pin shape, not a plate or
 *   capsule). Not one of the product spec's 8 named module parts.
 *   Already excluded by maxDimension alone (48.4mm exceeds the shell's
 *   own 42.8mm max), independent of the other four.
 * None of these five are rendered anywhere in this file — none of this
 * component's three scenes are framed, scaled, or lit for a full
 * ~260mm strap, so integrating it is separate, bigger work than a
 * materials pass. For when that work happens: the strap should get a
 * non-metallic, high-roughness woven-navy-textile material (roughly
 * matching the shell's own #041E42 family, desaturated), and the clasp
 * halves + keeper loop an anodised-metal material matching
 * HARDWARE_MATERIAL_PROPS below (Cool Gray 7 C, metalness 1) — same
 * finish family as the module's own hardware, not a separate palette.
 *
 * Still no semantic mesh/material names anywhere in the file (every
 * mesh is "empty_N", every material name is an empty string) — mesh
 * identity is established here by isolating each candidate mesh alone
 * (hidden from its siblings, camera framed tight on just that one
 * mesh's own bounding box) and inspecting its actual 3D shape directly,
 * not by inferring from silhouette in a combined view or from position
 * alone — both of those weaker methods produced real, confirmed wrong
 * identifications in earlier passes on this same file. Isolated,
 * each part was unambiguous:
 * - The side button has an actual shaft/plunger stub, a physical
 *   button mechanism, not just a shape that happens to sit where a
 *   button should be.
 * - The ECG electrode is a flat pill with a genuine engraved zigzag
 *   waveform mark visible on its face.
 * - The two charging pogo pads have the distinctive stepped-cylinder
 *   profile of a real pogo pin, unlike two other, plainer cylindrical
 *   posts nearby that share their general position but not their shape
 *   — those two are left on the general hardware default rather than
 *   guessed at, since the product spec's 8 named parts don't obviously
 *   cover them (possibly related to the internal carrier, which has no
 *   own separately-identifiable external mesh in this file).
 * - The two steel electrode plates and the optical sensor window are
 *   three plain flat plates in a row with no distinguishing marks from
 *   geometry alone; the window is identified as the centered, slightly
 *   larger one of the three (room for the two-LED-plus-photodiode
 *   layout the product spec describes), the electrodes as the smaller
 *   mirrored pair flanking it.
 *
 * The GLB has POSITION and NORMAL only — no TEXCOORD_0, so no texture
 * map (a brushed-metal normal map, an AO pass, anything) can be applied
 * without generating UVs first, which is a bigger, separate change from
 * a materials pass. Every surface below is therefore a perfectly even
 * color/roughness/metalness across its whole mesh, which is itself a
 * small realism tell up close (real anodized aluminum has faint
 * brushing, real steel has micro-scratches). Per-part material
 * separation and lighting are the only tools available without that
 * bigger change — deliberately not "solved" with procedural noise or a
 * UV-generation pass here; this is a known, accepted limit of this
 * pass, not an oversight.
 *
 * The two largest-vertex-count meshes within the module cluster are the
 * top housing and skin-side back cover.
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
 * Every color/finish below is the real supplied product spec, not a
 * stylistic pick: PANTONE 282 CP (#041E42) housing, PANTONE Cool Gray
 * 7 C (#97999B) secondary, cobalt button (#2656AD), gold pogo pads
 * (#C9A44C), polished steel electrodes/ECG capsule (reads #5D7B8F under
 * cool light). The spec is explicit that both the navy and the grey
 * carry a blue bias and nothing in the palette should read warm — the
 * optical window's near-black tint below is mixed cool for the same
 * reason, not a neutral/warm black.
 */
// Housing: "matte anodised aluminium... soft-touch, no gloss" — real
// anodized aluminum, not plastic, so metalness stays meaningfully above
// 0 (a true non-metal readback would lose the faint brushed-metal sheen
// anodizing actually has). #041E42 is the reference hex the spec gives
// directly (it notes the color lifts toward ~#16284C at typical
// on-screen brightness — expected, not a bug to correct for).
//
// roughness 0.75 -> 0.45: at 0.75 the material's BRDF lobe is wide
// enough to blur even a small, bright reflected feature into an
// invisible soft blob — confirmed live, the StudioEnvironment hotspot
// panels added specifically to give this shell a legible highlight
// produced almost no visible change at 0.75. 0.45 is still well short
// of a mirror (that's what "no gloss" rules out) but narrow enough a
// BRDF lobe that those hotspots can actually resolve as a highlight
// rather than washing out into the same flat gradient regardless of
// what the environment provides.
//
// metalness 0.7, a deliberate compromise, not the physically "pure"
// 1.0 — at metalness 1 a metal's base color only ever shows up through
// reflections (there's no diffuse term left at all), which is
// physically correct for anodized aluminum but, confirmed via a direct
// side-by-side render, reads as nearly black against this site's dark
// navy page — the #041E42 all but disappears rather than reading as
// navy metal. 0.7 keeps a small enough diffuse contribution that the
// actual brand color stays legible while still responding to the
// environment enough to catch the Lightformer hotspots as real
// highlights, not a flat plastic fill. NOT fixed by lightening the
// base color instead — that's the exact toy-like look this whole pass
// exists to undo.
const SHELL_MATERIAL_PROPS = {
  color: "#041E42",
  roughness: 0.45,
  metalness: 0.7,
  side: THREE.DoubleSide,
} as const;

// Secondary/default for hardware bits the product spec doesn't
// individually name (see the two unidentified cylindrical posts in the
// file header comment) — Cool Gray 7 C, the spec's own secondary color.
const HARDWARE_MATERIAL_PROPS = {
  color: "#97999B",
  roughness: 0.25,
  metalness: 1,
  side: THREE.DoubleSide,
} as const;

// The side button — cobalt, "the only saturated colour" on the whole
// device per the spec. Non-metallic (a painted/molded finish, not bare
// metal) at a moderate roughness — matte enough not to compete with the
// shell's own reflections, not so rough it goes chalky.
const BUTTON_MATERIAL_PROPS = {
  color: "#2656AD",
  roughness: 0.35,
  metalness: 0,
  side: THREE.DoubleSide,
} as const;

// Polished stainless — the top-mounted ECG electrode and the two
// underside steel electrode plates all share this. High metalness for
// the mirror finish per spec, but roughness 0.12-0.18 rather than a
// near-zero value: true near-0 roughness on a flat plate only shows a
// highlight at the exact angle that mirror-reflects a light/hotspot
// back at the camera, and misses it entirely everywhere else — a
// slightly wider BRDF lobe reads as polished steel across more of the
// viewing envelope instead of "mirror in one spot, flat gray
// everywhere else."
const STEEL_ELECTRODE_MATERIAL_PROPS = {
  color: "#5D7B8F",
  roughness: 0.15,
  metalness: 1,
  side: THREE.DoubleSide,
} as const;

// The optical sensor window (PPG) — not a named color in the palette,
// so approximated the way a real PPG window is built: a dark, glossy
// tinted lens, mixed with a cool/blue bias to match the spec's explicit
// "nothing should read warm" instruction rather than a neutral or warm
// black.
//
// Deliberately opaque, not transmissive: the CAD has no PCB, no LEDs,
// no photodiode behind this 0.5mm plate — a transmissive material
// would refract straight through into an empty housing shell, which
// would look far worse than an opaque one. meshStandardMaterial has no
// transmission property anyway (that's meshPhysicalMaterial-only), so
// there's no accidental path to it here. roughness 0.15 -> 0.05 is what
// actually gets "black glass reflecting the environment" rather than a
// flat dark rectangle — metalness stays 0 (this is glass/coated
// polymer, not metal); at a near-black base color even a non-metal's
// fixed ~4% specular reflectance reads as a clear, legible highlight,
// because there's so little diffuse brightness underneath it to
// compete with.
const OPTICAL_WINDOW_MATERIAL_PROPS = {
  color: "#0A0E14",
  roughness: 0.05,
  metalness: 0,
  side: THREE.DoubleSide,
} as const;

// The two gold charging pogo pads.
const POGO_PAD_MATERIAL_PROPS = {
  color: "#C9A44C",
  roughness: 0.3,
  metalness: 1,
  side: THREE.DoubleSide,
} as const;

/** Fixed array indices into `hardwareMeshes` (sorted by vertex count
 *  descending, see the `shellMeshes`/`hardwareMeshes` useMemo below) —
 *  see this file's own header comment for how each was actually
 *  confirmed (isolated rendering, not inference from a combined view).
 *
 *  ECG_ELECTRODE_INDEX re-verified directly against this exact GLB (not
 *  re-derived from memory of an earlier file): resolves to node
 *  "empty_9", 1.0 x 10.3 x 3.3mm. That's smaller than the product
 *  spec's rough ~15 x 10 x 4mm estimate, but an isolated render leaves
 *  no doubt — it's a flat pill with a genuine engraved zigzag waveform
 *  mark on its face, unlike anything else in this file. The 48.4 x 10.2
 *  x 6.9mm mesh worth double-checking here isn't this one — that's
 *  "empty_13", the strap lug/pin (see this file's own header comment),
 *  which never reaches `hardwareMeshes` at all: it's excluded from
 *  `moduleMeshes` by the maxDimension filter below before indices are
 *  even assigned. */
const BUTTON_INDEX = 0;
const ECG_ELECTRODE_INDEX = 1;
const OPTICAL_WINDOW_INDEX = 2;
const STEEL_ELECTRODE_INDICES = new Set([5, 6]);
const POGO_PAD_INDICES = new Set([7, 8]);

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
    const allMeshes = Object.values(nodes).filter(
      (n): n is THREE.Mesh => Boolean((n as THREE.Mesh)?.isMesh)
    );
    // The updated CAD export bundles the strap/buckle/clasp sub-assembly
    // in the SAME file as the sensor module, offset far down the Y axis
    // (geometry-space center around y=-0.13, vs. the module cluster's
    // own ~-0.01..0.02) — a real, confirmed ~260mm-long strap mesh
    // sitting alongside an ~25-40mm module, per direct inspection of the
    // raw GLB. None of this component's scenes are set up to frame a
    // full strap (camera/scale/lighting all tuned for just the module),
    // so it's filtered out here rather than rendered at the wrong scale
    // — a real "integrate the strap" pass is separate, bigger work.
    const box = new THREE.Box3();
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    const moduleMeshes = allMeshes.filter((m) => {
      box.setFromBufferAttribute(
        m.geometry.attributes.position as THREE.BufferAttribute
      );
      box.getSize(size);
      box.getCenter(center);
      // Two checks, not one — a real bug the first (center-only) version
      // had: the strap mesh is long enough (~260mm) that it straddles
      // the origin and its CENTER lands right back near y=0, same as
      // the module itself, so a center-distance check alone let it
      // straight through. maxDimension catches that case (nothing in
      // the real module exceeds ~48mm on any axis); centerDistance
      // catches the separate buckle/clasp pieces, which are small
      // enough individually but sit far from the module (~130mm away).
      // 0.045, not the 0.06 first tried — one mesh ("empty_13", the strap
      // lug/pin — see this file's own header comment) still slipped
      // through at 0.06 and rendered as a spike visibly taller than the
      // whole shell. 0.045 sits between the shell's own real 0.0428 max
      // and this mesh's 0.0484, excluding just this one piece.
      const maxDimension = Math.max(size.x, size.y, size.z);
      const centerDistance = center.length();
      return maxDimension < 0.045 && centerDistance < 0.08;
    });
    const byVertexCountDesc = [...moduleMeshes].sort(
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
          const materialProps =
            i === BUTTON_INDEX
              ? BUTTON_MATERIAL_PROPS
              : i === ECG_ELECTRODE_INDEX || STEEL_ELECTRODE_INDICES.has(i)
                ? STEEL_ELECTRODE_MATERIAL_PROPS
                : i === OPTICAL_WINDOW_INDEX
                  ? OPTICAL_WINDOW_MATERIAL_PROPS
                  : POGO_PAD_INDICES.has(i)
                    ? POGO_PAD_MATERIAL_PROPS
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
