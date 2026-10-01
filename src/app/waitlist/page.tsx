import { Hero } from "@/components/Hero";
import { HeroBoundary } from "@/components/HeroBoundary";
import { Reveal } from "@/components/Reveal";
import { WaitlistApplicationForm } from "@/components/WaitlistApplicationForm";

export const metadata = {
  title: "Join The Waitlist - NeuroAtlas",
  description: "Join the waitlist to be the first to know when NeuroAtlas is available.",
};

export default function WaitlistPage() {
  return (
    <main>
      <Hero
        eyebrow=""
        headline="Join The NeuroAtlas Waitlist"
        subhead="Join the waitlist to be the first to know when NeuroAtlas is available."
        ctas={[]}
      />
      <HeroBoundary />

      {/* What you're joining and what happens next sit in the left column,
          the form in the right; source order (joining, form, next) is the
          reading order when the columns stack on smaller screens. */}
      <section id="join" data-visual-section="waitlist" className="dark-glow scroll-mt-24 bg-navy-soft text-cream">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-16 md:py-24 lg:grid-cols-12 lg:gap-x-14 lg:gap-y-16 lg:px-10 lg:py-32">
          <Reveal y={20} className="lg:col-span-5 lg:self-end">
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
              What You&rsquo;re Joining
            </h2>
            <p className="mt-6 text-pretty text-lg text-cream/75">
              Joining the waitlist means you&rsquo;ll be among the first to hear about NeuroAtlas as access opens.
            </p>
            <p className="mt-4 text-pretty text-base text-cream/65">
              We&rsquo;ll share updates on availability and next steps as we move towards launch.
            </p>
          </Reveal>

          <Reveal y={20} delay={0.1} className="lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:self-center">
            <WaitlistApplicationForm />
          </Reveal>

          <Reveal y={20} className="border-t border-line-dark pt-10 lg:col-span-5 lg:self-start lg:pt-12">
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-2xl leading-tight lg:text-3xl">
              What Happens Next
            </h2>
            <p className="mt-6 text-pretty text-base text-cream/75">
              Once you join the waitlist, we&rsquo;ll keep your details on file and contact you by email when there is an
              update on availability.
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
