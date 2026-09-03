"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu } from "lucide-react";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { primaryNav } from "@/lib/nav";
import { ShimmerLink } from "@/components/ui/shimmer-button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/LogoMark";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const { scrollY } = useScroll();
  const pathname = usePathname();

  // The transparent-over-dark-hero treatment only makes sense where a dark
  // hero actually sits under the header. Every other route has a light
  // background from the top, so it always gets the solid cream header; only
  // these get to start transparent and solidify on scroll (the one piece of
  // Nubo's interaction language worth borrowing).
  const hasDarkHero = pathname === "/" || pathname === "/band";
  const scrolled = !hasDarkHero || scrolledPastHero;
  const headerHeight = 72; // matches h-18

  // Rather than a fixed pixel guess (which broke once the /band hero grew
  // into a tall pinned scroll section), measure where the page's own
  // <HeroBoundary /> marker actually sits — the header only solidifies once
  // that boundary has scrolled up to meet it, whatever the hero's real
  // height turns out to be.
  const boundaryOffsetRef = useRef<number | null>(null);

  useEffect(() => {
    if (!hasDarkHero) {
      boundaryOffsetRef.current = null;
      return;
    }

    function measure() {
      const marker = document.getElementById("hero-boundary");
      boundaryOffsetRef.current = marker
        ? marker.getBoundingClientRect().top + window.scrollY
        : null;
    }

    // Run after layout has settled (the /band hero's height depends on
    // viewport-relative CSS), and again if the viewport is resized.
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, [hasDarkHero, pathname]);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (!hasDarkHero) return;
    const boundary = boundaryOffsetRef.current;
    setScrolledPastHero(
      boundary == null ? latest > 64 : latest > boundary - headerHeight
    );
  });

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled
          ? "border-b border-line/70 bg-cream/90 backdrop-blur supports-[backdrop-filter]:bg-cream/75"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2.5 font-serif text-lg tracking-wide transition-colors",
            scrolled ? "text-navy" : "text-cream"
          )}
        >
          <LogoMark className="h-7 w-7" />
          NeuroAtlas
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {primaryNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm transition-[color,text-shadow] duration-300",
                "hover:[text-shadow:0_0_14px_color-mix(in_oklab,var(--color-gold)_65%,transparent)]",
                "focus-visible:[text-shadow:0_0_14px_color-mix(in_oklab,var(--color-gold)_65%,transparent)]",
                // A light gold reads fine over the dark hero, but is too
                // low-contrast against the cream header once it solidifies
                // — the deeper gold tone keeps the hover state legible there.
                scrolled
                  ? "text-ink/75 hover:text-gold-deep focus-visible:text-gold-deep"
                  : "text-cream/80 hover:text-gold focus-visible:text-gold"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Rest-tint follows the header's own transparent/solid state —
            cream glass over the dark hero, navy glass once it solidifies
            — same idea as the nav links above. Hover is unaffected: every
            button on the site fills to the same gold regardless. */}
        <ShimmerLink
          href="/request-access"
          background={
            scrolled
              ? "color-mix(in oklab, var(--color-navy) 25%, transparent)"
              : "color-mix(in oklab, var(--color-cream) 30%, transparent)"
          }
          shimmerColor={scrolled ? "var(--color-gold-deep)" : "var(--color-cream)"}
          className={cn(
            // lg:inline-flex, not lg:flex — this specifically needs to
            // override the base `hidden` (display:none) at the lg
            // breakpoint, and tailwind-merge drops the root's own base
            // `inline-flex` in favor of this same-bucket `hidden` (no
            // variant prefix on either), so this lg-scoped override is
            // still required even though the root defaults to
            // inline-flex now — without it the button would just stay
            // hidden past lg too. Keeping it `inline-flex` specifically
            // (not `flex`) is what keeps this content-sized rather than
            // stretching to fill the header's flex row.
            "hidden py-2.5 text-sm tracking-wide lg:inline-flex",
            scrolled ? "text-navy" : "text-cream"
          )}
        >
          Request Access
        </ShimmerLink>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              aria-label="Open menu"
              className={cn(
                "btn-glass-icon size-9 lg:hidden",
                scrolled ? "text-navy" : "text-cream"
              )}
            >
              <Menu className="size-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-cream">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2.5 font-serif text-lg text-navy">
                <LogoMark className="h-6 w-6" />
                NeuroAtlas
              </SheetTitle>
              <SheetDescription className="sr-only">
                Site navigation
              </SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col gap-4 px-4">
              {primaryNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-sm text-ink/80 transition-[color,text-shadow] duration-300 hover:text-gold-deep focus-visible:text-gold-deep hover:[text-shadow:0_0_14px_color-mix(in_oklab,var(--color-gold)_55%,transparent)] focus-visible:[text-shadow:0_0_14px_color-mix(in_oklab,var(--color-gold)_55%,transparent)]"
                >
                  {item.label}
                </Link>
              ))}
              <ShimmerLink
                href="/request-access"
                onClick={() => setOpen(false)}
                background="color-mix(in oklab, var(--color-navy) 25%, transparent)"
                shimmerColor="var(--color-gold-deep)"
                className="mt-2 w-fit text-sm tracking-wide text-navy"
              >
                Request Access
              </ShimmerLink>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
