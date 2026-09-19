"use client";

import dynamic from "next/dynamic";

const Studio = dynamic(() => import("./Studio").then((m) => m.Studio), {
  ssr: false,
});

export function StudioLoader() {
  return <Studio />;
}
