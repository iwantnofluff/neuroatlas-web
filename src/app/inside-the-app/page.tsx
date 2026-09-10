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
      {/* pt-24 md:pt-32 lg:pt-48 (was a flat pt-40, unprefixed — 160px
         of top padding on every mobile screen regardless of width,
         confirmed real via audit: this codebase's own homepage already
         steps its section padding up progressively (py-16 md:py-24
         lg:py-32, see page.tsx), this page's hero just hadn't been
         brought in line with that same pattern). */}
      <div className="mx-auto max-w-3xl px-6 pt-24 pb-16 text-center md:pt-32 lg:px-10 lg:pt-48">
        <Reveal y={20}>
          <p className="eyebrow">Inside The App</p>
          <h1 className="mt-4 text-balance font-serif font-normal uppercase tracking-normal text-4xl leading-tight text-navy lg:text-5xl">
            This Is Where It Actually Happens
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-mist">
            Every reading turns into something you can act on. The app reads
            your data, runs the right reset, and shows you it worked.
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
        heading="Your Day At A Glance"
        imageSide="right"
        background="navy-soft"
        body={
          <>
            <p className="text-pretty">
              Open the app and see exactly where you stand, before the day
              gets ahead of you.
            </p>
            <p className="mt-4 text-pretty text-base italic text-cream/50">
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
        heading="Find What Fits"
        imageSide="left"
        background="cream"
        body={
          <>
            <p className="text-pretty">
              The NeuroLibrary brings together toolkits and drills designed
              for different moments, so you can quickly find an intervention
              that fits what you need.
            </p>
            <p className="mt-4 text-pretty text-base italic text-mist/80">
              The right tool, right when you need it.
            </p>
          </>
        }
        media={
          // grid-cols-1 md:grid-cols-2 — this panel is FeatureSplitSection's
          // own fixed aspect-square/overflow-hidden media box, sitting
          // inside a pinned h-[100svh] section: below `lg` that box's
          // actual pixel size is genuinely small (a mobile viewport's own
          // width, minus this section's own px-6), so a single column of
          // 6 tiles needs real vertical room that 3 rows of 2 didn't —
          // p-4/gap-2/py-3 (down from p-8/gap-3/py-4) below `md` is what
          // actually keeps all 6 tiles inside that fixed box without the
          // last one or two clipping against its own overflow-hidden,
          // confirmed live via screenshot at a real mobile width, not
          // assumed from the class change alone.
          <div className="card-glass-light grid size-full grid-cols-1 gap-2 p-4 md:grid-cols-2 md:gap-3 md:p-8">
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
                // Premium tile popout — a real, confirmed fidelity gap
                // this fixes: the tiles previously had no hover
                // treatment at all, reading as flat/static rather than
                // interactive. bg-white (was bg-white/60) — a
                // translucent tile lifting with its own cast shadow
                // read inconsistently against the glass panel behind
                // it; solid white is what actually makes the lift +
                // shadow read as one tile floating above another,
                // rather than two overlapping translucent layers.
                className="flex items-center justify-center rounded-xl border border-navy/10 bg-white px-3 py-3 text-center text-xs font-medium text-navy/70 uppercase tracking-[-0.04em] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-black/10 hover:shadow-xl hover:shadow-black/5 md:py-4"
              >
                {category}
              </div>
            ))}
          </div>
        }
      />

      {/* 4. Boardroom Mode — the one flagship, full-navy section, same as
         the original pass: the copy itself calls this out as the feature
         people come back to. Heading option A ("Composure On Demand")
         over B ("On Call Before It Counts"). The client's final copy
         drops "Boardroom Mode" as the H2 in favor of that punchier
         option, but doesn't say to drop the name entirely — moved to
         the eyebrow (was "The Standout Feature") so the actual feature
         name stays visible rather than disappearing outright. */}
      <FeatureSplitSection
        eyebrow="Boardroom Mode"
        heading="Composure On Demand"
        imageSide="right"
        background="navy"
        body={
          <>
            <p className="text-pretty">
              A short priming protocol for a defining moment, a negotiation,
              a board vote, a decision you cannot afford to walk into
              unfocused.
            </p>
            <p className="mt-4 text-pretty text-base italic text-cream/50">
              The feature for high-stakes moments.
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
      {/* py-16 md:py-24 lg:py-32 (was a flat py-24) — same progressive
         step every other section on this page now uses. */}
      <div className="mx-auto grid max-w-5xl items-center gap-12 px-6 py-16 md:py-24 lg:grid-cols-2 lg:px-10 lg:py-32">
        <Reveal y={20} className="text-center lg:text-left">
          <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight text-navy lg:text-4xl">
            A Minute To Check In
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-mist lg:mx-0">
            A quick daily check-in lets you record how you&rsquo;re feeling
            alongside what your band is measuring, giving you both sides of
            the picture.
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
            <p className="text-pretty">
              See how your stress patterns and responses change over weeks
              and months, not just from one day to the next.
            </p>
            <p className="mt-4 text-pretty text-base italic text-cream/50">
              A clearer view of your progress.
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
        heading="Syncs With Your Other Apps"
        imageSide="right"
        background="cream"
        body={
          <>
            <p className="text-pretty">
              Connect NeuroAtlas with the health apps you already use to
              bring more of your health data into one place.
            </p>
            <p className="mt-4 text-pretty text-base italic text-mist/80">
              More context, without replacing what you rely on.
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
        className="mx-auto max-w-3xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32"
        y={20}
      >
        <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight text-navy lg:text-4xl">
          NeuroAtlas Available Now
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-mist">
          NeuroAtlas is available on iOS and Android.
        </p>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base italic text-mist/80">
          The NA·01 band is required to access the full NeuroAtlas
          experience.
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
