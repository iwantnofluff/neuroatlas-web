"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { MotionValue } from "framer-motion";
import * as THREE from "three";

/**
 * Stylized 3D interpretation of the NA·01 band. Proportions were corrected
 * against a real studio product photo (public/photos/hero-band.jpg,
 * supplied by the client) that shows the band floating straight-on: the
 * loop reads as nearly circular (not the tall oval this started as), the
 * strap is a flat woven ribbon (not a round cord), the module sits flush
 * with the strap's width, and the clasp is narrower but also flush — not
 * inset. Colors stay stylized gold-on-steel (not literal navy-on-navy) for
 * legibility against the dark backdrop — a deliberate brand choice, not a
 * claim about the real materials.
 *
 * Still a best-effort approximation, not a scan: a handful of marketing
 * photos (even a clean straight-on one) can inform proportions and
 * placement, but can't substitute for calibrated multi-angle photogrammetry
 * or a CAD file — flagged to the user accordingly.
 *
 * `scrollProgress` is a Framer Motion MotionValue (0–1); read every frame
 * via `.get()` rather than subscribed, since useFrame already runs
 * per-frame. `spinSpeed` lets callers tune how fast the idle rotation reads
 * — the pinned /band showcase wants it barely-there (scroll is the real
 * driver there), the hero wants a continuous, clearly-visible turn since
 * there's no pinned scroll track to carry the motion.
 */
export function BandModel({
  scrollProgress,
  reduceMotion,
  spinSpeed = 0.025,
  scrollRotation = Math.PI * 1.5,
}: {
  scrollProgress: MotionValue<number>;
  reduceMotion: boolean;
  spinSpeed?: number;
  scrollRotation?: number;
}) {
  const group = useRef<THREE.Group>(null);

  // A near-circular loop — closer to the real band's silhouette than the
  // earlier tall-oval version.
  const loopGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const segments = 96;
    for (let i = 0; i < segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      points.push(new THREE.Vector3(Math.sin(t) * 0.92, Math.cos(t) * 1.0, 0));
    }
    const curve = new THREE.CatmullRomCurve3(points, true);
    return new THREE.TubeGeometry(curve, 160, 0.15, 20, true);
  }, []);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;

    const progress = scrollProgress.get();
    const idle = reduceMotion ? 0 : state.clock.elapsedTime * spinSpeed;
    g.rotation.y = idle + progress * scrollRotation;
    g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, 0.32 + state.pointer.y * 0.08, 0.05);

    if (!reduceMotion) {
      g.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.03;
    }
  });

  return (
    <group ref={group}>
      {/* The band loop — flattened in depth (scale.z) so the round tube
          reads as a flat woven ribbon rather than a cord, matching the
          reference photo. */}
      <mesh geometry={loopGeometry} scale={[1, 1, 0.4]}>
        <meshStandardMaterial color="#dac79e" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* The sensor module — flush with the strap's width, per the
          reference photo (not a narrower box floating on top of it). */}
      <RoundedBox
        args={[0.5, 0.3, 0.14]}
        radius={0.05}
        smoothness={4}
        position={[0, 1.0, 0.08]}
      >
        <meshStandardMaterial color="#b5bcc4" metalness={0.9} roughness={0.22} />
      </RoundedBox>
      {/* Emblem/button detail on the module face */}
      <mesh position={[0, 1.0, 0.16]}>
        <circleGeometry args={[0.05, 24]} />
        <meshStandardMaterial color="#5c6773" metalness={0.6} roughness={0.35} />
      </mesh>

      {/* The slide clasp — narrower than the module but still flush with
          the strap's width, directly opposite on the loop. */}
      <RoundedBox
        args={[0.32, 0.28, 0.12]}
        radius={0.04}
        smoothness={4}
        position={[0, -1.0, 0.08]}
      >
        <meshStandardMaterial color="#7c8791" metalness={0.85} roughness={0.28} />
      </RoundedBox>
    </group>
  );
}
