import { Reveal } from "@/components/Reveal";

/**
 * "Built On Neuroscience" — /the-science's section 5 per the client's
 * final copy pass. dark-glow/bg-navy-soft specifically so it alternates
 * away from LimitsOfWearablesSection's cream directly above it, and
 * back into EditorialIndexSection's own cream directly below it (that
 * component's background is fixed — see its own doc comment on why
 * it's untouched) — this section is the dark beat in between, not
 * incidentally dark.
 */
export function BuiltOnNeuroscienceSection() {
  return (
    <section className="dark-glow bg-navy-soft text-cream">
      <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32">
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
