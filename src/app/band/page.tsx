import Image from "next/image";
import { BandScrollShowcase } from "@/components/BandScrollShowcase";
import { HeroBoundary } from "@/components/HeroBoundary";
import { Reveal } from "@/components/Reveal";
import { TextLink } from "@/components/TextLink";
import { SpecsPanel } from "@/components/SpecsPanel";
import { ShimmerLink } from "@/components/ui/shimmer-button";

export const metadata = { title: "The NA·01 band — NeuroAtlas" };

// Copy: client's full pass over the /band page content doc. BandScrollShowcase
// covers sections 1 ("Hero") and 2 ("What It Reads") together — see the
// comment in that file for why. Sections 3–9 follow below in order.

const gallery = [
  { src: "/photos/band-ice-still.jpg", alt: "The NA·01 band, weatherproof against ice and stone" },
  { src: "/photos/band-ice-splash.jpg", alt: "The NA·01 band splashing into water" },
  { src: "/photos/band-bw-wrist.jpg", alt: "The NA·01 band worn on the wrist" },
];

export default function BandPage() {
  return (
    <main>
      <BandScrollShowcase />
      <HeroBoundary />

      {/* 3. What it deliberately does not do */}
      <Reveal
        className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32"
        y={20}
      >
        <h2 className="font-serif text-3xl leading-tight text-navy lg:text-4xl">
          One Signal, Just Stress
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
          No step counts. No notifications. No sleep tracking. Just stress,
          read precisely, because that&rsquo;s the one signal that actually
          helps you.
        </p>
      </Reveal>

      {/* 4. Design and build */}
      <section className="dark-glow bg-navy-soft text-cream">
        <Reveal
          className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32"
          y={20}
        >
          <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
            Designed To Blend In
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-cream/75">
            Lightweight, screenless, and made to disappear into your day.
            Charges quickly, when it needs it.
          </p>
        </Reveal>
      </section>

      {/* Real studio photography, supplied by the client — a visual break
          between the design/build copy and the more technical sections
          below, rather than replacing the stylized 3D model above. */}
      <section className="mx-auto max-w-6xl px-6 py-24 lg:px-10 lg:py-32">
        <div className="grid gap-6 sm:grid-cols-3">
          {gallery.map((photo, i) => (
            <Reveal
              key={photo.src}
              delay={i * 0.1}
              className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-navy"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 640px) 33vw, 100vw"
                className="object-cover"
              />
            </Reveal>
          ))}
        </div>
      </section>

      {/* 5. Accuracy and validation */}
      <section className="dark-glow bg-navy text-cream">
        <Reveal
          className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32"
          y={20}
        >
          <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
            Precision, Not Guesswork
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-cream/75">
            Every reading is checked against your own resting baseline, not
            a general average, then filtered to separate real stress from
            caffeine, a workout, or the cold. What shows up on your
            dashboard is your signal, not noise.
          </p>
        </Reveal>
      </section>

      {/* 6. How the band and app work together */}
      <Reveal
        className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32"
        y={20}
      >
        <h2 className="font-serif text-3xl leading-tight text-navy lg:text-4xl">
          The App Reads You
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
          The band reads your signals. The app turns them into something
          you can act on.
        </p>
        <div className="flex justify-center">
          <TextLink href="/inside-the-app">Learn More</TextLink>
        </div>
      </Reveal>

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
