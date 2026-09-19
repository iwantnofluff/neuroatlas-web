import { Hero } from "@/components/Hero";
import { HeroBoundary } from "@/components/HeroBoundary";
import { Reveal } from "@/components/Reveal";
import { ContactForm } from "@/components/ContactForm";
import { contactEmail } from "@/lib/nav";

export const metadata = { title: "Contact - NeuroAtlas" };

export default function ContactPage() {
  return (
    <main>
      <Hero
        eyebrow="Contact"
        headline="Something Still Unclear?"
        subhead="Send us your question and we'll get back to you by email."
        ctas={[]}
      />
      <HeroBoundary />

      <section className="dark-glow bg-navy-soft text-cream">
        <div className="mx-auto grid max-w-5xl gap-14 px-6 py-16 md:py-24 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-32">
          <Reveal y={20}>
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
              Send Us A Message
            </h2>
            <p className="mt-6 max-w-md text-pretty text-lg text-cream/75">
              A question, an idea, or something you want to know more
              about? Tell us.
            </p>
            <ContactForm />
          </Reveal>

          <Reveal delay={0.1} y={20}>
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
              Write To Us Directly
            </h2>
            <p className="mt-6 max-w-md text-pretty text-lg text-cream/75">
              Reach us at{" "}
              <a
                href={`mailto:${contactEmail}`}
                className="text-cream underline decoration-cream/30 underline-offset-4 transition-colors hover:decoration-cream"
              >
                {contactEmail}
              </a>
            </p>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
