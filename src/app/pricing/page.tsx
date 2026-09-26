import { Check } from "lucide-react";
import { Hero } from "@/components/Hero";
import { HeroBoundary } from "@/components/HeroBoundary";
import { Reveal } from "@/components/Reveal";
import { WaitlistForm } from "@/components/WaitlistForm";

export const metadata = { title: "Pricing and plans - NeuroAtlas" };

const FOUNDATION_PILOT_FEATURES = [
  "The NA·01 Neural Band (Pantone 282 CP Navy finish)",
  "Full access to the NeuroAtlas Mobile Application",
  "Boardroom Mode & High-Stakes protocols",
  "Priority support and hardware upgrades",
];

export default function PricingPage() {
  return (
    <main>
      <Hero
        eyebrow="Pilot Program - India"
        headline="Exclusive Pilot Access"
        subhead="NeuroAtlas is currently rolling out to select organizations and individuals. Secure your place on the waitlist to get early access to the NA·01 band and the full protocol library."
        ctas={[]}
      />
      <HeroBoundary />

      <section className="dark-glow bg-navy-soft text-cream">
        <div className="mx-auto max-w-2xl px-6 py-16 md:py-24 lg:px-10 lg:py-32">
          <Reveal y={20} className="card-glass bg-transparent p-8 text-center lg:p-12">
            <p className="eyebrow">Future Pricing</p>
            <h2 className="mt-4 text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
              The Foundation Pilot
            </h2>

            <ul className="mt-8 grid gap-4 text-left">
              {FOUNDATION_PILOT_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  <span className="text-pretty text-base text-cream/85">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>

            <WaitlistForm />
          </Reveal>
        </div>
      </section>
    </main>
  );
}
