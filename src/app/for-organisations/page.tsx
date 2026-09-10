import { Hero } from "@/components/Hero";
import { HeroBoundary } from "@/components/HeroBoundary";
import { Reveal } from "@/components/Reveal";
import { FeatureSplitSection } from "@/components/FeatureSplitSection";
import { LabeledColumnsSection } from "@/components/LabeledColumnsSection";
import { DownloadOverviewForm } from "@/components/DownloadOverviewForm";
import { ShimmerLink } from "@/components/ui/shimmer-button";

export const metadata = { title: "For organisations — NeuroAtlas" };

// Copy: client's final pass over the /for-organisations content doc.
// Section numbering below matches the doc's own 1–9 numbering.

const PILOT_STEPS = [
  {
    label: "Scope",
    body: "Agree the team, the size, and the timeline together.",
  },
  {
    label: "Measure",
    body: "The group uses NeuroAtlas through the pilot period, with a baseline reading at the start.",
  },
  {
    label: "Review",
    body: "An outcome report shows the shift, and where to take it next.",
  },
];

const SECURITY_ITEMS = [
  "Encryption standards",
  "UK GDPR alignment",
  "Data residency",
  "What happens to your data on contract exit",
];

export default function ForOrganisationsPage() {
  return (
    <main>
      {/* 1. Hero — shared cinematic banner, single CTA (this doc gives
          one primary action here; the page's own closing section further
          down carries the secondary "explore for yourself" path, so it
          isn't duplicated here too). Routed to /contact — there's no
          dedicated booking flow/calendar in this codebase yet, and
          /contact is the existing catch-all for a human-routed enquiry
          like this one. */}
      <Hero
        eyebrow="For Organisations"
        headline="Composure Training For Your Organisation"
        subhead="Pressure affects decisions long before it shows up as a resignation letter or a sick day. NeuroAtlas gives leadership a way to see that pattern early and act on it."
        ctas={[{ label: "Book A Presentation", href: "/contact" }]}
      />
      <HeroBoundary />

      {/* 2. The cost of burnout */}
      <section className="dark-glow bg-navy-soft text-cream">
        <Reveal
          className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32"
          y={20}
        >
          <h2 className="text-balance font-serif text-3xl leading-tight lg:text-4xl">
            This Is Not Another Wellness Gimmick
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-cream/75">
            Burnout is a business problem. It affects retention,
            decision-making, productivity, and the cost of replacing people.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg font-medium text-cream/90">
            NeuroAtlas turns that risk into something you can see and
            address, before it turns into a resignation.
          </p>
        </Reveal>
      </section>

      {/* 3. Data privacy, explained first — the client's own final copy
          leads with this rather than saving it for a dedicated privacy
          page, so it's addressed head-on before the dashboard/pilot
          content that follows. Shares LabeledColumnsSection with
          /privacy's own boundary section (see that component's own
          comment). */}
      <LabeledColumnsSection
        heading="Your Data Stays Yours"
        body="Individuals own their personal NeuroAtlas data. Organizations only see anonymous, group-level trends and never an individual’s results."
        columns={[
          {
            label: "Individual Sees",
            items: ["Personal data", "Personal insights", "Personal results"],
          },
          {
            label: "Organization Sees",
            items: [
              "Anonymous group trends",
              "Organization-level patterns",
              "Aggregate results",
            ],
          },
        ]}
        closingLine="This boundary is built into the platform architecture, not added as a policy or optional setting."
        background="cream"
      />

      {/* 4. The leadership dashboard — media is a simple annotated
          mockup of the four reported metrics, not a placeholder icon;
          same "real content over a generic box" approach as
          /how-it-works' own HRV stat card. */}
      <FeatureSplitSection
        heading="What Your Dashboard Shows"
        body="Leadership gets a clear read on how pressure is moving through the organisation."
        imageSide="right"
        background="navy-soft"
        media={
          <div className="card-glass flex size-full flex-col justify-center gap-4 bg-transparent px-8 py-6">
            <p className="eyebrow">The Dashboard Reports</p>
            <ul className="space-y-3 text-pretty text-sm text-cream/80">
              {[
                "Composure trends across the group over time.",
                "Where pressure is building, by team.",
                "Platform engagement at a group level.",
                "Movement since the last review period.",
              ].map((item) => (
                <li key={item} className="flex gap-2">
                  <span
                    aria-hidden="true"
                    className="mt-2 size-1 shrink-0 rounded-full bg-gold/70"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        }
      />

      {/* 5. How a pilot works */}
      <section>
        <div className="mx-auto max-w-6xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32">
          <Reveal y={20}>
            <h2 className="text-balance font-serif text-3xl leading-tight text-navy lg:text-4xl">
              How To Get Started
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-mist">
              A NeuroAtlas pilot gives your organization a structured way to
              introduce the platform, measure the experience, and review the
              results.
            </p>
          </Reveal>
          <div className="mt-16 grid gap-12 sm:grid-cols-3">
            {PILOT_STEPS.map((step, i) => (
              <Reveal
                key={step.label}
                delay={i * 0.1}
                className="text-center sm:text-left"
              >
                <span className="eyebrow">{`0${i + 1}`}</span>
                <h3 className="mt-3 text-balance font-serif text-xl text-navy">
                  {step.label}
                </h3>
                <p className="mt-3 text-pretty text-base text-mist">
                  {step.body}
                </p>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3} className="mt-14">
            <p className="mx-auto max-w-xl text-pretty text-base text-mist">
              Your team gets a guided rollout, manager resources, and a
              dedicated point of contact throughout.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 6. The business case */}
      <section className="dark-glow bg-navy-soft text-cream">
        <Reveal
          className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32"
          y={20}
        >
          <h2 className="text-balance font-serif text-3xl leading-tight lg:text-4xl">
            What Inaction Actually Costs You
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-cream/75">
            You already measure revenue, retention, productivity, and
            performance. Stress can affect all of them, but most
            organizations have no way to see it clearly.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-cream/75">
            NeuroAtlas gives leadership measurable insight into how pressure
            is affecting the organization, helping teams move from reacting
            to burnout to managing stress earlier.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-lg font-medium text-cream/90">
            NeuroAtlas helps you see the cost before it becomes the
            consequence.
          </p>
        </Reveal>
      </section>

      {/* 7. Security, compliance and data ownership */}
      <section>
        <Reveal
          className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32"
          y={20}
        >
          <h2 className="text-balance font-serif text-3xl leading-tight text-navy lg:text-4xl">
            Security And Compliance
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-mist">
            The questions your team will ask before signing are the ones we
            have already answered.
          </p>
          <ul className="mx-auto mt-8 flex max-w-xl flex-wrap justify-center gap-x-8 gap-y-3 text-pretty text-base text-navy/80">
            {SECURITY_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="size-1 shrink-0 rounded-full bg-gold-deep"
                />
                {item}
              </li>
            ))}
          </ul>
          <ShimmerLink
            href="#download-overview"
            background="color-mix(in oklab, var(--color-navy) 25%, transparent)"
            shimmerColor="var(--color-gold-deep)"
            className="mt-10 text-sm tracking-wide text-navy"
          >
            Download Overview
          </ShimmerLink>
        </Reveal>
      </section>

      {/* 8. Downloadable overview */}
      <section id="download-overview" className="dark-glow bg-navy-soft text-cream">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32">
          <Reveal y={20}>
            <h2 className="text-balance font-serif text-3xl leading-tight lg:text-4xl">
              Download The Overview
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-cream/75">
              A one-page summary built for sharing internally, with the
              detail your team will actually ask for.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="mt-10">
            <DownloadOverviewForm />
          </Reveal>
        </div>
      </section>

      {/* 9. Closing call to action — two stacked CTAs rather than
          ClosingCurtainSection's curtain-reveal mechanic (that component
          is purpose-built for /band's own scroll choreography, not a
          general-purpose "two closing options" layout). */}
      <section className="dark-glow bg-navy text-cream">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-28">
          <Reveal y={20}>
            <h2 className="text-balance font-serif text-3xl leading-tight lg:text-4xl">
              Ready To See It For Your Team?
            </h2>
            <ShimmerLink
              href="/contact"
              background="color-mix(in oklab, var(--color-cream) 30%, transparent)"
              shimmerColor="var(--color-cream)"
              className="mt-8 text-sm tracking-wide text-cream"
            >
              Book A Presentation
            </ShimmerLink>
          </Reveal>

          <Reveal
            delay={0.15}
            className="mt-16 border-t border-cream/10 pt-12"
          >
            <h3 className="text-balance font-serif text-xl leading-tight text-cream/90 lg:text-2xl">
              Exploring This For Yourself?
            </h3>
            <ShimmerLink
              href="/request-access"
              background="color-mix(in oklab, var(--color-cream) 15%, transparent)"
              shimmerColor="var(--color-gold)"
              className="mt-6 text-sm tracking-wide text-cream"
            >
              Request Access
            </ShimmerLink>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
