"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { damp } from "maath/easing";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import {
  useModuleMeshes,
  SHELL_MATERIAL_PROPS,
  HARDWARE_MATERIAL_PROPS,
  BUTTON_MATERIAL_PROPS,
  STEEL_ELECTRODE_MATERIAL_PROPS,
  OPTICAL_WINDOW_MATERIAL_PROPS,
  POGO_PAD_MATERIAL_PROPS,
  BUTTON_INDEX,
  ECG_ELECTRODE_INDEX,
  OPTICAL_WINDOW_INDEX,
  STEEL_ELECTRODE_INDICES,
  POGO_PAD_INDICES,
} from "@/components/Band";
import { StudioEnvironment } from "@/components/StudioEnvironment";
import {
  activeStepIndex,
  moduleStopMM,
  STRAP_VISIBLE_HEIGHT_MM,
} from "@/lib/howToGetStartedProgress";

/**
 * STRAP RENDERING — GEOMETRY, MATERIAL, AND TEXTURE NOTES
 *
 * This file renders the strap ("empty_3" in band.glb) as a static navy
 * fabric backdrop with the module traveling in front of it. Several of
 * the choices below look like mistakes out of context — this block is
 * the reasoning, gathered in one place, for whoever reads this next.
 *
 * GEOMETRY (confirmed directly against band.glb via a one-off Node
 * script using three's GLTFLoader — not assumed from the model name):
 *   - Strap: X ±11mm (22mm wide), Y ±130.25mm (260.5mm long), front face
 *     at Z 3.3-4.9mm. A CAD extrusion of a rounded-rectangle cross-
 *     section swept along Y through ~19 rings, with a flat end-cap face
 *     at each tip.
 *   - Module: combined shell+hardware bbox X -12.7 to 13.1mm, Y ±21.4mm,
 *     Z -6.2 to 6.9mm — already straddling the strap's own face in Z, so
 *     it depth-tests in front of the strap with no manual offset needed.
 *   - The raw mesh has NO uv attribute at all (confirmed: absent from
 *     the exported attributes, not just empty) — see UV GENERATION.
 *
 * FRAMING — A DELIBERATE REFRAMING, NOT A REGRESSION OF "FULL
 * VISIBILITY": earlier passes on this section treated "full visibility"
 * as a hard constraint — frame the complete 260.5mm strap, both tips
 * always on screen, because the strap was being PRESENTED as an object
 * (see this file's own git history/PR notes from that phase). That was
 * the right call for that job: an object with a tip cropped off reads
 * as a mistake.
 * The layout changed since: the strap is now a CENTRED SPINE with steps
 * flanking it, not an object beside a text column. A spine that both
 * starts and stops on screen, fully visible, floating in open space on
 * both sides, reads as a detached component — not what a centred
 * timeline wants. A spine that bleeds off the top and bottom implies
 * continuity beyond the frame, which is the actual job here. So this
 * file now frames only STRAP_VISIBLE_HEIGHT_MM (200mm) of the strap's
 * real 260.5mm length, centred on its midpoint, and lets the rest run
 * past the canvas's own top/bottom edge on purpose. If you're reading
 * this because the strap looks "cropped" and are about to widen
 * CAMERA_TARGET_HEIGHT back out to the full length: don't, without
 * first checking whether the layout is still this centred-spine one —
 * if it's reverted to a side-rail-beside-text layout, full visibility
 * is correct again and this whole note is the thing that's stale, not
 * the crop.
 *   Why 200mm specifically, not the full length or some other crop: the
 *   on-screen width this camera produces is fixed by the strap's own
 *   22mm width against whatever height it frames — width_px =
 *   viewportHeight_px * (22 / framed_height_mm) — so at a typical 900px
 *   viewport, framing the full 260.5mm+margin (the old 320mm) gives
 *   ~62px, and framing the bare 260.5mm with zero margin only gets to
 *   ~76px. Both read as a hairline rule next to a full text column on
 *   either side, not a spine substantial enough to hold the centre.
 *   Only letting the frame crop the length — trading unseen tips for
 *   width — moves the number meaningfully: 200mm framed gets to ~99px,
 *   which is the number that was actually asked for and confirmed
 *   worth the trade before this reframing happened at all.
 *
 * WORLD SCALE (RIG_SCALE) AND THE LOCAL/WORLD BOUNDARY — the single
 * easiest mistake to reintroduce in this file: every other Band scene
 * in this codebase (BuiltToReadYouScene/BandScrollScene/TheSpecsScene)
 * renders this same glb at a ~30-34x scale, with their shared light rig
 * tuned against that. Early on this file used the model's raw, unscaled
 * meter units (for convenient camera-fitting math) and reused those
 * scenes' light positions/intensities verbatim — that did NOT reproduce
 * their look. The reason: at raw scale the strap's ~0.13m half-height is
 * tiny next to the lights' ~4-4.7 unit distance from the origin, so
 * instead of a localized specular hotspot (what those lights produce on
 * a large-in-frame object), the same lights blanket the whole tiny strap
 * in one undifferentiated highlight. Confirmed empirically (isolation
 * testing: disabling each light group in turn, sampling actual rendered
 * pixels) before reaching that conclusion, not assumed from the theory
 * alone. Fix: wrap just the meshes (not the lights) in the same ~32x
 * scale via <group scale={RIG_SCALE}>, so the identical light rig sees
 * the identical world-scale relationship it was tuned against.
 *   That single group is a hard boundary between two unit systems in
 *   this file, and everything added here has to know which side of it
 *   it's on:
 *     - WORLD-SPACE (post-scale) — anything that is a SIBLING of that
 *       group, not a child of it: the camera and every light. These
 *       don't get RIG_SCALE applied automatically, so any real-mm
 *       measurement feeding them has to be multiplied by RIG_SCALE by
 *       hand. CAMERA_TARGET_HEIGHT does this correctly: (mm/1000) *
 *       RIG_SCALE.
 *     - LOCAL (pre-scale) — anything that is a CHILD of that group:
 *       StrapPiece, ModuleTravel, and by extension moduleStopY(). The
 *       group's own `scale` prop applies RIG_SCALE to these
 *       automatically and exactly once. A real-mm measurement feeding
 *       one of these needs ONLY the mm-to-meters conversion (/1000) —
 *       multiplying by RIG_SCALE again double-counts it.
 *   This second case was wrong here once already, and it's worth
 *   describing exactly how it failed because the failure mode is
 *   silent: moduleStopY() computed (moduleStopMM(index)/1000) *
 *   RIG_SCALE and returned that as ModuleTravel's own
 *   group.position.y — but that group is a CHILD of <group
 *   scale={RIG_SCALE}>, so its parent's scale was ALSO applied on top,
 *   putting the module at world Y=56.32 instead of the intended 1.76 —
 *   32x further from the origin than the camera's own frame covers.
 *   Nothing crashed and nothing looked obviously wrong in isolation:
 *   `group.current.position.y` held a perfectly plausible-looking
 *   number, the console logs said exactly what the formula predicted,
 *   and only a scene-graph traversal reading the group's actual
 *   `matrixWorld` (not its local `.position`) surfaced the real value.
 *   It was only caught by diffing two screenshots at different scroll
 *   positions and noticing the module's own column was pixel-identical
 *   between them — it had been rendering off-canvas the entire time.
 *   Before adding any new positioned element here: decide which side of
 *   the <group scale={RIG_SCALE}> boundary it lives on FIRST, then
 *   write its coordinates in that unit system, rather than copying a
 *   nearby constant and assuming it's the right convention.
 *
 * LIGHT RIG: beyond the scale fix above, this strap faces the camera
 * dead-on for the ENTIRE scroll (no rotation, ever) — unlike the other
 * Band scenes, where the model only locks front-on briefly or turns
 * continuously. A directional light aimed straight down the Z-axis
 * (tuned elsewhere for occasional front-on framing) was flooding this
 * always-front-facing plate at full strength, with a cool-blue rim
 * light tinting the wash further. Both were trimmed specifically for a
 * surface that's lit face-on 100% of the time (see the light rig's own
 * comment further down for the exact values and how they were found).
 *
 * MODULE TRAVEL RANGE (MODULE_TRAVEL_HALF_RANGE_MM, defined in
 * howToGetStartedProgress.ts — read that constant's own comment for the
 * full derivation): 55mm each way from centre, not the 70mm an earlier
 * pass used. Not a generic safety margin — computed directly against
 * the fixed header (72px tall) sitting on top of the pinned canvas at
 * the module's TOP stop specifically. At a typical 900px viewport the
 * header eats 16mm of the 200mm frame's top edge, and the module itself
 * is 42.8mm tall (±21.4mm) — so 70mm (module top edge at 91.4mm) pushed
 * the module's own top edge behind the header, not just the strap's
 * deliberate bleed. 55mm keeps the module's top edge at 76.4mm, clear
 * of the header with margin, WHILE the strap keeps bleeding past both
 * edges regardless. The distinction matters: the strap is decoration
 * that's supposed to run off-frame now (see FRAMING above); the module
 * is a functional position indicator that isn't, and needs to stay
 * fully readable at every one of its four stops.
 *
 * MATERIAL (STRAP_MATERIAL_PROPS): metalness 0, roughness 0.75, color
 * #041E42. This went through a wrong intermediate state worth recording
 * so it isn't reintroduced: woven nylon is a dielectric, not a metal.
 * An earlier pass set metalness 0.85 (inherited from a "make it look
 * anodized/metallic" instruction that applied to the module's housing,
 * not the strap). At high metalness, a material's own base color is
 * only visible through tinted reflections — what actually rendered was
 * the studio HDRI's own blue, not the fabric's navy, no matter what
 * color or light-intensity tuning was tried. The fix was metalness: 0,
 * not a brighter light or a darker base color. Expect this material to
 * look flatter/darker than a "premium metallic" instinct suggests —
 * that flatness is correct for fabric, and it's the necessary starting
 * point for the woven texture below to have something to actually
 * modulate (a normal map on top of a metallic material would have
 * produced blue foil with a weave stamped into it, not woven fabric).
 * roughness is set to 1 (full scale factor) rather than 0.75 directly —
 * see WOVEN TEXTURE, the roughness MAP carries the real 0.6-0.9 value.
 *
 * NORMALS WELD (useSmoothStrapGeometry / HARD_EDGE_ANGLE_DEG): the raw
 * strap mesh bakes independent per-facet normals at every one of its
 * ~19 cross-section rings, rather than sharing normals smoothly across
 * ring boundaries — a CAD export artifact, not a shading style choice.
 * That discontinuity is what caused a horizontal "ruler" banding along
 * the strap's length under raking light. The straightforward fix
 * (three.js's own mergeVertices() + computeVertexNormals()) blends
 * EVERY duplicate-position vertex group into one averaged normal,
 * which fixes the banding but ALSO softens the strap's tip edges — a
 * genuine ~90° hard edge where the rounded tube wall meets its flat
 * end-cap face — into a fake rounded blend. Checked this directly
 * before shipping either version: every one of the 144 duplicate-
 * position groups in the raw mesh falls into one of two tight clusters
 * with nothing in between — 112 groups under 10° max internal angle
 * (the false ring seams) and 32 groups at exactly 90° (the real tip
 * edges). HARD_EDGE_ANGLE_DEG (45°) sits in that clean gap. The custom
 * weld below only merges the low-angle groups and leaves the 90° tip
 * groups exactly as CAD authored them — confirmed visually afterward
 * that the tip still reads as a distinct, crisp flat cap face, not a
 * soft rounded blend, and that the strap's OUTER SILHOUETTE against the
 * background (a separate concern from internal shading — the silhouette
 * is just the unchanged triangle boundary, never affected by normal
 * smoothing either way) stays crisp everywhere.
 *
 * UV GENERATION (useProceduralUVGeometry): the raw mesh has no uv
 * attribute, so standard texture mapping isn't possible without adding
 * one. A planar projection (local X -> U, local Y -> V, each normalized
 * against the mesh's own bounding box) is used deliberately, and only on
 * this mesh — the strap is a true flat rectangle, so this projection is
 * geometrically exact and can't distort. The module's curved shell is
 * NOT treated this way; it keeps whatever real UV unwrap it has (or
 * doesn't), since a planar projection on a curved surface would visibly
 * warp a texture. Runs AFTER the normals weld above, so the geometry it
 * operates on already has its final (reduced, angle-corrected) vertex
 * set.
 *
 * WOVEN TEXTURE (useWovenMaps / buildWeaveHeightField): a normal map and
 * a roughness map, both derived from one procedural basketweave height
 * field — a 2x2-cell repeat tile (WEAVE_TILE_MM = 2mm period), each
 * cell a rounded-ridge (half-cosine) profile oriented along whichever
 * axis that cell's thread runs, alternating in a checkerboard so
 * adjacent cells read as threads passing over/under each other. Sized
 * to the strap's REAL measured dimensions (STRAP_WIDTH_MM/LENGTH_MM),
 * not a guessed repeat count, so the physical density is genuinely
 * ~1mm per weave cell. The normal map comes from a wrapped (toroidal)
 * central-difference gradient of that same height field specifically so
 * the tile has no seam under RepeatWrapping — a naive (non-wrapped)
 * gradient would show a visible edge at every tile boundary. The
 * roughness map encodes its actual 0.6-0.9 value directly in the green
 * channel (per meshStandardMaterial's own convention), which is why
 * STRAP_MATERIAL_PROPS.roughness is 1, not 0.75 — the material's scalar
 * multiplies the map, so it has to stay at full scale or it would double
 * the map's own baked variation down.
 *   Texture filtering: THREE.DataTexture defaults to NearestFilter with
 *   mipmaps disabled (confirmed in three's own source, not assumed).
 *   At this render size the strap is only ~50-75px wide on screen for a
 *   130-tile-deep texture, a ~6x minification — point-sampling that
 *   without mipmaps aliases into a false lower-frequency beat pattern.
 *   Confirmed via a real measurement, not a guess: autocorrelating the
 *   rendered pixel brightness down the strap's length showed a peak at
 *   roughly 3x the tile's own screen pitch before mipmaps were enabled,
 *   the signature of moiré rather than a genuinely repeating highlight.
 *   generateMipmaps/minFilter/magFilter are now set explicitly (see
 *   useWovenMaps) rather than left on the DataTexture default. After
 *   that fix the same measurement's variance roughly halved and the
 *   isolated low-frequency beat did not survive — residual, much
 *   smaller periodicity at the texture's own true tile-scale frequency
 *   remains, which is the weave design working as intended, not an
 *   artifact.
 */

const STRAP_MESH_NAME = "empty_3";

// Raw meter units throughout this file — deliberately NOT scaled up to a
// "1 unit = 1mm" convention. Either works arithmetically; this just means
// one fewer place a unit-conversion mistake could hide, since every
// number below is the real GLTF export's own native unit. The geometry
// facts this file is built against (confirmed directly against band.glb,
// not assumed): strap runs Y -0.1303 to 0.1302m, 0.022m wide in X,
// 0.0016m thick in Z, face at Z 0.0033-0.0049m. Module combined bbox:
// X -0.0127 to 0.0131m, Y +-0.0214m, Z -0.0062 to 0.0069m — already
// straddling the strap's own face in Z with no offset needed, so the
// module's front face naturally depth-tests in front of the strap's
// with zero manual Z-nudging.
//
// NO BASE_ROTATION anywhere in this file, on either the module or the
// strap — the whole premise of this section (per direct instruction) is
// that the raw, uncorrected export orientation IS already the vertical,
// face-on pose wanted here. BASE_ROTATION exists to turn that same raw
// orientation INTO the landscape pose every other Band scene wants;
// applying it here would do the opposite of what this section needs.
// Every other Band scene (BuiltToReadYouScene/BandScrollScene/TheSpecsScene)
// renders this same glb at a ~30-34x world scale, with its light rig tuned
// against that scale. At the raw, unscaled meter units this file otherwise
// uses, the strap's ~0.13m half-height is tiny next to those lights'
// ~4-4.7 unit distance from the origin — so instead of a localized
// specular hotspot (what a small light source produces on a large-in-
// frame object), the same lights blanket the ENTIRE tiny strap in one
// undifferentiated highlight, reading as a flat washed-out pastel blue
// instead of navy. Confirmed empirically: keeping the lights' absolute
// values identical to the proven scenes but leaving the mesh unscaled
// did not fix it. Wrapping just the meshes (not the lights) in this same
// ~32x scale reproduces the exact world-scale relationship those scenes
// were tuned against, so the identical light rig produces the same
// proven result. CAMERA_TARGET_HEIGHT below is scaled to match — it's a
// world-space (post-scale) measurement, while the module's travel stays
// in pre-scale LOCAL coordinates inside the scaled group, so it doesn't
// need to know about RIG_SCALE at all.
const RIG_SCALE = 32;

// The visible height the orthographic camera frames, in world space
// (i.e. after RIG_SCALE) — STRAP_VISIBLE_HEIGHT_MM (200mm, the central
// portion of the strap's real 260.5mm length) converted to this file's
// working units. See the header comment above for why this is a crop,
// not the full length, and howToGetStartedProgress.ts for why that
// constant lives there instead of here (Section needs the identical
// number to place the step text at the right screen height).
const CAMERA_TARGET_HEIGHT = (STRAP_VISIBLE_HEIGHT_MM / 1000) * RIG_SCALE;

// Pre-scale LOCAL units (meters), NOT multiplied by RIG_SCALE — this
// value is consumed as ModuleTravel's own group.position.y, and that
// group is a CHILD of the outer <group scale={RIG_SCALE}>, so the
// scale already applies once when computing its world position.
// Multiplying by RIG_SCALE here as well double-counted it: confirmed
// directly (a scene-graph traversal reading the module's own
// matrixWorld) that the module was rendering at world Y=56.32 instead
// of the intended 1.76 — 32x further from the origin than the frame
// covers, genuinely off-screen rather than merely mis-lit.
function moduleStopY(index: number) {
  return moduleStopMM(index) / 1000;
}

/** Keeps the orthographic camera's zoom in sync with the canvas's own
 *  live pixel height, recalculated on every resize — the only way to
 *  guarantee STRAP_VISIBLE_HEIGHT_MM stays framed regardless of how tall
 *  the pinned viewport renders at on a given screen, rather than a zoom
 *  value tuned for one specific canvas size that drifts on any other. */
function FitOrthographicCamera() {
  // useFrame, not useThree()+useEffect — mutating `camera.zoom` on a
  // value obtained directly from useThree() trips the React Compiler's
  // immutability check ("modifying a value returned from a hook").
  // state.camera read inside useFrame's own callback parameter isn't a
  // hook return in that same sense (same reasoning this codebase already
  // relies on for every other per-frame ref mutation, e.g. Band.tsx's
  // own group.current.rotation writes). Cheap early-out below means this
  // only actually touches the camera on the frame the size changes, not
  // every frame.
  useFrame((state) => {
    const camera = state.camera as THREE.OrthographicCamera;
    const desiredZoom = state.size.height / CAMERA_TARGET_HEIGHT;
    if (camera.zoom === desiredZoom) return;
    camera.zoom = desiredZoom;
    camera.updateProjectionMatrix();
  });
  return null;
}

// Woven nylon is a dielectric, not a metal — metalness must stay at 0.
// At the earlier 0.85 metalness, the strap's own #041E42 base colour was
// almost irrelevant to what rendered: a metallic surface shows its base
// colour only through tinted reflections, so what actually appeared was
// the studio HDRI's own colour (a saturated royal blue), not the navy
// fabric. roughness 0.75 keeps it matte enough to read as fabric rather
// than a polished dielectric sheen.
const STRAP_MATERIAL_PROPS = {
  color: "#041E42",
  // Full-scale roughness factor, not the real surface value — the woven
  // roughness map below encodes the actual 0.6-0.9 variation per pixel
  // (meshStandardMaterial's roughnessMap multiplies this scalar by the
  // texture's green channel), so this must stay at 1 or it would double
  // up on top of the map's own baked values.
  roughness: 1,
  metalness: 0,
  side: THREE.DoubleSide,
} as const;

// The strap's real dimensions (confirmed directly against band.glb, not
// guessed): 22mm wide (X), 260.5mm long (Y). At 1mm per weave cell, a
// 2x2-cell repeat tile is a 2mm-square period, giving exactly 22/2 = 11
// tile repeats across the width (22 individual cells) and 260.5/2 =
// 130.25 repeats along the length.
const STRAP_WIDTH_MM = 22;
const STRAP_LENGTH_MM = 260.5;
const WEAVE_TILE_MM = 2;
const WOVEN_TEXTURE_REPEAT: readonly [number, number] = [
  STRAP_WIDTH_MM / WEAVE_TILE_MM,
  STRAP_LENGTH_MM / WEAVE_TILE_MM,
];

// Below this angle (degrees) between two position-duplicate vertices'
// original normals, treat the pair as a spurious ring-seam split and
// weld them into one smoothed vertex. At or above it, treat them as a
// genuine hard edge and keep them distinct. Chosen from the mesh's own
// data, not picked blind: every one of the 144 duplicate-position groups
// in the raw strap mesh falls into one of two tight clusters — 112 with
// a max internal angle under 10° (the ring-to-ring seams), and 32 sitting
// at exactly 90° (the strap's end-cap edges, where the rounded tube wall
// meets its flat tip face). Nothing falls in between, so anywhere from
// ~15° to ~85° threads that gap safely; 45° is just the middle of it.
const HARD_EDGE_ANGLE_DEG = 45;

/** Welds spurious seam-duplicate vertices into smoothed ones while
 *  leaving genuine hard-edge duplicates untouched.
 *
 *  The raw strap mesh is a CAD extrusion built from ~19 discrete cross-
 *  section rings along its length. Along the tube's smooth body, the
 *  exporter split a vertex at every ring boundary anyway, baking two
 *  near-identical per-facet normals a few degrees apart where one smooth
 *  normal belongs — that discontinuity is the real cause of the
 *  horizontal "ruler" banding under raking light, not a shading style
 *  choice. But at the two tips, where the rounded tube wall meets its
 *  flat end-cap face, the same kind of position-duplicate exists for a
 *  legitimate reason: a real ~90° hard edge that should stay crisp.
 *  three.js's own mergeVertices() + computeVertexNormals() can't tell
 *  these apart — it blends every duplicate group into one averaged
 *  normal regardless of angle, which fixes the banding but also softens
 *  the tip edges into a fake rounded blend. This walks every duplicate-
 *  position group by hand and only welds the ones under
 *  HARD_EDGE_ANGLE_DEG, leaving the tip's 90° groups exactly as CAD
 *  authored them. */
function useSmoothStrapGeometry(geometry: THREE.BufferGeometry | undefined) {
  return useMemo(() => {
    if (!geometry) return undefined;
    const position = geometry.attributes.position;
    const normal = geometry.attributes.normal;
    const index = geometry.index;
    if (!position || !normal || !index) return geometry;

    const keyFor = (i: number) =>
      `${position.getX(i).toFixed(5)},${position.getY(i).toFixed(5)},${position.getZ(i).toFixed(5)}`;

    const groups = new Map<string, number[]>();
    for (let i = 0; i < position.count; i++) {
      const key = keyFor(i);
      const list = groups.get(key);
      if (list) list.push(i);
      else groups.set(key, [i]);
    }

    const outPositions: number[] = [];
    const outNormals: number[] = [];
    const remap = new Int32Array(position.count);
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();

    for (const members of groups.values()) {
      let maxAngle = 0;
      for (let x = 0; x < members.length; x++) {
        for (let y = x + 1; y < members.length; y++) {
          a.set(normal.getX(members[x]), normal.getY(members[x]), normal.getZ(members[x]));
          b.set(normal.getX(members[y]), normal.getY(members[y]), normal.getZ(members[y]));
          const angle = THREE.MathUtils.radToDeg(a.angleTo(b));
          if (angle > maxAngle) maxAngle = angle;
        }
      }

      if (members.length === 1 || maxAngle < HARD_EDGE_ANGLE_DEG) {
        const first = members[0];
        const newIndex = outPositions.length / 3;
        outPositions.push(position.getX(first), position.getY(first), position.getZ(first));
        a.set(0, 0, 0);
        for (const m of members) {
          a.x += normal.getX(m);
          a.y += normal.getY(m);
          a.z += normal.getZ(m);
        }
        a.normalize();
        outNormals.push(a.x, a.y, a.z);
        for (const m of members) remap[m] = newIndex;
      } else {
        for (const m of members) {
          const newIndex = outPositions.length / 3;
          outPositions.push(position.getX(m), position.getY(m), position.getZ(m));
          outNormals.push(normal.getX(m), normal.getY(m), normal.getZ(m));
          remap[m] = newIndex;
        }
      }
    }

    const newIndex = new Uint32Array(index.count);
    for (let i = 0; i < index.count; i++) newIndex[i] = remap[index.getX(i)];

    const result = new THREE.BufferGeometry();
    result.setAttribute("position", new THREE.Float32BufferAttribute(outPositions, 3));
    result.setAttribute("normal", new THREE.Float32BufferAttribute(outNormals, 3));
    result.setIndex(new THREE.Uint32BufferAttribute(newIndex, 1));
    return result;
  }, [geometry]);
}

function useProceduralUVGeometry(geometry: THREE.BufferGeometry | undefined) {
  return useMemo(() => {
    if (!geometry) return undefined;
    const cloned = geometry.clone();
    cloned.computeBoundingBox();
    const bbox = cloned.boundingBox;
    if (!bbox) return cloned;

    const position = cloned.attributes.position;
    const sizeX = bbox.max.x - bbox.min.x || 1;
    const sizeY = bbox.max.y - bbox.min.y || 1;
    const uv = new Float32Array(position.count * 2);
    for (let i = 0; i < position.count; i++) {
      uv[i * 2] = (position.getX(i) - bbox.min.x) / sizeX;
      uv[i * 2 + 1] = (position.getY(i) - bbox.min.y) / sizeY;
    }
    cloned.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    return cloned;
  }, [geometry]);
}

// One 2x2-cell basketweave repeat tile, rendered at a fixed pixel
// resolution and tiled via RepeatWrapping (see WOVEN_TEXTURE_REPEAT).
// Cells alternate warp-over/weft-over in a checkerboard; each cell's
// height is a rounded ridge (a half cosine lobe) running along whichever
// axis that cell's thread lies on, so adjacent cells read as threads
// passing over and under each other rather than a flat checker pattern.
const WEAVE_CELL_PX = 32;
const WEAVE_TILE_PX = WEAVE_CELL_PX * 2;
const WEAVE_NORMAL_STRENGTH = 2.2;
const WEAVE_ROUGHNESS_MIN = 0.6;
const WEAVE_ROUGHNESS_MAX = 0.9;

function buildWeaveHeightField(): Float32Array {
  const field = new Float32Array(WEAVE_TILE_PX * WEAVE_TILE_PX);
  for (let y = 0; y < WEAVE_TILE_PX; y++) {
    for (let x = 0; x < WEAVE_TILE_PX; x++) {
      const cellX = Math.floor(x / WEAVE_CELL_PX);
      const cellY = Math.floor(y / WEAVE_CELL_PX);
      const warpOver = (cellX + cellY) % 2 === 0;
      const localX = x % WEAVE_CELL_PX;
      const localY = y % WEAVE_CELL_PX;
      const t = (warpOver ? localY : localX) / WEAVE_CELL_PX;
      field[y * WEAVE_TILE_PX + x] = 0.5 - 0.5 * Math.cos(t * Math.PI * 2);
    }
  }
  return field;
}

/** Derives a tangent-space normal map and a roughness map from the same
 *  procedural basketweave height field, via a wrapped (toroidal) central-
 *  difference gradient so the tile repeats seamlessly under
 *  RepeatWrapping — the actual "tileable" requirement, not just a
 *  texture that happens to not have a visible border at one scale. */
function useWovenMaps() {
  return useMemo(() => {
    const size = WEAVE_TILE_PX;
    const height = buildWeaveHeightField();
    const heightAt = (x: number, y: number) =>
      height[((y % size) + size) % size * size + (((x % size) + size) % size)];

    const normalData = new Uint8ClampedArray(size * size * 4);
    const roughnessData = new Uint8ClampedArray(size * size * 4);
    const normal = new THREE.Vector3();
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = (heightAt(x + 1, y) - heightAt(x - 1, y)) * WEAVE_NORMAL_STRENGTH;
        const dy = (heightAt(x, y + 1) - heightAt(x, y - 1)) * WEAVE_NORMAL_STRENGTH;
        normal.set(-dx, -dy, 1).normalize();

        const i = (y * size + x) * 4;
        normalData[i] = (normal.x * 0.5 + 0.5) * 255;
        normalData[i + 1] = (normal.y * 0.5 + 0.5) * 255;
        normalData[i + 2] = (normal.z * 0.5 + 0.5) * 255;
        normalData[i + 3] = 255;

        const roughness =
          WEAVE_ROUGHNESS_MAX -
          (WEAVE_ROUGHNESS_MAX - WEAVE_ROUGHNESS_MIN) * heightAt(x, y);
        const roughnessByte = roughness * 255;
        roughnessData[i] = roughnessByte;
        roughnessData[i + 1] = roughnessByte;
        roughnessData[i + 2] = roughnessByte;
        roughnessData[i + 3] = 255;
      }
    }

    const makeTexture = (data: Uint8ClampedArray) => {
      const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
      texture.colorSpace = THREE.NoColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(...WOVEN_TEXTURE_REPEAT);
      // THREE.DataTexture defaults to NearestFilter with mipmaps disabled
      // (confirmed in three's own source) — fine for a texture sampled
      // near 1:1, but this one is repeated 11x130 times onto a strap
      // that renders only ~60px wide on screen, so each 2mm tile lands
      // in ~5-6 screen pixels: a ~6x minification. Point-sampling that
      // without mipmaps aliases into a false lower-frequency beat
      // pattern — confirmed by measuring an autocorrelation peak in the
      // rendered pixels at ~3x the tile's own screen pitch, the
      // signature of moiré rather than a genuinely repeating highlight.
      // Enabling mipmaps with trilinear filtering lets the GPU blend
      // down to the correct per-pixel average instead of aliasing.
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.needsUpdate = true;
      return texture;
    };

    return {
      normalMap: makeTexture(normalData),
      roughnessMap: makeTexture(roughnessData),
    };
  }, []);
}

/** Static, unrotated, un-moved — the strap is the fixed backdrop the
 *  module travels against, not something that itself animates. */
function StrapPiece() {
  const { nodes } = useGLTF("/band.glb") as unknown as {
    nodes: Record<string, THREE.Mesh>;
  };
  const strap = nodes[STRAP_MESH_NAME] as THREE.Mesh | undefined;
  const smoothGeometry = useSmoothStrapGeometry(strap?.geometry);
  const geometry = useProceduralUVGeometry(smoothGeometry);
  const { normalMap, roughnessMap } = useWovenMaps();
  if (!strap || !geometry) return null;

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial
        {...STRAP_MATERIAL_PROPS}
        normalMap={normalMap}
        roughnessMap={roughnessMap}
      />
    </mesh>
  );
}

// A static 180° turn about Y, not animation — this section's "no
// rotation" rule is about the scroll-driven tumble the module never
// gets (see ModuleTravel), not about a one-time orientation correction.
// Raw (no BASE_ROTATION, matching this whole file's premise), the
// module's embossed-logo face points -Z, away from the camera on +Z;
// this flips it to face the camera instead. Rotating about Y (not Z)
// keeps the module upright and matches how the strap itself is already
// oriented — a Z-axis flip would have turned the module sideways
// relative to it.
const MODULE_FACE_ROTATION: readonly [number, number, number] = [0, Math.PI, 0];

/** The module's own meshes, rendered directly rather than through
 *  <Band> — that component unconditionally applies BASE_ROTATION
 *  internally, which this section's whole premise rules out. Same
 *  per-part material dispatch <Band> itself uses (see its own JSX),
 *  just reusing the exported pieces instead of duplicating the logic
 *  under a different name that could drift from it later. */
function ModulePiece() {
  const { nodes } = useGLTF("/band.glb") as unknown as {
    nodes: Record<string, THREE.Mesh>;
  };
  const { shellMeshes, hardwareMeshes } = useModuleMeshes(nodes);

  return (
    <group rotation={MODULE_FACE_ROTATION}>
      {shellMeshes.map((mesh, i) => (
        <mesh key={`shell-${i}`} geometry={mesh.geometry}>
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
          <mesh key={`hardware-${i}`} geometry={mesh.geometry}>
            <meshStandardMaterial {...materialProps} />
          </mesh>
        );
      })}
    </group>
  );
}

// How long (seconds) the damped follow takes to close most of the gap
// to a new stop — maath's damp() is framerate-independent (see below),
// so this is a real physical time constant, not a per-frame decay rate
// tuned against an assumed 60fps. Long enough to read as weight, short
// enough that a reader who has already moved on to the next step isn't
// still watching the module arrive at the last one.
const MODULE_FOLLOW_SMOOTH_TIME = 0.4;

/** Reads the SAME scrollYProgress MotionValue the step text uses, through
 *  the SAME `activeStepIndex` function the text's own active-step
 *  highlighting is built on (imported from howToGetStartedProgress.ts —
 *  one shared module, not reimplemented here) — one source of truth, so
 *  the module's TARGET and the highlighted step can't drift apart the
 *  way two independently-computed values could. The target itself is
 *  always computed from this undamped, instantaneous progress — only
 *  the module's own motion toward that target is damped (maath's
 *  `damp()`, the standard framerate-independent exponential smoothing:
 *  see https://www.gamedeveloper.com/programming/damp-those-springs —
 *  a per-frame `lerp(current, target, fixedFactor)` implicitly assumes
 *  a fixed frame rate, since the SAME factor applied at 30fps closes
 *  only half the real-time distance it would at 60fps; `damp()` takes
 *  elapsed frame time directly so the real-time smoothing feel doesn't
 *  change with frame rate). This is deliberately NOT the same MotionValue
 *  the text's opacity windows read — those stay tied to the reader's
 *  literal scroll position; only the module's own position trails it,
 *  so the two can never desynchronize by more than this lag, and the
 *  active step is never ambiguous. Reduced motion snaps straight to the
 *  target instead of easing, but still re-reads the SAME active index
 *  every frame — never frozen at one position, since holding still
 *  would break the progress indication this whole section exists to
 *  show. */
function ModuleTravel({
  progress,
  reduceMotion,
}: {
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((_state, delta) => {
    if (!group.current) return;
    const target = moduleStopY(activeStepIndex(progress.get()));
    if (reduceMotion) {
      group.current.position.y = target;
    } else {
      damp(group.current.position, "y", target, MODULE_FOLLOW_SMOOTH_TIME, delta);
    }
  });
  return (
    <group ref={group}>
      <ModulePiece />
    </group>
  );
}

/**
 * The strap + traveling module for /for-organisations' "How To Get
 * Started" section — a full rebuild, not an iteration on the previous
 * sticky-canvas attempt (deleted along with it): no rotation anywhere,
 * a static orthographic camera on +Z looking straight at the origin, and
 * the module's Y position (not rotation) is the only thing that ever
 * moves, snapping through four rest stops as the reader scrolls the
 * steps beside it.
 *
 * Lighting rig + StudioEnvironment, RIG_SCALE, and strap material color
 * are the only things this pass touched — see the light rig's own
 * comment below for the wash/color fix. Layout and scroll wiring
 * (everything else in this file) are unchanged from the prior pass.
 */
export function HowToGetStartedScene({
  progress,
  reduceMotion,
}: {
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  return (
    <Canvas
      className="!absolute inset-0"
      style={{ touchAction: "pan-y" }}
      orthographic
      camera={{ position: [0, 0, 0.5], near: 0.01, far: 2 }}
      dpr={[1, 1.5]}
      gl={{
        alpha: true,
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
        toneMappingExposure: 1,
      }}
    >
      <FitOrthographicCamera />
      {/* Re-diagnosed via fresh isolation testing on this file's own
         RIG_SCALE-corrected geometry (zeroing each light group in turn,
         sampling actual rendered pixel color) rather than reasoning
         about it in the abstract — and the result changed from an
         earlier pass on this same file: with the mesh now wrapped at
         RIG_SCALE, disabling BOTH spotlights and <StudioEnvironment/>
         left the wash almost completely unchanged; disabling ambient +
         directional on top of that dropped it to near-black. So the
         ambient/directional trio, not the spotlights, is what's
         actually washing this out.
         The reason is specific to this scene: the strap is a flat
         plate that faces the camera dead-on for the ENTIRE scroll (no
         rotation, ever) — unlike the other Band scenes, where the
         model continuously turns or is only briefly locked front-on.
         The straight-down-the-Z-axis directional light (originally
         intensity 2.2, meant elsewhere as an occasional "locked-state"
         fill) lands at exactly normal incidence on this surface 100% of
         the time, flooding the whole face uniformly at full strength —
         a flat mirror-ish surface lit dead-on doesn't get the
         angle-of-incidence falloff a curved shell (the module) gets
         across its own surface, so the same intensity reads as a
         uniform wash here where it reads as a highlight there. The
         cool-blue rim light (#8fb3d9) directly tints that wash toward
         pastel blue instead of navy. Trimmed all three to match a
         surface that's always front-lit rather than only sometimes:
         ambient and warm key kept close to original, blue rim and
         Z-axis flood cut hardest since those two are the actual
         wash/tint sources. */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[0.3, 0.4, 0.5]} intensity={1.2} color="#f4f0e9" />
      <directionalLight position={[-0.4, -0.2, -0.3]} intensity={0.3} color="#8fb3d9" />
      <directionalLight position={[0, 0, 0.5]} intensity={0.6} />
      <spotLight position={[2, 3, 3]} angle={0.35} penumbra={0.6} intensity={3.5} decay={2} color="#dac79e" />
      <spotLight position={[0.6, 0.7, 4.3]} angle={0.25} penumbra={0.2} intensity={7} decay={2} color="#ffffff" />
      <StudioEnvironment />
      <Suspense fallback={null}>
        <group scale={RIG_SCALE}>
          <StrapPiece />
          <ModuleTravel progress={progress} reduceMotion={reduceMotion} />
        </group>
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload("/band.glb");
