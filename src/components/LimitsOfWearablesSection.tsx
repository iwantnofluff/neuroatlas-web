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
          <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight text-navy lg:text-4xl">
            The Limits Of Wearables
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-balance text-xl text-navy/90">
            More data was never the point. Knowing what to do with it is.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-mist">
            Most wearables leave you with charts, scores and another
            number to think about. NeuroAtlas gives those signals a job
            — helping you understand when something is shifting, why it
            matters, and what you can do next.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
