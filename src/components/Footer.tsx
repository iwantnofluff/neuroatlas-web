"use client";

import Link from "next/link";
import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { contactEmail, footerNav, legalNav, socialLinks, type NavLink } from "@/lib/nav";
import { LogoMark } from "@/components/LogoMark";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { useSafeReducedMotion } from "@/lib/useSafeReducedMotion";

/**
 * The Global Footer — "Spotlight Reveal": a tall, substantial container
 * (min-h-[70vh]) closing on a massive edge-to-edge wordmark that's
 * barely visible at rest and only reveals itself, in bright gold,
 * inside a small circle that follows the cursor — a flashlight passing
 * over the brand name in the dark. Mounted once in layout.tsx, so this
 * file alone rolls it out to every route.
 *
 * THE MASK, exactly:
 * Two identical "NEUROATLAS" text layers stacked via `absolute inset-0`
 * — a dim base (text-cream/5) always there, and a bright gold copy on
 * top. The bright copy gets a CSS `mask-image` of
 * `radial-gradient(circle 320px at Xpx Ypx, black 0%, transparent 100%)`
 * — the browser's default mask-mode reads the gradient's ALPHA, so
 * "black" (alpha 1) shows the layer beneath it through fully and
 * "transparent" (alpha 0) hides it completely; the exact colors chosen
 * for the gradient stops don't matter, only their opacity does. Moving
 * that circle's center to the live cursor position is what makes it
 * read as a flashlight — everywhere outside the circle, the mask is
 * fully transparent, so only the dim base layer shows through there.
 *
 * THE COORDINATES: two `useMotionValue`s (X/Y), each run through its
 * own `useSpring` for the trailing, weighted-flashlight feel rather
 * than an instant 1:1 follow, fed into a `useMotionTemplate` that
 * builds the whole radial-gradient string reactively — framer-motion
 * writes the resulting mask-image directly to the DOM node every
 * frame, bypassing React's render cycle entirely, which is the only
 * way this stays smooth at 60fps on every mousemove (the same
 * useMotionValue -> useMotionTemplate pattern this codebase already
 * uses for a cursor-tracking glow on the bento-grid spec tiles earlier
 * this session — same technique, applied to `mask-image` instead of
 * `background`).
 *
 * The pointermove listener sits on the OUTER <footer> (per spec), but
 * the coordinates it stores are already translated into the massive-
 * text wrapper's OWN local space (via that wrapper's own
 * getBoundingClientRect(), read inside the handler) rather than the
 * footer's — `mask-image`'s gradient position is only ever relative to
 * the element the mask is applied TO, so feeding it raw
 * footer-relative coordinates would offset the spotlight by exactly
 * however far the text sits from the footer's own top edge. Moving the
 * mouse anywhere in the footer still updates the spotlight's position;
 * it just naturally doesn't reach the text at all if the cursor is far
 * above it in the link grid, which reads as a flashlight fading out of
 * range rather than a bug.
 *
 * reduceMotion skips the tracking/mask entirely and renders the bright
 * layer fully solid (no mask, always visible) — a complete, meaningful
 * state (a plain bright wordmark) rather than a permanently-dark
 * "broken effect", the same judgment call this codebase's other
 * cursor/hover-driven decoration already makes.
 */

const SPOTLIGHT_RADIUS = 320; // px

const EXPLORE_HREFS = [
  "/how-it-works",
  "/band",
  "/inside-the-app",
  "/the-science",
  "/toolkits",
  "/for-organisations",
  "/privacy",
];
const COMPANY_HREFS = ["/about", "/pricing", "/contact", "/faq", "/journal", "/request-access"];

function resolveLinks(hrefs: string[]): NavLink[] {
  return hrefs
    .map((href) => footerNav.find((link) => link.href === href))
    .filter((link): link is NavLink => Boolean(link));
}

function FooterLinkColumn({ label, hrefs }: { label: string; hrefs: string[] }) {
  return (
    <div>
      <p className="text-xs tracking-[0.2em] text-cream/40 uppercase">{label}</p>
      <ul className="mt-4 space-y-3">
        {resolveLinks(hrefs).map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-cream/60 transition-colors hover:text-gold"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

const WORDMARK_CLASSNAME =
  "text-[15vw] leading-none font-black tracking-tighter uppercase text-center";

export function Footer() {
  const reduceMotion = useSafeReducedMotion();
  const [submitted, setSubmitted] = useState(false);
  const wordmarkRef = useRef<HTMLDivElement>(null);

  // Starts well off-canvas (not 0,0) so nothing is lit before the
  // pointer has actually moved into range.
  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);
  const springX = useSpring(mouseX, { damping: 30, stiffness: 200, mass: 0.4 });
  const springY = useSpring(mouseY, { damping: 30, stiffness: 200, mass: 0.4 });
  const maskImage = useMotionTemplate`radial-gradient(circle ${SPOTLIGHT_RADIUS}px at ${springX}px ${springY}px, black 0%, transparent 100%)`;

  function handlePointerMove(e: ReactPointerEvent<HTMLElement>) {
    const rect = wordmarkRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }

  function handlePointerLeave() {
    mouseX.set(-9999);
    mouseY.set(-9999);
  }

  return (
    <footer
      onPointerMove={reduceMotion ? undefined : handlePointerMove}
      onPointerLeave={reduceMotion ? undefined : handlePointerLeave}
      className="relative flex min-h-[70vh] flex-col justify-between overflow-hidden border-t border-cream/10 bg-navy text-cream"
    >
      {/* The grid — functional links + newsletter capture. Clean, small,
         muted at rest; gold on hover. */}
      <div className="mx-auto w-full max-w-7xl px-6 pt-16 lg:px-10 lg:pt-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <span className="flex items-center gap-2.5 font-serif text-lg tracking-wide">
              <LogoMark className="h-7 w-7" />
              NeuroAtlas
            </span>
            <p className="mt-4 max-w-xs text-sm text-cream/60">
              Know when pressure is building, and reset before it takes over.
            </p>
          </div>

          <FooterLinkColumn label="Explore" hrefs={EXPLORE_HREFS} />
          <FooterLinkColumn label="Company" hrefs={COMPANY_HREFS} />

          <div>
            <p className="text-xs tracking-[0.2em] text-cream/40 uppercase">
              Stay Ahead Of Stress
            </p>
            <p className="mt-4 max-w-sm text-sm text-cream/60">
              One email a month. No noise, just what&rsquo;s useful.
            </p>
            {submitted ? (
              <p className="mt-4 text-sm text-gold-soft">
                You are on the list. We will be in touch.
              </p>
            ) : (
              <form
                className="mt-4 flex max-w-sm gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
              >
                <label htmlFor="footer-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="footer-email"
                  type="email"
                  required
                  placeholder="Your email"
                  className="w-full rounded-full border border-cream/25 bg-transparent px-4 py-2.5 text-sm text-cream placeholder:text-cream/40 focus:border-gold focus:outline-none"
                />
                <ShimmerButton
                  type="submit"
                  background="color-mix(in oklab, var(--color-cream) 30%, transparent)"
                  shimmerColor="var(--color-cream)"
                  className="shrink-0 py-2.5 text-sm tracking-wide text-cream"
                >
                  Join
                </ShimmerButton>
              </form>
            )}
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-6 border-t border-cream/10 pt-8 text-sm text-cream/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {legalNav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-cream">
                {item.label}
              </Link>
            ))}
            <a href={`mailto:${contactEmail}`} className="hover:text-cream">
              {contactEmail}
            </a>
          </div>
          <div className="flex items-center gap-6">
            {socialLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="hover:text-cream"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <p className="mt-8 text-xs text-cream/40">
          © {new Date().getFullYear()} NeuroAtlas. All rights reserved.
        </p>
      </div>

      {/* The spotlight wordmark — see the component doc comment above
         for the exact mask/coordinate mechanics. Both visual layers are
         decorative (aria-hidden); the one real accessible copy is the
         sr-only span so a screen reader hears "NeuroAtlas" once, not
         twice. */}
      <div ref={wordmarkRef} className="relative mt-16 w-full py-2 select-none sm:mt-20">
        <span className="sr-only">NeuroAtlas</span>
        <p aria-hidden="true" className={`${WORDMARK_CLASSNAME} text-cream/5`}>
          NEUROATLAS
        </p>
        {reduceMotion ? (
          <p
            aria-hidden="true"
            className={`absolute inset-0 ${WORDMARK_CLASSNAME} text-gold`}
          >
            NEUROATLAS
          </p>
        ) : (
          <motion.p
            aria-hidden="true"
            style={{ WebkitMaskImage: maskImage, maskImage }}
            className={`absolute inset-0 ${WORDMARK_CLASSNAME} text-gold`}
          >
            NEUROATLAS
          </motion.p>
        )}
      </div>
    </footer>
  );
}
