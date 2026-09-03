import { Hero } from "@/components/Hero";
import { HeroBoundary } from "@/components/HeroBoundary";
import { Reveal } from "@/components/Reveal";
import { FeatureSplitSection } from "@/components/FeatureSplitSection";
import { ShimmerLink } from "@/components/ui/shimmer-button";

export const metadata = { title: "How it works — NeuroAtlas" };

// Copy: client's full pass over the /how-it-works content doc, headline
// options resolved per section (see the note above each pick). Section
// numbering below matches the doc's own 1–9 numbering.

const loopSteps = [
  {
    label: "Measure",
    body: "Reads what is happening in your body, quietly and continuously.",
  },
  {
    label: "Intervene",
    body: "Gives you something to do about it, right where you are.",
  },
  {
    label: "Measure Again",
    body: "Shows you it worked, not just tells you.",
  },
];

export default function HowItWorksPage() {
  return (
    <main>
      {/* 1. Hero — now the shared cinematic banner (see Hero.tsx), with
          this page's own headline/subhead in place of the homepage's, and
          no CTAs (this page has its own closing CTA further down, so a
          second pair of buttons up top would just be noise). Header.tsx's
          transparent-over-dark treatment is opted into for this route
          alongside "/" and "/band". */}
      <Hero
        eyebrow="How It Works"
        headline="Most Apps Stop At Telling You"
        subhead="NeuroAtlas does not just tell you something changed, it makes sure it does."
        ctas={[]}
      />
      <HeroBoundary />

      {/* 2. The loop, in three steps — headline B: differentiates from the
          homepage's own "Measure. Intervene. Measure." heading rather than
          repeating it, and sets up the page's competitive framing (section
          8 later makes the same "other apps" contrast explicit). */}
      <section className="dark-glow bg-navy-soft text-cream">
        <div className="mx-auto max-w-6xl px-6 py-24 lg:px-10 lg:py-32">
          <Reveal y={20} className="text-center">
            <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
              The Part Every Other App Skips
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-cream/75">
              Three steps, repeated every time pressure builds.
            </p>
          </Reveal>
          <div className="mt-16 grid gap-12 sm:grid-cols-3">
            {loopSteps.map((step, i) => (
              <Reveal
                key={step.label}
                delay={i * 0.1}
                className="text-center sm:text-left"
              >
                <span className="eyebrow">{`0${i + 1}`}</span>
                <h3 className="mt-3 font-serif text-xl">
                  {step.label}
                </h3>
                <p className="mt-3 text-base text-cream/70">{step.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Measure — headline B: "What Your Body Already Knows" echoes the
          "before you'd notice yourself" line already used on /band, so the
          two pages reinforce the same idea in the same words. First of the
          six alternating 50/50 sections: text left, media right. */}
      <FeatureSplitSection
        heading="What Your Body Already Knows"
        body="The band reads your nervous system throughout the day, picking up on signals like heart rate variability and breathing before you would notice anything yourself. These signals build a picture of how pressure is actually moving through your day."
        imageSide="right"
        background="cream"
      />

      {/* 4. Intervene — headline A: keeps the site's recurring X-not-Y
          contrast pattern (see the closing CTA, and the homepage's "Other
          Apps Notice. We Fix It." line). Text right, media left. */}
      <FeatureSplitSection
        heading="A Reset, Not A Retreat"
        body="When pressure builds, the app gives you a short reset, right at your desk. No stepping away, no blocking out your afternoon, just a few minutes to bring things back into focus."
        imageSide="left"
        background="navy-soft"
      />

      {/* 5. Measure again — headline A: "The Proof, Not The Promise" adds a
          new angle rather than repeating the body's own closing phrase.
          Given real weight (navy, the one bg-navy section on this page)
          since this is the step that makes the loop's claim credible. The
          HRV stat card already IS this section's visual — passed in as
          `media` rather than buried behind a generic placeholder. The HRV
          number stays marked as an illustrative placeholder, not real
          pilot data — same honesty convention as the /band specs panel's
          "To be confirmed" values. Text left, media right. */}
      <FeatureSplitSection
        heading="The Proof, Not The Promise"
        body="Once the reset is done, the band reads you again, so you see the shift for yourself, shown as a number, not a feeling."
        imageSide="right"
        background="navy"
        media={
          <div className="card-glass bg-transparent flex size-full flex-col items-center justify-center gap-2 px-10 py-6 text-center">
            <p className="eyebrow">HRV</p>
            <p className="font-serif text-4xl text-cream lg:text-5xl">
              42 <span className="text-gold">→</span> 61
            </p>
            <p className="mt-1 text-xs italic text-cream/50">
              Illustrative example, pending real pilot data
            </p>
          </div>
        }
      />

      {/* 6. Pattern recognition — headline B: continues the "before you"
          motif from section 3. Text right, media left. */}
      <FeatureSplitSection
        heading="It Sees The Pattern Before You Do"
        body="Over time, NeuroAtlas starts to notice when your pressure tends to build, a hard stretch before a big call, a recurring point in your week, and steps in earlier each time."
        imageSide="left"
        background="cream"
      />

      {/* 7. A worked example — headline A: the concrete, specific version
          (a real time of day, a real outcome) rather than the more
          abstract option. Text left, media right. */}
      <FeatureSplitSection
        eyebrow="A Worked Example"
        heading="The 4pm Drop, Intercepted"
        body="It is late afternoon. Focus starts to slip, the kind of drop that usually goes unnoticed until it costs you something. The band picks it up. A short reset runs before the next meeting. By the time you are back at your desk, the numbers show it worked."
        imageSide="right"
        background="navy-soft"
      />

      {/* 8. What it does not claim to do — headline B: matches the body's
          own "will not promise" phrasing, which suits directness better
          than a more editorial label for a limitations section. Text
          right, media left. */}
      <FeatureSplitSection
        heading="What NeuroAtlas Will Not Promise"
        body="NeuroAtlas will not make the pressure disappear. It will show you exactly where it is landing, and give you a way to respond."
        imageSide="left"
        background="cream"
      />

      {/* 9. Closing CTA */}
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
