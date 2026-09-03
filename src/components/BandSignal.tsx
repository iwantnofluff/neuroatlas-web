"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Icosahedron, Sparkles } from "@react-three/drei";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";

/**
 * Abstract wireframe "signal" — not a literal product render (we have no
 * real band photography/CAD yet), but a live data-visualization stand-in
 * that gently rotates and tilts toward the pointer. Uses the three.js /
 * fiber / drei stack installed for the eventual NA·01 hardware render.
 */
function SignalMesh({ reduceMotion }: { reduceMotion: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    if (!reduceMotion) {
      mesh.rotation.y += delta * 0.15;
    }
    const targetX = state.pointer.y * 0.25;
    const targetZ = state.pointer.x * -0.2;
    mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, targetX, 0.04);
    mesh.rotation.z = THREE.MathUtils.lerp(mesh.rotation.z, targetZ, 0.04);
  });

  return (
    <Icosahedron ref={meshRef} args={[1.35, 2]}>
      <meshBasicMaterial color="#dac79e" wireframe transparent opacity={0.55} />
    </Icosahedron>
  );
}

export function BandSignal() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4], fov: 45 }}
      gl={{ alpha: true, antialias: true }}
    >
      <SignalMesh reduceMotion={reduceMotion} />
      {!reduceMotion && (
        <Sparkles count={40} scale={3.4} size={1.6} speed={0.25} color="#dac79e" opacity={0.5} />
      )}
    </Canvas>
  );
}
