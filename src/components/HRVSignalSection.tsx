import { Reveal } from "@/components/Reveal";

/**
 * "The Signal That Does Not Lie" — text content only. The Champagne
 * Gold line graph that used to live in this file now spans THIS
 * section and LimitsOfWearablesSection together (see
 * HRVAndLimitsSection.tsx, which renders both as children so the wave
 * can be one continuous vertical draw across both, rather than two
 * separate short horizontal ones) — a direct "moving from 'Your Body'
 * to the end of 'The Limits Of Wearables'" request.
 *
 * No `bg-cream` here anymore — a real, confirmed bug this fixes: this
 * section renders AFTER (on top of) the wave's own SVG in
 * HRVAndLimitsSection.tsx's DOM order, so its own opaque background
 * was painting directly over the wave everywhere the two overlapped,
 * confirmed live (the drawn line was only ever visible in the
 * transparent gap between this section and LimitsOfWearablesSection,
 * never over this section's own text). HRVAndLimitsSection's own
 * wrapper already provides the shared bg-cream both sections sit on.
 */
export function HRVSignalSection() {
  return (
    <section className="relative px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32">
      <Reveal y={20} className="relative mx-auto max-w-3xl">
        <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight text-navy lg:text-4xl">
          Your Body Keeps Receipts.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-mist">
          You can tell yourself you&rsquo;re fine. Your nervous system may
          have other ideas. HRV is one of the quieter clues your body
          gives you. Viewed against your own baseline, it can reveal when
          your system is carrying more strain, or when it&rsquo;s
          finally getting the recovery it needs.
        </p>
      </Reveal>
    </section>
  );
}
