"use client";

import dynamic from "next/dynamic";

// Genuinely lazy — @react-three/fiber's Canvas is only pulled in once this
// resolves client-side, never touched during the static build. This file
// exists solely to hold the ssr:false boundary (only allowed inside a
// Client Component) — same split BandScrollShowcase.tsx uses for
// BandScrollScene.
export const TheSpecsSceneClient = dynamic(
  () => import("@/components/TheSpecsScene").then((m) => m.TheSpecsScene),
  { ssr: false }
);
