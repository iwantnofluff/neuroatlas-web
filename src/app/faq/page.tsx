import { Hero } from "@/components/Hero";
import { HeroBoundary } from "@/components/HeroBoundary";
import { Reveal } from "@/components/Reveal";
import { FaqAccordion } from "@/components/FaqAccordion";
import { ShimmerLink } from "@/components/ui/shimmer-button";

export const metadata = { title: "FAQ - NeuroAtlas" };

export default function FaqPage() {
  return (
    <main>
      <Hero
        eyebrow="FAQ"
        headline="Frequently Asked Questions"
        subhead="Whether you're exploring NeuroAtlas for yourself or your organisation, start here."
        ctas={[]}
      />
      <HeroBoundary />

      <section className="dark-glow bg-navy-soft text-cream">
        <div className="px-6 py-16 md:py-24 lg:px-10 lg:py-32">
          <Reveal y={20}>
            <FaqAccordion />
          </Reveal>
        </div>
      </section>

      <section className="dark-glow bg-navy text-cream">
        <Reveal
          className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-28"
          y={20}
        >
          <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
            Didn&rsquo;t Find Your Answer?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-cream/75">
            Still have a question? Send it to us and we&rsquo;ll help.
          </p>
          <ShimmerLink
            href="/contact"
            background="color-mix(in oklab, var(--color-cream) 30%, transparent)"
            shimmerColor="var(--color-cream)"
            className="mt-8 text-sm tracking-wide text-cream"
          >
            Contact Us
          </ShimmerLink>
        </Reveal>
      </section>
    </main>
  );
}
