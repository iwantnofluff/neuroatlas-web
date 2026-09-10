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
    body: "Reads signals from your body to understand what is happening in the moment.",
  },
  {
    label: "Intervene",
    body: "Guides you through a short, neuroscience-based exercise designed for what you are experiencing.",
  },
  {
    label: "Measure Again",
    body: "Checks your signals again so you can see the change after the intervention.",
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
        headline="Here Is What Tracking Never Fixed"
        subhead="Most tools stop at showing you the data. NeuroAtlas closes the loop by measuring what is happening, helping you intervene, and measuring again to see what changed."
        tagline="Measure → Intervene → Measure Again"
        ctas={[]}
      />
      <HeroBoundary />

      {/* 2. The loop, in three steps — headline B: differentiates from the
          homepage's own "Measure. Intervene. Measure." heading rather than
          repeating it, and sets up the page's competitive framing (section
          8 later makes the same "other apps" contrast explicit). */}
      <section className="dark-glow bg-navy-soft text-cream">
        {/* py-16 md:py-24 lg:py-32 (was a flat py-24) — same progressive
           step the homepage's own sections already use (see page.tsx). */}
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24 lg:px-10 lg:py-32">
          <Reveal y={20} className="text-center">
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
              The Part Every Other App Skips
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-cream/75">
              NeuroAtlas doesn&rsquo;t stop at telling you what&rsquo;s
              happening. It helps you do something about it, then checks
              whether it made a difference.
            </p>
          </Reveal>
          {/* md:grid-cols-3, not sm: — 3 short columns at a 640px
             foldable-open width read as cramped and squished; delaying
             the jump to md (768px) keeps this a clean single column
             through the whole foldable tier instead of a premature
             3-up split. */}
          <div className="mt-16 grid gap-12 md:grid-cols-3">
            {loopSteps.map((step, i) => (
              <Reveal
                key={step.label}
                delay={i * 0.1}
                className="text-center md:text-left"
              >
                <span className="eyebrow">{`0${i + 1}`}</span>
                <h3 className="mt-3 text-balance font-serif font-normal uppercase tracking-normal text-xl">
                  {step.label}
                </h3>
                <p className="mt-3 text-pretty text-base text-cream/70">{step.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Measure — heading option A ("The First Read") over B ("Where
          It Starts") — echoes the body's own emphasis on "reads" rather
          than a narrative-sequencing framing. First of the six
          alternating 50/50 sections: text left, media right. */}
      <FeatureSplitSection
        heading="The First Read"
        body="The band reads your heart rate, breathing and more, all day, picking up pressure before you’d notice it yourself."
        imageSide="right"
        background="cream"
      />

      {/* 4. Intervene — heading option A ("Built With Neuroscience") over
          B ("The Reset That Works") — echoes the body's own "built on
          neuroscience" phrase directly. Text right, media left. */}
      <FeatureSplitSection
        heading="Built With Neuroscience"
        body="When pressure builds, the app runs a short exercise, built on neuroscience, right at your desk. No stepping away, just a few minutes to bring things back into focus."
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
            <p className="font-serif font-normal uppercase tracking-normal text-4xl text-cream lg:text-5xl">
              42 <span className="text-gold">→</span> 61
            </p>
            <p className="mt-1 text-pretty text-xs italic text-cream/50">
              Illustrative example, pending real pilot data
            </p>
          </div>
        }
      />

      {/* 6. Pattern recognition. Text right, media left. */}
      <FeatureSplitSection
        heading="Pattern Recognition Technology"
        body="Over time, NeuroAtlas learns when and where your stress tends to build. This helps it recognise recurring patterns and support you before pressure reaches its peak."
        imageSide="left"
        background="cream"
      />

      {/* 7. A worked example — eyebrow kept (it's this section's own
          name), heading updated to the client's final copy, body
          unchanged (already matched verbatim). Text left, media
          right. */}
      <FeatureSplitSection
        eyebrow="A Worked Example"
        heading="Here’s How It Works"
        body="It is late afternoon. Focus starts to slip, the kind of drop that usually goes unnoticed until it costs you something. The band picks it up. A short reset runs before the next meeting. By the time you are back at your desk, the numbers show it worked."
        imageSide="right"
        background="navy-soft"
      />

      {/* 8. What it does not claim to do. Text right, media left. */}
      <FeatureSplitSection
        heading="What We Won’t Promise"
        body="NeuroAtlas will not make the pressure disappear. It will show you exactly where it is landing, and help you manage it."
        imageSide="left"
        background="cream"
      />

      {/* 9. Closing CTA */}
      <section className="dark-glow bg-navy-soft text-cream">
        <Reveal
          className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-28"
          y={20}
        >
          <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
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
