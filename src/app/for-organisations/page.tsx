import { Hero } from "@/components/Hero";
import { HeroBoundary } from "@/components/HeroBoundary";
import { Reveal } from "@/components/Reveal";
import { CountUp } from "@/components/CountUp";
import { DataPrivacyToggle } from "@/components/DataPrivacyToggle";
import { LeadershipDashboardSection } from "@/components/LeadershipDashboardSection";
import { IlluminatedTimeline } from "@/components/IlluminatedTimeline";
import { DownloadOverviewForm } from "@/components/DownloadOverviewForm";
import { ShimmerLink } from "@/components/ui/shimmer-button";

export const metadata = { title: "For organisations — NeuroAtlas" };

// Copy: client's final pass over the /for-organisations content doc.
// Section numbering below matches the doc's own 1–9 numbering.

// Widely cited workplace-research averages, not a claim about any one
// organisation's own numbers (see the caption rendered under them below)
// — the same "real content, honestly framed" standard this codebase
// already holds itself to elsewhere (e.g. EditorialIndexSection's own
// placeholder research cards).
const BURNOUT_STATS = [
  { value: 33, suffix: "%", label: "Average cost to replace one employee, as a share of salary" },
  { value: 7.8, decimals: 1, label: "Days lost per employee, per year, to sickness absence" },
  { value: 50, suffix: "%", label: "Of employees report feeling burned out at work" },
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

      {/* 2. The cost of burnout — Count-Up Kinetics on the three stat
          cards below, each animating from 0 once it scrolls into view
          (see CountUp.tsx). */}
      <section className="dark-glow bg-navy-soft text-cream">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32">
          <Reveal y={20}>
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
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

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BURNOUT_STATS.map((stat, i) => (
              <Reveal
                key={stat.label}
                delay={i * 0.1}
                className="card-glass rounded-2xl bg-transparent p-8"
              >
                <CountUp
                  value={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                  className="font-serif text-4xl font-normal uppercase tracking-normal text-gold"
                />
                <p className="mt-3 text-pretty text-sm text-cream/70">{stat.label}</p>
              </Reveal>
            ))}
          </div>
          <p className="mt-6 text-pretty text-xs text-cream/40">
            Figures reflect widely cited workplace research, not a specific
            claim about your organisation.
          </p>
        </div>
      </section>

      {/* 3. Data privacy, explained first — the client's own final copy
          leads with this rather than saving it for a dedicated privacy
          page, so it's addressed head-on before the dashboard/pilot
          content that follows. The individual/organisation split is now
          demonstrated directly via a tactile toggle (see
          DataPrivacyToggle.tsx) rather than described in a static bullet
          list. */}
      <section>
        <div className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32">
          <Reveal y={20}>
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight text-navy lg:text-4xl">
              Your Data Stays Yours
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-mist">
              Individuals own their personal NeuroAtlas data. Organizations
              only see anonymous, group-level trends and never an
              individual&rsquo;s results.
            </p>
          </Reveal>
          <DataPrivacyToggle />
          <Reveal delay={0.15} className="mt-10">
            <p className="text-pretty text-base font-medium text-navy/80">
              This boundary is built into the platform architecture, not
              added as a policy or optional setting.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 4. The leadership dashboard — a pinned, scroll-jacked preview
          with staggered floating annotations (see
          LeadershipDashboardSection.tsx), replacing what used to be a
          static split-panel bullet list. */}
      <LeadershipDashboardSection />

      {/* 5. How a pilot works — a vertical illuminated timeline (see
          IlluminatedTimeline.tsx): a glowing track fills as the reader
          scrolls, each of the four steps lifting into full opacity as
          the fill reaches it. */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-24 lg:px-10 lg:py-32">
          <Reveal y={20} className="text-center">
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight text-navy lg:text-4xl">
              How To Get Started
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-lg text-mist">
              A NeuroAtlas pilot gives your organization a structured way to
              introduce the platform, measure the experience, and review the
              results.
            </p>
          </Reveal>
          <div className="mt-16">
            <IlluminatedTimeline />
          </div>
        </div>
      </section>

      {/* 6. The business case */}
      <section className="dark-glow bg-navy-soft text-cream">
        <Reveal
          className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32"
          y={20}
        >
          <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
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
          <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight text-navy lg:text-4xl">
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
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
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
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
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
            <h3 className="text-balance font-serif font-normal uppercase tracking-normal text-xl leading-tight text-cream/90 lg:text-2xl">
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
