"use client";

import dynamic from "next/dynamic";

/** Faint HRV-style waveform shown while the 3D signal bundle loads. */
function WaveFallback() {
  return (
    <svg
      viewBox="0 0 400 80"
      fill="none"
      aria-hidden="true"
      className="w-2/3 text-gold"
    >
      <path
        d="M0 40 H140 L155 10 L170 70 L185 40 H400"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// next/dynamic's `ssr: false` is only allowed inside a Client Component —
// this file exists solely to hold that boundary, since @react-three/fiber
// touches the canvas/WebGL context and can't render during the static build.
export const BandSignalClient = dynamic(
  () => import("@/components/BandSignal").then((m) => m.BandSignal),
  {
    ssr: false,
    loading: () => <WaveFallback />,
  }
);
