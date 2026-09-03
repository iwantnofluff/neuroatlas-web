import { BandScrollShowcase } from "@/components/BandScrollShowcase";
import { HeroBoundary } from "@/components/HeroBoundary";
import { Reveal } from "@/components/Reveal";
import { SpecsPanel } from "@/components/SpecsPanel";
import { OneSignalSection } from "@/components/OneSignalSection";
import { DesignedToBlendInSection } from "@/components/DesignedToBlendInSection";
import { SignalVsNoiseSection } from "@/components/SignalVsNoiseSection";
import { ShimmerLink } from "@/components/ui/shimmer-button";

export const metadata = { title: "The NA·01 band — NeuroAtlas" };

// Copy: client's full pass over the /band page content doc. BandScrollShowcase
// covers sections 1 ("Hero") and 2 ("What It Reads") together — see the
// comment in that file for why. Sections 3–9 follow below in order.

export default function BandPage() {
  return (
    <main>
      <BandScrollShowcase />
      <HeroBoundary />

      {/* 3. What it deliberately does not do — "Expand & Snap": a massive
          gradient-masked headline scales down and locks into center, own
          h-[200vh] pinned track. See OneSignalSection.tsx. */}
      <OneSignalSection />

      {/* 4. Design and build — "Expand & Snap": a cinematic letterbox
          slit expands to fill the screen behind the headline, own
          h-[300vh] pinned track. See DesignedToBlendInSection.tsx. */}
      <DesignedToBlendInSection />

      {/* 5+6. Accuracy/validation + how the band and app work together —
          "Signal vs. Noise": scrapped the static 2-photo grid and the two
          separate plain text blocks ("Precision, Not Guesswork" / "The
          App Reads You") in favor of one unified cinematic sequence, own
          h-[400vh] pinned track. See SignalVsNoiseSection.tsx. */}
      <SignalVsNoiseSection />

      {/* 7. Technical specifications — an interactive tab/detail panel
          instead of a static grid, since every value is still a
          placeholder pending the real spec doc; this is already in the
          right shape to swap in real values with no restructuring. */}
      <section className="dark-glow bg-navy-soft text-cream">
        <div className="mx-auto max-w-3xl px-6 py-24 lg:px-10 lg:py-32">
          <Reveal y={20} className="text-center">
            <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
              The Specs
            </h2>
          </Reveal>
          <Reveal delay={0.1} y={20}>
            <SpecsPanel />
          </Reveal>
        </div>
      </section>

      {/* 8. Common concerns — copy option A */}
      <Reveal
        className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32"
        y={20}
      >
        <h2 className="font-serif text-3xl leading-tight text-navy lg:text-4xl">
          Another Device To Charge And Wear?
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
          This isn&rsquo;t about tracking steps or workouts. It&rsquo;s
          about catching the moments pressure builds quietly, in a meeting,
          before a call, mid-afternoon, before they show up in a decision
          you regret.
        </p>
      </Reveal>

      {/* 9. Closing CTA */}
      <section className="dark-glow bg-navy-soft text-cream">
        <Reveal
          className="mx-auto max-w-2xl px-6 py-24 text-center lg:px-10 lg:py-28"
          y={20}
        >
          <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
            Join The London Pilot Program
          </h2>
          <ShimmerLink
            href="/request-access"
            background="color-mix(in oklab, var(--color-cream) 30%, transparent)"
            shimmerColor="var(--color-cream)"
            className="mt-8 text-sm tracking-wide text-cream"
          >
            Request Access
          </ShimmerLink>
        </Reveal>
      </section>
    </main>
  );
}
