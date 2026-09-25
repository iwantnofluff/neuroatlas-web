"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
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
import { activeStepIndex, STEP_COUNT } from "@/lib/howToGetStartedProgress";

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
const MODULE_TRAVEL_TOP = 0.1003;
const MODULE_TRAVEL_BOTTOM = -0.1003;

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
// world-space (post-scale) measurement, while MODULE_TRAVEL_TOP/BOTTOM
// above stay as pre-scale LOCAL coordinates inside the scaled group, so
// they don't need to change.
const RIG_SCALE = 32;

// The full visible height the orthographic camera frames, in world
// space (i.e. after RIG_SCALE) — the strap's own real height (0.2605m)
// plus a comfortable margin on both ends, scaled up to match: this is
// what "frame the full 260mm height with a comfortable margin" converts
// to once the strap itself is rendered at the same world scale as every
// other Band scene.
const CAMERA_TARGET_HEIGHT = 0.32 * RIG_SCALE;

function moduleStopY(index: number) {
  const t = STEP_COUNT <= 1 ? 0 : index / (STEP_COUNT - 1);
  return THREE.MathUtils.lerp(MODULE_TRAVEL_TOP, MODULE_TRAVEL_BOTTOM, t);
}

/** Keeps the orthographic camera's zoom in sync with the canvas's own
 *  live pixel height, recalculated on every resize — the only way to
 *  guarantee "frame the full 260mm height... at all times" actually
 *  holds regardless of how tall the sticky left column renders at on a
 *  given viewport, rather than a zoom value tuned for one specific
 *  canvas size that drifts on any other. */
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

/** Welds duplicate seam vertices and recomputes smooth normals.
 *
 *  The raw strap mesh is a CAD extrusion built from ~19 discrete cross-
 *  section rings along its length, each with its own hard-baked per-
 *  facet normals rather than normals shared across ring boundaries —
 *  confirmed directly (a Node script parsing band.glb): 464 vertices for
 *  only 371 unique normal directions, and welding by position drops it
 *  to 284 vertices, meaning ~180 were spatially-duplicate seam vertices
 *  existing only to carry a discontinuous normal. That discontinuity is
 *  the real cause of the horizontal "ruler" banding along the strap's
 *  length under raking light — not a shading style choice, an actual
 *  faceted-CAD-export bug — so the fix is to weld those seams and
 *  recompute genuinely smooth normals, not to paint over it with a
 *  texture. mergeVertices() only merges vertices whose attributes ALL
 *  match, so the stale per-facet normal attribute has to be deleted
 *  first or it would itself block the very merge meant to fix it. */
function useSmoothStrapGeometry(geometry: THREE.BufferGeometry | undefined) {
  return useMemo(() => {
    if (!geometry) return undefined;
    const cloned = geometry.clone();
    cloned.deleteAttribute("normal");
    const merged = mergeVertices(cloned);
    merged.computeVertexNormals();
    return merged;
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
    <>
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
    </>
  );
}

/** Reads the SAME scrollYProgress MotionValue the step text uses, through
 *  the SAME `activeStepIndex` function the text's own active-step
 *  highlighting is built on (imported from HowToGetStartedSection.tsx,
 *  not reimplemented here) — one source of truth, so the module and the
 *  highlighted step can't drift apart the way two independently-computed
 *  values could. Eased via a per-frame damped lerp toward whichever stop
 *  is currently active (same "smooth follow" convention Band.tsx's own
 *  xray variant already uses); reduced motion snaps straight to the
 *  target instead of easing, but still tracks the SAME active index every
 *  frame — never frozen at one position, since holding still would break
 *  the progress indication this whole section exists to show. */
function ModuleTravel({
  progress,
  reduceMotion,
}: {
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!group.current) return;
    const target = moduleStopY(activeStepIndex(progress.get()));
    group.current.position.y = reduceMotion
      ? target
      : THREE.MathUtils.lerp(group.current.position.y, target, 0.12);
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
