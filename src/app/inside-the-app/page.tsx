import { Gauge, Users, BookOpen } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { FeatureSplitSection } from "@/components/FeatureSplitSection";
import { AppScreenMock } from "@/components/AppScreenMock";
import { TrendGraph } from "@/components/TrendGraph";
import { ShimmerLink } from "@/components/ui/shimmer-button";

export const metadata = { title: "Inside the app — NeuroAtlas" };

// Copy: client's full pass over the /inside-the-app content doc (second
// pass — replaces the earlier all-text version). Section numbering below
// matches the doc's own 1–9 numbering. Two standing edits applied across
// every section per the client's own explicit notes on this pass:
// headings trimmed to 2–3 words max, and body copy never hedges (no
// "entirely optional" — every line is a plain statement).
//
// Sections with a clearly-called-for single visual (2, 3, 4, 6, 7) use
// FeatureSplitSection — this site's established pinned text+media split
// (see /how-it-works) — with a real custom `media` panel per the brief's
// own visual spec, not the generic ImageIcon placeholder. Sections 1, 5,
// 8 stay as plain, non-pinned Reveal blocks (matching this page's
// original, lighter treatment): 1 because the shared <Hero> component is
// built around the physical band's own photography with no slot for a
// different visual, 5 because the brief marks its screenshot optional,
// 8 because a two-badge row doesn't need a whole cinematic pinned beat.
//
// No real app UI has been designed/exported yet, so every "screenshot"
// here is AppScreenMock (a generic phone-frame silhouette + icon/label,
// not a fabricated trace of a real screen) or TrendGraph (a hand-drawn
// illustrative line, explicitly labeled as such) — same honesty
// convention /how-it-works' own HRV stat card already uses.

export default function InsideTheAppPage() {
  return (
    <main>
      {/* 1. Hero */}
      <div className="mx-auto max-w-3xl px-6 pt-40 pb-16 text-center lg:px-10 lg:pt-48">
        <Reveal y={20}>
          <p className="eyebrow">Inside The App</p>
          <h1 className="mt-4 font-serif text-4xl leading-tight text-navy lg:text-5xl">
            Turns Into Action
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
            Every reading turns into something you can act on.
          </p>
        </Reveal>
      </div>
      <Reveal delay={0.1} y={20} className="px-6 pb-20 lg:pb-24">
        <AppScreenMock
          icon={Gauge}
          label="Today's Reading"
          tone="light"
          annotations={[{ label: "Readiness: 82", className: "top-12 -right-4 sm:-right-10" }]}
        />
      </Reveal>

      {/* 2. The daily dashboard */}
      <FeatureSplitSection
        heading="One Glance"
        imageSide="right"
        background="navy-soft"
        body={
          <>
            <p>
              Open the app and see exactly where you stand, before the day
              gets ahead of you.
            </p>
            <p className="mt-4 text-base italic text-cream/50">
              One reading. One number. No guesswork.
            </p>
          </>
        }
        media={
          <div className="flex size-full items-center justify-center">
            <AppScreenMock
              icon={Gauge}
              label="Dashboard"
              className="max-w-[200px]"
              annotations={[
                { label: "Readiness: 82", className: "top-12 -right-4" },
                { label: "Today's Trend ↑", className: "bottom-16 -left-4" },
              ]}
            />
          </div>
        }
      />

      {/* 3. The NeuroLibrary */}
      <FeatureSplitSection
        heading="The Right Tool"
        imageSide="left"
        background="cream"
        body={
          <>
            <p>
              Every toolkit and drill lives inside the NeuroLibrary, grouped
              so you can find what actually fits the moment.
            </p>
            <p className="mt-4 text-base italic text-mist/80">
              No scrolling through forty options to find the right one.
            </p>
          </>
        }
        media={
          <div className="card-glass-light grid size-full grid-cols-2 gap-3 p-8">
            {[
              "Breathing",
              "Focus Reset",
              "Pre-Meeting",
              "Recovery",
              "Sleep Wind-Down",
              "Quick Reset",
            ].map((category) => (
              <div
                key={category}
                className="flex items-center justify-center rounded-xl border border-navy/10 bg-white/60 px-3 py-4 text-center text-xs font-medium tracking-wide text-navy/70 uppercase"
              >
                {category}
              </div>
            ))}
          </div>
        }
      />

      {/* 4. Boardroom Mode — the one flagship, full-navy section, same as
         the original pass: the copy itself calls this out as the feature
         people come back to. */}
      <FeatureSplitSection
        eyebrow="The Standout Feature"
        heading="Boardroom Mode"
        imageSide="right"
        background="navy"
        body={
          <>
            <p>
              A short priming protocol for the minutes before a negotiation,
              a board vote, or any moment you cannot afford to walk in
              unfocused.
            </p>
            <p className="mt-4 text-base italic text-cream/50">
              This is the one feature people come back to before every
              high-stakes moment.
            </p>
          </>
        }
        media={
          <div className="flex size-full items-center justify-center">
            <AppScreenMock
              icon={Users}
              label="Boardroom Mode"
              className="max-w-[200px]"
              annotations={[{ label: "T-2:00", className: "top-10 -left-4 sm:-left-10" }]}
            />
          </div>
        }
      />

      {/* 5. Journal and daily check-in — brief marks the screenshot
         optional; a plain non-pinned split rather than the full cinematic
         FeatureSplitSection treatment. */}
      <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:px-10 lg:py-32">
        <Reveal y={20} className="text-center lg:text-left">
          <h2 className="font-serif text-3xl leading-tight text-navy lg:text-4xl">
            One Minute
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-mist lg:mx-0">
            A quick daily check-in, so what you&rsquo;re feeling sits right
            next to what the band is reading. Private by default.
          </p>
        </Reveal>
        <Reveal delay={0.1} y={20}>
          <AppScreenMock icon={BookOpen} label="Daily Check-In" tone="light" />
        </Reveal>
      </div>

      {/* 6. Progress tracking */}
      <FeatureSplitSection
        heading="The Long View"
        imageSide="left"
        background="navy-soft"
        body={
          <>
            <p>See how things shift over weeks, not just today.</p>
            <p className="mt-4 text-base italic text-cream/50">
              A single bad day means less when you can see the whole trend.
            </p>
          </>
        }
        media={<TrendGraph tone="dark" />}
      />

      {/* 7. Health integrations — chips name illustrative CATEGORIES, not
         real integration partners (no confirmed partnerships to name
         specific health-app brands against yet), matching the "To be
         confirmed" honesty convention used for hardware specs elsewhere
         on this site rather than fabricating a specific claimed partner
         list. */}
      <FeatureSplitSection
        heading="Plays Well"
        imageSide="right"
        background="cream"
        body={
          <>
            <p>Connect NeuroAtlas with the health apps you already track.</p>
            <p className="mt-4 text-base italic text-mist/80">
              More context, without replacing anything you already rely on.
            </p>
          </>
        }
        media={
          <div className="card-glass-light flex size-full flex-col items-center justify-center gap-3 p-8">
            {["Sleep Tracking", "Wearables", "Health Records", "Calendar"].map(
              (category) => (
                <div
                  key={category}
                  className="w-full rounded-full border border-navy/10 bg-white/60 px-5 py-2.5 text-center text-sm text-navy/70"
                >
                  {category}
                </div>
              )
            )}
          </div>
        }
      />

      {/* 8. Availability */}
      <Reveal
        className="mx-auto max-w-3xl px-6 py-24 text-center lg:px-10 lg:py-32"
        y={20}
      >
        <h2 className="font-serif text-3xl leading-tight text-navy lg:text-4xl">
          Available Now
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-mist">
          NeuroAtlas is available on iOS and Android.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-base italic text-mist/80">
          The band is required for the full experience.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {["App Store", "Google Play"].map((store) => (
            <span
              key={store}
              className="rounded-full border border-navy/15 px-6 py-2.5 text-sm text-navy/70"
            >
              {store}
            </span>
          ))}
        </div>
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
