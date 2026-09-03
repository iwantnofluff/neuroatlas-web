"use client";

import { Canvas } from "@react-three/fiber";
import type { MotionValue } from "framer-motion";
import { BandModel } from "@/components/BandModel";

/** The actual WebGL scene — kept in its own module so it can be lazy-loaded
 * client-only (see BandScrollShowcase), without pulling @react-three/fiber
 * into the server render at all. */
export function BandScrollScene({
  reduceMotion,
  progress,
}: {
  reduceMotion: boolean;
  progress: MotionValue<number>;
}) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4.2], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={1.1} />
      <hemisphereLight args={["#f4f0e9", "#0b1016", 0.6]} />
      <directionalLight position={[3, 3, 4]} intensity={1.4} color="#f4f0e9" />
      <directionalLight position={[-3, -1, -3]} intensity={0.7} color="#8fb3d9" />
      <directionalLight position={[0, -3, 2]} intensity={0.5} color="#dac79e" />
      <BandModel scrollProgress={progress} reduceMotion={reduceMotion} />
    </Canvas>
  );
}
