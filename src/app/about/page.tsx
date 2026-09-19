import { PlayCircle } from "lucide-react";
import { Hero } from "@/components/Hero";
import { HeroBoundary } from "@/components/HeroBoundary";
import { Reveal } from "@/components/Reveal";
import { Parallax } from "@/components/Parallax";
import { FounderStorySection } from "@/components/FounderStorySection";
import { LivePulseDot } from "@/components/LivePulseDot";
import { ShimmerLink } from "@/components/ui/shimmer-button";

export const metadata = { title: "About us - NeuroAtlas" };

// Copy: client's final pass over the /about content doc. Section
// numbering in the comments below matches the doc's own 1–8 numbering
// (the doc itself skips 7). "Vision & Mission" (doc section 4) and "The
// Approach" (doc section 5) are now two separate sections rather than
// one shared bento grid, per Phase 4's explicit layout spec.

const STATUS_ITEMS = [
  { label: "London", detail: "Headquartered" },
  { label: "India Pilot", detail: "Running now", live: true },
  { label: "2026", detail: "Public launch" },
];

export default function AboutPage() {
  return (
    <main>
      {/* 1. Hero - Hero.tsx's own per-word fade-up is already the "slow,
          cinematic fade-in" this brief asks for (see that component's
          own doc comment); no page-specific override needed. */}
      <Hero
        eyebrow="About NeuroAtlas"
        headline="Built To Manage Stress, Not Just Track It"
        subhead="NeuroAtlas exists because the people carrying the highest stakes were never given a real tool for the pressure that comes with it."
        ctas={[]}
      />
      <HeroBoundary />

      {/* 2. The founder's story - see FounderStorySection.tsx for the
          50/50 asymmetrical split and its own portrait-placeholder
          note. */}
      <FounderStorySection />

      {/* 3. The core belief - the section's own heading IS the massive,
          cinematic pull-quote (a confident one-line thesis reads better
          blown up large than the shorter "Statement" copy would), with
          the statement as smaller supporting copy underneath and
          generous vertical breathing room (min-h) either side. */}
      <section className="dark-glow bg-navy text-cream">
        <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center px-6 py-24 text-center lg:px-10">
          <Reveal y={20}>
            <p className="eyebrow">The Core Belief</p>
            <h2 className="mt-6 text-balance font-serif font-normal uppercase tracking-normal text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1]">
              What Stress Actually Costs You Over Time
            </h2>
            <p className="mx-auto mt-8 max-w-xl text-pretty text-lg text-cream/70">
              Stress doesn&rsquo;t just affect how you feel in the moment,
              it wears on you over time, regardless of talent, effort, or
              experience. NeuroAtlas exists to help people understand and
              manage that response, before it adds up.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 4. Vision & Mission - a clean two-column split, each half
          fading in on its own beat. */}
      <section className="bg-cream">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32">
          <Reveal y={20}>
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl sm:text-4xl md:text-5xl leading-tight text-navy">
              What We Are Building Toward
            </h2>
          </Reveal>
          <div className="mx-auto mt-12 grid gap-10 text-left md:grid-cols-2 md:gap-14">
            <Reveal y={20}>
              <p className="eyebrow">Vision</p>
              <p className="mt-4 text-pretty text-lg text-mist">
                A world where people can better understand and manage
                their stress, so pressure does not have to dictate how
                they think, perform, or respond.
              </p>
            </Reveal>
            <Reveal delay={0.1} y={20}>
              <p className="eyebrow">Mission</p>
              <p className="mt-4 text-pretty text-lg text-mist">
                We use neuroscience and wearable biometrics to help make
                stress measurable, understandable, and easier to manage.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* 5. The Approach - an asymmetrical split matching
          FounderStorySection's own layout and honest-placeholder
          convention: no real product-in-use footage exists in this
          codebase yet, so this holds a labelled aspect-video placeholder
          rather than inventing one. */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24 lg:px-10 lg:py-32">
          <div className="flex flex-col gap-10 md:flex-row md:items-center md:gap-14">
            <Reveal y={20} className="md:w-1/2">
              <p className="eyebrow">The Approach</p>
              <h2 className="mt-4 text-balance font-serif font-normal uppercase tracking-normal text-3xl sm:text-4xl md:text-5xl leading-tight text-navy">
                Technology That Meets The Human Element
              </h2>
              <p className="mt-6 text-pretty text-lg text-mist">
                NeuroAtlas is built on neuroscience and translates that
                understanding into practical ways to help people manage
                stress.
              </p>
              <p className="mt-6 border-l-2 border-gold-deep pl-4 text-pretty text-lg font-medium text-navy/90">
                Measure what is happening. Take action. See what changes.
              </p>
            </Reveal>

            <Parallax offset={20} className="md:w-1/2">
              <Reveal delay={0.1}>
                <div className="relative aspect-video w-full overflow-hidden rounded-3xl card-glass-light">
                  <div className="flex size-full flex-col items-center justify-center gap-3 text-navy/25">
                    <PlayCircle
                      strokeWidth={1}
                      className="size-16"
                      aria-hidden="true"
                    />
                    <span className="text-xs font-medium tracking-[-0.04em] text-navy/40 uppercase">
                      Product in use
                    </span>
                  </div>
                </div>
              </Reveal>
            </Parallax>
          </div>
        </div>
      </section>

      {/* 6. Where we are today, leading straight into 8. the closing CTA
          - kept as one section, matching the brief's own "Status & CTA"
          grouping ("...before leading into the final Request Access
          button"). The India pilot mention carries the pulsing live
          indicator; London and the 2026 launch date sit alongside it as
          a small milestone strip (the brief's own "optional milestone
          or timeline treatment"). */}
      <section className="dark-glow bg-navy-soft text-cream">
        <Reveal
          className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32"
          y={20}
        >
          <p className="eyebrow">Our Pilot Project</p>
          <h2 className="mt-4 text-balance font-serif font-normal uppercase tracking-normal text-3xl sm:text-4xl md:text-5xl leading-tight">
            Where We Are Today
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-cream/75">
            NeuroAtlas is currently running a corporate pilot programme in
            India. The pilot is helping us test and refine the NeuroAtlas
            experience ahead of public launch.
          </p>

          <div className="mx-auto mt-10 flex max-w-xl flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {STATUS_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                {item.live && <LivePulseDot />}
                <span className="text-left">
                  <span className="block text-sm font-medium text-cream/90">{item.label}</span>
                  <span className="block text-xs text-cream/50">{item.detail}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-14 border-t border-cream/10 pt-12">
            <p className="mx-auto max-w-xl text-pretty text-lg text-cream/75">
              We&rsquo;re building this early, and there&rsquo;s room to be
              part of it.
            </p>
            <ShimmerLink
              href="/request-access"
              background="color-mix(in oklab, var(--color-cream) 30%, transparent)"
              shimmerColor="var(--color-cream)"
              className="mt-8 text-sm tracking-wide text-cream"
            >
              Request Access
            </ShimmerLink>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
