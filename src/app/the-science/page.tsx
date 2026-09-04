import { Hero } from "@/components/Hero";
import { HeroBoundary } from "@/components/HeroBoundary";
import { Reveal } from "@/components/Reveal";
import { ShimmerLink } from "@/components/ui/shimmer-button";

export const metadata = { title: "The science — NeuroAtlas" };

// Copy: client's full pass over the /the-science content doc. Section
// numbering below matches the doc's own numbering — it skips straight
// from 5 to 7 (no section 6 was included in the doc), so this file does
// too rather than silently renumbering.
//
// Section 5's heading needed a second pass: the client rejected both
// options the doc offered ("Grounded In Real Research" / "Where The
// Method Comes From") without proposing a replacement, so "Peer-
// Reviewed, Not Promised" below is a new pick, not a resolved A/B choice
// — flagged here in case it needs another round.

const systems = [
  {
    label: "Autonomic Regulation",
    body: "How your body's automatic stress response gets trained to calm faster.",
  },
  {
    label: "Prefrontal-Limbic Control",
    body: "How your thinking brain regains control from your reactive brain, under pressure.",
  },
  {
    label: "Neuroplastic Conditioning",
    body: "How repetition makes composure a habit, not a one-time fix.",
  },
];

export default function TheSciencePage() {
  return (
    <main>
      {/* 1. Hero — the shared cinematic banner (see Hero.tsx), same
          convention as /how-it-works: page-specific headline/subhead, no
          CTAs (this page has its own closing CTA further down). Only
          Hero.tsx-consuming route where a page-specific visual was never
          asked for, so unlike /inside-the-app there's no competing
          visual need to work around here. Header.tsx's transparent-
          over-dark treatment needs this route added to its own
          `hasDarkHero` list — see that file. */}
      <Hero
        eyebrow="The Science"
        headline="The Evidence Behind The Loop"
        subhead="Every protocol maps to established neuroscience, not a wellness trend."
        ctas={[]}
      />
      <HeroBoundary />

      {/* 2. The three areas the protocols draw on — same 3-column,
          numbered-eyebrow layout as /how-it-works' own "the loop"
          section. */}
      <section className="dark-glow bg-navy-soft text-cream">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-10 lg:py-32">
          <Reveal y={20} className="text-center">
            <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
              Three Systems, One Method
            </h2>
          </Reveal>
          <div className="mt-16 grid gap-12 sm:grid-cols-3">
            {systems.map((system, i) => (
              <Reveal
                key={system.label}
                delay={i * 0.1}
                className="text-center sm:text-left"
              >
                <span className="eyebrow">{`0${i + 1}`}</span>
                <h3 className="mt-3 font-serif text-xl">{system.label}</h3>
                <p className="mt-3 text-base text-cream/70">{system.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Why heart rate variability */}
      <Reveal
        className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32"
        y={20}
      >
        <h2 className="font-serif text-3xl leading-tight text-navy lg:text-4xl">
          The Signal That Does Not Lie
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
          Heart rate variability shows how well your nervous system is
          coping with pressure, in a way you cannot fake or talk yourself
          out of.
        </p>
      </Reveal>

      {/* 4. The limits of standard wearables — the one full-navy,
          standout section on this page: the honest differentiator claim
          the copy itself is built around. */}
      <section className="dark-glow bg-navy text-cream">
        <Reveal
          className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32"
          y={20}
        >
          <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
            Most Wearables Miss The Point
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-cream/75">
            Most wearables measure arousal, not stress specifically, so
            they cannot tell the difference between a hard meeting and a
            strong coffee. NeuroAtlas closes that gap by acting on the
            reading, not just reporting it.
          </p>
        </Reveal>
      </section>

      {/* 5. Research and methodology */}
      <Reveal
        className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32"
        y={20}
      >
        <h2 className="font-serif text-3xl leading-tight text-navy lg:text-4xl">
          Peer-Reviewed, Not Promised
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
          Every protocol maps to peer-reviewed research on autonomic
          regulation and nervous system training, not a single in-house
          study.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-base italic text-mist/80">
          Citations added as the research is published.
        </p>
      </Reveal>

      {/* 7. Closing CTA — identical markup to every other page's closing
          CTA (see /band, /inside-the-app). */}
      <section className="dark-glow bg-navy-soft text-cream">
        <Reveal
          className="mx-auto max-w-2xl px-6 py-24 text-center lg:px-10 lg:py-28"
          y={20}
        >
          <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
            Composure Isn&rsquo;t A Personality. It&rsquo;s Trained.
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
