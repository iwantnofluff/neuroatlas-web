"use client";

import dynamic from "next/dynamic";

// Same ssr:false boundary rule as BandSignalClient.tsx / BandScrollShowcase:
// @react-three/fiber touches the canvas/WebGL context and can't render
// during the static build, and dynamic(..., { ssr: false }) is only
// allowed from inside a Client Component — this file exists solely to
// hold that boundary.
export const HeroBandClient = dynamic(
  () => import("@/components/HeroBandScene").then((m) => m.HeroBandScene),
  { ssr: false }
);
