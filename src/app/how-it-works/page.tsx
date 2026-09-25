import { Hero } from "@/components/Hero";
import { HeroBoundary } from "@/components/HeroBoundary";
import { Reveal } from "@/components/Reveal";
import { FeatureSplitSection } from "@/components/FeatureSplitSection";
import { VitalsDashboard } from "@/components/VitalsDashboard";
import { NeuroWaveVisual } from "@/components/NeuroWaveVisual";
import { HrvDetailCard } from "@/components/HrvDetailCard";
import { IPhoneMockup } from "@/components/IPhoneMockup";
import { ShimmerLink } from "@/components/ui/shimmer-button";

export const metadata = { title: "How it works - NeuroAtlas" };

// Copy: client's full pass over the /how-it-works content doc, headline
// options resolved per section (see the note above each pick). Section
// numbering below matches the doc's own 1–9 numbering.

const loopSteps = [
  {
    label: "Measure",
    tagline: "Understand your state.",
    body: "NeuroAtlas reads your physiological signals against your personal baseline to reveal what's happening beneath the surface.",
  },
  {
    label: "Intervene",
    tagline: "Shift your state.",
    body: "Targeted interventions help regulate your system and move it towards a more stable state.",
  },
  {
    label: "Verify",
    tagline: "See the response.",
    body: "Your signals show how your system responded, making the effect of the intervention visible.",
  },
];

export default function HowItWorksPage() {
  return (
    <main>
      {/* 1. Hero - now the shared cinematic banner (see Hero.tsx), with
          this page's own headline/subhead in place of the homepage's, and
          no CTAs (this page has its own closing CTA further down, so a
          second pair of buttons up top would just be noise). Header.tsx's
          transparent-over-dark treatment is opted into for this route
          alongside "/" and "/band".

          headline's embedded "\n" forces the break after "Tracking" —
          reported live as wrapping awkwardly into three lines otherwise,
          stranding "Fixed" alone on its own row. This is Hero.tsx's own
          established convention (see that component's `headline` prop
          doc comment) for exactly this: the headline renders via
          per-word flex-wrap for the stagger animation, not the browser's
          native text layout, so plain `text-balance` has no effect on it
          (Hero.tsx's own comment documents this as a confirmed no-op) —
          "\n" is what actually controls where it breaks. Each forced
          line is still its own flex-wrap row underneath, so this still
          wraps further on narrow phones exactly as gracefully as an
          unbroken headline would; nothing extra is needed for mobile. */}
      <Hero
        eyebrow="How It Works"
        headline={"Here Is What Tracking\nNever Fixed"}
        subhead="Most tools show you the data and stop there. Seeing the numbers is only the start. NeuroAtlas helps you understand what's happening, and see how your system responds."
        ctas={[]}
        heroImage="/photos/how-it-works-hero.png"
      />
      <HeroBoundary />

      {/* 2. The loop, in three steps - headline B: differentiates from the
          homepage's own "Measure. Intervene. Measure." heading rather than
          repeating it, and sets up the page's competitive framing (section
          8 later makes the same "other apps" contrast explicit). */}
      <section className="dark-glow bg-navy-soft text-cream">
        {/* py-16 md:py-24 lg:py-32 (was a flat py-24) - same progressive
           step the homepage's own sections already use (see page.tsx). */}
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24 lg:px-10 lg:py-32">
          <Reveal y={20} className="text-center">
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
              Measure, Intervene, Verify
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-balance text-lg text-cream/75">
              From signal to action to visible change. NeuroAtlas shows you
              what works for your system.
            </p>
          </Reveal>
          {/* md:grid-cols-3, not sm: - 3 short columns at a 640px
             foldable-open width read as cramped and squished; delaying
             the jump to md (768px) keeps this a clean single column
             through the whole foldable tier instead of a premature
             3-up split. */}
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {loopSteps.map((step, i) => (
              <Reveal
                key={step.label}
                delay={i * 0.1}
                className="card-glass bg-transparent p-8 text-center md:text-left"
              >
                <div className="flex items-baseline gap-3 md:justify-start justify-center">
                  <span className="eyebrow">{`0${i + 1}`}</span>
                  <h3 className="text-balance font-serif font-normal uppercase tracking-normal text-xl">
                    {step.label}
                  </h3>
                </div>
                <p className="mt-3 text-nowrap font-serif text-lg text-gold-soft">
                  {step.tagline}
                </p>
                <p className="mt-3 text-pretty text-base text-cream/70">{step.body}</p>
              </Reveal>
            ))}
          </div>
          {/* Closing statement for the loop - a direct "add this at the
             bottom of the page" request: placed here, right under the
             three steps, rather than at the very end of the whole page
             (after the unrelated closing CTA) - this line is about the
             loop specifically (each pass making future recommendations
             more personal), the same topic every other piece of copy in
             this section already covers, not a page-level closer. */}
          <Reveal delay={0.3} y={20} className="mt-16 text-center">
            <h3 className="text-balance font-serif font-normal uppercase tracking-normal text-xl leading-tight lg:text-2xl">
              The Loop Gets Smarter With You.
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-pretty text-base text-cream/70">
              Every response helps us learn which interventions work best
              for you, making future recommendations increasingly
              personal.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3. Measure - heading option A ("The First Read") over B ("Where
          It Starts") - echoes the body's own emphasis on "reads" rather
          than a narrative-sequencing framing. First of the six
          alternating 50/50 sections: text left, media right. */}
      <FeatureSplitSection
        heading="The First Read"
        body="The band reads your heart rate, breathing, and more - all day - picking up signs of pressure before you may notice them yourself."
        imageSide="right"
        background="cream"
        media={
          <div className="card-glass-light flex size-full items-center justify-center p-6">
            <VitalsDashboard />
          </div>
        }
      />

      {/* 4. Intervene - heading option A ("Built With Neuroscience") over
          B ("The Reset That Works") - echoes the body's own "built on
          neuroscience" phrase directly. Text right, media left. */}
      <FeatureSplitSection
        heading="Built With Neuroscience"
        body="NeuroAtlas is built around how the brain and nervous system respond to stress, focus and recovery. It combines the body’s signals with neuroscience-backed techniques to help you understand your state and use simple, targeted tools to shift it."
        imageSide="left"
        background="navy-soft"
        media={<NeuroWaveVisual />}
      />

      {/* 5. Measure again - headline A: "The Proof, Not The Promise" adds a
          new angle rather than repeating the body's own closing phrase.
          Given real weight (navy, the one bg-navy section on this page)
          since this is the step that makes the loop's claim credible. The
          HRV detail screen (Figma node 15312:18742, minus its own "About
          this metric" section per explicit instruction) IS this
          section's visual - passed in as `media` rather than buried
          behind a generic placeholder. Text left, media right. */}
      <FeatureSplitSection
        heading="The Proof, Not The Promise"
        body="Once the reset is done, the band reads you again, so you see the shift for yourself, shown as a number, not a feeling."
        imageSide="right"
        background="navy"
        mediaClassName="aspect-[3/5] max-md:max-h-none md:max-h-none"
        media={
          <div className="flex size-full items-center justify-center">
            <IPhoneMockup className="h-full">
              <div className="h-full overflow-y-auto px-4 pt-[15%] pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <HrvDetailCard />
              </div>
            </IPhoneMockup>
          </div>
        }
      />
      {/* Disclaimer for the HRV stat card above - a direct "add a
         disclaimer in the footer" request: placed as its own small-print
         line directly under this one section rather than inside the
         shared FeatureSplitSection component, since no other section
         using that component needs it. */}
      <div className="bg-navy px-6 pb-16 text-center lg:px-10 lg:pb-20">
        <p className="mx-auto max-w-2xl text-pretty text-xs text-cream/50">
          HRV varies naturally between individuals and across the day.
          Changes are interpreted relative to your personal baseline and
          should not be read as a standalone measure of health or stress.
        </p>
      </div>

      {/* 6. Pattern recognition. Text right, media left. */}
      <FeatureSplitSection
        heading="Pattern Recognition Technology"
        body="Over time, NeuroAtlas learns how your stress, recovery and regulation shift. It builds personal trends from your data, revealing recurring patterns and early signs of rising pressure - so you can understand your system better and respond before it reaches its peak."
        imageSide="left"
        background="cream"
      />

      {/* 7. A worked example - eyebrow kept (it's this section's own
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
