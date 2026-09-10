import Link from "next/link";
import { Hero } from "@/components/Hero";
import { HeroBoundary } from "@/components/HeroBoundary";
import { Reveal } from "@/components/Reveal";
import { PrivacyBoundarySplit } from "@/components/PrivacyBoundarySplit";
import { TextLink } from "@/components/TextLink";

export const metadata = { title: "Privacy and your data — NeuroAtlas" };

// Copy: client's final pass over the /privacy content doc. Section
// numbering below matches the doc's own 1–6 numbering.
//
// Section 2's heading picks option B, "Nothing Hidden, Nothing Assumed",
// over option A, "Here Is Exactly What Happens To Your Data" — this
// site's other headings are consistently short and declarative ("The
// Line We Do Not Cross", "What You Control", "What We Won't Promise"),
// and B matches that register directly where A reads more like a section
// label. It also echoes the intro line's own "tell you plainly... not
// trust us blindly" contrast more directly than A's flatter phrasing.
//
// Fluid H2 scale (text-3xl sm:text-4xl md:text-5xl) — an explicit,
// twice-given spec for this specific "reassuring promise, not a
// whitepaper" page, not just boilerplate: unlike the sitewide default
// (text-3xl lg:text-4xl, unchanged everywhere else) this page's own
// headings step up through sm/md deliberately, reading as a touch more
// confident/editorial than the denser policy pages around it.
const H2 =
  "text-balance font-serif font-normal uppercase tracking-normal text-3xl sm:text-4xl md:text-5xl leading-tight";

const COLLECTED_STORED_SHARED = [
  {
    label: "What We Collect",
    items: [
      "Heart rate variability, breathing, and stress load readings.",
      "Session activity and app usage.",
      "Optional daily check-ins, private by default.",
    ],
  },
  {
    label: "What We Store",
    items: ["Your readings and progress history, tied to your account only."],
  },
  {
    label: "What We Never Share",
    items: [
      "Individual results with an employer.",
      "Raw data with third parties.",
      "Anything without your permission.",
    ],
  },
];

const SAFEGUARDS = [
  "Your data is encrypted in transit and at rest.",
  "It is kept for as long as your account is active.",
  "You can delete it at any time.",
];

const RIGHTS = [
  "Access your personal data.",
  "Request a copy of your data.",
  "Request deletion of your data, where applicable.",
  "Manage your consent where consent is the legal basis for processing.",
];

export default function PrivacyPage() {
  return (
    <main>
      {/* 1. Hero — no CTAs given in the doc for this page (it's a trust/
          policy read, not a conversion page), matching /how-it-works'
          own ctas={[]} pattern. Hero's own entrance is already the
          "subtle fade-up on load" this brief asks for (see Hero.tsx's
          own word-stagger reveal) — no separate animation needed here. */}
      <Hero
        eyebrow="Privacy And Your Data"
        headline="Your Data Stays Yours"
        subhead="This is not small print you have to go looking for. Protecting your data is built into how NeuroAtlas works, not something we promise to remember."
        ctas={[]}
      />
      <HeroBoundary />

      {/* 2. What is collected, stored and never shared — a crisp 3-card
          grid with the same tactile hover lift used for the tile grid on
          /inside-the-app (hover:-translate-y-1.5 hover:shadow-xl).
          grid-cols-1 sm:max-w-xl sm:mx-auto md:grid-cols-3 — the same
          "stay single-column through the whole foldable tier, split
          only at true tablet width" shape this codebase already
          establishes for a 3-item grid (see page.tsx's own trust-points
          list) — sm:max-w-xl mx-auto keeps the still-single column
          comfortably centered rather than stretched full-bleed at a
          640px foldable width, rather than forcing an uneven 2-up grid
          with a orphaned third card. */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32">
          <Reveal y={20}>
            <h2 className={`${H2} text-navy`}>Nothing Hidden, Nothing Assumed</h2>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-mist">
              We would rather tell you plainly than ask you to trust us
              blindly.
            </p>
          </Reveal>
          <ul className="mx-auto mt-12 grid max-w-3xl gap-4 sm:max-w-xl sm:mx-auto md:max-w-3xl md:grid-cols-3 md:gap-6">
            {COLLECTED_STORED_SHARED.map((column, i) => (
              <Reveal
                key={column.label}
                as="li"
                delay={i * 0.1}
                className="card-glass-light rounded-2xl p-6 text-left transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-black/5"
              >
                <p className="eyebrow">{column.label}</p>
                <ul className="mt-4 space-y-2 text-pretty text-base text-navy/80">
                  {column.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span
                        aria-hidden="true"
                        className="mt-2.5 size-1 shrink-0 rounded-full bg-gold-deep"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.2} className="mt-10">
            <p className="text-pretty text-base font-medium text-navy/80">
              Nothing is sold. Nothing is passed on without your say-so.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 3. The individual and employer boundary — a permanent 50/50
          split (see PrivacyBoundarySplit.tsx) contrasting a personal app
          view against an anonymous group heatmap, the same visual logic
          as /for-organisations' own individual/organisation toggle. */}
      <section className="dark-glow bg-navy-soft text-cream">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32">
          <Reveal y={20}>
            <h2 className={H2}>The Line We Do Not Cross</h2>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-cream/75">
              If you use NeuroAtlas through your organisation, your
              individual results stay yours. Your employer sees only
              anonymous, group-level trends, never your name attached to a
              number.
            </p>
          </Reveal>
          <PrivacyBoundarySplit />
          <Reveal delay={0.2} className="mt-10">
            <p className="text-pretty text-base font-medium text-cream/90">
              No employer can see one person&rsquo;s results. Not now, not
              ever.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 4. Encryption, retention and deletion — each safeguard now fades
          in on its own staggered beat as the list scrolls into view
          (Reveal as="li", delay={i * 0.1}), rather than the whole block
          appearing at once, so the technical detail reads as digestible
          rather than a dense dump. */}
      <section>
        <div className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32">
          <Reveal y={20}>
            <h2 className={`${H2} text-navy`}>How Your Data Is Protected</h2>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-mist">
              The technical part, in language that does not require a
              lawyer.
            </p>
          </Reveal>
          <ul className="mx-auto mt-8 max-w-md space-y-3 text-left">
            {SAFEGUARDS.map((item, i) => (
              <Reveal
                key={item}
                as="li"
                delay={i * 0.1}
                className="flex gap-2 text-pretty text-base text-navy/80"
              >
                <span
                  aria-hidden="true"
                  className="mt-2.5 size-1 shrink-0 rounded-full bg-gold-deep"
                />
                {item}
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. Your data rights — same per-item stagger as section 4. */}
      <section className="dark-glow bg-navy-soft text-cream">
        <div className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32">
          <Reveal y={20}>
            <h2 className={H2}>What You Control</h2>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-cream/75">
              You have rights over your personal data, including the
              ability to:
            </p>
          </Reveal>
          <ul className="mx-auto mt-8 max-w-md space-y-3 text-left">
            {RIGHTS.map((item, i) => (
              <Reveal
                key={item}
                as="li"
                delay={i * 0.1}
                className="flex gap-2 text-pretty text-base text-cream/80"
              >
                <span
                  aria-hidden="true"
                  className="mt-2.5 size-1 shrink-0 rounded-full bg-gold/70"
                />
                {item}
              </Reveal>
            ))}
          </ul>
          <Reveal delay={0.15} className="mx-auto mt-8 max-w-xl">
            <p className="text-pretty text-base text-cream/75">
              To make a request or ask a question about your data, contact
              us through the details provided in our{" "}
              <Link
                href="/legal/privacy-policy"
                className="underline decoration-gold decoration-2 underline-offset-4"
              >
                Privacy Policy
              </Link>
              . We will explain the process and any applicable
              requirements.
            </p>
          </Reveal>
        </div>
      </section>

      {/* 6. Quiet close — a clean, centered CTA linking out to the full
          legal policy and /for-organisations, no button chrome. */}
      <section>
        <Reveal
          className="mx-auto max-w-xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-28"
          y={20}
        >
          <h2 className={`${H2} text-navy`}>Still Have Questions?</h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-mist">
            This page covers the principles. The full legal detail lives in
            our privacy policy, if you want to go further.
          </p>
          <div className="mt-2 flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-8">
            <TextLink href="/legal/privacy-policy">Read The Privacy Policy</TextLink>
            <TextLink href="/for-organisations">
              For Organisations: See How Team Data Works
            </TextLink>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
