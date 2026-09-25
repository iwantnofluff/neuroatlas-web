"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";
import { Band, BASE_ROTATION } from "@/components/Band";
import { StudioEnvironment } from "@/components/StudioEnvironment";

const STRAP_MESH_NAME = "empty_3";

// Real assembled scale — both the module and the strap render from the
// SAME raw CAD coordinate space (confirmed: both meshes' own bounding-box
// centers land within a few mm of the shared origin), so one scale factor
// keeps them physically consistent as one rigid object. Much smaller than
// any other Band scene's own scale (30-34) — those are tuned to frame
// just the ~25mm module tightly; this scene has to fit the module PLUS
// the full ~260mm strap extending to both sides, an order of magnitude
// bigger footprint, in the same camera.
const SCENE_SCALE = 8;

// {x: 0.5, y: Math.PI/4} — the exact isometric/dynamic angle asked for,
// applied to the WHOLE assembly (module + strap together) as one rigid
// tilt, not to <Band> internally — <Band>'s own "xray" rotation target
// stays fixed at {x:0, y:0} below specifically so this outer tilt is the
// only rotation actually visible, rather than the two composing into an
// angle nobody chose on purpose.
const ISOMETRIC_TILT: readonly [number, number, number] = [0.5, Math.PI / 4, 0];

// Woven navy metallic strap — same material/UV-generation approach as
// TimelineBandSpine.tsx (now removed; this scene replaces it entirely,
// per direct feedback that the flat spine read as a 2D rectangle). See
// that file's own former header comment (preserved here) for why these
// exact numbers: the mesh has zero real UVs (confirmed directly against
// band.glb), so this box-projects planar UVs from the mesh's own local
// X/Y before tiling a hand-drawn cross-hatch CanvasTexture as a bumpMap.
const STRAP_MATERIAL_PROPS = {
  color: "#041E42",
  roughness: 0.35,
  metalness: 0.85,
  side: THREE.DoubleSide,
} as const;
const WOVEN_TEXTURE_REPEAT: readonly [number, number] = [4, 40];
const STRAP_BUMP_SCALE = 0.35;

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

/** The strap, rendered as a sibling of <Band> rather than inside it —
 *  <Band> only ever renders the module (shellMeshes/hardwareMeshes; the
 *  strap is deliberately excluded there, see that file's own header
 *  comment). Wrapped in its own `scale`+`rotation={BASE_ROTATION}` group
 *  replicating exactly what <Band> applies to itself internally, so the
 *  two align as one assembly instead of the strap sitting in raw,
 *  uncorrected CAD space while the module sits in corrected space. */
function StrapPiece() {
  const { nodes } = useGLTF("/band.glb") as unknown as {
    nodes: Record<string, THREE.Mesh>;
  };
  const strap = nodes[STRAP_MESH_NAME] as THREE.Mesh | undefined;
  const geometry = useProceduralUVGeometry(strap?.geometry);
  const bumpMap = useWovenBumpTexture();
  if (!strap || !geometry) return null;

  return (
    <group scale={SCENE_SCALE} rotation={BASE_ROTATION}>
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

/** Continuous scroll-driven spin, composed OUTSIDE the isometric tilt —
 *  applied as its own outermost group so it rotates the already-tilted
 *  assembly around the WORLD Y axis (reads as the object turning in
 *  place on a turntable), not around its own tilted local axis (which
 *  would wobble/precess instead of spinning cleanly). Plain useFrame +
 *  MotionValue.get(), same "read the live scroll value every frame
 *  inside R3F" convention as every other scroll-tied rotation in this
 *  codebase (Band.tsx's own useFrame blocks, TimelineBandSpine's former
 *  ProgressHighlight). */
function ScrollSpin({
  progress,
  reduceMotion,
  children,
}: {
  progress: MotionValue<number>;
  reduceMotion: boolean;
  children: React.ReactNode;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame(() => {
    if (!group.current) return;
    const p = reduceMotion ? 0 : progress.get();
    // A little over half a turn across the whole section — enough for
    // the environment's lights to genuinely sweep across every face
    // (including the woven strap) rather than a token few degrees, but
    // short of a full turn landing back where it started (which would
    // make the very end of the scroll look identical to the beginning).
    group.current.rotation.y = p * Math.PI * 1.6;
  });
  return <group ref={group}>{children}</group>;
}

/**
 * The premium sticky-scroll showcase for /for-organisations' "How To Get
 * Started" section — replaces TimelineBandSpine.tsx's flat vertical strap
 * rail entirely (removed; direct feedback called it out as reading like a
 * 2D rectangle). Renders the full wearable — module (<Band>) and strap
 * (StrapPiece, aligned via the same BASE_ROTATION correction) — as one
 * rigid assembly, held at a fixed isometric tilt and spun continuously
 * around world Y as the reader scrolls past the steps beside it.
 *
 * Lighting rig + StudioEnvironment copied verbatim from every other Band
 * scene in this codebase, for the same reason they always are: the
 * module's hardware and the strap's own woven mesh are both
 * metalness > 0.8, which has essentially no diffuse response left and
 * reads as flat black without a real environment to reflect (see
 * Band.tsx's and TimelineBandSpine's own identical reasoning).
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
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6.5], fov: 45 }}
      gl={{
        alpha: true,
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        outputColorSpace: THREE.SRGBColorSpace,
        toneMappingExposure: 1,
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} color="#f4f0e9" />
      <directionalLight position={[-4, -2, -3]} intensity={0.7} color="#8fb3d9" />
      <directionalLight position={[0, 0, 5]} intensity={2.2} />
      <spotLight position={[2, 3, 3]} angle={0.35} penumbra={0.6} intensity={3.5} color="#dac79e" />
      <spotLight position={[0.6, 0.7, 4.3]} angle={0.25} penumbra={0.2} intensity={7} color="#ffffff" />
      <StudioEnvironment />
      <Suspense fallback={null}>
        <ScrollSpin progress={progress} reduceMotion={reduceMotion}>
          <group rotation={ISOMETRIC_TILT}>
            <Band
              scrollProgress={progress}
              reduceMotion={reduceMotion}
              variant="xray"
              scale={SCENE_SCALE}
              targetRotation={{ x: 0, y: 0 }}
            />
            <StrapPiece />
          </group>
        </ScrollSpin>
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload("/band.glb");
