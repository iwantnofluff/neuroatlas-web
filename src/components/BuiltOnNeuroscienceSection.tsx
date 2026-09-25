import Image from "next/image";
import { Reveal } from "@/components/Reveal";

/**
 * "Built On Neuroscience" — /the-science's section 5 per the client's
 * final copy pass. dark-glow/bg-navy-soft specifically so it alternates
 * away from LimitsOfWearablesSection's cream directly above it, and
 * back into EditorialIndexSection's own cream directly below it (that
 * component's background is fixed — see its own doc comment on why
 * it's untouched) — this section is the dark beat in between, not
 * incidentally dark.
 *
 * built-with-evidence.png — client-supplied macro shot of the band's
 * own clasp/strap — now sits full-bleed behind the copy, same scrim
 * treatment Hero.tsx's own background image uses (bg-navy-soft/xx +
 * a top/bottom gradient) so the text stays legible regardless of the
 * photo's own exposure; bg-navy-soft stays on the section itself as
 * the fallback colour while the image loads.
 *
 * min-h-[85svh] — a direct "make the section big otherwise the image
 * won't look great" correction: the previous plain text padding
 * (py-16/24/32) gave the photo only as much room as the copy itself
 * needed, cropping most of the shot down to a shallow strip and
 * leaving little of its own cinematic framing (the glowing rim-lit
 * clasp) actually visible. A generous min-height, with the copy
 * centered inside it via flex rather than relying on padding alone,
 * gives the photo real room to read as a full banner.
 */
export function BuiltOnNeuroscienceSection() {
  return (
    <section className="dark-glow relative flex min-h-[85svh] items-center overflow-hidden bg-navy-soft text-cream">
      <Image
        src="/photos/built-with-evidence.png"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-navy-soft/55" />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-navy-soft/80 via-transparent to-navy-soft/90"
      />

      <div className="relative mx-auto w-full max-w-3xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32">
        <Reveal y={20}>
          <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
            Built With Evidence
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-cream/75">
            Behind every NeuroAtlas tool is a body of research. We draw
            from neuroscience, psychology and peer-reviewed work on
            stress, attention, emotional regulation and recovery, then
            turn that science into something you can actually use.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
