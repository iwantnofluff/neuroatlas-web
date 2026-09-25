"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { StudioEnvironment } from "@/components/StudioEnvironment";

// The strap itself, not the module — "empty_3" in the raw GLTF (no
// semantic names anywhere in this file, see Band.tsx's own header
// comment for how every mesh here was identified). 260.5 x 22.0 x 1.6mm
// raw, already long on its own local Y axis, which is exactly the
// vertical spine this section wants — no rotation needed to stand it
// up, unlike Band.tsx's own BASE_ROTATION correction for the module.
const STRAP_MESH_NAME = "empty_3";

// Anodised navy metallic mesh — a direct request to make the strap read
// as a Milanese-style woven metal band rather than the fabric/soft-touch
// finish this file previously documented (that was the product spec's
// own description of the strap; this is a deliberate departure from it,
// confirmed explicitly before changing, not an accident). #041E42 is
// PANTONE 282 CP, the same reference hex the housing itself uses.
// metalness 0.85 (not 1) leaves a sliver of diffuse response so the navy
// base color still reads at all — see Band.tsx's own SHELL_MATERIAL_PROPS
// comment for the identical reasoning already established there: a pure
// metalness-1 surface only shows color through reflections, which loses
// a dark navy almost entirely against a light backdrop.
//
const STRAP_MATERIAL_PROPS = {
  color: "#041E42",
  roughness: 0.35,
  metalness: 0.85,
  side: THREE.DoubleSide,
} as const;

const STRAP_SCALE = 3.6;

// 4 across the width / 40 down the length (not the originally-specced
// 12/120, and bumpScale 0.35, not 0.05-0.1) — tuned against the real
// deployed size of this canvas, not guessed: it's ~40 CSS px wide on
// screen. Confirmed by direct pixel measurement (row-by-row horizontal
// stddev of the rendered output, before/after each change) that 12x120
// tiling put each tile at only ~3 physical px even at 2x DPR — below
// what mipmapping preserves, so it measured as pure smooth gradient
// (row stddev ~0.7, statistically flat) no matter how high bumpScale
// went. 4x40 keeps the same roughly-square tile proportions (matching
// this face's own 22 x 260.5mm real aspect ratio) at a size mipmapping
// actually resolves — confirmed via the same pixel measurement jumping
// to ~4.3 (real, visible texture) once both this and the dpr ceiling
// below were raised together. bumpScale needed to rise similarly:
// this scene's StudioEnvironment is a soft, low-frequency environment
// (large panels, not point-like), and a bump-perturbed normal only
// visibly redirects a reflection if the environment has enough
// contrast at that scale to begin with — the 0.05-0.1 range assumed a
// sharper light source than what's actually reflected here.
const WOVEN_TEXTURE_REPEAT: readonly [number, number] = [4, 40];
const STRAP_BUMP_SCALE = 0.35;

/** Real UVs don't exist anywhere in this GLB (confirmed directly against
 *  the file — every one of its 16 meshes has only POSITION and NORMAL).
 *  This is a planar/box projection, not a real unwrap: U from local X,
 *  V from local Y, each normalized against the mesh's OWN bounding box —
 *  a deliberate, explicit workaround for a flat mostly-rectangular plate
 *  specifically (X and Y are the strap's two large face dimensions, Z is
 *  just the 1.6mm thickness), not a general-purpose unwrap that would
 *  hold up on the module's own curved shell. Distortion at the strap's
 *  thin side edges (where this projection compresses an entire edge's
 *  worth of geometry into a sliver of U or V range) is an accepted,
 *  known limitation of that shortcut, not a bug to chase — the front/
 *  back faces (nearly all of the visible surface at this scene's own
 *  tilt) read correctly, which is what a repeating weave pattern
 *  actually needs to look right.
 *
 *  Clones the geometry rather than mutating the one `useGLTF` caches —
 *  that cached object is shared and reused across every future call to
 *  `useGLTF("/band.glb")` anywhere in the app for the lifetime of the
 *  page; writing a new attribute onto it directly would leak this
 *  component's own workaround into every other consumer of this file. */
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

/** A small seamless diagonal cross-hatch tile, hand-drawn onto a
 *  <canvas> rather than sourced as an image asset — this is a height/
 *  bump map (grayscale = surface displacement), not color, so
 *  `colorSpace = NoColorSpace` is set explicitly rather than left at
 *  CanvasTexture's own sRGB default, which would otherwise gamma-
 *  correct the height values and throw off the resulting bump
 *  intensity. Two opposing 45deg line sets over a neutral mid-gray
 *  base, each offset by exactly one tile width/height on either side so
 *  the pattern tiles with no visible seam under RepeatWrapping. */
function useWovenBumpTexture() {
  return useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, size, size);

    const lineWidth = size / 10;
    const step = size / 6;

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = "#ffffff";
    ctx.globalAlpha = 0.6;
    for (let offset = -size; offset <= size * 2; offset += step) {
      ctx.beginPath();
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset + size, size);
      ctx.stroke();
    }

    ctx.strokeStyle = "#000000";
    ctx.globalAlpha = 0.6;
    for (let offset = -size; offset <= size * 2; offset += step) {
      ctx.beginPath();
      ctx.moveTo(offset + size, 0);
      ctx.lineTo(offset, size);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.NoColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(...WOVEN_TEXTURE_REPEAT);
    texture.needsUpdate = true;
    return texture;
  }, []);
}

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
  const strap = nodes[STRAP_MESH_NAME] as THREE.Mesh | undefined;
  // Both hooks called unconditionally, ahead of the missing-mesh guard
  // below — geometry/texture generation can't be skipped by an early
  // return the way a plain variable could, since hook call order has to
  // stay identical across renders regardless of whether `strap` resolved.
  const geometry = useProceduralUVGeometry(strap?.geometry);
  const bumpMap = useWovenBumpTexture();
  if (!strap || !geometry) return null;

  return (
    <group scale={STRAP_SCALE} rotation={[STRAP_TILT_X, STRAP_TILT_Y, 0]}>
      <mesh geometry={geometry}>
        <meshStandardMaterial
          {...STRAP_MATERIAL_PROPS}
          bumpMap={bumpMap ?? undefined}
          bumpScale={STRAP_BUMP_SCALE}
        />
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
 * StudioEnvironment is required here, not optional — metalness 0.85
 * leaves almost no diffuse component, so the metallic weave has next to
 * nothing to reflect without it (the exact same reasoning already
 * established for the module's own metalness-1 hardware in Band.tsx).
 * This was NOT needed in this file's own earlier non-metallic version;
 * added specifically alongside the metalness change, not left over.
 */
export function TimelineBandSpine({ progress }: { progress: MotionValue<number> }) {
  return (
    <Canvas
      className="!absolute inset-0"
      orthographic
      camera={{ position: [0, 0, 2], zoom: 900, near: 0.1, far: 10 }}
      // Higher ceiling than every other Band scene's own dpr cap
      // (1.5) — deliberately, not an oversight: this canvas is only
      // ~40px wide on screen, so even 2x here is a trivial pixel count
      // regardless, and the weave tile pattern needs the extra real
      // pixels per tile to render as legible detail rather than
      // anti-aliasing itself into a flat tone (confirmed live — see
      // WOVEN_TEXTURE_REPEAT's own comment).
      dpr={[1, 3]}
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
      <StudioEnvironment />
      <ProgressHighlight progress={progress} />
      <Suspense fallback={null}>
        <StrapMesh />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload("/band.glb");
