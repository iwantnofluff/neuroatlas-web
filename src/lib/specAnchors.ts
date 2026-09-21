/** Shared between Band.tsx (renders the glowing anchor dot) and
 *  TheSpecs.tsx (projects that same point to 2D to draw the leader
 *  line) — ONE source of truth for these coordinates, so the dot
 *  rendered on the model and the line's target can never drift apart
 *  from each other.
 *
 *  Coordinates are in the model's own LOCAL space, specifically the
 *  space of Band.tsx's inner `<group rotation={BASE_ROTATION}>` — the
 *  one that directly parents the actual mesh geometry. Placing the
 *  anchor there (rather than computing a world-space point ourselves)
 *  means it automatically inherits BOTH that fixed axis correction and
 *  the outer group's live per-frame rotation for free, via the normal
 *  Three.js scene graph — no transform math to keep in sync by hand.
 *
 *  The source GLTF's own bounding box is ~2.5cm (real-world meters, see
 *  Band.tsx's own comment on `Scale`), so values here stay within
 *  roughly ±0.013 on each axis. Like `rotation` in TheSpecs.tsx, this is
 *  a best-effort, stylized placement, not a projection onto real
 *  per-feature sub-meshes — the export has no separate geometry for a
 *  charging port or sensor window to target. */
export type SpecKey = "sensors" | "battery" | "connectivity" | "dimensions" | "compatibility";

export const SPEC_ANCHORS: Record<SpecKey, readonly [number, number, number]> = {
  sensors: [-0.001, -0.0105, 0.0045],
  battery: [0.007, -0.0105, 0.0015],
  connectivity: [0, 0.0095, 0.003],
  dimensions: [0.011, 0, 0.0015],
  compatibility: [0, 0, 0.006],
};

/** Radius of the visible glowing marker sphere, same local-space units
 *  as the anchors above — small enough to read as "a tiny dot on the
 *  model," not a floating ball. Rendered with depthTest disabled (see
 *  Band.tsx's own comment), so a slightly larger radius than a strictly
 *  "on the surface" dot would need is what actually keeps it reading as
 *  a clear, deliberate marker rather than a faint speck. */
export const SPEC_ANCHOR_DOT_RADIUS = 0.001;
