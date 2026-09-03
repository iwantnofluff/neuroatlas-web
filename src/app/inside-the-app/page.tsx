import { Reveal } from "@/components/Reveal";
import { ShimmerLink } from "@/components/ui/shimmer-button";

export const metadata = { title: "Inside the app — NeuroAtlas" };

// Copy: client's full pass over the /inside-the-app content doc, headline
// options resolved per section (see the note above each pick). Section
// numbering below matches the doc's own 1–9 numbering.

export default function InsideTheAppPage() {
  return (
    <main>
      {/* 1. Hero — headline A: "Where The Reading Becomes A Reset" uses
          the same reading/reset vocabulary as /how-it-works, so the two
          pages read as one system rather than two separate pitches. */}
      <Reveal
        className="mx-auto max-w-3xl px-6 pt-40 pb-20 text-center lg:px-10 lg:pt-48 lg:pb-24"
        y={20}
      >
        <p className="eyebrow">Inside The App</p>
        <h1 className="mt-4 font-serif text-4xl leading-tight text-navy lg:text-5xl">
          Where The Reading Becomes A Reset
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
          Every reading turns into something you can act on.
        </p>
      </Reveal>

      {/* 2. The daily dashboard — headline A: "one glance" pairs directly
          with the line's "one reading, one number" brevity. */}
      <section className="dark-glow bg-navy-soft text-cream">
        <Reveal
          className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32"
          y={20}
        >
          <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
            Your Day, In One Glance
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-cream/75">
            Open the app and see exactly where you stand, before the day
            gets ahead of you.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-base italic text-cream/50">
            One reading. One number. No guesswork.
          </p>
        </Reveal>
      </section>

      {/* 3. The NeuroLibrary — headline B: "fast" is the differentiator the
          line itself argues for ("no scrolling through forty options"). */}
      <Reveal
        className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32"
        y={20}
      >
        <h2 className="font-serif text-3xl leading-tight text-navy lg:text-4xl">
          The Right Tool, Fast
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
          Every toolkit and drill lives inside the NeuroLibrary, grouped so
          you can find what actually fits the moment.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-base italic text-mist/80">
          No scrolling through forty options to find the right one.
        </p>
      </Reveal>

      {/* 4. Boardroom Mode — headline A: the specific, concrete version
          ("two minutes before the room") over the more generic options.
          Given the one dark, standout section on this page since the copy
          itself calls it out as the feature people come back to. */}
      <section className="dark-glow bg-navy text-cream">
        <Reveal
          className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32"
          y={20}
        >
          <p className="eyebrow">The Standout Feature</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight lg:text-4xl">
            Two Minutes Before The Room
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-cream/75">
            A short priming protocol for the minutes before a negotiation, a
            board vote, or any moment you cannot afford to walk in
            unfocused.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-base italic text-cream/50">
            This is the one feature people come back to before every
            high-stakes moment.
          </p>
        </Reveal>
      </section>

      {/* 5. Journal and daily check-in — headline B: names the actual
          differentiator (feeling placed alongside the reading) rather than
          a generic "quick check-in" framing. */}
      <Reveal
        className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32"
        y={20}
      >
        <h2 className="font-serif text-3xl leading-tight text-navy lg:text-4xl">
          How You Feel, Alongside What The Data Shows
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
          A quick daily check-in, so what you&rsquo;re feeling sits right
          next to what the band is reading. Private by default.
        </p>
      </Reveal>

      {/* 6. Progress tracking — headline B: keeps the site's recurring
          "not just X" contrast, and echoes the body's own "not just
          today". */}
      <section className="dark-glow bg-navy-soft text-cream">
        <Reveal
          className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32"
          y={20}
        >
          <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
            Watch The Trend, Not Just The Day
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-cream/75">
            See how things shift over weeks, not just today.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-base italic text-cream/50">
            A single bad day means less when you can see the whole trend.
          </p>
        </Reveal>
      </section>

      {/* 7. Health integrations — headline A: matches the body/line's own
          repeated "already track" / "already rely on" phrasing. */}
      <Reveal
        className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32"
        y={20}
      >
        <h2 className="font-serif text-3xl leading-tight text-navy lg:text-4xl">
          Works Alongside What You Already Use
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
          Connect NeuroAtlas with the health apps you already track,
          entirely optional.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-base italic text-mist/80">
          More context, without replacing anything you already rely on.
        </p>
      </Reveal>

      {/* 8. Availability — headline A: direct and action-oriented, in
          keeping with the rest of the page's headings, rather than a
          generic "available now" (also avoids implying general-public
          availability while access is still invite-based). */}
      <Reveal
        className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32"
        y={20}
      >
        <h2 className="font-serif text-3xl leading-tight text-navy lg:text-4xl">
          Get It On Your Phone
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
          NeuroAtlas is available on iOS and Android.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-base italic text-mist/80">
          The band is required for the full experience.
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
