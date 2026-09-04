import { Environment, Lightformer } from "@react-three/drei";

/**
 * Procedural studio environment map — reflections for the Band model's
 * now fully-metallic materials (metalness 1, see Band.tsx/BandModel.tsx),
 * shared verbatim across every scene that renders it (BandScrollScene,
 * TheSpecsScene, BuiltToReadYouScene), same "copied rather than
 * reinvented" convention those scenes already use for their lighting
 * rig.
 *
 * Deliberately NOT `<Environment preset="city" />` (or any other
 * `preset`/`files` value) — this codebase already hit that exact
 * mistake once and documented it: BuiltToReadYouScene.tsx's own history
 * records a `preset` HDRI fetched from `raw.githack.com` (drei's default
 * preset CDN, "explicitly a dev/testing proxy, not a production asset
 * host") hanging in production and white-screening the whole page, not
 * just this one section. A metalness-1 surface genuinely NEEDS an
 * environment map to look like metal rather than flat black — it has no
 * diffuse component left, only specular reflection of whatever's around
 * it — so removing Environment entirely (that file's actual fix at the
 * time) is no longer an option now that the brief specifically asks for
 * believable metal. This gets the same result a `preset` would (a lit
 * studio for the metal to reflect) with zero network dependency: three
 * <Lightformer> panels — a bright neutral overhead softbox plus a warm
 * gold and cool blue panel on either side, echoing this rig's own
 * existing key/fill light colors — rendered into a procedural cubemap
 * entirely on the GPU, nothing to fetch, nothing to hang on.
 *
 * `frames={1}` renders that cubemap once on mount rather than every
 * frame (drei's default) — correct for a static light rig with nothing
 * in it that moves; re-rendering it continuously would just burn GPU
 * time for a pixel-identical result every frame.
 */
export function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer
        form="rect"
        intensity={4}
        color="#f4f0e9"
        position={[0, 5, 1]}
        scale={[6, 3, 1]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <Lightformer
        form="rect"
        intensity={2.5}
        color="#dac79e"
        position={[-4, 1, 3]}
        scale={[3, 4, 1]}
        rotation={[0, Math.PI / 3, 0]}
      />
      <Lightformer
        form="rect"
        intensity={1.5}
        color="#8fb3d9"
        position={[4, -1, 2]}
        scale={[3, 4, 1]}
        rotation={[0, -Math.PI / 3, 0]}
      />
    </Environment>
  );
}
