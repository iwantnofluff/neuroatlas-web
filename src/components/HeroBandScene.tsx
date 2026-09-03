"use client";

import { Canvas } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import { BandModel } from "@/components/BandModel";

/**
 * The hero's rotating 3D band — same BandModel used on /band, but with a
 * clearly-visible continuous idle spin (spinSpeed) instead of that page's
 * barely-there rest state, since here there's no pinned scroll track to
 * carry the motion. `scrollRotation` is kept small (a gentle nudge as the
 * hero scrolls past, not a full turn) so it doesn't fight the idle spin.
 * A restrained particle layer shares this same Canvas (rather than a
 * second stacked one) for atmosphere, skipped under reduced motion. Kept
 * in its own module so it can be lazy-loaded client-only (see
 * HeroBandClient), without pulling @react-three/fiber into the server
 * render at all.
 */
export function HeroBandScene({
  reduceMotion,
  scrollProgress,
}: {
  reduceMotion: boolean;
  scrollProgress: MotionValue<number>;
}) {
  return (
    <Canvas
      className="!absolute inset-0"
      dpr={[1, 2]}
      camera={{ position: [0, 0, 4.4], fov: 40 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={1.1} />
      <hemisphereLight args={["#f4f0e9", "#0b1016", 0.6]} />
      <directionalLight position={[3, 3, 4]} intensity={1.4} color="#f4f0e9" />
      <directionalLight position={[-3, -1, -3]} intensity={0.7} color="#8fb3d9" />
      <directionalLight position={[0, -3, 2]} intensity={0.5} color="#dac79e" />
      <BandModel
        scrollProgress={scrollProgress}
        reduceMotion={reduceMotion}
        spinSpeed={0.18}
        scrollRotation={Math.PI * 0.2}
      />
      {!reduceMotion && (
        <Sparkles count={70} scale={[5, 4.5, 3]} size={1.4} speed={0.2} color="#dac79e" opacity={0.35} />
      )}
    </Canvas>
  );
}
