import { Reveal } from "@/components/Reveal";
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
      {/* 1. Hero — headline A: "Most Apps Stop At Telling You" pairs
          directly with the supporting line's "does not just tell you". No
          dark hero here (Header.tsx only solidifies-on-scroll for "/" and
          "/band"), so this stays a light, editorial-style opener. */}
      <Reveal
        className="mx-auto max-w-3xl px-6 pt-40 pb-20 text-center lg:px-10 lg:pt-48 lg:pb-24"
        y={20}
      >
        <p className="eyebrow">How It Works</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-navy lg:text-5xl">
          Most Apps Stop At Telling You
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
          NeuroAtlas does not just tell you something changed, it makes sure
          it does.
        </p>
      </Reveal>

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
          two pages reinforce the same idea in the same words. */}
      <Reveal
        className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32"
        y={20}
      >
        <h2 className="font-serif text-3xl leading-tight text-navy lg:text-4xl">
          What Your Body Already Knows
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
          The band reads your nervous system throughout the day, picking up
          on signals like heart rate variability and breathing before you
          would notice anything yourself. These signals build a picture of
          how pressure is actually moving through your day.
        </p>
      </Reveal>

      {/* 4. Intervene — headline A: keeps the site's recurring X-not-Y
          contrast pattern (see the closing CTA, and the homepage's "Other
          Apps Notice. We Fix It." line). */}
      <section className="dark-glow bg-navy-soft text-cream">
        <Reveal
          className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32"
          y={20}
        >
          <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
            A Reset, Not A Retreat
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-cream/75">
            When pressure builds, the app gives you a short reset, right at
            your desk. No stepping away, no blocking out your afternoon,
            just a few minutes to bring things back into focus.
          </p>
        </Reveal>
      </section>

      {/* 5. Measure again — headline A: "The Proof, Not The Promise" adds a
          new angle rather than repeating the body's own closing phrase.
          Given real weight (navy, the one dark section on this page) since
          this is the step that makes the loop's claim credible. The
          HRV number is explicitly marked as an illustrative placeholder,
          not real pilot data — same honesty convention as the /band specs
          panel's "To be confirmed" values. */}
      <section className="dark-glow bg-navy text-cream">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32">
          <Reveal y={20}>
            <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
              The Proof, Not The Promise
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-cream/75">
              Once the reset is done, the band reads you again, so you see
              the shift for yourself, shown as a number, not a feeling.
            </p>
          </Reveal>
          <Reveal delay={0.1} y={16} className="mt-12 flex justify-center">
            <div className="card-glass px-10 py-6">
              <p className="eyebrow">HRV</p>
              <p className="mt-2 font-serif text-4xl text-cream lg:text-5xl">
                42 <span className="text-gold">→</span> 61
              </p>
              <p className="mt-3 text-xs italic text-cream/50">
                Illustrative example, pending real pilot data
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 6. Pattern recognition — headline B: continues the "before you"
          motif from section 3. */}
      <Reveal
        className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32"
        y={20}
      >
        <h2 className="font-serif text-3xl leading-tight text-navy lg:text-4xl">
          It Sees The Pattern Before You Do
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
          Over time, NeuroAtlas starts to notice when your pressure tends to
          build, a hard stretch before a big call, a recurring point in your
          week, and steps in earlier each time.
        </p>
      </Reveal>

      {/* 7. A worked example — headline A: the concrete, specific version
          (a real time of day, a real outcome) rather than the more
          abstract option. Set as a single narrative paragraph, styled a
          touch larger to read like a short case rather than a claim. */}
      <section className="dark-glow bg-navy-soft text-cream">
        <Reveal
          className="mx-auto max-w-2xl px-6 py-24 text-center lg:px-10 lg:py-32"
          y={20}
        >
          <p className="eyebrow">A Worked Example</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight lg:text-4xl">
            The 4pm Drop, Intercepted
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-serif text-xl leading-relaxed text-cream/85 lg:text-2xl">
            It is late afternoon. Focus starts to slip, the kind of drop
            that usually goes unnoticed until it costs you something. The
            band picks it up. A short reset runs before the next meeting.
            By the time you are back at your desk, the numbers show it
            worked.
          </p>
        </Reveal>
      </section>

      {/* 8. What it does not claim to do — headline B: matches the body's
          own "will not promise" phrasing, which suits directness better
          than a more editorial label for a limitations section. */}
      <Reveal
        className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32"
        y={20}
      >
        <h2 className="font-serif text-3xl leading-tight text-navy lg:text-4xl">
          What NeuroAtlas Will Not Promise
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
          NeuroAtlas will not make the pressure disappear. It will show you
          exactly where it is landing, and give you a way to respond.
        </p>
      </Reveal>

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
