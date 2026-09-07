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
 *
 * Confirmed live in production (screenshot): the shell read as a flat
 * black silhouette with just a couple of gold glints, not navy metal.
 * Root cause was this file, not the deploy — three narrow accent panels
 * cover only a thin slice of the reflection sphere; every direction a
 * metalness-1 surface doesn't happen to catch one of those three panels
 * (or a direct light) has NOTHING to reflect, so it renders pure black
 * (there is no diffuse fallback left at metalness 1 — see Band.tsx's own
 * comment). The five `fill` panels below wrap the object on every side
 * (front/back/left/right/bottom) at a neutral cream tone and modest
 * intensity — PBR metals tint reflected light by their own base color
 * (that's *why* a neutral-light environment reads as navy off a navy
 * shell, rather than needing a navy-colored light), so this is what
 * actually paints the shell navy rather than black, from any camera
 * angle across all three scenes that share this component. The three
 * original `accent` panels (bright overhead + warm gold + cool blue)
 * are unchanged, layered on top for the actual highlight/character work.
 * Resolution bumped 256->384 for a smoother gradient across the extra
 * panels — still a one-time render (frames={1}), so this costs nothing
 * per-frame.
 */
export function StudioEnvironment() {
  return (
    <Environment resolution={384} frames={1}>
      {/* Fill — neutral wraparound, keeps metal from going black between
         the accent highlights below. */}
      <Lightformer form="rect" intensity={1} color="#f4f0e9" position={[0, 0, 6]} scale={[10, 10, 1]} />
      <Lightformer
        form="rect"
        intensity={1}
        color="#f4f0e9"
        position={[0, 0, -6]}
        scale={[10, 10, 1]}
        rotation={[0, Math.PI, 0]}
      />
      <Lightformer
        form="rect"
        intensity={0.8}
        color="#f4f0e9"
        position={[6, 0, 0]}
        scale={[10, 10, 1]}
        rotation={[0, -Math.PI / 2, 0]}
      />
      <Lightformer
        form="rect"
        intensity={0.8}
        color="#f4f0e9"
        position={[-6, 0, 0]}
        scale={[10, 10, 1]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <Lightformer
        form="rect"
        intensity={0.7}
        color="#e5dac2"
        position={[0, -6, 0]}
        scale={[10, 10, 1]}
        rotation={[Math.PI / 2, 0, 0]}
      />
      {/* Accent — original three panels, unchanged. */}
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
