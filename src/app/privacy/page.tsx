import Link from "next/link";
import { Hero } from "@/components/Hero";
import { HeroBoundary } from "@/components/HeroBoundary";
import { Reveal } from "@/components/Reveal";
import { LabeledColumnsSection } from "@/components/LabeledColumnsSection";
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
          own ctas={[]} pattern. */}
      <Hero
        eyebrow="Privacy And Your Data"
        headline="Your Data Stays Yours"
        subhead="This is not small print you have to go looking for. Protecting your data is built into how NeuroAtlas works, not something we promise to remember."
        ctas={[]}
      />
      <HeroBoundary />

      {/* 2. What is collected, stored and never shared */}
      <LabeledColumnsSection
        heading="Nothing Hidden, Nothing Assumed"
        body="We would rather tell you plainly than ask you to trust us blindly."
        columns={[
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
        ]}
        closingLine="Nothing is sold. Nothing is passed on without your say-so."
        background="cream"
      />

      {/* 3. The individual and employer boundary. Doc gives "your own
          readings, your own progress, your own history" as one comma
          sentence rather than three list items like every other column
          in this doc — split into three short items here so both sides
          of the comparison read as visually parallel lists, matching
          this component's own established shape. */}
      <LabeledColumnsSection
        heading="The Line We Do Not Cross"
        body="If you use NeuroAtlas through your organisation, your individual results stay yours. Your employer sees only anonymous, group-level trends, never your name attached to a number."
        columns={[
          {
            label: "What You See",
            items: ["Your own readings.", "Your own progress.", "Your own history."],
          },
          {
            label: "What Your Employer Sees",
            items: ["Aggregate trends across the whole team, nothing more."],
          },
        ]}
        closingLine="No employer can see one person’s results. Not now, not ever."
        background="navy-soft"
      />

      {/* 4. Encryption, retention and deletion */}
      <section>
        <Reveal
          className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32"
          y={20}
        >
          <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight text-navy lg:text-4xl">
            How Your Data Is Protected
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-mist">
            The technical part, in language that does not require a lawyer.
          </p>
          <ul className="mx-auto mt-8 max-w-md space-y-3 text-left text-pretty text-base text-navy/80">
            {SAFEGUARDS.map((item) => (
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
      </section>

      {/* 5. Your data rights */}
      <section className="dark-glow bg-navy-soft text-cream">
        <Reveal
          className="mx-auto max-w-2xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-32"
          y={20}
        >
          <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
            What You Control
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-cream/75">
            You have rights over your personal data, including the ability
            to:
          </p>
          <ul className="mx-auto mt-8 max-w-md space-y-3 text-left text-pretty text-base text-cream/80">
            {RIGHTS.map((item) => (
              <li key={item} className="flex gap-2">
                <span
                  aria-hidden="true"
                  className="mt-2.5 size-1 shrink-0 rounded-full bg-gold/70"
                />
                {item}
              </li>
            ))}
          </ul>
          <p className="mx-auto mt-8 max-w-xl text-pretty text-base text-cream/75">
            To make a request or ask a question about your data, contact us
            through the details provided in our{" "}
            <Link href="/legal/privacy-policy" className="underline decoration-gold decoration-2 underline-offset-4">
              Privacy Policy
            </Link>
            . We will explain the process and any applicable requirements.
          </p>
        </Reveal>
      </section>

      {/* 6. Closing note and links */}
      <section>
        <Reveal
          className="mx-auto max-w-xl px-6 py-16 text-center md:py-24 lg:px-10 lg:py-28"
          y={20}
        >
          <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight text-navy lg:text-4xl">
            Still Have Questions?
          </h2>
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
