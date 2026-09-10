import { Reveal } from "@/components/Reveal";

/**
 * "The Limits Of Wearables" — /the-science's section 4 per the client's
 * final copy pass. New section, not a reskin of anything that existed
 * before: this page's own earlier build had a fourth section ("Most
 * Wearables Miss The Point") that was deliberately dropped in a
 * previous pass because the client's spec at the time named only 5
 * sections total, none of them this one (see page.tsx's own comment).
 * The client's later, final copy brings a version of it back — a
 * plain centered text block, matching this page's own established
 * treatment for a section with no called-for bespoke visual (see
 * HRVSignalSection.tsx's own text block, minus its background wave).
 */
export function LimitsOfWearablesSection() {
  return (
    <section>
      <div className="mx-auto max-w-3xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32">
        <Reveal y={20}>
          <h2 className="text-balance font-serif text-3xl leading-tight text-navy lg:text-4xl">
            The Limits Of Wearables
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-mist">
            Most wearables can tell you what is happening in your body. The
            gap is knowing what that information means for your stress, and
            what to do next. NeuroAtlas reads the difference, and acts on
            it.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
