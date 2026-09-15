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
import { SpotlightPhoto } from "@/components/SpotlightPhoto";
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
              {/* Four explicit lines (Your Body / Knows You're / Stressed.
                 / Do You?), not text-balance's own auto-wrap — the client
                 asked specifically for "Knows You're" to hold as one line
                 rather than splitting into "Knows" / "You're" (5 lines
                 total). whitespace-nowrap per line (not on the whole h2 —
                 that would stop the <br />s themselves from being real
                 line breaks) is what keeps each hand-authored line from
                 ALSO wrapping internally.
                 text-4xl/5xl/6xl/6xl/7xl — the lg: step deliberately
                 repeats md's own 6xl rather than bumping to 7xl right at
                 1024px: that's the exact viewport this section's grid
                 first splits into two real columns (lg:grid-cols-2,
                 below), and at 1024px specifically the resulting text
                 column is only ~444px wide — "Knows You're" at 7xl
                 measures ~476px there, wider than the column itself,
                 confirmed live via measuring the rendered line against
                 the column's own box (it visibly overlapped the image
                 panel). 6xl fits with real margin at that exact width;
                 by xl (1280px) the column has grown enough (~570px+)
                 that 7xl fits safely, confirmed the same way, so that's
                 where the size actually steps up. */}
              <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-4xl leading-[1.05] text-navy sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl">
                <span className="whitespace-nowrap">Your Body</span>
                <br />
                <span className="whitespace-nowrap">Knows You&rsquo;re</span>
                <br />
                <span className="whitespace-nowrap">Stressed.</span>
                <br />
                <span className="whitespace-nowrap">Do You?</span>
              </h2>
              <p className="mt-6 max-w-xl text-pretty text-lg text-mist">
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
                {/* Grayscale at rest; hovering reveals real color inside a
                   circle that follows the cursor — a flashlight passing
                   over the actual product, on this section's own "notice
                   the stress signal" beat. See SpotlightPhoto.tsx for the
                   mask/coordinate mechanics (same technique as Footer.tsx's
                   spotlight wordmark). Radius scaled up from that
                   component's 80px default — this photo fills a whole
                   column here, not a small thumbnail. */}
                <SpotlightPhoto
                  srcGray="/photos/band-bw-wrist.jpg"
                  srcColor="/photos/band-color-wrist.png"
                  alt="The NA·01 band worn on the wrist"
                  radius={160}
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="h-full w-full"
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
              <h2 className="mt-4 text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
                See It. Act On It.
              </h2>
              <p className="mt-6 text-pretty text-lg text-cream/75">
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
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight text-navy lg:text-4xl">
              We Believe In Privacy
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-mist">
              We believe your data belongs to you, so we built NeuroAtlas
              that way.
            </p>
            {/* Split out as its own line (matching /inside-the-app's own
                italic follow-up-line convention) rather than folded into
                the paragraph above, where it was wrapping mid-sentence
                ("Your data" / "is yours…") instead of reading as one
                line. */}
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base italic text-mist/80">
              Your data is yours. Never shared without your permission.
            </p>
          </Reveal>
          {/* md:grid-cols-3, not sm: — 3 columns at a 640px foldable-open
             width squeezes these cards; single column through the whole
             foldable tier, splitting to 3 only at true tablet width. */}
          <ul className="mx-auto mt-12 grid max-w-3xl gap-4 text-left md:grid-cols-3">
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

      {/* How it's different — was a side-by-side card layout (image
          left, text right in two even columns); now a full-bleed
          cinematic banner instead, the photo filling the whole section
          with the text sitting directly in its own negative space
          rather than in a separate boxed-off column. No `dark-glow`
          here any more — that class's own radial gold ambient glow
          (see globals.css) was tuned for a plain flat dark section
          background; layered over a real photo it would just tint the
          image, fighting the cinematic-photo look rather than adding
          to it. */}
      <section
        id="how-different"
        // z-0, not just `relative` alone — a real, confirmed bug this
        // fixes: `position: relative` with no explicit z-index does NOT
        // establish a new stacking context on its own, so this section's
        // `-z-10` background children (below) were being hoisted up to
        // compare against the nearest ANCESTOR stacking context instead
        // of this section's own — which put them BEHIND this section's
        // own `bg-navy` fill (an ordinary in-flow paint layer, which
        // sits in front of a hoisted negative-z-index descendant once
        // it's no longer contained locally). Confirmed live: sampling
        // pixel colors off the actual rendered page showed flat,
        // uniform `#0b1016` (this site's own --color-navy token) across
        // the whole section — the section's own background color, not
        // a single pixel of real photo detail anywhere. `z-0` (any
        // explicit z-index value, even 0) alongside `relative` is what
        // actually creates a real stacking context here, containing the
        // `-z-10` image/gradient layers inside it — where they correctly
        // paint in FRONT of this section's own background, exactly as
        // intended.
        className="relative z-0 flex min-h-[80vh] items-center overflow-hidden bg-navy text-cream"
      >
        {/* Background layer — image, then the legibility gradient(s) on
           top of it, all -z-10 so ordinary content (the text block
           below, no z-index of its own needed) stacks above them by
           default. Order matters here even though every layer shares
           the same -z-10: with equal z-index, later DOM order paints on
           top, so the gradients (added after the image) actually darken
           it rather than sitting invisibly behind it. */}
        <Image
          src="/photos/homepage_bottom.png"
          alt=""
          fill
          sizes="100vw"
          className="-z-10 object-cover object-center"
        />
        {/* Left-to-right legibility gradient — transparent over the
           hardware itself (photographed left-of-center), solid toward
           the right where the text sits. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent to-navy/80"
        />
        {/* Supplemental scrim below `lg` — matches the text block's own
           `lg:ml-auto` breakpoint below: until the text actually shifts
           into the clear right-side negative space at `lg`, it sits
           centered directly over the band itself (confirmed live: an
           earlier `md:ml-auto` attempt still left the text overlapping
           the strap at exactly 768px, not yet clear of it — reverted in
           favor of holding the centered layout, with this scrim, all
           the way to `lg`), so the horizontal gradient alone isn't
           guaranteed enough contrast there. Gone at lg+, where the text
           has real clear space of its own and the horizontal gradient
           already does the job on its own. */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-navy/45 lg:hidden" />

        <div className="mx-auto flex w-full max-w-6xl px-6 py-16 md:py-24 lg:px-10 lg:py-32">
          <Reveal
            y={20}
            className="mx-auto w-full max-w-xl text-center lg:mx-0 lg:ml-auto lg:text-left"
          >
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
              Other Apps Notice. We Fix It, In Two Minutes.
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-cream/75 lg:mx-0">
              Other wearables tell you your heart rate is up or your sleep
              was disturbed, and stop there. NeuroAtlas gives you something
              to do about it, and proves it worked, in two minutes.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Founder and current status — was a 50/50 card layout (text one
          side, the ice-still product photo the other); now a full-bleed
          cinematic banner using the new dot-mesh texture as an
          immersive backdrop instead, with the mission statement centred
          directly over it. The dedicated product photo is dropped
          entirely here (not tucked in as a smaller inset) — the texture
          itself is the whole point of this pass, and this same photo
          already appears elsewhere on the page (the "how it's
          different" section above), so nothing about the band's own
          hardware goes unseen by removing it from here specifically. */}
      <section
        id="founder"
        // z-0, not just `relative` alone — see "how-different"'s own
        // identical fix just above for the full mechanics: without an
        // explicit z-index, `position: relative` doesn't create a real
        // stacking context, so this section's own `-z-10` background
        // (below) would get hoisted out to the nearest ANCESTOR
        // stacking context and render BEHIND this section's plain
        // bg-cream fill instead of in front of it.
        className="relative z-0 flex min-h-[60vh] items-center overflow-hidden bg-cream text-navy"
      >
        {/* Background layer. Unlike the navy-toned banner above, this
           texture is genuinely light throughout (confirmed by actually
           looking at the file — the "dark" end of its own top-to-bottom
           fade is a muted blue-grey, not a true dark tone; the bottom
           half is close to pure white), so dark text stays the correct,
           legible choice everywhere on it — not a white-vs-navy call
           that changes by position. */}
        <Image
          src="/photos/homepage_last.png"
          alt=""
          fill
          sizes="100vw"
          className="-z-10 object-cover object-center"
        />
        {/* A light wash, not a dark one — the brief's own two options
           ("bg-white/10 backdrop-blur-sm or a dark wash, depending on
           which provides better contrast") resolve to the light one
           here specifically because the photo itself is already light:
           a dark scrim would fight the dark navy text this section
           uses, where a soft white wash instead gives it a guaranteed
           safety margin over the texture's own marginally denser,
           bluer top band, without flattening the mesh pattern into
           invisibility. */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-white/35" />

        <div className="mx-auto flex w-full max-w-6xl justify-center px-6 py-16 md:py-24 lg:px-10 lg:py-32">
          <Reveal
            y={20}
            className="mx-auto flex max-w-3xl flex-col items-center justify-center text-center"
          >
            <h2 className="text-balance font-serif font-normal uppercase tracking-normal text-3xl leading-tight lg:text-4xl">
              Why NeuroAtlas Exists
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-mist">
              Vanshika Dhoot founded NeuroAtlas after watching high
              performers break under pressure with no real way to manage
              it. NeuroAtlas is now live in pilot with corporate teams
              across London.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Closing CTA */}
      <section id="closing-cta" className="dark-glow bg-navy-soft text-cream">
        <Reveal
          className="mx-auto max-w-3xl px-6 py-16 md:py-24 text-center lg:px-10 lg:py-28"
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
