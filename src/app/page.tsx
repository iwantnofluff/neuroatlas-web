import Image from "next/image";
import { Hero } from "@/components/Hero";
import { ShimmerLink } from "@/components/ui/shimmer-button";
import { HeroBoundary } from "@/components/HeroBoundary";
import { Reveal } from "@/components/Reveal";
import { Parallax } from "@/components/Parallax";
import { TextLink } from "@/components/TextLink";
import { MethodScrollCards } from "@/components/MethodScrollCards";
import { BeyondHeartSection } from "@/components/BeyondHeartSection";
import { BuiltToReadYouSection } from "@/components/BuiltToReadYouSection";
import { cn } from "@/lib/utils";

// Copy: V2 throughout (punchier, Title Case headings/buttons) — the
// client's latest full pass over the homepage content doc.

// Four scattered, differently sized/rotated tiles rather than a tidy grid
// — see the "Inside the app" section below, and the client's own "Float
// Boxes" sketch.
const floatTiles = [
  { className: "top-0 left-0 h-[42%] w-[46%] -rotate-6" },
  { className: "top-[6%] right-0 h-[52%] w-[42%] rotate-3" },
  { className: "bottom-0 left-[12%] h-[38%] w-[36%] rotate-6" },
  { className: "right-[4%] bottom-[4%] h-[34%] w-[40%] -rotate-3" },
];

const trustPoints = [
  "Nothing leaves your account without your permission.",
  "Enterprise dashboards show only aggregate trends, never individual results.",
  "Aligned with UK GDPR from day one.",
];

export default function Home() {
  return (
    <main>
      <Hero />
      <HeroBoundary />

      {/* The problem — heading AND body copy both sit together in the left
          column, image alone in the right (per the client's own framing:
          "our entire body text and title was to be in the left column and
          the image in the right column"). Sized to exactly one viewport
          (matching Hero's own min-h-[100svh] convention) so the scroll
          from Hero into this section lands edge-to-edge. */}
      <section
        id="the-problem"
        className="flex min-h-[100svh] flex-col justify-center px-6 py-16 lg:px-10 lg:py-20"
      >
        <div className="mx-auto w-full max-w-6xl">
          {/* No items-* override on the grid — default stretch makes both
              columns match the taller (image) column's height; the left
              Reveal then centers its content within that full height
              instead of leaving it pinned to the top with space below. */}
          <div className="grid gap-14 lg:grid-cols-2">
            <Reveal
              y={20}
              className="lg:flex lg:h-full lg:flex-col lg:justify-center"
            >
              <h2 className="font-serif text-5xl leading-[1.05] text-navy sm:text-6xl lg:text-7xl xl:text-8xl">
                Your Body Knows You&rsquo;re Stressed.{" "}
                <span className="whitespace-nowrap">Do You?</span>
              </h2>
              <p className="mt-6 max-w-xl text-lg text-mist">
                Stress has become so normal that most people stop noticing
                their own body&rsquo;s warning signs, until it&rsquo;s
                already shaped a decision, a meeting, or a moment.
              </p>
            </Reveal>
            <Reveal delay={0.1} y={20} className="lg:h-full">
              <Parallax
                offset={24}
                className="relative aspect-square overflow-hidden rounded-3xl bg-navy lg:aspect-auto lg:h-full"
              >
                <Image
                  src="/photos/band-bw-wrist.jpg"
                  alt="The NA·01 band worn on the wrist"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </Parallax>
            </Reveal>
          </div>
        </div>
      </section>

      {/* The method — pinned scroll reveal (see MethodScrollCards.tsx):
          card 1 appears on the first scroll into the section, card 2 on
          the next, card 3 on the one after that, then the pin releases. */}
      <MethodScrollCards />

      {/* The NA·01 band — cinematic sticky-scroll WebGL section (see
          BuiltToReadYouSection.tsx), replacing the previous plain
          two-column image+text block. Same copy, same /band
          destination. */}
      <BuiltToReadYouSection />

      {/* Inside the app */}
      <section id="app-teaser" className="dark-glow bg-navy-soft text-cream">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24 lg:px-10 lg:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            {/* Four tiles floating loose in the column — no framing box
                around them any more (per the client's sketch: "Float
                Boxes"). Same treatment as MethodScrollCards' three cards:
                .card-glass's own edge (border + inset-highlight glow)
                with bg-transparent overriding its tinted fill, rather
                than a filled panel — these are meant to read as loose
                floating outlines, not solid tiles. Scattered at slightly
                different sizes/positions/rotations rather than a tidy
                grid, which is what actually reads as "floating". */}
            <Parallax offset={24} className="relative aspect-square w-full max-w-md justify-self-center">
              {floatTiles.map((tile, i) => (
                <Reveal
                  key={i}
                  delay={i * 0.1}
                  y={16}
                  className={cn(
                    "card-glass absolute bg-transparent transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:bg-gold/10",
                    tile.className
                  )}
                />
              ))}
            </Parallax>
            {/* Copy: the block itself centers within the column, but the
                text inside it stays left-aligned rather than each line
                centering on its own. `justify-self-center`, not `mx-auto`
                — a grid item's auto margins resolve against its
                *stretched* track width, and max-width shrinking it after
                that doesn't retroactively redistribute into the margins,
                so mx-auto silently does nothing here. justify-self is the
                grid-native way to center an item narrower than its track. */}
            <Reveal delay={0.1} y={20} className="max-w-md justify-self-center text-left">
              <p className="eyebrow">Inside the app</p>
              <h2 className="mt-4 font-serif text-3xl leading-tight lg:text-4xl">
                See It. Act On It.
              </h2>
              <p className="mt-6 text-lg text-cream/75">
                The app turns what the band reads into something you can
                use: a quick daily read of where you stand, short resets
                when it&rsquo;s needed, and a way to prepare before moments
                that matter. Every session shows you it worked.
              </p>
              <TextLink href="/inside-the-app" tone="dark">Learn More</TextLink>
            </Reveal>
          </div>
        </div>
      </section>

      {/* The three toolkit families — a compact bento grid (see
          BeyondHeartSection.tsx): one full-width hero cell (heading,
          subtitle, a rippling gold wave) plus three glass metric cards
          beneath it, each fading up once on scroll into view. */}
      {/* Privacy and data — moved ahead of "Beyond Heart Rate" (per the
          client's own reordering) and switched to the site's plain light
          (cream) background rather than navy, so it now reads the same as
          "the-band"/"founder" (no explicit bg class needed — the body's
          own bg-cream already shows through). Text colors follow that
          same light-section convention: text-navy for headings, text-mist
          for body copy, rather than the text-cream/cream-75 pairing a
          dark section uses. */}
      <section id="privacy">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-24 text-center lg:px-10 lg:py-32">
          <Reveal y={20}>
            <h2 className="font-serif text-3xl leading-tight text-navy lg:text-4xl">
              We Believe In Privacy
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-mist">
              We believe your data belongs to you, so we built NeuroAtlas
              that way.
            </p>
            {/* Split out as its own line (matching /inside-the-app's own
                italic follow-up-line convention) rather than folded into
                the paragraph above, where it was wrapping mid-sentence
                ("Your data" / "is yours…") instead of reading as one
                line. */}
            <p className="mx-auto mt-4 max-w-xl text-base italic text-mist/80">
              Your data is yours. Never shared without your permission.
            </p>
          </Reveal>
          <ul className="mx-auto mt-12 grid max-w-3xl gap-4 text-left sm:grid-cols-3">
            {trustPoints.map((point, i) => (
              <Reveal
                key={point}
                as="li"
                delay={i * 0.1}
                className="card-glass-light px-5 py-6 text-sm text-ink/85 transition-colors duration-300 hover:border-gold-deep/50"
              >
                {point}
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <BeyondHeartSection />

      {/* How it's different — image left, content right. No order-*
          overrides needed: DOM order is already [image, text], which is
          also the mobile convention every other image+text section on
          this page follows (image first, text after), so it doubles as
          the desktop order too here. */}
      <section id="how-different" className="dark-glow bg-navy-soft text-cream">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24 lg:px-10 lg:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <Reveal y={20}>
              <Parallax
                offset={24}
                className="relative aspect-square overflow-hidden rounded-3xl bg-navy"
              >
                <Image
                  src="/photos/band-ice-splash.jpg"
                  alt="The NA·01 band splashing into water"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </Parallax>
            </Reveal>
            <Reveal delay={0.1} y={20} className="text-center lg:text-left">
              <h2 className="font-serif text-3xl leading-tight lg:text-4xl">
                Other Apps Notice. We Fix It, In Two Minutes.
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-cream/75 lg:mx-0">
                Other wearables tell you your heart rate is up or your sleep
                was disturbed, and stop there. NeuroAtlas gives you something
                to do about it, and proves it worked, in two minutes.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Founder and current status — the reverse of the section above:
          content left, image right on desktop. DOM order stays [text,
          image] (so mobile still shows the image first, matching the
          same convention), with the same order-2/lg:order-1 +
          lg:order-2 pairing "the-band" section uses for its own
          image-right layout. */}
      <section id="founder">
        <div className="mx-auto max-w-6xl px-6 py-16 md:py-24 lg:px-10 lg:py-32">
          <div className="grid items-center gap-14 lg:grid-cols-2">
            <Reveal
              y={20}
              className="order-2 text-center lg:order-1 lg:text-left"
            >
              <h2 className="font-serif text-3xl leading-tight text-navy lg:text-4xl">
                Why NeuroAtlas Exists
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg text-mist lg:mx-0">
                Vanshika Dhoot founded NeuroAtlas after watching high
                performers break under pressure with no real way to manage
                it. NeuroAtlas is now live in pilot with corporate teams
                across London.
              </p>
            </Reveal>
            <Reveal delay={0.1} y={20} className="lg:order-2">
              <Parallax
                offset={24}
                className="relative aspect-square overflow-hidden rounded-3xl bg-navy"
              >
                <Image
                  src="/photos/band-ice-still.jpg"
                  alt="The NA·01 band, weatherproof against ice and stone"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </Parallax>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section id="closing-cta" className="dark-glow bg-navy-soft text-cream">
        <Reveal
          className="mx-auto max-w-3xl px-6 py-16 md:py-24 text-center lg:px-10 lg:py-28"
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
